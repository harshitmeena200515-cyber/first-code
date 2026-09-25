import React from 'react'

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    console.error('ErrorBoundary caught:', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-cream dark:bg-charcoal-dark p-6 text-center">
          <span className="text-6xl mb-4">⚠️</span>
          <h2 className="text-xl font-bold text-charcoal dark:text-cream mb-2">Oops! Something went wrong</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 max-w-md">
            कुछ गड़बड़ हो गई। कृपया Home पर जाएं या पेज रीलोड करें।
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => { this.setState({ hasError: false, error: null }); window.location.href = '/' }}
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
