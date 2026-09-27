import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiX, FiMail, FiLock, FiUser } from 'react-icons/fi'

export default function AuthModal({ isOpen, onClose, onSuccess }) {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => { document.body.style.overflow = 'unset' }
  }, [isOpen])

  if (!isOpen) return null

  const handleSubmit = (e) => {
    e.preventDefault()
    // Mock authentication
    const user = { email, name: isLogin ? email.split('@')[0] : name }
    localStorage.setItem('auth_user', JSON.stringify(user))
    
    // Merge guest favorites to user account
    const guestFavs = JSON.parse(localStorage.getItem('fav_ids') || '[]')
    const userFavs = JSON.parse(localStorage.getItem(`fav_ids_${user.email}`) || '[]')
    const merged = [...new Set([...guestFavs, ...userFavs])]
    localStorage.setItem(`fav_ids_${user.email}`, JSON.stringify(merged))
    
    if (onSuccess) onSuccess(user)
    onClose()
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-charcoal/60 backdrop-blur-sm"
          onClick={onClose}
        />
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          className="relative w-full max-w-md bg-white dark:bg-charcoal-light rounded-3xl shadow-2xl overflow-hidden border border-border dark:border-gray-700"
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-charcoal rounded-full transition-colors z-10"
          >
            <FiX className="w-5 h-5" />
          </button>

          <div className="p-8">
            <div className="text-center mb-8">
              <h2 className="font-display text-3xl font-bold text-charcoal dark:text-cream mb-2">
                {isLogin ? 'Welcome Back' : 'Create Account'}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {isLogin 
                  ? 'Sign in to sync your favorites across devices.'
                  : 'Join to save items and track your style journey.'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div className="relative">
                  <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    required
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Full Name"
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-gray-50 dark:bg-charcoal border border-border dark:border-gray-700 focus:outline-none focus:border-gold transition-colors text-sm"
                  />
                </div>
              )}
              
              <div className="relative">
                <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email Address"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-gray-50 dark:bg-charcoal border border-border dark:border-gray-700 focus:outline-none focus:border-gold transition-colors text-sm"
                />
              </div>

              <div className="relative">
                <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  required
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-gray-50 dark:bg-charcoal border border-border dark:border-gray-700 focus:outline-none focus:border-gold transition-colors text-sm"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 mt-2 rounded-xl gradient-gold text-charcoal font-bold text-sm shadow-md hover:opacity-90 transition-opacity active:scale-[0.98]"
              >
                {isLogin ? 'Sign In' : 'Create Account'}
              </button>
            </form>

            <div className="mt-6 text-center">
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="text-sm text-gray-500 hover:text-gold transition-colors font-medium"
                type="button"
              >
                {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
