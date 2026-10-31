/**
 * OpenRouter AI Configuration & Free Tier Model Registry
 * Shinchan Online Hackathon 2026: Digital Dark Spot
 */

const FREE_MODELS = [
  {
    id: 'meta-llama/llama-3.3-70b-instruct:free',
    name: 'Llama 3.3 70B Instruct',
    provider: 'Meta',
    badge: 'Primary Recommended',
    description: 'Fast, high-fidelity reasoning & reliable structured JSON extraction (Zero Cost).',
    contextWindow: '128k',
  },
  {
    id: 'google/gemma-3-27b-it:free',
    name: 'Gemma 3 27B IT',
    provider: 'Google',
    badge: 'Free Tier',
    description: 'Google multimodal reasoning model optimized for policy comparison.',
    contextWindow: '128k',
  },
  {
    id: 'mistralai/mistral-small-3.1-24b-instruct:free',
    name: 'Mistral Small 3.1 24B',
    provider: 'Mistral AI',
    badge: 'Free Tier',
    description: 'Concise and precise contradiction spotting across circulars.',
    contextWindow: '32k',
  },
  {
    id: 'nvidia/llama-3.3-nemotron-super-49b-v1:free',
    name: 'Nemotron Super 49B',
    provider: 'NVIDIA',
    badge: 'Free Tier',
    description: 'NVIDIA high-performance reasoning tuned for compliance and dark spots.',
    contextWindow: '128k',
  },
  {
    id: 'deepseek/deepseek-r1:free',
    name: 'DeepSeek R1',
    provider: 'DeepSeek',
    badge: 'Free Tier Reasoning',
    description: 'Deep mathematical and logical verification with chain-of-thought.',
    contextWindow: '64k',
  },
  {
    id: 'qwen/qwen3-235b-a22b:free',
    name: 'Qwen 3 235B',
    provider: 'Alibaba',
    badge: 'Free Tier',
    description: 'Massive MoE open weights model for complex document auditing.',
    contextWindow: '128k',
  },
  {
    id: 'openrouter/auto',
    name: 'OpenRouter Auto Router',
    provider: 'OpenRouter',
    badge: 'Auto Smart Router',
    description: 'Dynamically routes to the best available free/low-cost model with lowest latency.',
    contextWindow: 'Auto',
  },
];

const DEFAULT_MODEL = 'meta-llama/llama-3.3-70b-instruct:free';

/**
 * Build standard headers for OpenRouter API requests
 */
function getOpenRouterHeaders(apiKey) {
  return {
    Authorization: `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
    'HTTP-Referer': 'https://gaplens.local',
    'X-Title': 'GapLens - AI Information Gap Detection',
  };
}

module.exports = {
  FREE_MODELS,
  DEFAULT_MODEL,
  getOpenRouterHeaders,
};

