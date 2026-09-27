import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { getSavedOutfits, fetchClothes, saveOutfit, deleteSavedOutfit } from '../api'
import ClothingCard from '../components/ClothingCard'
import { Link } from 'react-router-dom'

const SLOTS = [
  { key: 'headwear',   label: '🧢 Headwear',   category: 'headwear' },
  { key: 'upperwear',  label: '👕 Upper Wear',  category: 'upperwear' },
  { key: 'lowerwear',  label: '👖 Lower Wear',  category: 'lowerwear' },
  { key: 'footwear',   label: '👟 Footwear',    category: 'footwear' },
  { key: 'accessories',label: '⌚ Accessories', category: 'accessories' },
]

export default function OutfitBuilder() {
  const [outfit,   setOutfit]   = useState({})
  const [activeSlot, setActive] = useState(null)
  const [slotItems,  setSlotItems] = useState([])
  const [loading,  setLoading]  = useState(false)
  const [saved,    setSaved]    = useState([])
  const [gender,   setGender]   = useState('boys')
  const [outfitName, setOutfitName] = useState('')

  useEffect(() => { setSaved(getSavedOutfits()) }, [])

  const openSlot = async (slot) => {
    setActive(slot)
    setLoading(true)
    try {
      const res = await fetchClothes({ category: slot.category, gender, limit: 12, sort: 'popular' })
      setSlotItems(res.data.items)
    } finally {
      setLoading(false)
    }
  }

  const pickItem = (item) => {
    setOutfit(o => ({ ...o, [activeSlot.key]: item }))
    setActive(null)
  }

  const removeSlot = (key) => setOutfit(o => { const n = { ...o }; delete n[key]; return n })

  const handleSave = () => {
    if (Object.keys(outfit).length === 0) return
    saveOutfit({ name: outfitName || 'My Outfit', gender, items: outfit })
    setSaved(getSavedOutfits())
    setOutfitName('')
    alert('Outfit saved!')
  }

  const totalCost = Object.values(outfit).reduce((s, i) => s + (i.price || 0), 0)

  return (
    <div className="min-h-screen bg-cream dark:bg-charcoal-dark py-12 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="font-display text-5xl font-bold text-charcoal dark:text-cream mb-3">
            Outfit Builder
          </h1>
          <p className="text-gray-500 dark:text-gray-400 max-w-xl mx-auto">
            Mix & match your perfect outfit. Click each slot to browse items and build your look from head to toe.
          </p>
        </div>

        {/* Gender toggle */}
        <div className="flex justify-center mb-8">
          <div className="flex rounded-xl overflow-hidden border border-border dark:border-gray-700">
            {['boys', 'girls'].map(g => (
              <button key={g} onClick={() => { setGender(g); setOutfit({}) }}
                className={`px-6 py-2 text-sm font-semibold capitalize transition-colors ${gender === g ? 'bg-gold text-white' : 'bg-white dark:bg-charcoal-light text-gray-600 dark:text-gray-300 hover:bg-gold/10'}`}>
                {g}
              </button>
            ))}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-10 mb-12">
          {/* ── Left: Slots ── */}
          <div className="space-y-3">
            {SLOTS.map(slot => (
              <motion.div key={slot.key} whileHover={{ x: 4 }}>
                <div
                  className={`outfit-slot flex items-center gap-4 p-4 rounded-2xl cursor-pointer transition-all
                    ${activeSlot?.key === slot.key ? 'active' : ''}`}
                  onClick={() => openSlot(slot)}
                >
                  {outfit[slot.key] ? (
                    <>
                      <img src={outfit[slot.key].image_path} alt="" className="w-16 h-20 object-cover rounded-xl shrink-0" onError={e => { e.target.style.display='none' }} />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gold font-semibold uppercase tracking-wider mb-0.5">{slot.label}</p>
                        <p className="font-semibold text-sm text-charcoal dark:text-cream truncate">{outfit[slot.key].name}</p>
                        <p className="text-xs text-gray-400">₹{outfit[slot.key].price?.toLocaleString('en-IN')}</p>
                      </div>
                      <button
                        onClick={e => { e.stopPropagation(); removeSlot(slot.key) }}
                        className="text-red-400 hover:text-red-600 text-lg shrink-0"
                      >✕</button>
                    </>
                  ) : (
                    <>
                      <div className="w-16 h-20 rounded-xl bg-gold/10 flex items-center justify-center text-2xl shrink-0">
                        {slot.label.split(' ')[0]}
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-0.5">{slot.label.slice(3)}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Click to select →</p>
                      </div>
                    </>
                  )}
                </div>
              </motion.div>
            ))}
          </div>

          {/* ── Right: Summary ── */}
          <div>
            <div className="bg-white dark:bg-charcoal-light/50 rounded-3xl p-6 shadow-card mb-5">
              <h3 className="font-display text-xl font-bold text-charcoal dark:text-cream mb-4">Outfit Summary</h3>
              {Object.keys(outfit).length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-sm">Pick items from the left to build your outfit.</p>
              ) : (
                <>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {Object.values(outfit).map(item => (
                      <span key={item.id} className="px-3 py-1 rounded-xl text-xs font-medium bg-gold/10 text-gold">{item.name}</span>
                    ))}
                  </div>
                  <div className="flex items-center justify-between text-sm border-t border-border dark:border-gray-700 pt-4 mt-4">
                    <span className="text-gray-500 dark:text-gray-400">Total Cost</span>
                    <span className="font-bold text-lg text-charcoal dark:text-cream">₹{totalCost.toLocaleString('en-IN')}</span>
                  </div>
                  {/* Save outfit */}
                  <div className="mt-4 flex gap-2">
                    <input
                      value={outfitName}
                      onChange={e => setOutfitName(e.target.value)}
                      placeholder="Outfit name (optional)"
                      className="flex-1 px-3 py-2 text-sm rounded-xl border border-border dark:border-gray-700 bg-cream dark:bg-charcoal focus:ring-1 focus:ring-gold focus:outline-none"
                    />
                    <button onClick={handleSave} className="px-4 py-2 rounded-xl gradient-gold text-charcoal text-sm font-semibold hover:shadow-gold transition-all">
                      Save
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Saved outfits */}
            {saved.length > 0 && (
              <div className="bg-white dark:bg-charcoal-light/50 rounded-2xl p-5 shadow-card">
                <h4 className="font-semibold text-charcoal dark:text-cream mb-3 text-sm">Saved Outfits ({saved.length})</h4>
                {saved.map(o => (
                  <div key={o.id} className="flex items-center justify-between py-2 border-b border-border dark:border-gray-700 last:border-0">
                    <div>
                      <p className="text-sm font-medium text-charcoal dark:text-cream">{o.name}</p>
                      <p className="text-xs text-gray-400">{Object.keys(o.items || {}).length} pieces · {o.gender}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => { setOutfit(o.items); setGender(o.gender) }}
                        className="text-xs text-gold hover:underline"
                      >Load</button>
                      <button
                        onClick={() => { deleteSavedOutfit(o.id); setSaved(getSavedOutfits()) }}
                        className="text-xs text-red-400 hover:underline"
                      >Remove</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Item picker */}
        {activeSlot && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-xl font-bold text-charcoal dark:text-cream">
                Pick {activeSlot.label}
              </h3>
              <button onClick={() => setActive(null)} className="text-gray-400 hover:text-gold">✕ Close</button>
            </div>
            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4">
                {Array.from({ length: 6 }).map((_, i) => <div key={i} className="shimmer-bg aspect-[3/4] rounded-xl" />)}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4">
                {slotItems.map((item, i) => (
                  <div key={item.id} onClick={() => pickItem(item)} className="cursor-pointer">
                    <ClothingCard item={item} index={i} />
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  )
}
