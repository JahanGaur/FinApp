import { configureStore, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { User, FinancialProfile, Account, Transaction, Category, Budget, Goal, Investment, Notification, NetWorthSnapshot, AIConversation, AIMessage } from '../types';
import { DEFAULT_CATEGORIES, generateSeedData } from '../data/seed';
import { v4 as uuidv4 } from 'uuid';

// ============ Storage Helper ============
const STORAGE_KEY = 'finpilot_data';

function loadFromStorage() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : null;
  } catch { return null; }
}

function saveToStorage(state: any) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      user: state.auth.user,
      profile: state.profile.data,
      accounts: state.accounts.data,
      transactions: state.transactions.data,
      categories: state.categories.data,
      budgets: state.budgets.data,
      goals: state.goals.data,
      investments: state.investments.data,
      notifications: state.notifications.data,
      netWorthSnapshots: state.netWorth.data,
      aiConversations: state.ai.data,
      darkMode: state.ui.darkMode,
    }));
  } catch (e) { console.error('Storage save failed', e); }
}

function restoreFromStorage() {
  const data = loadFromStorage();
  if (!data) return null;
  return data;
}

// ============ Auth Slice ============
const stored = restoreFromStorage();

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: stored?.user as User | null,
    isAuthenticated: !!stored?.user,
    loading: false,
    error: null as string | null,
  },
  reducers: {
    login(state, action: PayloadAction<{ email: string; password: string }>) {
      const { email, password } = action.payload;
      if (email === 'demo@finpilot.local' && password === 'DemoPassword123!') {
        const seed = generateSeedData('demo-user-001');
        state.user = seed.user;
        state.isAuthenticated = true;
        state.error = null;
        // Store seed data
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
          user: seed.user, profile: seed.profile, accounts: seed.accounts,
          transactions: seed.transactions, categories: DEFAULT_CATEGORIES,
          budgets: seed.budgets, goals: seed.goals, investments: seed.investments,
          notifications: seed.notifications, netWorthSnapshots: seed.netWorthSnapshots,
          aiConversations: [], darkMode: false,
        }));
      } else {
        // Check stored users
        const users = JSON.parse(localStorage.getItem('finpilot_users') || '[]');
        const found = users.find((u: User) => u.email === email && u.password === password);
        if (found) {
          state.user = found;
          state.isAuthenticated = true;
          state.error = null;
        } else {
          state.error = 'Invalid email or password';
        }
      }
    },
    register(state, action: PayloadAction<{ email: string; password: string; fullName: string }>) {
      const { email, password, fullName } = action.payload;
      const users = JSON.parse(localStorage.getItem('finpilot_users') || '[]');
      if (users.find((u: User) => u.email === email)) {
        state.error = 'Email already registered';
        return;
      }
      const newUser: User = { id: uuidv4(), email, password, fullName, createdAt: new Date().toISOString() };
      users.push(newUser);
      localStorage.setItem('finpilot_users', JSON.stringify(users));
      
      // Initialize empty data for new user
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        user: newUser, profile: null, accounts: [], transactions: [],
        categories: DEFAULT_CATEGORIES, budgets: [], goals: [], investments: [],
        notifications: [], netWorthSnapshots: [], aiConversations: [], darkMode: false,
      }));
      
      state.user = newUser;
      state.isAuthenticated = true;
      state.error = null;
    },
    logout(state) {
      state.user = null;
      state.isAuthenticated = false;
    },
    setError(state, action: PayloadAction<string>) {
      state.error = action.payload;
    },
    clearError(state) {
      state.error = null;
    },
  }
});

// ============ Profile Slice ============
const profileSlice = createSlice({
  name: 'profile',
  initialState: { data: stored?.profile as FinancialProfile | null, loading: false },
  reducers: {
    setProfile(state, action: PayloadAction<FinancialProfile>) { state.data = action.payload; },
    updateProfile(state, action: PayloadAction<Partial<FinancialProfile>>) {
      if (state.data) state.data = { ...state.data, ...action.payload };
    },
  }
});

