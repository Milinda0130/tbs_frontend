import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from '@/stores/queryClient'
import './index.css'
import App from './App.tsx'
import { AuthProvider } from '@/stores/AuthContext'
import { ToastContainer } from '@/components/ui/Toast'

/**
 * Main entrypoint: wires router, TanStack Query, auth, and toast providers.
 * Uses the shared queryClient from stores/ so logout .clear() works correctly.
 */
const storedTheme = localStorage.getItem('tbs_theme')
if (storedTheme === 'dark') {
  document.documentElement.classList.add('dark')
} else {
  document.documentElement.classList.remove('dark')
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <App />
          <ToastContainer />
        </AuthProvider>
      </QueryClientProvider>
    </BrowserRouter>
  </StrictMode>,
)
