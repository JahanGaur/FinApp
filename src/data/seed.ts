import { Category, Account, Transaction, Budget, Goal, Investment, Notification, NetWorthSnapshot, User, FinancialProfile } from '../types';
import { v4 as uuidv4 } from 'uuid';

// ============ Default Categories ============
export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'cat-housing', userId: null, name: 'Housing', type: 'expense', color: '#ef4444', icon: 'home' },
  { id: 'cat-food', userId: null, name: 'Food', type: 'expense', color: '#f97316', icon: 'utensils' },
  { id: 'cat-transport', userId: null, name: 'Transport', type: 'expense', color: '#eab308', icon: 'car' },
  { id: 'cat-utilities', userId: null, name: 'Utilities', type: 'expense', color: '#84cc16', icon: 'zap' },
  { id: 'cat-healthcare', userId: null, name: 'Healthcare', type: 'expense', color: '#22c55e', icon: 'heart' },
  { id: 'cat-education', userId: null, name: 'Education', type: 'expense', color: '#14b8a6', icon: 'graduation-cap' },
  { id: 'cat-entertainment', userId: null, name: 'Entertainment', type: 'expense', color: '#06b6d4', icon: 'film' },
  { id: 'cat-shopping', userId: null, name: 'Shopping', type: 'expense', color: '#3b82f6', icon: 'shopping-bag' },
  { id: 'cat-subscriptions', userId: null, name: 'Subscriptions', type: 'expense', color: '#8b5cf6', icon: 'repeat' },
  { id: 'cat-insurance', userId: null, name: 'Insurance', type: 'expense', color: '#a855f7', icon: 'shield' },
  { id: 'cat-debt', userId: null, name: 'Debt', type: 'expense', color: '#ec4899', icon: 'credit-card' },
  { id: 'cat-investments', userId: null, name: 'Investments', type: 'expense', color: '#f43f5e', icon: 'trending-up' },
  { id: 'cat-salary', userId: null, name: 'Salary', type: 'income', color: '#10b981', icon: 'briefcase' },
  { id: 'cat-freelance', userId: null, name: 'Freelance', type: 'income', color: '#059669', icon: 'laptop' },
  { id: 'cat-other-income', userId: null, name: 'Other Income', type: 'income', color: '#047857', icon: 'plus-circle' },
  { id: 'cat-other-expense', userId: null, name: 'Other Expense', type: 'expense', color: '#6b7280', icon: 'more-horizontal' },
];