// ============ Accounts Slice ============
const accountsSlice = createSlice({
  name: 'accounts',
  initialState: { data: (stored?.accounts || []) as Account[], loading: false },
  reducers: {
    addAccount(state, action: PayloadAction<Account>) { state.data.push(action.payload); },
    updateAccount(state, action: PayloadAction<{ id: string; changes: Partial<Account> }>) {
      const idx = state.data.findIndex(a => a.id === action.payload.id);
      if (idx !== -1) state.data[idx] = { ...state.data[idx], ...action.payload.changes, updatedAt: new Date().toISOString() };
    },
    deleteAccount(state, action: PayloadAction<string>) {
      state.data = state.data.filter(a => a.id !== action.payload);
    },
    setAccounts(state, action: PayloadAction<Account[]>) { state.data = action.payload; },
  }
});

// ============ Transactions Slice ============
const transactionsSlice = createSlice({
  name: 'transactions',
  initialState: { data: (stored?.transactions || []) as Transaction[], loading: false },
  reducers: {
    addTransaction(state, action: PayloadAction<Transaction>) { state.data.push(action.payload); },
    updateTransaction(state, action: PayloadAction<{ id: string; changes: Partial<Transaction> }>) {
      const idx = state.data.findIndex(t => t.id === action.payload.id);
      if (idx !== -1) state.data[idx] = { ...state.data[idx], ...action.payload.changes, updatedAt: new Date().toISOString() };
    },
    deleteTransaction(state, action: PayloadAction<string>) {
      state.data = state.data.filter(t => t.id !== action.payload);
    },
    setTransactions(state, action: PayloadAction<Transaction[]>) { state.data = action.payload; },
  }
});

// ============ Categories Slice ============
const categoriesSlice = createSlice({
  name: 'categories',
  initialState: { data: (stored?.categories || DEFAULT_CATEGORIES) as Category[] },
  reducers: {
    addCategory(state, action: PayloadAction<Category>) { state.data.push(action.payload); },
    deleteCategory(state, action: PayloadAction<string>) {
      state.data = state.data.filter(c => c.id !== action.payload);
    },
  }
});

// ============ Budgets Slice ============
const budgetsSlice = createSlice({
  name: 'budgets',
  initialState: { data: (stored?.budgets || []) as Budget[] },
  reducers: {
    addBudget(state, action: PayloadAction<Budget>) { state.data.push(action.payload); },
    updateBudget(state, action: PayloadAction<{ id: string; changes: Partial<Budget> }>) {
      const idx = state.data.findIndex(b => b.id === action.payload.id);
      if (idx !== -1) state.data[idx] = { ...state.data[idx], ...action.payload.changes, updatedAt: new Date().toISOString() };
    },
    deleteBudget(state, action: PayloadAction<string>) {
      state.data = state.data.filter(b => b.id !== action.payload);
    },
  }
});

// ============ Goals Slice ============
const goalsSlice = createSlice({
  name: 'goals',
  initialState: { data: (stored?.goals || []) as Goal[] },
  reducers: {
    addGoal(state, action: PayloadAction<Goal>) { state.data.push(action.payload); },
    updateGoal(state, action: PayloadAction<{ id: string; changes: Partial<Goal> }>) {
      const idx = state.data.findIndex(g => g.id === action.payload.id);
      if (idx !== -1) state.data[idx] = { ...state.data[idx], ...action.payload.changes, updatedAt: new Date().toISOString() };
    },
    deleteGoal(state, action: PayloadAction<string>) {
      state.data = state.data.filter(g => g.id !== action.payload);
    },
    contributeToGoal(state, action: PayloadAction<{ id: string; amount: number }>) {
      const idx = state.data.findIndex(g => g.id === action.payload.id);
      if (idx !== -1) {
        state.data[idx].currentAmount += action.payload.amount;
        state.data[idx].updatedAt = new Date().toISOString();
        if (state.data[idx].currentAmount >= state.data[idx].targetAmount) {
          state.data[idx].status = 'completed';
        }
      }
    },
  }
});

// ============ Investments Slice ============
const investmentsSlice = createSlice({
  name: 'investments',
  initialState: { data: (stored?.investments || []) as Investment[] },
  reducers: {
    addInvestment(state, action: PayloadAction<Investment>) { state.data.push(action.payload); },
    updateInvestment(state, action: PayloadAction<{ id: string; changes: Partial<Investment> }>) {
      const idx = state.data.findIndex(i => i.id === action.payload.id);
      if (idx !== -1) state.data[idx] = { ...state.data[idx], ...action.payload.changes, updatedAt: new Date().toISOString() };
    },
    deleteInvestment(state, action: PayloadAction<string>) {
      state.data = state.data.filter(i => i.id !== action.payload);
    },
  }
});

