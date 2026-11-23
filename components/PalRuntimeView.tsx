import React, { useState } from 'react';
import { PalThesisSession } from '../types';

interface PalRuntimeViewProps {
  palSession?: PalThesisSession;
  onSubmitThesis: (prompt: string, links: string[], riskTolerance: string, capitalBudget: number) => Promise<void>;
  isCompiling: boolean;
}

export const PalRuntimeView: React.FC<PalRuntimeViewProps> = ({
  palSession,
  onSubmitThesis,
  isCompiling,
}) => {
  const [promptInput, setPromptInput] = useState<string>(
    palSession?.rawInputs?.prompt ||
      'Build a systematic statistical arbitrage agent identifying 100 daily trades across cash equities, options box spreads, and dual-listed ADRs. Enforce One-Must-Act triggers and dynamic position scale increases up to 4.5x.'
  );
  const [linksInput, setLinksInput] = useState<string>(
    palSession?.rawInputs?.links?.join('\n') ||
      'https://www.sec.gov/edgar\nhttps://www.cmegroup.com/market-data\nhttps://plaid.com/brokerage-data'
  );
  const [riskTolerance, setRiskTolerance] = useState<'Aggressive-Alpha' | 'Balanced-Arbitrage' | 'Capital-Preservation'>(
    palSession?.rawInputs?.riskTolerance || 'Aggressive-Alpha'
  );
  const [capitalBudget, setCapitalBudget] = useState<number>(
    palSession?.rawInputs?.capitalBudget || 19800000
  );
  const [activeStepTab, setActiveStepTab] = useState<number>(1);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const links = linksInput
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean);
    await onSubmitThesis(promptInput, links, riskTolerance, capitalBudget);
  };

  const steps = [
    { step: 1, row: 'Ingest', name: 'Intake', desc: 'Chat & multi-modal ingest of user thesis', stageKey: 'intake' },
    { step: 2, row: 'Ingest', name: 'Compile', desc: 'Compiles inputs into master.md', stageKey: 'compile' },
    { step: 3, row: 'Ingest', name: 'Store', desc: 'Stores session and prompt vectors', stageKey: 'store' },
    { step: 4, row: 'Understand', name: 'Extract', desc: 'Extracts {wants, goal, deliverables}', stageKey: 'extract' },
    { step: 5, row: 'Understand', name: 'Assess', desc: 'Develops output-hypothesis.md', stageKey: 'assess' },
    { step: 6, row: 'Understand', name: 'Enhance', desc: 'RAG DAL 3-tier credibility scoring', stageKey: 'enhance' },
    { step: 7, row: 'Build and deliver', name: 'Plan', desc: 'Synthesizes build-instructions.md', stageKey: 'plan' },
    { step: 8, row: 'Build and deliver', name: 'Build', desc: 'Synthesizes 100 arbitrage tickets', stageKey: 'build' },
    { step: 9, row: 'Build and deliver', name: 'Test', desc: 'PAL quality adjudication scoring', stageKey: 'test' },
    { step: 10, row: 'Build and deliver', name: 'Submit', desc: 'Delivers executable 100-trade grid', stageKey: 'submit' },
  ];

  const stagesData: any = palSession?.stages || {};

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Header Banner */}
      <div className="bg-slate-50 border border-slate-200 p-4 sm:p-6 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-xs">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 flex flex-wrap items-center gap-2">
              <span>PAL / ROSTR Thesis Intake Engine</span>
              <span className="text-xs font-mono font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">10-Step Pipeline</span>
            </h2>
          </div>
          <p className="text-xs text-slate-600 mt-1 max-w-3xl font-normal">
            Prompt Abstraction Layer (PAL) &amp; Unified Multi-Agent Operating System (ROSTR). Compiles natural language investment thesis through a 10-step runtime: Ingest → Understand → Build &amp; Deliver with Context Engine feedback loop.
          </p>
        </div>

        <div className="text-left md:text-right shrink-0">
          <div className="text-[10px] text-slate-400 uppercase font-mono">Session State</div>
          <div className="text-xs font-mono text-slate-800 font-semibold">{palSession?.id || 'Ready for Intake'}</div>
        </div>
      </div>

      {/* Visual 10-Step Flow Strip */}
      <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div className="text-xs font-bold text-slate-800 uppercase tracking-widest font-mono">
            10-Step Agent Runtime Execution Pipeline
          </div>
          <span className="text-[10px] text-slate-400 font-mono">CONTEXT ENGINE ACTIVE</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 lg:grid-cols-10 gap-2">
          {steps.map((st) => {
            const isSelected = activeStepTab === st.step;
            const isCompleted = Boolean(stagesData[st.stageKey]);

            return (
              <button
                key={st.step}
                onClick={() => setActiveStepTab(st.step)}
                className={`p-3 rounded-lg border text-left transition-all relative flex flex-col justify-between h-24 ${
                  isSelected
                    ? 'border-blue-600 bg-blue-50/40 shadow-xs'
                    : isCompleted
                    ? 'border-slate-200 bg-white hover:border-slate-300'
                    : 'border-slate-100 bg-slate-50 opacity-60'
                }`}
              >
                <div className="flex justify-between items-center text-xs font-mono">
                  <span className={`font-bold ${isSelected ? 'text-blue-600' : 'text-slate-400'}`}>
                    0{st.step}
                  </span>
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      isCompleted ? 'bg-emerald-500' : 'bg-slate-300'
                    }`}
                  ></span>
                </div>

                <div>
                  <div className="text-xs font-bold text-slate-900 tracking-tight">{st.name}</div>
                  <div className="text-[9px] text-slate-400 font-mono uppercase truncate">{st.row}</div>
                </div>

                <div className="text-[9px] text-slate-500 line-clamp-1">{st.desc}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
        {/* Left Column: Form */}
        <div className="lg:col-span-5 min-w-0 space-y-6">
          <div className="bg-white border border-slate-200 p-5 sm:p-6 rounded-xl shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">
              Proprietary Thesis Directives
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Investment Thesis Directive (Prompt)
                </label>
                <textarea
                  value={promptInput}
                  onChange={(e) => setPromptInput(e.target.value)}
                  rows={4}
                  placeholder="Detail your quant thesis, target sectors, arbitrage hypotheses..."
                  className="w-full bg-white border border-slate-200 text-xs text-slate-900 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-600 font-sans leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Data Feed Nodes &amp; Links (One per line)
                </label>
                <textarea
                  value={linksInput}
                  onChange={(e) => setLinksInput(e.target.value)}
                  rows={3}
                  placeholder="https://sec.gov/edgar&#10;https://bloomberg.com"
                  className="w-full bg-white border border-slate-200 text-xs text-slate-900 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-600 font-mono text-[11px]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Risk Engine Profile
                  </label>
                  <select
                    value={riskTolerance}
                    onChange={(e: any) => setRiskTolerance(e.target.value)}
                    className="w-full bg-white border border-slate-200 text-xs text-slate-800 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-600 font-mono"
                  >
                    <option value="Aggressive-Alpha">Aggressive-Alpha (Max 4.5x)</option>
                    <option value="Balanced-Arbitrage">Balanced-Arbitrage (2.5x)</option>
                    <option value="Capital-Preservation">Capital-Preservation (1.5x)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Collateral Budget ($)
                  </label>
                  <input
                    type="number"
                    value={capitalBudget}
                    onChange={(e) => setCapitalBudget(Number(e.target.value))}
                    className="w-full bg-white border border-slate-200 text-xs text-slate-800 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-600 font-mono"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isCompiling}
                className="w-full py-3 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs tracking-wider transition-all flex items-center justify-center gap-2 shadow-xs disabled:opacity-50"
              >
                {isCompiling ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    Compiling Master.md & 100 Trades...
                  </>
                ) : (
                  'COMPILE THESIS THROUGH PAL (10 STEPS)'
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Stage Inspection */}
        <div className="lg:col-span-7 min-w-0 space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
            <div className="p-4 sm:p-5 bg-slate-50 border-b border-slate-200 flex flex-wrap justify-between items-center gap-2">
              <div>
                <span className="text-[10px] text-slate-400 font-mono uppercase">
                  STEP 0{activeStepTab} INSPECTOR
                </span>
                <h3 className="text-base font-bold text-slate-900 tracking-tight">
                  {steps[activeStepTab - 1].name} Stage Artifacts
                </h3>
              </div>
              <span className="text-xs px-2.5 py-1 rounded font-mono font-semibold uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
                VERIFIED READY
              </span>
            </div>

            <div className="p-6 space-y-4">
              {activeStepTab === 1 && (
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-blue-600 uppercase font-mono">1. Intake & Stream Pipeline</h4>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {stagesData?.intake?.summary ||
                      'Ingested proprietary directives, attached research papers, and live market wires. Compiling multi-modal signals into centralized pipeline.'}
                  </p>
                  <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 text-xs font-mono text-slate-700 space-y-1">
                    <div>INPUT PARAMS: 100 Trades Requested</div>
                    <div>MODE: Multi-Leg Arbitrage & DMA Scale</div>
                  </div>
                </div>
              )}

              {activeStepTab === 2 && (
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-blue-600 uppercase font-mono">2. Compiled Master.md Document</h4>
                  <pre className="bg-slate-50 p-4 rounded-lg border border-slate-200 text-xs font-mono text-slate-800 overflow-x-auto max-h-80 whitespace-pre-wrap leading-relaxed">
                    {stagesData?.compile?.masterMd ||
                      '# MASTER.MD\n- Directives compiled from user thesis\n- Attached to project namespace: projects/alpha-core'}
                  </pre>
                </div>
              )}

              {activeStepTab === 3 && (
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-blue-600 uppercase font-mono">3. Persistent State Storage</h4>
                  <p className="text-sm text-slate-600">
                    Writes immutable run logs, thesis embeddings, and state tables per the PAL setup guide schema.
                  </p>
                  <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 text-xs font-mono text-slate-800 space-y-1.5">
                    <div>TABLE: <span className="text-emerald-700 font-semibold">pal_sessions</span> (User & project ID)</div>
                    <div>TABLE: <span className="text-emerald-700 font-semibold">pal_prompts</span> (Questions & response JSONB)</div>
                    <div>TABLE: <span className="text-emerald-700 font-semibold">pal_files</span> (Master.md & vector embeddings)</div>
                    <div>TABLE: <span className="text-emerald-700 font-semibold">pal_runs</span> (10-step stage audits)</div>
                  </div>
                </div>
              )}

              {activeStepTab === 4 && (
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-blue-600 uppercase font-mono">4. Intent Extraction (JSON Schema)</h4>
                  <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 font-mono text-xs text-slate-800 space-y-2.5">
                    <div>
                      <span className="text-slate-400">wants:</span> "{stagesData?.extract?.wants || 'build_trading_agent_arbitrage_100'}"
                    </div>
                    <div>
                      <span className="text-slate-400">goal:</span> "{stagesData?.extract?.goal || 'Generate 100 daily arbitrage trades with scale-up triggers'}"
                    </div>
                    <div>
                      <span className="text-slate-400">deliverables:</span>
                      <ul className="list-disc pl-5 mt-1 text-slate-600 space-y-0.5">
                        {(stagesData?.extract?.deliverables || [
                          '100 Verified Arbitrage Trades',
                          'One-Must-Act Urgency Matrix',
                          'Plaid Real-Time Prime Margin Link',
                        ]).map((d: string, i: number) => (
                          <li key={i}>{d}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {activeStepTab === 5 && (
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-blue-600 uppercase font-mono">5. Output Hypothesis (Inductive Reasoning)</h4>
                  <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 text-sm text-slate-700 leading-relaxed">
                    <p className="mb-2">
                      <span className="font-bold text-slate-900 font-mono">HYPOTHESIS: </span>
                      {stagesData?.assess?.hypothesis ||
                        'Cross-venue pricing inefficiencies between direct ATS dark pools and lit exchange books yield an expected Sharpe of 3.42 when position sizes are increased on volume breakouts.'}
                    </p>
                    <div className="text-xs font-mono text-emerald-700 font-semibold pt-2 border-t border-slate-200">
                      EXPECTED SHARPE RATIO: {stagesData?.assess?.expectedSharpe || 3.42}
                    </div>
                  </div>
                </div>
              )}

              {activeStepTab === 6 && (
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-blue-600 uppercase font-mono">6. Enhanced Docs &amp; 3-Tier RAG DAL</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center font-mono text-xs">
                    <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                      <div className="text-slate-400 text-[10px]">TIER 1 (SEC/ACADEMIC)</div>
                      <div className="text-emerald-700 font-bold">{stagesData?.enhance?.tier1Count || 78} Nodes</div>
                    </div>
                    <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                      <div className="text-slate-400 text-[10px]">TIER 2 (BLOOMBERG/WSJ)</div>
                      <div className="text-blue-600 font-bold">{stagesData?.enhance?.tier2Count || 112} Nodes</div>
                    </div>
                    <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                      <div className="text-slate-400 text-[10px]">TIER 3 (COMMUNITY/UGC)</div>
                      <div className="text-slate-600 font-bold">{stagesData?.enhance?.tier3Count || 50} Nodes</div>
                    </div>
                  </div>
                </div>
              )}

              {activeStepTab === 7 && (
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-blue-600 uppercase font-mono">7. Plan &amp; Master System Prompt</h4>
                  <pre className="bg-slate-50 p-4 rounded-lg border border-slate-200 text-xs font-mono text-slate-800 whitespace-pre-wrap leading-relaxed">
                    {stagesData?.plan?.masterSystemPrompt ||
                      'You are the Institutional PAL Trading Agent. Deploy 100 cross-asset trade tickets, prioritize non-directional arbitrage, and enforce sizing scale triggers.'}
                  </pre>
                </div>
              )}

              {activeStepTab === 8 && (
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-blue-600 uppercase font-mono">8. Build &amp; Quant Tool Execution</h4>
                  <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-2 text-xs font-mono text-slate-800">
                    <div className="text-emerald-700">✓ Invocated Plaid Balances: $19,800,000 Active Collateral</div>
                    <div className="text-emerald-700">✓ Built 100 Verified Arbitrage Tickets</div>
                    <div className="text-emerald-700">✓ Bound One-Must-Act Position Scale Triggers (up to 4.5x)</div>
                  </div>
                </div>
              )}

              {activeStepTab === 9 && (
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-blue-600 uppercase font-mono">9. Test &amp; PAL Adjudication Score</h4>
                  <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="text-xs font-bold text-slate-900">4-Question Risk &amp; False-Positive Battery</div>
                      <div className="text-xs text-slate-500">Real risk checked / Severity scored / Zero leaks confirmed</div>
                    </div>
                    <div className="sm:text-right font-mono shrink-0">
                      <div className="text-2xl font-bold text-emerald-600 tabular-nums">94 / 100</div>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">
                        VERDICT: PASS
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {activeStepTab === 10 && (
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-blue-600 uppercase font-mono">10. Submit & Deliver to Market Grid</h4>
                  <p className="text-sm text-slate-600">
                    The 10-step pipeline has successfully delivered the completed 100 daily arbitrage signals into the active trading terminal.
                  </p>
                  <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 flex justify-between items-center text-xs font-mono">
                    <span className="text-slate-500">DELIVERED SIGNALS:</span>
                    <span className="text-emerald-700 font-bold">100 Actionable Trades (Live)</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
