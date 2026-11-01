/**
 * GapLens Modular Web Content & Markdown Extractor Engine
 * Shinchan Online Hackathon 2026: Digital Dark Spot
 *
 * Provides:
 * 1. Resilient IPv4 HTTP/HTTPS Fetching with Government Portal TLS Tolerance
 * 2. Deep DOM Boilerplate & Tracker Stripping via Cheerio
 * 3. Relative Link Normalization into Absolute URLs
 * 4. Dual Output Extraction (Structured Markdown + Flattened Plain Text)
 * 5. Automatic SPA / Dynamic Shell Detection with Stage 2 Fallback (Puppeteer / Jina Reader)
 * 6. Temporal Cycle & Publication Date Detection
 */

const https = require('https');
const axios = require('axios');
const cheerio = require('cheerio');
const TurndownService = require('turndown');

/**
 * Temporal & Date Metadata Extraction
 * Scans content for academic cycles, explicit dates, and standalone years
 */
function detectTemporalMetadata(text, htmlMetaDate = '') {
  const combined = `${htmlMetaDate || ''} ${text || ''}`;
  if (!combined.trim()) {
    return {
      detectedDateString: '',
      temporalStatus: 'undated',
      detectedYears: [],
    };
  }

  // 1. Scan for academic/fiscal cycles: e.g. 2023-24, 2026-2027, 2026–27
  const cycleRegex = /\b(20\d{2}[-–/]\d{2,4})\b/g;
  const cycles = [];
  let cycleMatch;
  while ((cycleMatch = cycleRegex.exec(combined)) !== null) {
    if (!cycles.includes(cycleMatch[1])) {
      cycles.push(cycleMatch[1]);
    }
  }

  // 2. Scan for explicit month + year: e.g. "September 2026", "Oct 15, 2023"
  const monthYearRegex = /\b(January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec)\.?\s+(?:\d{1,2},?\s+)?(20\d{2})\b/gi;
  const explicitDates = [];
  let dateMatch;
  while ((dateMatch = monthYearRegex.exec(combined)) !== null) {
    const fullDate = dateMatch[0].trim();
    if (!explicitDates.includes(fullDate)) {
      explicitDates.push(fullDate);
    }
  }

  // 3. Scan for standalone years 2010 - 2027
  const yearRegex = /\b(201\d|202[0-7])\b/g;
  const years = [];
  let yearMatch;
  while ((yearMatch = yearRegex.exec(combined)) !== null) {
    const yr = parseInt(yearMatch[1], 10);
    if (!years.includes(yr)) {
      years.push(yr);
    }
  }

  // Derive all numerical years including those in cycles
  cycles.forEach((c) => {
    const startYr = parseInt(c.slice(0, 4), 10);
    if (!isNaN(startYr) && !years.includes(startYr)) {
      years.push(startYr);
    }
  });

  explicitDates.forEach((d) => {
    const yMatch = d.match(/20\d{2}/);
    if (yMatch) {
      const yr = parseInt(yMatch[0], 10);
      if (!years.includes(yr)) {
        years.push(yr);
      }
    }
  });

  // Sort detected years descending
  years.sort((a, b) => b - a);

  // Formulate the best representative date string
  let detectedDateString = '';
  if (cycles.length > 0) {
    const firstCycle = cycles[0];
    detectedDateString = explicitDates.length > 0 ? `${explicitDates[0]} (${firstCycle} Cycle)` : `${firstCycle} Cycle`;
  } else if (explicitDates.length > 0) {
    detectedDateString = explicitDates[0];
  } else if (years.length > 0) {
    detectedDateString = `${years[0]}`;
  }

  // Determine temporalStatus
  let temporalStatus = 'undated';
  if (years.length === 0 && cycles.length === 0 && explicitDates.length === 0) {
    temporalStatus = 'undated';
  } else {
    const latestYear = years[0] || 0;
    if (latestYear <= 2024) {
      temporalStatus = 'outdated';
    } else if (latestYear >= 2025) {
      temporalStatus = 'current';
    }
  }

  return {
    detectedDateString,
    temporalStatus,
    detectedYears: years,
  };
}

