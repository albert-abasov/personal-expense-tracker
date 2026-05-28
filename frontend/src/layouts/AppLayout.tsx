import React from 'react';
import { NavLink } from 'react-router-dom';
import { Wallet, LogOut } from 'lucide-react';
import { useAuth } from '../features/auth/AuthContext';

interface AppLayoutProps {
  children: React.ReactNode;
}

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `text-sm font-medium pb-1 border-b-2 transition-colors ${
    isActive
      ? 'text-indigo-600 border-indigo-600'
      : 'text-slate-700 border-transparent hover:text-slate-900'
  }`;

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-2">
              <Wallet size={24} className="text-indigo-600" />
              <h1 className="text-xl font-bold text-slate-900">Expense Tracker</h1>
            </div>
            <div className="flex items-center gap-8">
              <nav className="flex gap-6">
                <NavLink to="/dashboard" className={navLinkClass}>
                  Dashboard
                </NavLink>
                <NavLink to="/transactions" className={navLinkClass}>
                  Transactions
                </NavLink>
                <NavLink to="/categories" className={navLinkClass}>
                  Categories
                </NavLink>
                <NavLink to="/budgets" className={navLinkClass}>
                  Budgets
                </NavLink>
              </nav>
              <div className="flex items-center gap-4 pl-4 border-l border-slate-200">
                <div className="flex items-center gap-3">
                  {user?.picture && (
                    <img
                      src={user.picture}
                      alt={user.name}
                      className="w-8 h-8 rounded-full ring-2 ring-indigo-100 ring-offset-1"
                    />
                  )}
                  <span className="text-sm font-medium text-slate-700">{user?.name}</span>
                </div>
                <button
                  onClick={logout}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-500 hover:bg-red-600 active:bg-red-700 rounded-lg transition-colors shadow-sm hover:shadow-md"
                >
                  <LogOut size={16} />
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
};
