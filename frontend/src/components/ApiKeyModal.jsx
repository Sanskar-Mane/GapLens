import React, { useState, useEffect } from 'react';
import {
  X,
  KeyRound,
  Check,
  AlertTriangle,
  Loader2,
  Trash2,
  Eye,
  EyeOff,
  Cpu,
} from 'lucide-react';
import { probeGemini } from '../services/api';

export default function ApiKeyModal({
  isOpen,
  onClose,
  currentKey,
  currentModel,
  availableModels = [],
  onSaveConfig,
  backendHasKey,
  forceOfflineDemo,
  onToggleForceDemo,
}) {
  const [apiKey, setApiKey] = useState(currentKey || '');
  const [selectedModel, setSelectedModel] = useState(
    currentModel || availableModels[0]?.id || ''
  );
  const [showKey, setShowKey] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [saveToast, setSaveToast] = useState(false);

  useEffect(() => {
    const key = currentKey || '';
    const initialModel = currentModel || availableModels[0]?.id || '';
    setApiKey(key);
    setSelectedModel(initialModel);
    setTestResult(null);
  }, [isOpen, currentKey, currentModel, availableModels]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTestKey = async () => {
    const keyToTest = apiKey.trim() || currentKey;
    const modelToTest = selectedModel || availableModels[0]?.id || 'gemini-2.5-flash';

    setTesting(true);
    setTestResult(null);

    const result = await probeGemini(keyToTest, modelToTest);
    setTesting(false);
    setTestResult(result);
  };

  const handleSave = () => {
    const finalModel = selectedModel || availableModels[0]?.id || '';
    onSaveConfig(apiKey.trim(), finalModel);
    if (typeof window !== 'undefined') {
      localStorage.setItem('gaplens_gemini_key', apiKey.trim());
      localStorage.setItem('gaplens_gemini_model', finalModel);
    }
    setSaveToast(true);
    setTimeout(() => {
      setSaveToast(false);
      onClose();
    }, 1200);
  };

  const handleClearKey = () => {
    setApiKey('');
    const defaultMod = availableModels[0]?.id || '';
    onSaveConfig('', defaultMod);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('gaplens_gemini_key');
      localStorage.removeItem('gaplens_openrouter_key');
    }
    setTestResult({
      success: true,
      message: 'Client API key cleared. GapLens will use backend key or verified offline fallback.',
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto no-print">
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="relative w-full max-w-xl rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-2xl transition-all dark:border-zinc-800 dark:bg-zinc-900 z-10 space-y-5">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-100 pb-3 dark:border-zinc-800">
          <div className="flex items-center space-x-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900">
              <Cpu className="h-4 w-4" />
            </span>
            <div>
              <h3 className="text-base font-bold text-zinc-900 dark:text-white">
                AI Model &amp; API Configuration
              </h3>
              <p className="text-[11px] text-zinc-400">
                Configure Google Gemini models from backend .env or provide custom API key
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Offline Demo Mode Toggle */}
        <div className="rounded-xl border border-zinc-200/80 bg-zinc-50 p-3.5 dark:border-zinc-800 dark:bg-zinc-850 flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-xs font-bold text-zinc-900 dark:text-white block">
              Offline Demo Mode
            </span>
            <span className="text-[11px] text-zinc-500">
              Bypasses live LLM calls and serves deterministic audit datasets.
            </span>
          </div>
          <button
            type="button"
            onClick={() => onToggleForceDemo && onToggleForceDemo(!forceOfflineDemo)}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
              forceOfflineDemo ? 'bg-zinc-900 dark:bg-zinc-100' : 'bg-zinc-300 dark:bg-zinc-700'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white dark:bg-zinc-900 shadow-sm transition duration-200 ease-in-out ${
                forceOfflineDemo ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* API Key Input */}
        <div className="space-y-1.5">
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
            Google Gemini API Key (Optional)
          </label>
          <div className="relative">
            <input
              type={showKey ? 'text' : 'password'}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder={backendHasKey ? 'Server Gemini key configured via .env' : 'AIzaSy...'}
              className="w-full rounded-xl border border-zinc-200/80 bg-zinc-50 py-2.5 pl-3 pr-20 text-xs font-mono text-zinc-900 focus:border-zinc-900 focus:bg-white focus:outline-hidden dark:border-zinc-700 dark:bg-zinc-850 dark:text-zinc-100"
            />
            <div className="absolute inset-y-0 right-2 flex items-center space-x-1">
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="p-1 text-zinc-400 hover:text-zinc-700"
              >
                {showKey ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
              </button>
              {apiKey && (
                <button
                  type="button"
                  onClick={handleClearKey}
                  className="p-1 text-zinc-400 hover:text-rose-600"
                  title="Clear key"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Model Selection Strictly from .env */}
        <div className="space-y-2">
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
            Select Active Model (.env)
          </label>
          {availableModels.length === 0 ? (
            <div className="rounded-xl border border-dashed border-zinc-300 dark:border-zinc-700 p-4 text-center text-xs text-zinc-500">
              No models found in backend .env (configure GEMINI_MODEL in backend/.env)
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto pr-1">
              {availableModels.map((m) => {
                const isSelected = selectedModel === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setSelectedModel(m.id)}
                    className={`rounded-xl border p-3 text-left transition-all ${
                      isSelected
                        ? 'border-zinc-900 bg-zinc-900 text-white dark:border-white dark:bg-white dark:text-zinc-900 shadow-sm'
                        : 'border-zinc-200/80 bg-zinc-50 text-zinc-700 hover:bg-white dark:border-zinc-800 dark:bg-zinc-850 dark:text-zinc-300 dark:hover:bg-zinc-800'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold truncate">{m.name}</span>
                      <span
                        className={`rounded-full px-2 py-0.2 text-[9px] font-semibold ${
                          isSelected
                            ? 'bg-zinc-800 text-zinc-200 dark:bg-zinc-200 dark:text-zinc-800'
                            : 'bg-zinc-200 text-zinc-600 dark:bg-zinc-700 dark:text-zinc-300'
                        }`}
                      >
                        {m.badge || 'Configured'}
                      </span>
                    </div>
                    <p
                      className={`mt-1 text-[11px] line-clamp-1 ${
                        isSelected ? 'text-zinc-300 dark:text-zinc-600' : 'text-zinc-400'
                      }`}
                    >
                      {m.description}
                    </p>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Test Result Message */}
        {testResult && (
          <div
            className={`rounded-xl p-2.5 text-xs flex items-center space-x-2 border ${
              testResult.success
                ? 'bg-zinc-50 text-emerald-600 border-zinc-200/60 dark:bg-zinc-850 dark:border-zinc-800'
                : 'bg-zinc-50 text-rose-600 border-zinc-200/60 dark:bg-zinc-850 dark:border-zinc-800'
            }`}
          >
            {testResult.success ? <Check className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
            <span>{testResult.message}</span>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-between border-t border-zinc-100 pt-3 dark:border-zinc-800">
          <button
            type="button"
            disabled={testing}
            onClick={handleTestKey}
            className="inline-flex items-center space-x-1.5 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-850 dark:text-zinc-300 dark:hover:bg-zinc-800 transition-colors"
          >
            {testing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <KeyRound className="h-3.5 w-3.5" />}
            <span>Test Connection</span>
          </button>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-3 py-2 text-xs font-medium text-zinc-500 hover:text-zinc-900"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="rounded-xl bg-zinc-900 px-4 py-2 text-xs font-semibold text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 shadow-soft"
            >
              {saveToast ? 'Saved!' : 'Save & Apply'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
