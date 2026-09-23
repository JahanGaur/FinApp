import { Account, Transaction, Budget, Goal, Investment, Category } from '../types';

// ============ Financial Calculation Engine ============
// All calculations use integer cents internally to avoid floating-point errors

export function toCents(amount: number): number {
  return Math.round(amount * 100);
}

export function fromCents(cents: number): number {
  return cents / 100;
}

export function calculateNetWorth(accounts: Account[]): { totalAssets: number; totalLiabilities: number; netWorth: number } {
  const assetTypes = ['cash', 'bank', 'investment'];
  const liabilityTypes = ['credit_card', 'loan'];
  
  const totalAssets = accounts
    .filter(a => assetTypes.includes(a.type) && !a.isArchived)
    .reduce((sum, a) => sum + a.currentBalance, 0);
  
  const totalLiabilities = accounts
    .filter(a => liabilityTypes.includes(a.type) && !a.isArchived)
    .reduce((sum, a) => sum + Math.abs(a.currentBalance), 0);
  
  return {
    totalAssets: Math.round(totalAssets * 100) / 100,
    totalLiabilities: Math.round(totalLiabilities * 100) / 100,
    netWorth: Math.round((totalAssets - totalLiabilities) * 100) / 100
  };
}

export function calculateCashFlow(transactions: Transaction[], month: string): { income: number; expenses: number; netCashFlow: number; savingsRate: number } {
  const monthTransactions = transactions.filter(t => t.date.startsWith(month) && t.type !== 'transfer');
  
  const income = monthTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const expenses = monthTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const netCashFlow = income - expenses;
  const savingsRate = income > 0 ? (netCashFlow / income) * 100 : 0;
  
  return {
    income: Math.round(income * 100) / 100,
    expenses: Math.round(expenses * 100) / 100,
    netCashFlow: Math.round(netCashFlow * 100) / 100,
    savingsRate: Math.round(savingsRate * 10) / 10
  };
}

export function calculateBudgetUsage(budget: Budget, transactions: Transaction[], categories: Category[]): { actualSpent: number; remaining: number; usagePercentage: number } {
  const category = categories.find(c => c.id === budget.categoryId);
  if (!category) return { actualSpent: 0, remaining: budget.limit, usagePercentage: 0 };
  
  const actualSpent = transactions
    .filter(t => 
      t.type === 'expense' && 
      t.categoryId === budget.categoryId && 
      t.date.startsWith(budget.month)
    )
    .reduce((sum, t) => sum + t.amount, 0);
  
  const remaining = budget.limit - actualSpent;
  const usagePercentage = budget.limit > 0 ? (actualSpent / budget.limit) * 100 : 0;
  
  return {
    actualSpent: Math.round(actualSpent * 100) / 100,
    remaining: Math.round(remaining * 100) / 100,
    usagePercentage: Math.round(usagePercentage * 10) / 10
  };
}

export function calculateGoalProgress(goal: Goal): { percentageCompleted: number; remainingAmount: number; estimatedCompletionDate: string | null } {
  const percentageCompleted = goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0;
  const remainingAmount = goal.targetAmount - goal.currentAmount;
  
  let estimatedCompletionDate: string | null = null;
  if (goal.monthlyContribution > 0 && remainingAmount > 0) {
    const monthsNeeded = Math.ceil(remainingAmount / goal.monthlyContribution);
    const date = new Date();
    date.setMonth(date.getMonth() + monthsNeeded);
    estimatedCompletionDate = date.toISOString().split('T')[0];
  } else if (remainingAmount <= 0) {
    estimatedCompletionDate = new Date().toISOString().split('T')[0];
  }
  
  return {
    percentageCompleted: Math.min(Math.round(percentageCompleted * 10) / 10, 100),
    remainingAmount: Math.round(remainingAmount * 100) / 100,
    estimatedCompletionDate
  };
}

export function calculateInvestmentValue(investment: Investment): { marketValue: number; costBasis: number; unrealizedPnL: number; returnPercentage: number } {
  const marketValue = investment.quantity * investment.currentPrice;
  const costBasis = investment.quantity * investment.averageCost;
  const unrealizedPnL = marketValue - costBasis;
  const returnPercentage = costBasis > 0 ? ((marketValue - costBasis) / costBasis) * 100 : 0;
  
  return {
    marketValue: Math.round(marketValue * 100) / 100,
    costBasis: Math.round(costBasis * 100) / 100,
    unrealizedPnL: Math.round(unrealizedPnL * 100) / 100,
    returnPercentage: Math.round(returnPercentage * 100) / 100
  };
}

export function calculateSavingsRate(income: number, expenses: number): number {
  if (income <= 0) return 0;
  return Math.round(((income - expenses) / income) * 1000) / 10;
}

export function calculateEmergencyFundCoverage(emergencyFund: number, monthlyExpenses: number): number {
  if (monthlyExpenses <= 0) return 0;
  return Math.round((emergencyFund / monthlyExpenses) * 10) / 10;
}

export function calculateRequiredMonthlyContribution(targetAmount: number, currentAmount: number, monthsRemaining: number): number {
  const remaining = targetAmount - currentAmount;
  if (remaining <= 0) return 0;
  if (monthsRemaining <= 0) return remaining;
  return Math.round((remaining / monthsRemaining) * 100) / 100;
}

export function calculateExpenseByCategory(transactions: Transaction[], categories: Category[], month?: string): { categoryId: string; categoryName: string; color: string; amount: number }[] {
  const filtered = month 
    ? transactions.filter(t => t.type === 'expense' && t.date.startsWith(month))
    : transactions.filter(t => t.type === 'expense');
  
  const grouped: Record<string, number> = {};
  filtered.forEach(t => {
    grouped[t.categoryId] = (grouped[t.categoryId] || 0) + t.amount;
  });
  
  return Object.entries(grouped).map(([categoryId, amount]) => {
    const cat = categories.find(c => c.id === categoryId);
    return {
      categoryId,
      categoryName: cat?.name || 'Unknown',
      color: cat?.color || '#6b7280',
      amount: Math.round(amount * 100) / 100
    };
  }).sort((a, b) => b.amount - a.amount);
}

export function calculateIncomeBySource(transactions: Transaction[], categories: Category[], month?: string): { categoryId: string; categoryName: string; color: string; amount: number }[] {
  const filtered = month 
    ? transactions.filter(t => t.type === 'income' && t.date.startsWith(month))
    : transactions.filter(t => t.type === 'income');
  
  const grouped: Record<string, number> = {};
  filtered.forEach(t => {
    grouped[t.categoryId] = (grouped[t.categoryId] || 0) + t.amount;
  });
  
  return Object.entries(grouped).map(([categoryId, amount]) => {
    const cat = categories.find(c => c.id === categoryId);
    return {
      categoryId,
      categoryName: cat?.name || 'Unknown',
      color: cat?.color || '#6b7280',
      amount: Math.round(amount * 100) / 100
    };
  }).sort((a, b) => b.amount - a.amount);
}

export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

export function getCurrentMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

export function getMonthLabel(month: string): string {
  const [year, m] = month.split('-');
  const date = new Date(parseInt(year), parseInt(m) - 1);
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
}