// ============ Notifications Slice ============
const notificationsSlice = createSlice({
  name: 'notifications',
  initialState: { data: (stored?.notifications || []) as Notification[] },
  reducers: {
    addNotification(state, action: PayloadAction<Notification>) { state.data.unshift(action.payload); },
    markRead(state, action: PayloadAction<string>) {
      const n = state.data.find(n => n.id === action.payload);
      if (n) n.isRead = true;
    },
    markAllRead(state) { state.data.forEach(n => n.isRead = true); },
    deleteNotification(state, action: PayloadAction<string>) {
      state.data = state.data.filter(n => n.id !== action.payload);
    },
  }
});

// ============ Net Worth Slice ============
const netWorthSlice = createSlice({
  name: 'netWorth',
  initialState: { data: (stored?.netWorthSnapshots || []) as NetWorthSnapshot[] },
  reducers: {
    addSnapshot(state, action: PayloadAction<NetWorthSnapshot>) { state.data.push(action.payload); },
    setSnapshots(state, action: PayloadAction<NetWorthSnapshot[]>) { state.data = action.payload; },
  }
});

// ============ AI Slice ============
const aiSlice = createSlice({
  name: 'ai',
  initialState: { data: (stored?.aiConversations || []) as AIConversation[], activeConversationId: null as string | null },
  reducers: {
    addConversation(state, action: PayloadAction<AIConversation>) {
      state.data.push(action.payload);
      state.activeConversationId = action.payload.id;
    },
    addMessage(state, action: PayloadAction<{ conversationId: string; message: AIMessage }>) {
      const conv = state.data.find(c => c.id === action.payload.conversationId);
      if (conv) {
        conv.messages.push(action.payload.message);
        conv.updatedAt = new Date().toISOString();
      }
    },
    setActiveConversation(state, action: PayloadAction<string>) {
      state.activeConversationId = action.payload;
    },
    deleteConversation(state, action: PayloadAction<string>) {
      state.data = state.data.filter(c => c.id !== action.payload);
      if (state.activeConversationId === action.payload) state.activeConversationId = null;
    },
  }
});

// ============ UI Slice ============
const uiSlice = createSlice({
  name: 'ui',
  initialState: { darkMode: stored?.darkMode || false, sidebarOpen: true },
  reducers: {
    toggleDarkMode(state) { state.darkMode = !state.darkMode; },
    setDarkMode(state, action: PayloadAction<boolean>) { state.darkMode = action.payload; },
    toggleSidebar(state) { state.sidebarOpen = !state.sidebarOpen; },
    setSidebarOpen(state, action: PayloadAction<boolean>) { state.sidebarOpen = action.payload; },
  }
});

// ============ Store ============
export const store = configureStore({
  reducer: {
    auth: authSlice.reducer,
    profile: profileSlice.reducer,
    accounts: accountsSlice.reducer,
    transactions: transactionsSlice.reducer,
    categories: categoriesSlice.reducer,
    budgets: budgetsSlice.reducer,
    goals: goalsSlice.reducer,
    investments: investmentsSlice.reducer,
    notifications: notificationsSlice.reducer,
    netWorth: netWorthSlice.reducer,
    ai: aiSlice.reducer,
    ui: uiSlice.reducer,
  }
});

// Subscribe to save state on changes
store.subscribe(() => {
  const state = store.getState();
  if (state.auth.isAuthenticated) {
    saveToStorage(state);
  }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Export actions
export const authActions = authSlice.actions;
export const profileActions = profileSlice.actions;
export const accountActions = accountsSlice.actions;
export const transactionActions = transactionsSlice.actions;
export const categoryActions = categoriesSlice.actions;
export const budgetActions = budgetsSlice.actions;
export const goalActions = goalsSlice.actions;
export const investmentActions = investmentsSlice.actions;
export const notificationActions = notificationsSlice.actions;
export const netWorthActions = netWorthSlice.actions;
export const aiActions = aiSlice.actions;
export const uiActions = uiSlice.actions;
