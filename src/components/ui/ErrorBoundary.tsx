import React from 'react'
import { Button } from './Button'
import { useNavigate } from 'react-router-dom'

interface ErrorBoundaryProps {
  children: React.ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
}

class ErrorBoundaryClass extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // You can log the error to an error reporting service here (e.g., Sentry)
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-900 p-6 text-center">
          <span className="material-symbols-outlined text-[64px] text-red-500 mb-4">
            error
          </span>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
            Something went wrong
          </h1>
          <p className="text-slate-500 dark:text-slate-400 max-w-md mb-6">
            We encountered an unexpected error while trying to render this page.
            If the problem persists, please contact support.
          </p>
          <div className="flex gap-3">
            <Button
              variant="secondary"
              onClick={() => window.location.reload()}
            >
              Refresh Page
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                this.setState({ hasError: false, error: undefined })
                window.location.href = '/'
              }}
            >
              Go to Dashboard
            </Button>
          </div>
          {process.env.NODE_ENV === 'development' && this.state.error && (
            <div className="mt-8 max-w-2xl text-left bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-900/50 w-full overflow-auto">
              <p className="font-mono text-sm text-red-700 dark:text-red-400 whitespace-pre-wrap">
                {this.state.error.toString()}
              </p>
            </div>
          )}
        </div>
      )
    }

    return this.props.children
  }
}

// Wrapper to provide navigate hook if needed for more complex routing inside boundary
export function ErrorBoundary({ children }: ErrorBoundaryProps) {
  return <ErrorBoundaryClass>{children}</ErrorBoundaryClass>
}
