import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const TABS = ['Color Guide', 'Body Types', 'Skin Tones', 'Season Guide', 'Occasion Guide', 'Beginner Tips', 'Trends 2024', 'Classic Styles']

const COLOR_COMBOS = [
  { base: '#1A1A2E', accent: '#C9A96E', name: 'Navy + Gold', desc: 'Power and elegance — perfect for formal events.' },
  { base: '#FFFFFF', accent: '#1A1A1A', name: 'White + Black', desc: 'The ultimate timeless combo. Never fails.' },
  { base: '#F5F0EB', accent: '#8B7355', name: 'Cream + Camel', desc: 'Tonal dressing at its most sophisticated.' },
  { base: '#2D5016', accent: '#C8B08A', name: 'Olive + Beige', desc: 'Natural, earthy — great for casual outdoor looks.' },
  { base: '#1B4F72', accent: '#E8D5B7', name: 'Navy + Cream', desc: 'Classic preppy. Works for any age group.' },
  { base: '#922B21', accent: '#F4D03F', name: 'Burgundy + Mustard', desc: 'Bold autumn combination. Highly on trend.' },
]

const BODY_TYPES = [
  { type: 'Hourglass', icon: '⧗', desc: 'Equal bust and hip with defined waist', dos: ['Wrap dresses', 'High-waist trousers', 'Fitted blazers', 'A-line skirts'], donts: ['Boxy tops', 'Shapeless dresses'] },
  { type: 'Pear',      icon: '🍐', desc: 'Hips wider than shoulders', dos: ['A-line skirts', 'Off-shoulder tops', 'Dark bottoms + light tops', 'Structured jackets'], donts: ['Skinny straight trousers', 'Clingy hip fabrics'] },
  { type: 'Apple',     icon: '🍎', desc: 'Wider midsection, slimmer legs', dos: ['Empire waist dresses', 'V-necklines', 'Straight-leg trousers', 'Long cardigans'], donts: ['Crop tops', 'Tight waistbands'] },
  { type: 'Rectangle', icon: '▬', desc: 'Balanced bust, waist, and hips', dos: ['Peplum tops', 'Ruffled skirts', 'Layered looks', 'Bold belts'], donts: ['Shapeless dresses', 'Straight-cut suits without tailoring'] },
  { type: 'Inverted Δ', icon: '▽', desc: 'Broader shoulders, narrower hips', dos: ['Wide-leg trousers', 'A-line skirts', 'Bold prints on lower half', 'Slim-cut trousers'], donts: ['Shoulder pads', 'Halter tops'] },
]

const SKIN_TONES = [
  { tone: 'Fair',   hex: '#FDE8D8', best: ['Pastels', 'Soft blues', 'Blush pink', 'Lavender'], avoid: ['Neon colours', 'Very pale neutrals'] },
  { tone: 'Light',  hex: '#F4C5A0', best: ['Navy', 'Burgundy', 'Forest green', 'Warm whites'], avoid: ['Washed-out pastels'] },
  { tone: 'Medium', hex: '#D4956A', best: ['Earth tones', 'Terracotta', 'Teal', 'Mustard'], avoid: ['Very pale beige (blends in)'] },
  { tone: 'Olive',  hex: '#C8843A', best: ['Jewel tones', 'Purple', 'Deep green', 'Burnt orange'], avoid: ['Yellow-greens'] },
  { tone: 'Brown',  hex: '#8B5E3C', best: ['Bold colours', 'Royal blue', 'Fuchsia', 'Gold'], avoid: ['Very dark navy (hard contrast)'] },
  { tone: 'Dark',   hex: '#4A2C17', best: ['Bright colours', 'Whites', 'Reds', 'Metallics'], avoid: ['Very dark colours (low contrast)'] },
]

const SEASONS = [
  { season: 'Summer', emoji: '☀️', fabrics: 'Linen, Cotton, Chiffon, Rayon', colours: 'Whites, Pastels, Coral, Sky Blue', avoid: 'Wool, Velvet, Thick Denim', tip: 'Opt for loose, flowy silhouettes that allow air circulation.' },
  { season: 'Winter', emoji: '❄️', fabrics: 'Wool, Cashmere, Fleece, Velvet', colours: 'Burgundy, Navy, Forest Green, Camel', avoid: 'Thin chiffon, Bare arms', tip: 'Layering is key — build from base layer to insulation to outer shell.' },
  { season: 'Spring', emoji: '🌸', fabrics: 'Cotton, Light Knits, Denim', colours: 'Florals, Sage, Lilac, Peach', avoid: 'Heavy wool, All-black', tip: 'Transition pieces — light layers you can remove as the day warms up.' },
  { season: 'Autumn', emoji: '🍂', fabrics: 'Corduroy, Flannel, Suede, Light Wool', colours: 'Burnt orange, Olive, Mustard, Rust', avoid: 'Very light summer colours', tip: 'Embrace earth tones and rich textures — autumn is the most stylish season.' },
]

