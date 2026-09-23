import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, goalActions } from '../store';
import { formatCurrency, calculateGoalProgress, formatDate } from '../utils/calculations';
import { Goal, GoalType } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { Plus, X, Target, DollarSign, Calendar, TrendingUp } from 'lucide-react';

export default function GoalsPage() {
  const dispatch = useDispatch();
  const darkMode = useSelector((s: RootState) => s.ui.darkMode);
  const goals = useSelector((s: RootState) => s.goals.data);
  const userId = useSelector((s: RootState) => s.auth.user?.id || '');
  const [showForm, setShowForm] = useState(false);
  const [showContribute, setShowContribute] = useState<string | null>(null);
  const [contributeAmount, setContributeAmount] = useState(0);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: '', type: 'custom' as GoalType, targetAmount: 0, currentAmount: 0,
    deadline: '', priority: 'medium' as 'low' | 'medium' | 'high', monthlyContribution: 0
  });

  const activeGoals = goals.filter(g => g.status === 'active');
  const completedGoals = goals.filter(g => g.status === 'completed');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      dispatch(goalActions.updateGoal({ id: editingId, changes: form }));
    } else {
      const newGoal: Goal = {
        id: uuidv4(), userId, ...form, status: 'active',
        createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
      };
      dispatch(goalActions.addGoal(newGoal));
    }
    setShowForm(false);
    setEditingId(null);
  };

  const handleContribute = (goalId: string) => {
    if (contributeAmount > 0) {
      dispatch(goalActions.contributeToGoal({ id: goalId, amount: contributeAmount }));
      setShowContribute(null);
      setContributeAmount(0);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this goal?')) dispatch(goalActions.deleteGoal(id));
  };

  const cardClass = darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200';

  const goalTypeLabels: Record<GoalType, string> = {
    emergency_fund: '🛡️ Emergency Fund',
    vacation: '✈️ Vacation',
    vehicle: '🚗 Vehicle',
    home: '🏠 Home',
    education: '🎓 Education',
    retirement: '🏖️ Retirement',
    custom: '🎯 Custom'
  };

  const priorityColors = {
    high: 'text-red-500 bg-red-50 dark:bg-red-900/20',
    medium: 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20',
    low: 'text-green-600 bg-green-50 dark:bg-green-900/20',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Financial Goals</h1>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Track progress toward your financial targets</p>
        </div>
        <button onClick={() => { setShowForm(true); setEditingId(null); }}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium">
          <Plus size={16} /> New Goal
        </button>
      </div>

      {/* Active Goals */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {activeGoals.map(goal => {
          const progress = calculateGoalProgress(goal);
          return (
            <div key={goal.id} className={`border rounded-xl p-5 ${cardClass}`}>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold">{goalTypeLabels[goal.type]} - {goal.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${priorityColors[goal.priority]}`}>{goal.priority} priority</span>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => setShowContribute(goal.id)} className="p-1.5 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded">
                    <DollarSign size={16} />
                  </button>
                  <button onClick={() => { setEditingId(goal.id); setForm({ name: goal.name, type: goal.type, targetAmount: goal.targetAmount, currentAmount: goal.currentAmount, deadline: goal.deadline, priority: goal.priority, monthlyContribution: goal.monthlyContribution }); setShowForm(true); }}
                    className="p-1.5 text-gray-400 hover:text-gray-600 rounded">Edit</button>
                  <button onClick={() => handleDelete(goal.id)} className="p-1.5 text-red-400 hover:text-red-600 rounded">Delete</button>
                </div>
              </div>

              {/* Progress */}
              <div className="mb-3">
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium">{formatCurrency(goal.currentAmount)}</span>
                  <span className={darkMode ? 'text-gray-400' : 'text-gray-500'}>{formatCurrency(goal.targetAmount)}</span>
                </div>
                <div className={`h-3 rounded-full ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                  <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all"
                    style={{ width: `${Math.min(progress.percentageCompleted, 100)}%` }} />
                </div>
                <p className="text-right text-xs mt-1 font-medium text-emerald-600">{progress.percentageCompleted}% complete</p>
              </div>

              {/* Details */}
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className={darkMode ? 'text-gray-500' : 'text-gray-400'}>Remaining</p>
                  <p className="font-medium">{formatCurrency(progress.remainingAmount)}</p>
                </div>
                <div>
                  <p className={darkMode ? 'text-gray-500' : 'text-gray-400'}>Monthly Contribution</p>
                  <p className="font-medium">{formatCurrency(goal.monthlyContribution)}</p>
                </div>
                <div>
                  <p className={darkMode ? 'text-gray-500' : 'text-gray-400'}>Deadline</p>
                  <p className="font-medium">{goal.deadline ? formatDate(goal.deadline) : 'No deadline'}</p>
                </div>
                <div>
                  <p className={darkMode ? 'text-gray-500' : 'text-gray-400'}>Est. Completion</p>
                  <p className="font-medium">{progress.estimatedCompletionDate ? formatDate(progress.estimatedCompletionDate) : 'N/A'}</p>
                </div>
              </div>

              {/* Contribute Section */}
              {showContribute === goal.id && (
                <div className={`mt-4 p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-emerald-50'}`}>
                  <p className="text-sm font-medium mb-2">Add Contribution</p>
                  <div className="flex gap-2">
                    <input type="number" step="0.01" min="1" value={contributeAmount || ''} onChange={e => setContributeAmount(parseFloat(e.target.value) || 0)}
                      className={`flex-1 px-3 py-1.5 rounded border text-sm ${darkMode ? 'bg-gray-600 border-gray-500 text-white' : 'border-gray-200'} outline-none`}
                      placeholder="Amount" />
                    <button onClick={() => handleContribute(goal.id)} className="px-3 py-1.5 bg-emerald-600 text-white rounded text-sm font-medium">Add</button>
                    <button onClick={() => setShowContribute(null)} className="px-3 py-1.5 border rounded text-sm">Cancel</button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {activeGoals.length === 0 && (
        <div className={`border rounded-xl p-8 text-center ${cardClass}`}>
          <Target size={40} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-400">No active goals yet</p>
          <button onClick={() => setShowForm(true)} className="mt-3 text-emerald-600 font-medium hover:underline">Create your first goal</button>
        </div>
      )}

      {/* Completed Goals */}
      {completedGoals.length > 0 && (
        <div>
          <h2 className={`text-lg font-semibold mb-3 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Completed Goals</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 opacity-75">
            {completedGoals.map(goal => (
              <div key={goal.id} className={`border rounded-xl p-5 ${cardClass}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">{goal.name}</h3>
                    <p className="text-sm text-emerald-600">✓ Completed - {formatCurrency(goal.currentAmount)}</p>
                  </div>
                  <button onClick={() => handleDelete(goal.id)} className="text-xs text-red-400 hover:text-red-600">Delete</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className={`w-full max-w-md ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6 shadow-xl max-h-[90vh] overflow-y-auto`}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">{editingId ? 'Edit Goal' : 'New Goal'}</h2>
              <button onClick={() => setShowForm(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Goal Name</label>
                <input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required
                  className={`w-full px-3 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-200'} outline-none focus:ring-2 focus:ring-emerald-500`} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Type</label>
                <select value={form.type} onChange={e => setForm({...form, type: e.target.value as GoalType})}
                  className={`w-full px-3 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-200'} outline-none focus:ring-2 focus:ring-emerald-500`}>
                  {Object.entries(goalTypeLabels).map(([val, label]) => <option key={val} value={val}>{label}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Target Amount</label>
                  <input type="number" step="0.01" min="1" value={form.targetAmount || ''} onChange={e => setForm({...form, targetAmount: parseFloat(e.target.value) || 0})} required
                    className={`w-full px-3 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-200'} outline-none focus:ring-2 focus:ring-emerald-500`} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Current Amount</label>
                  <input type="number" step="0.01" min="0" value={form.currentAmount || ''} onChange={e => setForm({...form, currentAmount: parseFloat(e.target.value) || 0})}
                    className={`w-full px-3 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-200'} outline-none focus:ring-2 focus:ring-emerald-500`} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Monthly Contribution</label>
                  <input type="number" step="0.01" min="0" value={form.monthlyContribution || ''} onChange={e => setForm({...form, monthlyContribution: parseFloat(e.target.value) || 0})}
                    className={`w-full px-3 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-200'} outline-none focus:ring-2 focus:ring-emerald-500`} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Deadline</label>
                  <input type="date" value={form.deadline} onChange={e => setForm({...form, deadline: e.target.value})}
                    className={`w-full px-3 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-200'} outline-none focus:ring-2 focus:ring-emerald-500`} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Priority</label>
                <select value={form.priority} onChange={e => setForm({...form, priority: e.target.value as any})}
                  className={`w-full px-3 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-200'} outline-none focus:ring-2 focus:ring-emerald-500`}>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
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
