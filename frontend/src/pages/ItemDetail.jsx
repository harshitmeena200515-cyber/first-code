import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiHeart, FiExternalLink, FiShare2, FiCheckCircle, FiXCircle, FiChevronRight } from 'react-icons/fi'
import { fetchCloth, fetchClothes, addRecentlyViewed, addFavorite, removeFavorite, isFavorite, fraudAnalyze, fetchReviews } from '../api'
import RatingTag from '../components/RatingTag'
import ExpectationVsReality from '../components/ExpectationVsReality'
import ClothingCard from '../components/ClothingCard'
import AffiliateDisclosureBanner from '../components/AffiliateDisclosureBanner'
import AdSlot from '../components/AdSlot'

const FALLBACK = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='500'%3E%3Crect fill='%23f3f4f6' width='400' height='500'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' fill='%236b7280' font-size='14' font-family='sans-serif'%3ENo Image%3C/text%3E%3C/svg%3E"

function InfoRow({ label, value }) {
  if (!value) return null
  return (
    <div className="flex items-start justify-between py-2 border-b border-border dark:border-gray-700 last:border-0">
      <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider w-28 shrink-0">{label}</span>
      <span className="text-sm text-charcoal dark:text-cream text-right flex-1">{value}</span>
    </div>
  )
}

function ScoreMeter({ score, label }) {
  return (
    <div>
      <div className="flex items-center justify-between text-xs mb-1">
        <span className="text-gray-500 dark:text-gray-400">{label}</span>
        <span className="font-bold text-charcoal dark:text-cream">{score}/100</span>
      </div>
      <div className="h-2 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
          className={`h-full rounded-full ${score >= 80 ? 'bg-emerald-500' : score >= 60 ? 'bg-amber-400' : 'bg-red-500'}`}
        />
      </div>
    </div>
  )
}

