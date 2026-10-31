import React, { useState, useEffect } from 'react';
import {
  X,
  KeyRound,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  Loader2,
  Trash2,
  Sparkles,
  Eye,
  EyeOff,
  Cpu,
  Layers,
  Edit3
} from 'lucide-react';
import { probeOpenRouter, DEFAULT_FREE_MODEL } from '../services/api';

const FREE_MODEL_OPTIONS = [
  {
    id: 'meta-llama/llama-3.3-70b-instruct:free',
    name: 'Llama 3.3 70B Instruct',
    provider: 'Meta',
    badge: 'Primary Recommended',
    description: 'Fast, high-fidelity reasoning & reliable structured JSON extraction (Zero Cost).',
  },
  {
    id: 'google/gemma-3-27b-it:free',
    name: 'Gemma 3 27B IT',
    provider: 'Google',
    badge: 'Free Tier',
    description: 'Google multimodal reasoning model optimized for cross-source policy comparisons.',
  },
  {
    id: 'mistralai/mistral-small-3.1-24b-instruct:free',
    name: 'Mistral Small 3.1 24B',
    provider: 'Mistral AI',
    badge: 'Free Tier',
    description: 'Concise and precise contradiction spotting across conflicting circulars.',
  },
  {
    id: 'nvidia/llama-3.3-nemotron-super-49b-v1:free',
    name: 'Nemotron Super 49B',
    provider: 'NVIDIA',
    badge: 'Free Tier',
    description: 'NVIDIA high-performance reasoning tuned for compliance and dark spots.',
  },
  {
    id: 'deepseek/deepseek-r1:free',
    name: 'DeepSeek R1',
    provider: 'DeepSeek',
    badge: 'Free Tier Reasoning',
    description: 'Deep mathematical and logical verification with step-by-step reasoning.',
  },
  {
    id: 'qwen/qwen3-235b-a22b:free',
    name: 'Qwen 3 235B',
    provider: 'Alibaba',
    badge: 'Free Tier',
    description: 'Massive MoE open weights model for complex document auditing.',
  },
  {
    id: 'openrouter/auto',
    name: 'OpenRouter Auto Router',
    provider: 'OpenRouter',
    badge: 'Smart Auto Router',
    description: 'Dynamically routes to the best available free/low-cost model with lowest latency.',
  },
];

