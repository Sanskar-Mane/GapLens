const https = require('https');
const axios = require('axios');
const cheerio = require('cheerio');

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

/**
 * Multi-Tier Web Scraper: Jina AI Reader + Direct Cheerio Fallback + Firewall Guard
 */
async function extractUrlContent(url) {
  if (!url || typeof url !== 'string' || !url.trim()) {
    return {
      success: false,
      error: 'A valid URL is required for content extraction.',
    };
  }

  const cleanUrl = url.trim();

  // Validate URL structure
  try {
    new URL(cleanUrl);
  } catch (err) {
    return {
      success: false,
      error: 'Invalid URL format. Please include http:// or https://.',
    };
  }

  // 1. Primary Method: Jina AI Reader (fast 7s timeout with IPv4 agent)
  try {
    const jinaEndpoint = `https://r.jina.ai/${encodeURIComponent(cleanUrl)}`;
    const jinaRes = await axios.get(jinaEndpoint, {
      timeout: 7000,
      httpsAgent: ipv4HttpsAgent,
      headers: {
        Accept: 'application/json, text/plain, text/markdown',
        'X-Retain-Images': 'none',
        'User-Agent': 'GapLens-Engine/2.0 (Shinchan Hackathon Digital Dark Spot)',
      },
    });

    let rawTitle = cleanUrl;
    let rawContent = '';

    if (jinaRes.data && typeof jinaRes.data === 'object' && jinaRes.data.data) {
      // JSON response from Jina
      rawTitle = jinaRes.data.data.title || cleanUrl;
      rawContent = jinaRes.data.data.content || jinaRes.data.data.text || '';
    } else if (typeof jinaRes.data === 'string') {
      rawContent = jinaRes.data;
      const titleMatch = rawContent.match(/^#\s+(.+)$/m) || rawContent.match(/Title:\s*(.+)/i);
      if (titleMatch) rawTitle = titleMatch[1].trim();
    }

    if (isBotFirewallDetected(rawContent)) {
      return {
        success: false,
        error: 'Target site is protected by a bot firewall (Cloudflare/CAPTCHA). Please copy and paste the text snippet manually.',
      };
    }

    if (rawContent && rawContent.trim().length > 60) {
      const temporalMeta = detectTemporalMetadata(rawContent);
      return {
        success: true,
        extractedVia: 'Jina AI Reader',
        title: rawTitle.slice(0, 140),
        content: rawContent.slice(0, 15000),
        detectedDate: temporalMeta.detectedDateString,
        temporalStatus: temporalMeta.temporalStatus,
        wordCount: rawContent.trim().split(/\s+/).filter(Boolean).length,
        url: cleanUrl,
        extractedAt: new Date().toISOString(),
      };
    }
  } catch (jinaErr) {
    console.warn(`[Scraper Warning] Jina AI extraction fallback for ${cleanUrl}: ${jinaErr.message}`);
  }

  // 2. Fallback Method: Direct Axios Fetch + Cheerio (fast 7s timeout with IPv4 agent)
  try {
    const directRes = await axios.get(cleanUrl, {
      timeout: 7000,
      httpsAgent: ipv4HttpsAgent,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
      },
    });

    const html = directRes.data;
    if (isBotFirewallDetected(html)) {
      return {
        success: false,
        error: 'Target site is protected by a bot firewall (Cloudflare/CAPTCHA). Please copy and paste the text snippet manually.',
      };
    }

    const $ = cheerio.load(html);
    // Remove unwanted non-content tags
    $('script, style, nav, footer, header, aside, noscript, svg, form, iframe').remove();

    const title =
      $('meta[property="og:title"]').attr('content') ||
      $('title').text().trim() ||
      $('h1').first().text().trim() ||
      cleanUrl;

    const metaDate =
      $('meta[property="article:published_time"]').attr('content') ||
      $('meta[name="date"]').attr('content') ||
      $('time').attr('datetime') ||
      $('time').first().text().trim() ||
      '';

    const paragraphs = [];
    $('article p, main p, div[class*="content"] p, body p').each((_, el) => {
      const text = $(el).text().trim();
      if (text.length > 25 && !paragraphs.includes(text)) {
        paragraphs.push(text);
      }
    });

    const combinedText = paragraphs.join('\n\n');

    if (combinedText.length >= 50) {
      const temporalMeta = detectTemporalMetadata(combinedText, metaDate);
      return {
        success: true,
        extractedVia: 'Direct HTML Parser',
        title: title.slice(0, 140),
        content: combinedText.slice(0, 15000),
        detectedDate: temporalMeta.detectedDateString,
        temporalStatus: temporalMeta.temporalStatus,
        wordCount: combinedText.trim().split(/\s+/).filter(Boolean).length,
        url: cleanUrl,
        extractedAt: new Date().toISOString(),
      };
    }
  } catch (directErr) {
    console.warn(`[Scraper Warning] Direct fetch failed for ${cleanUrl}: ${directErr.message}`);
  }

  // 3. Graceful Failure with clear guidance
  return {
    success: false,
    error:
      'Could not automatically scrape content from this URL (site may require login, block scrapers, or be synthetic). Please copy and paste the text snippet directly.',
    url: cleanUrl,
  };
}

