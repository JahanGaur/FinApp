import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, budgetActions } from '../store';
import { formatCurrency, calculateBudgetUsage, getCurrentMonth, getMonthLabel } from '../utils/calculations';
import { Budget } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { Plus, X, AlertTriangle, CheckCircle } from 'lucide-react';

export default function BudgetsPage() {
  const dispatch = useDispatch();
  const darkMode = useSelector((s: RootState) => s.ui.darkMode);
  const budgets = useSelector((s: RootState) => s.budgets.data);
  const transactions = useSelector((s: RootState) => s.transactions.data);
  const categories = useSelector((s: RootState) => s.categories.data);
  const userId = useSelector((s: RootState) => s.auth.user?.id || '');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth());
  const [form, setForm] = useState({ categoryId: '', limit: 0 });

  const monthBudgets = budgets.filter(b => b.month === selectedMonth);
  const expenseCategories = categories.filter(c => c.type === 'expense' || c.type === 'both');
  const budgetedCategories = monthBudgets.map(b => b.categoryId);
  const unbudgetedCategories = expenseCategories.filter(c => !budgetedCategories.includes(c.id));

  const totalLimit = monthBudgets.reduce((sum, b) => sum + b.limit, 0);
  const totalSpent = monthBudgets.reduce((sum, b) => sum + calculateBudgetUsage(b, transactions, categories).actualSpent, 0);
  const totalRemaining = totalLimit - totalSpent;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      dispatch(budgetActions.updateBudget({ id: editingId, changes: { limit: form.limit, categoryId: form.categoryId } }));
    } else {
      const newBudget: Budget = {
        id: uuidv4(), userId, categoryId: form.categoryId, month: selectedMonth,
        limit: form.limit, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
      };
      dispatch(budgetActions.addBudget(newBudget));
    }
    setShowForm(false);
    setEditingId(null);
    setForm({ categoryId: '', limit: 0 });
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this budget?')) dispatch(budgetActions.deleteBudget(id));
  };

  const cardClass = darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200';

  // Generate month options
  const monthOptions = Array.from({ length: 12 }, (_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Budgets</h1>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Track your spending limits</p>
        </div>
        <div className="flex gap-2">
          <select value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)}
            className={`px-3 py-2 rounded-lg border text-sm ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-200'}`}>
            {monthOptions.map(m => <option key={m} value={m}>{getMonthLabel(m)}</option>)}
          </select>
          <button onClick={() => { setShowForm(true); setEditingId(null); setForm({ categoryId: '', limit: 0 }); }}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium">
            <Plus size={16} /> Add Budget
          </button>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className={`border rounded-xl p-5 ${cardClass}`}>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Total Budget</p>
          <p className="text-2xl font-bold mt-1">{formatCurrency(totalLimit)}</p>
        </div>
        <div className={`border rounded-xl p-5 ${cardClass}`}>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Total Spent</p>
          <p className="text-2xl font-bold mt-1">{formatCurrency(totalSpent)}</p>
        </div>
        <div className={`border rounded-xl p-5 ${cardClass}`}>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Remaining</p>
          <p className={`text-2xl font-bold mt-1 ${totalRemaining < 0 ? 'text-red-500' : 'text-emerald-600'}`}>{formatCurrency(totalRemaining)}</p>
        </div>
      </div>

      {/* Budget Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {monthBudgets.map(budget => {
          const usage = calculateBudgetUsage(budget, transactions, categories);
          const cat = categories.find(c => c.id === budget.categoryId);
          const isOver = usage.usagePercentage > 100;
          const isNear = usage.usagePercentage > 80 && !isOver;
          
          return (
            <div key={budget.id} className={`border rounded-xl p-5 ${cardClass}`}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat?.color || '#6b7280' }} />
                  <div>
                    <h3 className="font-semibold">{cat?.name || 'Unknown'}</h3>
                    <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>{getMonthLabel(budget.month)}</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => { setEditingId(budget.id); setForm({ categoryId: budget.categoryId, limit: budget.limit }); setShowForm(true); }}
                    className="p-1 text-xs text-gray-400 hover:text-gray-600">Edit</button>
                  <button onClick={() => handleDelete(budget.id)} className="p-1 text-xs text-red-400 hover:text-red-600">Delete</button>
                </div>
              </div>
              
              <div className="flex justify-between text-sm mb-2">
                <span>{formatCurrency(usage.actualSpent)} spent</span>
                <span className={darkMode ? 'text-gray-400' : 'text-gray-500'}>of {formatCurrency(budget.limit)}</span>
              </div>
              
              <div className={`h-3 rounded-full ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                <div
                  className={`h-full rounded-full transition-all ${isOver ? 'bg-red-500' : isNear ? 'bg-yellow-500' : 'bg-emerald-500'}`}
                  style={{ width: `${Math.min(usage.usagePercentage, 100)}%` }}
                />
              </div>
              
              <div className="flex items-center justify-between mt-2">
                <span className={`text-sm font-medium ${isOver ? 'text-red-500' : 'text-emerald-600'}`}>
                  {usage.usagePercentage.toFixed(1)}%
                </span>
                <span className={`text-sm ${usage.remaining < 0 ? 'text-red-500' : darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  {usage.remaining < 0 ? `${formatCurrency(Math.abs(usage.remaining))} over` : `${formatCurrency(usage.remaining)} left`}
                </span>
              </div>

              {isOver && (
                <div className="mt-3 flex items-center gap-2 p-2 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <AlertTriangle size={14} className="text-red-500" />
                  <span className="text-xs text-red-600 dark:text-red-400">Budget exceeded by {formatCurrency(Math.abs(usage.remaining))}</span>
                </div>
              )}
              {isNear && (
                <div className="mt-3 flex items-center gap-2 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                  <AlertTriangle size={14} className="text-yellow-500" />
                  <span className="text-xs text-yellow-600 dark:text-yellow-400">Approaching budget limit</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {monthBudgets.length === 0 && (
        <div className={`border rounded-xl p-8 text-center ${cardClass}`}>
          <p className="text-gray-400">No budgets set for {getMonthLabel(selectedMonth)}</p>
          <button onClick={() => setShowForm(true)} className="mt-3 text-emerald-600 font-medium hover:underline">Create your first budget</button>
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className={`w-full max-w-md ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6 shadow-xl`}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">{editingId ? 'Edit Budget' : 'New Budget'}</h2>
              <button onClick={() => setShowForm(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Category</label>
                <select value={form.categoryId} onChange={e => setForm({...form, categoryId: e.target.value})} required
                  className={`w-full px-3 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-200'} outline-none focus:ring-2 focus:ring-emerald-500`}>
                  <option value="">Select category</option>
                  {(editingId ? expenseCategories : unbudgetedCategories).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Monthly Limit</label>
                <input type="number" step="0.01" min="1" value={form.limit || ''} onChange={e => setForm({...form, limit: parseFloat(e.target.value) || 0})} required
                  className={`w-full px-3 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-200'} outline-none focus:ring-2 focus:ring-emerald-500`} />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className={`flex-1 py-2 rounded-lg border ${darkMode ? 'border-gray-600' : 'border-gray-200'}`}>Cancel</button>
                <button type="submit" className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium">{editingId ? 'Update' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
