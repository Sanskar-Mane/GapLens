import React from 'react';
import {
  Radar,
  RotateCcw,
  Sun,
  Moon,
  History,
  Sliders,
  Database,
  Sparkles,
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function Navbar({
  backendHealth,
  hasOpenRouterKey,
  activeModel,
  onOpenKeyModal,
  onResetWorkspace,
  forceOfflineDemo,
  onOpenSavedSessions,
  currentStep = 1,
  onStepClick,
  hasAnalysis = false,
}) {
  const { theme, toggleTheme } = useTheme();
  const isSupabaseConnected = Boolean(backendHealth?.data?.supabaseConnected);

  // Tab definitions
  const steps = [
    { step: 1, label: '1. Research Goal', accessible: true },
    { step: 2, label: '2. Source Workspace', accessible: true },
    { step: 3, label: '3. Gap & Conflict Dashboard', accessible: hasAnalysis },
    { step: 4, label: '4. Verification Checklist', accessible: hasAnalysis },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-200/80 bg-white/95 backdrop-blur-md transition-colors duration-200 dark:border-zinc-800 dark:bg-zinc-950/95 no-print">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        
        {/* Left: Minimalist square black icon container + GapLens title */}
        <div className="flex items-center space-x-3 shrink-0">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-900 text-white shadow-sm ring-1 ring-zinc-800 dark:bg-zinc-100 dark:text-zinc-900">
            <Radar className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-base font-bold tracking-tight text-zinc-900 dark:text-white">
                GapLens
              </span>
              <span className="hidden sm:inline-flex items-center rounded-full bg-zinc-100 px-2.5 py-0.5 text-[10px] font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-zinc-400" />
                Audit Engine
              </span>
            </div>
            <p className="hidden md:block text-[11px] text-zinc-400 dark:text-zinc-500">
              Information Gap &amp; Contradiction Radar
            </p>
          </div>
        </div>

        {/* Center: Horizontal Tab Navigation */}
        <nav
          aria-label="Wizard Steps Navigation"
          className="hidden md:flex items-center space-x-1 rounded-2xl bg-zinc-100/80 p-1 dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800"
        >
          {steps.map((s) => {
            const isActive = currentStep === s.step;
            const isAccessible = s.accessible;

            return (
              <button
                key={s.step}
                type="button"
                disabled={!isAccessible}
                onClick={() => isAccessible && onStepClick && onStepClick(s.step)}
                className={`transition-all rounded-xl px-3.5 py-1.5 text-xs font-semibold whitespace-nowrap ${
                  isActive
                    ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-sm'
                    : isAccessible
                    ? 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white'
                    : 'cursor-not-allowed opacity-40 text-zinc-400 dark:text-zinc-600'
                }`}
              >
                {s.label}
              </button>
            );
          })}
        </nav>

        {/* Right: Circular / rounded icon buttons */}
        <div className="flex items-center space-x-2 shrink-0">
          
          {/* Subtle Supabase Connection Dot */}
          <div
            className="hidden xl:inline-flex items-center space-x-1.5 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 px-2.5 py-1 text-[11px] font-medium text-zinc-600 dark:text-zinc-400"
            title={isSupabaseConnected ? 'Connected to Supabase PostgreSQL' : 'Operating in resilient Local Memory fallback'}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                isSupabaseConnected ? 'bg-emerald-500' : 'bg-zinc-400'
              }`}
            />
            <span>{isSupabaseConnected ? 'Supabase' : 'Local'}</span>
          </div>

          {/* Theme Toggle (Sun/Moon) */}
          <button
            type="button"
            onClick={toggleTheme}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-zinc-200/80 bg-white text-zinc-700 shadow-soft hover:bg-zinc-100 hover:text-zinc-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-white transition-colors"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? (
              <Sun className="h-4 w-4 text-amber-400" />
            ) : (
              <Moon className="h-4 w-4 text-zinc-700" />
            )}
          </button>

          {/* Saved Sessions Drawer Button */}
          <button
            type="button"
            onClick={onOpenSavedSessions}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-zinc-200/80 bg-white text-zinc-700 shadow-soft hover:bg-zinc-100 hover:text-zinc-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-white transition-colors"
            title="Saved Sessions History"
            aria-label="Saved Sessions"
          >
            <History className="h-4 w-4" />
          </button>

          {/* AI Settings / Model Config Modal Button */}
          <button
            type="button"
            onClick={onOpenKeyModal}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-zinc-200/80 bg-white text-zinc-700 shadow-soft hover:bg-zinc-100 hover:text-zinc-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-white transition-colors"
            title="AI Model & API Key Settings"
            aria-label="AI Settings"
          >
            <Sliders className="h-4 w-4" />
          </button>

          {/* Reset Workspace */}
          <button
            type="button"
            onClick={onResetWorkspace}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-zinc-200/80 bg-white text-zinc-500 shadow-soft hover:bg-zinc-100 hover:text-rose-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-rose-400 transition-colors"
            title="Reset Workspace"
            aria-label="Reset Workspace"
          >
            <RotateCcw className="h-4 w-4" />
          </button>

        </div>

      </div>

      {/* Mobile/Tablet Horizontal Step Tabs */}
      <div className="flex md:hidden overflow-x-auto border-t border-zinc-200/60 dark:border-zinc-800 px-4 py-2 space-x-1.5 scrollbar-none">
        {steps.map((s) => {
          const isActive = currentStep === s.step;
          const isAccessible = s.accessible;

          return (
            <button
              key={s.step}
              type="button"
              disabled={!isAccessible}
              onClick={() => isAccessible && onStepClick && onStepClick(s.step)}
              className={`transition-all rounded-lg px-3 py-1.5 text-xs font-semibold whitespace-nowrap shrink-0 ${
                isActive
                  ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-sm'
                  : isAccessible
                  ? 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white bg-zinc-100 dark:bg-zinc-900'
                  : 'cursor-not-allowed opacity-40 text-zinc-400 dark:text-zinc-600'
              }`}
            >
              {s.label}
            </button>
          );
        })}
      </div>
    </header>
  );
}
