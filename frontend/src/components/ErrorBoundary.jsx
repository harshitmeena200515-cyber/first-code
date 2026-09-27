import React from 'react'
import { useLocation } from 'react-router-dom'

/* Inner class component that actually catches errors */
class ErrorCatcher extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo)
    this.setState({ errorInfo })
  }

  /* Reset error state when the route (key) changes */
  componentDidUpdate(prevProps) {
    if (prevProps.resetKey !== this.props.resetKey && this.state.hasError) {
      this.setState({ hasError: false, error: null, errorInfo: null })
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
          <span className="text-5xl mb-4">⚠️</span>
          <h2 className="text-lg font-bold text-charcoal dark:text-cream mb-2">Something went wrong</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 max-w-sm">
            कुछ गड़बड़ हो गई। नीचे बटन दबाकर ठीक करें।
          </p>
          <details className="mb-5 max-w-md w-full text-left">
            <summary className="text-[10px] text-gray-400 cursor-pointer hover:text-gold">Error Details</summary>
            <pre className="mt-2 p-2 rounded-lg bg-red-950/20 border border-red-800/30 text-red-300 text-[9px] overflow-auto max-h-28 whitespace-pre-wrap break-all">
              {this.state.error?.toString()}
              {'\n'}
              {this.state.errorInfo?.componentStack}
            </pre>
          </details>
          <div className="flex gap-3">
            <button
              onClick={() => this.setState({ hasError: false, error: null, errorInfo: null })}
              className="px-4 py-2 rounded-xl bg-gold text-white font-semibold text-xs hover:opacity-90 transition-opacity"
            >
              🔄 Try Again
            </button>
            <button
              onClick={() => { window.location.href = '/' }}
              className="px-4 py-2 rounded-xl border border-gold text-gold font-semibold text-xs hover:bg-gold/10 transition-colors"
            >
              🏠 Go Home
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

/*
 * Wrapper that provides route-aware reset key.
 * Must be rendered INSIDE <BrowserRouter> so useLocation() works.
 */
export default function ErrorBoundary({ children }) {
  const { pathname } = useLocation()
  return (
    <ErrorCatcher resetKey={pathname}>
      {children}
    </ErrorCatcher>
  )
}