// 1. Dedicated IPv4 HTTPS Agent with TLS Tolerance for institutional/gov portals
const ipv4HttpsAgent = new https.Agent({
  family: 4,
  keepAlive: true,
  timeout: 15000,
  rejectUnauthorized: false, // Prevents failures on government sites with incomplete cert chains
});

// 2. Initialized Turndown service for clean, token-lean GitHub Flavored Markdown
const turndownService = new TurndownService({
  headingStyle: 'atx',
  codeBlockStyle: 'fenced',
  bulletListMarker: '-',
  emDelimiter: '_',
  strongDelimiter: '**',
});

// Remove media, tracking, and redundant structural tags completely from Markdown
turndownService.remove(['img', 'svg', 'picture', 'figure', 'canvas', 'script', 'style', 'nav', 'footer', 'aside', 'noscript', 'iframe']);

// Clean up links in turndown: strip empty links, javascript:, or data URIs
turndownService.addRule('cleanLinks', {
  filter: 'a',
  replacement: function (content, node) {
    const trimmed = (content || '').trim();
    if (!trimmed) return '';
    const href = node.getAttribute('href') || '';
    if (!href || href.startsWith('javascript:') || href.startsWith('data:') || href === '#') {
      return trimmed;
    }
    return `[${trimmed}](${href})`;
  },
});

// Realistic Desktop Chrome Headers
const DEFAULT_HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
  Accept:
    'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.9',
  'Sec-Ch-Ua': '"Chromium";v="128", "Not;A=Brand";v="24", "Google Chrome";v="128"',
  'Sec-Ch-Ua-Mobile': '?0',
  'Sec-Ch-Ua-Platform': '"Windows"',
  'Sec-Fetch-Dest': 'document',
  'Sec-Fetch-Mode': 'navigate',
  'Sec-Fetch-Site': 'none',
  'Sec-Fetch-User': '?1',
  'Upgrade-Insecure-Requests': '1',
};

/**
 * Detects if the extracted content is an empty SPA shell or blocked by JS requirement
 */
function detectDynamicShell($, plainText, rawHtml = '') {
  const text = (plainText || '').trim();
  if (text.length < 120) return true;

  const html = rawHtml || ($.html ? $.html() : '');
  const lowerText = text.toLowerCase();

  const spaShellSignatures = [
    '<div id="root"></div>',
    '<div id="app"></div>',
    '<div id="__next"></div>',
    '<div id="__nuxt"></div>',
    'you need to enable javascript to run this app',
    'please enable javascript to continue',
    'enable javascript and cookies to continue',
    'javascript is required to view this site',
    'cf-challenge',
    'checking your browser before accessing',
    'just a moment...',
  ];

  for (const sig of spaShellSignatures) {
    if (html.includes(sig) || lowerText.includes(sig)) {
      return true;
    }
  }

  return false;
}

/**
 * Secondary Fallback for Dynamic Client-Side JS Websites (SPA / Headless)
 * Stage 2A: Optional Local Headless Puppeteer
 * Stage 2B: Headless Cloud Reader (Jina Reader)
 */
async function fetchDynamicContentFallback(url) {
  // Stage 2A: Check if Puppeteer is installed in the local environment
  try {
    const puppeteer = require('puppeteer');
    console.log(`[Extractor Fallback] Launching Headless Chromium via Puppeteer for ${url}...`);

    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu'],
    });

    try {
      const page = await browser.newPage();
      await page.setUserAgent(DEFAULT_HEADERS['User-Agent']);
      await page.goto(url, { waitUntil: 'networkidle2', timeout: 20000 });
      const renderedHtml = await page.content();
      await browser.close();

      return {
        renderedHtml,
        extractionMethod: 'dynamic-headless-puppeteer',
      };
    } catch (pageErr) {
      await browser.close();
      console.warn(`[Extractor Fallback] Puppeteer navigation failed: ${pageErr.message}`);
    }
  } catch (optErr) {
    // Puppeteer not installed in environment; seamlessly advance to Stage 2B
  }

  // Stage 2B: Headless Cloud Reader (r.jina.ai)
  try {
    console.log(`[Extractor Fallback] Querying Jina Cloud Reader for ${url}...`);
    const jinaReaderUrl = `https://r.jina.ai/${encodeURIComponent(url)}`;
    const res = await axios.get(jinaReaderUrl, {
      timeout: 15000,
      httpsAgent: ipv4HttpsAgent,
      headers: {
        Accept: 'text/plain',
        'User-Agent': 'GapLens-Reader/2.0',
        'X-Return-Format': 'markdown',
      },
    });

    if (res.data && typeof res.data === 'string' && res.data.trim().length > 100) {
      const markdown = res.data.trim().replace(/\n{3,}/g, '\n\n');
      const plain = markdown
        .replace(/#+\s*/g, '')
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
        .replace(/\s+/g, ' ')
        .trim();

      return {
        markdownText: markdown,
        plainText: plain,
        extractionMethod: 'dynamic-headless-jina-reader',
      };
    }
  } catch (jinaErr) {
    console.warn(`[Extractor Fallback] Jina Reader fallback failed: ${jinaErr.message}`);
  }

  return null;
}