export default function ApiKeyModal({
  isOpen,
  onClose,
  currentKey,
  currentModel,
  onSaveConfig,
  backendHasKey,
  forceOfflineDemo,
  onToggleForceDemo,
}) {
  const [apiKey, setApiKey] = useState(currentKey || '');
  const [selectedModel, setSelectedModel] = useState(currentModel || DEFAULT_FREE_MODEL);
  const [customModelId, setCustomModelId] = useState('');
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [saveToast, setSaveToast] = useState(false);

  useEffect(() => {
    const key = currentKey || '';
    const model = currentModel || DEFAULT_FREE_MODEL;
    setApiKey(key);
    
    // Check if the current model is one of the predefined free models
    const isPredefined = FREE_MODEL_OPTIONS.some((m) => m.id === model);
    if (isPredefined) {
      setSelectedModel(model);
      setIsCustomMode(false);
      setCustomModelId('');
    } else {
      setIsCustomMode(true);
      setCustomModelId(model);
      setSelectedModel(model);
    }
    setTestResult(null);
  }, [currentKey, currentModel, isOpen]);

  if (!isOpen) return null;

  const activeEffectiveModel = isCustomMode ? customModelId.trim() || DEFAULT_FREE_MODEL : selectedModel;

  const handleSave = () => {
    onSaveConfig(apiKey.trim(), activeEffectiveModel);
    setSaveToast(true);
    setTimeout(() => {
      setSaveToast(false);
      onClose();
    }, 800);
  };

  const handleClear = () => {
    setApiKey('');
    setTestResult(null);
    onSaveConfig('', activeEffectiveModel);
  };

  const handleTestKey = async () => {
    const keyToTest = apiKey.trim();
    if (!keyToTest) {
      setTestResult({
        success: false,
        message: 'Please paste a valid OpenRouter API key first (starts with sk-or-v1-...).',
      });
      return;
    }

    setTesting(true);
    setTestResult(null);

    const result = await probeOpenRouter(keyToTest, activeEffectiveModel);
    setTesting(false);
    setTestResult(result);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl transition-colors duration-200 dark:border-slate-800 dark:bg-slate-900 sm:p-7">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
          <div className="flex items-center space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 ring-1 ring-indigo-200 dark:bg-indigo-950 dark:text-indigo-400 dark:ring-indigo-800">
              <KeyRound className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                OpenRouter AI & Model Configuration
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Shinchan Hackathon: Zero-cost verification with OpenRouter Free Tier models
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="mt-5 space-y-5">
          
          {/* Backend Status Callout */}
          {backendHasKey ? (
            <div className="flex items-start space-x-2.5 rounded-xl border border-emerald-300 bg-emerald-50 p-3 text-xs text-emerald-800 dark:border-emerald-800/60 dark:bg-emerald-950/40 dark:text-emerald-300">
              <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
              <div>
                <span className="font-semibold">Backend `.env` key detected:</span> The server has an active key configured. Any client key entered below will override it for this browser session.
              </div>
            </div>
          ) : (
            <div className="flex items-start space-x-2.5 rounded-xl border border-indigo-200 bg-indigo-50/70 p-3 text-xs text-indigo-900 dark:border-indigo-800/60 dark:bg-indigo-950/40 dark:text-indigo-300">
              <Sparkles className="h-4 w-4 mt-0.5 shrink-0 text-indigo-600 dark:text-indigo-400" />
              <div>
                Enter your free OpenRouter key below for live analysis, or enable <span className="font-semibold text-indigo-600 dark:text-indigo-300">Offline Demo Mode</span> for instant pre-cached demonstration.
              </div>
            </div>
          )}

          {/* API Key Input Field */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                OpenRouter API Key
                <span className="text-[11px] font-normal text-slate-500 lowercase">(sk-or-v1-...)</span>
              </label>
              <a
                href="https://openrouter.ai/keys"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center space-x-1 text-xs text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors"
              >
                <span>Get a free key</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>

            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-or-v1-..."
                className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2.5 pr-20 text-sm font-mono text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:placeholder-slate-600"
              />
              <div className="absolute inset-y-0 right-2 flex items-center space-x-1">
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="rounded p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  title={showKey ? 'Hide key' : 'Show key'}
                >
                  {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
                {apiKey && (
                  <button
                    type="button"
                    onClick={handleClear}
                    className="rounded p-1 text-rose-500 hover:text-rose-600 dark:text-rose-400 dark:hover:text-rose-300"
                    title="Clear key"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
            <p className="mt-1 text-[11px] text-slate-500">
              Keys are stored securely in browser <code className="text-indigo-600 dark:text-indigo-400 font-mono">localStorage</code> and transmitted via headers.
            </p>
          </div>

          {/* Model Selection (Free Models Dropdown & Custom Model Input) */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Cpu className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
                Select OpenRouter Free Model
              </label>
              <button
                type="button"
                onClick={() => setIsCustomMode(!isCustomMode)}
                className="inline-flex items-center space-x-1 text-xs font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors"
              >
                <Edit3 className="h-3 w-3" />
                <span>{isCustomMode ? 'Choose from Free List' : 'Enter Custom Model ID'}</span>
              </button>
            </div>

            {isCustomMode ? (
              <div className="rounded-xl border border-indigo-200 bg-indigo-50/50 p-3.5 dark:border-indigo-900/50 dark:bg-indigo-950/20 space-y-2">
                <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  Custom OpenRouter Model Identifier
                </div>
                <input
                  type="text"
                  value={customModelId}
                  onChange={(e) => setCustomModelId(e.target.value)}
                  placeholder="e.g. meta-llama/llama-3.3-70b-instruct:free or google/gemini-2.5-flash"
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-mono text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:placeholder-slate-600"
                />
                <p className="text-[11px] text-slate-500">
                  You can specify any valid model slug available on your OpenRouter account.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {FREE_MODEL_OPTIONS.map((m) => {
                  const isSelected = selectedModel === m.id;
                  return (
                    <div
                      key={m.id}
                      onClick={() => {
                        setSelectedModel(m.id);
                        setIsCustomMode(false);
                      }}
                      className={`cursor-pointer rounded-xl border p-3 transition-all ${
                        isSelected
                          ? 'border-indigo-600 bg-indigo-50/80 shadow-sm ring-1 ring-indigo-500/50 dark:border-indigo-500 dark:bg-indigo-950/50 dark:shadow-indigo-500/20'
                          : 'border-slate-200 bg-slate-50/60 hover:border-slate-300 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-950/60 dark:hover:border-slate-700 dark:hover:bg-slate-950'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="text-xs font-bold text-slate-900 dark:text-slate-200">
                          {m.name}
                        </div>
                        <span
                          className={`rounded px-1.5 py-0.5 text-[10px] font-semibold border ${
                            m.badge === 'Primary Recommended'
                              ? 'bg-indigo-100 text-indigo-800 border-indigo-300 dark:bg-indigo-950 dark:text-indigo-300 dark:border-indigo-800'
                              : 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800'
                          }`}
                        >
                          {m.badge}
                        </span>
                      </div>
                      <p className="mt-1 text-[11px] text-slate-600 dark:text-slate-400 leading-snug">
                        {m.description}
                      </p>
                      <div className="mt-1.5 text-[10px] font-mono text-slate-500 truncate">
                        {m.id}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Force Offline Demo Mode Toggle */}
          <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-3.5 dark:border-slate-800 dark:bg-slate-950/70">
            <div className="pr-4">
              <div className="text-xs font-semibold text-slate-900 dark:text-slate-200">
                Force Offline Demo Mode (Instant Pre-Cached Results)
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">
                Enables instant hackathon judge demonstration with zero latency and zero token usage.
              </div>
            </div>
            <label className="relative inline-flex cursor-pointer items-center">
              <input
                type="checkbox"
                checked={forceOfflineDemo}
                onChange={(e) => onToggleForceDemo(e.target.checked)}
                className="peer sr-only"
              />
              <div className="h-6 w-11 rounded-full bg-slate-300 peer-checked:bg-indigo-600 peer-focus:outline-none after:absolute after:top-0.5 after:left-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-full dark:bg-slate-700"></div>
            </label>
          </div>

          {/* Test Connection Probe Feedback */}
          {testResult && (
            <div
              className={`rounded-xl p-3 text-xs border ${
                testResult.success
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-700/60'
                  : 'bg-rose-50 text-rose-800 border-rose-300 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-700/60'
              }`}
            >
              <div className="flex items-center space-x-2 font-semibold">
                {testResult.success ? (
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                ) : (
                  <AlertTriangle className="h-4 w-4 shrink-0 text-rose-600 dark:text-rose-400" />
                )}
                <span>{testResult.success ? 'API Connection Verified!' : 'Connection Probe Failed'}</span>
              </div>
              <p className="mt-1 text-[11px] opacity-90">
                {testResult.reply || testResult.message}
              </p>
            </div>
          )}

        </div>

        {/* Modal Footer Actions */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-2 border-t border-slate-200 dark:border-slate-800 pt-4">
          <button
            type="button"
            onClick={handleTestKey}
            disabled={testing || !apiKey}
            className="inline-flex items-center space-x-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50 transition-colors dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-750 shadow-sm"
          >
            {testing ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin text-indigo-600 dark:text-indigo-400" />
            ) : (
              <Sparkles className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
            )}
            <span>{testing ? 'Testing...' : 'Test Key with OpenRouter'}</span>
          </button>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="inline-flex items-center space-x-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-md shadow-indigo-600/30 hover:bg-indigo-500 transition-colors"
            >
              {saveToast ? (
                <>
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>Saved!</span>
                </>
              ) : (
                <span>Save Settings</span>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
