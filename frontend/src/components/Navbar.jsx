import React from 'react';
import {
  Radar,
  KeyRound,
  RotateCcw,
  Database,
  Cpu,
  Sun,
  Moon
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function Navbar({
  backendHealth,
  hasOpenRouterKey,
  activeModel,
  onOpenKeyModal,
  onResetWorkspace,
  forceOfflineDemo,
}) {
  const { theme, toggleTheme } = useTheme();
  const isSupabaseConnected = Boolean(backendHealth?.data?.supabaseConnected);

  // Derive friendly short name for the active model
  const getModelShortName = (modelId) => {
    if (!modelId) return 'Llama 3.3 70B Free';
    if (modelId.includes('llama-3.3-70b')) return 'Llama 3.3 70B Free';
    if (modelId.includes('gemma-3-27b')) return 'Gemma 3 27B Free';
    if (modelId.includes('mistral-small')) return 'Mistral 24B Free';
    if (modelId.includes('nemotron')) return 'Nemotron 49B Free';
    if (modelId.includes('deepseek-r1')) return 'DeepSeek R1 Free';
    if (modelId.includes('qwen')) return 'Qwen 3 Free';
    if (modelId.includes('auto')) return 'Auto Free Router';
    const parts = modelId.split('/');
    return parts[1] || modelId;
  };

  const displayModel = getModelShortName(activeModel);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/90 backdrop-blur-md transition-colors duration-200 dark:border-slate-800 dark:bg-slate-950/90">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        
        {/* Left: Brand Logo + Hackathon Badge */}
        <div className="flex items-center space-x-3">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-600 shadow-md shadow-indigo-500/25 ring-1 ring-indigo-400/40">
            <Radar className="h-5 w-5 text-white animate-pulse" />
            <div className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-400 ring-2 ring-white dark:ring-slate-950" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-1">
                Gap<span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600 dark:from-indigo-400 dark:to-violet-400">Lens</span>
              </h1>
              <span className="inline-flex items-center rounded-full bg-indigo-50 px-2.5 py-0.5 text-[11px] font-semibold text-indigo-700 ring-1 ring-inset ring-indigo-300 dark:bg-indigo-950/90 dark:text-indigo-300 dark:ring-indigo-700/60">
                Digital Dark Spot Engine
              </span>
            </div>
            <p className="hidden text-xs text-slate-500 dark:text-slate-400 sm:block mt-0.5">
              Shinchan Online Hackathon 2026 &bull; <span className="text-indigo-600 dark:text-indigo-400 font-medium">AI-Assisted Information Gap Detection</span>
            </p>
          </div>
        </div>

        {/* Right: Theme Toggle, Status Pills, Settings Modal, Reset Action */}
        <div className="flex items-center space-x-2 sm:space-x-2.5">
          
          {/* Light / Dark Mode Toggle Button */}
          <button
            type="button"
            onClick={toggleTheme}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900 transition-colors dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white shadow-sm"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? (
              <Sun className="h-4 w-4 text-amber-400 animate-in spin-in-90 duration-200" />
            ) : (
              <Moon className="h-4 w-4 text-indigo-600 animate-in spin-in-90 duration-200" />
            )}
          </button>

          {/* Supabase Status Pill */}
          <div
            className={`hidden sm:inline-flex items-center space-x-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium border transition-colors ${
              isSupabaseConnected
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800/70'
                : 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-900 dark:text-slate-400 dark:border-slate-800'
            }`}
            title={
              isSupabaseConnected
                ? 'Connected to Supabase PostgreSQL table research_sessions'
                : 'Supabase credentials missing in .env — using resilient In-Memory Fallback'
            }
          >
            <Database className={`h-3.5 w-3.5 ${isSupabaseConnected ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`} />
            <span>{isSupabaseConnected ? 'Supabase Live' : 'Local Memory'}</span>
          </div>

          {/* OpenRouter Status Pill */}
          <button
            type="button"
            onClick={onOpenKeyModal}
            className={`group inline-flex items-center space-x-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium border transition-all ${
              forceOfflineDemo
                ? 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800/70 dark:hover:bg-amber-900/60'
                : hasOpenRouterKey
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800/70 dark:hover:bg-emerald-900/60'
                : 'bg-indigo-50 text-indigo-800 border-indigo-200 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:text-indigo-300 dark:border-indigo-800/70 dark:hover:bg-indigo-900/60'
            }`}
            title="Configure OpenRouter Free Models or Custom Model ID"
          >
            <Cpu className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate max-w-[130px] sm:max-w-none">
              {forceOfflineDemo ? 'Offline Demo Mode' : displayModel}
            </span>
          </button>

          {/* AI & Key Settings Button */}
          <button
            type="button"
            onClick={onOpenKeyModal}
            className="inline-flex items-center space-x-1.5 rounded-lg border border-slate-200 bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-200 hover:text-slate-900 transition-colors dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white shadow-sm"
            title="OpenRouter AI & API Key Settings"
          >
            <KeyRound className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
            <span className="hidden md:inline">AI & Key Settings</span>
            <span className="md:hidden">Settings</span>
          </button>

          {/* Reset Workspace Button */}
          <button
            type="button"
            onClick={onResetWorkspace}
            className="inline-flex items-center space-x-1.5 rounded-lg border border-slate-200 bg-slate-100 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-300 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-rose-950/50 dark:hover:text-rose-300 dark:hover:border-rose-800/70 transition-colors shadow-sm"
            title="Clear all source inputs and reset workspace"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Reset</span>
          </button>

        </div>

      </div>
    </header>
  );
}
