import { motion } from 'framer-motion'
import { FiShield, FiCheckCircle, FiSearch, FiAward, FiUsers, FiTrendingUp } from 'react-icons/fi'

export default function AboutUs() {
  return (
    <div className="min-h-screen bg-cream dark:bg-charcoal-dark pt-16 sm:pt-24 pb-12 sm:pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Hero Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <span className="text-xs uppercase tracking-widest text-gold font-semibold mb-2 block">
            About FashionDB
          </span>
          <h1 className="font-display text-2xl sm:text-4xl md:text-5xl font-bold text-charcoal dark:text-cream mb-4 text-balance">
            Curating India's Best Fashion with 100% Reality Checks
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg max-w-2xl mx-auto leading-relaxed">
            FashionDB is India's premier fashion discovery catalog and e-commerce verification portal. We help shoppers navigate the sea of online apparel across Amazon, Flipkart, Myntra, Meesho, and Ajio with verified reviews, genuine customer photos, and AI-powered quality scores.
          </p>
        </motion.div>

        {/* Core Values Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <div className="bg-white dark:bg-charcoal-light p-6 rounded-2xl shadow-card border border-gold/10">
            <div className="w-12 h-12 rounded-xl bg-gold/10 text-gold flex items-center justify-center mb-4 text-2xl">
              <FiShield />
            </div>
            <h3 className="font-display font-bold text-xl text-charcoal dark:text-cream mb-2">Zero Fake Reviews</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              We analyze review photo metadata (pHash + EXIF) to detect duplicate stock images and edited seller photos, flagging questionable listings before you buy.
            </p>
          </div>

          <div className="bg-white dark:bg-charcoal-light p-6 rounded-2xl shadow-card border border-gold/10">
            <div className="w-12 h-12 rounded-xl bg-gold/10 text-gold flex items-center justify-center mb-4 text-2xl">
              <FiSearch />
            </div>
            <h3 className="font-display font-bold text-xl text-charcoal dark:text-cream mb-2">Multi-Store Comparison</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              We aggregate and link trending fashion from top Indian retailers including Amazon India, Flipkart, Myntra, Meesho, and Ajio in one unified catalog.
            </p>
          </div>

          <div className="bg-white dark:bg-charcoal-light p-6 rounded-2xl shadow-card border border-gold/10">
            <div className="w-12 h-12 rounded-xl bg-gold/10 text-gold flex items-center justify-center mb-4 text-2xl">
              <FiAward />
            </div>
            <h3 className="font-display font-bold text-xl text-charcoal dark:text-cream mb-2">Editorial Independence</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              Our trust scores and recommendations are calculated independently. Retailers cannot pay to increase their trust score or falsify reality ratings.
            </p>
          </div>
        </div>

        {/* Our Story & Technology */}
        <div className="bg-white dark:bg-charcoal-light rounded-3xl p-8 sm:p-12 shadow-card border border-gold/15 mb-16 space-y-6 text-gray-700 dark:text-gray-300 leading-relaxed">
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-charcoal dark:text-cream">
            How We Work
          </h2>
          <p>
            Online clothing shopping often suffers from the classic <em>"Expectation vs. Reality"</em> dilemma: catalog models look impeccable under studio lighting, but the actual fabric received can look completely different.
          </p>
          <p>
            FashionDB was created by <strong>Harshit Meena</strong> to solve this exact problem for Indian shoppers. Our team and algorithms curate listings, verify actual buyer photos submitted across platforms, and calculate a proprietary <strong>Trust Score (0–100%)</strong> based on:
          </p>
          <ul className="space-y-3 pl-4">
            <li className="flex items-start gap-3">
              <FiCheckCircle className="text-gold mt-1 shrink-0" />
              <span><strong>Buyer Image Ratio:</strong> The percentage of reviews that feature authentic, unfiltered customer photos.</span>
            </li>
            <li className="flex items-start gap-3">
              <FiCheckCircle className="text-gold mt-1 shrink-0" />
              <span><strong>Review Spike Detection:</strong> Flagging suspicious bursts of 5-star reviews generated within short timeframes.</span>
            </li>
            <li className="flex items-start gap-3">
              <FiCheckCircle className="text-gold mt-1 shrink-0" />
              <span><strong>EXIF & Sensor Analysis:</strong> Detecting whether review photos were shot on actual mobile cameras or generated using Photoshop/AI.</span>
            </li>
          </ul>
        </div>

        {/* Affiliate Disclosure Notice */}
        <div className="p-6 rounded-2xl bg-gold/10 border border-gold/30 text-center">
          <h4 className="font-semibold text-charcoal dark:text-cream mb-2">Affiliate Transparency Notice</h4>
          <p className="text-xs text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            FashionDB participates in several affiliate marketing programs, including the Amazon Associates Program, Flipkart Affiliate Program, Myntra, Meesho, and Ajio partner networks. When you click through our outbound links to make a purchase, we may earn an affiliate commission at absolutely no additional cost to you.
          </p>
        </div>
      </div>
    </div>
  )
}
