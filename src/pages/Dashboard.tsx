import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { calculateNetWorth, calculateCashFlow, calculateBudgetUsage, calculateGoalProgress, calculateInvestmentValue, calculateExpenseByCategory, getCurrentMonth, formatCurrency } from '../utils/calculations';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, Legend } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, PiggyBank, Target, Briefcase, ArrowUpRight, ArrowDownRight } from 'lucide-react';

export default function Dashboard() {
  const darkMode = useSelector((s: RootState) => s.ui.darkMode);
  const accounts = useSelector((s: RootState) => s.accounts.data);
  const transactions = useSelector((s: RootState) => s.transactions.data);
  const budgets = useSelector((s: RootState) => s.budgets.data);
  const goals = useSelector((s: RootState) => s.goals.data);
  const investments = useSelector((s: RootState) => s.investments.data);
  const categories = useSelector((s: RootState) => s.categories.data);
  const netWorthSnapshots = useSelector((s: RootState) => s.netWorth.data);
  const profile = useSelector((s: RootState) => s.profile.data);

  const currentMonth = getCurrentMonth();
  const { totalAssets, totalLiabilities, netWorth } = calculateNetWorth(accounts);
  const { income, expenses, netCashFlow, savingsRate } = calculateCashFlow(transactions, currentMonth);
  
  const portfolioValue = investments.reduce((sum, inv) => sum + calculateInvestmentValue(inv).marketValue, 0);
  const portfolioPnL = investments.reduce((sum, inv) => sum + calculateInvestmentValue(inv).unrealizedPnL, 0);

  const totalBudgetLimit = budgets.reduce((sum, b) => sum + b.limit, 0);
  const totalBudgetSpent = budgets.reduce((sum, b) => sum + calculateBudgetUsage(b, transactions, categories).actualSpent, 0);
  const budgetUtilization = totalBudgetLimit > 0 ? (totalBudgetSpent / totalBudgetLimit) * 100 : 0;

  const expenseByCategory = calculateExpenseByCategory(transactions, categories, currentMonth);
  
  const recentTransactions = [...transactions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 8);

  // Cash flow chart data (last 6 months)
  const cashFlowData = Array.from({ length: 6 }, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - (5 - i));
    const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const cf = calculateCashFlow(transactions, month);
    return {
      month: date.toLocaleDateString('en-US', { month: 'short' }),
      income: cf.income,
      expenses: cf.expenses,
      savings: cf.netCashFlow
    };
  });

  // Net worth chart data
  const netWorthChartData = netWorthSnapshots.map(s => ({
    date: new Date(s.date).toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
    netWorth: s.netWorth,
    assets: s.totalAssets,
    liabilities: s.totalLiabilities
  }));

  const cardClass = darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200';
  const textMuted = darkMode ? 'text-gray-400' : 'text-gray-500';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className={`text-sm ${textMuted}`}>Your financial overview for {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Net Worth"
          value={formatCurrency(netWorth)}
          icon={<DollarSign size={20} />}
          trend={netWorthSnapshots.length >= 2 ? ((netWorthSnapshots[netWorthSnapshots.length-1].netWorth - netWorthSnapshots[netWorthSnapshots.length-2].netWorth) / netWorthSnapshots[netWorthSnapshots.length-2].netWorth * 100) : 0}
          color="emerald"
          darkMode={darkMode}
        />
        <StatCard
          title="Monthly Income"
          value={formatCurrency(income)}
          icon={<ArrowUpRight size={20} />}
          trend={savingsRate}
          color="blue"
          darkMode={darkMode}
        />
        <StatCard
          title="Monthly Expenses"
          value={formatCurrency(expenses)}
          icon={<ArrowDownRight size={20} />}
          trend={-((expenses / (income || 1)) * 100 - 100)}
          color="red"
          darkMode={darkMode}
        />
        <StatCard
          title="Portfolio Value"
          value={formatCurrency(portfolioValue)}
          icon={<Briefcase size={20} />}
          trend={portfolioValue > 0 ? (portfolioPnL / (portfolioValue - portfolioPnL)) * 100 : 0}
          color="purple"
          darkMode={darkMode}
        />
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MiniCard title="Total Assets" value={formatCurrency(totalAssets)} darkMode={darkMode} />
        <MiniCard title="Total Liabilities" value={formatCurrency(totalLiabilities)} darkMode={darkMode} />
        <MiniCard title="Monthly Savings" value={formatCurrency(netCashFlow)} darkMode={darkMode} />
        <MiniCard title="Savings Rate" value={`${savingsRate}%`} darkMode={darkMode} />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cash Flow Chart */}
        <div className={`border rounded-xl p-5 ${cardClass}`}>
          <h3 className="font-semibold mb-4">Cash Flow (6 months)</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={cashFlowData}>
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

        {/* Expense Breakdown */}
        <div className={`border rounded-xl p-5 ${cardClass}`}>
          <h3 className="font-semibold mb-4">Expense Breakdown</h3>
          {expenseByCategory.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={expenseByCategory.slice(0, 6)}
                  dataKey="amount"
                  nameKey="categoryName"
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  label={({ categoryName, percent }) => `${categoryName} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {expenseByCategory.slice(0, 6).map((entry, idx) => (
                    <Cell key={idx} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => formatCurrency(value)} contentStyle={{ backgroundColor: darkMode ? '#1f2937' : '#fff', border: 'none', borderRadius: 8 }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[250px] flex items-center justify-center text-gray-400">No expense data</div>
          )}
        </div>
      </div>

      {/* Net Worth History */}
      <div className={`border rounded-xl p-5 ${cardClass}`}>
        <h3 className="font-semibold mb-4">Net Worth History</h3>
        {netWorthChartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={netWorthChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#374151' : '#e5e7eb'} />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke={darkMode ? '#9ca3af' : '#6b7280'} />
              <YAxis tick={{ fontSize: 12 }} stroke={darkMode ? '#9ca3af' : '#6b7280'} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
              <Tooltip formatter={(value: number) => formatCurrency(value)} contentStyle={{ backgroundColor: darkMode ? '#1f2937' : '#fff', border: 'none', borderRadius: 8 }} />
              <Legend />
              <Line type="monotone" dataKey="netWorth" stroke="#10b981" strokeWidth={2} name="Net Worth" dot={{ r: 4 }} />
              <Line type="monotone" dataKey="assets" stroke="#3b82f6" strokeWidth={1.5} name="Assets" strokeDasharray="5 5" />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[250px] flex items-center justify-center text-gray-400">No history data</div>
        )}
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Budget Utilization */}
        <div className={`border rounded-xl p-5 ${cardClass}`}>
          <h3 className="font-semibold mb-4">Budget Utilization</h3>
          <div className="space-y-3">
            {budgets.slice(0, 5).map(budget => {
              const usage = calculateBudgetUsage(budget, transactions, categories);
              const cat = categories.find(c => c.id === budget.categoryId);
              return (
                <div key={budget.id}>
                  <div className="flex justify-between text-sm mb-1">
                    <span>{cat?.name || 'Unknown'}</span>
                    <span className={darkMode ? 'text-gray-400' : 'text-gray-500'}>{formatCurrency(usage.actualSpent)} / {formatCurrency(budget.limit)}</span>
                  </div>
                  <div className={`h-2 rounded-full ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                    <div
                      className={`h-full rounded-full transition-all ${usage.usagePercentage > 100 ? 'bg-red-500' : usage.usagePercentage > 80 ? 'bg-yellow-500' : 'bg-emerald-500'}`}
                      style={{ width: `${Math.min(usage.usagePercentage, 100)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-4 pt-3 border-t dark:border-gray-700">
            <div className="flex justify-between text-sm">
              <span className="font-medium">Overall</span>
              <span className={budgetUtilization > 100 ? 'text-red-500' : 'text-emerald-600'}>{budgetUtilization.toFixed(1)}%</span>
            </div>
          </div>
        </div>

        {/* Goals Progress */}
        <div className={`border rounded-xl p-5 ${cardClass}`}>
          <h3 className="font-semibold mb-4">Goal Progress</h3>
          <div className="space-y-4">
            {goals.slice(0, 4).map(goal => {
              const progress = calculateGoalProgress(goal);
              return (
                <div key={goal.id}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium">{goal.name}</span>
                    <span className={darkMode ? 'text-gray-400' : 'text-gray-500'}>{progress.percentageCompleted}%</span>
                  </div>
                  <div className={`h-2 rounded-full ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                    <div
                      className="h-full rounded-full bg-emerald-500 transition-all"
                      style={{ width: `${Math.min(progress.percentageCompleted, 100)}%` }}
                    />
                  </div>
                  <p className={`text-xs mt-1 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                    {formatCurrency(goal.currentAmount)} of {formatCurrency(goal.targetAmount)}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Transactions */}
        <div className={`border rounded-xl p-5 ${cardClass}`}>
          <h3 className="font-semibold mb-4">Recent Transactions</h3>
          <div className="space-y-3">
            {recentTransactions.map(t => {
              const cat = categories.find(c => c.id === t.categoryId);
              return (
                <div key={t.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${t.type === 'income' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                      {t.type === 'income' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                    </div>
                    <div>
                      <p className="text-sm font-medium truncate max-w-[120px]">{t.description}</p>
                      <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>{cat?.name}</p>
                    </div>
                  </div>
                  <span className={`text-sm font-medium ${t.type === 'income' ? 'text-emerald-600' : 'text-red-600'}`}>
                    {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <div className={`text-xs text-center p-3 rounded-lg ${darkMode ? 'bg-gray-800 text-gray-500' : 'bg-gray-100 text-gray-500'}`}>
        <p>⚠️ FinPilot provides financial management tools and educational information. This is not financial advice. Consult a qualified professional for investment, tax, or financial planning decisions.</p>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, trend, color, darkMode }: { title: string; value: string; icon: React.ReactNode; trend: number; color: string; darkMode: boolean }) {
  const colors: Record<string, string> = {
    emerald: 'bg-emerald-100 text-emerald-600',
    blue: 'bg-blue-100 text-blue-600',
    red: 'bg-red-100 text-red-600',
    purple: 'bg-purple-100 text-purple-600',
  };
  
  return (
    <div className={`border rounded-xl p-5 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
      <div className="flex items-center justify-between mb-3">
        <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{title}</span>
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${colors[color]}`}>
          {icon}
        </div>
      </div>
      <p className="text-2xl font-bold">{value}</p>
      {trend !== 0 && (
        <div className={`flex items-center gap-1 mt-1 text-xs ${trend > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
          {trend > 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
          <span>{Math.abs(trend).toFixed(1)}%</span>
        </div>
      )}
    </div>
  );
}

function MiniCard({ title, value, darkMode }: { title: string; value: string; darkMode: boolean }) {
  return (
    <div className={`border rounded-xl p-4 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
      <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{title}</p>
      <p className="text-lg font-semibold mt-1">{value}</p>
    </div>
  );
}
