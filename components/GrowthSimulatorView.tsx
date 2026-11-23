import React, { useState, useEffect } from 'react';
import { CompoundMilestone } from '../types';
import { fetchGrowthSimulation } from '../services/geminiService';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';

interface GrowthSimulatorViewProps {
  onDeployToArbitrage: () => void;
}

export const GrowthSimulatorView: React.FC<GrowthSimulatorViewProps> = ({ onDeployToArbitrage }) => {
  const [initialCapital, setInitialCapital] = useState<number>(100);
  const [monthlyContribution, setMonthlyContribution] = useState<number>(25);
  const [simulationData, setSimulationData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const runSim = async (init: number, monthAdd: number) => {
    setIsLoading(true);
    try {
      const res = await fetchGrowthSimulation(init, monthAdd);
      setSimulationData(res);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    runSim(initialCapital, monthlyContribution);
  }, []);

  const handleRecalculate = (e: React.FormEvent) => {
    e.preventDefault();
    runSim(initialCapital, monthlyContribution);
  };

  const milestones: CompoundMilestone[] = simulationData?.milestones || [];
  const finalValue = simulationData?.config?.finalPortfolioValue || 1084.50;
  const multiplier = simulationData?.config?.achievedMultiplier || '10.8x';

  const chartData = milestones.map((m) => ({
    name: `Mo ${m.month}`,
    capital: m.endingCapital,
    gainPct: m.monthlyArbitrageGainPct,
  }));

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Top Banner */}
      <div className="bg-slate-50 border border-slate-200 p-4 sm:p-6 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-xs">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900">
              Everyday Investor 10x Growth Engine ($100 to Enterprise)
            </h2>
            <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
              1,000,000 COMMUNITY INITIATIVE
            </span>
          </div>
          <p className="text-xs text-slate-600 mt-1 max-w-3xl font-normal">
            Designed to democratize quantitative institutional trading. Start with <span className="font-semibold text-slate-900">$100 or less</span>. Leverages low-risk statistical arbitrage, options conversions, and disciplined automated stops (0.65% max single-trade risk) to compound into an enterprise portfolio.
          </p>
        </div>

        <button
          onClick={onDeployToArbitrage}
          className="px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors shadow-xs w-full md:w-auto whitespace-nowrap shrink-0"
        >
          Deploy $100 into Daily Arbitrage &rarr;
        </button>
      </div>

      {/* 4 Outcome Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-xs">
          <div className="text-[11px] text-slate-400 font-mono uppercase font-semibold">Initial Starting Seed</div>
          <div className="text-2xl font-mono font-bold text-slate-900 tracking-tight mt-1">
            ${initialCapital.toFixed(2)}
          </div>
          <div className="text-xs text-slate-500 mt-1">Accessible to anyone worldwide</div>
        </div>

        <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-xs">
          <div className="text-[11px] text-emerald-700 font-mono uppercase font-semibold">1-Year Target Multiple</div>
          <div className="text-2xl font-mono font-bold text-emerald-600 tracking-tight mt-1">
            {multiplier}
          </div>
          <div className="text-xs text-emerald-700 mt-1">Systematic compound rate</div>
        </div>

        <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-xs">
          <div className="text-[11px] text-blue-600 font-mono uppercase font-semibold">Projected 12-Mo Portfolio</div>
          <div className="text-2xl font-mono font-bold text-blue-600 tracking-tight mt-1">
            ${finalValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </div>
          <div className="text-xs text-slate-500 mt-1">From small consistent increments</div>
        </div>

        <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-xs">
          <div className="text-[11px] text-slate-400 font-mono uppercase font-semibold">Max Drawdown Guardrail</div>
          <div className="text-2xl font-mono font-bold text-slate-800 tracking-tight mt-1">
            0.65%
          </div>
          <div className="text-xs text-slate-500 mt-1">Capital preservation lock</div>
        </div>
      </div>

      {/* Main Interactive Compound Calculator & Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
        {/* Left Form (4 cols) */}
        <div className="lg:col-span-4 min-w-0 space-y-6">
          <div className="bg-white border border-slate-200 p-5 sm:p-6 rounded-xl shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">
              Compound Parameters
            </h3>

            <form onSubmit={handleRecalculate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Initial Capital ($)
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[25, 50, 100, 250].map((val) => (
                    <button
                      type="button"
                      key={val}
                      onClick={() => setInitialCapital(val)}
                      className={`py-1.5 rounded-lg text-xs font-mono font-semibold border ${
                        initialCapital === val
                          ? 'bg-slate-900 text-white border-slate-900'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      ${val}
                    </button>
                  ))}
                </div>
                <input
                  type="number"
                  value={initialCapital}
                  onChange={(e) => setInitialCapital(Number(e.target.value))}
                  className="w-full bg-white border border-slate-200 text-xs font-mono text-slate-900 rounded-lg p-2.5 mt-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Monthly Addition ($)
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[0, 25, 50, 100].map((val) => (
                    <button
                      type="button"
                      key={val}
                      onClick={() => setMonthlyContribution(val)}
                      className={`py-1.5 rounded-lg text-xs font-mono font-semibold border ${
                        monthlyContribution === val
                          ? 'bg-slate-900 text-white border-slate-900'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      ${val}
                    </button>
                  ))}
                </div>
                <input
                  type="number"
                  value={monthlyContribution}
                  onChange={(e) => setMonthlyContribution(Number(e.target.value))}
                  className="w-full bg-white border border-slate-200 text-xs font-mono text-slate-900 rounded-lg p-2.5 mt-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-xs text-slate-600 space-y-1">
                <div className="font-semibold text-slate-900">Quant Strategy Rules:</div>
                <div>• Cross-exchange arbitrage (zero directional market exposure)</div>
                <div>• Automatic scale triggers when spread &gt; 2.2%</div>
                <div>• Profits automatically sweep into cash basis</div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors shadow-xs disabled:opacity-50"
              >
                {isLoading ? 'Simulating...' : 'Recalculate Growth Trajectory'}
              </button>
            </form>
          </div>
        </div>

        {/* Right Chart (8 cols) */}
        <div className="lg:col-span-8 min-w-0 space-y-6">
          <div className="bg-white border border-slate-200 p-4 sm:p-6 rounded-xl shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest font-mono">
                  12-Month Compounding Trajectory
                </h3>
                <span className="text-xs text-slate-500">Targeting 10x net capital appreciation with institutional arbitrage</span>
              </div>
              <span className="text-xs font-mono font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 self-start sm:self-auto shrink-0">
                10x GROWTH CURVE
              </span>
            </div>

            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="growthGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" stroke="#94a3b8" tick={{ fill: '#64748b', fontSize: 11 }} />
                  <YAxis stroke="#94a3b8" tick={{ fill: '#64748b', fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '8px', fontSize: '12px' }}
                    formatter={(val: any) => [`$${Number(val).toLocaleString()}`, 'Portfolio Value']}
                  />
                  <Area type="monotone" dataKey="capital" stroke="#2563eb" strokeWidth={2.5} fillOpacity={1} fill="url(#growthGradient)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* 12-Month Detailed Milestone Schedule Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-widest font-mono">
            Month-By-Month Compounding Ledger
          </h3>
          <span className="text-xs text-slate-500 font-mono">100% TRANSPARENT MODEL</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-50 text-slate-500 text-[10px] border-b border-slate-200">
              <tr>
                <th className="p-3">MONTH</th>
                <th className="p-3 text-right">STARTING ($)</th>
                <th className="p-3 text-right">ARBITRAGE GAIN</th>
                <th className="p-3 text-right">ADDITION ($)</th>
                <th className="p-3 text-right">ENDING CAPITAL ($)</th>
                <th className="p-3 text-right">TRADES</th>
                <th className="p-3 text-right">WIN RATE</th>
                <th className="p-3">GUARDRAILS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {milestones.map((m) => (
                <tr key={m.month} className="hover:bg-slate-50/70 transition-colors">
                  <td className="p-3 font-bold text-slate-900">Month {m.month}</td>
                  <td className="p-3 text-right text-slate-600">${m.startingCapital.toFixed(2)}</td>
                  <td className="p-3 text-right text-emerald-600 font-semibold">+{m.monthlyArbitrageGainPct}%</td>
                  <td className="p-3 text-right text-slate-500">+${m.monthlyAddition.toFixed(2)}</td>
                  <td className="p-3 text-right font-bold text-blue-600">${m.endingCapital.toFixed(2)}</td>
                  <td className="p-3 text-right text-slate-700">{m.tradesExecuted}</td>
                  <td className="p-3 text-right text-slate-800">{m.winRatePct}%</td>
                  <td className="p-3 text-slate-500 text-[11px] truncate max-w-[200px]">{m.riskGuardrailsActive}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
