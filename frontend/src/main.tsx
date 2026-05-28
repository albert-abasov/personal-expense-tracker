import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider, useAuth } from './features/auth/AuthContext'
import { Router } from './router'
import { Toaster } from 'sonner'
import { useBudgetAlerts } from './hooks/useBudgetAlerts'
import './index.css'

const queryClient = new QueryClient()

// Rendered once above the router so it never remounts on navigation.
// useBudgetAlerts only opens the WebSocket when the user is authenticated.
const BudgetAlertsManager = () => {
  const { user } = useAuth()
  useBudgetAlerts(!!user)
  return null
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <BudgetAlertsManager />
          <Router />
          <Toaster position="top-right" richColors />
        </AuthProvider>
      </QueryClientProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
