import { useState, useEffect } from 'react'
import { fetchClothes, fetchStats, deleteCloth, updateCloth, createCloth } from '../api'
import ClothingCard from '../components/ClothingCard'
import { motion } from 'framer-motion'
import { FiLock, FiShield, FiEye, FiEyeOff, FiAlertCircle } from 'react-icons/fi'

export default function Admin() {
  const [stats,   setStats]   = useState(null)
  const [items,   setItems]   = useState([])
  const [loading, setLoading] = useState(true)
  const [search,  setSearch]  = useState('')
  const [gender,  setGender]  = useState('')
  const [page,    setPage]    = useState(1)
  const [total,   setTotal]   = useState(0)
  const [showForm, setShowForm] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [saving,   setSaving]   = useState(false)

  const [isAuthenticated, setIsAuthenticated] = useState(localStorage.getItem('admin_token') === 'true')
  const [authError, setAuthError] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    if (isAuthenticated) {
      fetchStats().then(r => setStats(r.data)).catch(() => {})
    }
  }, [isAuthenticated])

  const load = (p = 1) => {
    if (!isAuthenticated) return;
    setLoading(true)
    fetchClothes({ q: search || undefined, gender: gender || undefined, page: p, limit: 16, sort: 'newest' })
      .then(r => {
        setItems(r.data.items)
        setTotal(r.data.total)
        setPage(p)
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => { load(1) }, [search, gender, isAuthenticated])

  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthError('');
    const pwd = e.target.password.value;
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: pwd })
      });
      if (res.ok) {
        localStorage.setItem('admin_token', 'true');
        setIsAuthenticated(true);
      } else if (res.status === 401) {
        setAuthError('गलत पासवर्ड! कृपया सही पासवर्ड दर्ज करें।');
      } else {
        setAuthError('सर्वर से कनेक्ट नहीं हो पा रहा है। कृपया बैकएंड चालू करें।');
      }
    } catch (err) {
      setAuthError('नेटवर्क एरर! सर्वर ऑफलाइन है।');
    }
  };

  
  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      await deleteCloth(id);
      load(page);
    } catch (err) {
      alert('Error deleting product');
    }
  };

  const handleEdit = (item) => {
    setEditItem(item);
    setShowForm(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    setIsAuthenticated(false);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-cream dark:bg-[#0f0f11] flex items-center justify-center p-6 relative overflow-hidden">
        {/* Ambient background glow */}
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
            {/* Security Badge Icon */}
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
                  type={showPassword ? "text" : "password"} 
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
                  title={showPassword ? "Hide password" : "Show password"}
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
    );
  }

  return (
    <div className="min-h-screen bg-cream dark:bg-charcoal-dark py-8">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-4xl font-bold text-charcoal dark:text-cream">Admin Panel</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Manage clothing catalogue, analytics, and fraud monitoring</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowForm(true)}
              className="px-5 py-2.5 rounded-xl gradient-gold text-charcoal font-semibold text-sm hover:shadow-gold transition-all"
            >
              + Add Item
            </button>
            <button
              onClick={handleLogout}
              className="px-5 py-2.5 rounded-xl bg-gray-200 dark:bg-gray-700 text-charcoal dark:text-cream font-semibold text-sm hover:bg-gray-300 dark:hover:bg-gray-600 transition-all"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Total Items',   value: stats.total,   icon: '👗' },
              { label: 'Boys Items',    value: stats.boys,    icon: '👦' },
              { label: 'Girls Items',   value: stats.girls,   icon: '👧' },
              { label: 'Avg Trust',     value: `${stats.avg_trust?.toFixed(1)}%`, icon: '✅' },
              { label: 'Avg Price ₹',  value: stats.avg_price?.toFixed(0), icon: '💰' },
              { label: 'Flagged',       value: stats.flagged, icon: '🚨' },
              { label: 'Verified',      value: stats.verified, icon: '🔍' },
              { label: 'Brands',        value: stats.top_brands?.length, icon: '🏷️' },
            ].map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                className="bg-white dark:bg-charcoal-light/50 rounded-2xl p-4 shadow-card text-center">
                <div className="text-2xl mb-1">{s.icon}</div>
                <div className="text-2xl font-bold font-display text-charcoal dark:text-cream">{s.value}</div>
                <div className="text-xs text-gray-400 mt-0.5">{s.label}</div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Category breakdown */}
        {stats?.by_category && (
          <div className="bg-white dark:bg-charcoal-light/50 rounded-2xl p-6 shadow-card mb-8">
            <h3 className="font-semibold text-charcoal dark:text-cream mb-4">Items by Category</h3>
            <div className="flex flex-wrap gap-3">
              {stats.by_category.map(bc => (
                <div key={bc.category} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-cream dark:bg-charcoal text-sm">
                  <span className="font-medium text-charcoal dark:text-cream capitalize">{bc.category}</span>
                  <span className="w-5 h-5 rounded-full bg-gold text-white text-[10px] flex items-center justify-center font-bold">{bc.count}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="flex gap-3 mb-6 flex-wrap">
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, brand…"
            className="flex-1 min-w-[200px] px-4 py-2.5 rounded-xl bg-white dark:bg-charcoal-light/50 border border-border dark:border-gray-700 text-sm focus:ring-2 focus:ring-gold/50 focus:outline-none"
          />
          <select value={gender} onChange={e => setGender(e.target.value)}
            className="px-4 py-2.5 rounded-xl bg-white dark:bg-charcoal-light/50 border border-border dark:border-gray-700 text-sm focus:ring-2 focus:ring-gold/50 focus:outline-none">
            <option value="">All Genders</option>
            <option value="boys">Boys</option>
            <option value="girls">Girls</option>
          </select>
        </div>

        <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">{total} items in catalogue</p>

        {/* Items grid */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
            {Array.from({ length: 8 }).map((_, i) => <div key={i} className="shimmer-bg aspect-[3/4] rounded-2xl" />)}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5">
            {items.map((item, i) => (
              <div key={item.id} className="relative group">
                <ClothingCard item={item} index={i} />
                <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                  <button onClick={() => handleEdit(item)} className="bg-blue-500 text-white p-2 rounded-full shadow hover:bg-blue-600" title="Edit">✏️</button>
                  <button onClick={() => handleDelete(item.id)} className="bg-red-500 text-white p-2 rounded-full shadow hover:bg-red-600" title="Delete">🗑️</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {Math.ceil(total / 16) > 1 && (
          <div className="flex items-center justify-center gap-2 mt-10">
            {Array.from({ length: Math.ceil(total / 16) }, (_, i) => i + 1).map(p => (
              <button key={p} onClick={() => load(p)}
                className={`w-9 h-9 rounded-xl text-sm font-medium transition-colors ${p === page ? 'bg-gold text-white' : 'bg-white dark:bg-charcoal-light/50 text-gray-600 hover:bg-gold/15'}`}>
                {p}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Add Item Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 bg-charcoal/80 flex items-center justify-center p-4 overflow-y-auto" onClick={() => { setShowForm(false); setEditItem(null); }}>
          <div className="bg-white dark:bg-charcoal-light rounded-2xl p-8 max-w-2xl w-full my-8" onClick={e => e.stopPropagation()}>
            <h3 className="font-display text-2xl font-bold text-charcoal dark:text-cream mb-6">{editItem ? 'Edit Item' : 'Add New Item'}</h3>
            <form onSubmit={async (e) => {
              e.preventDefault();
              setSaving(true);
              const fd = new FormData(e.target);
              try {
                if (editItem) {
                  await updateCloth(editItem.id, fd);
                } else {
                  await createCloth(fd);
                }
                setShowForm(false);
                setEditItem(null);
                load(page);
              } catch (err) {
                alert("Error saving product");
              }
              setSaving(false);
            }}>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Product Name *</label>
                  <input name="name" required defaultValue={editItem?.name} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-transparent dark:text-cream" placeholder="E.g. Casual Shirt" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Brand *</label>
                  <input name="brand" required defaultValue={editItem?.brand} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-transparent dark:text-cream" placeholder="E.g. Allen Solly" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Gender *</label>
                  <select name="gender" required defaultValue={editItem?.gender || "men"} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-transparent dark:text-cream">
                    <option value="men" className="dark:bg-charcoal">Men</option>
                    <option value="women" className="dark:bg-charcoal">Women</option>
                    <option value="boys" className="dark:bg-charcoal">Boys</option>
                    <option value="girls" className="dark:bg-charcoal">Girls</option>
                    <option value="unisex" className="dark:bg-charcoal">Unisex</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Category *</label>
                  <input name="category" required defaultValue={editItem?.category} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-transparent dark:text-cream" placeholder="E.g. Topwear" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Subcategory *</label>
                  <input name="subcategory" required defaultValue={editItem?.subcategory} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-transparent dark:text-cream" placeholder="E.g. Shirts" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Price (₹) *</label>
                  <input name="price" type="number" required defaultValue={editItem?.price} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-transparent dark:text-cream" placeholder="999" />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Image URL</label>
                  <input name="image_path" defaultValue={editItem?.image_path} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-transparent dark:text-cream" placeholder="https://..." />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Amazon Link (External Link)</label>
                  <input name="external_link" defaultValue={editItem?.external_link} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-transparent dark:text-cream" placeholder="https://amazon.in/dp/..." />
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => { setShowForm(false); setEditItem(null); }} className="px-4 py-2 rounded text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">Cancel</button>
                <button type="submit" disabled={saving} className="px-5 py-2 rounded-xl gradient-gold text-charcoal font-semibold disabled:opacity-50 transition-all hover:shadow-gold">
                  {saving ? 'Saving...' : 'Save Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
