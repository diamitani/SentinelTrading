import React, { useState, useEffect } from 'react';
import { CompoundMilestone } from '../types';
import { fetchGrowthSimulation } from '../services/geminiService';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';

interface GrowthSimulatorViewProps {
  onDeployToArbitrage: () => void;
}

export const GrowthSimulatorView: React.FC<GrowthSimulatorViewProps> = ({ onDeployToArbitrage }) => {
  const [initialCapital, setInitialCapital] = useState<number>(100);
  const [monthlyContribution, setMonthlyContribution] = useState<number>(50);
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
    void runSim(initialCapital, monthlyContribution);
  }, []);

  const handleRecalculate = (e: React.FormEvent) => {
    e.preventDefault();
    void runSim(initialCapital, monthlyContribution);
  };

  const milestones: CompoundMilestone[] = simulationData?.milestones || [];
  const finalValue = simulationData?.config?.finalPortfolioValue || 1084.5;
  const multiplier = simulationData?.config?.achievedMultiplier || '10.8x';

  const chartData = milestones.map((m) => ({
    name: `Mo ${m.month}`,
    capital: m.endingCapital,
    gainPct: m.monthlyArbitrageGainPct,
  }));

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="bg-white border border-stone-200 p-5 sm:p-6 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="text-[11px] font-mono uppercase tracking-wider font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
              Hypothetical Compounding Tool
            </span>
            <span className="text-[11px] font-mono text-stone-500">
              Built for $100 to $50,000+ budgets
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-stone-900">
            Personal Savings &amp; Compounding Simulator
          </h1>
          <p className="text-sm text-stone-600 mt-1 max-w-3xl">
            See how starting with <span className="font-semibold text-stone-900">$100 or any budget</span> and adding steady monthly deposits can compound over 12 months when paired with disciplined risk limits.
          </p>
        </div>

        <button
          type="button"
          onClick={onDeployToArbitrage}
          className="px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors w-full md:w-auto whitespace-nowrap shrink-0"
        >
          Browse Researched Market Ideas &rarr;
        </button>
      </div>

      {/* 4 Outcome Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-stone-200 p-5 rounded-xl">
          <div className="text-[11px] text-stone-500 font-mono uppercase font-semibold">Starting Budget</div>
          <div className="text-2xl font-mono font-bold text-stone-900 tracking-tight mt-1 tabular-nums">
            ${initialCapital.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </div>
          <div className="text-xs text-stone-500 mt-1">Start small or scale up anytime</div>
        </div>

        <div className="bg-white border border-stone-200 p-5 rounded-xl">
          <div className="text-[11px] text-emerald-700 font-mono uppercase font-semibold">Illustrative Multiple</div>
          <div className="text-2xl font-mono font-bold text-emerald-600 tracking-tight mt-1 tabular-nums">
            {multiplier}
          </div>
          <div className="text-xs text-stone-500 mt-1">Hypothetical model only</div>
        </div>

        <div className="bg-white border border-stone-200 p-5 rounded-xl">
          <div className="text-[11px] text-blue-600 font-mono uppercase font-semibold">12-Month Projection</div>
          <div className="text-2xl font-mono font-bold text-blue-600 tracking-tight mt-1 tabular-nums">
            ${finalValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </div>
          <div className="text-xs text-stone-500 mt-1">Including monthly deposits</div>
        </div>

        <div className="bg-white border border-stone-200 p-5 rounded-xl">
          <div className="text-[11px] text-stone-500 font-mono uppercase font-semibold">Planned Risk Cap</div>
          <div className="text-2xl font-mono font-bold text-stone-800 tracking-tight mt-1 tabular-nums">
            0.65%
          </div>
          <div className="text-xs text-stone-500 mt-1">Max risk per single position</div>
        </div>
      </div>

      {/* Interactive Calculator & Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4 min-w-0">
          <div className="bg-white border border-stone-200 p-5 rounded-xl">
            <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wider mb-4">
              Your Numbers
            </h3>

            <form onSubmit={handleRecalculate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                  Starting Amount ($)
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {[100, 500, 1000, 5000].map((val) => (
                    <button
                      type="button"
                      key={val}
                      onClick={() => setInitialCapital(val)}
                      className={`py-1.5 rounded-lg text-xs font-mono font-semibold border ${
                        initialCapital === val
                          ? 'bg-stone-900 text-white border-stone-900'
                          : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                      }`}
                    >
                      ${val >= 1000 ? `${val / 1000}k` : val}
                    </button>
                  ))}
                </div>
                <input
                  type="number"
                  min={10}
                  value={initialCapital}
                  onChange={(e) => setInitialCapital(Number(e.target.value))}
                  className="w-full bg-white border border-stone-200 text-xs font-mono text-stone-900 rounded-lg p-2.5 mt-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                  Monthly Deposit ($)
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {[0, 25, 100, 250].map((val) => (
                    <button
                      type="button"
                      key={val}
                      onClick={() => setMonthlyContribution(val)}
                      className={`py-1.5 rounded-lg text-xs font-mono font-semibold border ${
                        monthlyContribution === val
                          ? 'bg-stone-900 text-white border-stone-900'
                          : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                      }`}
                    >
                      ${val}
                    </button>
                  ))}
                </div>
                <input
                  type="number"
                  min={0}
                  value={monthlyContribution}
                  onChange={(e) => setMonthlyContribution(Number(e.target.value))}
                  className="w-full bg-white border border-stone-200 text-xs font-mono text-stone-900 rounded-lg p-2.5 mt-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div className="p-3 bg-stone-50 rounded-lg border border-stone-200 text-xs text-stone-600 space-y-1">
                <div className="font-semibold text-stone-900">Important note:</div>
                <p>
                  This calculator illustrates hypothetical compounding math. Real markets fluctuate and can lose money; returns are never guaranteed.
                </p>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors disabled:opacity-50"
              >
                {isLoading ? 'Calculating…' : 'Update Projection'}
              </button>
            </form>
          </div>
        </div>

        <div className="lg:col-span-8 min-w-0">
          <div className="bg-white border border-stone-200 p-5 rounded-xl h-full">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
              <div>
                <h3 className="text-sm font-bold text-stone-900">
                  12-Month Illustrative Growth Curve
                </h3>
                <span className="text-xs text-stone-500">
                  Shows combined effect of starting budget, monthly deposits, and disciplined sizing
                </span>
              </div>
              <span className="text-xs font-mono font-semibold text-stone-600 bg-stone-100 px-2.5 py-1 rounded border border-stone-200 self-start sm:self-auto shrink-0">
                Hypothetical Illustration
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
                  <XAxis dataKey="name" stroke="#a8a29e" tick={{ fill: '#78716c', fontSize: 11 }} />
                  <YAxis stroke="#a8a29e" tick={{ fill: '#78716c', fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      borderColor: '#e7e5e4',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                    formatter={(val: any) => [`$${Number(val).toLocaleString()}`, 'Projected Balance']}
                  />
                  <Area
                    type="monotone"
                    dataKey="capital"
                    stroke="#2563eb"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#growthGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Month-by-Month Schedule */}
      <div className="bg-white border border-stone-200 rounded-xl overflow-hidden">
        <div className="p-4 bg-stone-50 border-b border-stone-200 flex justify-between items-center">
          <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider font-mono">
            Month-by-Month Schedule
          </h3>
          <span className="text-xs text-stone-500 font-mono">Illustrative Model</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-stone-50 text-stone-500 text-[10px] border-b border-stone-200">
              <tr>
                <th className="p-3">MONTH</th>
                <th className="p-3 text-right">STARTING ($)</th>
                <th className="p-3 text-right">EST. GAIN</th>
                <th className="p-3 text-right">DEPOSIT ($)</th>
                <th className="p-3 text-right">ENDING BALANCE ($)</th>
                <th className="p-3">RISK GUARDRAIL</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {milestones.map((m) => (
                <tr key={m.month} className="hover:bg-stone-50/70 transition-colors">
                  <td className="p-3 font-bold text-stone-900">Month {m.month}</td>
                  <td className="p-3 text-right text-stone-600 tabular-nums">${m.startingCapital.toFixed(2)}</td>
                  <td className="p-3 text-right text-emerald-600 font-semibold tabular-nums">
                    +{m.monthlyArbitrageGainPct}%
                  </td>
                  <td className="p-3 text-right text-stone-500 tabular-nums">+${m.monthlyAddition.toFixed(2)}</td>
                  <td className="p-3 text-right font-bold text-blue-600 tabular-nums">
                    ${m.endingCapital.toFixed(2)}
                  </td>
                  <td className="p-3 text-stone-500 text-[11px] truncate max-w-[220px]">
                    {m.riskGuardrailsActive}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
