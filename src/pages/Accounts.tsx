import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, accountActions, transactionActions } from '../store';
import { formatCurrency, formatDate } from '../utils/calculations';
import { Account, AccountType } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { Plus, Edit2, Trash2, Archive, Wallet, CreditCard, TrendingUp, Landmark, DollarSign, X } from 'lucide-react';

const ACCOUNT_ICONS: Record<AccountType, React.ReactNode> = {
  cash: <DollarSign size={20} />,
  bank: <Landmark size={20} />,
  credit_card: <CreditCard size={20} />,
  investment: <TrendingUp size={20} />,
  loan: <CreditCard size={20} />,
  other: <Wallet size={20} />,
};

const ACCOUNT_COLORS: Record<AccountType, string> = {
  cash: 'bg-green-100 text-green-600',
  bank: 'bg-blue-100 text-blue-600',
  credit_card: 'bg-red-100 text-red-600',
  investment: 'bg-purple-100 text-purple-600',
  loan: 'bg-orange-100 text-orange-600',
  other: 'bg-gray-100 text-gray-600',
};

export default function AccountsPage() {
  const dispatch = useDispatch();
  const darkMode = useSelector((s: RootState) => s.ui.darkMode);
  const accounts = useSelector((s: RootState) => s.accounts.data);
  const userId = useSelector((s: RootState) => s.auth.user?.id || '');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', type: 'bank' as AccountType, institution: '', currency: 'USD', openingBalance: 0, currentBalance: 0 });

  const activeAccounts = accounts.filter(a => !a.isArchived);
  const archivedAccounts = accounts.filter(a => a.isArchived);
  const totalBalance = activeAccounts.reduce((sum, a) => sum + a.currentBalance, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      dispatch(accountActions.updateAccount({ id: editingId, changes: form }));
    } else {
      const newAccount: Account = {
        id: uuidv4(), userId, ...form, isArchived: false,
        createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
      };
      dispatch(accountActions.addAccount(newAccount));
    }
    setShowForm(false);
    setEditingId(null);
    setForm({ name: '', type: 'bank', institution: '', currency: 'USD', openingBalance: 0, currentBalance: 0 });
  };

  const handleEdit = (account: Account) => {
    setForm({ name: account.name, type: account.type, institution: account.institution, currency: account.currency, openingBalance: account.openingBalance, currentBalance: account.currentBalance });
    setEditingId(account.id);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this account?')) {
      dispatch(accountActions.deleteAccount(id));
    }
  };

  const handleArchive = (id: string) => {
    dispatch(accountActions.updateAccount({ id, changes: { isArchived: true } }));
  };

  const cardClass = darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Accounts</h1>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Manage your financial accounts</p>
        </div>
        <button onClick={() => { setShowForm(true); setEditingId(null); setForm({ name: '', type: 'bank', institution: '', currency: 'USD', openingBalance: 0, currentBalance: 0 }); }}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium">
          <Plus size={16} /> Add Account
        </button>
      </div>

      {/* Summary */}
      <div className={`border rounded-xl p-5 ${cardClass}`}>
        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Total Balance (Active Accounts)</p>
        <p className="text-3xl font-bold mt-1">{formatCurrency(totalBalance)}</p>
        <p className={`text-sm mt-1 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>{activeAccounts.length} active accounts</p>
      </div>

      {/* Account Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {activeAccounts.map(account => (
          <div key={account.id} className={`border rounded-xl p-5 ${cardClass} hover:shadow-md transition-shadow`}>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${ACCOUNT_COLORS[account.type]}`}>
                  {ACCOUNT_ICONS[account.type]}
                </div>
                <div>
                  <h3 className="font-semibold">{account.name}</h3>
                  <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>{account.institution}</p>
                </div>
              </div>
              <div className="flex gap-1">
                <button onClick={() => handleEdit(account)} className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700"><Edit2 size={14} /></button>
                <button onClick={() => handleArchive(account.id)} className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700"><Archive size={14} /></button>
                <button onClick={() => handleDelete(account.id)} className="p-1.5 rounded hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500"><Trash2 size={14} /></button>
              </div>
            </div>
            <div className="mt-4">
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Current Balance</p>
              <p className={`text-xl font-bold ${account.currentBalance < 0 ? 'text-red-500' : ''}`}>{formatCurrency(account.currentBalance)}</p>
            </div>
            <div className="mt-2 flex items-center gap-2">
              <span className={`text-xs px-2 py-0.5 rounded-full ${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>{account.type.replace('_', ' ')}</span>
              <span className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>{account.currency}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Archived Accounts */}
      {archivedAccounts.length > 0 && (
        <div>
          <h2 className={`text-lg font-semibold mb-3 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Archived Accounts</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 opacity-60">
            {archivedAccounts.map(account => (
              <div key={account.id} className={`border rounded-xl p-5 ${cardClass}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">{account.name}</h3>
                    <p className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>{formatCurrency(account.currentBalance)}</p>
                  </div>
                  <button onClick={() => dispatch(accountActions.updateAccount({ id: account.id, changes: { isArchived: false } }))}
                    className="text-xs text-emerald-600 hover:underline">Unarchive</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className={`w-full max-w-md ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6 shadow-xl`}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">{editingId ? 'Edit Account' : 'New Account'}</h2>
              <button onClick={() => setShowForm(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Account Name</label>
                <input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required
                  className={`w-full px-3 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-200'} outline-none focus:ring-2 focus:ring-emerald-500`} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Type</label>
                <select value={form.type} onChange={e => setForm({...form, type: e.target.value as AccountType})}
                  className={`w-full px-3 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-200'} outline-none focus:ring-2 focus:ring-emerald-500`}>
                  <option value="bank">Bank</option>
                  <option value="cash">Cash</option>
                  <option value="credit_card">Credit Card</option>
                  <option value="investment">Investment</option>
                  <option value="loan">Loan</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Institution</label>
                <input type="text" value={form.institution} onChange={e => setForm({...form, institution: e.target.value})}
                  className={`w-full px-3 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-200'} outline-none focus:ring-2 focus:ring-emerald-500`} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Opening Balance</label>
                  <input type="number" step="0.01" value={form.openingBalance} onChange={e => setForm({...form, openingBalance: parseFloat(e.target.value) || 0})}
                    className={`w-full px-3 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-200'} outline-none focus:ring-2 focus:ring-emerald-500`} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Current Balance</label>
                  <input type="number" step="0.01" value={form.currentBalance} onChange={e => setForm({...form, currentBalance: parseFloat(e.target.value) || 0})}
                    className={`w-full px-3 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-200'} outline-none focus:ring-2 focus:ring-emerald-500`} />
                </div>
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
