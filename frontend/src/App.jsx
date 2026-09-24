import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'

import Navbar      from './components/Navbar.jsx'
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
      <div className={`min-h-screen transition-colors duration-300 ${dark ? 'dark' : ''}`}>
        <Navbar darkMode={dark} toggleDark={() => setDark(d => !d)} />

        <Routes>
          <Route path="/"                                  element={<Home />} />
          <Route path="/categories/:gender"                element={<Categories />} />
          <Route path="/gallery/:gender/:category"         element={<Gallery />} />
          <Route path="/gallery/:gender/:category/:subcategory" element={<Gallery />} />
          <Route path="/item/:id"                          element={<ItemDetail />} />
          <Route path="/guide"                             element={<Guide />} />
          <Route path="/quiz"                              element={<Quiz />} />
          <Route path="/favorites"                         element={<Favorites />} />
          <Route path="/outfit-builder"                    element={<OutfitBuilder />} />
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
              <a href="/" className="text-gold hover:underline">← Go home</a>
            </div>
          } />
        </Routes>

        <footer className="bg-charcoal text-gray-400 text-center py-10 text-sm mt-16 border-t border-gray-800">
          <div className="max-w-7xl mx-auto px-6">
            <p className="mb-2 text-base font-semibold text-white">
              <span className="font-display">FashionDB</span> — Curated Indian Fashion & E-commerce Reality Check
            </p>
            <p className="text-xs text-gray-400 mb-6 max-w-2xl mx-auto leading-relaxed">
              Discover verified fashion across Amazon, Flipkart, Myntra, Meesho, and Ajio. Powered by real review photo analysis, trust scoring, and independent styling guides.
            </p>

            <div className="flex flex-wrap justify-center items-center gap-x-6 gap-y-2 text-xs font-medium text-gray-300 mb-6">
              <a href="/about" className="hover:text-gold transition-colors">About Us</a>
              <span className="text-gray-600">·</span>
              <a href="/contact" className="hover:text-gold transition-colors">Contact Us</a>
              <span className="text-gray-600">·</span>
              <a href="/privacy-policy" className="hover:text-gold transition-colors">Privacy Policy</a>
              <span className="text-gray-600">·</span>
              <a href="/terms-of-service" className="hover:text-gold transition-colors">Terms & Conditions</a>
              <span className="text-gray-600">·</span>
              <a href="/affiliate-disclosure" className="hover:text-gold transition-colors">Affiliate Disclosure</a>
              <span className="text-gray-600">·</span>
              <a href="/cookie-policy" className="hover:text-gold transition-colors">Cookie Policy</a>
            </div>

            <div className="p-3 rounded-xl bg-black/40 border border-gray-800/80 max-w-xl mx-auto mb-4 text-[11px] text-gray-400">
              <strong className="text-gold">Affiliate Disclaimer:</strong> As an Amazon Associate, and an affiliate partner with Flipkart, Myntra, Meesho, and Ajio, we earn qualifying commissions from purchases made via our outbound links, at zero extra cost to you.
            </div>

            <p className="text-xs text-gray-500">
              © {new Date().getFullYear()} FashionDB. Built with pride in India. All rights reserved.
            </p>
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
