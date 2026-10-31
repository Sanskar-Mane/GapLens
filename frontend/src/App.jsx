import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import ApiKeyModal from './components/ApiKeyModal';
import SampleLoader from './components/SampleLoader';
import TopicInput from './components/TopicInput';
import SourceCollector from './components/SourceCollector';
import ActionFooter from './components/ActionFooter';
import DashboardPreview from './components/DashboardPreview';
import { ThemeProvider } from './context/ThemeContext';
import {
  checkHealth,
  fetchScenarios,
  saveResearchSession,
  triggerAnalysisPrep,
  DEFAULT_FREE_MODEL
} from './services/api';
import { FALLBACK_SCENARIOS } from './data/fallbackScenarios';

function MainApp() {
  // System & API Configuration State
  const [backendHealth, setBackendHealth] = useState(null);
  const [scenarios, setScenarios] = useState(FALLBACK_SCENARIOS);
  const [openRouterKey, setOpenRouterKey] = useState(
    () => (typeof window !== 'undefined' ? localStorage.getItem('gaplens_openrouter_key') || '' : '')
  );
  const [activeModel, setActiveModel] = useState(
    () => (typeof window !== 'undefined' ? localStorage.getItem('gaplens_openrouter_model') || DEFAULT_FREE_MODEL : DEFAULT_FREE_MODEL)
  );
  const [forceOfflineDemo, setForceOfflineDemo] = useState(
    () => (typeof window !== 'undefined' ? localStorage.getItem('gaplens_force_offline_demo') === 'true' : false)
  );
  const [isKeyModalOpen, setIsKeyModalOpen] = useState(false);

  // Phase 1 Workspace Input State (defaulted to Scenario 1 for instantaneous review)
  const [topic, setTopic] = useState(
    'What should I verify before applying for the State Post-Matric Scholarship?'
  );
  const [category, setCategory] = useState('Education');
  const [sources, setSources] = useState(FALLBACK_SCENARIOS[0].sources);
  const [activeScenarioId, setActiveScenarioId] = useState(FALLBACK_SCENARIOS[0].id);

  // Analysis & Validation Trigger State
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisNotice, setAnalysisNotice] = useState(null);
  const [lastAnalysisResult, setLastAnalysisResult] = useState(null);

  // 1. Check Backend Health on Mount & Periodic Interval
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

    const interval = setInterval(fetchStatus, 15000);
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

  // 3. 1-Click Preset Scenario Loader
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
    setAnalysisNotice({
      type: 'success',
      title: `Loaded Preset: ${scenario.name}`,
      message: `Scenario populated with ${scenario.sources.length} sources containing intentional dark spots (${scenario.flawsSummary || 'Contradictions & Gaps'}).`,
    });
    setTimeout(() => setAnalysisNotice(null), 5000);
  };

  // 4. Source Management Handlers (2 to 6 sources)
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

  // 5. Reset Workspace Handler
  const handleResetWorkspace = () => {
    if (window.confirm('Reset workspace and clear all current sources?')) {
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
      setAnalysisNotice(null);
      setLastAnalysisResult(null);
    }
  };

  // 6. Primary Action: Validate & Trigger Phase 1 Preparation
  const handleTriggerAnalysis = async () => {
    setIsAnalyzing(true);
    setAnalysisNotice(null);

    const payload = {
      topic,
      category,
      sources,
      openRouterKey: forceOfflineDemo ? '' : openRouterKey,
      model: activeModel,
    };

    try {
      // Step A: Call validation stub
      const valResult = await triggerAnalysisPrep(payload);

      if (valResult.success) {
        // Step B: Save session to Supabase or In-Memory
        const saveResult = await saveResearchSession({
          topic,
          category,
          sources,
          modelUsed: activeModel,
        });

        const sessionId = saveResult.session?.id || saveResult.session?._id || 'local-session';
        const storageLabel = saveResult.storage === 'supabase' ? 'Supabase Live' : 'In-Memory Store';

        setLastAnalysisResult(valResult);
        setAnalysisNotice({
          type: 'success',
          title: 'Phase 1 Inputs Validated & Synchronized',
          message: `${valResult.validation?.totalSources} sources verified (${valResult.validation?.totalCharacters} chars). Saved via ${storageLabel} [${sessionId}]. Ready for Phase 3 deep AI cross-examination.`,
        });
      } else {
        setAnalysisNotice({
          type: 'error',
          title: 'Validation Blocked',
          message: valResult.message || 'Please check your inputs and try again.',
        });
      }
    } catch (err) {
      setAnalysisNotice({
        type: 'error',
        title: 'Execution Error',
        message: err.message || 'Failed to complete Phase 1 validation.',
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 transition-colors duration-200 dark:bg-slate-950 dark:text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white bg-grid-pattern">
      
      {/* Top Navigation Bar with Light/Dark theme toggle */}
      <Navbar
        backendHealth={backendHealth}
        hasOpenRouterKey={Boolean(openRouterKey || backendHealth?.data?.hasServerOpenRouterKey)}
        activeModel={activeModel}
        onOpenKeyModal={() => setIsKeyModalOpen(true)}
        onResetWorkspace={handleResetWorkspace}
        forceOfflineDemo={forceOfflineDemo}
      />

      {/* Main Container */}
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 space-y-6">
        
        {/* Quick-Load Demo Scenarios for Hackathon Judges */}
        <SampleLoader
          scenarios={scenarios}
          onSelectScenario={handleSelectScenario}
          activeScenarioId={activeScenarioId}
        />

        {/* Section 1: Research Question & Decision Goal Input */}
        <TopicInput
          topic={topic}
          onTopicChange={setTopic}
          category={category}
          onCategoryChange={setCategory}
        />

        {/* Section 2: Multi-Source Collector & Card Workspace */}
        <SourceCollector
          sources={sources}
          onAddSource={handleAddSource}
          onUpdateSource={handleUpdateSource}
          onDeleteSource={handleDeleteSource}
        />

        {/* Section 3: Live Validation & Action Footer */}
        <ActionFooter
          topic={topic}
          sources={sources}
          activeModel={activeModel}
          hasOpenRouterKey={Boolean(openRouterKey || backendHealth?.data?.hasServerOpenRouterKey)}
          forceOfflineDemo={forceOfflineDemo}
          isAnalyzing={isAnalyzing}
          onTriggerAnalysis={handleTriggerAnalysis}
          analysisNotice={analysisNotice}
        />

        {/* Section 4: Visual Blueprint of the 5 Expected Output Panels */}
        <DashboardPreview lastAnalysisResult={lastAnalysisResult} />

      </main>

      {/* Footer Info */}
      <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500 transition-colors duration-200 dark:border-slate-900 dark:bg-slate-950 dark:text-slate-400">
        <div className="mx-auto max-w-7xl px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            <strong className="text-slate-700 dark:text-slate-300">GapLens</strong> &bull; AI-Assisted Information Gap Detection Platform
          </div>
          <div>
            Shinchan Online Hackathon 2026 &bull; Problem Statement: <span className="text-indigo-600 dark:text-indigo-400 font-semibold">Digital Dark Spot</span>
          </div>
        </div>
      </footer>

      {/* OpenRouter Free Models & Key Configuration Modal */}
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
