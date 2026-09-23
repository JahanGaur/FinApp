import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { RootState, authActions } from '../store';
import { TrendingUp, Eye, EyeOff } from 'lucide-react';

export function LoginPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { error, loading } = useSelector((s: RootState) => s.auth);
  const darkMode = useSelector((s: RootState) => s.ui.darkMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(authActions.login({ email, password }));
  };

  const isAuthenticated = useSelector((s: RootState) => s.auth.isAuthenticated);
  React.useEffect(() => {
    if (isAuthenticated) navigate('/dashboard');
  }, [isAuthenticated, navigate]);

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 ${darkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-emerald-50 to-teal-50'}`}>
      <div className={`w-full max-w-md ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-xl p-8`}>
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center">
            <TrendingUp size={22} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-emerald-600">FinPilot</h1>
        </div>
        
        <h2 className={`text-xl font-semibold text-center mb-6 ${darkMode ? 'text-white' : 'text-gray-800'}`}>Welcome back</h2>
        
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className={`w-full px-4 py-2.5 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-200'} focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none`}
              placeholder="demo@finpilot.local"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                className={`w-full px-4 py-2.5 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-200'} focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none pr-10`}
                placeholder="DemoPassword123!"
                required
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            Don't have an account?{' '}
            <Link to="/register" className="text-emerald-600 font-medium hover:underline">Sign up</Link>
          </p>
        </div>

        <div className={`mt-6 p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-emerald-50'} text-xs`}>
          <p className="font-medium text-emerald-700 dark:text-emerald-400">Demo Account:</p>
          <p className="text-gray-600 dark:text-gray-300 mt-1">Email: demo@finpilot.local</p>
          <p className="text-gray-600 dark:text-gray-300">Password: DemoPassword123!</p>
        </div>
      </div>
    </div>
  );
}

export function RegisterPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { error } = useSelector((s: RootState) => s.auth);
  const darkMode = useSelector((s: RootState) => s.ui.darkMode);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [localError, setLocalError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setLocalError('Passwords do not match');
      return;
    }
    if (password.length < 8) {
      setLocalError('Password must be at least 8 characters');
      return;
    }
    dispatch(authActions.register({ email, password, fullName }));
  };

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 ${darkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-emerald-50 to-teal-50'}`}>
      <div className={`w-full max-w-md ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-xl p-8`}>
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center">
            <TrendingUp size={22} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-emerald-600">FinPilot</h1>
        </div>
        
        <h2 className={`text-xl font-semibold text-center mb-6 ${darkMode ? 'text-white' : 'text-gray-800'}`}>Create your account</h2>
        
        {(error || localError) && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
            {error || localError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Full Name</label>
            <input
              type="text"
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              className={`w-full px-4 py-2.5 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-200'} focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none`}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className={`w-full px-4 py-2.5 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-200'} focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none`}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className={`w-full px-4 py-2.5 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-200'} focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none`}
              required
              minLength={8}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              className={`w-full px-4 py-2.5 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-200'} focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none`}
              required
            />
          </div>
          <button
            type="submit"
            className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-colors"
          >
            Create Account
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            Already have an account?{' '}
            <Link to="/login" className="text-emerald-600 font-medium hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
