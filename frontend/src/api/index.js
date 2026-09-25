import axios from 'axios'

const api = axios.create({ 
  baseURL: import.meta.env.VITE_API_URL || 'https://fashiondb-api.onrender.com/api',
  timeout: 45000 
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => {
    if (typeof response.data === 'string' && (response.data.trim().startsWith('<!DOCTYPE') || response.data.trim().startsWith('<html'))) {
      return Promise.reject(new Error('Backend API returned HTML instead of JSON'))
    }
    return response
  },
  (error) => Promise.reject(error)
)

// ─── Products ──────────────────────────────────────────────────────
export const fetchClothes    = (params = {}) => api.get('/clothes', { params })
export const fetchCloth      = (id)          => api.get(`/clothes/${id}`)
export const createCloth     = (data)        => api.post('/clothes', data)
export const updateCloth     = (id, data)    => api.put(`/clothes/${id}`, data)
export const deleteCloth     = (id)          => api.delete(`/clothes/${id}`)

// ─── Discovery ────────────────────────────────────────────────────
export const fetchTrending   = (params = {}) => api.get('/trending', { params })
export const fetchNewArrivals= (params = {}) => api.get('/new-arrivals', { params })
export const fetchCategories = (params = {}) => api.get('/categories', { params })
export const fetchSubcats    = (params = {}) => api.get('/subcategories', { params })
export const fetchFilters    = (params = {}) => api.get('/filters', { params })
export const fetchStats      = ()            => api.get('/stats')

// ─── AI & Fraud ───────────────────────────────────────────────────
export const getRecommendations = (body)    => api.post('/recommend', body)
export const fraudAnalyze       = (id)      => api.post(`/fraud-analyze/${id}`)
export const analyzeImage       = (form)    => api.post('/analyze-image', form)
export const fetchReviews       = (id)      => api.get(`/clothes/${id}/reviews`)

// ─── Favorites (localStorage) ─────────────────────────────────────
export const getFavorites   = ()   => {
  try { return JSON.parse(localStorage.getItem('fav_ids') || '[]') } catch { return [] }
}
export const addFavorite    = (id) => {
  try {
    const favs = getFavorites()
    if (!favs.includes(id)) localStorage.setItem('fav_ids', JSON.stringify([...favs, id]))
  } catch {}
}
export const removeFavorite = (id) => {
  try {
    localStorage.setItem('fav_ids', JSON.stringify(getFavorites().filter(f => f !== id)))
  } catch {}
}
export const isFavorite     = (id) => getFavorites().includes(id)

// ─── Recently Viewed (localStorage) ───────────────────────────────
export const getRecentlyViewed = () => {
  try { return JSON.parse(localStorage.getItem('recently_viewed') || '[]') } catch { return [] }
}
export const addRecentlyViewed = (item) => {
  try {
    const recent = getRecentlyViewed().filter(r => r.id !== item.id)
    localStorage.setItem('recently_viewed', JSON.stringify([item, ...recent].slice(0, 12)))
  } catch {}
}

// ─── Compare (localStorage) ───────────────────────────────────────
export const getCompare    = () => {
  try { return JSON.parse(localStorage.getItem('compare_ids') || '[]') } catch { return [] }
}
export const addCompare    = (id) => {
  try {
    const c = getCompare()
    if (c.length >= 3) { alert('Max 3 items for comparison'); return }
    if (!c.includes(id)) localStorage.setItem('compare_ids', JSON.stringify([...c, id]))
  } catch {}
}
export const removeCompare = (id) => {
  try {
    localStorage.setItem('compare_ids', JSON.stringify(getCompare().filter(c => c !== id)))
  } catch {}
}

// ─── Outfit (localStorage) ────────────────────────────────────────
export const getSavedOutfits   = () => JSON.parse(localStorage.getItem('saved_outfits') || '[]')
export const saveOutfit        = (outfit) => {
  const all = getSavedOutfits()
  localStorage.setItem('saved_outfits', JSON.stringify([...all, { ...outfit, id: Date.now() }]))
}
export const deleteSavedOutfit = (id) => {
  localStorage.setItem('saved_outfits', JSON.stringify(getSavedOutfits().filter(o => o.id !== id)))
}

// ─── Listing Analysis ──────────────────────────────────────────────
export async function analyzeListing(data) {
  const res = await api.post('/analyze-listing', data);
  return res.data;
}

export async function analyzeVideo(formData) {
  const res = await api.post('/analyze-video', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return res.data;
}

export async function fetchAnalysisHistory(params = {}) {
  const res = await api.get('/analysis-history', { params });
  return res.data;
}

// ─── Affiliate ────────────────────────────────────────────────────
export function getAffiliateRedirectUrl(productId) {
  return `/api/affiliate/redirect/${productId}`;
}

export async function fetchAffiliateStats() {
  const res = await api.get('/affiliate/stats');
  return res.data;
}

export default api