const BEGINNER_TIPS = [
  { n: '01', tip: 'Fit is everything. A cheap shirt in your exact size beats an expensive one that doesn\'t fit.' },
  { n: '02', tip: 'Build a capsule wardrobe of 10 neutral basics before buying trendy pieces.' },
  { n: '03', tip: 'Match your belt and shoes in the same leather colour (black or brown).' },
  { n: '04', tip: 'When in doubt, go one shade darker — dark colours are more slimming and sophisticated.' },
  { n: '05', tip: 'Iron or steam your clothes. Even budget garments look expensive when pressed.' },
  { n: '06', tip: 'Invest in 3 pairs of shoes: white sneakers, brown/black loafers, and boots or heels.' },
  { n: '07', tip: 'One statement piece per outfit maximum. The rest should be clean and simple.' },
  { n: '08', tip: 'Quality over quantity. Buy less but choose well-made pieces that last 5+ years.' },
  { n: '09', tip: 'Proportions matter — balance oversized tops with slim bottoms and vice versa.' },
  { n: '10', tip: 'Learn your skin tone and body type. These two factors determine 80% of what suits you.' },
]

const TRENDS_2024 = [
  { trend: 'Quiet Luxury',  desc: 'Minimal branding, neutral tones, impeccable tailoring. The anti-logo movement.', items: ['Camel coat', 'Cream knit', 'Navy blazer'] },
  { trend: 'Cargo Everything', desc: 'Utility pockets on trousers, skirts, and jackets. Functional streetwear.', items: ['Cargo trousers', 'Cargo skirt', 'Cargo jacket'] },
  { trend: 'Balletcore', desc: 'Wrap cardigans, ballet flats, ribbons, and pastel colours. Soft and feminine.', items: ['Ballet flats', 'Wrap cardigan', 'Satin headband'] },
  { trend: 'Gorpcore', desc: 'Outdoor/technical clothing worn in urban settings. Functional yet fashionable.', items: ['Fleece jacket', 'Trail runners', 'Cargo pants'] },
  { trend: 'Sheer Layers', desc: 'Transparent fabrics layered over basics for an elevated, editorial look.', items: ['Sheer blouse', 'Mesh top', 'Lace skirt'] },
]

