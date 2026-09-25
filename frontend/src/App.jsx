import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'

import Navbar      from './components/Navbar.jsx'
import AppHeaderBar from './components/AppHeaderBar.jsx'
import BottomNav    from './components/BottomNav.jsx'
import ScrollToTop  from './components/ScrollToTop.jsx'
import Home        from './pages/Home.jsx'
import Categories  from './pages/Categories.jsx'
import Gallery     from './pages/Gallery.jsx'
import ItemDetail  from './pages/ItemDetail.jsx'
import Guide       from './pages/Guide.jsx'
import Quiz        from './pages/Quiz.jsx'
import Favorites   from './pages/Favorites.jsx'
import OutfitBuilder from './pages/OutfitBuilder.jsx'
import Admin       from './pages/Admin.jsx'
import Deals       from './pages/Deals.jsx'
import ListingAnalyzer from './pages/ListingAnalyzer'
import PrivacyPolicy from './pages/PrivacyPolicy'
import TermsOfService from './pages/TermsOfService'
import AffiliateDisclosure from './pages/AffiliateDisclosure'
import AboutUs from './pages/AboutUs'
import ContactUs from './pages/ContactUs'
import CookiePolicy from './pages/CookiePolicy'
export default function App() {
  const [dark, setDark] = useState(() => {
    if (typeof window === 'undefined') return false
    const stored = localStorage.getItem('darkMode')
    if (stored !== null) return stored === 'true'
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  })

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
    localStorage.setItem('darkMode', dark)
  }, [dark])

  return (
    <BrowserRouter>
      <ScrollToTop />
      <div className={`min-h-screen flex flex-col transition-colors duration-300 ${dark ? 'dark' : ''}`}>
        <Navbar darkMode={dark} toggleDark={() => setDark(d => !d)} />
        <AppHeaderBar />

        <main className="flex-1 pb-16 md:pb-0">
          <Routes>
            <Route path="/"                                  element={<Home />} />
            <Route path="/categories"                        element={<Categories />} />
            <Route path="/categories/:gender"                element={<Categories />} />
            <Route path="/gallery"                           element={<Gallery />} />
            <Route path="/gallery/:gender"                   element={<Gallery />} />
            <Route path="/gallery/:gender/:category"         element={<Gallery />} />
            <Route path="/gallery/:gender/:category/:subcategory" element={<Gallery />} />
            <Route path="/item/:id"                          element={<ItemDetail />} />
            <Route path="/guide"                             element={<Guide />} />
            <Route path="/quiz"                              element={<Navigate to="/deals" replace />} />
            <Route path="/favorites"                         element={<Favorites />} />
            <Route path="/outfit-builder"                    element={<Navigate to="/guide" replace />} />
            <Route path="/admin"                             element={<Admin />} />
            <Route path="/deals"                             element={<Deals />} />
            <Route path="/analyze"                           element={<ListingAnalyzer />} />
            <Route path="/about"                             element={<AboutUs />} />
            <Route path="/contact"                           element={<ContactUs />} />
            <Route path="/privacy-policy"                    element={<PrivacyPolicy />} />
            <Route path="/terms-of-service"                  element={<TermsOfService />} />
            <Route path="/affiliate-disclosure"              element={<AffiliateDisclosure />} />
            <Route path="/cookie-policy"                     element={<CookiePolicy />} />
            <Route path="*" element={
              <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <span className="text-6xl">404</span>
                <p className="text-gray-500 dark:text-gray-400">Page not found</p>
                <Link to="/" className="text-gold hover:underline">← Go home</Link>
              </div>
            } />
          </Routes>
        </main>

        <BottomNav />

        <footer className="bg-charcoal text-gray-400 mt-16 border-t border-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
            {/* Top section */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
              {/* Brand */}
              <div className="text-center sm:text-left">
                <p className="text-lg font-semibold text-white mb-2">
                  <span className="font-display">FashionDB</span>
                </p>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Curated Indian Fashion & E-commerce Reality Check. Discover verified fashion across Amazon, Flipkart, Myntra, Meesho, and Ajio.
                </p>
              </div>

              {/* Quick Links */}
              <div className="text-center sm:text-left">
                <p className="text-sm font-semibold text-white mb-3">Quick Links</p>
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
                  <Link to="/about" className="hover:text-gold transition-colors">About Us</Link>
                  <Link to="/contact" className="hover:text-gold transition-colors">Contact Us</Link>
                  <Link to="/privacy-policy" className="hover:text-gold transition-colors">Privacy Policy</Link>
                  <Link to="/terms-of-service" className="hover:text-gold transition-colors">Terms & Conditions</Link>
                  <Link to="/affiliate-disclosure" className="hover:text-gold transition-colors">Affiliate Disclosure</Link>
                  <Link to="/cookie-policy" className="hover:text-gold transition-colors">Cookie Policy</Link>
                </div>
              </div>

              {/* Trust */}
              <div className="text-center sm:text-left">
                <p className="text-sm font-semibold text-white mb-3">Trusted Platforms</p>
                <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                  {['Amazon', 'Flipkart', 'Myntra', 'Meesho', 'Ajio'].map(p => (
                    <span key={p} className="text-[10px] px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-gray-300">{p}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* Affiliate Disclaimer */}
            <div className="p-3 rounded-xl bg-black/40 border border-gray-800/80 max-w-2xl mx-auto mb-6 text-[11px] text-gray-400 text-center">
              <strong className="text-gold">Affiliate Disclaimer:</strong> As an Amazon Associate, and an affiliate partner with Flipkart, Myntra, Meesho, and Ajio, we earn qualifying commissions from purchases made via our outbound links, at zero extra cost to you.
            </div>

            {/* Copyright */}
            <div className="text-center text-xs text-gray-500 pt-4 border-t border-gray-800">
              © {new Date().getFullYear()} FashionDB. Built with pride in India. All rights reserved.
            </div>
          </div>
        </footer>

        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: dark ? '#1A1A1A' : '#fff',
              color: dark ? '#F0EDE8' : '#1A1A1A',
              border: '1px solid #C9A96E44',
            },
          }}
        />
      </div>
    </BrowserRouter>
  )
}
