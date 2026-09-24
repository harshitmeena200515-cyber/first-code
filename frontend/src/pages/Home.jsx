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
    const ctx    = canvas.getContext('2d')
    let raf
    const resize = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight }
    resize()
    window.addEventListener('resize', resize)
    const particles = Array.from({ length: 60 }, () => ({
      x: Math.random() * canvas.width, y: Math.random() * canvas.height,
      r: Math.random() * 2 + 0.5, vx: (Math.random() - 0.5) * 0.4, vy: (Math.random() - 0.5) * 0.4,
      a: Math.random(),
    }))
    const draw = () => {
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
    const step = target / 50
    const id = setInterval(() => {
      start += step
      if (start >= target) { setVal(target); clearInterval(id) } else setVal(Math.floor(start))
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

  useEffect(() => {
    fetchTrending({ limit: 8 }).then(r => setTrending(r.data)).catch(() => {})
    fetchNewArrivals({ limit: 6 }).then(r => setArrivals(r.data)).catch(() => {})
    fetchStats().then(r => setStats(r.data)).catch(() => {})
  }, [])

  const { scrollY } = useScroll()
  const heroY       = useTransform(scrollY, [0, 500], [0, 120])
  const heroOp      = useTransform(scrollY, [0, 400], [1, 0])

  return (
    <div className="min-h-screen bg-cream dark:bg-charcoal-dark">

      {/* ════════════════════════════════════════ HERO ═══ */}
      <section className="relative min-h-[92vh] flex items-center justify-center overflow-hidden gradient-dark">
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
            className="font-display text-5xl md:text-7xl font-bold text-white leading-tight mb-6"
          >
            Dress With{' '}
            <span className="gradient-text">Confidence.</span>
            <br />Verified Reality.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="text-gray-300 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            AI-powered fashion guidance + real review verification. Filter fake reviews,
            see products as customers actually receive them.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="flex flex-wrap items-center justify-center gap-4"
          >
            <Link
              to="/categories/boys"
              className="px-8 py-3.5 rounded-2xl gradient-gold text-charcoal font-semibold text-sm hover:shadow-gold hover:scale-105 active:scale-95 transition-all"
            >
              Explore Boys →
            </Link>
            <Link
              to="/categories/girls"
              className="px-8 py-3.5 rounded-2xl border border-white/20 text-white font-semibold text-sm hover:border-gold/60 hover:bg-white/5 transition-all"
            >
              Explore Girls →
            </Link>
            <Link
              to="/quiz"
              className="px-8 py-3.5 rounded-2xl bg-white/10 backdrop-blur text-white font-semibold text-sm hover:bg-white/20 transition-all"
            >
              🎯 Take Fashion Quiz
            </Link>
          </motion.div>

          {/* Stats pills */}
          {stats && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.1 }}
              className="flex flex-wrap items-center justify-center gap-6 mt-14"
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
      <section className="py-24 px-6 max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <p className="text-gold text-xs font-semibold uppercase tracking-widest mb-3">Shop By</p>
          <h2 className="font-display text-4xl font-bold text-charcoal dark:text-cream">Choose Your Style</h2>
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
      <section className="py-20 bg-white dark:bg-charcoal-light/30">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between mb-10">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <p className="text-gold text-xs font-semibold uppercase tracking-widest mb-1">Right Now</p>
              <h2 className="font-display text-3xl font-bold text-charcoal dark:text-cream flex items-center gap-2">
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
                    fetchTrending({ gender: g, limit: 8 }).then(r => setTrending(r.data)).catch(() => {})
                  }}
                  className={`px-5 py-2 text-sm font-medium transition-colors capitalize
                    ${tab === g ? 'bg-gold text-white' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-charcoal-light'}`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          {trending.length > 0 ? (
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

      {/* ════════════════════════════════ FASHION GUIDE TEASER ═══ */}
      <section className="py-20 px-6 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative rounded-3xl gradient-dark overflow-hidden p-10 md:p-16 text-center"
        >
          <HeroParticles />
          <div className="relative z-10">
            <FiZap className="w-10 h-10 text-gold mx-auto mb-4" />
            <h2 className="font-display text-4xl font-bold text-white mb-4">
              Not Sure What to Wear?
            </h2>
            <p className="text-gray-300 text-lg max-w-xl mx-auto mb-8">
              Our Fashion Guide covers color theory, body types, skin tones, seasons, and occasions.
              Learn to dress like a stylist.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link to="/guide" className="px-8 py-3.5 rounded-2xl gradient-gold text-charcoal font-semibold text-sm hover:shadow-gold transition-all">
                Explore Fashion Guide
              </Link>
              <Link to="/quiz" className="px-8 py-3.5 rounded-2xl border border-white/20 text-white font-semibold text-sm hover:border-gold/60 transition-all">
                🎯 Take the Quiz
              </Link>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ════════════════════════════════════ NEW ARRIVALS ═══ */}
      {arrivals.length > 0 && (
        <section className="py-20 bg-cream dark:bg-charcoal-dark px-6">
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
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
              {arrivals.map((item, i) => <ClothingCard key={item.id} item={item} index={i} />)}
            </div>
          </div>
        </section>
      )}

      {/* ══════════════════════════════════ E vs R PROMO ═══ */}
      <section className="py-20 px-6 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="grid md:grid-cols-2 gap-12 items-center"
        >
          <div>
            <p className="text-gold text-xs font-semibold uppercase tracking-widest mb-3">Reality Check</p>
            <h2 className="font-display text-4xl font-bold text-charcoal dark:text-cream mb-4 leading-tight">
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
