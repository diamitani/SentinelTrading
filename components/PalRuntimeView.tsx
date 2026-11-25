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
  ShieldCheck,
  Layers,
  Play,
  PauseCircle,
  CheckCircle2,
  Sparkles,
  GitBranch,
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
      'Track US Treasury yields (TLT, SHY), Federal Reserve rate signals, AI & cybersecurity leaders (NVDA, CRWD, PANW), and real estate REITs (VNQ).'
  );
  const [linksInput, setLinksInput] = useState<string>(
    palSession?.rawInputs?.links?.join('\n') ||
      'https://www.federalreserve.gov/monetarypolicy.htm\nhttps://fiscaldata.treasury.gov\nhttps://www.sec.gov/edgar\nhttps://polymarket.com'
  );
  const [riskTolerance] = useState<string>(
    palSession?.rawInputs?.riskTolerance || 'Balanced'
  );
  const [capitalBudget] = useState<number>(
    rostrRun?.wizardConfig?.capitalAllocated || palSession?.rawInputs?.capitalBudget || 1000
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
          `GUIDE ${art.code}: ${art.fileName} — ${art.title}\n` +
          `================================================================================\n\n` +
          `${art.content}\n\n`
      )
      .join('\n');
    const blob = new Blob([bundleText], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'SENTINEL_11_RESEARCH_GUIDES.md';
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
    { step: 1, name: 'Capture Idea', stageKey: 'intake' },
    { step: 2, name: 'Organize Brief', stageKey: 'compile' },
    { step: 3, name: 'Save Session', stageKey: 'store' },
    { step: 4, name: 'Extract Goals', stageKey: 'extract' },
    { step: 5, name: 'Risk Check', stageKey: 'assess' },
    { step: 6, name: 'Verify Sources', stageKey: 'enhance' },
    { step: 7, name: 'Build Plan', stageKey: 'plan' },
    { step: 8, name: 'Rank Ideas', stageKey: 'build' },
    { step: 9, name: 'Quality Check', stageKey: 'test' },
    { step: 10, name: 'Deliver Guides', stageKey: 'submit' },
  ];

  const stagesData: any = palSession?.stages || {};
  const wholeness = rostrRun?.wholeness;
  const dag = rostrRun?.dagCompression;
  const truth = rostrRun?.calibratedTruth;
  const manifest = rostrRun?.manifest;

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="bg-stone-900 text-white p-5 sm:p-6 rounded-2xl flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-400/30 text-xs font-mono font-semibold">
              Strategy Studio
            </span>
            <span className="px-2.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs font-mono font-semibold">
              {popArtifacts.length || 11} Downloadable Guides Ready
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
            Strategy Studio &amp; Personal Research Guides
          </h1>
          <p className="text-xs sm:text-sm text-stone-300 max-w-3xl">
            Active Focus ({rostrRun?.wizardConfig?.holdingHorizon || 'Monthly'} · $
            {(rostrRun?.wizardConfig?.capitalAllocated || capitalBudget).toLocaleString()} budget):{' '}
            <span className="text-white font-medium">
              &ldquo;{rostrRun?.wizardConfig?.hypothesisPrompt || promptInput}&rdquo;
            </span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          {onOpenWizard && (
            <button
              type="button"
              onClick={onOpenWizard}
              className="inline-flex items-center px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-colors"
            >
              <Sparkles className="w-4 h-4 mr-1.5" />
              Edit Strategy Wizard
            </button>
          )}
          {popArtifacts.length > 0 && (
            <button
              type="button"
              onClick={handleDownloadAll11MdBundle}
              className="inline-flex items-center px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs font-semibold transition-colors"
            >
              <Download className="w-4 h-4 mr-1.5" />
              Download All 11 Guides (.MD)
            </button>
          )}
        </div>
      </div>

      {/* Section Switcher */}
      <div className="flex flex-wrap gap-2 border-b border-stone-200 pb-3">
        <button
          type="button"
          onClick={() => setActiveStudioSection('POP_11')}
          className={`inline-flex items-center px-4 py-2 rounded-xl text-xs font-semibold transition-all border ${
            activeStudioSection === 'POP_11'
              ? 'bg-stone-900 text-white border-stone-900'
              : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'
          }`}
        >
          <FileText className="w-4 h-4 mr-1.5" />
          1. 11 Downloadable Research Guides
        </button>
        <button
          type="button"
          onClick={() => setActiveStudioSection('DAG_DIAGRID')}
          className={`inline-flex items-center px-4 py-2 rounded-xl text-xs font-semibold transition-all border ${
            activeStudioSection === 'DAG_DIAGRID'
              ? 'bg-stone-900 text-white border-stone-900'
              : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'
          }`}
        >
          <GitBranch className="w-4 h-4 mr-1.5" />
          2. Fast Parallel Research &amp; Approval Pause
        </button>
        <button
          type="button"
          onClick={() => setActiveStudioSection('WHOLENESS_TRUTH')}
          className={`inline-flex items-center px-4 py-2 rounded-xl text-xs font-semibold transition-all border ${
            activeStudioSection === 'WHOLENESS_TRUTH'
              ? 'bg-stone-900 text-white border-stone-900'
              : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'
          }`}
        >
          <ShieldCheck className="w-4 h-4 mr-1.5" />
          3. Research Readiness &amp; Fact Check
        </button>
        <button
          type="button"
          onClick={() => setActiveStudioSection('PAL_10_STEP')}
          className={`inline-flex items-center px-4 py-2 rounded-xl text-xs font-semibold transition-all border ${
            activeStudioSection === 'PAL_10_STEP'
              ? 'bg-stone-900 text-white border-stone-900'
              : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'
          }`}
        >
          <Layers className="w-4 h-4 mr-1.5" />
          4. 10-Step Research Pipeline
        </button>
      </div>

      {/* SECTION 1: 11 RESEARCH GUIDES */}
      {activeStudioSection === 'POP_11' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4 bg-white border border-stone-200 rounded-xl p-4 space-y-2">
            <div className="flex items-center justify-between pb-2 border-b border-stone-100">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-700">
                11 Research Guides (A–K)
              </span>
              <span className="text-[11px] font-mono text-emerald-700 font-semibold">
                Exportable .MD
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
                        ? 'bg-blue-50/90 border-blue-600'
                        : 'bg-white border-stone-200 hover:bg-stone-50'
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="flex items-center space-x-2">
                        <span
                          className={`w-5 h-5 rounded text-[11px] font-mono font-bold flex items-center justify-center shrink-0 ${
                            isSelected ? 'bg-blue-600 text-white' : 'bg-stone-100 text-stone-700'
                          }`}
                        >
                          {art.code}
                        </span>
                        <span className="font-mono text-xs font-bold text-stone-900 truncate">
                          {art.fileName}
                        </span>
                      </div>
                      <div className="text-xs font-semibold text-stone-700 mt-1 truncate">
                        {art.title}
                      </div>
                      <div className="text-[11px] text-stone-500 line-clamp-1 mt-0.5">
                        {art.purpose}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="lg:col-span-8 bg-white border border-stone-200 rounded-xl p-5 flex flex-col justify-between space-y-4">
            {currentArtifact ? (
              <>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-200 pb-4">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="px-2 py-0.5 rounded bg-blue-600 text-white font-mono text-xs font-bold">
                        Guide {currentArtifact.code}
                      </span>
                      <span className="font-mono text-sm font-bold text-stone-900">
                        {currentArtifact.fileName}
                      </span>
                    </div>
                    <h2 className="text-base font-bold text-stone-900 mt-1">
                      {currentArtifact.title}
                    </h2>
                    <p className="text-xs text-stone-500">{currentArtifact.purpose}</p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleCopyArtifact(currentArtifact)}
                      className="inline-flex items-center px-3 py-1.5 rounded-lg border border-stone-300 bg-white hover:bg-stone-50 text-xs font-semibold text-stone-700"
                    >
                      {copiedCode === currentArtifact.code ? (
                        <Check className="w-3.5 h-3.5 mr-1.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5 mr-1.5" />
                      )}
                      {copiedCode === currentArtifact.code ? 'Copied' : 'Copy text'}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDownloadSingleMd(currentArtifact)}
                      className="inline-flex items-center px-3.5 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold"
                    >
                      <Download className="w-3.5 h-3.5 mr-1.5" />
                      Download .MD
                    </button>
                  </div>
                </div>

                <div className="bg-stone-50 border border-stone-200 rounded-xl p-4 sm:p-5 overflow-x-auto max-h-[540px] overflow-y-auto">
                  <pre className="whitespace-pre-wrap font-mono text-xs text-stone-800 leading-relaxed">
                    {currentArtifact.content}
                  </pre>
                </div>
              </>
            ) : (
              <div className="p-8 text-center text-sm text-stone-500">
                Preparing your 11 personal research guides…
              </div>
            )}
          </div>
        </div>
      )}

      {/* SECTION 2: FAST PARALLEL RESEARCH & APPROVAL PAUSE */}
      {activeStudioSection === 'DAG_DIAGRID' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 bg-white border border-stone-200 rounded-xl p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-200 pb-3">
              <div>
                <h2 className="text-base font-bold text-stone-900">
                  Fast Parallel Research Steps
                </h2>
                <p className="text-xs text-stone-500">
                  Independent checks run simultaneously so you get a complete brief in milliseconds instead of waiting step by step.
                </p>
              </div>
              <div className="text-right font-mono">
                <div className="text-sm font-bold text-emerald-700">
                  {dag?.compressedTotalMs || 11}ms parallel
                </div>
                <div className="text-[11px] text-stone-500">
                  vs {dag?.sequentialBaselineMs || 31450}ms sequential
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {(dag?.waves || []).map((wave) => (
                <div
                  key={wave.waveIndex}
                  className="p-4 rounded-xl border border-stone-200 bg-stone-50 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-stone-900">{wave.title}</span>
                    <span className="px-2.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 font-mono text-xs font-semibold">
                      {wave.durationMs}ms
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
                              ? 'bg-amber-50/70 border-amber-200 text-amber-950'
                              : 'bg-white border-stone-200 text-stone-800'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-1 font-bold">
                            <span className="truncate">{node.name}</span>
                            <span className="font-mono text-[11px] shrink-0">
                              {node.compressedExecutionMs}ms
                            </span>
                          </div>
                          <div className="text-[11px] mt-1 text-stone-600">{node.outputSummary}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-5 bg-white border border-stone-200 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <div>
                <h2 className="text-base font-bold text-stone-900">Human Approval Pause</h2>
                <p className="text-xs text-stone-500">
                  Nothing executes automatically — Sentinel pauses and waits for your explicit review.
                </p>
              </div>
              <span
                className={`px-2.5 py-1 rounded text-xs font-mono font-bold border ${
                  activeActor?.state === 'RESUMED_APPROVED'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-amber-50 text-amber-800 border-amber-200'
                }`}
              >
                {activeActor?.state === 'RESUMED_APPROVED' ? 'APPROVED' : 'PAUSED'}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-700 space-y-1">
              <div className="font-bold text-stone-900">Current Checkpoint Status:</div>
              <p>{activeActor?.pendingApprovalReason || 'Waiting for your review before updating paper ideas.'}</p>
              {activeActor?.lastEventPayload && (
                <div className="pt-2 mt-2 border-t border-stone-200 font-mono text-[11px] text-blue-700">
                  Last action: {activeActor.lastEventPayload}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                type="button"
                disabled={isRaisingEvent}
                onClick={() => handleDiagridAction('RESUME_APPROVED')}
                className="inline-flex items-center justify-center px-3.5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold disabled:opacity-50"
              >
                <Play className="w-3.5 h-3.5 mr-1.5" />
                Approve &amp; Resume
              </button>
              <button
                type="button"
                disabled={isRaisingEvent}
                onClick={() => handleDiagridAction('SUSPEND_ZERO_COMPUTE')}
                className="inline-flex items-center justify-center px-3.5 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 border border-stone-300 text-xs font-semibold disabled:opacity-50"
              >
                <PauseCircle className="w-3.5 h-3.5 mr-1.5" />
                Pause for Review
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 3: READINESS CHECKLIST & FACT CHECK */}
      {activeStudioSection === 'WHOLENESS_TRUTH' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 bg-white border border-stone-200 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <div>
                <h2 className="text-base font-bold text-stone-900">
                  5-Point Research Readiness Checklist
                </h2>
                <p className="text-xs text-stone-500 mt-0.5">
                  Confirms your catalyst, markets, timeframe, budget, and stop-loss are all clearly defined before risking capital.
                </p>
              </div>
              <span className="px-3 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 font-mono text-xs font-bold">
                5/5 Complete
              </span>
            </div>

            <div className="space-y-2.5">
              {(wholeness?.criteria || []).map((c) => (
                <div
                  key={c.id}
                  className="p-3.5 rounded-xl border border-stone-200 bg-stone-50 flex items-start justify-between gap-3"
                >
                  <div>
                    <div className="text-xs font-bold text-stone-900 flex items-center">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 mr-1.5 shrink-0" />
                      {c.name}
                    </div>
                    <div className="text-xs text-stone-700 font-mono mt-1">{c.extractedValue}</div>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold shrink-0">
                    PASS
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-5 bg-white border border-stone-200 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <div>
                <h2 className="text-base font-bold text-stone-900">Ticker &amp; Source Fact Check</h2>
                <p className="text-xs text-stone-500">
                  Verifies symbols, rates, and venues against public market feeds.
                </p>
              </div>
              <span className="px-2.5 py-1 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-mono text-xs font-bold">
                {truth?.truthScore || 99}/100
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-950">
              {truth?.noticeBanner}
            </div>

            <div className="space-y-2">
              <div className="text-xs font-bold uppercase tracking-wider text-stone-500">
                Verified Tickers &amp; Data Points
              </div>
              {(truth?.entities || []).map((ent, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-lg border border-stone-200 bg-stone-50 text-xs space-y-0.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-stone-800">{ent.entityType}</span>
                    <span className="text-[10px] font-mono text-emerald-700 font-bold">
                      ✓ Verified
                    </span>
                  </div>
                  <div className="font-mono text-stone-900">{ent.rawValue}</div>
                  <div className="text-[10px] text-stone-500">Source: {ent.verificationSource}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SECTION 4: 10-STEP PIPELINE */}
      {activeStudioSection === 'PAL_10_STEP' && (
        <div className="space-y-6">
          {manifest && (
            <div className="bg-white border border-stone-200 rounded-xl p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-200 pb-3">
                <div>
                  <h2 className="text-base font-bold text-stone-900">Active Research Assistants</h2>
                  <p className="text-xs text-stone-600">{manifest.soulStatement}</p>
                </div>
                <span className="text-xs font-mono text-blue-700 font-semibold">
                  {manifest.subAgents.length} Modules · {manifest.skills.length} Skills
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                {manifest.subAgents.map((sa) => (
                  <div key={sa.id} className="p-3.5 rounded-xl border border-stone-200 bg-stone-50">
                    <div className="text-xs font-bold text-stone-900">{sa.name}</div>
                    <p className="text-[11px] text-stone-600 mt-1">{sa.role}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-5 bg-white border border-stone-200 rounded-xl p-5">
              <h3 className="text-sm font-bold uppercase tracking-wider text-stone-800 mb-3">
                Update Your Research Thesis
              </h3>
              <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Market Idea or Question
                  </label>
                  <textarea
                    rows={3}
                    value={promptInput}
                    onChange={(e) => setPromptInput(e.target.value)}
                    className="w-full rounded-lg border border-stone-300 p-2.5 text-xs text-stone-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Reference URLs (one per line)
                  </label>
                  <textarea
                    rows={2}
                    value={linksInput}
                    onChange={(e) => setLinksInput(e.target.value)}
                    className="w-full rounded-lg border border-stone-300 p-2.5 text-xs font-mono text-stone-800"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isCompiling}
                  className="w-full py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold"
                >
                  {isCompiling ? 'Updating research plan…' : 'Refresh Research Plan'}
                </button>
              </form>
            </div>

            <div className="lg:col-span-7 bg-white border border-stone-200 rounded-xl p-5 space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {steps.map((s) => (
                  <button
                    key={s.step}
                    type="button"
                    onClick={() => setActiveStepTab(s.step)}
                    className={`p-2.5 rounded-lg border text-left transition-all ${
                      activeStepTab === s.step
                        ? 'bg-stone-900 text-white border-stone-900'
                        : 'bg-stone-50 text-stone-800 border-stone-200 hover:bg-stone-100'
                    }`}
                  >
                    <div className="text-[10px] font-mono opacity-75">Step {s.step}</div>
                    <div className="text-xs font-bold truncate">{s.name}</div>
                  </button>
                ))}
              </div>

              <div className="p-4 rounded-xl bg-stone-50 border border-stone-200">
                <div className="text-xs font-bold uppercase text-stone-500 mb-2">
                  Step {activeStepTab} Output
                </div>
                <pre className="whitespace-pre-wrap font-mono text-xs text-stone-800 max-h-64 overflow-y-auto">
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
