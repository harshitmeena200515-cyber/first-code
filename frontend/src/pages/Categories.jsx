import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiArrowRight } from 'react-icons/fi'
import { fetchCategories, fetchSubcats } from '../api'

const CATEGORY_META = {
  upperwear:   { icon: '👕', label: 'Upper Wear',  desc: 'Tops, shirts, jackets & more' },
  lowerwear:   { icon: '👖', label: 'Lower Wear',  desc: 'Jeans, trousers, skirts & more' },
  footwear:    { icon: '👟', label: 'Footwear',    desc: 'Sneakers, heels, boots & more' },
  headwear:    { icon: '🧢', label: 'Headwear',    desc: 'Caps, beanies, hats & more' },
  accessories: { icon: '⌚', label: 'Accessories', desc: 'Watches, bags, jewellery & more' },
}

export default function Categories() {
  const { gender = 'boys' } = useParams()
  const [cats,    setCats]    = useState([])
  const [selCat,  setSelCat]  = useState(null)
  const [subcats, setSubcats] = useState([])

  useEffect(() => {
    fetchCategories({ gender }).then(r => setCats(r.data)).catch(() => {})
  }, [gender])

  useEffect(() => {
    if (!selCat) return
    fetchSubcats({ gender, category: selCat })
      .then(r => setSubcats(r.data))
      .catch(() => {})
  }, [selCat, gender])

  const genderLabel = gender?.charAt(0).toUpperCase() + gender?.slice(1)

  const heroImg = gender === 'boys'
    ? 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=600&q=80'
    : 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=600&q=80'

  return (
    <div className="min-h-screen bg-cream dark:bg-charcoal-dark">
      {/* Hero strip */}
      <div className="relative h-48 overflow-hidden">
        <img src={heroImg} alt={gender} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-charcoal/80 to-charcoal/40" />
        <div className="absolute inset-0 flex items-center px-8">
          <div>
            <nav className="flex items-center gap-2 text-xs text-gray-300 mb-2">
              <Link to="/" className="hover:text-gold">Home</Link>
              <span>/</span>
              <span className="text-white capitalize">{gender}</span>
            </nav>
            <h1 className="font-display text-4xl font-bold text-white">
              {genderLabel}'s{' '}
              <span className="gradient-text">Fashion</span>
            </h1>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Category cards */}
        <h2 className="font-display text-2xl font-bold text-charcoal dark:text-cream mb-8">
          Shop by Category
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-5 mb-14">
          {Object.entries(CATEGORY_META).map(([key, meta], i) => {
            const count = cats.find(c => c.category === key)?.count || 0
            return (
              <motion.button
                key={key}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ scale: 1.04, y: -4 }}
                onClick={() => setSelCat(selCat === key ? null : key)}
                className={`relative p-5 rounded-2xl text-center transition-all shadow-card hover:shadow-hover
                  ${selCat === key
                    ? 'bg-charcoal dark:bg-gold text-white ring-2 ring-gold'
                    : 'bg-white dark:bg-charcoal-light/50 text-charcoal dark:text-cream'
                  }`}
              >
                <div className="text-4xl mb-3">{meta.icon}</div>
                <div className="font-semibold text-sm">{meta.label}</div>
                <div className="text-xs mt-1 opacity-60">{meta.desc}</div>
                {count > 0 && (
                  <span className="absolute top-2 right-2 text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-gold/20 text-gold">
                    {count}
                  </span>
                )}
              </motion.button>
            )
          })}
        </div>

        {/* Subcategory types */}
        {selCat && subcats.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h3 className="font-display text-xl font-bold text-charcoal dark:text-cream mb-5">
              {CATEGORY_META[selCat]?.label} Types
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {subcats.map((sc, i) => (
                <motion.div
                  key={sc.subcategory}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Link
                    to={`/gallery/${gender}/${selCat}/${encodeURIComponent(sc.subcategory)}`}
                    className="group flex items-center justify-between p-4 bg-white dark:bg-charcoal-light/50 rounded-xl shadow-card hover:shadow-hover hover:-translate-y-1 transition-all"
                  >
                    <div>
                      <div className="font-semibold text-sm text-charcoal dark:text-cream">{sc.subcategory}</div>
                      <div className="text-xs text-gray-400 mt-0.5">{sc.count} items</div>
                    </div>
                    <FiArrowRight className="w-4 h-4 text-gray-400 group-hover:text-gold group-hover:translate-x-1 transition-all" />
                  </Link>
                </motion.div>
              ))}
            </div>

            {/* View all button */}
            <div className="mt-6">
              <Link
                to={`/gallery/${gender}/${selCat}`}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-gold text-gold hover:bg-gold hover:text-white transition-all text-sm font-medium"
              >
                View All {CATEGORY_META[selCat]?.label} <FiArrowRight />
              </Link>
            </div>
          </motion.div>
        )}

        {/* Quick links to all categories */}
        {!selCat && (
          <div className="mt-4 flex flex-wrap gap-3">
            {Object.entries(CATEGORY_META).map(([key, meta]) => (
              <Link
                key={key}
                to={`/gallery/${gender}/${key}`}
                className="px-4 py-2 rounded-xl text-sm font-medium border border-border dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-gold hover:text-gold transition-colors"
              >
                {meta.icon} View All {meta.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
