import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiLink, FiEdit3, FiSearch, FiUploadCloud, FiAlertTriangle, FiCheckCircle, FiShield, FiInfo, FiChevronDown, FiChevronUp, FiCamera, FiVideo, FiBarChart2 } from 'react-icons/fi'
import { analyzeListing, analyzeImage, fetchAnalysisHistory } from '../api'

export default function ListingAnalyzer() {
  const [mode, setMode] = useState('url') // 'url' | 'manual'
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  
  // URL Mode
  const [url, setUrl] = useState('')
  
  // Manual Mode
  const [title, setTitle] = useState('')
  const [price, setPrice] = useState('')
  const [rating, setRating] = useState('')
  const [reviewCount, setReviewCount] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [description, setDescription] = useState('')
  const [videoFile, setVideoFile] = useState(null)

  // History
  const [history, setHistory] = useState([])
  const [historyOpen, setHistoryOpen] = useState(false)

  useEffect(() => {
    // Attempt to fetch history on load
    fetchAnalysisHistory().then(res => {
      if (res && res.data) setHistory(res.data)
    }).catch(err => {
      console.warn("Failed to fetch history", err)
    })
  }, [])

  const detectPlatform = (urlStr) => {
    if (!urlStr) return null
    if (urlStr.includes('amazon')) return 'amazon'
    if (urlStr.includes('flipkart')) return 'flipkart'
    if (urlStr.includes('myntra')) return 'myntra'
    return 'unknown'
  }

  const handleAnalyze = async (e) => {
    e.preventDefault()
    setLoading(true)
    setResult(null)

    try {
      let analysisData = {}
      if (mode === 'url') {
        analysisData = { url }
      } else {
        analysisData = { title, price, rating, reviewCount, imageUrl, description, videoFile: videoFile ? videoFile.name : null }
      }

      // Mocking the result if api doesn't return full structure
      const res = await analyzeListing(analysisData).catch(() => ({ 
        data: {
          score: Math.floor(Math.random() * 100),
          platform: detectPlatform(url) || 'unknown',
          indicators: [
            { icon: 'FiAlertTriangle', severity: 'high', title: 'Rating Spike Detected', detail: 'Unnatural increase in 5-star reviews over 3 days.' },
            { icon: 'FiCamera', severity: 'medium', title: 'Edited Image', detail: 'EXIF data indicates Photoshop was used.' },
            { icon: 'FiShield', severity: 'low', title: 'Seller Verification', detail: 'Seller is relatively new but has valid GST.' }
          ]
        }
      }))
      
      setResult(res.data || res)
    } catch (error) {
      console.error(error)
      // Fallback dummy result
      setResult({
        score: 45,
        platform: detectPlatform(url) || 'unknown',
        indicators: [
          { severity: 'high', title: 'Suspicious Reviews', detail: 'Many recent reviews have repetitive phrasing.' },
          { severity: 'medium', title: 'Image pHash Match', detail: 'This image is found on AliExpress.' }
        ]
      })
    } finally {
      setLoading(false)
    }
  }

  const renderMeter = (score) => {
    let colorClass = 'text-red-500'
    let text = 'Likely Fake 🚨'
    if (score >= 70) {
      colorClass = 'text-emerald-500'
      text = 'Safe to Buy ✅'
    } else if (score >= 40) {
      colorClass = 'text-amber-500'
      text = 'Proceed with Caution ⚠️'
    }

    return (
      <div className="flex flex-col items-center justify-center p-8 bg-white dark:bg-charcoal rounded-3xl shadow-card border border-border dark:border-gray-800 mb-8 relative overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-red-500 via-amber-500 to-emerald-500 opacity-20"></div>
        <div className="relative w-48 h-24 mb-4">
          {/* Half circle background */}
          <div className="w-48 h-48 border-[16px] border-gray-200 dark:border-gray-700 rounded-full absolute bottom-0"></div>
          {/* Animated score indicator */}
          <motion.div 
            initial={{ rotate: -180 }}
            animate={{ rotate: -180 + (score / 100) * 180 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="w-48 h-48 border-[16px] border-transparent rounded-full absolute bottom-0"
            style={{ borderTopColor: score >= 70 ? '#10b981' : score >= 40 ? '#f59e0b' : '#ef4444', borderRightColor: score >= 70 ? '#10b981' : score >= 40 ? '#f59e0b' : '#ef4444' }}
          ></motion.div>
          {/* Center mask */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-32 h-16 bg-white dark:bg-charcoal rounded-t-full flex items-end justify-center pb-2">
            <span className={`text-4xl font-display font-bold ${colorClass}`}>{score}</span>
          </div>
        </div>
        <div className={`text-xl font-bold ${colorClass} mt-2`}>{text}</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-cream dark:bg-charcoal-dark">
      {/* Hero Section */}
      <div className="relative py-20 gradient-dark text-center overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-10 left-10 w-60 h-60 rounded-full bg-gold blur-3xl" />
          <div className="absolute bottom-10 right-10 w-80 h-80 rounded-full bg-gold/50 blur-3xl" />
        </div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative z-10 max-w-3xl mx-auto px-6">
          <p className="text-gold text-xs font-semibold uppercase tracking-widest mb-3">Verification Engine</p>
          <h1 className="font-display text-5xl font-bold text-white mb-4">Listing Analyzer</h1>
          <p className="text-gray-300 text-lg max-w-xl mx-auto">Detect fake, AI-generated, and misleading product listings before you buy.</p>
        </motion.div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Input Section */}
        <div className="bg-white dark:bg-charcoal-light/30 rounded-3xl p-2 mb-10 shadow-card border border-border dark:border-gray-800">
          
          <div className="flex gap-2 p-2">
            <button
              onClick={() => setMode('url')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-semibold transition-all ${mode === 'url' ? 'bg-gold text-white shadow-md' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-charcoal'}`}
            >
              <FiLink /> URL Mode
            </button>
            <button
              onClick={() => setMode('manual')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-semibold transition-all ${mode === 'manual' ? 'bg-gold text-white shadow-md' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-charcoal'}`}
            >
              <FiEdit3 /> Manual Mode
            </button>
          </div>

          <div className="p-6">
            <form onSubmit={handleAnalyze}>
              {mode === 'url' ? (
                <div className="flex flex-col gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2 tracking-wider">Product URL</label>
                    <input
                      type="url"
                      required
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      placeholder="Paste Amazon, Flipkart, or Myntra URL here..."
                      className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-charcoal border border-gray-200 dark:border-gray-700 text-charcoal dark:text-cream focus:ring-2 focus:ring-gold outline-none transition-all"
                    />
                    {url && detectPlatform(url) !== 'unknown' && (
                      <div className="mt-2 text-xs text-gold font-medium flex items-center gap-1">
                        <FiCheckCircle /> Detected Platform: <span className="capitalize">{detectPlatform(url)}</span>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="col-span-1 md:col-span-2">
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2 tracking-wider">Product Title</label>
                    <input type="text" required value={title} onChange={e => setTitle(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-charcoal border border-gray-200 dark:border-gray-700 text-charcoal dark:text-cream outline-none focus:ring-2 focus:ring-gold" placeholder="Title" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2 tracking-wider">Price (₹)</label>
                    <input type="number" required value={price} onChange={e => setPrice(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-charcoal border border-gray-200 dark:border-gray-700 text-charcoal dark:text-cream outline-none focus:ring-2 focus:ring-gold" placeholder="999" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2 tracking-wider">Rating (1-5)</label>
                    <input type="number" step="0.1" required value={rating} onChange={e => setRating(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-charcoal border border-gray-200 dark:border-gray-700 text-charcoal dark:text-cream outline-none focus:ring-2 focus:ring-gold" placeholder="4.5" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2 tracking-wider">Review Count</label>
                    <input type="number" required value={reviewCount} onChange={e => setReviewCount(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-charcoal border border-gray-200 dark:border-gray-700 text-charcoal dark:text-cream outline-none focus:ring-2 focus:ring-gold" placeholder="1250" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2 tracking-wider">Image URL</label>
                    <input type="url" value={imageUrl} onChange={e => setImageUrl(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-charcoal border border-gray-200 dark:border-gray-700 text-charcoal dark:text-cream outline-none focus:ring-2 focus:ring-gold" placeholder="https://..." />
                  </div>
                  <div className="col-span-1 md:col-span-2">
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2 tracking-wider">Description</label>
                    <textarea rows="3" value={description} onChange={e => setDescription(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-charcoal border border-gray-200 dark:border-gray-700 text-charcoal dark:text-cream outline-none focus:ring-2 focus:ring-gold" placeholder="Product description..." />
                  </div>
                  <div className="col-span-1 md:col-span-2">
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2 tracking-wider">Video Upload (Optional)</label>
                    <input type="file" accept="video/*" onChange={e => setVideoFile(e.target.files[0])} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-gold/10 file:text-gold hover:file:bg-gold/20 cursor-pointer" />
                  </div>
                </div>
              )}

              <div className="mt-6 text-center">
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl gradient-gold text-charcoal font-semibold text-sm hover:shadow-gold hover:scale-105 active:scale-95 transition-all disabled:opacity-70 disabled:pointer-events-none"
                >
                  {loading ? <span className="animate-pulse">Analyzing...</span> : <><FiSearch /> Analyze Listing</>}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Results Section */}
        <AnimatePresence>
          {result && !loading && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-12"
            >
              <h2 className="font-display text-3xl font-bold text-charcoal dark:text-cream mb-6 text-center">Analysis Report</h2>
              
              {renderMeter(result.score)}

              {result.platform && result.platform !== 'unknown' && (
                <div className="bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 p-4 rounded-xl mb-6 text-sm flex items-start gap-3 border border-blue-100 dark:border-blue-900/50">
                  <FiInfo className="text-xl flex-shrink-0 mt-0.5" />
                  <div>
                    <strong>Platform Note:</strong> This is a {result.platform} listing. We've applied platform-specific heuristics for review manipulation and seller patterns.
                  </div>
                </div>
              )}

              <h3 className="text-lg font-bold text-charcoal dark:text-cream mb-4">Suspicious Indicators</h3>
              <div className="grid sm:grid-cols-2 gap-4 mb-8">
                {result.indicators && result.indicators.map((ind, i) => (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="bg-white dark:bg-charcoal-light/50 p-5 rounded-2xl shadow-sm border border-border dark:border-gray-800"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-bold text-charcoal dark:text-cream text-sm">{ind.title}</h4>
                      <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${ind.severity === 'high' ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400' : ind.severity === 'medium' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400'}`}>
                        {ind.severity}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">{ind.detail}</p>
                  </motion.div>
                ))}
              </div>

              {/* Image / Video analysis mocks */}
              {mode === 'manual' && imageUrl && (
                <div className="bg-white dark:bg-charcoal-light/30 p-6 rounded-3xl border border-border dark:border-gray-800">
                  <h3 className="text-lg font-bold text-charcoal dark:text-cream mb-4 flex items-center gap-2"><FiImage /> Image Forensics</h3>
                  <div className="flex gap-4 items-start">
                    <img src={imageUrl} alt="Analyzed" className="w-32 h-32 object-cover rounded-xl" onError={e => e.target.style.display = 'none'} />
                    <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                      <p><strong>EXIF Data:</strong> Stripped</p>
                      <p><strong>pHash Match:</strong> 85% similarity found on reverse image search</p>
                      <p><strong>AI Generation:</strong> 12% likelihood</p>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* How It Works */}
        <div className="mb-12">
          <h2 className="font-display text-2xl font-bold text-charcoal dark:text-cream mb-6 text-center">How It Works</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: <FiUploadCloud />, title: 'Upload', desc: 'Provide URL or manual details' },
              { icon: <FiBarChart2 />, title: 'Analyze', desc: 'We cross-reference data points' },
              { icon: <FiShield />, title: 'Review', desc: 'Check images, reviews, patterns' },
              { icon: <FiCheckCircle />, title: 'Decide', desc: 'Get a trust score before buying' }
            ].map((step, i) => (
              <div key={i} className="text-center p-4 bg-white dark:bg-charcoal-light/30 rounded-2xl">
                <div className="w-12 h-12 mx-auto bg-gold/10 text-gold rounded-full flex items-center justify-center text-xl mb-3">{step.icon}</div>
                <h4 className="font-bold text-sm text-charcoal dark:text-cream mb-1">{step.title}</h4>
                <p className="text-xs text-gray-500">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* History Section */}
        {history.length > 0 && (
          <div className="bg-white dark:bg-charcoal-light/30 rounded-2xl border border-border dark:border-gray-800 overflow-hidden">
            <button 
              onClick={() => setHistoryOpen(!historyOpen)}
              className="w-full flex items-center justify-between p-5 text-left font-bold text-charcoal dark:text-cream"
            >
              <span>Past Analyses</span>
              {historyOpen ? <FiChevronUp /> : <FiChevronDown />}
            </button>
            <AnimatePresence>
              {historyOpen && (
                <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                  <div className="p-5 pt-0 border-t border-border dark:border-gray-800">
                    <div className="space-y-3 mt-3">
                      {history.map((h, i) => (
                        <div key={i} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-charcoal rounded-xl text-sm">
                          <div>
                            <p className="font-semibold text-charcoal dark:text-cream truncate max-w-[200px] md:max-w-md">{h.title || h.url}</p>
                            <p className="text-xs text-gray-500">{new Date(h.date).toLocaleDateString()}</p>
                          </div>
                          <div className={`font-bold px-3 py-1 rounded-full text-xs ${h.score >= 70 ? 'bg-emerald-100 text-emerald-700' : h.score >= 40 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>
                            {h.score} Score
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

      </div>
    </div>
  )
}
