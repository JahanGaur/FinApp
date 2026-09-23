import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, investmentActions } from '../store';
import { formatCurrency, calculateInvestmentValue } from '../utils/calculations';
import { Investment, AssetType } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { Plus, X, TrendingUp, TrendingDown, PieChart as PieChartIcon, Info } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const ASSET_COLORS: Record<AssetType, string> = {
  stock: '#3b82f6', etf: '#10b981', mutual_fund: '#8b5cf6',
  bond: '#f59e0b', crypto: '#f97316', gold: '#eab308', other: '#6b7280'
};

export default function InvestmentsPage() {
  const dispatch = useDispatch();
  const darkMode = useSelector((s: RootState) => s.ui.darkMode);
  const investments = useSelector((s: RootState) => s.investments.data);
  const userId = useSelector((s: RootState) => s.auth.user?.id || '');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    symbol: '', name: '', assetType: 'stock' as AssetType, quantity: 0,
    averageCost: 0, currentPrice: 0, currency: 'USD', notes: ''
  });

  const totalValue = investments.reduce((sum, inv) => sum + calculateInvestmentValue(inv).marketValue, 0);
  const totalCost = investments.reduce((sum, inv) => sum + calculateInvestmentValue(inv).costBasis, 0);
  const totalPnL = totalValue - totalCost;
  const totalReturn = totalCost > 0 ? ((totalValue - totalCost) / totalCost) * 100 : 0;

  // Allocation data
  const allocationData = investments.map(inv => ({
    name: inv.symbol,
    value: calculateInvestmentValue(inv).marketValue,
    color: ASSET_COLORS[inv.assetType]
  }));

  // By asset type
  const byType: Record<string, number> = {};
  investments.forEach(inv => {
    const val = calculateInvestmentValue(inv).marketValue;
    byType[inv.assetType] = (byType[inv.assetType] || 0) + val;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      dispatch(investmentActions.updateInvestment({ id: editingId, changes: form }));
    } else {
      const newInv: Investment = {
        id: uuidv4(), userId, ...form,
        createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
      };
      dispatch(investmentActions.addInvestment(newInv));
    }
    setShowForm(false);
    setEditingId(null);
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this investment?')) dispatch(investmentActions.deleteInvestment(id));
  };

  const cardClass = darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Investments</h1>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Track your investment portfolio</p>
        </div>
        <button onClick={() => { setShowForm(true); setEditingId(null); }}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium">
          <Plus size={16} /> Add Investment
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className={`border rounded-xl p-5 ${cardClass}`}>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Portfolio Value</p>
          <p className="text-2xl font-bold mt-1">{formatCurrency(totalValue)}</p>
        </div>
        <div className={`border rounded-xl p-5 ${cardClass}`}>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Cost Basis</p>
          <p className="text-2xl font-bold mt-1">{formatCurrency(totalCost)}</p>
        </div>
        <div className={`border rounded-xl p-5 ${cardClass}`}>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Total P/L</p>
          <p className={`text-2xl font-bold mt-1 ${totalPnL >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
            {totalPnL >= 0 ? '+' : ''}{formatCurrency(totalPnL)}
          </p>
        </div>
        <div className={`border rounded-xl p-5 ${cardClass}`}>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Total Return</p>
          <p className={`text-2xl font-bold mt-1 ${totalReturn >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
            {totalReturn >= 0 ? '+' : ''}{totalReturn.toFixed(2)}%
          </p>
        </div>
      </div>

      {/* Allocation Chart */}
      {allocationData.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className={`border rounded-xl p-5 ${cardClass}`}>
            <h3 className="font-semibold mb-4">Portfolio Allocation</h3>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={allocationData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {allocationData.map((entry, idx) => <Cell key={idx} fill={entry.color} />)}
                </Pie>
                <Tooltip formatter={(value: number) => formatCurrency(value)} contentStyle={{ backgroundColor: darkMode ? '#1f2937' : '#fff', border: 'none', borderRadius: 8 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className={`border rounded-xl p-5 ${cardClass}`}>
            <h3 className="font-semibold mb-4">By Asset Type</h3>
            <div className="space-y-3">
              {Object.entries(byType).sort((a, b) => b[1] - a[1]).map(([type, value]) => (
                <div key={type} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: ASSET_COLORS[type as AssetType] }} />
                    <span className="text-sm capitalize">{type.replace('_', ' ')}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{formatCurrency(value)}</p>
                    <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>{((value / totalValue) * 100).toFixed(1)}%</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Holdings Table */}
      <div className={`border rounded-xl overflow-hidden ${cardClass}`}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className={`text-left text-xs font-medium uppercase ${darkMode ? 'text-gray-400 bg-gray-750' : 'text-gray-500 bg-gray-50'}`}>
                <th className="px-4 py-3">Symbol</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3 text-right">Qty</th>
                <th className="px-4 py-3 text-right">Avg Cost</th>
                <th className="px-4 py-3 text-right">Current Price</th>
                <th className="px-4 py-3 text-right">Market Value</th>
                <th className="px-4 py-3 text-right">P/L</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y dark:divide-gray-700">
              {investments.map(inv => {
                const val = calculateInvestmentValue(inv);
                return (
                  <tr key={inv.id} className={`${darkMode ? 'hover:bg-gray-750' : 'hover:bg-gray-50'}`}>
                    <td className="px-4 py-3 font-medium text-sm">{inv.symbol}</td>
                    <td className="px-4 py-3 text-sm">{inv.name}</td>
                    <td className="px-4 py-3">
                      <span className="text-xs px-2 py-0.5 rounded-full capitalize" style={{ backgroundColor: ASSET_COLORS[inv.assetType] + '20', color: ASSET_COLORS[inv.assetType] }}>
                        {inv.assetType.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-right">{inv.quantity}</td>
                    <td className="px-4 py-3 text-sm text-right">{formatCurrency(inv.averageCost)}</td>
                    <td className="px-4 py-3 text-sm text-right">{formatCurrency(inv.currentPrice)}</td>
                    <td className="px-4 py-3 text-sm text-right font-medium">{formatCurrency(val.marketValue)}</td>
                    <td className={`px-4 py-3 text-sm text-right font-medium ${val.unrealizedPnL >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                      <div>{val.unrealizedPnL >= 0 ? '+' : ''}{formatCurrency(val.unrealizedPnL)}</div>
                      <div className="text-xs">{val.returnPercentage >= 0 ? '+' : ''}{val.returnPercentage.toFixed(2)}%</div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => { setEditingId(inv.id); setForm({ symbol: inv.symbol, name: inv.name, assetType: inv.assetType, quantity: inv.quantity, averageCost: inv.averageCost, currentPrice: inv.currentPrice, currency: inv.currency, notes: inv.notes }); setShowForm(true); }}
                          className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-xs">Edit</button>
                        <button onClick={() => handleDelete(inv.id)} className="p-1.5 rounded hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500 text-xs">Del</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {investments.length === 0 && (
          <div className="p-8 text-center text-gray-400">No investments yet. Add your first holding.</div>
        )}
      </div>

      {/* Disclaimer */}
      <div className={`flex items-start gap-2 p-3 rounded-lg ${darkMode ? 'bg-yellow-900/20 text-yellow-400' : 'bg-yellow-50 text-yellow-700'} text-xs`}>
        <Info size={14} className="mt-0.5 flex-shrink-0" />
        <p>Market prices shown are manually entered and may not reflect actual current market values. FinPilot does not execute trades or provide live market data. Prices last updated: {new Date().toLocaleDateString()}.</p>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className={`w-full max-w-md ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6 shadow-xl max-h-[90vh] overflow-y-auto`}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">{editingId ? 'Edit Investment' : 'Add Investment'}</h2>
              <button onClick={() => setShowForm(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Symbol</label>
                  <input type="text" value={form.symbol} onChange={e => setForm({...form, symbol: e.target.value.toUpperCase()})} required placeholder="AAPL"
                    className={`w-full px-3 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-200'} outline-none focus:ring-2 focus:ring-emerald-500`} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Asset Type</label>
                  <select value={form.assetType} onChange={e => setForm({...form, assetType: e.target.value as AssetType})}
                    className={`w-full px-3 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-200'} outline-none focus:ring-2 focus:ring-emerald-500`}>
                    <option value="stock">Stock</option>
                    <option value="etf">ETF</option>
                    <option value="mutual_fund">Mutual Fund</option>
                    <option value="bond">Bond</option>
                    <option value="crypto">Crypto</option>
                    <option value="gold">Gold</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required
                  className={`w-full px-3 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-200'} outline-none focus:ring-2 focus:ring-emerald-500`} />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Quantity</label>
                  <input type="number" step="any" min="0" value={form.quantity || ''} onChange={e => setForm({...form, quantity: parseFloat(e.target.value) || 0})} required
                    className={`w-full px-3 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-200'} outline-none focus:ring-2 focus:ring-emerald-500`} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Avg Cost</label>
                  <input type="number" step="0.01" min="0" value={form.averageCost || ''} onChange={e => setForm({...form, averageCost: parseFloat(e.target.value) || 0})} required
                    className={`w-full px-3 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-200'} outline-none focus:ring-2 focus:ring-emerald-500`} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Current Price</label>
                  <input type="number" step="0.01" min="0" value={form.currentPrice || ''} onChange={e => setForm({...form, currentPrice: parseFloat(e.target.value) || 0})} required
                    className={`w-full px-3 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-200'} outline-none focus:ring-2 focus:ring-emerald-500`} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Notes (optional)</label>
                <textarea value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} rows={2}
                  className={`w-full px-3 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-200'} outline-none focus:ring-2 focus:ring-emerald-500`} />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className={`flex-1 py-2 rounded-lg border ${darkMode ? 'border-gray-600' : 'border-gray-200'}`}>Cancel</button>
                <button type="submit" className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium">{editingId ? 'Update' : 'Add'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
