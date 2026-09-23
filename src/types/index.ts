// ============ Core Types ============
export type RiskTolerance = 'conservative' | 'moderate' | 'aggressive';
export type AccountType = 'cash' | 'bank' | 'credit_card' | 'investment' | 'loan' | 'other';
export type TransactionType = 'income' | 'expense' | 'transfer';
export type GoalType = 'emergency_fund' | 'vacation' | 'vehicle' | 'home' | 'education' | 'retirement' | 'custom';
export type AssetType = 'stock' | 'etf' | 'mutual_fund' | 'bond' | 'crypto' | 'gold' | 'other';
export type GoalStatus = 'active' | 'completed' | 'paused';
export type NotificationType = 'budget_exceeded' | 'budget_near_limit' | 'goal_milestone' | 'large_expense' | 'monthly_report' | 'low_emergency_fund';

// ============ User & Auth ============
export interface User {
  id: string;
  email: string;
  password: string; // hashed in real app, plain for demo
  fullName: string;
  createdAt: string;
}

export interface FinancialProfile {
  userId: string;
  fullName: string;
  currency: string;
  country: string;
  monthlyIncome: number;
  monthlyFixedExpenses: number;
  monthlyVariableExpenses: number;
  emergencyFund: number;
  riskTolerance: RiskTolerance;
  financialGoals: string;
  dependents: number;
  ageRange: string;
}

// ============ Accounts ============
export interface Account {
  id: string;
  userId: string;
  name: string;
  type: AccountType;
  institution: string;
  currency: string;
  openingBalance: number;
  currentBalance: number;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}

// ============ Transactions ============
export interface Transaction {
  id: string;
  userId: string;
  accountId: string;
  type: TransactionType;
  amount: number;
  currency: string;
  categoryId: string;
  description: string;
  date: string;
  merchant: string;
  tags: string[];
  notes: string;
  toAccountId?: string; // for transfers
  createdAt: string;
  updatedAt: string;
}

// ============ Categories ============
export interface Category {
  id: string;
  userId: string | null; // null = system category
  name: string;
  type: 'income' | 'expense' | 'both';
  color: string;
  icon: string;
}

// ============ Budgets ============
export interface Budget {
  id: string;
  userId: string;
  categoryId: string;
  month: string; // YYYY-MM
  limit: number;
  createdAt: string;
  updatedAt: string;
}

// ============ Goals ============
export interface Goal {
  id: string;
  userId: string;
  name: string;
  type: GoalType;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  priority: 'low' | 'medium' | 'high';
  monthlyContribution: number;
  status: GoalStatus;
  createdAt: string;
  updatedAt: string;
}

// ============ Investments ============
export interface Investment {
  id: string;
  userId: string;
  symbol: string;
  name: string;
  assetType: AssetType;
  quantity: number;
  averageCost: number;
  currentPrice: number;
  currency: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

// ============ Notifications ============
export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

// ============ Net Worth Snapshot ============
export interface NetWorthSnapshot {
  id: string;
  userId: string;
  date: string;
  totalAssets: number;
  totalLiabilities: number;
  netWorth: number;
}

// ============ AI Chat ============
export interface AIMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface AIConversation {
  id: string;
  userId: string;
  title: string;
  messages: AIMessage[];
  createdAt: string;
  updatedAt: string;
}

// ============ Dashboard Data ============
export interface DashboardData {
  totalNetWorth: number;
  totalAssets: number;
  totalLiabilities: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  monthlySavings: number;
  savingsRate: number;
  budgetUtilization: number;
  portfolioValue: number;
  portfolioPnL: number;
}

// ============ App State ============
export interface AppState {
  user: User | null;
  isAuthenticated: boolean;
  darkMode: boolean;
  profile: FinancialProfile | null;
  accounts: Account[];
  transactions: Transaction[];
  categories: Category[];
  budgets: Budget[];
  goals: Goal[];
  investments: Investment[];
  notifications: Notification[];
  netWorthSnapshots: NetWorthSnapshot[];
  aiConversations: AIConversation[];
}
