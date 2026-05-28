import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../features/auth/AuthContext';

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-xl font-bold text-gray-900">Expense Tracker</h1>
            <div className="flex items-center gap-8">
              <nav className="flex gap-6">
                <NavLink
                  to="/dashboard"
                  className={({ isActive }) =>
                    `text-sm font-medium pb-1 border-b-2 transition-colors ${
                      isActive
                        ? 'text-blue-600 border-blue-600'
                        : 'text-gray-700 border-transparent hover:text-gray-900'
                    }`
                  }
                >
                  Dashboard
                </NavLink>
                <NavLink
                  to="/transactions"
                  className={({ isActive }) =>
                    `text-sm font-medium pb-1 border-b-2 transition-colors ${
                      isActive
                        ? 'text-blue-600 border-blue-600'
                        : 'text-gray-700 border-transparent hover:text-gray-900'
                    }`
                  }
                >
                  Transactions
                </NavLink>
                <NavLink
                  to="/categories"
                  className={({ isActive }) =>
                    `text-sm font-medium pb-1 border-b-2 transition-colors ${
                      isActive
                        ? 'text-blue-600 border-blue-600'
                        : 'text-gray-700 border-transparent hover:text-gray-900'
                    }`
                  }
                >
                  Categories
                </NavLink>
                <NavLink
                  to="/budgets"
                  className={({ isActive }) =>
                    `text-sm font-medium pb-1 border-b-2 transition-colors ${
                      isActive
                        ? 'text-blue-600 border-blue-600'
                        : 'text-gray-700 border-transparent hover:text-gray-900'
                    }`
                  }
                >
                  Budgets
                </NavLink>
              </nav>
              <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              {user?.picture && (
                <img
                  src={user.picture}
                  alt={user.name}
                  className="w-8 h-8 rounded-full"
                />
              )}
              <span className="text-sm font-medium text-gray-700">{user?.name}</span>
            </div>
            <button
              onClick={logout}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
            >
              Logout
            </button>
              </div>
            </div>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto">
        {children}
      </main>
    </div>
  );
};
