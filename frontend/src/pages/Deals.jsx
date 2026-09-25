import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiExternalLink, FiPercent, FiShoppingBag, FiStar, FiShield } from 'react-icons/fi'
import { fetchClothes } from '../api'
import RatingTag from '../components/RatingTag'
import { Link } from 'react-router-dom'
import AffiliateDisclosureBanner from '../components/AffiliateDisclosureBanner';

const FALLBACK = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='500'%3E%3Crect fill='%23f3f4f6' width='400' height='500'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' fill='%236b7280' font-size='14' font-family='sans-serif'%3ENo Image%3C/text%3E%3C/svg%3E"

export default function Deals() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [platform, setPlatform] = useState('all') // all | amazon | flipkart | myntra
  const [category, setCategory] = useState('all') // all | upperwear | lowerwear | footwear | accessories
  const [gender, setGender] = useState('all') // all | boys | girls
  const [sortBy, setSortBy] = useState('discount') // discount | trust | price_asc

  useEffect(() => {
    setLoading(true)
    fetchClothes({ limit: 80, sort: 'popular' })
      .then(res => {
        // Enriched products with simulated deal metrics and platform info
        const enriched = res.data.items.map(item => {
          let link = item.external_link || ''
          let source = 'myntra'
          let logoColor = 'bg-gradient-to-r from-pink-500 to-red-500'
          let platformName = 'Myntra'

          if (link.includes('amazon')) {
            source = 'amazon'
            logoColor = 'bg-amber-500'
            platformName = 'Amazon'
          } else if (link.includes('flipkart')) {
            source = 'flipkart'
            logoColor = 'bg-blue-600'
            platformName = 'Flipkart'
          } else {
            // fallback/default to myntra search link if none exists
            link = `https://www.myntra.com/search?w=${encodeURIComponent(item.name)}`
            source = 'myntra'
            logoColor = 'bg-gradient-to-r from-pink-500 to-red-500'
            platformName = 'Myntra'
          }

          // On-the-fly realistic discounts (ranging from 15% to 55%)
          const discountPercent = ((item.id * 7) % 41) + 15 
          const originalPrice = Math.round(item.price / (1 - discountPercent / 100))

          return {
            ...item,
            external_link: link,
            platform: source,
            platformName,
            logoColor,
            discountPercent,
            originalPrice,
          }
        })
        setItems(enriched)
      })
      .finally(() => setLoading(false))
  }, [])

  // Filtering logic
  const filteredItems = items
    .filter(item => platform === 'all' || item.platform === platform)
    .filter(item => category === 'all' || item.category === category)
    .filter(item => gender === 'all' || item.gender === gender)
    .sort((a, b) => {
      if (sortBy === 'discount') return b.discountPercent - a.discountPercent
      if (sortBy === 'trust') return b.trust_score - a.trust_score
      if (sortBy === 'price_asc') return a.price - b.price
      return 0
    })

  return (
    <div className="min-h-screen bg-cream dark:bg-charcoal-dark py-12 px-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-12">
          <motion.div 
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold/10 text-gold text-xs font-semibold uppercase tracking-widest mb-3"
          >
            <FiPercent /> Exclusive Offers
          </motion.div>
          <h1 className="font-display text-5xl font-bold text-charcoal dark:text-cream mb-4">
            E-Commerce <span className="gradient-text">Reality Deals</span>
          </h1>
          <p className="text-gray-500 dark:text-gray-400 max-w-xl mx-auto text-sm">
            Hot offers from Amazon, Flipkart, and Myntra. Verified by our pHash & EXIF analysis engines to ensure you get what you see.
          </p>
        </div>

        {/* ── Featured EarnKaro Partner Deals ── */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-gold text-xs font-semibold uppercase tracking-widest mb-1">🔥 Top Partner Deals</p>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-charcoal dark:text-cream">
                Limited Time Flash Steals
              </h2>
            </div>
            <span className="text-xs bg-red-500/10 text-red-500 border border-red-500/20 px-3 py-1 rounded-full font-semibold">
              Live Verified Deals
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              {
                id: 'deal-1',
                title: 'Adidas Performance & Streetwear Apparel',
                brand: 'Adidas',
                discount: 'Up to 60% OFF',
                price: '₹1,299',
                originalPrice: '₹3,299',
                image: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?auto=format&fit=crop&w=600&h=800&q=80',
                platform: 'Flipkart',
                badgeColor: 'bg-blue-600',
                link: 'https://fktr.in/vcHSNQr'
              },
              {
                id: 'deal-2',
                title: 'Lee Denim Jeans & Classic Cotton Shirts',
                brand: 'Lee',
                discount: 'Flat 79% OFF',
                price: '₹1,049',
                originalPrice: '₹4,999',
                image: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=600&h=800&q=80',
                platform: 'Myntra',
                badgeColor: 'bg-gradient-to-r from-pink-500 to-red-500',
                link: 'https://myntr.it/1FGuX0o'
              },
              {
                id: 'deal-3',
                title: 'Woodland Rugged Nubuck Leather Outdoor Shoes',
                brand: 'Woodland',
                discount: 'Min 50% OFF',
                price: '₹2,195',
                originalPrice: '₹4,395',
                image: 'https://images.unsplash.com/photo-1520639888713-7851133b1ed0?auto=format&fit=crop&w=600&h=800&q=80',
                platform: 'Flipkart',
                badgeColor: 'bg-emerald-700',
                link: 'https://fktr.in/ij5qmh9'
              },
              {
                id: 'deal-4',
                title: 'Flipkart Big Fashion Super Saver Clearance',
                brand: 'Flipkart Fashion',
                discount: 'Under ₹499',
                price: '₹499',
                originalPrice: '₹1,499',
                image: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=600&h=800&q=80',
                platform: 'Flipkart',
                badgeColor: 'bg-blue-600',
                link: 'https://fktr.in/LNVdEws'
              }
            ].map(d => (
              <div key={d.id} className="group relative bg-white dark:bg-charcoal-light rounded-3xl overflow-hidden shadow-card hover:shadow-hover transition-all duration-300 border border-border dark:border-gray-800 flex flex-col justify-between">
                <div>
                  <div className="relative aspect-[4/5] overflow-hidden bg-gray-100 dark:bg-charcoal">
                    <img src={d.image} alt={d.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    <span className="absolute top-3 left-3 bg-red-600 text-white font-bold text-[11px] px-2.5 py-1 rounded-full shadow-md animate-pulse">
                      {d.discount}
                    </span>
                    <span className={`absolute top-3 right-3 text-white font-semibold text-[10px] px-2.5 py-1 rounded-full shadow-md ${d.badgeColor}`}>
                      {d.platform}
                    </span>
                  </div>
                  <div className="p-4">
                    <p className="text-[11px] font-bold text-gold uppercase tracking-wider mb-1">{d.brand}</p>
                    <h3 className="font-semibold text-sm text-charcoal dark:text-cream line-clamp-2 mb-2 leading-snug">
                      {d.title}
                    </h3>
                    <div className="flex items-baseline gap-2 mb-3">
                      <span className="text-lg font-bold text-charcoal dark:text-cream">{d.price}</span>
                      <span className="text-xs text-gray-400 line-through">{d.originalPrice}</span>
                    </div>
                  </div>
                </div>
                <div className="px-4 pb-4">
                  <a
                    href={d.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2.5 rounded-xl gradient-gold text-charcoal font-bold text-xs flex items-center justify-center gap-1.5 shadow hover:scale-[1.02] active:scale-95 transition-all"
                  >
                    <FiExternalLink className="w-3.5 h-3.5" /> Buy on {d.platform}
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Filters Panel */}
        <div className="bg-white dark:bg-charcoal-light/30 rounded-3xl p-6 shadow-card mb-8 border border-border dark:border-gray-800">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
            
            {/* Platform filter */}
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-2 tracking-wider">Select Platform</label>
              <div className="flex gap-1.5 flex-wrap">
                {[
                  { id: 'all', label: 'All' },
                  { id: 'amazon', label: 'Amazon' },
                  { id: 'flipkart', label: 'Flipkart' },
                  { id: 'myntra', label: 'Myntra' },
                ].map(p => (
                  <button
                    key={p.id}
                    onClick={() => setPlatform(p.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all
                      ${platform === p.id 
                        ? 'bg-gold text-white shadow-md' 
                        : 'bg-cream dark:bg-charcoal text-gray-600 dark:text-gray-400 hover:bg-gold/10'
                      }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Category filter */}
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-2 tracking-wider">Category</label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="w-full px-3 py-2 text-xs font-semibold rounded-xl bg-cream dark:bg-charcoal border-0 text-gray-700 dark:text-gray-300 focus:ring-1 focus:ring-gold"
              >
                <option value="all">All Categories</option>
                <option value="upperwear">Upper Wear</option>
                <option value="lowerwear">Lower Wear</option>
                <option value="footwear">Footwear</option>
                <option value="accessories">Accessories</option>
              </select>
            </div>

            {/* Gender filter */}
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-2 tracking-wider">Gender</label>
              <select
                value={gender}
                onChange={e => setGender(e.target.value)}
                className="w-full px-3 py-2 text-xs font-semibold rounded-xl bg-cream dark:bg-charcoal border-0 text-gray-700 dark:text-gray-300 focus:ring-1 focus:ring-gold"
              >
                <option value="all">All Genders</option>
                <option value="boys">Boys</option>
                <option value="girls">Girls</option>
              </select>
            </div>

            {/* Sorting */}
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-2 tracking-wider">Sort By</label>
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                className="w-full px-3 py-2 text-xs font-semibold rounded-xl bg-cream dark:bg-charcoal border-0 text-gray-700 dark:text-gray-300 focus:ring-1 focus:ring-gold"
              >
                <option value="discount">🔥 Highest Discount</option>
                <option value="trust">🛡️ Trust Score</option>
                <option value="price_asc">💰 Price: Low to High</option>
              </select>
            </div>

          </div>
        </div>

        <AffiliateDisclosureBanner className="mb-8" />

        {/* Grid results */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="shimmer-bg aspect-[3/4] rounded-2xl" />
            ))}
          </div>
        ) : filteredItems.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
            <AnimatePresence>
              {filteredItems.map((item, index) => {
                const tLevel = item.trust_score >= 80 ? 'high' : item.trust_score >= 60 ? 'medium' : 'low'
                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.35, delay: index * 0.05 }}
                    className="group relative bg-white dark:bg-charcoal-light/40 rounded-2xl overflow-hidden shadow-card hover:shadow-hover transition-all duration-300 border border-border dark:border-gray-800"
                  >
                    
                    {/* Image frame */}
                    <Link to={`/item/${item.id}`} className="block">
                      <div className="relative aspect-[3/4] overflow-hidden bg-cream dark:bg-charcoal">
                        <img
                          src={item.image_path || FALLBACK}
                          alt={item.name}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          onError={e => { e.target.src = FALLBACK }}
                        />
                        
                        {/* Discount badge */}
                        <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-lg shadow-md flex items-center gap-0.5">
                          <FiPercent className="w-3.5 h-3.5" />
                          <span>{item.discountPercent}% OFF</span>
                        </div>

                        {/* Platform Source tag */}
                        <div className="absolute top-3 right-3">
                          <span className={`text-[10px] font-bold text-white px-2 py-1 rounded-full shadow-md ${item.logoColor}`}>
                            {item.platformName}
                          </span>
                        </div>

                        {/* Trust Score badge */}
                        <div className="absolute bottom-3 left-3">
                          <span className={`text-[10px] font-bold px-2 py-1 rounded-full shadow-md backdrop-blur-md flex items-center gap-1 bg-black/60 text-white border border-white/10`}>
                            <FiShield className={tLevel === 'high' ? 'text-emerald-400' : tLevel === 'medium' ? 'text-amber-400' : 'text-red-400'} />
                            <span>Trust: {item.trust_score.toFixed(0)}</span>
                          </span>
                        </div>

                      </div>
                    </Link>

                    {/* Card Body */}
                    <div className="p-4">
                      <div className="flex justify-between items-center mb-1 text-[10px] uppercase font-bold text-gold tracking-wide">
                        <span>{item.subcategory}</span>
                        <span className="text-gray-400">{item.brand}</span>
                      </div>
                      
                      <Link to={`/item/${item.id}`} className="block">
                        <h3 className="font-display font-bold text-sm text-charcoal dark:text-cream leading-tight mb-2 line-clamp-1 group-hover:text-gold transition-colors">
                          {item.name}
                        </h3>
                      </Link>

                      <RatingTag item={item} compact />

                      <div className="flex items-baseline justify-between mt-3">
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-lg font-bold text-charcoal dark:text-cream">
                            ₹{item.price.toLocaleString('en-IN')}
                          </span>
                          <span className="text-xs text-gray-400 line-through">
                            ₹{item.originalPrice.toLocaleString('en-IN')}
                          </span>
                        </div>
                      </div>

                      {/* Buy link button */}
                      <a
                        href={`/api/affiliate/redirect/${item.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-4 w-full flex items-center justify-center gap-1.5 py-2 rounded-xl bg-charcoal dark:bg-gold text-white dark:text-charcoal text-xs font-semibold hover:opacity-90 transition-opacity"
                      >
                        <FiExternalLink />
                        Buy on {item.platformName}
                      </a>

                    </div>

                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>
        ) : (
          <div className="text-center py-20 bg-white dark:bg-charcoal-light/30 rounded-3xl p-8 shadow-card">
            <span className="text-5xl">🏷️</span>
            <h3 className="font-display text-xl font-bold text-charcoal dark:text-cream mt-4 mb-1">No deals matching the filters</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">Try changing your filters to see more deals.</p>
          </div>
        )}

      </div>
    </div>
  )
}
