import { useState, useRef, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiHeart, FiExternalLink } from 'react-icons/fi'
import { addFavorite, removeFavorite, isFavorite, getImageUrl } from '../api'
import RatingTag from './RatingTag'

const FALLBACK = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='500'%3E%3Crect fill='%23f3f4f6' width='400' height='500'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' fill='%236b7280' font-size='14' font-family='sans-serif'%3ENo Image%3C/text%3E%3C/svg%3E"

export default function ClothingCard({ item, index = 0, variant = 'grid' }) {
  const [fav, setFav] = useState(() => item ? isFavorite(item.id) : false)
  const [imgErr, setErr] = useState(false)
  const [rotate, setRotate] = useState({ x: 0, y: 0 })
  const [glare, setGlare] = useState({ x: 50, y: 50, opacity: 0 })
  const cardRef = useRef(null)

  if (!item || typeof item !== 'object') return null

  const handleMouseMove = useCallback((e) => {
    if (!cardRef.current || variant === 'list') return
    const rect = cardRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const centerX = rect.width / 2
    const centerY = rect.height / 2
    
    // Tilt calculations max +-10 deg for balanced 3D feel
    const rotateY = ((x - centerX) / centerX) * 10
    const rotateX = -((y - centerY) / centerY) * 10
    
    setRotate({ x: rotateX, y: rotateY })
    setGlare({
      x: (x / rect.width) * 100,
      y: (y / rect.height) * 100,
      opacity: 0.18
    })
  }, [variant])

  const handleMouseLeave = useCallback(() => {
    setRotate({ x: 0, y: 0 })
    setGlare(g => ({ ...g, opacity: 0 }))
  }, [])

  const toggleFav = (e) => {
    e.preventDefault()
    if (fav) removeFavorite(item.id); else addFavorite(item.id)
    setFav(!fav)
  }

  const tScore = item.trust_score ?? 0
  const tLevel = tScore >= 80 ? 'high' : tScore >= 60 ? 'medium' : tScore >= 40 ? 'low' : 'very_low'

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: Math.min(index * 0.05, 0.4), ease: [0.25, 0.46, 0.45, 0.94] }}
      className={`card-3d-wrap ${variant === 'list' ? 'w-full' : ''}`}
    >
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          transform: `perspective(1000px) rotateX(${rotate.x}deg) rotateY(${rotate.y}deg)`,
          transformStyle: 'preserve-3d',
        }}
        className={`group relative bg-white dark:bg-charcoal-light rounded-2xl overflow-hidden
          shadow-card hover:shadow-2xl transition-[box-shadow] duration-300
          border border-gray-100/80 dark:border-white/5
          ${variant === 'list' ? 'flex gap-4' : ''}`}
      >
        {/* Dynamic Specular 3D Glare */}
        <div
          className="pointer-events-none absolute inset-0 z-30 transition-opacity duration-300 rounded-2xl mix-blend-overlay"
          style={{
            opacity: glare.opacity,
            background: `radial-gradient(circle 260px at ${glare.x}% ${glare.y}%, rgba(255, 255, 255, 0.7), transparent 70%)`
          }}
        />

        <Link to={`/item/${item.id}`} className="block w-full" style={{ transformStyle: 'preserve-3d' }}>
          {/* ── Image container with 3D Depth ── */}
          <div
            className={`relative overflow-hidden ${variant === 'list' ? 'w-36 shrink-0' : 'aspect-[3/4]'}`}
            style={{ transform: 'translateZ(20px)', transformStyle: 'preserve-3d' }}
          >
            <img
              src={imgErr ? FALLBACK : (getImageUrl(item.image_path) || FALLBACK)}
              alt={item.name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              onError={() => setErr(true)}
              loading="lazy"
            />

            {/* Dark overlay on hover */}
            <div className="absolute inset-0 bg-charcoal/0 group-hover:bg-charcoal/10 transition-colors duration-300" />

            {/* ── Quick action buttons (elevated in 3D) ── */}
            <div
              className="absolute top-2 right-2 sm:top-3 sm:right-3 flex flex-col gap-1.5 translate-x-0 sm:translate-x-10 group-hover:translate-x-0 transition-transform duration-300 z-20"
              style={{ transform: 'translateZ(45px)' }}
            >
              <button
                onClick={toggleFav}
                className={`w-8 h-8 rounded-full flex items-center justify-center shadow-lg backdrop-blur-md transition-all
                  ${fav ? 'bg-red-500 text-white' : 'bg-white/90 dark:bg-charcoal/90 text-gray-600 dark:text-gray-300 hover:bg-red-50 hover:text-red-500'}`}
                aria-label="Toggle favourite"
              >
                <FiHeart className={`w-3.5 h-3.5 ${fav ? 'fill-current' : ''}`} />
              </button>
              {item.external_link && (
                <a
                  href={`/api/affiliate/redirect/${item.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={e => e.stopPropagation()}
                  className="w-8 h-8 rounded-full flex items-center justify-center bg-white/90 dark:bg-charcoal/90 text-gray-600 dark:text-gray-300 hover:bg-gold hover:text-white shadow-lg backdrop-blur-md transition-all group/affiliate relative"
                  aria-label="View on store"
                >
                  <FiExternalLink className="w-3.5 h-3.5" />
                  <span className="absolute right-9 opacity-0 group-hover/affiliate:opacity-100 text-[8px] text-gray-400 whitespace-nowrap pointer-events-none transition-opacity">
                    (affiliate)
                  </span>
                </a>
              )}
            </div>

            {/* ── Trend badge (elevated in 3D) ── */}
            {item.trend_score >= 88 && (
              <div className="absolute top-3 left-3 z-10" style={{ transform: 'translateZ(35px)' }}>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gold text-white shadow-md">
                  🔥 Trending
                </span>
              </div>
            )}

            {/* ── Trust badge overlay (elevated in 3D) ── */}
            <div className="absolute bottom-3 left-3 z-10" style={{ transform: 'translateZ(35px)' }}>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm trust-${tLevel}`}>
                {tLevel === 'high' ? '✅' : tLevel === 'medium' ? '🔍' : tLevel === 'low' ? '⚠️' : '🚨'} {tScore.toFixed(0)}
              </span>
            </div>
          </div>

          {/* ── Card body with 3D Depth ── */}
          <div className="p-3 sm:p-4" style={{ transform: 'translateZ(25px)', transformStyle: 'preserve-3d' }}>
            {/* Category + Brand row */}
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-medium text-gold uppercase tracking-wider">
                {item.subcategory}
              </span>
              <span className="text-[10px] text-gray-400 dark:text-gray-500">{item.brand}</span>
            </div>

            {/* Name */}
            <h3 className="font-display font-semibold text-xs sm:text-sm text-charcoal dark:text-cream leading-tight line-clamp-2 mb-2">
              {item.name}
            </h3>

            {/* Rating */}
            <RatingTag item={item} compact />

            {/* Price + Color row */}
            <div className="flex items-center justify-between mt-3">
              <div className="flex items-baseline gap-1.5">
                <span className="text-sm sm:text-base font-bold text-charcoal dark:text-cream">
                  ₹{(item.price ?? 0).toLocaleString('en-IN')}
                </span>
                {item.original_price && item.original_price > item.price && (
                  <span className="text-[10px] text-gray-400 line-through">
                    ₹{item.original_price.toLocaleString('en-IN')}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1">
                <div
                  className="w-3 h-3 rounded-full border border-gray-200 dark:border-gray-600 shadow-inner"
                  style={{ background: item.color?.toLowerCase() === 'multi' ? 'linear-gradient(135deg,red,blue,green)' : item.color?.toLowerCase() || '#ccc' }}
                  title={item.color}
                />
                <span className="text-[10px] text-gray-400 dark:text-gray-500">{item.color}</span>
              </div>
            </div>

            {/* External link button (elevated in 3D) */}
            {item.external_link && (
              <div className="mt-3 w-full flex flex-col items-center" style={{ transform: 'translateZ(30px)' }}>
                <a
                  href={`/api/affiliate/redirect/${item.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={e => e.stopPropagation()}
                  className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl
                    bg-charcoal dark:bg-gold text-white dark:text-charcoal text-xs font-semibold
                    hover:opacity-95 shadow-md hover:shadow-lg transition-all"
                >
                  <FiExternalLink className="w-3 h-3" />
                  Buy on Store
                </a>
                <span className="text-[8px] text-gray-400 dark:text-gray-500 mt-0.5">(affiliate)</span>
              </div>
            )}
          </div>
        </Link>
      </div>
    </motion.div>
  )
}