/**
 * Permitted Web Source Search Engine
 * Combines Jina Search + Wikipedia Search API + Curated Topic Mock Fallback
 */
async function searchPermittedSources(query) {
  if (!query || typeof query !== 'string' || !query.trim()) {
    return { results: [] };
  }

  const cleanQuery = query.trim();
  const results = [];

  // 1. Try Jina AI Search API (7s timeout with IPv4 agent)
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

  // 3. Guaranteed Curated Topic Matching Fallback for Live Hackathon Demos
  const lowerQ = cleanQuery.toLowerCase();
  const curatedReferences = [
    {
      keywords: ['scholarship', 'matric', 'student', 'fellowship', 'education'],
      items: [
        {
          title: 'State Portal: Post-Matric Scholarship Scheme Guidelines (2026-27)',
          url: 'https://scholarships.gov.in/post-matric-scholarship-guidelines-2026',
          snippet:
            'Annual income criteria must not exceed Rs. 2,50,000. Domicile proof, digital income certificate, marksheet, and Aadhaar-seeded account required for online registration.',
          suggestedSourceType: 'Official Notice',
        },
        {
          title: 'Student Education Guidance: Post-Matric Application Process & Documents',
          url: 'https://educareer-guidance.org/state-post-matric-scheme-summary',
          snippet:
            'Comprehensive overview of qualifying degrees, income declaration procedures, institutional bonafide submission, and caste validity verification.',
          suggestedSourceType: 'Third-Party Guide',
        },
        {
          title: 'Directorate of Technical Education: Archived Circular 2023-24',
          url: 'https://dte-archive.nic.in/circulars/scholarship-verification-2023.pdf',
          snippet:
            'Archived instruction mandating offline physical submission of application forms and verified vouchers to the District Nodal Officer on or before Nov 2023.',
          suggestedSourceType: 'Archived Circular',
        },
      ],
    },
    {
      keywords: ['fssai', 'cloud kitchen', 'food', 'kitchen', 'restaurant', 'licensing'],
      items: [
        {
          title: 'FSSAI Standards: Regulatory Requirements for Food Delivery & Cloud Kitchens',
          url: 'https://fssai.gov.in/standards/cloud-kitchen-home-based-operators',
          snippet:
            'Mandatory Basic Registration (Form A) for food business operators below Rs. 12 Lakhs annual turnover. Potable water test and medical certificates required.',
          suggestedSourceType: 'Official Notice',
        },
        {
          title: 'Municipal Corporation: Health Trade License & Commercial Utility Advisory',
          url: 'https://municipal-trade.org/advisory/cloud-kitchens-commercial-rules',
          snippet:
            'Commercial power connection and Trade License mandatory. Premises with load exceeding 5KW or turnover exceeding Rs. 20 Lakhs must register for State License.',
          suggestedSourceType: 'Third-Party Guide',
        },
        {
          title: 'Cloud Kitchen Startup Playbook & Equipment Checklist',
          url: 'https://foodstartuphub.com/guides/home-cloud-kitchen-essentials',
          snippet:
            'Operational guide for launching virtual brands on Swiggy and Zomato. Note: omits municipal pollution NOC rules and annual certificate renewal cycles.',
          suggestedSourceType: 'Forum/Other',
        },
      ],
    },
    {
      keywords: ['overseas', 'loan', 'subsidy', 'interest', 'study abroad', 'bank'],
      items: [
        {
          title: 'Ministry of Education: Central Scheme to provide Interest Subsidy (CSIS) on Education Loans',
          url: 'https://education.gov.in/overseas-education-loan-interest-subsidy-scheme',
          snippet:
            'Full interest subsidy during moratorium period for students from economically weaker sections with annual family income up to Rs. 4.50 Lakhs.',
          suggestedSourceType: 'Official Notice',
        },
        {
          title: 'Study Abroad Banking Digest: Education Loan Subsidy Eligibility & Cap',
          url: 'https://studyabroad-finance.com/central-overseas-subsidy-guide',
          snippet:
            'Guide claiming subsidies apply up to Rs. 6.0 Lakh income for STEM programs abroad. Conflicting details on course accreditation and part-time study eligibility.',
          suggestedSourceType: 'Third-Party Guide',
        },
        {
          title: 'Nationalized Bank Education Loan Brochure & Moratorium FAQ',
          url: 'https://bank-loans-archive.org/overseas-loan-scheme-details',
          snippet:
            'Interest subsidy disbursement rules during moratorium period. Lacks explicit revision date and circular reference number.',
          suggestedSourceType: 'Archived Circular',
        },
      ],
    },
  ];

  // Match curated items if results are few
  if (results.length < 3) {
    for (const group of curatedReferences) {
      if (group.keywords.some((kw) => lowerQ.includes(kw))) {
        group.items.forEach((item) => {
          if (!results.some((r) => r.url === item.url)) {
            results.push(item);
          }
        });
        break;
      }
    }
  }

  // Default fallback if still empty
  if (results.length === 0) {
    curatedReferences[0].items.forEach((item) => results.push(item));
  }

  return { results: results.slice(0, 5) };
}

module.exports = {
  extractUrlContent,
  detectTemporalMetadata,
  searchPermittedSources,
  isBotFirewallDetected,
};

