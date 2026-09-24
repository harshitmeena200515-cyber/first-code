import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { FiSearch, FiSun, FiMoon, FiHeart, FiMenu, FiX, FiShoppingBag, FiStar } from 'react-icons/fi'
import { getFavorites } from '../api'

const NAV_LINKS = [
  { label: 'Home',           to: '/' },
  { label: 'Boys',           to: '/categories/boys' },
  { label: 'Girls',          to: '/categories/girls' },
  { label: 'Deals',          to: '/deals' },
  { label: '🔍 Analyze',     to: '/analyze' },
  { label: 'Fashion Guide',  to: '/guide' },
  { label: 'Outfit Builder', to: '/outfit-builder' },
  { label: 'Quiz',           to: '/quiz' },
  { label: 'Admin',          to: '/admin' },
]

export default function Navbar({ darkMode, toggleDark }) {
  const [open,     setOpen]   = useState(false)
  const [search,   setSearch] = useState('')
  const [showSearch, setShowSearch] = useState(false)
  const [favCount, setFavCount]    = useState(0)
  const [scrolled, setScrolled]    = useState(false)
  const navigate  = useNavigate()
  const { pathname } = useLocation()

  useEffect(() => setFavCount(getFavorites().length), [pathname])
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', handler)
    return () => window.removeEventListener('scroll', handler)
  }, [])

  const handleSearch = (e) => {
    e.preventDefault()
    if (search.trim()) navigate(`/gallery/all/all?q=${encodeURIComponent(search.trim())}`)
    setSearch(''); setShowSearch(false)
  }

  return (
    <>
      <motion.header
        initial={{ y: -80 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300
          ${scrolled
            ? 'glass shadow-lg border-b border-white/20 dark:border-white/5'
            : 'bg-transparent'
          }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 rounded-lg gradient-gold flex items-center justify-center">
              <FiShoppingBag className="w-4 h-4 text-white" />
            </div>
            <span className="font-display font-bold text-xl text-charcoal dark:text-cream">
              Fashion<span className="gradient-text">DB</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-6">
            {NAV_LINKS.map(link => (
              <Link
                key={link.to}
                to={link.to}
                className={`text-sm font-medium transition-colors relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-gold after:transition-all hover:after:w-full
                  ${pathname === link.to
                    ? 'text-gold after:w-full'
                    : 'text-gray-600 dark:text-gray-300 hover:text-charcoal dark:hover:text-cream'
                  }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            {/* Search */}
            <AnimatePresence>
              {showSearch && (
                <motion.form
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: 200, opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  onSubmit={handleSearch}
                  className="overflow-hidden"
                >
                  <input
                    autoFocus
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search clothes…"
                    className="w-full h-9 px-3 rounded-xl bg-cream dark:bg-charcoal-light border border-border dark:border-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-gold/50"
                    onBlur={() => { if (!search) setShowSearch(false) }}
                  />
                </motion.form>
              )}
            </AnimatePresence>

            <button
              onClick={() => setShowSearch(!showSearch)}
              className="icon-btn"
              aria-label="Search"
            >
              <FiSearch className="w-4 h-4" />
            </button>

            {/* Favorites */}
            <Link to="/favorites" className="icon-btn relative" aria-label="Favourites">
              <FiHeart className="w-4 h-4" />
              {favCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-gold text-white text-[9px] font-bold flex items-center justify-center">
                  {favCount}
                </span>
              )}
            </Link>

            {/* Dark mode */}
            <button
              onClick={toggleDark}
              className="icon-btn"
              aria-label="Toggle dark mode"
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={darkMode ? 'moon' : 'sun'}
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="block"
                >
                  {darkMode ? <FiSun className="w-4 h-4" /> : <FiMoon className="w-4 h-4" />}
                </motion.span>
              </AnimatePresence>
            </button>

            {/* Mobile hamburger */}
            <button
              onClick={() => setOpen(!open)}
              className="icon-btn lg:hidden"
              aria-label="Menu"
            >
              {open ? <FiX className="w-4 h-4" /> : <FiMenu className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Mobile nav */}
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="lg:hidden overflow-hidden glass border-t border-white/20 dark:border-white/5"
            >
              <div className="px-4 py-4 flex flex-col gap-1">
                {NAV_LINKS.map(link => (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => setOpen(false)}
                    className={`px-3 py-2.5 rounded-xl text-sm font-medium transition-colors
                      ${pathname === link.to
                        ? 'bg-gold/15 text-gold'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-charcoal-light'
                      }`}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      {/* Spacer */}
      <div className="h-16" />

      {/* icon-btn global style — inject into the nearest style tag via className */}
      <style>{`.icon-btn { @apply p-2 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-charcoal-light hover:text-charcoal dark:hover:text-cream transition-colors; }`}</style>
    </>
  )
}
