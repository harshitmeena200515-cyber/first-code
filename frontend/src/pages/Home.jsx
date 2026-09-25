import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion'
import { FiArrowRight, FiStar, FiTrendingUp, FiZap } from 'react-icons/fi'
import { fetchTrending, fetchNewArrivals, fetchStats } from '../api'
import ClothingCard from '../components/ClothingCard'

/* ─── Animated particle hero background ─────────────────────────── */
function HeroParticles() {
  const canvasRef = useRef(null)
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    let raf
    const resize = () => { 
      if (!canvas) return
      canvas.width = canvas.offsetWidth || window.innerWidth || 300
      canvas.height = canvas.offsetHeight || window.innerHeight || 300
    }
    resize()
    window.addEventListener('resize', resize)
    const particles = Array.from({ length: 60 }, () => ({
      x: Math.random() * (canvas.width || 300), 
      y: Math.random() * (canvas.height || 300),
      r: Math.random() * 2 + 0.5, 
      vx: (Math.random() - 0.5) * 0.4, 
      vy: (Math.random() - 0.5) * 0.4,
      a: Math.random(),
    }))
    const draw = () => {
      if (!ctx || !canvas) return
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy
        if (p.x < 0 || p.x > canvas.width)  p.vx *= -1
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(201,169,110,${p.a * 0.6})`; ctx.fill()
      })
      raf = requestAnimationFrame(draw)
    }
    draw()
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize) }
  }, [])
  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />
}

/* ─── Animated counter ───────────────────────────────────────────── */
function Counter({ target, suffix = '' }) {
  const [val, setVal] = useState(0)
  useEffect(() => {
    let start = 0
    const t = Number(target) || 0
    const step = Math.max(1, t / 50)
    const id = setInterval(() => {
      start += step
      if (start >= t) { setVal(t); clearInterval(id) } else setVal(Math.floor(start))
    }, 30)
    return () => clearInterval(id)
  }, [target])
  return <>{val.toLocaleString('en-IN')}{suffix}</>
}

/* ─── Gender card ────────────────────────────────────────────────── */
function GenderCard({ gender, img, count }) {
  return (
    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
      <Link
        to={`/categories/${gender}`}
        className="group relative block rounded-3xl overflow-hidden aspect-[3/4] shadow-card hover:shadow-hover transition-shadow"
      >
        <img
          src={img}
          alt={gender}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          onError={e => { e.target.style.background = 'linear-gradient(135deg,#C9A96E22,#1A1A1A55)' }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal/90 via-charcoal/20 to-transparent" />

        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          <p className="text-xs font-medium text-gold/80 uppercase tracking-widest mb-1">{count} Items</p>
          <h2 className="font-display text-4xl font-bold capitalize mb-3">{gender}</h2>
          <div className="flex items-center gap-2 text-sm font-medium group-hover:gap-3 transition-all">
            Explore Collection <FiArrowRight className="w-4 h-4" />
          </div>
        </div>

        {/* Gold border glow on hover */}
        <div className="absolute inset-0 rounded-3xl border-2 border-gold/0 group-hover:border-gold/60 transition-all duration-500" />
      </Link>
    </motion.div>
  )
}

/* ─── Main Home component ────────────────────────────────────────── */
export default function Home() {
  const [trending, setTrending]   = useState([])
  const [arrivals, setArrivals]   = useState([])
  const [stats,    setStats]      = useState(null)
  const [tab,      setTab]        = useState('boys')
  const [loadingTrending, setLoadingTrending] = useState(true)

  const safeExtract = (res) => {
    if (!res || !res.data) return []
    if (Array.isArray(res.data)) return res.data
    if (Array.isArray(res.data.items)) return res.data.items
    return []
  }

  const loadTrendingData = (g = tab) => {
    setLoadingTrending(true)
    fetchTrending({ gender: g, limit: 8 })
      .then(r => {
        const list = safeExtract(r)
        if (list.length > 0) {
          setTrending(list)
        }
      })
      .catch(() => {
        // Retry once after 2.5 seconds if server is waking up
        setTimeout(() => {
          fetchTrending({ gender: g, limit: 8 })
            .then(r => {
              const list = safeExtract(r)
              if (list.length > 0) setTrending(list)
            })
            .catch(() => {})
            .finally(() => setLoadingTrending(false))
        }, 2500)
      })
      .finally(() => setLoadingTrending(false))
  }

  useEffect(() => {
    loadTrendingData('boys')

    fetchNewArrivals({ limit: 6 })
      .then(r => {
        const list = safeExtract(r)
        if (list.length > 0) setArrivals(list)
      })
      .catch(() => {})

    fetchStats()
      .then(r => {
        if (r.data && typeof r.data === 'object' && !Array.isArray(r.data)) setStats(r.data)
      })
      .catch(() => {})
  }, [])

  const { scrollY } = useScroll()
  const heroY       = useTransform(scrollY, [0, 500], [0, 120])
  const heroOp      = useTransform(scrollY, [0, 400], [1, 0])

  return (
    <div className="min-h-screen bg-cream dark:bg-charcoal-dark">

      {/* ════════════════════════════════════════ HERO ═══ */}
      <section className="relative min-h-[85vh] md:min-h-[92vh] flex items-center justify-center overflow-hidden gradient-dark">
        <HeroParticles />

        {/* Decorative blobs */}
        <div className="absolute top-20 -left-20 w-80 h-80 rounded-full bg-gold/10 blur-3xl animate-pulse" />
        <div className="absolute bottom-20 -right-20 w-96 h-96 rounded-full bg-gold/5 blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />

        <motion.div style={{ y: heroY, opacity: heroOp }} className="relative z-10 text-center px-6 max-w-4xl mx-auto">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-gold text-xs font-semibold uppercase tracking-[0.3em] mb-4"
          >
            Your Personal Fashion Advisor
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="font-display text-3xl sm:text-5xl md:text-7xl font-bold text-white leading-tight mb-6"
          >
            Dress With{' '}
            <span className="gradient-text">Confidence.</span>
            <br />Verified Reality.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="text-gray-300 text-base sm:text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            AI-powered fashion guidance + real review verification. Filter fake reviews,
            see products as customers actually receive them.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="flex flex-col sm:flex-row flex-wrap items-center justify-center gap-3 sm:gap-4 w-full sm:w-auto px-4 sm:px-0"
          >
            <Link
              to="/categories/boys"
              className="px-8 py-3.5 rounded-2xl gradient-gold text-charcoal font-semibold text-sm hover:shadow-gold hover:scale-105 active:scale-95 transition-all w-full sm:w-auto text-center"
            >
              Explore Boys →
            </Link>
            <Link
              to="/categories/girls"
              className="px-8 py-3.5 rounded-2xl border border-white/20 text-white font-semibold text-sm hover:border-gold/60 hover:bg-white/5 transition-all w-full sm:w-auto text-center"
            >
              Explore Girls →
            </Link>
            <Link
              to="/gallery/all/all?max_price=499"
              className="px-8 py-3.5 rounded-2xl bg-amber-500/20 border border-amber-400/40 text-amber-300 font-semibold text-sm hover:bg-amber-500/30 transition-all w-full sm:w-auto text-center flex items-center justify-center gap-1.5"
            >
              🏷️ Under ₹499 Store
            </Link>
          </motion.div>

          {/* Stats pills */}
          {stats && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.1 }}
              className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 mt-10 sm:mt-14"
            >
              {[
                { label: 'Clothing Items', value: stats.total },
                { label: 'Avg Trust Score', value: Math.round(stats.avg_trust), suffix: '%' },
                { label: 'Verified Brands', value: stats.top_brands?.length || 10 },
              ].map(s => (
                <div key={s.label} className="text-center">
                  <div className="text-3xl font-bold font-display gradient-text">
                    <Counter target={s.value} suffix={s.suffix || '+'} />
                  </div>
                  <div className="text-xs text-gray-400 mt-0.5">{s.label}</div>
                </div>
              ))}
            </motion.div>
          )}
        </motion.div>

        {/* Scroll cue */}
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1"
        >
          <span className="text-gray-500 text-xs">Scroll</span>
          <div className="w-px h-10 bg-gradient-to-b from-gray-500 to-transparent" />
        </motion.div>
      </section>

      {/* ═══════════════════════════════════ GENDER PICK ═══ */}
      <section className="py-12 sm:py-16 md:py-24 px-4 sm:px-6 max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <p className="text-gold text-xs font-semibold uppercase tracking-widest mb-3">Shop By</p>
          <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-charcoal dark:text-cream">Choose Your Style</h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <GenderCard
              gender="boys"
              count={stats?.boys || ''}
              img="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=600&q=80"
            />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <GenderCard
              gender="girls"
              count={stats?.girls || ''}
              img="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=600&q=80"
            />
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════ TRENDING ═══ */}
      <section className="py-12 sm:py-16 md:py-20 bg-white dark:bg-charcoal-light/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 sm:mb-10">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <p className="text-gold text-xs font-semibold uppercase tracking-widest mb-1">Right Now</p>
              <h2 className="font-display text-xl sm:text-2xl md:text-3xl font-bold text-charcoal dark:text-cream flex items-center gap-2">
                <FiTrendingUp className="text-gold" /> Trending Styles
              </h2>
            </motion.div>

            {/* Gender tabs */}
            <div className="flex rounded-xl overflow-hidden border border-border dark:border-gray-700">
              {['boys', 'girls'].map(g => (
                <button
                  key={g}
                  onClick={() => {
                    setTab(g)
                    loadTrendingData(g)
                  }}
                  className={`px-5 py-2 text-sm font-medium transition-colors capitalize
                    ${tab === g ? 'bg-gold text-white' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-charcoal-light'}`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          {Array.isArray(trending) && trending.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-5">
              {trending.map((item, i) => <ClothingCard key={item.id} item={item} index={i} />)}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="rounded-2xl overflow-hidden">
                  <div className="shimmer-bg aspect-[3/4] rounded-2xl" />
                  <div className="shimmer-bg h-4 mt-2 rounded w-3/4" />
                  <div className="shimmer-bg h-3 mt-1 rounded w-1/2" />
                </div>
              ))}
            </div>
          )}

          <div className="text-center mt-10">
            <Link
              to={`/gallery/${tab}/all`}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-gold text-gold hover:bg-gold hover:text-white transition-all text-sm font-medium"
            >
              View All Trending <FiArrowRight />
            </Link>
          </div>
        </div>
      </section>

      {/* ══════════════════ AMAZON-STYLE BUDGET STORES & DEALS ═══ */}
      <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold/10 text-gold text-xs font-semibold uppercase tracking-widest mb-3">
            <FiZap /> Festival of Deals & Savings
          </div>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-charcoal dark:text-cream mb-3">
            Budget Stores & <span className="gradient-text">Price Steals</span>
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base max-w-2xl mx-auto">
            Discover curated fashion deals sorted by price from Amazon India, Flipkart, Myntra, and Meesho. Verified with real customer photos.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* Card 1: Under 399 */}
          <Link
            to="/gallery/all/all?max_price=399"
            className="group relative rounded-3xl overflow-hidden p-6 text-white shadow-card hover:shadow-hover transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-[#800F2F] via-[#590D22] to-[#2B0913] border border-red-500/20"
          >
            <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase">
              🔥 Best Value
            </div>
            <p className="text-xs uppercase tracking-widest text-pink-200 mb-1 font-semibold">Bestselling Kurtas & Tops</p>
            <h3 className="font-display text-3xl sm:text-4xl font-black mb-2">Under ₹399</h3>
            <p className="text-xs text-pink-100/80 mb-6">Top brands · Latest daily trends · Free delivery options</p>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-pink-200 group-hover:gap-2.5 transition-all">
              Shop Under ₹399 <FiArrowRight className="w-3.5 h-3.5" />
            </div>
          </Link>

          {/* Card 2: Under 499 */}
          <Link
            to="/gallery/all/all?max_price=499"
            className="group relative rounded-3xl overflow-hidden p-6 text-white shadow-card hover:shadow-hover transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-[#1B4332] via-[#081C15] to-[#040D0A] border border-emerald-500/20"
          >
            <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase">
              ⚡ Hot Selling
            </div>
            <p className="text-xs uppercase tracking-widest text-emerald-200 mb-1 font-semibold">T-Shirts, Polos & Shirts</p>
            <h3 className="font-display text-3xl sm:text-4xl font-black mb-2">Under ₹499</h3>
            <p className="text-xs text-emerald-100/80 mb-6">Breathable cotton · Everyday essentials · Min 40% Off</p>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-200 group-hover:gap-2.5 transition-all">
              Shop Under ₹499 <FiArrowRight className="w-3.5 h-3.5" />
            </div>
          </Link>

          {/* Card 3: Under 899 */}
          <Link
            to="/gallery/all/all?max_price=899"
            className="group relative rounded-3xl overflow-hidden p-6 text-white shadow-card hover:shadow-hover transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-[#003566] via-[#001D3D] to-[#000814] border border-blue-500/20"
          >
            <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase">
              👖 Denim Fest
            </div>
            <p className="text-xs uppercase tracking-widest text-blue-200 mb-1 font-semibold">Jeans, Trousers & Cargos</p>
            <h3 className="font-display text-3xl sm:text-4xl font-black mb-2">Under ₹899</h3>
            <p className="text-xs text-blue-100/80 mb-6">Slim, baggy & relaxed fits from Allen Solly, Levi's & Zara</p>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-200 group-hover:gap-2.5 transition-all">
              Shop Under ₹899 <FiArrowRight className="w-3.5 h-3.5" />
            </div>
          </Link>

          {/* Card 4: Under 999 */}
          <Link
            to="/gallery/all/all?max_price=999"
            className="group relative rounded-3xl overflow-hidden p-6 text-white shadow-card hover:shadow-hover transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-[#7B2CBF] via-[#3C096C] to-[#10002B] border border-purple-500/20"
          >
            <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase">
              👟 Sneakers
            </div>
            <p className="text-xs uppercase tracking-widest text-purple-200 mb-1 font-semibold">Footwear & Sneakers</p>
            <h3 className="font-display text-3xl sm:text-4xl font-black mb-2">Under ₹999</h3>
            <p className="text-xs text-purple-100/80 mb-6">Chunky sneakers, flats, loafers & boots for boys and girls</p>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-purple-200 group-hover:gap-2.5 transition-all">
              Shop Under ₹999 <FiArrowRight className="w-3.5 h-3.5" />
            </div>
          </Link>

          {/* Card 5: Starting 199 */}
          <Link
            to="/gallery/all/accessories"
            className="group relative rounded-3xl overflow-hidden p-6 text-white shadow-card hover:shadow-hover transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-[#B38A38] via-[#7B5919] to-[#3E2C0B] border border-amber-500/20"
          >
            <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase">
              ✨ Pocket Friendly
            </div>
            <p className="text-xs uppercase tracking-widest text-amber-200 mb-1 font-semibold">Caps, Belts & Watches</p>
            <h3 className="font-display text-3xl sm:text-4xl font-black mb-2">Starting ₹199</h3>
            <p className="text-xs text-amber-100/80 mb-6">Finish your look with trending fashion accessories & jewellery</p>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-200 group-hover:gap-2.5 transition-all">
              Shop Accessories <FiArrowRight className="w-3.5 h-3.5" />
            </div>
          </Link>

          {/* Card 6: Flat 50% - 70% Off */}
          <Link
            to="/deals"
            className="group relative rounded-3xl overflow-hidden p-6 text-white shadow-card hover:shadow-hover transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-[#E63946] via-[#9B1D28] to-[#45090E] border border-red-400/30"
          >
            <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase">
              🎉 Mega Savings
            </div>
            <p className="text-xs uppercase tracking-widest text-red-200 mb-1 font-semibold">Festival Clearance Deals</p>
            <h3 className="font-display text-3xl sm:text-4xl font-black mb-2">Flat 50% - 70% Off</h3>
            <p className="text-xs text-red-100/80 mb-6">Reality checked discounts on Amazon, Flipkart, Myntra & Ajio</p>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-red-200 group-hover:gap-2.5 transition-all">
              View All Reality Deals <FiArrowRight className="w-3.5 h-3.5" />
            </div>
          </Link>
        </div>
      </section>

      {/* ════════════════════════════════════ NEW ARRIVALS ═══ */}
      {arrivals.length > 0 && (
        <section className="py-12 sm:py-16 md:py-20 bg-cream dark:bg-charcoal-dark px-6">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-10"
            >
              <p className="text-gold text-xs font-semibold uppercase tracking-widest mb-1">Fresh In</p>
              <h2 className="font-display text-3xl font-bold text-charcoal dark:text-cream">New Arrivals</h2>
            </motion.div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              {arrivals.map((item, i) => <ClothingCard key={item.id} item={item} index={i} />)}
            </div>
          </div>
        </section>
      )}

      {/* ══════════════════════════════════ E vs R PROMO ═══ */}
      <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="grid md:grid-cols-2 gap-12 items-center"
        >
          <div>
            <p className="text-gold text-xs font-semibold uppercase tracking-widest mb-3">Reality Check</p>
            <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-charcoal dark:text-cream mb-4 leading-tight">
              See What You Actually Get
            </h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-6">
              Every item shows an interactive <strong>Expectation vs Reality</strong> slider —
              drag to compare the studio photo with real customer review photos.
              Our fraud detection engine scores each product's review authenticity.
            </p>
            <ul className="space-y-3">
              {[
                '🔍 Perceptual image hashing (pHash) to detect copied photos',
                '📷 EXIF metadata analysis — flags Photoshop/Canva edited images',
                '⚠️ Rating spike detection within 3-day windows',
                '✅ Trust Score 0–100 displayed on every item',
              ].map(s => (
                <li key={s} className="text-sm text-gray-700 dark:text-gray-300 flex items-start gap-2">
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-3xl overflow-hidden bg-charcoal p-4 shadow-xl">
            <div className="text-center text-white/60 text-sm mb-3 font-medium">Try the slider →</div>
            <div className="aspect-[3/4] rounded-2xl overflow-hidden relative cursor-col-resize select-none">
              {/* Mini demo EVR */}
              <img
                src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80"
                className="w-full h-full object-cover"
                alt="Studio"
              />
              <div className="absolute top-3 left-3 text-xs font-bold px-2 py-1 bg-charcoal/80 text-white rounded-full backdrop-blur">📸 Studio</div>
              <div className="absolute top-3 right-3 text-xs font-bold px-2 py-1 bg-gold/90 text-charcoal rounded-full">👤 Reality</div>
              <div className="absolute inset-y-0 left-1/2 w-0.5 bg-white/80" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white shadow-xl flex items-center justify-center text-charcoal font-bold text-sm">⇔</div>
            </div>
          </div>
        </motion.div>
      </section>
    </div>
  )
}
