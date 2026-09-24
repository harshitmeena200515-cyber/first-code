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
import ListingAnalyzer from './pages/ListingAnalyzer';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import AffiliateDisclosure from './pages/AffiliateDisclosure';
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
          <Route path="/analyze" element={<ListingAnalyzer />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms-of-service" element={<TermsOfService />} />
          <Route path="/affiliate-disclosure" element={<AffiliateDisclosure />} />
          <Route path="*" element={
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
              <span className="text-6xl">404</span>
              <p className="text-gray-500 dark:text-gray-400">Page not found</p>
              <a href="/" className="text-gold hover:underline">← Go home</a>
            </div>
          } />
        </Routes>

        <footer className="bg-charcoal text-gray-400 text-center py-8 text-sm mt-16">
          <p className="mb-1">
            <span className="font-display text-white font-semibold">FashionDB</span> — Premium Clothing Catalog & E-commerce Reality Check
          </p>
          <p className="text-xs text-gray-600 mb-4">
            Built with FastAPI + React · Trust scores powered by pHash & EXIF analysis
          </p>
          <div className="flex justify-center gap-4 text-xs text-gray-500 mb-2">
            <a href="/privacy-policy" className="hover:text-gold transition-colors">Privacy Policy</a>
            <a href="/terms-of-service" className="hover:text-gold transition-colors">Terms of Service</a>
            <a href="/affiliate-disclosure" className="hover:text-gold transition-colors">Affiliate Disclosure</a>
          </div>
          <p className="text-xs text-gray-500 mb-2">
            As an Amazon Associate I earn from qualifying purchases.
          </p>
          <p className="text-xs text-gray-600">
            © 2024 FashionDB (8clothes). All rights reserved.
          </p>
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