/**
 * Extracts, cleans, normalizes, and converts HTML into Markdown & Plain Text
 */
function extractFromHtml(rawHtml, targetUrl, options = {}) {
  const $ = cheerio.load(rawHtml);

  // 1. Extract Page Title & Metadata Date before noise stripping
  const pageTitle =
    $('meta[property="og:title"]').attr('content') ||
    $('meta[name="twitter:title"]').attr('content') ||
    $('title').text() ||
    $('h1').first().text() ||
    'Extracted Document';

  const metaDate =
    $('meta[property="article:published_time"]').attr('content') ||
    $('meta[name="date"]').attr('content') ||
    $('meta[name="dc.date"]').attr('content') ||
    $('time').attr('datetime') ||
    $('time').first().text() ||
    '';

  // 2. Strip Noise, Tracking, Navigational, and Boilerplate Elements
  $(
    'script, style, noscript, iframe, svg, canvas, nav, footer, header, aside, form, button, input, select, textarea, ' +
      '[role="navigation"], [role="banner"], [role="contentinfo"], [aria-hidden="true"], ' +
      '.nav, .navbar, .footer, .header, .sidebar, .cookie-banner, .ads, .advertisement, .tracking-pixel, img[width="1"], img[height="1"]'
  ).remove();

  // 3. Normalize relative <a> hrefs and <img> srcs into absolute URLs
  $('a[href]').each((_, el) => {
    try {
      const href = $(el).attr('href');
      if (href && !href.startsWith('javascript:') && !href.startsWith('#') && !href.startsWith('mailto:')) {
        $(el).attr('href', new URL(href, targetUrl).href);
      }
    } catch (e) {
      // Keep original on malformed url
    }
  });

  $('img[src]').each((_, el) => {
    try {
      const src = $(el).attr('src');
      if (src && !src.startsWith('data:')) {
        $(el).attr('src', new URL(src, targetUrl).href);
      }
    } catch (e) {}
  });

  // 4. Locate Primary Content Container or Fallback to Body
  let $container = $('article, main, [role="main"], .content, #content, #main, .post, .entry-content').first();
  if (!$container.length || $container.text().trim().length < 150) {
    $container = $('body');
  }

  // 5. Generate Structured Markdown Output
  let markdownText = '';
  try {
    const containerHtml = $container.html() || '';
    markdownText = turndownService.turndown(containerHtml);
    markdownText = markdownText.replace(/\n{3,}/g, '\n\n').trim();
  } catch (tdErr) {
    markdownText = $container.text().trim();
  }

  // 6. Generate Clean, Flattened Plain Text Output
  const structuralBlocks = [];
  $container.find('h1, h2, h3, h4, h5, h6, p, li, td, th, blockquote, pre, dt, dd').each((_, el) => {
    const txt = $(el).text().trim();
    if (txt.length > 0) {
      structuralBlocks.push(txt);
    }
  });

  const plainRaw = structuralBlocks.length > 0 ? structuralBlocks.join(' ') : $container.text();
  const plainText = plainRaw.replace(/\s+/g, ' ').trim();

  // 7. Detect Temporal & Academic Cycle Metadata
  const temporalMeta = detectTemporalMetadata(plainText, metaDate);
  const wordCount = plainText.split(/\s+/).filter(Boolean).length;

  return {
    title: pageTitle.replace(/\s+/g, ' ').trim(),
    plainText,
    markdownText,
    detectedDate: temporalMeta.detectedDateString,
    temporalStatus: temporalMeta.temporalStatus,
    wordCount,
    isDynamicShell: detectDynamicShell($, plainText, rawHtml),
  };
}

