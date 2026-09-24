import { motion } from 'framer-motion'
import { FiDollarSign, FiLink, FiShoppingBag, FiShield, FiHeart } from 'react-icons/fi'

export default function AffiliateDisclosure() {
  return (
    <div className="min-h-screen bg-cream dark:bg-charcoal-dark pb-20">
      {/* Hero Banner */}
      <div className="relative py-24 gradient-dark text-center overflow-hidden">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative z-10 max-w-3xl mx-auto px-6">
          <div className="w-16 h-16 bg-gold/20 text-gold rounded-full flex items-center justify-center text-3xl mx-auto mb-6">
            <FiHeart />
          </div>
          <h1 className="font-display text-5xl font-bold text-white mb-4">Affiliate Disclosure</h1>
          <p className="text-gray-300 text-lg max-w-xl mx-auto">Transparency is our core value. Here's how we keep the lights on while keeping our reviews completely independent.</p>
        </motion.div>
      </div>

      <div className="max-w-4xl mx-auto px-6 mt-12 space-y-16">
        
        <motion.section initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="font-display text-3xl font-bold text-charcoal dark:text-cream mb-4 text-center">1. Disclosure Statement</h2>
          <div className="bg-white dark:bg-charcoal-light/30 rounded-3xl p-8 shadow-card border border-border dark:border-gray-800 text-center">
            <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed">
              <strong>8clothes (FashionDB) is a participant in the Amazon Services LLC Associates Program and other affiliate advertising programs.</strong><br/><br/>
              This means that when you click on certain links to products on our site and make a purchase, we may earn a small commission at no additional cost to you. This helps support our platform and allows us to continue building free fraud-detection tools.
            </p>
          </div>
        </motion.section>

        <motion.section initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="font-display text-3xl font-bold text-charcoal dark:text-cream mb-8 text-center">2. How Affiliate Links Work</h2>
          <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-12 text-center text-charcoal dark:text-cream">
            <div className="flex flex-col items-center max-w-xs">
              <div className="w-16 h-16 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-2xl mb-4"><FiLink /></div>
              <h3 className="font-bold mb-2">You Click a Link</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">You find a great product on 8clothes and click "Buy on Amazon/Myntra".</p>
            </div>
            <div className="hidden md:block w-8 h-0.5 bg-gray-300 dark:bg-gray-700 relative">
              <div className="absolute right-0 -top-1 w-2 h-2 border-t-2 border-r-2 border-gray-300 dark:border-gray-700 transform rotate-45"></div>
            </div>
            <div className="flex flex-col items-center max-w-xs">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-2xl mb-4"><FiShoppingBag /></div>
              <h3 className="font-bold mb-2">You Make a Purchase</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">You buy the item for the exact same price you normally would.</p>
            </div>
            <div className="hidden md:block w-8 h-0.5 bg-gray-300 dark:bg-gray-700 relative">
              <div className="absolute right-0 -top-1 w-2 h-2 border-t-2 border-r-2 border-gray-300 dark:border-gray-700 transform rotate-45"></div>
            </div>
            <div className="flex flex-col items-center max-w-xs">
              <div className="w-16 h-16 rounded-full bg-gold/20 text-gold flex items-center justify-center text-2xl mb-4"><FiDollarSign /></div>
              <h3 className="font-bold mb-2">We Earn a Commission</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">The retailer gives us a small percentage as a "thank you" for the referral.</p>
            </div>
          </div>
        </motion.section>

        <motion.section initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="font-display text-3xl font-bold text-charcoal dark:text-cream mb-6 text-center">3. Platforms We Partner With</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <div className="bg-white dark:bg-charcoal p-5 rounded-2xl shadow-card text-center border border-border dark:border-gray-800">
              <div className="font-bold text-lg mb-1 text-amber-500">Amazon.in</div>
              <p className="text-xs text-gray-600 dark:text-gray-400">Amazon Associates Program participant.</p>
            </div>
            <div className="bg-white dark:bg-charcoal p-5 rounded-2xl shadow-card text-center border border-border dark:border-gray-800">
              <div className="font-bold text-lg mb-1 text-blue-600">Flipkart</div>
              <p className="text-xs text-gray-600 dark:text-gray-400">Flipkart Affiliate Network referral partner.</p>
            </div>
            <div className="bg-white dark:bg-charcoal p-5 rounded-2xl shadow-card text-center border border-border dark:border-gray-800">
              <div className="font-bold text-lg mb-1 bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-red-500">Myntra</div>
              <p className="text-xs text-gray-600 dark:text-gray-400">Myntra fashion affiliate program partner.</p>
            </div>
            <div className="bg-white dark:bg-charcoal p-5 rounded-2xl shadow-card text-center border border-border dark:border-gray-800">
              <div className="font-bold text-lg mb-1 text-pink-600">Meesho</div>
              <p className="text-xs text-gray-600 dark:text-gray-400">Meesho seller and reselling affiliate partner.</p>
            </div>
            <div className="bg-white dark:bg-charcoal p-5 rounded-2xl shadow-card text-center border border-border dark:border-gray-800">
              <div className="font-bold text-lg mb-1 text-amber-600">Ajio</div>
              <p className="text-xs text-gray-600 dark:text-gray-400">Reliance Ajio fashion affiliate network partner.</p>
            </div>
          </div>
        </motion.section>

        <motion.section initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="bg-gold/10 rounded-3xl p-8 border border-gold/20">
          <div className="flex items-start gap-4">
            <div className="text-3xl text-gold mt-1"><FiShield /></div>
            <div>
              <h2 className="font-display text-2xl font-bold text-charcoal dark:text-cream mb-3">4. Our Promise to You</h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                Our analysis, trust scores, and recommendations are driven entirely by data, algorithms, and objective metrics (like pHash and EXIF data). 
                <strong> The potential to earn a commission does not influence our analysis results or the products we feature.</strong>
              </p>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                If an item is rated as "Fake" or has a low trust score, we will display that score honestly, regardless of any affiliate relationship.
              </p>
            </div>
          </div>
        </motion.section>

        <motion.section initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="font-display text-2xl font-bold text-charcoal dark:text-cream mb-4">5. How to Identify Affiliate Links</h2>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
            For simplicity and transparency, you should assume that any link leading to an external e-commerce platform (like Amazon, Flipkart, Myntra, Meesho, or Ajio) is an affiliate referral link.
          </p>
        </motion.section>

        <motion.section initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="font-display text-2xl font-bold text-charcoal dark:text-cream mb-4">6. Questions?</h2>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
            If you have any questions regarding our affiliate relationships, please visit our <a href="/contact" className="text-gold font-semibold underline">Contact Us</a> page or email us at <a href="mailto:support@fashiondb.in" className="text-gold underline">support@fashiondb.in</a>.
          </p>
        </motion.section>

      </div>
    </div>
  )
}
