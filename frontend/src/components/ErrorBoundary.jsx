import React from 'react'

export default class ErrorBoundary extends React.Component {
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

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-cream dark:bg-charcoal-dark p-6 text-center">
          <span className="text-6xl mb-4">⚠️</span>
          <h2 className="text-xl font-bold text-charcoal dark:text-cream mb-2">Oops! Something went wrong</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 max-w-md">
            कुछ गड़बड़ हो गई। कृपया Home पर जाएं या पेज रीलोड करें।
          </p>
          {/* Show error detail for debugging */}
          <details className="mb-6 max-w-lg w-full text-left">
            <summary className="text-xs text-gray-400 cursor-pointer hover:text-gold">Show Error Details</summary>
            <pre className="mt-2 p-3 rounded-xl bg-red-950/30 border border-red-800/40 text-red-300 text-[10px] overflow-auto max-h-40 whitespace-pre-wrap break-all">
              {this.state.error?.toString()}
              {'\n\n'}
              {this.state.errorInfo?.componentStack}
            </pre>
          </details>
          <div className="flex gap-3">
            <button
              onClick={() => { this.setState({ hasError: false, error: null, errorInfo: null }); window.location.href = '/' }}
              className="px-5 py-2.5 rounded-xl bg-gold text-white font-semibold text-sm hover:opacity-90 transition-opacity"
            >
              🏠 Go Home
            </button>
            <button
              onClick={() => window.location.reload()}
              className="px-5 py-2.5 rounded-xl border border-gold text-gold font-semibold text-sm hover:bg-gold/10 transition-colors"
            >
              🔄 Reload Page
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
