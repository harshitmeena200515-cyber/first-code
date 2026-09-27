import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { getRecommendations } from '../api'
import ClothingCard from '../components/ClothingCard'

const STEPS = [
  {
    id: 'gender',
    q: "What's your gender?",
    sub: 'This helps us personalise recommendations for your wardrobe.',
    type: 'single',
    options: [
      { value: 'boys', label: '👦 Male / Boys' },
      { value: 'girls', label: '👧 Female / Girls' },
    ],
  },
  {
    id: 'body_type',
    q: 'What is your body type?',
    sub: 'Knowing your shape helps us find the most flattering fits for you.',
    type: 'single',
    options: [
      { value: 'Slim', label: '📏 Slim / Ectomorph' },
      { value: 'Athletic', label: '💪 Athletic / Mesomorph' },
      { value: 'Rectangle', label: '▬ Rectangle' },
      { value: 'Pear', label: '🍐 Pear' },
      { value: 'Hourglass', label: '⧗ Hourglass' },
      { value: 'Apple', label: '🍎 Apple' },
      { value: 'Inverted Triangle', label: '▽ Inverted Triangle' },
    ],
  },
  {
    id: 'skin_tone',
    q: 'What is your skin tone?',
    sub: 'Colours that complement your skin tone make all the difference.',
    type: 'single',
    options: [
      { value: 'Fair',   label: '🌸 Fair' },
      { value: 'Light',  label: '🌼 Light' },
      { value: 'Medium', label: '🌻 Medium' },
      { value: 'Olive',  label: '🫒 Olive' },
      { value: 'Brown',  label: '🍫 Brown' },
      { value: 'Dark',   label: '🌑 Dark' },
    ],
  },
  {
    id: 'occasion',
    q: 'What are you dressing for?',
    sub: 'Pick your most important occasion — we\'ll find the best outfit.',
    type: 'single',
    options: [
      { value: 'Casual',       label: '😎 Casual / Everyday' },
      { value: 'Office',       label: '💼 Office / Work' },
      { value: 'Party',        label: '🎉 Party / Event' },
      { value: 'Date',         label: '💑 Date Night' },
      { value: 'Sports',       label: '🏋️ Sports / Gym' },
      { value: 'Festival',     label: '🎊 Festival / Wedding' },
      { value: 'Street',       label: '🛹 Streetwear' },
      { value: 'Smart Casual', label: '🎯 Smart Casual' },
    ],
  },
  {
    id: 'season',
    q: 'Which season are you shopping for?',
    sub: 'Fabric and colour recommendations change significantly by season.',
    type: 'single',
    options: [
      { value: 'Summer', label: '☀️ Summer' },
      { value: 'Winter', label: '❄️ Winter' },
      { value: 'Spring', label: '🌸 Spring' },
      { value: 'Autumn', label: '🍂 Autumn' },
    ],
  },
  {
    id: 'budget',
    q: 'What is your budget? (₹)',
    sub: 'We\'ll filter only items within your price range.',
    type: 'budget',
    options: [
      { value: 500,   label: '💸 Under ₹500' },
      { value: 1000,  label: '💰 Up to ₹1,000' },
      { value: 2000,  label: '🪙 Up to ₹2,000' },
      { value: 5000,  label: '💵 Up to ₹5,000' },
      { value: 10000, label: '🏆 Up to ₹10,000' },
      { value: 99999, label: '♾️ No limit' },
    ],
  },
  {
    id: 'age_group',
    q: 'What age group are you?',
    sub: 'Trends and comfort priorities differ by life stage.',
    type: 'single',
    options: [
      { value: 'Teen',        label: '🎒 Teen (13-19)' },
      { value: 'Young Adult', label: '🎓 Young Adult (20-30)' },
      { value: 'Adult',       label: '👔 Adult (30-50)' },
    ],
  },
]

