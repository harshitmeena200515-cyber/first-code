import { useLocation, useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiArrowLeft, FiHome, FiX, FiChevronRight } from 'react-icons/fi'

export default function AppHeaderBar() {
  const { pathname } = useLocation()
  const navigate = useNavigate()

  if (pathname === '/') return null

  const handleBack = () => {
    if (window.history.state && window.history.state.idx > 0) {
      navigate(-1)
    } else {
      navigate('/')
    }
  }

  const handleHome = () => {
    navigate('/')
  }

  const handleClose = () => {
    if (window.history.state && window.history.state.idx > 0) {
      navigate(-1)
    } else {
      navigate('/')
    }
  }

  // Generate dynamic breadcrumbs & title based on route
  const getRouteInfo = () => {
    if (pathname.startsWith('/item/')) {
      return {
        title: 'Product Details',
        crumbs: [
          { label: 'Home', to: '/' },
          { label: 'Gallery', to: '/gallery/all/all' },
          { label: 'Product Details' }
        ]
      }
    }
    if (pathname.startsWith('/categories/')) {
      const g = pathname.split('/')[2] || 'all'
      const label = g.charAt(0).toUpperCase() + g.slice(1)
      return {
        title: `${label} Categories`,
        crumbs: [
          { label: 'Home', to: '/' },
          { label: `${label} Collection` }
        ]
      }
    }
    if (pathname.startsWith('/gallery')) {
      const parts = pathname.split('/')
      const g = parts[2]
      const c = parts[3]
      const sub = parts[4]
      const crumbs = [{ label: 'Home', to: '/' }]
      if (g && g !== 'all') crumbs.push({ label: g.charAt(0).toUpperCase() + g.slice(1), to: `/categories/${g}` })
      if (c && c !== 'all') crumbs.push({ label: c.charAt(0).toUpperCase() + c.slice(1), to: `/gallery/${g || 'all'}/${c}` })
      if (sub && sub !== 'all') crumbs.push({ label: sub.charAt(0).toUpperCase() + sub.slice(1) })
      return {
        title: sub || c || (g ? `${g.toUpperCase()} Gallery` : 'Fashion Gallery'),
        crumbs
      }
    }
    if (pathname === '/deals') {
      return {
        title: 'Hot Reality Deals',
        crumbs: [{ label: 'Home', to: '/' }, { label: 'Reality Deals' }]
      }
    }
    if (pathname === '/quiz') {
      return {
        title: 'Style Quiz',
        crumbs: [{ label: 'Home', to: '/' }, { label: 'Style Quiz' }]
      }
    }
    if (pathname === '/guide') {
      return {
        title: 'Fashion Styling Guide',
        crumbs: [{ label: 'Home', to: '/' }, { label: 'Fashion Guide' }]
      }
    }
    if (pathname === '/favorites') {
      return {
        title: 'Saved Favourites',
        crumbs: [{ label: 'Home', to: '/' }, { label: 'Favourites' }]
      }
    }
    if (pathname === '/outfit-builder') {
      return {
        title: 'Outfit Builder',
        crumbs: [{ label: 'Home', to: '/' }, { label: 'Outfit Builder' }]
      }
    }
    if (pathname === '/analyze') {
      return {
        title: 'Listing Reality Analyzer',
        crumbs: [{ label: 'Home', to: '/' }, { label: 'Listing Analyzer' }]
      }
    }
    if (pathname === '/admin') {
      return {
        title: 'Admin Portal',
        crumbs: [{ label: 'Home', to: '/' }, { label: 'Admin' }]
      }
    }
    if (pathname === '/about') {
      return {
        title: 'About FashionDB',
        crumbs: [{ label: 'Home', to: '/' }, { label: 'About Us' }]
      }
    }
    if (pathname === '/contact') {
      return {
        title: 'Contact Support',
        crumbs: [{ label: 'Home', to: '/' }, { label: 'Contact Us' }]
      }
    }
    if (pathname === '/privacy-policy') {
      return {
        title: 'Privacy Policy',
        crumbs: [{ label: 'Home', to: '/' }, { label: 'Privacy Policy' }]
      }
    }
    if (pathname === '/terms-of-service') {
      return {
        title: 'Terms of Service',
        crumbs: [{ label: 'Home', to: '/' }, { label: 'Terms of Service' }]
      }
    }
    if (pathname === '/affiliate-disclosure') {
      return {
        title: 'Affiliate Disclosure',
        crumbs: [{ label: 'Home', to: '/' }, { label: 'Affiliate Disclosure' }]
      }
    }
    if (pathname === '/cookie-policy') {
      return {
        title: 'Cookie Policy',
        crumbs: [{ label: 'Home', to: '/' }, { label: 'Cookie Policy' }]
      }
    }
    return {
      title: 'FashionDB',
      crumbs: [{ label: 'Home', to: '/' }]
    }
  }

  const { title, crumbs } = getRouteInfo()

  return (
    <motion.aside
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      aria-label="Page navigation"
      className="sticky top-16 z-30 bg-white/90 dark:bg-charcoal/90 backdrop-blur-md border-b border-border/80 dark:border-gray-800 shadow-sm"
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-6 h-12 flex items-center justify-between gap-2 sm:gap-4">
        
        {/* Left: Back & Home buttons */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <button
            onClick={handleBack}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-gray-100 hover:bg-gold/15 dark:bg-charcoal-light dark:hover:bg-gold/20 text-charcoal dark:text-cream text-xs font-semibold transition-all active:scale-95 border border-border/60 dark:border-gray-700/60"
            title="Go back to previous screen"
            aria-label="Go back"
          >
            <FiArrowLeft className="w-4 h-4 text-gold shrink-0" />
            <span>Back</span>
          </button>

          <button
            onClick={handleHome}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-gray-100 hover:bg-gold/15 dark:bg-charcoal-light dark:hover:bg-gold/20 text-gray-700 dark:text-gray-300 text-xs font-medium transition-all active:scale-95 border border-border/60 dark:border-gray-700/60"
            title="Go directly to Homepage"
            aria-label="Go to Homepage"
          >
            <FiHome className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400 shrink-0" />
            <span className="hidden sm:inline">Home</span>
          </button>
        </div>

        {/* Center: Title on Mobile / Breadcrumbs on Desktop */}
        <div className="flex-1 min-w-0 px-1 text-center sm:text-left">
          {/* Mobile view: concise screen title */}
          <div className="sm:hidden truncate text-xs font-bold text-charcoal dark:text-cream">
            {title}
          </div>

          {/* Desktop/Tablet view: full breadcrumbs trail */}
          <nav className="hidden sm:flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 overflow-x-auto h-scroll whitespace-nowrap">
            {crumbs.map((c, i) => (
              <span key={i} className="flex items-center gap-1.5">
                {i > 0 && <FiChevronRight className="w-3 h-3 text-gray-400 shrink-0" />}
                {c.to ? (
                  <Link to={c.to} className="hover:text-gold transition-colors font-medium">
                    {c.label}
                  </Link>
                ) : (
                  <span className="text-charcoal dark:text-cream font-semibold truncate max-w-[200px]">
                    {c.label}
                  </span>
                )}
              </span>
            ))}
          </nav>
        </div>

        {/* Right: Close action */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={handleClose}
            className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-gray-500 dark:text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all text-xs active:scale-95"
            title="Close page and return"
            aria-label="Close page"
          >
            <FiX className="w-4 h-4" />
            <span className="hidden md:inline font-medium">Close</span>
          </button>
        </div>

      </div>
    </motion.aside>
  )
}
