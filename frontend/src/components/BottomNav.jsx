import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiHome, FiGrid, FiZap, FiTag, FiHeart } from 'react-icons/fi'
import { getFavorites } from '../api'

export default function BottomNav() {
  const { pathname } = useLocation()
  const [favCount, setFavCount] = useState(0)

  useEffect(() => {
    try {
      setFavCount(getFavorites().length)
    } catch {
      setFavCount(0)
    }
  }, [pathname])

  const NAV_ITEMS = [
    {
      label: 'Home',
      to: '/',
      icon: FiHome,
      isActive: pathname === '/'
    },
    {
      label: 'Categories',
      to: '/categories/boys',
      icon: FiGrid,
      isActive: pathname.startsWith('/categories') || pathname.startsWith('/gallery')
    },
    {
      label: 'Deals',
      to: '/deals',
      icon: FiZap,
      isActive: pathname === '/deals',
      badge: 'HOT'
    },
    {
      label: '< ₹499',
      to: '/gallery/all/all?max_price=499',
      icon: FiTag,
      isActive: pathname.includes('max_price=499'),
      badge: 'SALE'
    },
    {
      label: 'Saved',
      to: '/favorites',
      icon: FiHeart,
      isActive: pathname === '/favorites',
      count: favCount
    }
  ]

  return (
    <nav 
      aria-label="Mobile Bottom Navigation" 
      className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-charcoal/95 backdrop-blur-lg border-t border-border dark:border-gray-800 md:hidden transition-colors shadow-lg"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <div className="flex items-center justify-around h-16 px-1">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon
          const active = item.isActive

          return (
            <Link
              key={item.label}
              to={item.to}
              className={`flex-1 flex flex-col items-center justify-center py-1 relative text-[10px] font-semibold transition-all active:scale-95 ${
                active
                  ? 'text-gold'
                  : 'text-gray-500 dark:text-gray-400 hover:text-charcoal dark:hover:text-cream'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 transition-transform ${active ? 'scale-110' : ''}`} />
                
                {/* Hot Badge */}
                {item.badge && (
                  <span className="absolute -top-1.5 -right-3 text-[8px] bg-red-500 text-white font-bold px-1 rounded-full animate-pulse">
                    {item.badge}
                  </span>
                )}

                {/* Favorites Counter Badge */}
                {item.count !== undefined && item.count > 0 && (
                  <span className="absolute -top-1.5 -right-3 min-w-[14px] h-[14px] px-1 rounded-full bg-gold text-charcoal font-bold text-[8px] flex items-center justify-center shadow">
                    {item.count}
                  </span>
                )}
              </div>

              <span className={`mt-1 tracking-tight ${active ? 'font-bold' : 'font-normal'}`}>
                {item.label}
              </span>

              {/* Active Dot Indicator */}
              {active && (
                <motion.div
                  layoutId="activeBottomTab"
                  className="absolute bottom-0 w-8 h-0.5 bg-gold rounded-full"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