export default function Guide() {
  const [tab, setTab] = useState(0)

  return (
    <div className="min-h-screen bg-cream dark:bg-charcoal-dark">
      {/* Hero */}
      <div className="relative py-20 gradient-dark text-center overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-10 left-10 w-60 h-60 rounded-full bg-gold blur-3xl" />
          <div className="absolute bottom-10 right-10 w-80 h-80 rounded-full bg-gold/50 blur-3xl" />
        </div>
        <div className="relative z-10 max-w-3xl mx-auto px-6">
          <p className="text-gold text-xs font-semibold uppercase tracking-widest mb-3">Learn Fashion</p>
          <h1 className="font-display text-5xl font-bold text-white mb-4">Fashion Guide</h1>
          <p className="text-gray-300 text-lg">Everything you need to dress with confidence — from colour theory to body types, seasons, and timeless classics.</p>
        </div>
      </div>

      {/* Tab bar */}
      <div className="sticky top-16 z-30 bg-white dark:bg-charcoal border-b border-border dark:border-gray-700 overflow-x-auto">
        <div className="max-w-6xl mx-auto px-6 flex gap-1 py-2">
          {TABS.map((t, i) => (
            <button
              key={t}
              onClick={() => setTab(i)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap
                ${tab === i ? 'bg-gold text-white' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-charcoal-light'}`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-12">
        <AnimatePresence mode="wait">
          <motion.div key={tab} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.3 }}>

            {/* ── 0: Colour Guide ── */}
            {tab === 0 && (
              <div>
                <h2 className="font-display text-3xl font-bold text-charcoal dark:text-cream mb-2">Colour Combinations</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-8">Master these pairings and you'll never second-guess your outfit again.</p>
                <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-5">
                  {COLOR_COMBOS.map((c, i) => (
                    <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                      className="bg-white dark:bg-charcoal-light/50 rounded-2xl p-5 shadow-card hover:shadow-hover hover:-translate-y-1 transition-all">
                      <div className="flex gap-3 mb-4">
                        <div className="w-12 h-12 rounded-xl flex-shrink-0" style={{ background: c.base }} />
                        <div className="w-12 h-12 rounded-xl flex-shrink-0" style={{ background: c.accent }} />
                      </div>
                      <h3 className="font-semibold text-charcoal dark:text-cream mb-1">{c.name}</h3>
                      <p className="text-xs text-gray-600 dark:text-gray-400">{c.desc}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* ── 1: Body Types ── */}
            {tab === 1 && (
              <div>
                <h2 className="font-display text-3xl font-bold text-charcoal dark:text-cream mb-2">Body Type Guide</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-8">Dress to celebrate your shape, not hide it.</p>
                <div className="grid sm:grid-cols-2 gap-5">
                  {BODY_TYPES.map((bt, i) => (
                    <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
                      className="bg-white dark:bg-charcoal-light/50 rounded-2xl p-6 shadow-card">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="text-3xl">{bt.icon}</span>
                        <div>
                          <h3 className="font-display font-bold text-xl text-charcoal dark:text-cream">{bt.type}</h3>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{bt.desc}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-3">
                          <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400 mb-1">✓ Wear</p>
                          {bt.dos.map((d, j) => <p key={j} className="text-xs text-emerald-800 dark:text-emerald-300">{d}</p>)}
                        </div>
                        <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-3">
                          <p className="text-xs font-bold text-red-700 dark:text-red-400 mb-1">✗ Avoid</p>
                          {bt.donts.map((d, j) => <p key={j} className="text-xs text-red-800 dark:text-red-300">{d}</p>)}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* ── 2: Skin Tones ── */}
            {tab === 2 && (
              <div>
                <h2 className="font-display text-3xl font-bold text-charcoal dark:text-cream mb-8">Skin Tone & Colour Compatibility</h2>
                <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-5">
                  {SKIN_TONES.map((st, i) => (
                    <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                      className="bg-white dark:bg-charcoal-light/50 rounded-2xl p-5 shadow-card">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 rounded-full border-2 border-border dark:border-gray-600 shadow" style={{ background: st.hex }} />
                        <span className="font-display font-bold text-xl text-charcoal dark:text-cream">{st.tone}</span>
                      </div>
                      <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 mb-1">Best Colours</p>
                      <div className="flex flex-wrap gap-1 mb-3">
                        {st.best.map(b => <span key={b} className="text-xs px-2 py-0.5 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300 rounded-full">{b}</span>)}
                      </div>
                      <p className="text-xs font-semibold text-red-700 dark:text-red-400 mb-1">Avoid</p>
                      {st.avoid.map(a => <p key={a} className="text-xs text-red-800 dark:text-red-300">{a}</p>)}
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* ── 3: Season Guide ── */}
            {tab === 3 && (
              <div>
                <h2 className="font-display text-3xl font-bold text-charcoal dark:text-cream mb-8">Dressing by Season</h2>
                <div className="grid sm:grid-cols-2 gap-6">
                  {SEASONS.map((s, i) => (
                    <motion.div key={i} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.1 }}
                      className="bg-white dark:bg-charcoal-light/50 rounded-2xl p-6 shadow-card">
                      <div className="text-4xl mb-3">{s.emoji}</div>
                      <h3 className="font-display text-2xl font-bold text-charcoal dark:text-cream mb-3">{s.season}</h3>
                      <div className="space-y-2 text-sm">
                        <div><span className="font-semibold text-gold">Fabrics: </span><span className="text-gray-700 dark:text-gray-300">{s.fabrics}</span></div>
                        <div><span className="font-semibold text-gold">Colours: </span><span className="text-gray-700 dark:text-gray-300">{s.colours}</span></div>
                        <div><span className="font-semibold text-red-400">Avoid: </span><span className="text-gray-700 dark:text-gray-300">{s.avoid}</span></div>
                        <p className="mt-3 text-xs text-gray-600 dark:text-gray-400 bg-gold/10 rounded-lg p-3 italic">💡 {s.tip}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* ── 4: Occasions ── */}
            {tab === 4 && (
              <div>
                <h2 className="font-display text-3xl font-bold text-charcoal dark:text-cream mb-8">Dressing for Every Occasion</h2>
                <div className="grid sm:grid-cols-2 gap-5">
                  {[
                    { occ: 'Office / Work',   icon: '💼', rules: ['Tailored fits only', 'No logos or graphic tees', 'Closed-toe shoes', 'Neutral or muted colours', 'Avoid ripped or distressed clothing'] },
                    { occ: 'Casual Weekend',  icon: '☕', rules: ['Comfort is key', 'Sneakers or loafers', 'Jeans + tee is perfect', 'Layering adds interest', 'Statement accessories welcome'] },
                    { occ: 'Date Night',      icon: '🌹', rules: ['One elevated piece (blazer, dress, heels)', 'Subtle fragrance', 'Clean, polished shoes', 'Minimal, intentional accessories', 'Avoid too casual or too formal'] },
                    { occ: 'Wedding / Party', icon: '🎉', rules: ['Follow the dress code', 'One statement colour', 'Invest in quality footwear', 'Avoid white (bride/groom)', 'Accessories can be bolder'] },
                    { occ: 'Sports / Gym',    icon: '🏋️', rules: ['Moisture-wicking fabrics only', 'Proper support (sports bra/compression)', 'Bright colours boost energy', 'Functional over fashionable', 'Quality footwear for safety'] },
                    { occ: 'Beach / Travel',  icon: '✈️', rules: ['Linen and cotton only', 'Multi-use pieces', 'Comfortable footwear that walks far', 'Wrinkle-resistant fabrics', 'Pack neutral base + colourful accessories'] },
                  ].map((oc, i) => (
                    <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                      className="bg-white dark:bg-charcoal-light/50 rounded-2xl p-6 shadow-card">
                      <div className="flex items-center gap-3 mb-4">
                        <span className="text-3xl">{oc.icon}</span>
                        <h3 className="font-display font-bold text-xl text-charcoal dark:text-cream">{oc.occ}</h3>
                      </div>
                      <ul className="space-y-1.5">
                        {oc.rules.map((r, j) => <li key={j} className="text-sm text-gray-700 dark:text-gray-300 flex items-start gap-2"><span className="text-gold">→</span> {r}</li>)}
                      </ul>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* ── 5: Beginner Tips ── */}
            {tab === 5 && (
              <div>
                <h2 className="font-display text-3xl font-bold text-charcoal dark:text-cream mb-2">10 Rules Every Beginner Needs</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-8">Learn these and you'll instantly dress better than 80% of people.</p>
                <div className="space-y-4">
                  {BEGINNER_TIPS.map((t, i) => (
                    <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}
                      className="flex gap-5 bg-white dark:bg-charcoal-light/50 rounded-2xl p-5 shadow-card hover:shadow-hover hover:-translate-y-0.5 transition-all">
                      <span className="font-display text-3xl font-bold gradient-text shrink-0">{t.n}</span>
                      <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed self-center">{t.tip}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* ── 6: Trends 2024 ── */}
            {tab === 6 && (
              <div>
                <h2 className="font-display text-3xl font-bold text-charcoal dark:text-cream mb-8">2024 Fashion Trends</h2>
                <div className="space-y-5">
                  {TRENDS_2024.map((tr, i) => (
                    <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                      className="bg-white dark:bg-charcoal-light/50 rounded-2xl p-6 shadow-card">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="font-display text-xl font-bold text-charcoal dark:text-cream mb-2">{tr.trend}</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{tr.desc}</p>
                          <div className="flex flex-wrap gap-2">
                            {tr.items.map(item => <span key={item} className="px-3 py-1 rounded-full text-xs font-medium bg-gold/15 text-gold">{item}</span>)}
                          </div>
                        </div>
                        <span className="text-5xl font-display font-bold text-gold/20">#{i + 1}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* ── 7: Classic Styles ── */}
            {tab === 7 && (
              <div>
                <h2 className="font-display text-3xl font-bold text-charcoal dark:text-cream mb-2">Timeless Classic Styles</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-8">These styles never go out of fashion. Invest in them.</p>
                <div className="grid sm:grid-cols-2 gap-5">
                  {[
                    { style: 'The Navy Blazer', desc: 'A navy blazer works with jeans, chinos, or dress trousers. The single most versatile investment in menswear.' },
                    { style: 'White Cotton Shirt', desc: 'Pressed and clean. Worn tucked or untucked. The foundation of any smart wardrobe.' },
                    { style: 'Dark Wash Jeans', desc: 'Dark indigo jeans can go almost anywhere from casual to smart casual. The Swiss Army knife of bottoms.' },
                    { style: 'Little Black Dress', desc: 'Every woman needs one. Knee-length, simple silhouette. Adaptable to any event.' },
                    { style: 'White Sneakers', desc: 'Clean white leather sneakers elevate any outfit. The most versatile shoe in the 21st century.' },
                    { style: 'Trench Coat', desc: 'The trench coat is 100 years old and still the most elegant outerwear ever created.' },
                    { style: 'Striped Breton Top', desc: 'The Breton stripe was designed for French navy sailors in 1858. It\'s still perfect today.' },
                    { style: 'Tailored Trousers', desc: 'Well-fitted straight-leg trousers in charcoal, navy, or camel are endlessly wearable.' },
                  ].map((s, i) => (
                    <motion.div key={i} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.08 }}
                      className="bg-white dark:bg-charcoal-light/50 rounded-2xl p-5 shadow-card hover:shadow-hover hover:-translate-y-1 transition-all">
                      <h3 className="font-display font-bold text-lg text-charcoal dark:text-cream mb-2">{s.style}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{s.desc}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
