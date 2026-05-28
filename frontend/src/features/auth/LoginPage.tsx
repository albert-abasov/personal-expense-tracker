import React from 'react';
import { Wallet, TrendingUp, Target, BarChart3 } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

export const LoginPage: React.FC = () => {
  const handleGoogleLogin = () => {
    window.location.href = `${API_URL}/oauth2/authorization/google`;
  };

  const handleGithubLogin = () => {
    window.location.href = `${API_URL}/oauth2/authorization/github`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 flex">
      {/* Left Panel - Features (hidden on mobile) */}
      <div className="hidden md:flex md:w-1/2 flex-col justify-center px-12 text-white relative overflow-hidden">
        {/* Decorative background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="grid grid-cols-6 gap-4 w-full h-full">
            {Array.from({ length: 24 }).map((_, i) => (
              <div key={i} className="border border-indigo-400" />
            ))}
          </div>
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-indigo-900/30 rounded-lg">
              <Wallet size={28} className="text-indigo-300" />
            </div>
            <h2 className="text-3xl font-bold">Expense Tracker</h2>
          </div>

          <h3 className="text-5xl font-bold mb-6 leading-tight">
            Take control of your money
          </h3>

          <p className="text-lg text-gray-300 mb-12">
            Simple, powerful tools to track spending, set budgets, and achieve your financial goals.
          </p>

          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <TrendingUp size={24} className="text-indigo-400 flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-semibold mb-1">Track Spending</h4>
                <p className="text-sm text-gray-400">Monitor expenses across unlimited categories</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <Target size={24} className="text-indigo-400 flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-semibold mb-1">Set Budgets</h4>
                <p className="text-sm text-gray-400">Create monthly budgets and stay on track</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <BarChart3 size={24} className="text-indigo-400 flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-semibold mb-1">Analyze Trends</h4>
                <p className="text-sm text-gray-400">Understand your spending patterns</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex-1 md:w-1/2 flex items-center justify-center p-4 md:p-8">
        <div className="w-full max-w-md">
          {/* Mobile header */}
          <div className="md:hidden mb-8 text-white text-center">
            <div className="flex justify-center mb-4">
              <div className="p-4 bg-indigo-900/30 rounded-xl">
                <Wallet size={32} className="text-indigo-300" />
              </div>
            </div>
            <h1 className="text-2xl font-bold">Expense Tracker</h1>
          </div>

          {/* Desktop login card background */}
          <div className="md:bg-white md:rounded-2xl md:shadow-2xl p-8 md:p-10">
            {/* Desktop header */}
            <div className="hidden md:block text-center mb-8">
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-indigo-100 rounded-lg">
                  <Wallet size={28} className="text-indigo-600" />
                </div>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome</h1>
              <p className="text-gray-600">Sign in to manage your finances</p>
            </div>

            {/* Mobile welcome text */}
            <div className="md:hidden text-center mb-8 text-white">
              <h2 className="text-2xl font-bold mb-2">Sign In</h2>
              <p className="text-gray-300">Use your GitHub or Google account</p>
            </div>

            {/* OAuth Buttons */}
            <div className="space-y-3 md:space-y-4">
              <button
                type="button"
                onClick={handleGoogleLogin}
                className="w-full px-4 py-3 md:py-3.5 bg-white md:bg-gray-50 border-2 md:border border-gray-200 md:border-gray-300 rounded-lg md:rounded-xl font-semibold text-gray-700 hover:bg-gray-50 md:hover:bg-gray-100 active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 md:focus-visible:ring-offset-0"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                <span>Google</span>
              </button>

              <button
                type="button"
                onClick={handleGithubLogin}
                className="w-full px-4 py-3 md:py-3.5 bg-gray-900 text-white rounded-lg md:rounded-xl font-semibold hover:bg-gray-800 active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 md:focus-visible:ring-offset-0"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
                <span>GitHub</span>
              </button>
            </div>

            {/* Trust note */}
            <div className="md:mt-8 mt-6 pt-6 md:pt-8 border-t border-gray-200 md:border-gray-200">
              <p className="text-center text-sm text-gray-500 md:text-gray-600">
                We use OAuth for secure, <br className="md:hidden" />password-free login
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
