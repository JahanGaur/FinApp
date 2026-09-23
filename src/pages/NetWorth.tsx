import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { calculateNetWorth, formatCurrency, formatDate } from '../utils/calculations';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar, Legend } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react';

export default function NetWorthPage() {
  const darkMode = useSelector((s: RootState) => s.ui.darkMode);
  const accounts = useSelector((s: RootState) => s.accounts.data);
  const netWorthSnapshots = useSelector((s: RootState) => s.netWorth.data);
  const investments = useSelector((s: RootState) => s.investments.data);

  const { totalAssets, totalLiabilities, netWorth } = calculateNetWorth(accounts);
  const cardClass = darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200';

  // Asset breakdown
  const assetBreakdown = accounts.filter(a => !a.isArchived && ['cash', 'bank', 'investment'].includes(a.type)).map(a => ({
    name: a.name, value: a.currentBalance, type: a.type
  }));

  // Liability breakdown
  const liabilityBreakdown = accounts.filter(a => !a.isArchived && ['credit_card', 'loan'].includes(a.type)).map(a => ({
    name: a.name, value: Math.abs(a.currentBalance), type: a.type
  }));

  // Chart data
  const chartData = netWorthSnapshots.map(s => ({
    date: new Date(s.date).toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
    netWorth: s.netWorth,
    assets: s.totalAssets,
    liabilities: s.totalLiabilities
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Net Worth</h1>
        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Your financial position at a glance</p>
      </div>

      {/* Main Net Worth Card */}
      <div className={`border rounded-xl p-6 ${cardClass}`}>
        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Current Net Worth</p>
        <p className={`text-4xl font-bold mt-2 ${netWorth >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>{formatCurrency(netWorth)}</p>
        <div className="flex gap-6 mt-4">
          <div>
            <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>Total Assets</p>
            <p className="text-lg font-semibold text-emerald-600">{formatCurrency(totalAssets)}</p>
          </div>
          <div>
            <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>Total Liabilities</p>
            <p className="text-lg font-semibold text-red-500">{formatCurrency(totalLiabilities)}</p>
          </div>
        </div>
      </div>

      {/* Net Worth Chart */}
      <div className={`border rounded-xl p-5 ${cardClass}`}>
        <h3 className="font-semibold mb-4">Net Worth Over Time</h3>
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="netWorthGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#374151' : '#e5e7eb'} />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke={darkMode ? '#9ca3af' : '#6b7280'} />
              <YAxis tick={{ fontSize: 12 }} stroke={darkMode ? '#9ca3af' : '#6b7280'} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
              <Tooltip formatter={(value: number) => formatCurrency(value)} contentStyle={{ backgroundColor: darkMode ? '#1f2937' : '#fff', border: 'none', borderRadius: 8 }} />
              <Legend />
              <Area type="monotone" dataKey="netWorth" stroke="#10b981" fill="url(#netWorthGradient)" strokeWidth={2} name="Net Worth" />
              <Line type="monotone" dataKey="assets" stroke="#3b82f6" strokeWidth={1.5} strokeDasharray="5 5" name="Assets" dot={false} />
              <Line type="monotone" dataKey="liabilities" stroke="#ef4444" strokeWidth={1.5} strokeDasharray="5 5" name="Liabilities" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[300px] flex items-center justify-center text-gray-400">No historical data available</div>
        )}
      </div>

      {/* Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Assets */}
        <div className={`border rounded-xl p-5 ${cardClass}`}>
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <TrendingUp size={18} className="text-emerald-600" /> Assets
          </h3>
          <div className="space-y-3">
            {assetBreakdown.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="text-sm">{item.name}</span>
                </div>
                <span className="text-sm font-medium text-emerald-600">{formatCurrency(item.value)}</span>
              </div>
            ))}
            {assetBreakdown.length === 0 && <p className="text-sm text-gray-400">No assets recorded</p>}
            <div className={`pt-3 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'} flex justify-between`}>
              <span className="font-medium">Total</span>
              <span className="font-bold text-emerald-600">{formatCurrency(totalAssets)}</span>
            </div>
          </div>
        </div>

        {/* Liabilities */}
        <div className={`border rounded-xl p-5 ${cardClass}`}>
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <TrendingDown size={18} className="text-red-500" /> Liabilities
          </h3>
          <div className="space-y-3">
            {liabilityBreakdown.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-red-500" />
                  <span className="text-sm">{item.name}</span>
                </div>
                <span className="text-sm font-medium text-red-500">{formatCurrency(item.value)}</span>
              </div>
            ))}
            {liabilityBreakdown.length === 0 && <p className="text-sm text-gray-400">No liabilities recorded</p>}
            <div className={`pt-3 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'} flex justify-between`}>
              <span className="font-medium">Total</span>
              <span className="font-bold text-red-500">{formatCurrency(totalLiabilities)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
