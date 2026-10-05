import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion'
import { FiArrowRight, FiStar, FiTrendingUp, FiZap } from 'react-icons/fi'
import { fetchTrending, fetchNewArrivals, fetchStats } from '../api'
import ClothingCard from '../components/ClothingCard'

/* ─── Interactive 3D particle constellation background ─────────────── */
function HeroParticles() {
  const canvasRef = useRef(null)
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    let raf
    let mouse = { x: 0, y: 0, targetX: 0, targetY: 0 }

    const onMouseMove = (e) => {
      const { innerWidth: w, innerHeight: h } = window
      mouse.targetX = (e.clientX - w / 2) * 0.05
      mouse.targetY = (e.clientY - h / 2) * 0.05
    }
    window.addEventListener('mousemove', onMouseMove, { passive: true })

    const resize = () => {
      if (!canvas) return
      canvas.width = canvas.offsetWidth || window.innerWidth || 300
      canvas.height = canvas.offsetHeight || window.innerHeight || 300
    }
    resize()
    window.addEventListener('resize', resize)

    // 3D Particles with z-depth
    const particles = Array.from({ length: 65 }, () => ({
      x: Math.random() * (canvas.width || 300),
      y: Math.random() * (canvas.height || 300),
      z: Math.random() * 1.5 + 0.5, // Depth layer factor
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35,
      r: Math.random() * 1.8 + 0.8,
      a: Math.random() * 0.6 + 0.2,
    }))

    const draw = () => {
      if (!ctx || !canvas) return
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      
      // Smooth mouse parallax lerp
      mouse.x += (mouse.targetX - mouse.x) * 0.05
      mouse.y += (mouse.targetY - mouse.y) * 0.05

      // Draw constellation filaments
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = (particles[i].x + mouse.x * particles[i].z) - (particles[j].x + mouse.x * particles[j].z)
          const dy = (particles[i].y + mouse.y * particles[i].z) - (particles[j].y + mouse.y * particles[j].z)
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < 85) {
            ctx.beginPath()
            ctx.moveTo(particles[i].x + mouse.x * particles[i].z, particles[i].y + mouse.y * particles[i].z)
            ctx.lineTo(particles[j].x + mouse.x * particles[j].z, particles[j].y + mouse.y * particles[j].z)
            ctx.strokeStyle = `rgba(201,169,110,${(1 - dist / 85) * 0.15})`
            ctx.lineWidth = 0.6
            ctx.stroke()
          }
        }
      }

      // Draw 3D projected particle nodes
      particles.forEach(p => {
        p.x += p.vx
        p.y += p.vy
        if (p.x < -20) p.x = canvas.width + 20
        if (p.x > canvas.width + 20) p.x = -20
        if (p.y < -20) p.y = canvas.height + 20
        if (p.y > canvas.height + 20) p.y = -20

        const px = p.x + mouse.x * p.z
        const py = p.y + mouse.y * p.z
        const pr = p.r * p.z

        ctx.beginPath()
        ctx.arc(px, py, pr, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(201,169,110,${p.a * 0.7})`
        ctx.shadowColor = '#C9A96E'
        ctx.shadowBlur = p.z > 1.2 ? 6 : 0
        ctx.fill()
        ctx.shadowBlur = 0
      })
      raf = requestAnimationFrame(draw)
    }
    draw()
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', onMouseMove)
    }
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

/* ─── 3D Gender card with perspective tilt ───────────────────────── */
function GenderCard({ gender, img, count }) {
  const [rotate, setRotate] = useState({ x: 0, y: 0 })
  const cardRef = useRef(null)

  const handleMouseMove = (e) => {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left - rect.width / 2
    const y = e.clientY - rect.top - rect.height / 2
    setRotate({ x: -(y / (rect.height / 2)) * 8, y: (x / (rect.width / 2)) * 8 })
  }

  const handleMouseLeave = () => setRotate({ x: 0, y: 0 })

  return (
    <div className="card-3d-wrap w-full">
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          transform: `perspective(1000px) rotateX(${rotate.x}deg) rotateY(${rotate.y}deg)`,
          transformStyle: 'preserve-3d',
        }}
        className="group relative block rounded-3xl overflow-hidden aspect-[3/4] shadow-card hover:shadow-2xl transition-[box-shadow] duration-300 border border-white/10"
      >
        <Link to={`/categories/${gender}`} className="block w-full h-full" style={{ transformStyle: 'preserve-3d' }}>
          <img
            src={img}
            alt={gender}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            style={{ transform: 'translateZ(10px)' }}
            onError={e => { e.target.style.background = 'linear-gradient(135deg,#C9A96E22,#1A1A1A55)' }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-charcoal/90 via-charcoal/30 to-transparent" />

          <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 text-white" style={{ transform: 'translateZ(40px)' }}>
            <p className="text-xs font-semibold text-gold uppercase tracking-widest mb-1">{count} Items</p>
            <h2 className="font-display text-4xl sm:text-5xl font-bold capitalize mb-3 drop-shadow-md">{gender}</h2>
            <div className="inline-flex items-center gap-2 text-sm font-semibold group-hover:gap-3 transition-all text-cream/90 group-hover:text-gold">
              Explore Collection <FiArrowRight className="w-4 h-4" />
            </div>
          </div>

          {/* 3D Border Glow on hover */}
          <div
            className="absolute inset-0 rounded-3xl border-2 border-gold/0 group-hover:border-gold/60 transition-all duration-500 pointer-events-none"
            style={{ transform: 'translateZ(30px)' }}
          />
        </Link>
      </div>
    </div>
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
      <section className="relative min-h-[85vh] md:min-h-[92vh] flex items-center justify-center overflow-hidden gradient-dark perspective-stage">
        <HeroParticles />

        {/* 3D Perspective Grid Horizon */}
        <div className="absolute inset-0 stage-grid-3d opacity-40 pointer-events-none" />

        {/* Decorative 3D volumetric glow blobs */}
        <div className="absolute top-20 -left-20 w-80 h-80 rounded-full bg-gold/15 blur-3xl animate-pulse pointer-events-none" />
        <div className="absolute bottom-20 -right-20 w-96 h-96 rounded-full bg-gold/10 blur-3xl animate-pulse pointer-events-none" style={{ animationDelay: '1s' }} />

        <motion.div style={{ y: heroY, opacity: heroOp }} className="relative z-10 text-center px-6 max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass-3d text-gold text-xs font-semibold uppercase tracking-[0.25em] mb-4 border border-gold/30 shadow-lg"
          >
            <span>✨</span> Your Personal Fashion Advisor
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="font-display text-3xl sm:text-5xl md:text-7xl font-bold text-white leading-tight mb-6 drop-shadow-lg"
          >
            Dress With{' '}
            <span className="gradient-text">Confidence.</span>
            <br />Verified Reality.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="text-gray-300 text-base sm:text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed drop-shadow-sm"
          >
            AI-powered fashion guidance + real review verification. Filter fake reviews,
            see products as customers actually receive them.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="flex flex-col sm:flex-row flex-wrap items-center justify-center gap-3.5 sm:gap-4 w-full sm:w-auto px-4 sm:px-0"
          >
            <Link
              to="/categories/boys"
              className="btn-3d-gold px-8 py-3.5 rounded-2xl font-bold text-sm transition-all w-full sm:w-auto text-center"
            >
              Explore Boys →
            </Link>
            <Link
              to="/categories/girls"
              className="px-8 py-3.5 rounded-2xl glass-3d border border-white/30 text-white font-semibold text-sm hover:border-gold/60 hover:bg-white/10 shadow-lg transition-all w-full sm:w-auto text-center"
            >
              Explore Girls →
            </Link>
            <Link
              to="/gallery/all/all?max_price=499"
              className="px-8 py-3.5 rounded-2xl bg-amber-500/20 border border-amber-400/40 text-amber-300 font-semibold text-sm hover:bg-amber-500/30 transition-all w-full sm:w-auto text-center flex items-center justify-center gap-1.5 shadow-md"
            >
              🏷️ Under ₹499 Store
            </Link>
          </motion.div>

          {/* Stats pills in 3D Glass dock */}
          {stats && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.1 }}
              className="glass-3d rounded-2xl p-4 sm:p-6 mt-10 sm:mt-14 shadow-2xl border border-white/20 dark:border-white/10 max-w-2xl mx-auto flex flex-wrap items-center justify-around gap-6"
            >
              {[
                { label: 'Clothing Items', value: stats.total },
                { label: 'Avg Trust Score', value: Math.round(stats.avg_trust), suffix: '%' },
                { label: 'Verified Brands', value: stats.top_brands?.length || 10 },
              ].map(s => (
                <div key={s.label} className="text-center">
                  <div className="text-2xl sm:text-3xl font-bold font-display gradient-text">
                    <Counter target={s.value} suffix={s.suffix || '+'} />
                  </div>
                  <div className="text-xs text-gray-400 mt-0.5 uppercase tracking-wider">{s.label}</div>
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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card 1: Under 399 */}
          <div className="card-3d-wrap">
            <Link
              to="/gallery/all/all?max_price=399"
              className="group relative block rounded-3xl overflow-hidden p-6 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1.5 bg-gradient-to-br from-[#800F2F] via-[#590D22] to-[#2B0913] border border-red-500/30"
              style={{ transformStyle: 'preserve-3d' }}
            >
              <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase shadow-md" style={{ transform: 'translateZ(30px)' }}>
                🔥 Best Value
              </div>
              <p className="text-xs uppercase tracking-widest text-pink-200 mb-1 font-semibold" style={{ transform: 'translateZ(15px)' }}>Bestselling Kurtas & Tops</p>
              <h3 className="font-display text-3xl sm:text-4xl font-black mb-2 drop-shadow-md" style={{ transform: 'translateZ(25px)' }}>Under ₹399</h3>
              <p className="text-xs text-pink-100/80 mb-6" style={{ transform: 'translateZ(15px)' }}>Top brands · Latest daily trends · Free delivery options</p>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-pink-200 group-hover:gap-2.5 transition-all" style={{ transform: 'translateZ(35px)' }}>
                Shop Under ₹399 <FiArrowRight className="w-3.5 h-3.5" />
              </div>
            </Link>
          </div>

          {/* Card 2: Under 499 */}
          <div className="card-3d-wrap">
            <Link
              to="/gallery/all/all?max_price=499"
              className="group relative block rounded-3xl overflow-hidden p-6 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1.5 bg-gradient-to-br from-[#1B4332] via-[#081C15] to-[#040D0A] border border-emerald-500/30"
              style={{ transformStyle: 'preserve-3d' }}
            >
              <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase shadow-md" style={{ transform: 'translateZ(30px)' }}>
                ⚡ Hot Selling
              </div>
              <p className="text-xs uppercase tracking-widest text-emerald-200 mb-1 font-semibold" style={{ transform: 'translateZ(15px)' }}>T-Shirts, Polos & Shirts</p>
              <h3 className="font-display text-3xl sm:text-4xl font-black mb-2 drop-shadow-md" style={{ transform: 'translateZ(25px)' }}>Under ₹499</h3>
              <p className="text-xs text-emerald-100/80 mb-6" style={{ transform: 'translateZ(15px)' }}>Breathable cotton · Everyday essentials · Min 40% Off</p>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-200 group-hover:gap-2.5 transition-all" style={{ transform: 'translateZ(35px)' }}>
                Shop Under ₹499 <FiArrowRight className="w-3.5 h-3.5" />
              </div>
            </Link>
          </div>

          {/* Card 3: Under 899 */}
          <div className="card-3d-wrap">
            <Link
              to="/gallery/all/all?max_price=899"
              className="group relative block rounded-3xl overflow-hidden p-6 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1.5 bg-gradient-to-br from-[#003566] via-[#001D3D] to-[#000814] border border-blue-500/30"
              style={{ transformStyle: 'preserve-3d' }}
            >
              <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase shadow-md" style={{ transform: 'translateZ(30px)' }}>
                👖 Denim Fest
              </div>
              <p className="text-xs uppercase tracking-widest text-blue-200 mb-1 font-semibold" style={{ transform: 'translateZ(15px)' }}>Jeans, Trousers & Cargos</p>
              <h3 className="font-display text-3xl sm:text-4xl font-black mb-2 drop-shadow-md" style={{ transform: 'translateZ(25px)' }}>Under ₹899</h3>
              <p className="text-xs text-blue-100/80 mb-6" style={{ transform: 'translateZ(15px)' }}>Slim, baggy & relaxed fits from Allen Solly, Levi's & Zara</p>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-200 group-hover:gap-2.5 transition-all" style={{ transform: 'translateZ(35px)' }}>
                Shop Under ₹899 <FiArrowRight className="w-3.5 h-3.5" />
              </div>
            </Link>
          </div>

          {/* Card 4: Under 999 */}
          <div className="card-3d-wrap">
            <Link
              to="/gallery/all/all?max_price=999"
              className="group relative block rounded-3xl overflow-hidden p-6 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1.5 bg-gradient-to-br from-[#7B2CBF] via-[#3C096C] to-[#10002B] border border-purple-500/30"
              style={{ transformStyle: 'preserve-3d' }}
            >
              <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase shadow-md" style={{ transform: 'translateZ(30px)' }}>
                👟 Sneakers
              </div>
              <p className="text-xs uppercase tracking-widest text-purple-200 mb-1 font-semibold" style={{ transform: 'translateZ(15px)' }}>Footwear & Sneakers</p>
              <h3 className="font-display text-3xl sm:text-4xl font-black mb-2 drop-shadow-md" style={{ transform: 'translateZ(25px)' }}>Under ₹999</h3>
              <p className="text-xs text-purple-100/80 mb-6" style={{ transform: 'translateZ(15px)' }}>Chunky sneakers, flats, loafers & boots for boys and girls</p>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-purple-200 group-hover:gap-2.5 transition-all" style={{ transform: 'translateZ(35px)' }}>
                Shop Under ₹999 <FiArrowRight className="w-3.5 h-3.5" />
              </div>
            </Link>
          </div>

          {/* Card 5: Starting 199 */}
          <div className="card-3d-wrap">
            <Link
              to="/gallery/all/accessories"
              className="group relative block rounded-3xl overflow-hidden p-6 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1.5 bg-gradient-to-br from-[#B38A38] via-[#7B5919] to-[#3E2C0B] border border-amber-500/30"
              style={{ transformStyle: 'preserve-3d' }}
            >
              <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase shadow-md" style={{ transform: 'translateZ(30px)' }}>
                ✨ Pocket Friendly
              </div>
              <p className="text-xs uppercase tracking-widest text-amber-200 mb-1 font-semibold" style={{ transform: 'translateZ(15px)' }}>Caps, Belts & Watches</p>
              <h3 className="font-display text-3xl sm:text-4xl font-black mb-2 drop-shadow-md" style={{ transform: 'translateZ(25px)' }}>Starting ₹199</h3>
              <p className="text-xs text-amber-100/80 mb-6" style={{ transform: 'translateZ(15px)' }}>Finish your look with trending fashion accessories & jewellery</p>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-200 group-hover:gap-2.5 transition-all" style={{ transform: 'translateZ(35px)' }}>
                Shop Accessories <FiArrowRight className="w-3.5 h-3.5" />
              </div>
            </Link>
          </div>

          {/* Card 6: Flat 50% - 70% Off */}
          <div className="card-3d-wrap">
            <Link
              to="/deals"
              className="group relative block rounded-3xl overflow-hidden p-6 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1.5 bg-gradient-to-br from-[#E63946] via-[#9B1D28] to-[#45090E] border border-red-400/40"
              style={{ transformStyle: 'preserve-3d' }}
            >
              <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase shadow-md" style={{ transform: 'translateZ(30px)' }}>
                🎉 Mega Savings
              </div>
              <p className="text-xs uppercase tracking-widest text-red-200 mb-1 font-semibold" style={{ transform: 'translateZ(15px)' }}>Festival Clearance Deals</p>
              <h3 className="font-display text-3xl sm:text-4xl font-black mb-2 drop-shadow-md" style={{ transform: 'translateZ(25px)' }}>Flat 50% - 70% Off</h3>
              <p className="text-xs text-red-100/80 mb-6" style={{ transform: 'translateZ(15px)' }}>Reality checked discounts on Amazon, Flipkart, Myntra & Ajio</p>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-red-200 group-hover:gap-2.5 transition-all" style={{ transform: 'translateZ(35px)' }}>
                View All Reality Deals <FiArrowRight className="w-3.5 h-3.5" />
              </div>
            </Link>
          </div>
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
          <div className="card-3d-wrap">
            <div className="rounded-3xl overflow-hidden glass-3d p-4 shadow-2xl border border-white/20 dark:border-white/10 glow-gold-3d" style={{ transformStyle: 'preserve-3d' }}>
              <div className="text-center text-gray-500 dark:text-gray-400 text-xs mb-3 font-semibold uppercase tracking-wider" style={{ transform: 'translateZ(15px)' }}>Interactive Reality Slider →</div>
              <div className="aspect-[3/4] rounded-2xl overflow-hidden relative cursor-col-resize select-none shadow-inner" style={{ transform: 'translateZ(25px)' }}>
                {/* Mini demo EVR */}
                <img
                  src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80"
                  className="w-full h-full object-cover"
                  alt="Studio"
                />
                <div className="absolute top-3 left-3 text-xs font-bold px-2.5 py-1 bg-charcoal/80 text-white rounded-full backdrop-blur-md shadow-md">📸 Studio</div>
                <div className="absolute top-3 right-3 text-xs font-bold px-2.5 py-1 bg-gold/90 text-charcoal rounded-full shadow-md font-semibold">👤 Reality</div>
                <div className="absolute inset-y-0 left-1/2 w-0.5 bg-white/90 shadow-md" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white shadow-2xl flex items-center justify-center text-charcoal font-bold text-sm border-2 border-gold/40">⇔</div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>
    </div>
  )
}
