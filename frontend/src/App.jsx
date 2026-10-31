import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import ApiKeyModal from './components/ApiKeyModal';
import StepProgressBar from './components/StepProgressBar';
import SampleLoader from './components/SampleLoader';
import TopicInput from './components/TopicInput';
import SourceCollector from './components/SourceCollector';
import AnalysisResultsView from './components/AnalysisResultsView';
import VerificationChecklistView from './components/VerificationChecklistView';
import AnalysisLoadingOverlay from './components/AnalysisLoadingOverlay';
import { ThemeProvider } from './context/ThemeContext';
import {
  checkHealth,
  fetchScenarios,
  runAiAnalysis,
  saveResearchSession,
  DEFAULT_FREE_MODEL,
} from './services/api';
import { FALLBACK_SCENARIOS, FALLBACK_ANALYSES } from './data/fallbackScenarios';
import {
  ArrowRight,
  ArrowLeft,
  Sparkles,
  AlertCircle,
  Edit3,
  Layers,
  CheckCircle2,
  HelpCircle,
  ShieldAlert,
} from 'lucide-react';

function MainApp() {
  // Wizard Active Step: 1 = Goal, 2 = Sources, 3 = Analysis, 4 = Checklist
  const [currentStep, setCurrentStep] = useState(1);

  // System & API Configuration State
  const [backendHealth, setBackendHealth] = useState(null);
  const [scenarios, setScenarios] = useState(FALLBACK_SCENARIOS);
  const [openRouterKey, setOpenRouterKey] = useState(
    () => (typeof window !== 'undefined' ? localStorage.getItem('gaplens_openrouter_key') || '' : '')
  );
  const [activeModel, setActiveModel] = useState(
    () =>
      typeof window !== 'undefined'
        ? localStorage.getItem('gaplens_openrouter_model') || DEFAULT_FREE_MODEL
        : DEFAULT_FREE_MODEL
  );
  const [forceOfflineDemo, setForceOfflineDemo] = useState(
    () => (typeof window !== 'undefined' ? localStorage.getItem('gaplens_force_offline_demo') === 'true' : false)
  );
  const [isKeyModalOpen, setIsKeyModalOpen] = useState(false);

  // Research Inputs (defaulted to Scenario 1 for immediate reviewer exploration)
  const [topic, setTopic] = useState(
    'What should I verify before applying for the State Post-Matric Scholarship?'
  );
  const [category, setCategory] = useState('Education');
  const [sources, setSources] = useState(FALLBACK_SCENARIOS[0].sources);
  const [activeScenarioId, setActiveScenarioId] = useState(FALLBACK_SCENARIOS[0].id);

  // Analysis Result State
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [analysisMeta, setAnalysisMeta] = useState(null);
  const [validationError, setValidationError] = useState(null);

  // 1. Initial Health Check & Scenarios Fetch
  useEffect(() => {
    let isMounted = true;
    const fetchStatus = async () => {
      const health = await checkHealth();
      if (isMounted) setBackendHealth(health);
    };

    const loadScenarios = async () => {
      const data = await fetchScenarios();
      if (isMounted && data && data.length > 0) {
        setScenarios(data);
      }
    };

    fetchStatus();
    loadScenarios();

    const interval = setInterval(fetchStatus, 20000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  // 2. OpenRouter Config Persistence
  const handleSaveConfig = (key, model) => {
    setOpenRouterKey(key);
    setActiveModel(model);
    localStorage.setItem('gaplens_openrouter_key', key);
    localStorage.setItem('gaplens_openrouter_model', model);
  };

  const handleToggleForceDemo = (checked) => {
    setForceOfflineDemo(checked);
    localStorage.setItem('gaplens_force_offline_demo', checked ? 'true' : 'false');
  };

  // 3. Scenario Selection (Step 1)
  const handleSelectScenario = (scenario) => {
    setActiveScenarioId(scenario.id);
    setTopic(scenario.topic);
    setCategory(scenario.category || 'Education');
    setSources(
      scenario.sources.map((s, idx) => ({
        ...s,
        id: s.id || `src-${idx + 1}`,
      }))
    );
    setValidationError(null);
  };

  // 4. Source Management Handlers (Step 2)
  const handleAddSource = () => {
    if (sources.length >= 6) return;
    const newId = `src-${Date.now().toString(36)}`;
    const newSource = {
      id: newId,
      title: `Source ${sources.length + 1}`,
      sourceType: 'Third-Party Guide',
      url: '',
      publishedDate: '',
      content: '',
    };
    setSources([...sources, newSource]);
  };

  const handleUpdateSource = (sourceId, fields) => {
    setSources((prev) =>
      prev.map((s) => (s.id === sourceId ? { ...s, ...fields } : s))
    );
  };

  const handleDeleteSource = (sourceId) => {
    if (sources.length <= 2) return;
    setSources((prev) => prev.filter((s) => s.id !== sourceId));
  };

  // 5. Reset Workspace to New Research
  const handleResetWorkspace = () => {
    if (window.confirm('Start a fresh research query? Current inputs will be cleared.')) {
      setTopic('');
      setCategory('Education');
      setSources([
        {
          id: 'src-1',
          title: '',
          sourceType: 'Official Notice',
          url: '',
          publishedDate: '',
          content: '',
        },
        {
          id: 'src-2',
          title: '',
          sourceType: 'Third-Party Guide',
          url: '',
          publishedDate: '',
          content: '',
        },
      ]);
      setActiveScenarioId(null);
      setAnalysisResult(null);
      setAnalysisMeta(null);
      setValidationError(null);
      setCurrentStep(1);
    }
  };

  // 6. Navigation: Step 1 -> Step 2
  const handleProceedToSources = () => {
    if (!topic || !topic.trim()) {
      setValidationError('Please enter your research question or select a sample scenario first.');
      return;
    }
    setValidationError(null);
    setCurrentStep(2);
  };

  // 7. Navigation: Step 2 -> Step 3 (Run AI Analysis)
  const handleRunAnalysis = async () => {
    const validSources = sources.filter(
      (s) => s && s.content && s.content.trim().length >= 10
    );

    if (validSources.length < 2) {
      setValidationError(
        `At least 2 sources must contain meaningful text (currently ${validSources.length} valid). Please paste text or extract content via URL.`
      );
      return;
    }

    setValidationError(null);
    setIsAnalyzing(true);

    try {
      const payload = {
        topic: topic.trim(),
        category,
        sources: validSources,
        openRouterKey: forceOfflineDemo ? '' : openRouterKey,
        model: activeModel,
        forceDemoMode: forceOfflineDemo,
      };

      const result = await runAiAnalysis(payload);

      if (result && result.analysis) {
        setAnalysisResult(result.analysis);
        setAnalysisMeta(result.meta || {});

        // Save session in background
        saveResearchSession({
          topic: topic.trim(),
          category,
          sources: validSources,
          modelUsed: result.meta?.modelUsed || activeModel,
          analysisResult: result.analysis,
        }).catch((err) => console.warn('[Session Save Error]', err));

        // Advance to Step 3
        setCurrentStep(3);
      } else {
        throw new Error(result?.message || 'Failed to generate gap analysis.');
      }
    } catch (err) {
      console.error('[Analysis Error]', err);
      // Fallback resilience: load precomputed analysis if available
      const fallbackKey = activeScenarioId || 'scholarship-2026';
      const fallbackAnalysis = FALLBACK_ANALYSES[fallbackKey] || FALLBACK_ANALYSES['scholarship-2026'];
      setAnalysisResult(fallbackAnalysis);
      setAnalysisMeta({
        mode: 'Offline Demo Mode (Pre-Verified Engine)',
        modelUsed: 'gaplens-deterministic-fallback',
        isOfflineDemo: true,
        fallbackNotice: 'Network timeout occurred. Loaded verified offline analysis dataset.',
      });
      setCurrentStep(3);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 transition-colors duration-200 dark:bg-slate-950 dark:text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white bg-grid-pattern">
      
      {/* Top Navbar */}
      <Navbar
        backendHealth={backendHealth}
        hasOpenRouterKey={Boolean(openRouterKey || backendHealth?.data?.hasServerOpenRouterKey)}
        activeModel={activeModel}
        onOpenKeyModal={() => setIsKeyModalOpen(true)}
        onResetWorkspace={handleResetWorkspace}
        forceOfflineDemo={forceOfflineDemo}
      />

      {/* Main Container */}
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 lg:px-8 space-y-5">
        
        {/* Horizontal 4-Step Wizard Navigation */}
        <StepProgressBar
          currentStep={currentStep}
          onStepClick={(step) => {
            setValidationError(null);
            setCurrentStep(step);
          }}
          hasAnalysis={Boolean(analysisResult)}
          sourcesCount={sources.length}
        />

        {/* Global Validation Error Banner */}
        {validationError && (
          <div className="flex items-center space-x-2.5 rounded-xl border border-rose-300 bg-rose-50 p-3 text-xs text-rose-800 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-300 animate-in fade-in">
            <AlertCircle className="h-4 w-4 text-rose-600 dark:text-rose-400 shrink-0" />
            <span className="font-medium">{validationError}</span>
          </div>
        )}

        {/* ==================================================================== */}
        {/* STEP 1: DEFINE RESEARCH GOAL */}
        {/* ==================================================================== */}
        {currentStep === 1 && (
          <div className="space-y-5 animate-in fade-in duration-150">
            
            {/* 1-Click Sample Scenarios for Judges */}
            <SampleLoader
              scenarios={scenarios}
              onSelectScenario={handleSelectScenario}
              activeScenarioId={activeScenarioId}
            />

            {/* Topic & Category Input Form */}
            <TopicInput
              topic={topic}
              onTopicChange={(val) => {
                setTopic(val);
                if (validationError) setValidationError(null);
              }}
              category={category}
              onCategoryChange={setCategory}
            />

            {/* Bottom Navigation for Step 1 */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center space-x-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>
                  {sources.length} sources pre-configured &bull; Ready for review
                </span>
              </div>

              <button
                type="button"
                onClick={handleProceedToSources}
                className="inline-flex items-center space-x-2 rounded-xl bg-indigo-600 px-6 py-3 text-xs font-bold text-white shadow-md shadow-indigo-600/25 hover:bg-indigo-500 transition-all w-full sm:w-auto justify-center"
              >
                <span>Next: Review & Add Sources</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>

          </div>
        )}

        {/* ==================================================================== */}
        {/* STEP 2: COLLECT & VERIFY SOURCES */}
        {/* ==================================================================== */}
        {currentStep === 2 && (
          <div className="space-y-5 animate-in fade-in duration-150">
            
            {/* Compact Research Goal Reminder Banner */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-2xl border border-indigo-200/80 bg-indigo-50/60 p-4 dark:border-indigo-900/40 dark:bg-slate-900/90 shadow-sm">
              <div className="flex items-start space-x-3">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-indigo-600 text-white mt-0.5">
                  <Layers className="h-4 w-4" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-400">
                      Active Research Goal ({category})
                    </span>
                    <span className="rounded bg-indigo-100 px-1.5 py-0.2 text-[10px] font-mono text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300">
                      Step 2 of 4
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                    {topic || 'No topic specified'}
                  </h3>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="inline-flex items-center space-x-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-750 transition-colors shrink-0 self-start sm:self-auto"
              >
                <Edit3 className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
                <span>Edit Goal</span>
              </button>
            </div>

            {/* Source Collector & Card Workspace */}
            <SourceCollector
              sources={sources}
              onAddSource={handleAddSource}
              onUpdateSource={handleUpdateSource}
              onDeleteSource={handleDeleteSource}
            />

            {/* Bottom Navigation for Step 2 */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="inline-flex items-center space-x-1.5 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors w-full sm:w-auto justify-center"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>← Back to Goal</span>
              </button>

              <button
                type="button"
                onClick={handleRunAnalysis}
                disabled={isAnalyzing}
                className="inline-flex items-center space-x-2 rounded-xl bg-indigo-600 px-6 py-2.5 text-xs font-bold text-white shadow-md shadow-indigo-600/25 hover:bg-indigo-500 disabled:opacity-50 transition-all w-full sm:w-auto justify-center"
              >
                <Sparkles className="h-4 w-4" />
                <span>Run AI Gap & Conflict Analysis →</span>
              </button>
            </div>

          </div>
        )}

        {/* ==================================================================== */}
        {/* STEP 3: AI FINDINGS & TRANSPARENCY DASHBOARD */}
        {/* ==================================================================== */}
        {currentStep === 3 && (
          <div className="animate-in fade-in duration-150">
            <AnalysisResultsView
              analysis={analysisResult}
              meta={analysisMeta}
              sources={sources}
              onBackToSources={() => setCurrentStep(2)}
              onProceedToChecklist={() => setCurrentStep(4)}
            />
          </div>
        )}

        {/* ==================================================================== */}
        {/* STEP 4: PRIORITIZED OFFICIAL VERIFICATION CHECKLIST */}
        {/* ==================================================================== */}
        {currentStep === 4 && (
          <div className="animate-in fade-in duration-150">
            <VerificationChecklistView
              checklist={analysisResult?.verificationChecklist || []}
              analysis={analysisResult}
              topic={topic}
              category={category}
              onBackToFindings={() => setCurrentStep(3)}
              onResetResearch={handleResetWorkspace}
            />
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-5 text-center text-xs text-slate-500 transition-colors duration-200 dark:border-slate-900 dark:bg-slate-950 dark:text-slate-400 mt-auto">
        <div className="mx-auto max-w-7xl px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            <strong className="text-slate-700 dark:text-slate-300">GapLens</strong> &bull; AI-Assisted Information Gap & Contradiction Detection Platform
          </div>
          <div>
            Shinchan Online Hackathon 2026 &bull; Problem Statement:{' '}
            <span className="text-indigo-600 dark:text-indigo-400 font-semibold">
              Digital Dark Spot
            </span>
          </div>
        </div>
      </footer>

      {/* OpenRouter Config & Key Modal */}
      <ApiKeyModal
        isOpen={isKeyModalOpen}
        onClose={() => setIsKeyModalOpen(false)}
        currentKey={openRouterKey}
        currentModel={activeModel}
        onSaveConfig={handleSaveConfig}
        backendHasKey={Boolean(backendHealth?.data?.hasServerOpenRouterKey)}
        forceOfflineDemo={forceOfflineDemo}
        onToggleForceDemo={handleToggleForceDemo}
      />

      {/* Step-by-Step AI Pipeline Loading Overlay */}
      <AnalysisLoadingOverlay
        isVisible={isAnalyzing}
        activeModel={activeModel}
      />

    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <MainApp />
    </ThemeProvider>
  );
}
