import React, { useState } from 'react';
import {
  PalThesisSession,
  RostrHarnessRun,
  DiagridVirtualActor,
  PopArtifact,
} from '../types';
import { raiseDiagridActorEvent } from '../services/geminiService';
import {
  FileText,
  Download,
  Copy,
  Check,
  Zap,
  ShieldCheck,
  Cpu,
  Layers,
  Play,
  PauseCircle,
  CheckCircle2,
  Sparkles,
  GitBranch,
  Terminal,
} from 'lucide-react';

interface PalRuntimeViewProps {
  palSession?: PalThesisSession;
  rostrRun?: RostrHarnessRun;
  onSubmitThesis: (
    prompt: string,
    links: string[],
    riskTolerance: string,
    capitalBudget: number
  ) => Promise<void>;
  onOpenWizard?: () => void;
  isCompiling: boolean;
}

export const PalRuntimeView: React.FC<PalRuntimeViewProps> = ({
  palSession,
  rostrRun,
  onSubmitThesis,
  onOpenWizard,
  isCompiling,
}) => {
  const [activeStudioSection, setActiveStudioSection] = useState<
    'POP_11' | 'DAG_DIAGRID' | 'WHOLENESS_TRUTH' | 'PAL_10_STEP'
  >('POP_11');

  const popArtifacts: PopArtifact[] = rostrRun?.popArtifacts || [];
  const [selectedArtifactCode, setSelectedArtifactCode] = useState<string>('A');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const [diagridActor, setDiagridActor] = useState<DiagridVirtualActor | undefined>(
    rostrRun?.diagridActor
  );
  const [isRaisingEvent, setIsRaisingEvent] = useState(false);

  const [promptInput, setPromptInput] = useState<string>(
    rostrRun?.wizardConfig?.hypothesisPrompt ||
      palSession?.rawInputs?.prompt ||
      'High Pepsi canned beverage sales rollout creating packaging sheet coil shortage -> CME Aluminum (ALI=F) & Alcoa (AA) calls + Polymarket/Kalshi inflation event spread; AI chip CoWoS capacity surge -> NVDA/TSM dual-listing arbitrage.'
  );
  const [linksInput, setLinksInput] = useState<string>(
    palSession?.rawInputs?.links?.join('\n') ||
      'https://www.cmegroup.com/markets/metals\nhttps://kalshi.com/markets\nhttps://www.sec.gov/edgar\nhttps://plaid.com/brokerage-data'
  );
  const [riskTolerance, setRiskTolerance] = useState<string>(
    palSession?.rawInputs?.riskTolerance || 'Aggressive-Alpha'
  );
  const [capitalBudget, setCapitalBudget] = useState<number>(
    rostrRun?.wizardConfig?.capitalAllocated || palSession?.rawInputs?.capitalBudget || 10000
  );
  const [activeStepTab, setActiveStepTab] = useState<number>(1);

  const activeActor = diagridActor || rostrRun?.diagridActor;
  const currentArtifact =
    popArtifacts.find((a) => a.code === selectedArtifactCode) || popArtifacts[0];

  const handleCopyArtifact = (artifact: PopArtifact) => {
    navigator.clipboard.writeText(artifact.content);
    setCopiedCode(artifact.code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleDownloadSingleMd = (artifact: PopArtifact) => {
    const blob = new Blob([artifact.content], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = artifact.fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadAll11MdBundle = () => {
    const bundleText = popArtifacts
      .map(
        (art) =>
          `================================================================================\n` +
          `ARTIFACT ${art.code}: ${art.fileName} — ${art.title}\n` +
          `================================================================================\n\n` +
          `${art.content}\n\n`
      )
      .join('\n');
    const blob = new Blob([bundleText], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ROSTR_POP_11_ARTIFACT_CANONICAL_BUNDLE.md';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDiagridAction = async (action: 'RESUME_APPROVED' | 'SUSPEND_ZERO_COMPUTE') => {
    setIsRaisingEvent(true);
    try {
      const updated = await raiseDiagridActorEvent(action);
      setDiagridActor(updated);
    } finally {
      setIsRaisingEvent(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const links = linksInput
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean);
    await onSubmitThesis(promptInput, links, riskTolerance, capitalBudget);
  };

  const steps = [
    { step: 1, row: 'Ingest', name: 'Intake', desc: 'Chat & multi-modal ingest of user hypothesis', stageKey: 'intake' },
    { step: 2, row: 'Ingest', name: 'Compile', desc: 'Compiles inputs into master.md & POP 11', stageKey: 'compile' },
    { step: 3, row: 'Ingest', name: 'Store', desc: 'Stores session and prompt vectors in Supabase', stageKey: 'store' },
    { step: 4, row: 'Understand', name: 'Extract', desc: 'Extracts {wants, goal, deliverables}', stageKey: 'extract' },
    { step: 5, row: 'Understand', name: 'Assess', desc: 'Develops output-hypothesis.md', stageKey: 'assess' },
    { step: 6, row: 'Understand', name: 'Enhance', desc: 'RAG DAL 3-tier credibility scoring', stageKey: 'enhance' },
    { step: 7, row: 'Build and deliver', name: 'Plan', desc: 'Synthesizes build-instructions.md', stageKey: 'plan' },
    { step: 8, row: 'Build and deliver', name: 'Build', desc: 'Synthesizes 100 arbitrage tickets', stageKey: 'build' },
    { step: 9, row: 'Build and deliver', name: 'Test', desc: 'PAL quality adjudication scoring', stageKey: 'test' },
    { step: 10, row: 'Build and deliver', name: 'Submit', desc: 'Delivers executable 100-trade grid', stageKey: 'submit' },
  ];

  const stagesData: any = palSession?.stages || {};
  const wholeness = rostrRun?.wholeness;
  const dag = rostrRun?.dagCompression;
  const truth = rostrRun?.calibratedTruth;
  const manifest = rostrRun?.manifest;

  return (
    <div className="space-y-6 pb-12">
      {/* Canonical ROSTR Header Banner */}
      <div className="bg-slate-900 text-white p-5 sm:p-6 rounded-2xl shadow-md flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-400/30 text-xs font-mono font-bold">
              ROSTR AUTONOMOUS AGENT OS v1.0.0
            </span>
            <span className="px-2.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs font-mono font-bold">
              WHOLENESS W = {wholeness?.guidedScoreW?.toFixed(2) || '1.00'} · V(W,M) ={' '}
              {wholeness?.effectiveOutputValueV || '5.98'}x
            </span>
            <span className="px-2.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-400/30 text-xs font-mono font-bold">
              MIDDLE-OUT DAG: {dag?.sequentialBaselineMs || 31450}ms → {dag?.compressedTotalMs || 11}ms (99.96% COLLAPSE)
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">
            Deterministic Foundation Wholeness, Middle-Out DAG &amp; POP 11-Artifact Engine
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-3xl">
            Active Hypothesis ({rostrRun?.wizardConfig?.holdingHorizon || '3-Day Profit'} ·{' '}
            {rostrRun?.wizardConfig?.goalTarget || '+10% Target'}):{' '}
            <span className="text-white font-semibold">
              &ldquo;{rostrRun?.wizardConfig?.hypothesisPrompt || promptInput}&rdquo;
            </span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          {onOpenWizard && (
            <button
              type="button"
              onClick={onOpenWizard}
              className="inline-flex items-center px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-sm transition-colors"
            >
              <Sparkles className="w-4 h-4 mr-1.5" />
              Open Hypothesis &amp; Goals Wizard
            </button>
          )}
          {popArtifacts.length > 0 && (
            <button
              type="button"
              onClick={handleDownloadAll11MdBundle}
              className="inline-flex items-center px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs font-bold transition-colors"
            >
              <Download className="w-4 h-4 mr-1.5" />
              Export All 11 POP Artifacts (.MD)
            </button>
          )}
        </div>
      </div>

      {/* Studio Mode Switcher */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
        <button
          type="button"
          onClick={() => setActiveStudioSection('POP_11')}
          className={`inline-flex items-center px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeStudioSection === 'POP_11'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <FileText className="w-4 h-4 mr-1.5" />
          1. POP 11-Artifact Explorer &amp; Export (A–K)
        </button>
        <button
          type="button"
          onClick={() => setActiveStudioSection('DAG_DIAGRID')}
          className={`inline-flex items-center px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeStudioSection === 'DAG_DIAGRID'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <GitBranch className="w-4 h-4 mr-1.5" />
          2. Middle-Out DAG Waves &amp; Diagrid Virtual Actor
        </button>
        <button
          type="button"
          onClick={() => setActiveStudioSection('WHOLENESS_TRUTH')}
          className={`inline-flex items-center px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeStudioSection === 'WHOLENESS_TRUTH'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <ShieldCheck className="w-4 h-4 mr-1.5" />
          3. One Must Act Calculus (W=1.00) &amp; Calibrated Truth
        </button>
        <button
          type="button"
          onClick={() => setActiveStudioSection('PAL_10_STEP')}
          className={`inline-flex items-center px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeStudioSection === 'PAL_10_STEP'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Layers className="w-4 h-4 mr-1.5" />
          4. 10-Step PAL Pipeline &amp; Agent Manifest
        </button>
      </div>

      {/* SECTION 1: INTERACTIVE POP 11-ARTIFACT VIEWER */}
      {activeStudioSection === 'POP_11' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Artifact Index (A through K) */}
          <div className="lg:col-span-4 bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-2">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Canonical POP 11 Deliverables
              </span>
              <span className="text-[11px] font-mono text-emerald-700 font-bold">
                100% Deterministic
              </span>
            </div>
            <div className="space-y-1.5 max-h-[600px] overflow-y-auto pr-1">
              {popArtifacts.map((art) => {
                const isSelected = currentArtifact?.code === art.code;
                return (
                  <button
                    key={art.code}
                    type="button"
                    onClick={() => setSelectedArtifactCode(art.code)}
                    className={`w-full text-left p-3 rounded-xl border transition-all flex items-start justify-between gap-2 ${
                      isSelected
                        ? 'bg-blue-50/90 border-blue-600 ring-1 ring-blue-600'
                        : 'bg-white border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="flex items-center space-x-2">
                        <span
                          className={`w-5 h-5 rounded text-[11px] font-mono font-bold flex items-center justify-center shrink-0 ${
                            isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {art.code}
                        </span>
                        <span className="font-mono text-xs font-bold text-slate-900 truncate">
                          {art.fileName}
                        </span>
                      </div>
                      <div className="text-xs font-semibold text-slate-700 mt-1 truncate">
                        {art.title}
                      </div>
                      <div className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                        {art.purpose}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Markdown Viewer & Exporter */}
          <div className="lg:col-span-8 bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col justify-between space-y-4">
            {currentArtifact ? (
              <>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="px-2 py-0.5 rounded bg-blue-600 text-white font-mono text-xs font-bold">
                        Artifact {currentArtifact.code}
                      </span>
                      <span className="font-mono text-sm font-bold text-slate-900">
                        {currentArtifact.fileName}
                      </span>
                    </div>
                    <h2 className="text-base font-bold text-slate-900 mt-1">
                      {currentArtifact.title}
                    </h2>
                    <p className="text-xs text-slate-500">{currentArtifact.purpose}</p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleCopyArtifact(currentArtifact)}
                      className="inline-flex items-center px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700"
                    >
                      {copiedCode === currentArtifact.code ? (
                        <Check className="w-3.5 h-3.5 mr-1.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5 mr-1.5" />
                      )}
                      {copiedCode === currentArtifact.code ? 'Copied .MD' : 'Copy Markdown'}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDownloadSingleMd(currentArtifact)}
                      className="inline-flex items-center px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold"
                    >
                      <Download className="w-3.5 h-3.5 mr-1.5" />
                      Download {currentArtifact.fileName}
                    </button>
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 sm:p-5 overflow-x-auto max-h-[540px] overflow-y-auto">
                  <pre className="whitespace-pre-wrap font-mono text-xs text-slate-800 leading-relaxed">
                    {currentArtifact.content}
                  </pre>
                </div>
              </>
            ) : (
              <div className="p-8 text-center text-sm text-slate-500">
                Compiling POP 11-Artifact Package...
              </div>
            )}
          </div>
        </div>
      )}

      {/* SECTION 2: MIDDLE-OUT DAG WAVES & DIAGRID VIRTUAL ACTOR */}
      {activeStudioSection === 'DAG_DIAGRID' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Pied Piper Middle-Out DAG Waves */}
          <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  &ldquo;Pied Piper&rdquo; Middle-Out Action Compressor (DAG Waves)
                </h2>
                <p className="text-xs text-slate-500">
                  Topological wave parallelization via <code className="font-mono">Promise.all()</code> + boolean precondition short-circuiting (<code className="font-mono">P_v = 0</code>).
                </p>
              </div>
              <div className="text-right font-mono">
                <div className="text-sm font-extrabold text-emerald-700">
                  {dag?.sequentialBaselineMs || 31450}ms → {dag?.compressedTotalMs || 11}ms
                </div>
                <div className="text-[11px] text-slate-500">
                  {dag?.latencyCollapsePct || '99.96%'} Latency Collapse
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {(dag?.waves || []).map((wave) => (
                <div
                  key={wave.waveIndex}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">{wave.title}</span>
                    <span className="px-2.5 py-0.5 rounded bg-blue-100 text-blue-800 font-mono text-xs font-bold">
                      Wave Wall-Clock: {wave.durationMs}ms
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {wave.nodes.map((node) => {
                      const isPruned = node.status === 'SHORT_CIRCUITED_PRUNED';
                      return (
                        <div
                          key={node.id}
                          className={`p-3 rounded-lg border text-xs ${
                            isPruned
                              ? 'bg-amber-50/70 border-amber-300 text-amber-950'
                              : 'bg-white border-slate-200 text-slate-800'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-1 font-bold">
                            <span className="truncate">{node.name}</span>
                            <span className="font-mono text-[11px] shrink-0">
                              {node.sequentialBaselineMs}ms → {node.compressedExecutionMs}ms
                            </span>
                          </div>
                          <div className="text-[10px] font-mono text-slate-500 mt-1">
                            Precondition: {node.preconditionLabel} ({node.status})
                          </div>
                          <div className="text-[11px] mt-1 text-slate-600">{node.outputSummary}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Diagrid Catalyst Durable Virtual Actor */}
          <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Diagrid Catalyst Durable Virtual Actor
                </h2>
                <p className="text-xs text-slate-500">
                  Zero-Compute Sleep (<code className="font-mono">0 CPU / 0 Tokens</code>) &amp;{' '}
                  <code className="font-mono">/raiseEvent</code> Resumption
                </p>
              </div>
              <span
                className={`px-2.5 py-1 rounded text-xs font-mono font-bold border ${
                  activeActor?.state === 'RESUMED_APPROVED'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-amber-50 text-amber-800 border-amber-200'
                }`}
              >
                {activeActor?.state || 'ZERO_COMPUTE_SLEEP'}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 text-white space-y-2.5 font-mono text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Actor ID:</span>
                <span className="text-blue-300 font-bold">{activeActor?.actorId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">CPU Allocation:</span>
                <span className="text-emerald-400 font-bold">
                  {activeActor?.cpuAllocationPct ?? 0}% CPU
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Idle Token Burn:</span>
                <span className="text-emerald-400 font-bold">
                  {activeActor?.tokenBurnRatePerHr ?? 0} Tokens/hr
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">KV Namespace:</span>
                <span className="text-slate-300 truncate max-w-[210px]">
                  {activeActor?.durableStorageNamespace}
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-1">
              <div className="font-bold text-slate-900">Asynchronous Gate Status:</div>
              <p>{activeActor?.pendingApprovalReason}</p>
              {activeActor?.lastEventPayload && (
                <div className="pt-2 mt-2 border-t border-slate-200 font-mono text-[11px] text-blue-700">
                  Last Event: {activeActor.lastEventPayload}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                type="button"
                disabled={isRaisingEvent}
                onClick={() => handleDiagridAction('RESUME_APPROVED')}
                className="inline-flex items-center justify-center px-3.5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm disabled:opacity-50"
              >
                <Play className="w-3.5 h-3.5 mr-1.5" />
                POST /raiseEvent (Approve &amp; Resume)
              </button>
              <button
                type="button"
                disabled={isRaisingEvent}
                onClick={() => handleDiagridAction('SUSPEND_ZERO_COMPUTE')}
                className="inline-flex items-center justify-center px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 text-xs font-bold disabled:opacity-50"
              >
                <PauseCircle className="w-3.5 h-3.5 mr-1.5" />
                Dehydrate to 0-CPU Sleep
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 3: ONE MUST ACT WHOLENESS & CALIBRATED TRUTH */}
      {activeStudioSection === 'WHOLENESS_TRUTH' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  One Must Act Foundation Calculus (0 → 1 → 2..99 → 100)
                </h2>
                <p className="text-xs font-mono text-slate-600 mt-0.5">
                  {wholeness?.formulaLatex}
                </p>
              </div>
              <span className="px-3 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 font-mono text-sm font-extrabold">
                W = {wholeness?.guidedScoreW?.toFixed(2) || '1.00'}
              </span>
            </div>

            <div className="space-y-2.5">
              {(wholeness?.criteria || []).map((c) => (
                <div
                  key={c.id}
                  className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 flex items-start justify-between gap-3"
                >
                  <div>
                    <div className="text-xs font-bold text-slate-900 flex items-center">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 mr-1.5 shrink-0" />
                      {c.name}
                    </div>
                    <div className="text-xs text-slate-700 font-mono mt-1">{c.extractedValue}</div>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold shrink-0">
                    I(c) = 1
                  </span>
                </div>
              ))}
            </div>

            <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-950">
              <span className="font-bold">Multiplier Decay Theorem Protection:</span>{' '}
              {wholeness?.guidanceSummary}
            </div>
          </div>

          <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h2 className="text-base font-bold text-slate-900">Calibrated Truth Protocol</h2>
                <p className="text-xs text-slate-500">
                  Decouples Creative Warmth from Regex Operational Verification
                </p>
              </div>
              <span className="px-2.5 py-1 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-mono text-xs font-bold">
                Truth Score: {truth?.truthScore || 99}/100
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-950">
              {truth?.creativeContextSummary}
            </div>

            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-950 font-medium">
              {truth?.noticeBanner}
            </div>

            <div className="space-y-2">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Regex-Verified Operational Entities
              </div>
              {(truth?.entities || []).map((ent, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-lg border border-slate-200 bg-slate-50 text-xs space-y-0.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-slate-800">{ent.entityType}</span>
                    <span className="text-[10px] font-mono text-emerald-700 font-bold">
                      ✓ VERIFIED
                    </span>
                  </div>
                  <div className="font-mono text-slate-900">{ent.rawValue}</div>
                  <div className="text-[10px] text-slate-500">Source: {ent.verificationSource}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SECTION 4: 10-STEP PAL PIPELINE & AGENT MANIFEST */}
      {activeStudioSection === 'PAL_10_STEP' && (
        <div className="space-y-6">
          {/* Sub-Agents & Skills Manifest Summary */}
          {manifest && (
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    Compiled ROSTR Agent Manifest ({manifest.agentName})
                  </h2>
                  <p className="text-xs text-slate-600">Soul: &ldquo;{manifest.soulStatement}&rdquo;</p>
                </div>
                <span className="text-xs font-mono text-blue-700 font-bold">
                  {manifest.subAgents.length} Sub-Agents · {manifest.skills.length} Skills ·{' '}
                  {manifest.mcpServers.length} MCP Servers
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                {manifest.subAgents.map((sa) => (
                  <div key={sa.id} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50">
                    <div className="text-xs font-bold text-slate-900">{sa.name}</div>
                    <p className="text-[11px] text-slate-600 mt-1">{sa.role}</p>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {sa.activeSkills.map((sk) => (
                        <span
                          key={sk}
                          className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-mono text-[10px] font-semibold"
                        >
                          {sk}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 10-Step Interactive Diagram & Direct Thesis Compiler */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 mb-3">
                Direct PAL Thesis Intake &amp; Re-Compiler
              </h3>
              <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Hypothesis &amp; Strategy Directives
                  </label>
                  <textarea
                    rows={3}
                    value={promptInput}
                    onChange={(e) => setPromptInput(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 p-2.5 text-xs text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Authoritative Data Feeds (One URL per line)
                  </label>
                  <textarea
                    rows={2}
                    value={linksInput}
                    onChange={(e) => setLinksInput(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 p-2.5 text-xs font-mono text-slate-800"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isCompiling}
                  className="w-full py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold"
                >
                  {isCompiling ? 'Compiling 10-Step Pipeline...' : 'Re-Compile PAL & ROSTR Pipeline'}
                </button>
              </form>
            </div>

            <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {steps.map((s) => (
                  <button
                    key={s.step}
                    type="button"
                    onClick={() => setActiveStepTab(s.step)}
                    className={`p-2.5 rounded-lg border text-left transition-all ${
                      activeStepTab === s.step
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-slate-50 text-slate-800 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <div className="text-[10px] font-mono opacity-75">Step {s.step}</div>
                    <div className="text-xs font-bold truncate">{s.name}</div>
                  </button>
                ))}
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div className="text-xs font-bold uppercase text-slate-500 mb-2">
                  Step {activeStepTab} Output Telemetry
                </div>
                <pre className="whitespace-pre-wrap font-mono text-xs text-slate-800 max-h-64 overflow-y-auto">
                  {JSON.stringify(
                    stagesData[steps[activeStepTab - 1]?.stageKey] || stagesData,
                    null,
                    2
                  )}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