// ============ Seed Data Generator ============
export function generateSeedData(userId: string) {
  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const lastMonth = now.getMonth() === 0 
    ? `${now.getFullYear() - 1}-12` 
    : `${now.getFullYear()}-${String(now.getMonth()).padStart(2, '0')}`;

  const demoUser: User = {
    id: userId,
    email: 'demo@finpilot.local',
    password: 'DemoPassword123!',
    fullName: 'Demo User',
    createdAt: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString()
  };

  const demoProfile: FinancialProfile = {
    userId,
    fullName: 'Demo User',
    currency: 'USD',
    country: 'US',
    monthlyIncome: 7500,
    monthlyFixedExpenses: 3200,
    monthlyVariableExpenses: 1800,
    emergencyFund: 15000,
    riskTolerance: 'moderate',
    financialGoals: 'Build emergency fund, save for home down payment, start investing for retirement',
    dependents: 0,
    ageRange: '25-34'
  };

  const accounts: Account[] = [
    { id: uuidv4(), userId, name: 'Checking Account', type: 'bank', institution: 'Chase Bank', currency: 'USD', openingBalance: 5000, currentBalance: 8450.50, isArchived: false, createdAt: now.toISOString(), updatedAt: now.toISOString() },
    { id: uuidv4(), userId, name: 'Savings Account', type: 'bank', institution: 'Ally Bank', currency: 'USD', openingBalance: 10000, currentBalance: 15200.00, isArchived: false, createdAt: now.toISOString(), updatedAt: now.toISOString() },
    { id: uuidv4(), userId, name: 'Credit Card', type: 'credit_card', institution: 'Capital One', currency: 'USD', openingBalance: 0, currentBalance: -1250.75, isArchived: false, createdAt: now.toISOString(), updatedAt: now.toISOString() },
    { id: uuidv4(), userId, name: 'Investment Account', type: 'investment', institution: 'Vanguard', currency: 'USD', openingBalance: 20000, currentBalance: 24500.00, isArchived: false, createdAt: now.toISOString(), updatedAt: now.toISOString() },
    { id: uuidv4(), userId, name: 'Emergency Cash', type: 'cash', institution: 'Home', currency: 'USD', openingBalance: 500, currentBalance: 500.00, isArchived: false, createdAt: now.toISOString(), updatedAt: now.toISOString() },
    { id: uuidv4(), userId, name: 'Student Loan', type: 'loan', institution: 'Federal Loans', currency: 'USD', openingBalance: 35000, currentBalance: -28500.00, isArchived: false, createdAt: now.toISOString(), updatedAt: now.toISOString() },
  ];

  // Generate transactions for last 3 months
  const transactions: Transaction[] = [];
  const incomeCategories = ['cat-salary', 'cat-freelance', 'cat-other-income'];
  const expenseCategories = ['cat-housing', 'cat-food', 'cat-transport', 'cat-utilities', 'cat-healthcare', 'cat-entertainment', 'cat-shopping', 'cat-subscriptions', 'cat-insurance'];
  
  const expenseDescriptions: Record<string, string[]> = {
    'cat-housing': ['Rent Payment', 'Home Insurance'],
    'cat-food': ['Grocery Store', 'Restaurant', 'Coffee Shop', 'Food Delivery'],
    'cat-transport': ['Gas Station', 'Uber Ride', 'Parking', 'Car Maintenance'],
    'cat-utilities': ['Electric Bill', 'Internet Bill', 'Phone Bill', 'Water Bill'],
    'cat-healthcare': ['Pharmacy', 'Doctor Visit', 'Gym Membership'],
    'cat-entertainment': ['Netflix', 'Movie Tickets', 'Concert Tickets', 'Spotify'],
    'cat-shopping': ['Amazon Purchase', 'Clothing Store', 'Electronics'],
    'cat-subscriptions': ['Cloud Storage', 'News Subscription', 'Software License'],
    'cat-insurance': ['Health Insurance', 'Car Insurance'],
  };

  for (let monthOffset = 0; monthOffset < 3; monthOffset++) {
    const date = new Date(now.getFullYear(), now.getMonth() - monthOffset, 1);
    const monthStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    
    // Salary
    transactions.push({
      id: uuidv4(), userId, accountId: accounts[0].id, type: 'income',
      amount: 6500, currency: 'USD', categoryId: 'cat-salary',
      description: 'Monthly Salary', date: `${monthStr}-01`, merchant: 'Employer Inc.',
      tags: ['salary'], notes: '', createdAt: date.toISOString(), updatedAt: date.toISOString()
    });

    // Freelance
    if (monthOffset < 2) {
      transactions.push({
        id: uuidv4(), userId, accountId: accounts[0].id, type: 'income',
        amount: 1000 + Math.floor(Math.random() * 500), currency: 'USD', categoryId: 'cat-freelance',
        description: 'Freelance Project', date: `${monthStr}-15`, merchant: 'Client Co.',
        tags: ['freelance'], notes: '', createdAt: date.toISOString(), updatedAt: date.toISOString()
      });
    }

    // Expenses
    const expenseEntries = [
      { cat: 'cat-housing', amounts: [1800], days: [1] },
      { cat: 'cat-food', amounts: [120, 85, 45, 35, 95, 60], days: [3, 7, 10, 14, 18, 22] },
      { cat: 'cat-transport', amounts: [55, 25, 15], days: [5, 12, 20] },
      { cat: 'cat-utilities', amounts: [85, 60, 45], days: [5, 8, 10] },
      { cat: 'cat-entertainment', amounts: [15, 30, 12], days: [6, 15, 25] },
      { cat: 'cat-shopping', amounts: [75, 120], days: [10, 20] },
      { cat: 'cat-subscriptions', amounts: [15, 10, 12], days: [1, 1, 5] },
      { cat: 'cat-insurance', amounts: [250, 120], days: [1, 15] },
    ];

    expenseEntries.forEach(entry => {
      entry.amounts.forEach((amount, idx) => {
        const descriptions = expenseDescriptions[entry.cat] || ['Expense'];
        const day = Math.min(entry.days[idx] || 1, 28);
        transactions.push({
          id: uuidv4(), userId, accountId: accounts[0].id, type: 'expense',
          amount, currency: 'USD', categoryId: entry.cat,
          description: descriptions[idx % descriptions.length],
          date: `${monthStr}-${String(day).padStart(2, '0')}`,
          merchant: '', tags: [], notes: '',
          createdAt: date.toISOString(), updatedAt: date.toISOString()
        });
      });
    });

    // Credit card transactions
    transactions.push({
      id: uuidv4(), userId, accountId: accounts[2].id, type: 'expense',
      amount: 350, currency: 'USD', categoryId: 'cat-shopping',
      description: 'Online Shopping', date: `${monthStr}-12`, merchant: 'Amazon',
      tags: ['online'], notes: '', createdAt: date.toISOString(), updatedAt: date.toISOString()
    });
    transactions.push({
      id: uuidv4(), userId, accountId: accounts[2].id, type: 'expense',
      amount: 180, currency: 'USD', categoryId: 'cat-food',
      description: 'Restaurant Dinner', date: `${monthStr}-18`, merchant: 'Italian Place',
      tags: [], notes: '', createdAt: date.toISOString(), updatedAt: date.toISOString()
    });
  }

  // Budgets for current month
  const budgets: Budget[] = [
    { id: uuidv4(), userId, categoryId: 'cat-housing', month: currentMonth, limit: 1900, createdAt: now.toISOString(), updatedAt: now.toISOString() },
    { id: uuidv4(), userId, categoryId: 'cat-food', month: currentMonth, limit: 600, createdAt: now.toISOString(), updatedAt: now.toISOString() },
    { id: uuidv4(), userId, categoryId: 'cat-transport', month: currentMonth, limit: 200, createdAt: now.toISOString(), updatedAt: now.toISOString() },
    { id: uuidv4(), userId, categoryId: 'cat-entertainment', month: currentMonth, limit: 150, createdAt: now.toISOString(), updatedAt: now.toISOString() },
    { id: uuidv4(), userId, categoryId: 'cat-shopping', month: currentMonth, limit: 300, createdAt: now.toISOString(), updatedAt: now.toISOString() },
    { id: uuidv4(), userId, categoryId: 'cat-subscriptions', month: currentMonth, limit: 100, createdAt: now.toISOString(), updatedAt: now.toISOString() },
    { id: uuidv4(), userId, categoryId: 'cat-utilities', month: currentMonth, limit: 250, createdAt: now.toISOString(), updatedAt: now.toISOString() },
  ];

  // Goals
  const goals: Goal[] = [
    { id: uuidv4(), userId, name: 'Emergency Fund', type: 'emergency_fund', targetAmount: 25000, currentAmount: 15000, deadline: '2026-06-01', priority: 'high', monthlyContribution: 1000, status: 'active', createdAt: now.toISOString(), updatedAt: now.toISOString() },
    { id: uuidv4(), userId, name: 'Home Down Payment', type: 'home', targetAmount: 60000, currentAmount: 12000, deadline: '2028-12-01', priority: 'high', monthlyContribution: 800, status: 'active', createdAt: now.toISOString(), updatedAt: now.toISOString() },
    { id: uuidv4(), userId, name: 'Vacation Fund', type: 'vacation', targetAmount: 5000, currentAmount: 2500, deadline: '2026-08-01', priority: 'medium', monthlyContribution: 300, status: 'active', createdAt: now.toISOString(), updatedAt: now.toISOString() },
    { id: uuidv4(), userId, name: 'Retirement Savings', type: 'retirement', targetAmount: 500000, currentAmount: 45000, deadline: '2060-01-01', priority: 'medium', monthlyContribution: 500, status: 'active', createdAt: now.toISOString(), updatedAt: now.toISOString() },
  ];

  // Investments
  const investments: Investment[] = [
    { id: uuidv4(), userId, symbol: 'VTI', name: 'Vanguard Total Stock Market ETF', assetType: 'etf', quantity: 50, averageCost: 220, currentPrice: 245, currency: 'USD', notes: 'Core holding', createdAt: now.toISOString(), updatedAt: now.toISOString() },
    { id: uuidv4(), userId, symbol: 'BND', name: 'Vanguard Total Bond Market ETF', assetType: 'etf', quantity: 100, averageCost: 78, currentPrice: 72, currency: 'USD', notes: 'Fixed income allocation', createdAt: now.toISOString(), updatedAt: now.toISOString() },
    { id: uuidv4(), userId, symbol: 'AAPL', name: 'Apple Inc.', assetType: 'stock', quantity: 25, averageCost: 150, currentPrice: 185, currency: 'USD', notes: 'Tech allocation', createdAt: now.toISOString(), updatedAt: now.toISOString() },
    { id: uuidv4(), userId, symbol: 'MSFT', name: 'Microsoft Corp.', assetType: 'stock', quantity: 15, averageCost: 300, currentPrice: 380, currency: 'USD', notes: 'Tech allocation', createdAt: now.toISOString(), updatedAt: now.toISOString() },
    { id: uuidv4(), userId, symbol: 'BTC', name: 'Bitcoin', assetType: 'crypto', quantity: 0.5, averageCost: 35000, currentPrice: 42000, currency: 'USD', notes: 'Crypto allocation', createdAt: now.toISOString(), updatedAt: now.toISOString() },
  ];

  // Notifications
  const notifications: Notification[] = [
    { id: uuidv4(), userId, type: 'budget_near_limit', title: 'Budget Alert', message: 'You\'ve used 80% of your Food budget this month.', isRead: false, createdAt: now.toISOString() },
    { id: uuidv4(), userId, type: 'goal_milestone', title: 'Goal Milestone', message: 'Your Emergency Fund is 60% complete! Keep going!', isRead: false, createdAt: now.toISOString() },
    { id: uuidv4(), userId, type: 'monthly_report', title: 'Monthly Report', message: 'Your financial summary for this month is ready.', isRead: true, createdAt: now.toISOString() },
    { id: uuidv4(), userId, type: 'large_expense', title: 'Large Expense', message: 'A $1,800 expense was recorded for Housing.', isRead: true, createdAt: now.toISOString() },
  ];

  // Net worth snapshots (last 6 months)
  const netWorthSnapshots: NetWorthSnapshot[] = [];
  for (let i = 5; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const dateStr = date.toISOString().split('T')[0];
    const growth = (5 - i) * 1200;
    netWorthSnapshots.push({
      id: uuidv4(),
      userId,
      date: dateStr,
      totalAssets: 42000 + growth,
      totalLiabilities: 29750 - (i * 200),
      netWorth: (42000 + growth) - (29750 - (i * 200))
    });
  }

  return {
    user: demoUser,
    profile: demoProfile,
    accounts,
    transactions,
    budgets,
    goals,
    investments,
    notifications,
    netWorthSnapshots,
  };
}
