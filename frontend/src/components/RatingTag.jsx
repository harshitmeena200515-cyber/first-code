import { motion } from 'framer-motion'

/** Renders filled/half/empty stars + numeric rating */
export function StarRating({ rating = 0, size = 'sm', showNumber = true }) {
  const stars = Array.from({ length: 5 }, (_, i) => {
    if (rating >= i + 1) return 'full'
    if (rating >= i + 0.5) return 'half'
    return 'empty'
  })
  const sz = { sm: 'text-sm', md: 'text-base', lg: 'text-lg' }[size]

  return (
    <span className={`inline-flex items-center gap-0.5 ${sz}`}>
      {stars.map((type, i) =>
        type === 'full'  ? <span key={i} className="star-filled">★</span> :
        type === 'half'  ? <span key={i} className="star-filled opacity-60">★</span> :
                           <span key={i} className="star-empty">★</span>
      )}
      {showNumber && (
        <span className="ml-1 text-xs font-semibold text-gray-600 dark:text-gray-400">
          {rating.toFixed(1)}
        </span>
      )}
    </span>
  )
}

/** Full rating tag: stars + review count + trust badge */
export default function RatingTag({ item, compact = false }) {
  const { rating = 0, review_count = 0, trust_score = 0, trust_level } = item || {}

  const tLevel = trust_level || (
    trust_score >= 80 ? 'high' : trust_score >= 60 ? 'medium' : trust_score >= 40 ? 'low' : 'very_low'
  )

  const trustLabel = {
    high:     '✅ Verified',
    medium:   '🔍 Mostly Trusted',
    low:      '⚠️ Caution',
    very_low: '🚨 Suspicious',
  }[tLevel] || ''

  if (compact) {
    return (
      <div className="flex items-center gap-1.5 flex-wrap">
        <StarRating rating={rating} size="sm" showNumber />
        <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full trust-${tLevel}`}>
          {(trust_score ?? 0).toFixed(0)}
        </span>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col gap-1"
    >
      {/* Stars row */}
      <div className="flex items-center gap-2 flex-wrap">
        <StarRating rating={rating} size="md" showNumber />
        <span className="text-xs text-gray-500 dark:text-gray-400">
          ({(review_count ?? 0).toLocaleString()} reviews)
        </span>
      </div>

      {/* Trust score bar */}
      <div className="flex items-center gap-2">
        <div className="flex-1 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${trust_score}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className={`h-full rounded-full ${
              tLevel === 'high'     ? 'bg-emerald-500' :
              tLevel === 'medium'   ? 'bg-amber-400' :
              tLevel === 'low'      ? 'bg-orange-500' : 'bg-red-500'
            }`}
          />
        </div>
        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full trust-${tLevel}`}>
          {trustLabel}
        </span>
      </div>
    </motion.div>
  )
}
