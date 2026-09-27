import { useState, useEffect } from 'react'
import { fetchClothes, getFavorites, getRecentlyViewed } from '../api'
import ClothingCard from '../components/ClothingCard'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

export default function Favorites() {
  const [items,   setItems]   = useState([])
  const [recent,  setRecent]  = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const ids = getFavorites()
    if (ids.length === 0) { setLoading(false); return }
    Promise.all(ids.map(id => fetchClothes({ q: id.toString(), limit: 1 }).catch(() => null)))
      .then(results => {
        const all = results.flatMap(r => r?.data?.items || [])
        setItems(all.filter(Boolean))
      })
      .finally(() => setLoading(false))
    setRecent(getRecentlyViewed())
  }, [])

  const { getCurrentUser } = require('../api')
  const user = getCurrentUser()

  useEffect(() => {
    const handleAuth = () => window.location.reload()
    window.addEventListener('auth-success', handleAuth)
    return () => window.removeEventListener('auth-success', handleAuth)
  }, [])

  if (loading) return (
    <div className="max-w-6xl mx-auto px-6 py-12 grid grid-cols-2 sm:grid-cols-4 gap-5">
      {Array.from({ length: 8 }).map((_, i) => <div key={i} className="shimmer-bg aspect-[3/4] rounded-2xl" />)}
    </div>
  )

  return (
    <div className="min-h-screen bg-cream dark:bg-charcoal-dark py-12 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display text-4xl font-bold text-charcoal dark:text-cream mb-2">
              {user ? `${user.name}'s Favourites` : 'Your Favourites'}
            </h1>
            <p className="text-gray-500 dark:text-gray-400">{items.length} saved items</p>
          </div>
          {user && (
            <button
              onClick={() => {
                localStorage.removeItem('auth_user')
                window.location.reload()
              }}
              className="px-4 py-2 rounded-xl border border-red-200 text-red-500 hover:bg-red-50 text-sm font-semibold transition-colors"
            >
              Sign Out
            </button>
          )}
        </div>

        {items.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5">
            {items.map((item, i) => <ClothingCard key={item.id} item={item} index={i} />)}
          </div>
        ) : (
          <div className="text-center py-24">
            <p className="text-6xl mb-4">💔</p>
            <p className="font-display text-2xl text-charcoal dark:text-cream mb-2">No saved items yet</p>
            <p className="text-gray-500 dark:text-gray-400 mb-6">Tap the ♡ on any clothing card to save it here.</p>
            <Link to="/" className="px-6 py-3 rounded-xl bg-gold text-white font-semibold hover:bg-gold-dark transition-colors">
              Explore Fashion →
            </Link>
          </div>
        )}

        {recent.length > 0 && (
          <div className="mt-16">
            <h2 className="font-display text-2xl font-bold text-charcoal dark:text-cream mb-6">Recently Viewed</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4">
              {recent.slice(0, 6).map((item, i) => <ClothingCard key={item.id} item={item} index={i} />)}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
