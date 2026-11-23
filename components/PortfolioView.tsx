import React from 'react';
import { MarketReport } from '../types';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

interface PortfolioViewProps {
  report: MarketReport;
}

// Mock active positions simulating the user's existing "Billionaire" portfolio
const ACTIVE_POSITIONS = [
  { ticker: 'TSLA', shares: 5000, avgCost: 185.20, current: 240.50, pnl: 276500 },
  { ticker: 'AMD', shares: 12000, avgCost: 95.40, current: 170.20, pnl: 897600 },
  { ticker: 'BTC', shares: 15.5, avgCost: 42000, current: 65000, pnl: 356500 },
];

export const PortfolioView: React.FC<PortfolioViewProps> = ({ report }) => {
  const totalPnL = ACTIVE_POSITIONS.reduce((acc, pos) => acc + pos.pnl, 0);
  const totalValue = ACTIVE_POSITIONS.reduce((acc, pos) => acc + (pos.shares * pos.current), 0);

  // Default fallback if AI strategy is missing
  const strategy = report.portfolioStrategy || {
    sectorRotation: "Market conditions neutral. Maintain balance.",
    riskManagement: "Standard stop-loss protocol advised.",
    suggestedAllocation: { cash: 25, equity: 50, crypto: 10, derivatives: 15 }
  };

  const allocationData = [
    { name: 'Equity', value: strategy.suggestedAllocation.equity },
    { name: 'Cash', value: strategy.suggestedAllocation.cash },
    { name: 'Derivatives', value: strategy.suggestedAllocation.derivatives },
    { name: 'Crypto', value: strategy.suggestedAllocation.crypto },
  ];

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'];

  return (
    <div className="animate-fade-in space-y-8">
      
      {/* Portfolio Summary Header */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gray-900 border border-gray-800 p-4 rounded col-span-2">
          <div className="text-gray-500 text-xs font-bold uppercase mb-1">Total Net Liquidation</div>
          <div className="text-3xl font-mono text-white font-bold tracking-tight">
            ${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>
        <div className="bg-gray-900 border border-gray-800 p-4 rounded">
          <div className="text-gray-500 text-xs font-bold uppercase mb-1">Daily P&L</div>
          <div className="text-2xl font-mono text-neon-green font-bold tracking-tight">
            +${(totalValue * 0.024).toLocaleString(undefined, { maximumFractionDigits: 0 })}
            <span className="text-xs text-gray-400 ml-2 font-sans">(+2.4%)</span>
          </div>
        </div>
        <div className="bg-gray-900 border border-gray-800 p-4 rounded">
          <div className="text-gray-500 text-xs font-bold uppercase mb-1">Open P&L</div>
          <div className="text-2xl font-mono text-neon-green font-bold tracking-tight">
            +${totalPnL.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Active Holdings Table */}
        <div className="lg:col-span-2 space-y-6">
          {/* Table */}
          <div className="bg-gray-900 border border-gray-800 rounded overflow-hidden">
            <div className="p-4 border-b border-gray-800 flex justify-between items-center">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Active Positions</h3>
              <span className="text-xs text-gray-500">REAL-TIME</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-950 text-gray-500 text-xs font-mono">
                  <tr>
                    <th className="p-4 font-normal">TICKER</th>
                    <th className="p-4 font-normal text-right">SIZE</th>
                    <th className="p-4 font-normal text-right">AVG PRICE</th>
                    <th className="p-4 font-normal text-right">MARKET</th>
                    <th className="p-4 font-normal text-right">UNREALIZED P&L</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {ACTIVE_POSITIONS.map((pos) => (
                    <tr key={pos.ticker} className="hover:bg-gray-800/50 transition-colors">
                      <td className="p-4 font-bold text-white">{pos.ticker}</td>
                      <td className="p-4 text-right font-mono text-gray-300">{pos.shares.toLocaleString()}</td>
                      <td className="p-4 text-right font-mono text-gray-400">${pos.avgCost.toFixed(2)}</td>
                      <td className="p-4 text-right font-mono text-white">${pos.current.toFixed(2)}</td>
                      <td className="p-4 text-right font-mono text-neon-green">+${pos.pnl.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          
          {/* AI Strategic Oversight Section */}
          <div className="bg-gray-900 border border-gray-800 rounded p-6">
             <div className="flex items-center gap-2 mb-4 border-b border-gray-800 pb-2">
                <div className="w-2 h-2 bg-neon-blue rounded-full animate-pulse"></div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">AI Strategic Oversight</h3>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                   <h4 className="text-xs font-bold text-gray-400 uppercase mb-2">Sector Rotation Alpha</h4>
                   <p className="text-sm text-gray-300 leading-relaxed border-l-2 border-neon-blue pl-3">
                      {strategy.sectorRotation}
                   </p>
                </div>
                <div>
                   <h4 className="text-xs font-bold text-gray-400 uppercase mb-2">Dynamic Risk Management</h4>
                   <p className="text-sm text-gray-300 leading-relaxed border-l-2 border-neon-red pl-3">
                      {strategy.riskManagement}
                   </p>
                </div>
             </div>
          </div>
        </div>

        {/* Right Column: AI Allocation & Action */}
        <div className="space-y-4">
          
          {/* AI Suggested Allocation */}
          <div className="bg-gray-900 border border-gray-800 rounded p-4 h-64 flex flex-col">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-2">Target Allocation Model</h3>
            <div className="flex-grow relative">
               <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={allocationData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={70}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {allocationData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                       contentStyle={{backgroundColor: '#111827', borderColor: '#374151', borderRadius: '4px', fontSize: '12px'}}
                       itemStyle={{color: '#e5e7eb'}}
                    />
                  </PieChart>
               </ResponsiveContainer>
               {/* Legend */}
               <div className="flex justify-center flex-wrap gap-2 text-[10px] text-gray-400 mt-[-10px]">
                  {allocationData.map((entry, index) => (
                     <div key={index} className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full" style={{backgroundColor: COLORS[index]}}></span>
                        {entry.name} ({entry.value}%)
                     </div>
                  ))}
               </div>
            </div>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded p-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 border-b border-gray-800 pb-2">
              Proposed Rebalancing
            </h3>
            <div className="space-y-3">
              {report.recommendations.slice(0, 3).map((rec, i) => (
                <div key={i} className="flex items-center justify-between p-2 bg-gray-950 rounded border border-gray-800">
                  <div className="flex flex-col">
                    <span className="font-bold text-white">{rec.action} {rec.ticker}</span>
                    <span className="text-[10px] text-gray-500">Target: ${rec.entryPrice}</span>
                  </div>
                  <button className={`px-3 py-1 rounded text-[10px] font-bold uppercase hover:opacity-80 transition-opacity ${
                    rec.action === 'BUY' || rec.action === 'CALL' ? 'bg-neon-green text-black' : 'bg-neon-red text-white'
                  }`}>
                    Execute
                  </button>
                </div>
              ))}
            </div>
          </div>
          
          <div className="bg-gray-900 border border-gray-800 rounded p-4">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">
              Risk Exposure
            </h3>
            <div className="space-y-2">
              <div>
                <div className="flex justify-between text-xs text-gray-300 mb-1">
                  <span>Beta Weighted Delta</span>
                  <span>+142.5</span>
                </div>
                <div className="w-full bg-gray-800 h-1 rounded-full"><div className="w-3/4 bg-blue-500 h-full rounded-full"></div></div>
              </div>
              <div>
                <div className="flex justify-between text-xs text-gray-300 mb-1">
                  <span>Theta Decay (Daily)</span>
                  <span className="text-red-400">-$2,450</span>
                </div>
                <div className="w-full bg-gray-800 h-1 rounded-full"><div className="w-1/4 bg-red-500 h-full rounded-full"></div></div>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};