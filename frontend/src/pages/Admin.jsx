import { useState, useEffect } from 'react'
import {
  fetchClothes,
  fetchStats,
  deleteCloth,
  updateCloth,
  createCloth,
  toggleProductStock,
  adminLogin,
  importProductUrl,
  getImageUrl,
} from '../api'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FiLock,
  FiShield,
  FiEye,
  FiEyeOff,
  FiAlertCircle,
  FiEdit2,
  FiTrash2,
  FiPlus,
  FiSearch,
  FiCheck,
  FiX,
  FiUpload,
  FiImage,
  FiExternalLink,
  FiChevronDown,
  FiChevronUp,
  FiPackage,
  FiRefreshCw,
  FiCheckCircle,
} from 'react-icons/fi'

const FALLBACK_IMG =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect fill='%23f3f4f6' width='100' height='100'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' fill='%239ca3af' font-size='12' font-family='sans-serif'%3ENo Image%3C/text%3E%3C/svg%3E"

const STANDARD_CATEGORIES = [
  'upperwear',
  'lowerwear',
  'footwear',
  'headwear',
  'accessories',
]

export default function Admin() {
  const [stats, setStats] = useState(null)
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [genderFilter, setGenderFilter] = useState('')
  const [stockFilter, setStockFilter] = useState('all') // all | in_stock | out_of_stock
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [showForm, setShowForm] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')
  const [feedbackMsg, setFeedbackMsg] = useState(null) // { type: 'success'|'error', text: '' }

  // Auth State
  const [isAuthenticated, setIsAuthenticated] = useState(
    localStorage.getItem('admin_token') === 'true'
  )
  const [authError, setAuthError] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  // 1-Click Importer State
  const [showImporter, setShowImporter] = useState(false)
  const [importUrl, setImportUrl] = useState('')
  const [importGender, setImportGender] = useState('boys')
  const [importing, setImporting] = useState(false)
  const [importStatus, setImportStatus] = useState(null)

  // Add/Edit Form State
  const [formData, setFormData] = useState({
    name: '',
    category: 'upperwear',
    gender: 'unisex',
    price: '',
    original_price: '',
    in_stock: true,
    description: '',
    brand: 'Fashion Brand',
    external_link: '',
    customer_photo: '',
    style: 'Casual',
    fabric: '',
    color: '',
    season: 'All-Season',
  })
  const [imageFile, setImageFile] = useState(null)
  const [imageUrl, setImageUrl] = useState('')
  const [imagePreview, setImagePreview] = useState('')
  const [showAdvanced, setShowAdvanced] = useState(false)

  // Auto-dismiss feedback message after 4s
  useEffect(() => {
    if (feedbackMsg) {
      const timer = setTimeout(() => setFeedbackMsg(null), 4000)
      return () => clearTimeout(timer)
    }
  }, [feedbackMsg])

  // Fetch stats
  useEffect(() => {
    if (isAuthenticated) {
      fetchStats()
        .then((r) => setStats(r.data))
        .catch(() => {})
    }
  }, [isAuthenticated])

  // Load items
  const load = (p = 1) => {
    if (!isAuthenticated) return
    setLoading(true)
    fetchClothes({
      q: search || undefined,
      gender: genderFilter || undefined,
      category: categoryFilter || undefined,
      page: p,
      limit: 15,
      sort: 'newest',
    })
      .then((r) => {
        setItems(r.data.items || [])
        setTotal(r.data.total || 0)
        setPage(p)
      })
      .catch(() => {
        setFeedbackMsg({ type: 'error', text: 'Error loading products catalogue.' })
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load(1)
  }, [search, categoryFilter, genderFilter, isAuthenticated])

  // Handle Login
  const handleLogin = async (e) => {
    e.preventDefault()
    setAuthError('')
    const pwd = e.target.password.value.trim()
    try {
      const res = await adminLogin(pwd)
      if (res.data?.success || res.status === 200) {
        localStorage.setItem('admin_token', 'true')
        setIsAuthenticated(true)
      } else {
        setAuthError('गलत पासवर्ड! कृपया सही पासवर्ड दर्ज करें।')
      }
    } catch (err) {
      if (err.response?.status === 401) {
        setAuthError('गलत पासवर्ड! कृपया सही पासवर्ड दर्ज करें।')
      } else {
        // Fallback fetch in case proxy/env differs
        try {
          const fbRes = await fetch('/api/admin/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ password: pwd }),
          })
          if (fbRes.ok) {
            localStorage.setItem('admin_token', 'true')
            setIsAuthenticated(true)
            return
          }
        } catch (_) {}
        setAuthError('नेटवर्क एरर या बैकएंड ऑफलाइन है।')
      }
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('admin_token')
    setIsAuthenticated(false)
  }

  // Open modal for Adding
  const handleOpenAdd = () => {
    setEditItem(null)
    setFormData({
      name: '',
      category: 'upperwear',
      gender: 'unisex',
      price: '',
      original_price: '',
      in_stock: true,
      description: '',
      brand: 'Fashion Brand',
      external_link: '',
      customer_photo: '',
      style: 'Casual',
      fabric: '',
      color: '',
      season: 'All-Season',
    })
    setImageFile(null)
    setImageUrl('')
    setImagePreview('')
    setShowAdvanced(false)
    setFormError('')
    setShowForm(true)
  }

  // Open modal for Editing
  const handleOpenEdit = (item) => {
    setEditItem(item)
    const origPrice = item.original_price || Math.round(item.price * 1.35)
    setFormData({
      name: item.name || '',
      category: item.category || 'upperwear',
      gender: item.gender || 'unisex',
      price: item.price ?? '',
      original_price: origPrice ?? '',
      in_stock: item.in_stock !== false,
      description: item.description || '',
      brand: item.brand || 'Fashion Brand',
      external_link: item.external_link || '',
      customer_photo: item.customer_photo || '',
      style: item.style || 'Casual',
      fabric: item.fabric || '',
      color: item.color || '',
      season: item.season || 'All-Season',
    })
    setImageFile(null)
    setImageUrl(item.image_path || '')
    setImagePreview(getImageUrl(item.image_path) || '')
    setShowAdvanced(false)
    setFormError('')
    setShowForm(true)
  }

  // Delete product
  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete "${name || 'this item'}"?`)) return
    try {
      await deleteCloth(id)
      setFeedbackMsg({ type: 'success', text: `Product "${name}" deleted successfully.` })
      load(page)
      fetchStats().then((r) => setStats(r.data)).catch(() => {})
    } catch (err) {
      setFeedbackMsg({ type: 'error', text: 'Failed to delete product.' })
    }
  }

  // Quick toggle stock status
  const handleToggleStock = async (id, curStatus) => {
    try {
      await toggleProductStock(id)
      setItems((prev) =>
        prev.map((it) => (it.id === id ? { ...it, in_stock: !curStatus } : it))
      )
      setFeedbackMsg({
        type: 'success',
        text: `Stock status updated to ${!curStatus ? 'In Stock' : 'Out of Stock'}.`,
      })
      fetchStats().then((r) => setStats(r.data)).catch(() => {})
    } catch (err) {
      setFeedbackMsg({ type: 'error', text: 'Error toggling product stock.' })
    }
  }

  // Handle local file selection with preview
  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setFormError('Please select a valid image file (JPG, PNG, WEBP).')
      return
    }
    setImageFile(file)
    const localUrl = URL.createObjectURL(file)
    setImagePreview(localUrl)
    setFormError('')
  }

  // Handle image URL change with preview
  const handleUrlChange = (e) => {
    const url = e.target.value
    setImageUrl(url)
    if (!imageFile) {
      setImagePreview(url)
    }
  }

  // Save Product (Add or Edit)
  const handleSaveProduct = async (e) => {
    e.preventDefault()
    setFormError('')

    if (!formData.name.trim()) {
      setFormError('Product Name is required.')
      return
    }
    if (formData.price === '' || isNaN(formData.price) || Number(formData.price) < 0) {
      setFormError('Please enter a valid selling price.')
      return
    }

    setSaving(true)
    const fd = new FormData()
    fd.append('name', formData.name.trim())
    fd.append('category', (formData.category || 'upperwear').trim().toLowerCase())
    fd.append('gender', (formData.gender || 'unisex').trim().toLowerCase())
    fd.append('price', String(formData.price))
    if (formData.original_price !== '') {
      fd.append('original_price', String(formData.original_price))
    }
    fd.append('in_stock', formData.in_stock ? 'true' : 'false')
    fd.append('brand', (formData.brand || 'Fashion Brand').trim())
    fd.append('description', formData.description || '')
    if (formData.external_link) fd.append('external_link', formData.external_link.trim())
    if (formData.customer_photo) fd.append('customer_photo', formData.customer_photo.trim())
    if (formData.style) fd.append('style', formData.style)
    if (formData.fabric) fd.append('fabric', formData.fabric)
    if (formData.color) fd.append('color', formData.color)
    if (formData.season) fd.append('season', formData.season)

    // SAFE IMAGE LOGIC:
    // 1. If admin picked a file, upload it
    // 2. Else if admin typed a new URL, save URL
    // 3. If neither (field untouched on edit), do not append image/image_path so backend preserves existing!
    if (imageFile) {
      fd.append('image', imageFile)
    } else if (imageUrl && imageUrl.trim()) {
      fd.append('image_path', imageUrl.trim())
    }

    try {
      if (editItem) {
        await updateCloth(editItem.id, fd)
        setFeedbackMsg({ type: 'success', text: `Product "${formData.name}" updated successfully!` })
      } else {
        await createCloth(fd)
        setFeedbackMsg({ type: 'success', text: `Product "${formData.name}" added successfully!` })
      }
      setShowForm(false)
      setEditItem(null)
      load(page)
      fetchStats().then((r) => setStats(r.data)).catch(() => {})
    } catch (err) {
      const msg = err.response?.data?.detail || err.message || 'Error saving product.'
      setFormError(typeof msg === 'string' ? msg : JSON.stringify(msg))
    } finally {
      setSaving(false)
    }
  }

  // 1-Click URL Importer handler
  const handleImportUrl = async (e) => {
    e.preventDefault()
    if (!importUrl) return
    setImporting(true)
    setImportStatus(null)
    try {
      const res = await importProductUrl(importUrl.trim(), importGender)
      setImportStatus({
        type: 'success',
        message: `✅ ${res.data?.message || 'Product imported successfully!'}`,
      })
      setImportUrl('')
      load(1)
      fetchStats().then((r) => setStats(r.data)).catch(() => {})
    } catch (err) {
      const msg = err.response?.data?.detail || err.message || 'Import failed. Please check the URL.'
      setImportStatus({ type: 'error', message: `❌ ${msg}` })
    } finally {
      setImporting(false)
    }
  }

  // Filter items by stock status if selected
  const displayedItems = items.filter((item) => {
    if (stockFilter === 'in_stock') return item.in_stock !== false
    if (stockFilter === 'out_of_stock') return item.in_stock === false
    return true
  })

  // Helper for discount calculation
  const getDiscountPercent = (sellingPrice, originalPrice) => {
    const s = Number(sellingPrice)
    const o = Number(originalPrice)
    if (o > 0 && o > s) {
      return Math.round(((o - s) / o) * 100)
    }
    return 0
  }

  // ─── LOGIN SCREEN ──────────────────────────────────────────────────────────
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-cream dark:bg-[#0f0f11] flex items-center justify-center p-6 relative overflow-hidden">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gold/10 rounded-full blur-3xl pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="relative z-10 w-full max-w-md"
        >
          <form
            onSubmit={handleLogin}
            className="bg-white/90 dark:bg-charcoal/90 backdrop-blur-xl border border-gray-200 dark:border-gold/20 rounded-3xl p-8 shadow-2xl text-center relative"
          >
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-tr from-gold/20 to-gold/5 flex items-center justify-center border border-gold/30 shadow-inner">
              <FiShield className="w-8 h-8 text-gold" />
            </div>

            <h2 className="font-display text-3xl font-bold text-charcoal dark:text-cream mb-1">
              Admin Portal
            </h2>
            <p className="text-xs uppercase tracking-widest text-gold font-semibold mb-6">
              Authorized Access Only
            </p>

            <div className="text-left mb-6">
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                Security Password
              </label>
              <div className="relative">
                <input
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Enter admin password"
                  autoFocus
                  className="w-full pl-11 pr-12 py-3.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-charcoal-dark text-charcoal dark:text-cream focus:ring-2 focus:ring-gold/50 focus:border-gold outline-none transition-all text-sm font-medium"
                />
                <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gold transition-colors"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {authError && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-500 text-xs text-left mb-5"
              >
                <FiAlertCircle className="w-5 h-5 shrink-0" />
                <span>{authError}</span>
              </motion.div>
            )}

            <button
              type="submit"
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#C9A96E] to-[#B39358] text-charcoal font-bold text-sm tracking-wide hover:brightness-105 active:scale-[0.99] transition-all shadow-lg shadow-gold/20 flex items-center justify-center gap-2"
            >
              Verify & Enter Panel
            </button>

            <div className="mt-6 pt-5 border-t border-gray-100 dark:border-gray-800/80 flex items-center justify-center gap-1.5 text-[11px] text-gray-400">
              <span>Secured by FashionDB Protected Guard</span>
            </div>
          </form>
        </motion.div>
      </div>
    )
  }

  // ─── ADMIN DASHBOARD ────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-cream dark:bg-charcoal-dark py-6 sm:py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">

        {/* Global Feedback Banner */}
        <AnimatePresence>
          {feedbackMsg && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`fixed top-5 right-5 z-50 px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 text-sm font-semibold border ${
                feedbackMsg.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950/90 dark:text-emerald-200 dark:border-emerald-700'
                  : 'bg-red-50 text-red-800 border-red-300 dark:bg-red-950/90 dark:text-red-200 dark:border-red-700'
              }`}
            >
              {feedbackMsg.type === 'success' ? (
                <FiCheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              ) : (
                <FiAlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0" />
              )}
              <span>{feedbackMsg.text}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 bg-white dark:bg-charcoal-light/60 p-6 rounded-3xl shadow-card border border-border dark:border-gray-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
              <h1 className="font-display text-2xl sm:text-3xl font-bold text-charcoal dark:text-cream">
                Admin Dashboard
              </h1>
            </div>
            <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm mt-1">
              Easy catalogue & price management. Add, edit, or toggle products with 1 click.
            </p>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={handleOpenAdd}
              className="flex-1 sm:flex-none px-5 py-3 rounded-2xl gradient-gold text-charcoal font-bold text-sm hover:shadow-gold transition-all flex items-center justify-center gap-2"
            >
              <FiPlus className="w-4 h-4" /> Add Product
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-3 rounded-2xl bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold text-sm transition-all"
            >
              Logout
            </button>
          </div>
        </div>

        {/* 1. Dashboard Metrics Overview */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <div className="bg-white dark:bg-charcoal-light/50 p-5 rounded-2xl shadow-card border border-border dark:border-gray-800/80">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Total Products</span>
              <span className="text-xl">👗</span>
            </div>
            <div className="text-2xl sm:text-3xl font-bold font-display text-charcoal dark:text-cream">
              {stats?.total ?? total}
            </div>
            <p className="text-[11px] text-gray-400 mt-1">In store catalogue</p>
          </div>

          <div className="bg-white dark:bg-charcoal-light/50 p-5 rounded-2xl shadow-card border border-border dark:border-gray-800/80">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Active / In Stock</span>
              <span className="text-xl">🟢</span>
            </div>
            <div className="text-2xl sm:text-3xl font-bold font-display text-emerald-600 dark:text-emerald-400">
              {stats?.in_stock ?? total}
            </div>
            <p className="text-[11px] text-gray-400 mt-1">Available for buyers</p>
          </div>

          <div className="bg-white dark:bg-charcoal-light/50 p-5 rounded-2xl shadow-card border border-border dark:border-gray-800/80">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400">Out of Stock</span>
              <span className="text-xl">🔴</span>
            </div>
            <div className="text-2xl sm:text-3xl font-bold font-display text-amber-600 dark:text-amber-400">
              {stats?.out_of_stock ?? 0}
            </div>
            <p className="text-[11px] text-gray-400 mt-1">Disabled / Sold out</p>
          </div>

          <div className="bg-white dark:bg-charcoal-light/50 p-5 rounded-2xl shadow-card border border-border dark:border-gray-800/80">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Categories</span>
              <span className="text-xl">🏷️</span>
            </div>
            <div className="text-2xl sm:text-3xl font-bold font-display text-charcoal dark:text-cream">
              {stats?.categories_count ?? stats?.by_category?.length ?? 5}
            </div>
            <p className="text-[11px] text-gray-400 mt-1">Different categories</p>
          </div>

          <div className="col-span-2 lg:col-span-1 bg-white dark:bg-charcoal-light/50 p-5 rounded-2xl shadow-card border border-border dark:border-gray-800/80">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Avg Price</span>
              <span className="text-xl">💰</span>
            </div>
            <div className="text-2xl sm:text-3xl font-bold font-display text-gold">
              ₹{stats?.avg_price ? Math.round(stats.avg_price) : 0}
            </div>
            <p className="text-[11px] text-gray-400 mt-1">Catalogue average</p>
          </div>
        </div>

        {/* 2. Optional 1-Click Link Importer (Collapsible) */}
        <div className="bg-white dark:bg-charcoal-light/40 border border-gold/30 rounded-3xl p-5 mb-8 shadow-card">
          <div
            className="flex items-center justify-between cursor-pointer select-none"
            onClick={() => setShowImporter(!showImporter)}
          >
            <div className="flex items-center gap-3">
              <span className="px-2.5 py-1 rounded-xl bg-gold/20 text-gold font-bold text-xs">
                ⚡ FAST TOOL
              </span>
              <h2 className="text-sm sm:text-base font-bold text-charcoal dark:text-cream">
                1-Click Product Auto-Importer (Flipkart / Myntra / Amazon)
              </h2>
            </div>
            <button className="text-gray-400 hover:text-gold transition-colors">
              {showImporter ? <FiChevronUp className="w-5 h-5" /> : <FiChevronDown className="w-5 h-5" />}
            </button>
          </div>

          {showImporter && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-4 pt-4 border-t border-border dark:border-gray-800"
            >
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                Paste any EarnKaro, Flipkart, Myntra, or Amazon product URL to automatically import the title, image, price, and affiliate link:
              </p>
              <form onSubmit={handleImportUrl} className="flex flex-col sm:flex-row gap-3">
                <input
                  type="url"
                  required
                  value={importUrl}
                  onChange={(e) => setImportUrl(e.target.value)}
                  placeholder="https://fktr.in/... or https://www.flipkart.com/..."
                  className="flex-1 px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-charcoal text-sm outline-none focus:ring-2 focus:ring-gold/50"
                />
                <select
                  value={importGender}
                  onChange={(e) => setImportGender(e.target.value)}
                  className="px-3 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-charcoal text-sm"
                >
                  <option value="boys">Boys</option>
                  <option value="girls">Girls</option>
                  <option value="men">Men</option>
                  <option value="women">Women</option>
                  <option value="unisex">Unisex</option>
                </select>
                <button
                  type="submit"
                  disabled={importing}
                  className="px-5 py-2.5 rounded-xl gradient-gold text-charcoal font-bold text-sm disabled:opacity-50"
                >
                  {importing ? 'Importing…' : 'Import Now'}
                </button>
              </form>
              {importStatus && (
                <p className={`mt-2 text-xs font-semibold ${importStatus.type === 'error' ? 'text-red-500' : 'text-emerald-500'}`}>
                  {importStatus.message}
                </p>
              )}
            </motion.div>
          )}
        </div>

        {/* 3. Product Management Section */}
        <div className="bg-white dark:bg-charcoal-light/60 rounded-3xl p-5 sm:p-7 shadow-card border border-border dark:border-gray-800">
          {/* Section Header & Filters */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="font-display text-xl font-bold text-charcoal dark:text-cream">
                Product Management
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Showing {displayedItems.length} of {total} products
              </p>
            </div>

            {/* Filter Bar */}
            <div className="flex flex-wrap items-center gap-2.5">
              {/* Search input */}
              <div className="relative flex-1 min-w-[180px]">
                <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search products, brand…"
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-gray-50 dark:bg-charcoal border border-border dark:border-gray-700 text-xs sm:text-sm outline-none focus:ring-2 focus:ring-gold/50"
                />
              </div>

              {/* Category Filter */}
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3 py-2 rounded-xl bg-gray-50 dark:bg-charcoal border border-border dark:border-gray-700 text-xs sm:text-sm capitalize outline-none"
              >
                <option value="">All Categories</option>
                {STANDARD_CATEGORIES.map((c) => (
                  <option key={c} value={c} className="capitalize">
                    {c}
                  </option>
                ))}
              </select>

              {/* Stock Filter */}
              <select
                value={stockFilter}
                onChange={(e) => setStockFilter(e.target.value)}
                className="px-3 py-2 rounded-xl bg-gray-50 dark:bg-charcoal border border-border dark:border-gray-700 text-xs sm:text-sm outline-none"
              >
                <option value="all">All Status</option>
                <option value="in_stock">In Stock Only</option>
                <option value="out_of_stock">Out of Stock Only</option>
              </select>

              {/* Add Item Button */}
              <button
                onClick={handleOpenAdd}
                className="px-4 py-2 rounded-xl gradient-gold text-charcoal font-bold text-xs sm:text-sm hover:shadow-gold transition-all flex items-center gap-1.5 shrink-0"
              >
                <FiPlus className="w-4 h-4" /> Add Product
              </button>
            </div>
          </div>

          {/* Loading State */}
          {loading ? (
            <div className="py-20 text-center">
              <FiRefreshCw className="w-8 h-8 mx-auto text-gold animate-spin mb-3" />
              <p className="text-sm text-gray-500">Loading products…</p>
            </div>
          ) : displayedItems.length === 0 ? (
            <div className="py-16 text-center bg-gray-50 dark:bg-charcoal/50 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700">
              <FiPackage className="w-12 h-12 mx-auto text-gray-400 mb-3" />
              <h3 className="text-base font-bold text-charcoal dark:text-cream">No products found</h3>
              <p className="text-xs text-gray-500 mt-1 mb-4">Try clearing filters or add a new product</p>
              <button
                onClick={handleOpenAdd}
                className="px-5 py-2.5 rounded-xl gradient-gold text-charcoal font-bold text-xs"
              >
                + Add First Product
              </button>
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto rounded-2xl border border-border dark:border-gray-800">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-100/70 dark:bg-charcoal text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 border-b border-border dark:border-gray-800">
                    <tr>
                      <th className="py-3.5 px-4">Photo</th>
                      <th className="py-3.5 px-4">Product Name</th>
                      <th className="py-3.5 px-4">Category</th>
                      <th className="py-3.5 px-4">Selling Price</th>
                      <th className="py-3.5 px-4">Original Price</th>
                      <th className="py-3.5 px-4">Discount</th>
                      <th className="py-3.5 px-4 text-center">Stock / Status</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border dark:divide-gray-800">
                    {displayedItems.map((item) => {
                      const origPrice = item.original_price || Math.round(item.price * 1.35)
                      const discount = getDiscountPercent(item.price, origPrice)
                      const isInStock = item.in_stock !== false

                      return (
                        <tr
                          key={item.id}
                          className="hover:bg-gray-50/80 dark:hover:bg-charcoal/40 transition-colors"
                        >
                          {/* Thumbnail */}
                          <td className="py-3 px-4">
                            <div className="w-14 h-16 rounded-xl overflow-hidden bg-gray-100 dark:bg-charcoal border border-border dark:border-gray-700 shrink-0">
                              <img
                                src={getImageUrl(item.image_path) || FALLBACK_IMG}
                                alt={item.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.target.src = FALLBACK_IMG
                                }}
                              />
                            </div>
                          </td>

                          {/* Product Name & Brand */}
                          <td className="py-3 px-4">
                            <div className="font-bold text-charcoal dark:text-cream line-clamp-1 max-w-xs">
                              {item.name}
                            </div>
                            <div className="flex items-center gap-2 mt-0.5 text-xs text-gray-400">
                              <span>{item.brand || 'Fashion Brand'}</span>
                              {item.external_link && (
                                <a
                                  href={item.external_link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-gold hover:underline flex items-center gap-0.5 text-[11px]"
                                >
                                  Store Link <FiExternalLink className="w-3 h-3" />
                                </a>
                              )}
                            </div>
                          </td>

                          {/* Category & Gender */}
                          <td className="py-3 px-4">
                            <span className="inline-block px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-charcoal text-xs font-semibold text-gray-700 dark:text-gray-300 capitalize">
                              {item.category}
                            </span>
                            <span className="block text-[11px] text-gray-400 capitalize mt-0.5">
                              {item.gender}
                            </span>
                          </td>

                          {/* Selling Price */}
                          <td className="py-3 px-4">
                            <span className="font-bold text-charcoal dark:text-cream text-base">
                              ₹{item.price}
                            </span>
                          </td>

                          {/* Original Price */}
                          <td className="py-3 px-4 text-gray-400 text-sm">
                            {origPrice ? `₹${origPrice}` : '-'}
                          </td>

                          {/* Discount */}
                          <td className="py-3 px-4">
                            {discount > 0 ? (
                              <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-xs">
                                {discount}% OFF
                              </span>
                            ) : (
                              <span className="text-gray-400 text-xs">-</span>
                            )}
                          </td>

                          {/* Stock Status Toggle */}
                          <td className="py-3 px-4 text-center">
                            <button
                              onClick={() => handleToggleStock(item.id, isInStock)}
                              title="Click to toggle stock status"
                              className={`px-3 py-1 rounded-full text-xs font-bold transition-all shadow-sm ${
                                isInStock
                                  ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200 dark:bg-emerald-950 dark:text-emerald-300'
                                  : 'bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-950 dark:text-red-300'
                              }`}
                            >
                              {isInStock ? '● In Stock' : '✕ Out of Stock'}
                            </button>
                          </td>

                          {/* Actions */}
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleOpenEdit(item)}
                                className="p-2 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-950/40 dark:text-blue-400 transition-colors"
                                title="Edit Product"
                              >
                                <FiEdit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(item.id, item.name)}
                                className="p-2 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-950/40 dark:text-red-400 transition-colors"
                                title="Delete Product"
                              >
                                <FiTrash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile Responsive Cards View */}
              <div className="md:hidden space-y-3">
                {displayedItems.map((item) => {
                  const origPrice = item.original_price || Math.round(item.price * 1.35)
                  const discount = getDiscountPercent(item.price, origPrice)
                  const isInStock = item.in_stock !== false

                  return (
                    <div
                      key={item.id}
                      className="p-4 rounded-2xl bg-gray-50/80 dark:bg-charcoal border border-border dark:border-gray-700/60 shadow-sm flex gap-3.5"
                    >
                      {/* Thumbnail */}
                      <div className="w-20 h-24 rounded-xl overflow-hidden bg-gray-200 dark:bg-charcoal-light shrink-0 border border-border dark:border-gray-700">
                        <img
                          src={getImageUrl(item.image_path) || FALLBACK_IMG}
                          alt={item.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.src = FALLBACK_IMG
                          }}
                        />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0 flex flex-col justify-between">
                        <div>
                          <div className="font-bold text-sm text-charcoal dark:text-cream line-clamp-1">
                            {item.name}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-gray-400 mt-0.5">
                            <span className="capitalize">{item.category}</span>
                            <span>•</span>
                            <span>{item.brand || 'Fashion Brand'}</span>
                          </div>
                          <div className="flex items-baseline gap-2 mt-1.5">
                            <span className="text-base font-bold text-charcoal dark:text-cream">
                              ₹{item.price}
                            </span>
                            {origPrice > item.price && (
                              <span className="text-xs text-gray-400 line-through">
                                ₹{origPrice}
                              </span>
                            )}
                            {discount > 0 && (
                              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600">
                                {discount}% OFF
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Status Toggle & Action Buttons */}
                        <div className="flex items-center justify-between gap-2 mt-3 pt-2 border-t border-border dark:border-gray-700">
                          <button
                            onClick={() => handleToggleStock(item.id, isInStock)}
                            className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                              isInStock
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                : 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                            }`}
                          >
                            {isInStock ? '● In Stock' : '✕ Out of Stock'}
                          </button>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleOpenEdit(item)}
                              className="px-3 py-1.5 rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400 text-xs font-semibold flex items-center gap-1"
                            >
                              <FiEdit2 className="w-3 h-3" /> Edit
                            </button>
                            <button
                              onClick={() => handleDelete(item.id, item.name)}
                              className="p-1.5 rounded-xl bg-red-50 text-red-600 dark:bg-red-950/50 dark:text-red-400"
                            >
                              <FiTrash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Pagination */}
              {Math.ceil(total / 15) > 1 && (
                <div className="flex items-center justify-center gap-2 mt-8 pt-6 border-t border-border dark:border-gray-800">
                  {Array.from({ length: Math.ceil(total / 15) }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      onClick={() => load(p)}
                      className={`w-9 h-9 rounded-xl text-xs font-bold transition-all ${
                        p === page
                          ? 'gradient-gold text-charcoal shadow-sm'
                          : 'bg-gray-100 hover:bg-gray-200 dark:bg-charcoal dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* ─── 4. SIMPLE ADD / EDIT PRODUCT MODAL ───────────────────────────────── */}
      <AnimatePresence>
        {showForm && (
          <div
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
            onClick={() => {
              setShowForm(false)
              setEditItem(null)
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white dark:bg-charcoal rounded-3xl p-6 sm:p-8 max-w-2xl w-full my-6 shadow-2xl border border-gray-200 dark:border-gray-700 max-h-[92vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between pb-4 mb-5 border-b border-border dark:border-gray-700">
                <div>
                  <h3 className="font-display text-xl sm:text-2xl font-bold text-charcoal dark:text-cream">
                    {editItem ? '✏️ Edit Product' : '✨ Add New Product'}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    {editItem ? 'Update product price, image, category or details' : 'Fill required fields to publish product immediately'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false)
                    setEditItem(null)
                  }}
                  className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>

              {formError && (
                <div className="mb-5 p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-500 text-xs flex items-center gap-2">
                  <FiAlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <form onSubmit={handleSaveProduct} className="space-y-4">
                {/* Product Name */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-300 mb-1.5">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Slim Fit Cotton Casual Shirt"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-charcoal-dark text-charcoal dark:text-cream text-sm outline-none focus:ring-2 focus:ring-gold/50"
                  />
                </div>

                {/* Price, Original Price, and Stock */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-300 mb-1.5">
                      Selling Price (₹) *
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="any"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      placeholder="e.g. 399"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-charcoal-dark text-charcoal dark:text-cream text-sm outline-none focus:ring-2 focus:ring-gold/50"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-300 mb-1.5">
                      Original Price (₹)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="any"
                      value={formData.original_price}
                      onChange={(e) => setFormData({ ...formData, original_price: e.target.value })}
                      placeholder="e.g. 799 (Optional)"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-charcoal-dark text-charcoal dark:text-cream text-sm outline-none focus:ring-2 focus:ring-gold/50"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-300 mb-1.5">
                      Stock Status
                    </label>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, in_stock: !formData.in_stock })}
                      className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5 ${
                        formData.in_stock
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/50 dark:text-emerald-300'
                          : 'bg-red-50 text-red-700 border-red-300 dark:bg-red-950/50 dark:text-red-300'
                      }`}
                    >
                      {formData.in_stock ? <FiCheck className="w-4 h-4" /> : <FiX className="w-4 h-4" />}
                      {formData.in_stock ? 'In Stock (Available)' : 'Out of Stock'}
                    </button>
                  </div>
                </div>

                {/* Live Discount Calculation Display */}
                {formData.price && formData.original_price && Number(formData.original_price) > Number(formData.price) && (
                  <div className="px-3.5 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2">
                    <FiCheckCircle className="w-4 h-4 shrink-0" />
                    <span>
                      Buyers will see a discount of <strong>{getDiscountPercent(formData.price, formData.original_price)}% OFF</strong> (₹{Number(formData.original_price) - Number(formData.price)} savings)
                    </span>
                  </div>
                )}

                {/* Category and Gender */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-300 mb-1.5">
                      Category *
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-charcoal-dark text-charcoal dark:text-cream text-sm outline-none capitalize"
                    >
                      {STANDARD_CATEGORIES.map((c) => (
                        <option key={c} value={c} className="capitalize">
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-300 mb-1.5">
                      Gender Target
                    </label>
                    <select
                      value={formData.gender}
                      onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-charcoal-dark text-charcoal dark:text-cream text-sm outline-none"
                    >
                      <option value="unisex">Unisex / All</option>
                      <option value="men">Men</option>
                      <option value="women">Women</option>
                      <option value="boys">Boys</option>
                      <option value="girls">Girls</option>
                    </select>
                  </div>
                </div>

                {/* ── IMAGE SECTION (File Upload + URL + Live Preview) ── */}
                <div className="p-4 rounded-2xl bg-gray-50 dark:bg-charcoal-dark/70 border border-border dark:border-gray-700">
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-300 mb-2">
                    Product Image (Upload File OR Paste Image Link)
                  </label>

                  <div className="flex flex-col sm:flex-row gap-4 items-start">
                    {/* Live Preview Box */}
                    <div className="w-24 h-28 rounded-xl overflow-hidden bg-white dark:bg-charcoal border border-border dark:border-gray-700 shrink-0 flex items-center justify-center relative">
                      {imagePreview ? (
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="w-full h-full object-cover"
                          onError={() => setImagePreview('')}
                        />
                      ) : (
                        <div className="text-center p-2 text-gray-400 text-[10px]">
                          <FiImage className="w-6 h-6 mx-auto mb-1 opacity-50" />
                          No Image
                        </div>
                      )}
                    </div>

                    {/* Inputs */}
                    <div className="flex-1 w-full space-y-2.5">
                      <div>
                        <span className="text-[11px] font-semibold text-gray-500 block mb-1">
                          Option 1: Upload from Phone / Laptop
                        </span>
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          onChange={handleFileChange}
                          className="text-xs text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:gradient-gold file:text-charcoal cursor-pointer"
                        />
                      </div>

                      <div className="pt-1">
                        <span className="text-[11px] font-semibold text-gray-500 block mb-1">
                          Option 2: Or Paste Direct Image URL
                        </span>
                        <input
                          type="url"
                          value={imageUrl}
                          onChange={handleUrlChange}
                          placeholder="https://assets.myntassets.com/... or https://m.media-amazon.com/..."
                          className="w-full px-3.5 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-charcoal text-xs text-charcoal dark:text-cream outline-none focus:ring-1 focus:ring-gold"
                        />
                      </div>

                      {editItem && !imageFile && (
                        <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                          ✓ Current image will be kept automatically if you don't choose a new one.
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* External / Affiliate Store Link */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-300 mb-1.5">
                    Product Store Link / Affiliate Link (Amazon / Flipkart / Myntra)
                  </label>
                  <input
                    type="url"
                    value={formData.external_link}
                    onChange={(e) => setFormData({ ...formData, external_link: e.target.value })}
                    placeholder="https://amazon.in/dp/... or https://flipkart.com/..."
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-charcoal-dark text-charcoal dark:text-cream text-sm outline-none focus:ring-2 focus:ring-gold/50"
                  />
                </div>

                {/* Short Description */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-300 mb-1.5">
                    Short Description (Optional)
                  </label>
                  <textarea
                    rows="2"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Brief description about fabric, comfort or styling..."
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-charcoal-dark text-charcoal dark:text-cream text-sm outline-none focus:ring-2 focus:ring-gold/50"
                  />
                </div>

                {/* Optional Fashion Details Accordion */}
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className="text-xs font-bold text-gold hover:underline flex items-center gap-1.5"
                  >
                    {showAdvanced ? '− Hide Optional Details' : '+ Add Optional Details (Brand, Fabric, Style, Customer Review Photo)'}
                  </button>

                  {showAdvanced && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="mt-3 p-4 rounded-2xl bg-gray-50 dark:bg-charcoal-dark/50 border border-border dark:border-gray-700 grid grid-cols-1 sm:grid-cols-2 gap-3"
                    >
                      <div>
                        <label className="block text-[11px] font-semibold text-gray-500 mb-1">Brand</label>
                        <input
                          type="text"
                          value={formData.brand}
                          onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                          placeholder="e.g. Allen Solly"
                          className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-charcoal text-xs"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-gray-500 mb-1">Style</label>
                        <input
                          type="text"
                          value={formData.style}
                          onChange={(e) => setFormData({ ...formData, style: e.target.value })}
                          placeholder="Casual / Formal / Streetwear"
                          className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-charcoal text-xs"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-gray-500 mb-1">Fabric</label>
                        <input
                          type="text"
                          value={formData.fabric}
                          onChange={(e) => setFormData({ ...formData, fabric: e.target.value })}
                          placeholder="e.g. 100% Pure Cotton"
                          className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-charcoal text-xs"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-gray-500 mb-1">Customer Review Photo URL (E-vs-R slider)</label>
                        <input
                          type="url"
                          value={formData.customer_photo}
                          onChange={(e) => setFormData({ ...formData, customer_photo: e.target.value })}
                          placeholder="https://..."
                          className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-charcoal text-xs"
                        />
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* Form Buttons */}
                <div className="flex items-center justify-end gap-3 pt-5 border-t border-border dark:border-gray-700">
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false)
                      setEditItem(null)
                    }}
                    className="px-5 py-2.5 rounded-xl text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 text-sm font-semibold transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-6 py-2.5 rounded-xl gradient-gold text-charcoal font-bold text-sm shadow-md hover:shadow-gold disabled:opacity-50 transition-all flex items-center gap-2"
                  >
                    {saving ? (
                      <>
                        <FiRefreshCw className="w-4 h-4 animate-spin" /> Saving…
                      </>
                    ) : (
                      'Save Product'
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
