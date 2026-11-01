/**
 * GapLens Live Source Search & Content Ingestion Service
 * Shinchan Online Hackathon 2026: Digital Dark Spot
 *
 * Provides:
 * 1. Live Web Search via Jina Search (s.jina.ai) & Wikipedia Search API (100% Live Mode)
 * 2. Scraped URL Content Extraction via Modular Extractor Engine
 * 3. Temporal Cycle & Publication Date Metadata Extraction
 */

const https = require('https');
const axios = require('axios');
const {
  extractFromUrl,
  detectTemporalMetadata,
} = require('./extractor');

// Dedicated IPv4 HTTPS Agent to avoid Windows IPv6 resolution hang and ETIMEDOUT
const ipv4HttpsAgent = new https.Agent({
  family: 4,
  keepAlive: true,
  timeout: 15000,
});

/**
 * Cloudflare & Bot Wall Detector
 */
function isBotFirewallDetected(text) {
  if (!text || typeof text !== 'string') return false;
  const firewallSignatures = [
    'Just a moment...',
    'cf-challenge',
    'Attention Required! | Cloudflare',
    'Checking your browser before accessing',
    'Enable JavaScript and cookies to continue',
    'Please verify you are a human',
    'Ray ID:',
  ];
  return firewallSignatures.some((sig) => text.includes(sig));
}

/**
 * Multi-Tier Web Scraper: Delegates to Modular Extractor Engine (Cheerio + Turndown + Headless Fallback)
 */
async function extractUrlContent(url) {
  if (!url || typeof url !== 'string' || !url.trim()) {
    return {
      success: false,
      error: 'A valid URL is required for content extraction.',
    };
  }

  try {
    const result = await extractFromUrl(url.trim());
    return {
      success: true,
      title: result.title,
      content: result.content || result.markdownText || result.plainText,
      markdownText: result.markdownText,
      plainText: result.plainText,
      detectedDate: result.detectedDate,
      temporalStatus: result.temporalStatus,
      wordCount: result.wordCount,
      url: result.url,
      extractionMethod: result.extractionMethod,
      extractedAt: result.extractedAt,
    };
  } catch (err) {
    return {
      success: false,
      error: err.message || 'Could not automatically scrape content from this URL. Please copy and paste the text snippet directly.',
      url: url.trim(),
    };
  }
}

/**
 * Permitted Web Source Search Engine (100% Live Mode)
 * Combines Jina Search (s.jina.ai) + Wikipedia Search API (en.wikipedia.org)
 * Strictly live: No hardcoded curated references or mock search results.
 */
async function searchPermittedSources(query) {
  if (!query || typeof query !== 'string' || !query.trim()) {
    return { results: [] };
  }

  const cleanQuery = query.trim();
  const results = [];

  // 1. Live Jina AI Search API (7s timeout with IPv4 agent)
  try {
    const jinaSearchUrl = `https://s.jina.ai/${encodeURIComponent(cleanQuery)}`;
    const jinaRes = await axios.get(jinaSearchUrl, {
      timeout: 7000,
      httpsAgent: ipv4HttpsAgent,
      headers: {
        Accept: 'application/json',
        'X-Respond-With': 'no-content',
        'User-Agent': 'GapLens-Search/2.0',
      },
    });

    if (jinaRes.data && Array.isArray(jinaRes.data.data)) {
      jinaRes.data.data.slice(0, 5).forEach((item) => {
        if (item.title && item.url) {
          results.push({
            title: item.title.trim(),
            url: item.url.trim(),
            snippet: (item.description || item.snippet || item.title).slice(0, 240),
            suggestedSourceType: item.url.includes('.gov')
              ? 'Official Notice'
              : item.url.includes('archive') || item.url.includes('.pdf')
              ? 'Archived Circular'
              : 'Third-Party Guide',
          });
        }
      });
    }
  } catch (searchErr) {
    console.warn(`[Search Warning] Jina search skipped: ${searchErr.message}`);
  }

  // 2. Query Wikipedia API if Jina gave fewer than 3 results
  if (results.length < 3) {
    try {
      const wikiUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(
        cleanQuery
      )}&utf8=&format=json`;
      const wikiRes = await axios.get(wikiUrl, {
        timeout: 6000,
        httpsAgent: ipv4HttpsAgent,
      });

      if (wikiRes.data && wikiRes.data.query && Array.isArray(wikiRes.data.query.search)) {
        wikiRes.data.query.search.slice(0, 3).forEach((item) => {
          const cleanSnippet = (item.snippet || '').replace(/<\/?[^>]+(>|$)/g, '');
          results.push({
            title: `${item.title} (Wikipedia Reference)`,
            url: `https://en.wikipedia.org/wiki/${encodeURIComponent(item.title.replace(/\s+/g, '_'))}`,
            snippet: cleanSnippet.slice(0, 240),
            suggestedSourceType: 'Third-Party Guide',
          });
        });
      }
    } catch (wikiErr) {
      console.warn(`[Search Warning] Wikipedia API fallback skipped: ${wikiErr.message}`);
    }
  }

  return { results: results.slice(0, 5) };
}

module.exports = {
  extractUrlContent,
  detectTemporalMetadata,
  searchPermittedSources,
  isBotFirewallDetected,
};