/**
 * Primary URL Extraction Controller
 * Accepts { url, forceDynamic = false }
 * Fetches page via resilient IPv4 Axios, parses with Cheerio/Turndown, and falls back to Dynamic Headless if needed.
 */
async function extractFromUrl(rawUrl, options = {}) {
  if (!rawUrl || typeof rawUrl !== 'string' || !rawUrl.trim()) {
    throw new Error('A valid destination URL is required for content extraction.');
  }

  // Auto-prepend https:// if scheme is missing
  let cleanUrl = rawUrl.trim();
  if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
    cleanUrl = `https://${cleanUrl}`;
  }

  // Validate URL format
  try {
    new URL(cleanUrl);
  } catch (err) {
    throw new Error(`Invalid URL format: "${cleanUrl}". Please provide a complete URL.`);
  }

  const forceDynamic = Boolean(options.forceDynamic);

  // If dynamic rendering was explicitly requested upfront
  if (forceDynamic) {
    const dynamicRes = await fetchDynamicContentFallback(cleanUrl);
    if (dynamicRes) {
      if (dynamicRes.renderedHtml) {
        const parsed = extractFromHtml(dynamicRes.renderedHtml, cleanUrl);
        return {
          success: true,
          url: cleanUrl,
          title: parsed.title,
          plainText: parsed.plainText,
          markdownText: parsed.markdownText,
          content: parsed.markdownText || parsed.plainText,
          detectedDate: parsed.detectedDate,
          temporalStatus: parsed.temporalStatus,
          wordCount: parsed.wordCount,
          extractionMethod: dynamicRes.extractionMethod,
          extractedAt: new Date().toISOString(),
        };
      } else if (dynamicRes.markdownText) {
        const temporal = detectTemporalMetadata(dynamicRes.plainText);
        return {
          success: true,
          url: cleanUrl,
          title: cleanUrl,
          plainText: dynamicRes.plainText,
          markdownText: dynamicRes.markdownText,
          content: dynamicRes.markdownText,
          detectedDate: temporal.detectedDateString,
          temporalStatus: temporal.temporalStatus,
          wordCount: dynamicRes.plainText.split(/\s+/).filter(Boolean).length,
          extractionMethod: dynamicRes.extractionMethod,
          extractedAt: new Date().toISOString(),
        };
      }
    }
  }

  // Stage 1: Resilient Direct Static Fetch
  try {
    const response = await axios.get(cleanUrl, {
      timeout: 15000,
      maxRedirects: 8,
      httpsAgent: ipv4HttpsAgent,
      headers: DEFAULT_HEADERS,
      validateStatus: (status) => status >= 200 && status < 400,
    });

    const contentType = response.headers['content-type'] || '';
    const rawData = response.data;

    // Handle string HTML response
    if (typeof rawData === 'string' && (contentType.includes('html') || contentType.includes('text') || rawData.includes('<html') || rawData.includes('<body'))) {
      const parsed = extractFromHtml(rawData, cleanUrl);

      // If static parser detects empty dynamic SPA shell or minimal content
      if (parsed.isDynamicShell && !forceDynamic) {
        console.log(`[Extractor] Dynamic shell detected for ${cleanUrl}. Triggering Stage 2 Headless Fallback...`);
        const fallbackRes = await fetchDynamicContentFallback(cleanUrl);
        if (fallbackRes) {
          if (fallbackRes.renderedHtml) {
            const reParsed = extractFromHtml(fallbackRes.renderedHtml, cleanUrl);
            return {
              success: true,
              url: cleanUrl,
              title: reParsed.title,
              plainText: reParsed.plainText,
              markdownText: reParsed.markdownText,
              content: reParsed.markdownText || reParsed.plainText,
              detectedDate: reParsed.detectedDate,
              temporalStatus: reParsed.temporalStatus,
              wordCount: reParsed.wordCount,
              extractionMethod: fallbackRes.extractionMethod,
              extractedAt: new Date().toISOString(),
            };
          } else if (fallbackRes.markdownText) {
            const temporal = detectTemporalMetadata(fallbackRes.plainText);
            return {
              success: true,
              url: cleanUrl,
              title: parsed.title || cleanUrl,
              plainText: fallbackRes.plainText,
              markdownText: fallbackRes.markdownText,
              content: fallbackRes.markdownText,
              detectedDate: temporal.detectedDateString || parsed.detectedDate,
              temporalStatus: temporal.temporalStatus,
              wordCount: fallbackRes.plainText.split(/\s+/).filter(Boolean).length,
              extractionMethod: fallbackRes.extractionMethod,
              extractedAt: new Date().toISOString(),
            };
          }
        }
      }

      return {
        success: true,
        url: cleanUrl,
        title: parsed.title,
        plainText: parsed.plainText,
        markdownText: parsed.markdownText,
        content: parsed.markdownText || parsed.plainText,
        detectedDate: parsed.detectedDate,
        temporalStatus: parsed.temporalStatus,
        wordCount: parsed.wordCount,
        extractionMethod: 'static-cheerio-turndown',
        extractedAt: new Date().toISOString(),
      };
    }
  } catch (err) {
    const status = err.response?.status;
    const isNetworkError =
      err.code === 'ECONNABORTED' ||
      err.code === 'ENOTFOUND' ||
      err.code === 'ECONNRESET' ||
      err.code === 'ETIMEDOUT';

    console.warn(`[Extractor Warning] Direct static fetch failed for ${cleanUrl} (${err.message}). Attempting Stage 2 Fallback...`);

    // Attempt Stage 2 Dynamic Fallback on 403, 429, Cloudflare, or Network issues
    const fallbackRes = await fetchDynamicContentFallback(cleanUrl);
    if (fallbackRes) {
      if (fallbackRes.renderedHtml) {
        const reParsed = extractFromHtml(fallbackRes.renderedHtml, cleanUrl);
        return {
          success: true,
          url: cleanUrl,
          title: reParsed.title,
          plainText: reParsed.plainText,
          markdownText: reParsed.markdownText,
          content: reParsed.markdownText || reParsed.plainText,
          detectedDate: reParsed.detectedDate,
          temporalStatus: reParsed.temporalStatus,
          wordCount: reParsed.wordCount,
          extractionMethod: fallbackRes.extractionMethod,
          extractedAt: new Date().toISOString(),
        };
      } else if (fallbackRes.markdownText) {
        const temporal = detectTemporalMetadata(fallbackRes.plainText);
        return {
          success: true,
          url: cleanUrl,
          title: cleanUrl,
          plainText: fallbackRes.plainText,
          markdownText: fallbackRes.markdownText,
          content: fallbackRes.markdownText,
          detectedDate: temporal.detectedDateString,
          temporalStatus: temporal.temporalStatus,
          wordCount: fallbackRes.plainText.split(/\s+/).filter(Boolean).length,
          extractionMethod: fallbackRes.extractionMethod,
          extractedAt: new Date().toISOString(),
        };
      }
    }

    // If both stages fail, provide clear diagnostic error
    const reason = status
      ? `HTTP ${status} (${status === 403 ? 'Access Forbidden / Bot Firewall' : status === 429 ? 'Rate Limited' : 'Server Refused'})`
      : isNetworkError
      ? `Network timeout or connection error (${err.code})`
      : err.message;

    throw new Error(`Could not extract content from ${cleanUrl}: ${reason}. Please copy and paste the text snippet directly.`);
  }

  throw new Error(`Could not extract readable HTML or text from ${cleanUrl}. The site may require authentication or returned non-HTML data.`);
}

module.exports = {
  extractFromUrl,
  extractFromHtml,
  detectDynamicShell,
  detectTemporalMetadata,
  fetchDynamicContentFallback,
};