export default function ItemDetail() {
  const { id } = useParams()
  const [item,   setItem]    = useState(null)
  const [related, setRelated] = useState([])
  const [reviews, setReviews] = useState([])
  const [fav,    setFav]     = useState(false)
  const [tab,    setTab]     = useState('overview')
  const [fraud,  setFraud]   = useState(null)
  const [loading, setLoading] = useState(true)
  const [imgErr,  setImgErr]  = useState(false)
  const [zoom,    setZoom]    = useState(false)

  useEffect(() => {
    setLoading(true)
    fetchCloth(id)
      .then(r => {
        setItem(r.data)
        setFav(isFavorite(r.data.id))
        addRecentlyViewed(r.data)
        // Fetch related
        fetchClothes({
          gender: r.data.gender,
          category: r.data.category,
          subcategory: r.data.subcategory,
          limit: 6,
        }).then(rel => setRelated(rel.data.items.filter(x => x.id !== r.data.id).slice(0, 4)))
        // Fraud analysis
        fraudAnalyze(r.data.id)
          .then(f => setFraud(f.data))
          .catch(() => {})
        
        fetchReviews(r.data.id)
          .then(rev => setReviews(rev.data.reviews || []))
          .catch(() => {})
      })
      .finally(() => setLoading(false))
  }, [id])

  const toggleFav = () => {
    if (fav) removeFavorite(item.id); else addFavorite(item.id)
    setFav(!fav)
  }

  if (loading) return (
    <div className="max-w-6xl mx-auto px-6 py-12 grid md:grid-cols-2 gap-10 animate-pulse">
      <div className="shimmer-bg aspect-[3/4] rounded-3xl" />
      <div className="space-y-4">
        <div className="shimmer-bg h-5 w-1/3 rounded" />
        <div className="shimmer-bg h-10 rounded" />
        <div className="shimmer-bg h-6 w-1/4 rounded" />
      </div>
    </div>
  )

  if (!item) return <div className="text-center py-24"><p className="text-2xl">Item not found</p></div>

  const breadcrumb = [
    { label: 'Home', to: '/' },
    { label: item.gender?.charAt(0).toUpperCase() + item.gender?.slice(1), to: `/categories/${item.gender}` },
    { label: item.category, to: `/gallery/${item.gender}/${item.category}` },
    { label: item.subcategory, to: `/gallery/${item.gender}/${item.category}/${item.subcategory}` },
    { label: item.name },
  ]

  const tLevel = item.trust_score >= 80 ? 'high' : item.trust_score >= 60 ? 'medium' : item.trust_score >= 40 ? 'low' : 'very_low'

  return (
    <div className="min-h-screen bg-cream dark:bg-charcoal-dark">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">

        {/* Breadcrumb */}
        <nav className="flex items-center flex-wrap gap-1 text-xs text-gray-400 mb-8">
          {breadcrumb.map((b, i) => (
            <span key={i} className="flex items-center gap-1">
              {i > 0 && <FiChevronRight className="w-3 h-3" />}
              {b.to ? (
                <Link to={b.to} className="hover:text-gold transition-colors">{b.label}</Link>
              ) : (
                <span className="text-charcoal dark:text-cream">{b.label}</span>
              )}
            </span>
          ))}
        </nav>

        <div className="grid md:grid-cols-2 gap-10 mb-16">
          {/* ── LEFT: Images ── */}
          <div className="space-y-4">
            {/* Main image with zoom */}
            <div
              className="relative aspect-[3/4] rounded-3xl overflow-hidden cursor-zoom-in bg-gray-100 dark:bg-charcoal-light group"
              onClick={() => setZoom(true)}
            >
              <img
                src={imgErr ? FALLBACK : item.image_path || FALLBACK}
                alt={item.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                onError={() => setImgErr(true)}
              />
              <div className="absolute bottom-3 right-3 bg-charcoal/70 backdrop-blur text-white text-[10px] px-2 py-1 rounded-full">
                🔍 Click to zoom
              </div>
              {item.trend_score >= 88 && (
                <div className="absolute top-4 left-4">
                  <span className="px-3 py-1 rounded-full bg-gold text-white text-xs font-bold shadow-gold animate-pulse-gold">
                    🔥 Trending
                  </span>
                </div>
              )}
            </div>

            {/* E vs R slider */}
            {item.customer_photo && (
              <div>
                <h4 className="text-sm font-semibold text-charcoal dark:text-cream mb-2 flex items-center gap-2">
                  🆚 Expectation vs Reality
                  <span className="text-xs text-gray-400 font-normal">Drag the slider →</span>
                </h4>
                <ExpectationVsReality studioSrc={item.image_path} customerSrc={item.customer_photo} />
              </div>
            )}
          </div>

          {/* ── RIGHT: Details ── */}
          <div>
            {/* Header */}
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-bold text-gold uppercase tracking-widest">{item.subcategory}</span>
                <span className="text-gray-300 dark:text-gray-600">·</span>
                <span className="text-xs text-gray-400">{item.brand}</span>
                <span className={`ml-auto text-xs font-bold px-2 py-0.5 rounded-full trust-${tLevel}`}>
                  {tLevel === 'high' ? '✅' : tLevel === 'medium' ? '🔍' : '⚠️'} Trust: {item.trust_score?.toFixed(0)}
                </span>
              </div>
              <h1 className="font-display text-xl sm:text-2xl md:text-3xl font-bold text-charcoal dark:text-cream leading-tight mb-3">
                {item.name}
              </h1>
              <div className="text-2xl sm:text-3xl font-bold text-charcoal dark:text-cream mb-4">
                ₹{item.price?.toLocaleString('en-IN')}
              </div>
              <RatingTag item={item} />
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <button
                onClick={toggleFav}
                className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-semibold text-sm transition-all
                  ${fav ? 'bg-red-50 dark:bg-red-900/30 text-red-500 border border-red-200 dark:border-red-800' : 'bg-gray-100 dark:bg-charcoal-light text-gray-600 dark:text-gray-300 hover:bg-red-50 hover:text-red-500'}`}
              >
                <FiHeart className={fav ? 'fill-current' : ''} /> {fav ? 'Saved' : 'Save'}
              </button>

              {item.external_link && (() => {
                const url = (item.external_link || '').toLowerCase()
                let platform = 'Store'
                let btnStyle = 'gradient-gold text-charcoal'
                if (url.includes('amazon')) { platform = 'Amazon'; btnStyle = 'bg-[#FF9900] hover:bg-[#E68A00] text-black' }
                else if (url.includes('flipkart')) { platform = 'Flipkart'; btnStyle = 'bg-[#2874F0] hover:bg-[#1C5EC8] text-white' }
                else if (url.includes('myntra')) { platform = 'Myntra'; btnStyle = 'bg-gradient-to-r from-[#FF3F6C] to-[#F13AB1] text-white' }
                else if (url.includes('meesho')) { platform = 'Meesho'; btnStyle = 'bg-[#9B256B] hover:bg-[#801D56] text-white' }
                else if (url.includes('ajio')) { platform = 'Ajio'; btnStyle = 'bg-[#2C4152] hover:bg-[#20313E] text-white' }

                return (
                  <a
                    href={`/api/affiliate/redirect/${item.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-2xl font-bold text-sm shadow-md hover:scale-[1.02] active:scale-95 transition-all ${btnStyle}`}
                  >
                    <FiExternalLink className="w-4 h-4" /> Buy on {platform}
                  </a>
                )
              })()}

              <button
                onClick={() => navigator.share?.({ title: item.name, url: location.href })}
                className="p-3 rounded-2xl bg-gray-100 dark:bg-charcoal-light text-gray-600 dark:text-gray-300 hover:bg-gray-200 transition-colors"
              >
                <FiShare2 className="w-4 h-4" />
              </button>
            </div>

            <AffiliateDisclosureBanner className="mt-4 mb-6" />

            {/* Tabs */}
            <div className="flex gap-1 bg-gray-100 dark:bg-charcoal-light/60 p-1 rounded-xl mb-5 overflow-x-auto">
              {['overview', 'style guide', 'e vs r', 'fraud check'].map(t => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors capitalize whitespace-nowrap
                    ${tab === t ? 'bg-white dark:bg-charcoal shadow text-charcoal dark:text-cream' : 'text-gray-500 dark:text-gray-400 hover:text-charcoal dark:hover:text-cream'}`}
                >
                  {t}
                </button>
              ))}
            </div>

            {/* Tab content */}
            {tab === 'overview' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{item.description}</p>
                <div className="bg-white dark:bg-charcoal-light/30 rounded-xl p-4 space-y-1">
                  <InfoRow label="Category"    value={item.category} />
                  <InfoRow label="Style"       value={item.style} />
                  <InfoRow label="Color"       value={item.color} />
                  <InfoRow label="Fabric"      value={item.fabric} />
                  <InfoRow label="Season"      value={item.season} />
                  <InfoRow label="Occasion"    value={item.occasion} />
                  <InfoRow label="Age Group"   value={item.age_group} />
                  <InfoRow label="Comfort"     value={item.comfort_level} />
                  <InfoRow label="Gender"      value={item.gender?.charAt(0).toUpperCase() + item.gender?.slice(1)} />
                </div>

                {/* Body type */}
                {item.body_type_suitability?.length > 0 && (
                  <div className="bg-white dark:bg-charcoal-light/30 rounded-xl p-4">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Body Type Suitability</p>
                    <div className="flex flex-wrap gap-1.5">
                      {item.body_type_suitability.map(bt => (
                        <span key={bt} className="px-2.5 py-1 rounded-full text-xs font-medium bg-gold/15 text-gold">{bt}</span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Skin tone */}
                {item.skin_tone_suitability?.length > 0 && (
                  <div className="bg-white dark:bg-charcoal-light/30 rounded-xl p-4">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Skin Tone Suitability</p>
                    <div className="flex flex-wrap gap-1.5">
                      {item.skin_tone_suitability.map(st => (
                        <span key={st} className="px-2.5 py-1 rounded-full text-xs font-medium bg-charcoal/10 dark:bg-white/10 text-charcoal dark:text-cream">{st}</span>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {tab === 'style guide' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                {item.styling_tips?.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-charcoal dark:text-cream mb-3">💡 Styling Tips</h4>
                    <ul className="space-y-2">
                      {item.styling_tips.map((tip, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-charcoal-light/30 p-3 rounded-xl">
                          <span className="text-gold font-bold shrink-0">{i + 1}.</span> {tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {item.matching_items?.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-charcoal dark:text-cream mb-3">👔 Pairs Well With</h4>
                    <div className="flex flex-wrap gap-2">
                      {item.matching_items.map((m, i) => (
                        <span key={i} className="px-3 py-1.5 rounded-xl text-xs font-medium bg-charcoal/10 dark:bg-white/10 text-charcoal dark:text-cream">{m}</span>
                      ))}
                    </div>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4">
                  {item.dos?.length > 0 && (
                    <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-4">
                      <h4 className="text-xs font-bold text-emerald-700 dark:text-emerald-400 mb-2 flex items-center gap-1">
                        <FiCheckCircle /> Do's
                      </h4>
                      <ul className="space-y-1">
                        {item.dos.map((d, i) => <li key={i} className="text-xs text-emerald-800 dark:text-emerald-300">✓ {d}</li>)}
                      </ul>
                    </div>
                  )}
                  {item.donts?.length > 0 && (
                    <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-4">
                      <h4 className="text-xs font-bold text-red-700 dark:text-red-400 mb-2 flex items-center gap-1">
                        <FiXCircle /> Don'ts
                      </h4>
                      <ul className="space-y-1">
                        {item.donts.map((d, i) => <li key={i} className="text-xs text-red-800 dark:text-red-300">✗ {d}</li>)}
                      </ul>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {tab === 'e vs r' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                {item.customer_photo ? (
                  <ExpectationVsReality studioSrc={item.image_path} customerSrc={item.customer_photo} />
                ) : (
                  <div className="text-center py-12 text-gray-400">No customer photo available yet</div>
                )}
              </motion.div>
            )}

            {tab === 'fraud check' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                {fraud ? (
                  <>
                    <div className={`p-4 rounded-xl trust-${tLevel}`}>
                      <p className="font-bold text-sm">{fraud.trust_label}</p>
                      <p className="text-xs mt-0.5 opacity-80">Trust Score: {fraud.trust_score}/100</p>
                    </div>
                    <ScoreMeter score={fraud.trust_score} label="Overall Trust Score" />
                    <ScoreMeter score={fraud.breakdown?.base_score || 0} label="Review Authenticity" />
                    <div className="bg-white dark:bg-charcoal-light/30 rounded-xl p-4 space-y-1 text-xs">
                      <p className="font-semibold text-sm mb-2">Score Breakdown</p>
                      <div className="flex justify-between"><span className="text-gray-500">Base Score</span><span>{fraud.breakdown?.base_score}</span></div>
                      <div className="flex justify-between"><span className="text-gray-500">Image Ratio</span><span>{(fraud.breakdown?.image_ratio * 100).toFixed(0)}%</span></div>
                      <div className="flex justify-between text-red-500"><span>Spike Penalty</span><span>-{fraud.breakdown?.spike_penalty}</span></div>
                      <div className="flex justify-between text-red-500"><span>Image Penalty</span><span>-{fraud.breakdown?.image_penalty}</span></div>
                    </div>
                    {fraud.flags?.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Flags</p>
                        {fraud.flags.map((f, i) => <p key={i} className="text-sm text-amber-700 dark:text-amber-400">{f}</p>)}
                      </div>
                    )}
                    {fraud.recommendations?.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Recommendations</p>
                        {fraud.recommendations.map((r, i) => <p key={i} className="text-sm text-gray-700 dark:text-gray-300">{r}</p>)}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-8 text-gray-400">Analysing fraud patterns…</div>
                )}
              </motion.div>
            )}
          </div>
        </div>

        {/* Customer Reviews */}
        {reviews && reviews.length > 0 && (
          <section className="mb-12">
            <h3 className="font-display text-2xl font-bold text-charcoal dark:text-cream mb-6">Customer Reviews</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4">
              {reviews.map((rev, i) => rev.photo_url ? (
                <div key={i} className="relative aspect-square rounded-2xl overflow-hidden group">
                  <img src={rev.photo_url} alt="Review" className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" />
                  {rev.is_suspicious && (
                    <div className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-md">
                      ⚠️ Suspicious
                    </div>
                  )}
                  {rev.is_duplicate && (
                    <div className="absolute top-2 right-2 bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-md">
                      📄 Duplicate
                    </div>
                  )}
                </div>
              ) : null)}
            </div>
          </section>
        )}

        <AdSlot format="rectangle" className="my-8" />

        {/* Related items */}
        {related.length > 0 && (
          <section>
            <h3 className="font-display text-2xl font-bold text-charcoal dark:text-cream mb-6">You Might Also Like</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
              {related.map((r, i) => <ClothingCard key={r.id} item={r} index={i} />)}
            </div>
          </section>
        )}
      </div>

      {/* Zoom lightbox */}
      {zoom && (
        <div className="fixed inset-0 z-50 bg-charcoal/95 flex items-center justify-center p-4" onClick={() => setZoom(false)}>
          <motion.img
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            src={item.image_path || FALLBACK}
            alt={item.name}
            className="max-w-full max-h-full object-contain rounded-2xl"
          />
          <button className="absolute top-4 right-4 text-white text-3xl hover:text-gold" onClick={() => setZoom(false)}>✕</button>
        </div>
      )}
    </div>
  )
}
