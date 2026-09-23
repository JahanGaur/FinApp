import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, profileActions, uiActions } from '../store';
import { FinancialProfile, RiskTolerance } from '../types';
import { calculateSavingsRate, calculateEmergencyFundCoverage, formatCurrency } from '../utils/calculations';
import { User, Shield, Palette, Trash2, Save, Calculator } from 'lucide-react';

export default function SettingsPage() {
  const dispatch = useDispatch();
  const darkMode = useSelector((s: RootState) => s.ui.darkMode);
  const profile = useSelector((s: RootState) => s.profile.data);
  const user = useSelector((s: RootState) => s.auth.user);
  const [activeTab, setActiveTab] = useState<'profile' | 'preferences' | 'calculators' | 'danger'>('profile');
  const [form, setForm] = useState<Partial<FinancialProfile>>({
    fullName: profile?.fullName || user?.fullName || '',
    currency: profile?.currency || 'USD',
    country: profile?.country || 'US',
    monthlyIncome: profile?.monthlyIncome || 0,
    monthlyFixedExpenses: profile?.monthlyFixedExpenses || 0,
    monthlyVariableExpenses: profile?.monthlyVariableExpenses || 0,
    emergencyFund: profile?.emergencyFund || 0,
    riskTolerance: profile?.riskTolerance || 'moderate',
    financialGoals: profile?.financialGoals || '',
    dependents: profile?.dependents || 0,
    ageRange: profile?.ageRange || '25-34',
  });
  const [saved, setSaved] = useState(false);

  const cardClass = darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200';

  const handleSave = () => {
    dispatch(profileActions.setProfile({
      userId: user?.id || '',
      fullName: form.fullName || '',
      currency: form.currency || 'USD',
      country: form.country || 'US',
      monthlyIncome: form.monthlyIncome || 0,
      monthlyFixedExpenses: form.monthlyFixedExpenses || 0,
      monthlyVariableExpenses: form.monthlyVariableExpenses || 0,
      emergencyFund: form.emergencyFund || 0,
      riskTolerance: form.riskTolerance || 'moderate',
      financialGoals: form.financialGoals || '',
      dependents: form.dependents || 0,
      ageRange: form.ageRange || '25-34',
    }));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const monthlyExpenses = (form.monthlyFixedExpenses || 0) + (form.monthlyVariableExpenses || 0);
  const savingsRate = calculateSavingsRate(form.monthlyIncome || 0, monthlyExpenses);
  const emergencyCoverage = calculateEmergencyFundCoverage(form.emergencyFund || 0, monthlyExpenses);
  const expenseToIncomeRatio = (form.monthlyIncome || 0) > 0 ? (monthlyExpenses / (form.monthlyIncome || 1)) * 100 : 0;

  const tabs = [
    { id: 'profile', label: 'Financial Profile', icon: User },
    { id: 'preferences', label: 'Preferences', icon: Palette },
    { id: 'calculators', label: 'Calculators', icon: Calculator },
    { id: 'danger', label: 'Account', icon: Shield },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Manage your profile and preferences</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto">
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              activeTab === tab.id ? 'bg-emerald-600 text-white' : darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-100 border'
            }`}>
            <tab.icon size={16} /> {tab.label}
          </button>
        ))}
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className={`border rounded-xl p-6 ${cardClass}`}>
          <h2 className="text-lg font-semibold mb-4">Financial Profile</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Full Name</label>
              <input type="text" value={form.fullName || ''} onChange={e => setForm({...form, fullName: e.target.value})}
                className={`w-full px-3 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-200'} outline-none focus:ring-2 focus:ring-emerald-500`} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Currency</label>
              <select value={form.currency} onChange={e => setForm({...form, currency: e.target.value})}
                className={`w-full px-3 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-200'} outline-none focus:ring-2 focus:ring-emerald-500`}>
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="CAD">CAD (C$)</option>
                <option value="AUD">AUD (A$)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Country</label>
              <input type="text" value={form.country || ''} onChange={e => setForm({...form, country: e.target.value})}
                className={`w-full px-3 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-200'} outline-none focus:ring-2 focus:ring-emerald-500`} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Age Range</label>
              <select value={form.ageRange} onChange={e => setForm({...form, ageRange: e.target.value})}
                className={`w-full px-3 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-200'} outline-none focus:ring-2 focus:ring-emerald-500`}>
                <option value="18-24">18-24</option>
                <option value="25-34">25-34</option>
                <option value="35-44">35-44</option>
                <option value="45-54">45-54</option>
                <option value="55-64">55-64</option>
                <option value="65+">65+</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Monthly Income</label>
              <input type="number" step="0.01" value={form.monthlyIncome || ''} onChange={e => setForm({...form, monthlyIncome: parseFloat(e.target.value) || 0})}
                className={`w-full px-3 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-200'} outline-none focus:ring-2 focus:ring-emerald-500`} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Monthly Fixed Expenses</label>
              <input type="number" step="0.01" value={form.monthlyFixedExpenses || ''} onChange={e => setForm({...form, monthlyFixedExpenses: parseFloat(e.target.value) || 0})}
                className={`w-full px-3 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-200'} outline-none focus:ring-2 focus:ring-emerald-500`} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Monthly Variable Expenses</label>
              <input type="number" step="0.01" value={form.monthlyVariableExpenses || ''} onChange={e => setForm({...form, monthlyVariableExpenses: parseFloat(e.target.value) || 0})}
                className={`w-full px-3 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-200'} outline-none focus:ring-2 focus:ring-emerald-500`} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Emergency Fund</label>
              <input type="number" step="0.01" value={form.emergencyFund || ''} onChange={e => setForm({...form, emergencyFund: parseFloat(e.target.value) || 0})}
                className={`w-full px-3 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-200'} outline-none focus:ring-2 focus:ring-emerald-500`} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Risk Tolerance</label>
              <select value={form.riskTolerance} onChange={e => setForm({...form, riskTolerance: e.target.value as RiskTolerance})}
                className={`w-full px-3 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-200'} outline-none focus:ring-2 focus:ring-emerald-500`}>
                <option value="conservative">Conservative</option>
                <option value="moderate">Moderate</option>
                <option value="aggressive">Aggressive</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Dependents</label>
              <input type="number" min="0" value={form.dependents || ''} onChange={e => setForm({...form, dependents: parseInt(e.target.value) || 0})}
                className={`w-full px-3 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-200'} outline-none focus:ring-2 focus:ring-emerald-500`} />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Financial Goals Description</label>
              <textarea value={form.financialGoals || ''} onChange={e => setForm({...form, financialGoals: e.target.value})} rows={3}
                className={`w-full px-3 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-200'} outline-none focus:ring-2 focus:ring-emerald-500`} />
            </div>
          </div>

          {/* Quick Stats */}
          <div className={`mt-6 p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
            <h3 className="text-sm font-semibold mb-3">Quick Calculations</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Savings Rate</p>
                <p className={`text-lg font-bold ${savingsRate >= 20 ? 'text-emerald-600' : savingsRate >= 10 ? 'text-yellow-600' : 'text-red-500'}`}>{savingsRate}%</p>
              </div>
              <div>
                <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Expense-to-Income Ratio</p>
                <p className={`text-lg font-bold ${expenseToIncomeRatio <= 80 ? 'text-emerald-600' : 'text-red-500'}`}>{expenseToIncomeRatio.toFixed(1)}%</p>
              </div>
              <div>
                <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Emergency Fund Coverage</p>
                <p className={`text-lg font-bold ${emergencyCoverage >= 6 ? 'text-emerald-600' : emergencyCoverage >= 3 ? 'text-yellow-600' : 'text-red-500'}`}>{emergencyCoverage} months</p>
              </div>
            </div>
          </div>

          <div className="mt-6 flex items-center gap-3">
            <button onClick={handleSave} className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium">
              <Save size={16} /> Save Profile
            </button>
            {saved && <span className="text-sm text-emerald-600">✓ Saved successfully</span>}
          </div>
        </div>
      )}

      {/* Preferences Tab */}
      {activeTab === 'preferences' && (
        <div className={`border rounded-xl p-6 ${cardClass}`}>
          <h2 className="text-lg font-semibold mb-4">Preferences</h2>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Dark Mode</p>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Toggle between light and dark theme</p>
              </div>
              <button onClick={() => dispatch(uiActions.toggleDarkMode())}
                className={`w-12 h-6 rounded-full transition-colors ${darkMode ? 'bg-emerald-600' : 'bg-gray-300'} relative`}>
                <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${darkMode ? 'translate-x-6' : 'translate-x-0.5'}`} />
              </button>
            </div>
            <div className={`pt-4 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <p className="font-medium">Data Management</p>
              <p className={`text-sm mb-3 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Your data is stored locally in your browser.</p>
              <button onClick={() => {
                if (confirm('Export all data as JSON?')) {
                  const data = localStorage.getItem('finpilot_data');
                  if (data) {
                    const blob = new Blob([data], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'finpilot-backup.json';
                    a.click();
                  }
                }
              }} className="px-4 py-2 border rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-gray-700">
                Export Data (JSON)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Calculators Tab */}
      {activeTab === 'calculators' && (
        <div className={`border rounded-xl p-6 ${cardClass}`}>
          <h2 className="text-lg font-semibold mb-4">Financial Calculators</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <h3 className="font-medium mb-2">Compound Interest</h3>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'} mb-3`}>See how your investments can grow over time.</p>
              <CompoundInterestCalculator darkMode={darkMode} />
            </div>
            <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <h3 className="font-medium mb-2">Loan Payment</h3>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'} mb-3`}>Calculate monthly loan payments.</p>
              <LoanCalculator darkMode={darkMode} />
            </div>
          </div>
        </div>
      )}

      {/* Danger Zone */}
      {activeTab === 'danger' && (
        <div className={`border rounded-xl p-6 ${cardClass}`}>
          <h2 className="text-lg font-semibold mb-4">Account</h2>
          <div className="space-y-4">
            <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <p className="font-medium">{user?.fullName}</p>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{user?.email}</p>
              <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'} mt-1`}>Member since {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</p>
            </div>
            <div className={`p-4 rounded-lg border-2 border-red-200 dark:border-red-900/50`}>
              <h3 className="font-medium text-red-600 mb-2">Danger Zone</h3>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'} mb-3`}>
                Clearing data will remove all your financial information from this browser. This cannot be undone.
              </p>
              <button onClick={() => {
                if (confirm('Are you sure? This will delete ALL your data permanently.')) {
                  localStorage.clear();
                  window.location.href = '/';
                }
              }} className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium">
                <Trash2 size={14} /> Clear All Data
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Calculator components
function CompoundInterestCalculator({ darkMode }: { darkMode: boolean }) {
  const [principal, setPrincipal] = useState(10000);
  const [rate, setRate] = useState(7);
  const [years, setYears] = useState(20);
  const [monthly, setMonthly] = useState(500);

  const futureValue = principal * Math.pow(1 + rate / 100, years) + 
    monthly * ((Math.pow(1 + rate / 100, years) - 1) / (rate / 100 / 12));
  const totalContributed = principal + (monthly * 12 * years);
  const interestEarned = futureValue - totalContributed;

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-xs">Initial ($)</label>
          <input type="number" value={principal} onChange={e => setPrincipal(Number(e.target.value))} className={`w-full px-2 py-1 rounded border text-sm ${darkMode ? 'bg-gray-600 border-gray-500 text-white' : 'border-gray-200'}`} />
        </div>
        <div>
          <label className="text-xs">Monthly ($)</label>
          <input type="number" value={monthly} onChange={e => setMonthly(Number(e.target.value))} className={`w-full px-2 py-1 rounded border text-sm ${darkMode ? 'bg-gray-600 border-gray-500 text-white' : 'border-gray-200'}`} />
        </div>
        <div>
          <label className="text-xs">Rate (%)</label>
          <input type="number" value={rate} onChange={e => setRate(Number(e.target.value))} className={`w-full px-2 py-1 rounded border text-sm ${darkMode ? 'bg-gray-600 border-gray-500 text-white' : 'border-gray-200'}`} />
        </div>
        <div>
          <label className="text-xs">Years</label>
          <input type="number" value={years} onChange={e => setYears(Number(e.target.value))} className={`w-full px-2 py-1 rounded border text-sm ${darkMode ? 'bg-gray-600 border-gray-500 text-white' : 'border-gray-200'}`} />
        </div>
      </div>
      <div className="pt-2 border-t dark:border-gray-600">
        <p className="text-sm">Future Value: <strong className="text-emerald-600">{formatCurrency(futureValue)}</strong></p>
        <p className="text-xs text-gray-500">Contributed: {formatCurrency(totalContributed)} | Interest: {formatCurrency(interestEarned)}</p>
      </div>
    </div>
  );
}

function LoanCalculator({ darkMode }: { darkMode: boolean }) {
  const [amount, setAmount] = useState(25000);
  const [rate, setRate] = useState(5);
  const [years, setYears] = useState(5);

  const monthlyRate = rate / 100 / 12;
  const payments = years * 12;
  const monthlyPayment = monthlyRate > 0 ? (amount * monthlyRate * Math.pow(1 + monthlyRate, payments)) / (Math.pow(1 + monthlyRate, payments) - 1) : amount / payments;
  const totalPaid = monthlyPayment * payments;
  const totalInterest = totalPaid - amount;

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-2">
        <div>
          <label className="text-xs">Amount ($)</label>
          <input type="number" value={amount} onChange={e => setAmount(Number(e.target.value))} className={`w-full px-2 py-1 rounded border text-sm ${darkMode ? 'bg-gray-600 border-gray-500 text-white' : 'border-gray-200'}`} />
        </div>
        <div>
          <label className="text-xs">Rate (%)</label>
          <input type="number" value={rate} onChange={e => setRate(Number(e.target.value))} className={`w-full px-2 py-1 rounded border text-sm ${darkMode ? 'bg-gray-600 border-gray-500 text-white' : 'border-gray-200'}`} />
        </div>
        <div>
          <label className="text-xs">Years</label>
          <input type="number" value={years} onChange={e => setYears(Number(e.target.value))} className={`w-full px-2 py-1 rounded border text-sm ${darkMode ? 'bg-gray-600 border-gray-500 text-white' : 'border-gray-200'}`} />
        </div>
      </div>
      <div className="pt-2 border-t dark:border-gray-600">
        <p className="text-sm">Monthly Payment: <strong className="text-emerald-600">{formatCurrency(monthlyPayment)}</strong></p>
        <p className="text-xs text-gray-500">Total: {formatCurrency(totalPaid)} | Interest: {formatCurrency(totalInterest)}</p>
      </div>
    </div>
  );
}
