import React, { useState, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { formatCurrency, calculateCashFlow, calculateExpenseByCategory, calculateIncomeBySource, calculateNetWorth, getCurrentMonth, getMonthLabel } from '../utils/calculations';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, LineChart, Line } from 'recharts';
import { Download, FileText, Printer } from 'lucide-react';

export default function ReportsPage() {
  const darkMode = useSelector((s: RootState) => s.ui.darkMode);
  const transactions = useSelector((s: RootState) => s.transactions.data);
  const categories = useSelector((s: RootState) => s.categories.data);
  const accounts = useSelector((s: RootState) => s.accounts.data);
  const investments = useSelector((s: RootState) => s.investments.data);
  const budgets = useSelector((s: RootState) => s.budgets.data);
  const goals = useSelector((s: RootState) => s.goals.data);
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth());
  const [reportType, setReportType] = useState<'overview' | 'income' | 'expense' | 'investment'>('overview');

  const cardClass = darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200';

  const cashFlow = calculateCashFlow(transactions, selectedMonth);
  const expenseByCategory = calculateExpenseByCategory(transactions, categories, selectedMonth);
  const incomeBySource = calculateIncomeBySource(transactions, categories, selectedMonth);
  const { totalAssets, totalLiabilities, netWorth } = calculateNetWorth(accounts);

  // Monthly trend data
  const monthlyTrend = useMemo(() => {
    return Array.from({ length: 6 }, (_, i) => {
      const date = new Date();
      date.setMonth(date.getMonth() - (5 - i));
      const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const cf = calculateCashFlow(transactions, month);
      return { month: date.toLocaleDateString('en-US', { month: 'short' }), income: cf.income, expenses: cf.expenses, savings: cf.netCashFlow };
    });
  }, [transactions]);

  // Investment summary
  const investmentSummary = investments.map(inv => ({
    symbol: inv.symbol,
    value: inv.quantity * inv.currentPrice,
    pnl: (inv.currentPrice - inv.averageCost) * inv.quantity,
    returnPct: inv.averageCost > 0 ? ((inv.currentPrice - inv.averageCost) / inv.averageCost) * 100 : 0
  }));

  const handleExportCSV = () => {
    let headers: string[] = [];
    let rows: string[][] = [];

    if (reportType === 'expense') {
      headers = ['Category', 'Amount', 'Percentage'];
      rows = expenseByCategory.map(e => [e.categoryName, e.amount.toFixed(2), ((e.amount / (cashFlow.expenses || 1)) * 100).toFixed(1) + '%']);
    } else if (reportType === 'income') {
      headers = ['Source', 'Amount', 'Percentage'];
      rows = incomeBySource.map(e => [e.categoryName, e.amount.toFixed(2), ((e.amount / (cashFlow.income || 1)) * 100).toFixed(1) + '%']);
    } else {
      headers = ['Metric', 'Value'];
      rows = [
        ['Net Worth', netWorth.toFixed(2)],
        ['Total Assets', totalAssets.toFixed(2)],
        ['Total Liabilities', totalLiabilities.toFixed(2)],
        ['Monthly Income', cashFlow.income.toFixed(2)],
        ['Monthly Expenses', cashFlow.expenses.toFixed(2)],
        ['Monthly Savings', cashFlow.netCashFlow.toFixed(2)],
        ['Savings Rate', cashFlow.savingsRate.toFixed(1) + '%'],
      ];
    }

    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `report-${reportType}-${selectedMonth}.csv`;
    a.click();
  };

  const monthOptions = Array.from({ length: 12 }, (_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Financial Reports</h1>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Analyze your financial data</p>
        </div>
        <div className="flex gap-2">
          <select value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)}
            className={`px-3 py-2 rounded-lg border text-sm ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-200'}`}>
            {monthOptions.map(m => <option key={m} value={m}>{getMonthLabel(m)}</option>)}
          </select>
          <button onClick={handleExportCSV} className={`flex items-center gap-2 px-3 py-2 border rounded-lg text-sm ${darkMode ? 'border-gray-600 hover:bg-gray-700' : 'border-gray-200 hover:bg-gray-50'}`}>
            <Download size={14} /> Export
          </button>
        </div>
      </div>

      {/* Report Type Tabs */}
      <div className="flex gap-2 overflow-x-auto">
        {(['overview', 'income', 'expense', 'investment'] as const).map(type => (
          <button key={type} onClick={() => setReportType(type)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              reportType === type ? 'bg-emerald-600 text-white' : darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-100 border'
            }`}>
            {type.charAt(0).toUpperCase() + type.slice(1)} Report
          </button>
        ))}
      </div>

      {/* Overview Report */}
      {reportType === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className={`border rounded-xl p-4 ${cardClass}`}>
              <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Net Worth</p>
              <p className="text-xl font-bold mt-1">{formatCurrency(netWorth)}</p>
            </div>
            <div className={`border rounded-xl p-4 ${cardClass}`}>
              <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Income</p>
              <p className="text-xl font-bold mt-1 text-emerald-600">{formatCurrency(cashFlow.income)}</p>
            </div>
            <div className={`border rounded-xl p-4 ${cardClass}`}>
              <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Expenses</p>
              <p className="text-xl font-bold mt-1 text-red-500">{formatCurrency(cashFlow.expenses)}</p>
            </div>
            <div className={`border rounded-xl p-4 ${cardClass}`}>
              <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Savings Rate</p>
              <p className="text-xl font-bold mt-1">{cashFlow.savingsRate}%</p>
            </div>
          </div>

          <div className={`border rounded-xl p-5 ${cardClass}`}>
            <h3 className="font-semibold mb-4">6-Month Trend</h3>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={monthlyTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#374151' : '#e5e7eb'} />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke={darkMode ? '#9ca3af' : '#6b7280'} />
                <YAxis tick={{ fontSize: 12 }} stroke={darkMode ? '#9ca3af' : '#6b7280'} />
                <Tooltip contentStyle={{ backgroundColor: darkMode ? '#1f2937' : '#fff', border: 'none', borderRadius: 8 }} />
                <Legend />
                <Bar dataKey="income" fill="#10b981" name="Income" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expenses" fill="#ef4444" name="Expenses" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Income Report */}
      {reportType === 'income' && (
        <div className="space-y-6">
          <div className={`border rounded-xl p-5 ${cardClass}`}>
            <h3 className="font-semibold mb-4">Income Sources - {getMonthLabel(selectedMonth)}</h3>
            <p className="text-2xl font-bold text-emerald-600 mb-4">{formatCurrency(cashFlow.income)}</p>
            <div className="space-y-3">
              {incomeBySource.map(item => (
                <div key={item.categoryId} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-sm">{item.categoryName}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{formatCurrency(item.amount)}</p>
                    <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>{((item.amount / (cashFlow.income || 1)) * 100).toFixed(1)}%</p>
                  </div>
                </div>
              ))}
              {incomeBySource.length === 0 && <p className="text-sm text-gray-400">No income recorded for this month</p>}
            </div>
          </div>
        </div>
      )}

      {/* Expense Report */}
      {reportType === 'expense' && (
        <div className="space-y-6">
          <div className={`border rounded-xl p-5 ${cardClass}`}>
            <h3 className="font-semibold mb-4">Expense Breakdown - {getMonthLabel(selectedMonth)}</h3>
            <p className="text-2xl font-bold text-red-500 mb-4">{formatCurrency(cashFlow.expenses)}</p>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <div className="space-y-3">
                  {expenseByCategory.map(item => (
                    <div key={item.categoryId}>
                      <div className="flex justify-between text-sm mb-1">
                        <span>{item.categoryName}</span>
                        <span className={darkMode ? 'text-gray-400' : 'text-gray-500'}>{formatCurrency(item.amount)}</span>
                      </div>
                      <div className={`h-2 rounded-full ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                        <div className="h-full rounded-full" style={{ width: `${(item.amount / (cashFlow.expenses || 1)) * 100}%`, backgroundColor: item.color }} />
                      </div>
                    </div>
                  ))}
                  {expenseByCategory.length === 0 && <p className="text-sm text-gray-400">No expenses recorded for this month</p>}
                </div>
              </div>
              {expenseByCategory.length > 0 && (
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie data={expenseByCategory} dataKey="amount" nameKey="categoryName" cx="50%" cy="50%" outerRadius={90}>
                      {expenseByCategory.map((entry, idx) => <Cell key={idx} fill={entry.color} />)}
                    </Pie>
                    <Tooltip formatter={(value: number) => formatCurrency(value)} contentStyle={{ backgroundColor: darkMode ? '#1f2937' : '#fff', border: 'none', borderRadius: 8 }} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Investment Report */}
      {reportType === 'investment' && (
        <div className="space-y-6">
          <div className={`border rounded-xl p-5 ${cardClass}`}>
            <h3 className="font-semibold mb-4">Investment Portfolio Summary</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className={`text-left text-xs font-medium uppercase ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    <th className="px-4 py-2">Symbol</th>
                    <th className="px-4 py-2 text-right">Value</th>
                    <th className="px-4 py-2 text-right">P/L</th>
                    <th className="px-4 py-2 text-right">Return</th>
                  </tr>
                </thead>
                <tbody className="divide-y dark:divide-gray-700">
                  {investmentSummary.map((inv, idx) => (
                    <tr key={idx}>
                      <td className="px-4 py-2 text-sm font-medium">{inv.symbol}</td>
                      <td className="px-4 py-2 text-sm text-right">{formatCurrency(inv.value)}</td>
                      <td className={`px-4 py-2 text-sm text-right ${inv.pnl >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>{inv.pnl >= 0 ? '+' : ''}{formatCurrency(inv.pnl)}</td>
                      <td className={`px-4 py-2 text-sm text-right ${inv.returnPct >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>{inv.returnPct >= 0 ? '+' : ''}{inv.returnPct.toFixed(2)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {investmentSummary.length === 0 && <p className="text-sm text-gray-400 text-center py-4">No investments recorded</p>}
          </div>
        </div>
      )}
    </div>
  );
}
