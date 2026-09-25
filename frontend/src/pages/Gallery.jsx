import React, { useState, useEffect, useCallback } from 'react'
import { useParams, useSearchParams, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { FiFilter, FiGrid, FiList, FiX, FiChevronDown, FiSearch, FiExternalLink } from 'react-icons/fi'
import { fetchClothes, fetchFilters } from '../api'
import ClothingCard from '../components/ClothingCard'
import AdSlot from '../components/AdSlot'

const SORT_OPTIONS = [
  { value: 'trend',      label: '🔥 Trending' },
  { value: 'popular',    label: '⭐ Popular' },
  { value: 'trust',      label: '✅ Most Trusted' },
  { value: 'rating',     label: '⭐ Rating' },
  { value: 'newest',     label: '🆕 Newest' },
  { value: 'price_asc',  label: '💰 Price: Low to High' },
  { value: 'price_desc', label: '💰 Price: High to Low' },
]

function FilterChip({ label, onRemove }) {
  return (
    <motion.span
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      exit={{ scale: 0 }}
      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-gold/15 text-gold"
    >
      {label}
      <button onClick={onRemove} className="hover:text-red-400"><FiX className="w-3 h-3" /></button>
    </motion.span>
  )
}

function FilterSection({ title, options, selected, onToggle }) {
  const [open, setOpen] = useState(true)
  return (
    <div className="border-b border-border dark:border-gray-700 pb-4 mb-4">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between text-sm font-semibold text-charcoal dark:text-cream mb-3"
      >
        {title}
        <FiChevronDown className={`w-4 h-4 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            className="overflow-hidden"
          >
            <div className="flex flex-wrap gap-1.5">
              {options.map(opt => (
                <button
                  key={opt}
                  onClick={() => onToggle(opt)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors
                    ${selected.includes(opt)
                      ? 'bg-gold text-white'
                      : 'bg-gray-100 dark:bg-charcoal-light text-gray-600 dark:text-gray-300 hover:bg-gold/20'
                    }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function Gallery() {
  const { gender = 'all', category = 'all', subcategory = 'all' } = useParams()
  const [sp, setSp] = useSearchParams()

  const [items,    setItems]   = useState([])
  const [total,    setTotal]   = useState(0)
  const [pages,    setPages]   = useState(1)
  const [page,     setPage]    = useState(1)
  const [loading,  setLoading] = useState(true)
  const [filters,  setFilters] = useState({})
  const [view,     setView]    = useState('grid')
  const [sideOpen, setSide]    = useState(false)

  // Active filter state
  const [sort,       setSort]     = useState('trend')
  const [q,          setQ]        = useState(sp.get('q') || '')
  const [selBrands,  setBrands]   = useState([])
  const [selStyles,  setStyles]   = useState([])
  const [selColors,  setColors]   = useState([])
  const [selSeasons, setSeasons]  = useState([])
  const [selOcc,     setOcc]      = useState([])
  const [minPrice,   setMinPrice] = useState('')
  const [maxPrice,   setMaxPrice] = useState('')
  const [minRating,  setRating]   = useState('')
  const [minTrust,   setTrust]    = useState('')
  const [bodyType,   setBodyType] = useState('')
  const [skinTone,   setSkinTone] = useState('')

  // Fetch filter options
  useEffect(() => {
    const g = gender === 'all' ? undefined : gender
    fetchFilters({ gender: g }).then(r => setFilters(r.data)).catch(() => {})
  }, [gender])

  // Fetch items
  const load = useCallback(async (p = 1) => {
    setLoading(true)
    try {
      const params = {
        gender:    gender === 'all' ? undefined : gender,
        category:  category === 'all' ? undefined : category,
        subcategory: subcategory === 'all' ? undefined : subcategory,
        sort, page: p, limit: 12,
        q: q || undefined,
        brand:   selBrands[0],
        style:   selStyles[0],
        color:   selColors[0],
        season:  selSeasons[0],
        occasion: selOcc[0],
        min_price: minPrice || undefined,
        max_price: maxPrice || undefined,
        min_rating: minRating || undefined,
        min_trust:  minTrust || undefined,
        body_type:  bodyType || undefined,
        skin_tone:  skinTone || undefined,
      }
      const res = await fetchClothes(params)
      setItems(res.data.items)
      setTotal(res.data.total)
      setPages(res.data.total_pages)
      setPage(p)
    } finally {
      setLoading(false)
    }
  }, [gender, category, subcategory, sort, q, selBrands, selStyles, selColors, selSeasons, selOcc, minPrice, maxPrice, minRating, minTrust, bodyType, skinTone])

  useEffect(() => { load(1) }, [load])

  const toggle = (setter, val) => setter(prev => prev.includes(val) ? prev.filter(x => x !== val) : [...prev, val])

  const activeFilters = [
    ...selBrands.map(v => ({ label: `Brand: ${v}`, clear: () => setBrands(p => p.filter(x => x !== v)) })),
    ...selStyles.map(v => ({ label: `Style: ${v}`, clear: () => setStyles(p => p.filter(x => x !== v)) })),
    ...selColors.map(v => ({ label: `Color: ${v}`, clear: () => setColors(p => p.filter(x => x !== v)) })),
    ...selSeasons.map(v => ({ label: `Season: ${v}`, clear: () => setSeasons(p => p.filter(x => x !== v)) })),
    ...selOcc.map(v => ({ label: `Occasion: ${v}`, clear: () => setOcc(p => p.filter(x => x !== v)) })),
    bodyType && { label: `Body: ${bodyType}`, clear: () => setBodyType('') },
    skinTone && { label: `Skin: ${skinTone}`, clear: () => setSkinTone('') },
  ].filter(Boolean)

  const clearAll = () => {
    setBrands([]); setStyles([]); setColors([]); setSeasons([]); setOcc([])
    setMinPrice(''); setMaxPrice(''); setRating(''); setTrust(''); setBodyType(''); setSkinTone(''); setQ('')
  }

  const breadcrumb = [
    { label: 'Home', to: '/' },
    gender && gender !== 'all' && { label: gender.charAt(0).toUpperCase() + gender.slice(1), to: `/categories/${gender}` },
    category && category !== 'all' && { label: category, to: `/gallery/${gender}/${category}` },
    subcategory && subcategory !== 'all' && { label: subcategory },
  ].filter(Boolean)

  return (
    <div className="min-h-screen bg-cream dark:bg-charcoal-dark">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-6">
          {breadcrumb.map((b, i) => (
            <span key={i} className="flex items-center gap-2">
              {i > 0 && <span>/</span>}
              {b.to ? (
                <Link to={b.to} className="hover:text-gold transition-colors">{b.label}</Link>
              ) : (
                <span className="text-charcoal dark:text-cream font-medium">{b.label}</span>
              )}
            </span>
          ))}
        </nav>

        <div className="flex gap-8">
          {/* ── Sidebar ── */}
          <aside className={`shrink-0 w-64 ${sideOpen ? 'block' : 'hidden lg:block'}`}>
            <div className="sticky top-24 bg-white dark:bg-charcoal-light/50 rounded-2xl p-5 shadow-card">
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-semibold text-charcoal dark:text-cream">Filters</h3>
                <div className="flex items-center gap-2">
                  {activeFilters.length > 0 && (
                    <button onClick={clearAll} className="text-xs text-gold hover:underline">Clear all</button>
                  )}
                  {sideOpen && (
                    <button
                      onClick={() => setSide(false)}
                      className="lg:hidden p-1.5 rounded-lg text-gray-500 hover:text-red-500 hover:bg-gray-100 dark:hover:bg-charcoal transition-colors"
                      aria-label="Close filters"
                      title="Close filters"
                    >
                      <FiX className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Price range */}
              <div className="border-b border-border dark:border-gray-700 pb-4 mb-4">
                <p className="text-sm font-semibold text-charcoal dark:text-cream mb-3">Price Range (₹)</p>
                <div className="flex gap-2">
                  <input type="number" placeholder="Min" value={minPrice} onChange={e => setMinPrice(e.target.value)}
                    className="w-full px-2 py-1.5 text-xs rounded-lg border border-border dark:border-gray-700 bg-transparent focus:ring-1 focus:ring-gold focus:outline-none" />
                  <input type="number" placeholder="Max" value={maxPrice} onChange={e => setMaxPrice(e.target.value)}
                    className="w-full px-2 py-1.5 text-xs rounded-lg border border-border dark:border-gray-700 bg-transparent focus:ring-1 focus:ring-gold focus:outline-none" />
                </div>
              </div>

              {/* Trust score */}
              <div className="border-b border-border dark:border-gray-700 pb-4 mb-4">
                <p className="text-sm font-semibold text-charcoal dark:text-cream mb-2">Min Trust Score</p>
                <div className="flex gap-2 flex-wrap">
                  {[0, 60, 75, 85].map(v => (
                    <button key={v} onClick={() => setTrust(v === minTrust ? '' : v)}
                      className={`px-2 py-1 rounded-lg text-xs font-medium transition-colors ${Number(minTrust) === v ? 'bg-gold text-white' : 'bg-gray-100 dark:bg-charcoal-light text-gray-600 dark:text-gray-300'}`}>
                      {v === 0 ? 'All' : `≥ ${v}`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Body type */}
              <FilterSection
                title="Body Type"
                options={['Slim', 'Athletic', 'Rectangle', 'Pear', 'Hourglass', 'Apple', 'Inverted Triangle']}
                selected={bodyType ? [bodyType] : []}
                onToggle={v => setBodyType(bodyType === v ? '' : v)}
              />

              {/* Skin tone */}
              <FilterSection
                title="Skin Tone"
                options={['Fair', 'Light', 'Medium', 'Olive', 'Brown', 'Dark']}
                selected={skinTone ? [skinTone] : []}
                onToggle={v => setSkinTone(skinTone === v ? '' : v)}
              />

              {filters.brands?.length > 0 && (
                <FilterSection title="Brand" options={filters.brands} selected={selBrands} onToggle={v => toggle(setBrands, v)} />
              )}
              {filters.styles?.length > 0 && (
                <FilterSection title="Style" options={filters.styles} selected={selStyles} onToggle={v => toggle(setStyles, v)} />
              )}
              {filters.colors?.length > 0 && (
                <FilterSection title="Color" options={filters.colors.slice(0, 12)} selected={selColors} onToggle={v => toggle(setColors, v)} />
              )}
              {filters.seasons?.length > 0 && (
                <FilterSection title="Season" options={filters.seasons} selected={selSeasons} onToggle={v => toggle(setSeasons, v)} />
              )}
              {filters.occasions?.length > 0 && (
                <FilterSection title="Occasion" options={filters.occasions.slice(0, 8)} selected={selOcc} onToggle={v => toggle(setOcc, v)} />
              )}

              {/* Mobile Close / Done button */}
              {sideOpen && (
                <button
                  onClick={() => setSide(false)}
                  className="lg:hidden w-full mt-4 py-2.5 rounded-xl gradient-gold text-charcoal font-semibold text-xs tracking-wider uppercase transition-all shadow-md active:scale-95"
                >
                  Done (View {total} Items)
                </button>
              )}
            </div>
          </aside>

          {/* ── Main content ── */}
          <div className="flex-1 min-w-0">
            {/* Toolbar */}
            <div className="flex flex-wrap items-center gap-3 mb-6">
              {/* Search */}
              <div className="relative flex-1 min-w-[200px]">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  value={q}
                  onChange={e => setQ(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && load(1)}
                  placeholder="Search by name, brand, color…"
                  className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl bg-white dark:bg-charcoal-light/50 border border-border dark:border-gray-700 focus:ring-2 focus:ring-gold/50 focus:outline-none"
                />
              </div>

              {/* Sort */}
              <select
                value={sort}
                onChange={e => setSort(e.target.value)}
                className="px-3 py-2.5 text-sm rounded-xl bg-white dark:bg-charcoal-light/50 border border-border dark:border-gray-700 focus:ring-2 focus:ring-gold/50 focus:outline-none"
              >
                {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>

              {/* View toggle */}
              <div className="flex rounded-xl overflow-hidden border border-border dark:border-gray-700">
                <button onClick={() => setView('grid')} className={`p-2.5 ${view === 'grid' ? 'bg-gold text-white' : 'bg-white dark:bg-charcoal-light/50 text-gray-500'}`}><FiGrid className="w-4 h-4" /></button>
                <button onClick={() => setView('list')} className={`p-2.5 ${view === 'list' ? 'bg-gold text-white' : 'bg-white dark:bg-charcoal-light/50 text-gray-500'}`}><FiList className="w-4 h-4" /></button>
              </div>

              {/* Mobile filter toggle */}
              <button
                onClick={() => setSide(!sideOpen)}
                className="lg:hidden flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-white dark:bg-charcoal-light/50 border border-border dark:border-gray-700 text-sm"
              >
                <FiFilter className="w-4 h-4" /> Filters
                {activeFilters.length > 0 && <span className="w-4 h-4 rounded-full bg-gold text-white text-[9px] flex items-center justify-center">{activeFilters.length}</span>}
              </button>
            </div>

            {/* Active filter chips */}
            <AnimatePresence>
              {activeFilters.length > 0 && (
                <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden mb-4">
                  <div className="flex flex-wrap gap-2 pb-2">
                    {activeFilters.map((f, i) => <FilterChip key={i} label={f.label} onRemove={f.clear} />)}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Results count */}
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">
              {loading ? 'Searching…' : `${total.toLocaleString()} items found`}
            </p>

            {/* Items grid / list */}
            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 gap-5">
                {Array.from({ length: 12 }).map((_, i) => (
                  <div key={i} className="rounded-2xl overflow-hidden">
                    <div className="shimmer-bg aspect-[3/4]" />
                    <div className="p-3 space-y-2">
                      <div className="shimmer-bg h-3 rounded w-2/3" />
                      <div className="shimmer-bg h-4 rounded" />
                      <div className="shimmer-bg h-3 rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : items.length > 0 ? (
              <div className={view === 'grid'
                ? 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 gap-5'
                : 'flex flex-col gap-4'
              }>
                {items.map((item, i) => (
                  <React.Fragment key={item.id}>
                    <ClothingCard item={item} index={i} variant={view} />
                    {(i + 1) % 8 === 0 && i < items.length - 1 && (
                      <div className={view === 'grid' ? 'col-span-2 sm:col-span-3' : 'w-full'}>
                        <AdSlot format="in-feed" />
                      </div>
                    )}
                  </React.Fragment>
                ))}
              </div>
            ) : (
              <div className="text-center py-24">
                <p className="text-5xl mb-4">👗</p>
                <p className="font-display text-2xl text-charcoal dark:text-cream mb-2">No items found</p>
                <p className="text-gray-500 dark:text-gray-400 mb-6">Try adjusting your filters or search term.</p>
                <button onClick={clearAll} className="px-6 py-2.5 rounded-xl bg-gold text-white font-medium hover:bg-gold-dark transition-colors">Clear All Filters</button>
              </div>
            )}

            {/* Pagination */}
            {pages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-10">
                {Array.from({ length: Math.min(pages, 7) }, (_, i) => i + 1).map(p => (
                  <button
                    key={p}
                    onClick={() => load(p)}
                    className={`w-9 h-9 rounded-xl text-sm font-medium transition-colors
                      ${p === page ? 'bg-gold text-white shadow-gold' : 'bg-white dark:bg-charcoal-light/50 text-gray-600 dark:text-gray-300 hover:bg-gold/15'}`}
                  >
                    {p}
                  </button>
                ))}
                {pages > 7 && <span className="text-gray-400">…{pages}</span>}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
