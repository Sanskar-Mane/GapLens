/**
 * Google Gemini AI Configuration & Dynamic .env Model Registry
 * Shinchan Online Hackathon 2026: Digital Dark Spot
 *
 * Models are strictly fetched and parsed from process.env.GEMINI_MODEL
 * (or process.env.OPENROUTER_MODEL for backwards compatibility).
 * No extra models are appended; no hardcoded models overwrite .env values.
 */

const path = require('path');
const dotenv = require('dotenv');

// Guarantee .env is loaded from the backend directory
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const VERIFIED_FREE_MODELS = [];

/**
 * Sanitize raw model string by stripping prefixes/suffixes while preserving the slug
 * @param {string} rawModel
 * @returns {string} Sanitized model slug
 */
function sanitizeModelSlug(rawModel) {
  if (!rawModel || typeof rawModel !== 'string' || !rawModel.trim()) {
    return '';
  }

  let cleaned = rawModel.trim();

  // Strip leading 'google/' or 'models/' prefix
  if (cleaned.startsWith('google/')) {
    cleaned = cleaned.slice('google/'.length);
  } else if (cleaned.startsWith('models/')) {
    cleaned = cleaned.slice('models/'.length);
  }

  // Strip trailing ':free' suffix
  if (cleaned.endsWith(':free')) {
    cleaned = cleaned.slice(0, -':free'.length);
  }

  return cleaned.trim();
}

/**
 * Parse models strictly from process.env.GEMINI_MODEL || process.env.OPENROUTER_MODEL
 * @returns {string[]} Array of unique sanitized model slugs from .env
 */
function getModelsFromEnv() {
  const envModelStr = process.env.GEMINI_MODEL || process.env.OPENROUTER_MODEL || '';
  const parsed = envModelStr
    .split(',')
    .map((m) => sanitizeModelSlug(m))
    .filter(Boolean);

  const modelList = [];
  for (const m of parsed) {
    if (!modelList.includes(m)) {
      modelList.push(m);
    }
  }

  return modelList;
}

/**
 * Format a raw model slug into a display metadata object
 * @param {string} modelId
 * @param {number} index
 * @returns {object}
 */
function formatModelMetadata(modelId, index) {
  // Format modelId into title case (e.g. 'gemini-2.5-flash' -> 'Gemini 2.5 Flash')
  const name = modelId
    .split(/[-_]/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  return {
    id: modelId,
    name,
    provider: 'Google Gemini',
    badge: index === 0 ? 'Primary (.env)' : 'Configured (.env)',
    description: `Configured in backend .env (${modelId})`,
    contextWindow: 'Auto',
  };
}

/**
 * Returns rich model objects strictly for all models configured in .env
 * @returns {Array<object>}
 */
function getAvailableModels() {
  const modelIds = getModelsFromEnv();
  return modelIds.map((id, index) => formatModelMetadata(id, index));
}

/**
 * Returns the primary (first) model configured in .env
 * @returns {string}
 */
function getDefaultModel() {
  const modelIds = getModelsFromEnv();
  return modelIds[0] || '';
}

/**
 * Build standard headers for Google Gemini REST API requests
 */
function getOpenRouterHeaders(apiKey) {
  return {
    'Content-Type': 'application/json',
    'x-goog-api-key': apiKey || '',
  };
}

module.exports = {
  VERIFIED_FREE_MODELS,
  sanitizeModelSlug,
  getModelsFromEnv,
  getAvailableModels,
  getDefaultModel,
  formatModelMetadata,
  get FREE_MODELS() {
    return getAvailableModels();
  },
  get DEFAULT_MODEL() {
    return getDefaultModel();
  },
  getOpenRouterHeaders,
};
