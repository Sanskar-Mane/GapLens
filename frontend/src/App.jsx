import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import ApiKeyModal from './components/ApiKeyModal';
import MetricCardsRow from './components/MetricCardsRow';
import SampleLoader from './components/SampleLoader';
import TopicInput from './components/TopicInput';
import SourceCollector from './components/SourceCollector';
import AnalysisResultsView from './components/AnalysisResultsView';
import VerificationChecklistView from './components/VerificationChecklistView';
import AnalysisLoadingOverlay from './components/AnalysisLoadingOverlay';
import SavedSessionsDrawer from './components/SavedSessionsDrawer';
import { ThemeProvider } from './context/ThemeContext';
import {
  checkHealth,
  fetchScenarios,
  runAiAnalysis,
  saveResearchSession,
  generateClientDynamicFallback,
  DEFAULT_FREE_MODEL,
} from './services/api';
import { FALLBACK_SCENARIOS, FALLBACK_ANALYSES } from './data/fallbackScenarios';
import {
  ArrowRight,
  ArrowLeft,
  Sparkles,
  AlertCircle,
  Edit3,
} from 'lucide-react';

function MainApp() {
  // Wizard Active Step: 1 = Goal, 2 = Sources, 3 = Analysis, 4 = Checklist
  const [currentStep, setCurrentStep] = useState(1);

  // System & API Configuration State
  const [backendHealth, setBackendHealth] = useState(null);
  const [scenarios, setScenarios] = useState(FALLBACK_SCENARIOS);
  const [openRouterKey, setOpenRouterKey] = useState(
    typeof window !== 'undefined'
      ? localStorage.getItem('gaplens_gemini_key') || localStorage.getItem('gaplens_openrouter_key') || ''
      : ''
  );
  const [activeModel, setActiveModel] = useState(DEFAULT_FREE_MODEL);
  const [availableModels, setAvailableModels] = useState([]);
  const [forceOfflineDemo, setForceOfflineDemo] = useState(
    typeof window !== 'undefined' ? localStorage.getItem('gaplens_force_offline_demo') === 'true' : false
  );

  // Modals & Drawers State
  const [isKeyModalOpen, setIsKeyModalOpen] = useState(false);
  const [isSavedSessionsOpen, setIsSavedSessionsOpen] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState(null);

  // Research Inputs
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

  // One-time scrubber on mount to eliminate legacy invalid model slugs
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('gaplens_gemini_model') || localStorage.getItem('gaplens_openrouter_model');
      if (
        !stored ||
        stored.includes('3.8-flash') ||
        stored.includes('gemini-flash-high') ||
        stored.includes('llama') ||
        stored.includes('deepseek') ||
        stored.includes(':free') ||
        stored === 'undefined'
      ) {
        localStorage.removeItem('gaplens_openrouter_model');
        localStorage.removeItem('gaplens_gemini_model');
        setActiveModel(DEFAULT_FREE_MODEL);
      }
    }
  }, []);

  // 1. Initial Health Check & Scenarios Fetch
  useEffect(() => {
    let isMounted = true;
    const fetchStatus = async () => {
      const health = await checkHealth();
      if (!isMounted) return;

      setBackendHealth(health);

      const serverModel = health?.data?.defaultModel;
      const serverModels = Array.isArray(health?.data?.availableModels) ? health.data.availableModels : [];
      if (serverModels.length > 0) {
        setAvailableModels(serverModels);
      }

      const clientModel = typeof window !== 'undefined'
        ? localStorage.getItem('gaplens_gemini_model') || localStorage.getItem('gaplens_openrouter_model')
        : null;

      // Validate client model against backend models strictly sourced from .env
      const validModelIds = serverModels.map((m) => m.id);
      if (clientModel && validModelIds.includes(clientModel)) {
        setActiveModel(clientModel);
      } else if (serverModel) {
        setActiveModel(serverModel);
        if (typeof window !== 'undefined') {
          localStorage.setItem('gaplens_gemini_model', serverModel);
          localStorage.setItem('gaplens_openrouter_model', serverModel);
        }
      } else if (serverModels[0]?.id) {
        setActiveModel(serverModels[0].id);
        if (typeof window !== 'undefined') {
          localStorage.setItem('gaplens_gemini_model', serverModels[0].id);
          localStorage.setItem('gaplens_openrouter_model', serverModels[0].id);
        }
      }

      const scenarioData = await fetchScenarios();
      if (!isMounted) return;
      if (scenarioData && Array.isArray(scenarioData) && scenarioData.length > 0) {
        setScenarios(scenarioData);
      }
    };

    fetchStatus();

    return () => {
      isMounted = false;
    };
  }, []);

  // 2. Select Scenario Handler
  const handleSelectScenario = (scenario) => {
    setActiveScenarioId(scenario.id);
    setTopic(scenario.topic);
    setCategory(scenario.category);
    setSources(scenario.sources);
    setValidationError(null);
  };

  // 3. Reset Workspace Handler
  const handleResetWorkspace = () => {
    setTopic('');
    setCategory('Education');
    setSources([
      {
        id: 'src-1',
        title: '',
        url: '',
        publishedDate: '',
        sourceType: 'Official Notice',
        content: '',
      },
      {
        id: 'src-2',
        title: '',
        url: '',
        publishedDate: '',
        sourceType: 'Third-Party Guide',
        content: '',
      },
    ]);
    setActiveScenarioId(null);
    setAnalysisResult(null);
    setAnalysisMeta(null);
    setCurrentSessionId(null);
    setValidationError(null);
    setCurrentStep(1);
  };

  // 4. Source Mutation Handlers
  const handleAddSource = () => {
    if (sources.length >= 6) return;
    const newId = `src-${sources.length + 1}`;
    setSources([
      ...sources,
      {
        id: newId,
        title: '',
        url: '',
        publishedDate: '',
        sourceType: 'Official Notice',
        content: '',
      },
    ]);
  };

  const handleUpdateSource = (sourceId, fieldsToUpdate) => {
    setSources(
      sources.map((s) => (s.id === sourceId ? { ...s, ...fieldsToUpdate } : s))
    );
  };

  const handleDeleteSource = (sourceId) => {
    if (sources.length <= 2) return;
    setSources(sources.filter((s) => s.id !== sourceId));
  };

  // 5. API Key / Model Config Save Handler
  const handleSaveConfig = (key, model) => {
    setOpenRouterKey(key);
    setActiveModel(model);
    if (typeof window !== 'undefined') {
      localStorage.setItem('gaplens_gemini_key', key);
      localStorage.setItem('gaplens_openrouter_key', key);
      localStorage.setItem('gaplens_gemini_model', model);
      localStorage.setItem('gaplens_openrouter_model', model);
    }
  };

  // 6. Toggle Force Offline Demo Mode
  const handleToggleForceDemo = (enabled) => {
    setForceOfflineDemo(enabled);
    if (typeof window !== 'undefined') {
      localStorage.setItem('gaplens_force_offline_demo', enabled ? 'true' : 'false');
    }
  };

  // 7. Navigation: Step 1 -> Step 2
  const handleProceedToSources = () => {
    if (!topic || !topic.trim()) {
      setValidationError('Please define your research question or select a scenario before proceeding.');
      return;
    }
    setValidationError(null);
    setCurrentStep(2);
  };

  // 8. Navigation: Step 2 -> Step 3 Trigger AI Analysis
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
        geminiKey: forceOfflineDemo ? '' : openRouterKey,
        openRouterKey: forceOfflineDemo ? '' : openRouterKey,
        model: activeModel,
        forceDemoMode: forceOfflineDemo,
      };

      const result = await runAiAnalysis(payload);

      if (result && result.analysis) {
        setAnalysisResult(result.analysis);
        setAnalysisMeta(result.meta || {});

        if (result.meta?.sessionId) {
          setCurrentSessionId(result.meta.sessionId);
        }

        // Save session in background
        saveResearchSession({
          topic: topic.trim(),
          category,
          sources: validSources,
          modelUsed: result.meta?.modelUsed || activeModel,
          analysisResult: result.analysis,
        })
          .then((res) => {
            if (res?.session?.id) {
              setCurrentSessionId(res.session.id);
            }
          })
          .catch((err) => console.warn('[Session Save Error]', err));

        // Advance to Step 3
        setCurrentStep(3);
      } else {
        throw new Error(result?.message || 'Failed to generate gap analysis.');
      }
    } catch (err) {
      console.error('[Analysis Error]', err);
      // Resilient fallback: only use pre-seeded scenario if explicitly active, otherwise synthesize dynamically
      const scenarioMatch = activeScenarioId ? FALLBACK_ANALYSES[activeScenarioId] : null;
      const fallbackAnalysis = scenarioMatch || generateClientDynamicFallback(topic, category, validSources);
      setAnalysisResult(fallbackAnalysis);
      setAnalysisMeta({
        mode: scenarioMatch ? 'Offline Demo Mode (Pre-Verified Engine)' : 'Offline Demo Mode (Dynamic Engine)',
        modelUsed: 'gaplens-deterministic-fallback',
        isOfflineDemo: true,
        fallbackNotice: scenarioMatch
          ? 'Network timeout occurred. Loaded verified offline analysis dataset.'
          : 'Network timeout occurred. Synthesized dynamic analysis from submitted sources.',
      });
      setCurrentStep(3);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // 9. Load Session from Saved Analyses Drawer
  const handleLoadSavedSession = (session) => {
    if (!session) return;
    setActiveScenarioId(null);
    setTopic(session.topic || '');
    setCategory(session.category || 'Education');
    if (Array.isArray(session.sources) && session.sources.length > 0) {
      setSources(session.sources);
    }
    const analysis = session.analysis_result || session.analysisResult;
    if (analysis) {
      setAnalysisResult(analysis);
      setAnalysisMeta({
        mode: 'Loaded Saved Session',
        modelUsed: session.model_used || 'saved-session',
        isOfflineDemo: false,
        sessionId: session.id,
      });
      setCurrentSessionId(session.id);
      setCurrentStep(3);
    } else {
      setCurrentStep(2);
    }
    setIsSavedSessionsOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#F4F5F7] text-zinc-900 transition-colors duration-200 dark:bg-zinc-950 dark:text-zinc-100 flex flex-col font-sans">
      
      {/* Top Navbar */}
      <Navbar
        backendHealth={backendHealth}
        hasOpenRouterKey={Boolean(
          openRouterKey ||
          backendHealth?.data?.hasServerGeminiKey ||
          backendHealth?.data?.hasServerOpenRouterKey
        )}
        activeModel={activeModel}
        onOpenKeyModal={() => setIsKeyModalOpen(true)}
        onOpenSavedSessions={() => setIsSavedSessionsOpen(true)}
        onResetWorkspace={handleResetWorkspace}
        forceOfflineDemo={forceOfflineDemo}
        currentStep={currentStep}
        onStepClick={(step) => {
          if (step === 1) {
            setCurrentStep(1);
          } else if (step === 2) {
            if (!topic || !topic.trim()) {
              setValidationError('Please define your research question or select a scenario before proceeding.');
              return;
            }
            setValidationError(null);
            setCurrentStep(2);
          } else if (step === 3 && analysisResult) {
            setCurrentStep(3);
          } else if (step === 4 && analysisResult) {
            setCurrentStep(4);
          }
        }}
        hasAnalysis={Boolean(analysisResult)}
      />

      {/* Main Container */}
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-7 sm:px-6 lg:px-8 space-y-6">
        
        {/* Top 4 KPI Metrics Row (Across Step 2, Step 3, & Step 4) */}
        {currentStep >= 2 && (
          <div className="animate-in fade-in duration-150">
            <MetricCardsRow
              sourcesCount={sources.length}
              analysis={analysisResult}
            />
          </div>
        )}

        {/* Validation Alert Banner */}
        {validationError && (
          <div className="flex items-center justify-between rounded-2xl border border-zinc-200/80 bg-white p-4 text-xs text-rose-600 dark:border-zinc-800 dark:bg-zinc-900 shadow-soft animate-in fade-in duration-200">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
              <span className="font-medium">{validationError}</span>
            </div>
            <button
              type="button"
              onClick={() => setValidationError(null)}
              className="font-bold underline ml-2"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* ==================================================================== */}
        {/* STEP 1: DEFINE RESEARCH GOAL & CHOOSE SCENARIO */}
        {/* ==================================================================== */}
        {currentStep === 1 && (
          <div className="space-y-6 animate-in fade-in duration-150">
            
            {/* Scenarios Loader Bar */}
            <SampleLoader
              scenarios={scenarios}
              activeScenarioId={activeScenarioId}
              onSelectScenario={handleSelectScenario}
            />

            {/* Research Goal & Category Input */}
            <TopicInput
              topic={topic}
              category={category}
              onTopicChange={(newTopic) => {
                setTopic(newTopic);
                setActiveScenarioId(null);
              }}
              onCategoryChange={(newCategory) => {
                setCategory(newCategory);
                setActiveScenarioId(null);
              }}
              onReset={handleResetWorkspace}
            />

            {/* Bottom Navigation for Step 1 */}
            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={handleProceedToSources}
                className="inline-flex items-center space-x-2 rounded-xl bg-zinc-900 px-6 py-3 text-xs font-bold text-white shadow-soft hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 transition-all hover:scale-[1.01]"
              >
                <span>Next: Review &amp; Add Sources</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>

          </div>
        )}

        {/* ==================================================================== */}
        {/* STEP 2: COLLECT & VERIFY SOURCES */}
        {/* ==================================================================== */}
        {currentStep === 2 && (
          <div className="space-y-6 animate-in fade-in duration-150">
            
            {/* Compact Header reminding user of selected Goal */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-zinc-200/80 bg-white p-4 shadow-soft dark:border-zinc-800 dark:bg-zinc-900">
              <div className="flex items-start sm:items-center space-x-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 font-bold text-xs shrink-0 mt-0.5 sm:mt-0">
                  Goal
                </span>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="rounded-full bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 text-[10px] font-bold text-zinc-700 dark:text-zinc-300">
                      {category}
                    </span>
                    <span className="text-xs text-zinc-400">
                      ({sources.length} sources attached)
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-white mt-0.5">
                    {topic || 'No topic specified'}
                  </h3>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="inline-flex items-center space-x-1.5 rounded-xl border border-zinc-200/80 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-700 hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-850 dark:text-zinc-300 dark:hover:bg-zinc-800 transition-colors shrink-0 self-start sm:self-auto"
              >
                <Edit3 className="h-3.5 w-3.5" />
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
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-zinc-200/80 dark:border-zinc-800">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="inline-flex items-center space-x-1.5 rounded-xl border border-zinc-200/80 bg-white px-4 py-2.5 text-xs font-semibold text-zinc-700 hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 transition-colors w-full sm:w-auto justify-center"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>← Back to Goal</span>
              </button>

              <button
                type="button"
                onClick={handleRunAnalysis}
                disabled={isAnalyzing}
                className="inline-flex items-center space-x-2 rounded-xl bg-zinc-900 px-6 py-2.5 text-xs font-bold text-white shadow-soft hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 disabled:opacity-50 transition-all w-full sm:w-auto justify-center"
              >
                <Sparkles className="h-4 w-4" />
                <span>Run AI Gap &amp; Conflict Analysis →</span>
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
              sessionId={currentSessionId}
              onBackToFindings={() => setCurrentStep(3)}
              onResetResearch={handleResetWorkspace}
            />
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-200/80 bg-white py-5 text-center text-xs text-zinc-400 dark:border-zinc-900 dark:bg-zinc-950 dark:text-zinc-500 mt-auto no-print">
        <div className="mx-auto max-w-7xl px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            <strong className="text-zinc-800 dark:text-zinc-200 font-semibold">GapLens</strong> &bull; Information Gap &amp; Contradiction Detection Platform
          </div>
          <div>
            Shinchan Online Hackathon 2026 &bull; Problem Statement:{' '}
            <span className="text-zinc-800 dark:text-zinc-200 font-medium">
              Digital Dark Spot
            </span>
          </div>
        </div>
      </footer>

      {/* API Key & Model Config Modal */}
      <ApiKeyModal
        isOpen={isKeyModalOpen}
        onClose={() => setIsKeyModalOpen(false)}
        currentKey={openRouterKey}
        currentModel={activeModel}
        availableModels={availableModels}
        onSaveConfig={handleSaveConfig}
        backendHasKey={Boolean(
          backendHealth?.data?.hasServerGeminiKey ||
          backendHealth?.data?.hasServerOpenRouterKey
        )}
        forceOfflineDemo={forceOfflineDemo}
        onToggleForceDemo={handleToggleForceDemo}
      />

      {/* Saved Research Analyses Drawer */}
      <SavedSessionsDrawer
        isOpen={isSavedSessionsOpen}
        onClose={() => setIsSavedSessionsOpen(false)}
        onLoadSession={handleLoadSavedSession}
      />

      {/* Pipeline Loading Overlay */}
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