export default function Quiz() {
  const [step,    setStep]    = useState(0)
  const [answers, setAnswers] = useState({})
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const progress = ((step / STEPS.length) * 100)

  const select = (key, value) => {
    setAnswers(a => ({ ...a, [key]: value }))
    if (step < STEPS.length - 1) {
      setTimeout(() => setStep(s => s + 1), 300)
    }
  }

  const submit = async () => {
    setLoading(true)
    try {
      const body = {
        gender:    answers.gender,
        body_type: answers.body_type,
        skin_tone: answers.skin_tone,
        occasion:  answers.occasion,
        season:    answers.season,
        budget:    answers.budget !== 99999 ? answers.budget : undefined,
        age_group: answers.age_group,
        min_trust: 55,
      }
      const res = await getRecommendations(body)
      setResults(res.data)
    } finally {
      setLoading(false)
    }
  }

  const reset = () => { setStep(0); setAnswers({}); setResults(null) }

  if (results) {
    return (
      <div className="min-h-screen bg-cream dark:bg-charcoal-dark py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }}>
              <span className="text-6xl">🎯</span>
            </motion.div>
            <h2 className="font-display text-4xl font-bold text-charcoal dark:text-cream mt-4 mb-2">
              Your Personalised Picks
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              {results.length} items matched for {answers.gender === 'boys' ? 'him' : 'her'} — filtered by trust score, body type, and occasion.
            </p>
            <button onClick={reset} className="mt-4 text-sm text-gold hover:underline">← Retake Quiz</button>
          </div>

          {results.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5">
              {results.map((item, i) => <ClothingCard key={item.id} item={item} index={i} />)}
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-4xl mb-4">😕</p>
              <p className="text-gray-600 dark:text-gray-400 mb-4">No items matched your exact profile. Try adjusting your answers.</p>
              <button onClick={reset} className="px-6 py-3 rounded-xl bg-gold text-white font-semibold hover:bg-gold-dark transition-colors">Retake Quiz</button>
            </div>
          )}
        </div>
      </div>
    )
  }

  const current = STEPS[step]

  return (
    <div className="min-h-screen bg-cream dark:bg-charcoal-dark flex items-center justify-center px-6 py-20">
      <div className="w-full max-w-2xl">
        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-2">
            <span>Step {step + 1} of {STEPS.length}</span>
            <span>{Math.round(progress)}% complete</span>
          </div>
          <div className="h-2 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
            <motion.div
              className="h-full quiz-progress-fill rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.35 }}
            className="bg-white dark:bg-charcoal-light/50 rounded-3xl p-8 shadow-card"
          >
            {/* Question */}
            <h2 className="font-display text-2xl font-bold text-charcoal dark:text-cream mb-2">
              {current.q}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">{current.sub}</p>

            {/* Options */}
            <div className="grid grid-cols-2 gap-3">
              {current.options.map(opt => {
                const selected = answers[current.id] === opt.value
                return (
                  <motion.button
                    key={opt.value}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => select(current.id, opt.value)}
                    className={`p-4 rounded-2xl text-left text-sm font-medium transition-all border-2
                      ${selected
                        ? 'border-gold bg-gold/10 text-charcoal dark:text-cream shadow-gold'
                        : 'border-border dark:border-gray-700 bg-cream dark:bg-charcoal text-gray-700 dark:text-gray-300 hover:border-gold/50 hover:bg-gold/5'
                      }`}
                  >
                    {opt.label}
                    {selected && <span className="float-right text-gold">✓</span>}
                  </motion.button>
                )
              })}
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between mt-8">
              {step > 0 && (
                <button onClick={() => setStep(s => s - 1)} className="text-sm text-gray-500 hover:text-gold transition-colors">
                  ← Back
                </button>
              )}
              <div className="ml-auto flex gap-3">
                {step === STEPS.length - 1 ? (
                  <button
                    onClick={submit}
                    disabled={!answers[current.id] || loading}
                    className="px-6 py-3 rounded-xl gradient-gold text-charcoal font-semibold text-sm hover:shadow-gold disabled:opacity-50 transition-all"
                  >
                    {loading ? '🔍 Finding your style…' : '🎯 Get My Recommendations →'}
                  </button>
                ) : (
                  answers[current.id] && (
                    <button
                      onClick={() => setStep(s => s + 1)}
                      className="px-6 py-3 rounded-xl bg-charcoal dark:bg-gold text-white dark:text-charcoal font-semibold text-sm hover:opacity-90 transition-all"
                    >
                      Next →
                    </button>
                  )
                )}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
