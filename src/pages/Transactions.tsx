import React, { useState, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, transactionActions, accountActions } from '../store';
import { formatCurrency, formatDate, getCurrentMonth } from '../utils/calculations';
import { Transaction, TransactionType } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { Plus, Search, Download, X, ChevronLeft, ChevronRight, ArrowUpRight, ArrowDownRight, ArrowLeftRight, Edit2, Trash2 } from 'lucide-react';

const PAGE_SIZE = 15;

export default function TransactionsPage() {
  const dispatch = useDispatch();
  const darkMode = useSelector((s: RootState) => s.ui.darkMode);
  const transactions = useSelector((s: RootState) => s.transactions.data);
  const accounts = useSelector((s: RootState) => s.accounts.data);
  const categories = useSelector((s: RootState) => s.categories.data);
  const userId = useSelector((s: RootState) => s.auth.user?.id || '');
  
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterAccount, setFilterAccount] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterMonth, setFilterMonth] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    accountId: '', type: 'expense' as TransactionType, amount: 0, categoryId: '',
    description: '', date: new Date().toISOString().split('T')[0], merchant: '', notes: '', toAccountId: ''
  });

  const filtered = useMemo(() => {
    let result = [...transactions];
    if (search) {
      const s = search.toLowerCase();
      result = result.filter(t => t.description.toLowerCase().includes(s) || t.merchant.toLowerCase().includes(s) || t.notes.toLowerCase().includes(s));
    }
    if (filterType !== 'all') result = result.filter(t => t.type === filterType);
    if (filterAccount !== 'all') result = result.filter(t => t.accountId === filterAccount);
    if (filterCategory !== 'all') result = result.filter(t => t.categoryId === filterCategory);
    if (filterMonth !== 'all') result = result.filter(t => t.date.startsWith(filterMonth));
    return result.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, search, filterType, filterAccount, filterCategory, filterMonth]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const account = accounts.find(a => a.id === form.accountId);
    
    if (editingId) {
      const oldTx = transactions.find(t => t.id === editingId);
      dispatch(transactionActions.updateTransaction({ id: editingId, changes: form }));
      // Recalculate account balance
      if (oldTx && account) {
        let balanceChange = 0;
        if (oldTx.type === 'income') balanceChange -= oldTx.amount;
        else if (oldTx.type === 'expense') balanceChange += oldTx.amount;
        if (form.type === 'income') balanceChange += form.amount;
        else if (form.type === 'expense') balanceChange -= form.amount;
        dispatch(accountActions.updateAccount({ id: form.accountId, changes: { currentBalance: (account.currentBalance + balanceChange) } }));
      }
    } else {
      const newTx: Transaction = {
        id: uuidv4(), userId, ...form, currency: account?.currency || 'USD',
        tags: [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
      };
      dispatch(transactionActions.addTransaction(newTx));
      // Update account balance
      if (account) {
        let balanceChange = 0;
        if (form.type === 'income') balanceChange = form.amount;
        else if (form.type === 'expense') balanceChange = -form.amount;
        dispatch(accountActions.updateAccount({ id: form.accountId, changes: { currentBalance: account.currentBalance + balanceChange } }));
      }
    }
    setShowForm(false);
    setEditingId(null);
  };

  const handleDelete = (id: string) => {
    if (!confirm('Delete this transaction?')) return;
    const tx = transactions.find(t => t.id === id);
    if (tx) {
      const account = accounts.find(a => a.id === tx.accountId);
      if (account) {
        let balanceChange = 0;
        if (tx.type === 'income') balanceChange = -tx.amount;
        else if (tx.type === 'expense') balanceChange = tx.amount;
        dispatch(accountActions.updateAccount({ id: tx.accountId, changes: { currentBalance: account.currentBalance + balanceChange } }));
      }
    }
    dispatch(transactionActions.deleteTransaction(id));
  };

  const handleExport = () => {
    const headers = ['Date', 'Type', 'Amount', 'Category', 'Description', 'Account', 'Merchant'];
    const rows = filtered.map(t => {
      const cat = categories.find(c => c.id === t.categoryId);
      const acc = accounts.find(a => a.id === t.accountId);
      return [t.date, t.type, t.amount, cat?.name || '', t.description, acc?.name || '', t.merchant];
    });
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transactions-${getCurrentMonth()}.csv`;
    a.click();
  };

  const handleEdit = (tx: Transaction) => {
    setForm({ accountId: tx.accountId, type: tx.type, amount: tx.amount, categoryId: tx.categoryId, description: tx.description, date: tx.date, merchant: tx.merchant, notes: tx.notes, toAccountId: tx.toAccountId || '' });
    setEditingId(tx.id);
    setShowForm(true);
  };

  const cardClass = darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200';
  const expenseCategories = categories.filter(c => c.type === 'expense' || c.type === 'both');
  const incomeCategories = categories.filter(c => c.type === 'income' || c.type === 'both');
  const activeAccounts = accounts.filter(a => !a.isArchived);

  // Get available months
  const months = useMemo(() => {
    const set = new Set<string>();
    transactions.forEach(t => set.add(t.date.substring(0, 7)));
    return Array.from(set).sort().reverse();
  }, [transactions]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Transactions</h1>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{filtered.length} transactions</p>
        </div>
        <div className="flex gap-2">
          <button onClick={handleExport} className={`flex items-center gap-2 px-3 py-2 border rounded-lg text-sm ${darkMode ? 'border-gray-600 hover:bg-gray-700' : 'border-gray-200 hover:bg-gray-50'}`}>
            <Download size={14} /> Export CSV
          </button>
          <button onClick={() => { setShowForm(true); setEditingId(null); }} className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium">
            <Plus size={16} /> Add Transaction
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className={`border rounded-xl p-4 ${cardClass}`}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" placeholder="Search..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
              className={`w-full pl-9 pr-3 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-200'} outline-none text-sm`} />
          </div>
          <select value={filterType} onChange={e => { setFilterType(e.target.value); setPage(1); }}
            className={`px-3 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-200'} outline-none text-sm`}>
            <option value="all">All Types</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
            <option value="transfer">Transfer</option>
          </select>
          <select value={filterAccount} onChange={e => { setFilterAccount(e.target.value); setPage(1); }}
            className={`px-3 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-200'} outline-none text-sm`}>
            <option value="all">All Accounts</option>
            {activeAccounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
          </select>
          <select value={filterCategory} onChange={e => { setFilterCategory(e.target.value); setPage(1); }}
            className={`px-3 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-200'} outline-none text-sm`}>
            <option value="all">All Categories</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <select value={filterMonth} onChange={e => { setFilterMonth(e.target.value); setPage(1); }}
            className={`px-3 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-200'} outline-none text-sm`}>
            <option value="all">All Months</option>
            {months.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
      </div>

      {/* Transaction List */}
      <div className={`border rounded-xl overflow-hidden ${cardClass}`}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className={`text-left text-xs font-medium uppercase ${darkMode ? 'text-gray-400 bg-gray-750' : 'text-gray-500 bg-gray-50'}`}>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Description</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Account</th>
                <th className="px-4 py-3 text-right">Amount</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y dark:divide-gray-700">
              {paginated.map(tx => {
                const cat = categories.find(c => c.id === tx.categoryId);
                const acc = accounts.find(a => a.id === tx.accountId);
                return (
                  <tr key={tx.id} className={`${darkMode ? 'hover:bg-gray-750' : 'hover:bg-gray-50'} transition-colors`}>
                    <td className="px-4 py-3 text-sm">{formatDate(tx.date)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center ${tx.type === 'income' ? 'bg-emerald-100 text-emerald-600' : tx.type === 'transfer' ? 'bg-blue-100 text-blue-600' : 'bg-red-100 text-red-600'}`}>
                          {tx.type === 'income' ? <ArrowUpRight size={12} /> : tx.type === 'transfer' ? <ArrowLeftRight size={12} /> : <ArrowDownRight size={12} />}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{tx.description}</p>
                          {tx.merchant && <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>{tx.merchant}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: (cat?.color || '#6b7280') + '20', color: cat?.color || '#6b7280' }}>
                        {cat?.name || 'Uncategorized'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">{acc?.name || '-'}</td>
                    <td className={`px-4 py-3 text-sm text-right font-medium ${tx.type === 'income' ? 'text-emerald-600' : tx.type === 'expense' ? 'text-red-600' : 'text-blue-600'}`}>
                      {tx.type === 'income' ? '+' : tx.type === 'expense' ? '-' : ''}{formatCurrency(tx.amount)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => handleEdit(tx)} className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700"><Edit2 size={14} /></button>
                        <button onClick={() => handleDelete(tx.id)} className="p-1.5 rounded hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {paginated.length === 0 && (
          <div className="p-8 text-center text-gray-400">No transactions found</div>
        )}
        {/* Pagination */}
        {totalPages > 1 && (
          <div className={`flex items-center justify-between px-4 py-3 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <p className="text-sm text-gray-500">Page {page} of {totalPages}</p>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-1.5 rounded border disabled:opacity-50"><ChevronLeft size={16} /></button>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-1.5 rounded border disabled:opacity-50"><ChevronRight size={16} /></button>
            </div>
          </div>
        )}
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className={`w-full max-w-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6 shadow-xl max-h-[90vh] overflow-y-auto`}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">{editingId ? 'Edit Transaction' : 'New Transaction'}</h2>
              <button onClick={() => setShowForm(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Type</label>
                <div className="flex gap-2">
                  {(['expense', 'income', 'transfer'] as TransactionType[]).map(type => (
                    <button key={type} type="button" onClick={() => setForm({...form, type})}
                      className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${form.type === type ? 'bg-emerald-600 text-white border-emerald-600' : darkMode ? 'border-gray-600 hover:bg-gray-700' : 'border-gray-200 hover:bg-gray-50'}`}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Amount</label>
                  <input type="number" step="0.01" min="0.01" value={form.amount || ''} onChange={e => setForm({...form, amount: parseFloat(e.target.value) || 0})} required
                    className={`w-full px-3 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-200'} outline-none focus:ring-2 focus:ring-emerald-500`} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Date</label>
                  <input type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} required
                    className={`w-full px-3 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-200'} outline-none focus:ring-2 focus:ring-emerald-500`} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Account</label>
                <select value={form.accountId} onChange={e => setForm({...form, accountId: e.target.value})} required
                  className={`w-full px-3 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-200'} outline-none focus:ring-2 focus:ring-emerald-500`}>
                  <option value="">Select account</option>
                  {activeAccounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Category</label>
                <select value={form.categoryId} onChange={e => setForm({...form, categoryId: e.target.value})} required
                  className={`w-full px-3 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-200'} outline-none focus:ring-2 focus:ring-emerald-500`}>
                  <option value="">Select category</option>
                  {(form.type === 'income' ? incomeCategories : expenseCategories).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <input type="text" value={form.description} onChange={e => setForm({...form, description: e.target.value})} required
                  className={`w-full px-3 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-200'} outline-none focus:ring-2 focus:ring-emerald-500`} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Merchant (optional)</label>
                <input type="text" value={form.merchant} onChange={e => setForm({...form, merchant: e.target.value})}
                  className={`w-full px-3 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-200'} outline-none focus:ring-2 focus:ring-emerald-500`} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Notes (optional)</label>
                <textarea value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} rows={2}
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


