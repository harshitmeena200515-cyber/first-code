import { motion } from 'framer-motion'
import { FiCheck, FiInfo, FiSliders, FiClock } from 'react-icons/fi'

export default function CookiePolicy() {
  return (
    <div className="min-h-screen bg-cream dark:bg-charcoal-dark pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <span className="text-xs uppercase tracking-widest text-gold font-semibold mb-2 block">
            Transparency & Consent
          </span>
          <h1 className="font-display text-4xl sm:text-5xl font-bold text-charcoal dark:text-cream mb-4">
            Cookie Policy
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Last Updated: September 2024 · Effective immediately
          </p>
        </motion.div>

        <div className="bg-white dark:bg-charcoal-light rounded-3xl p-8 sm:p-12 shadow-card border border-gold/15 space-y-8 text-gray-700 dark:text-gray-300 leading-relaxed text-sm sm:text-base">
          <section>
            <h2 className="font-display text-2xl font-bold text-charcoal dark:text-cream mb-3">
              1. What Are Cookies?
            </h2>
            <p>
              Cookies are small data text files placed on your computer or mobile device when you browse websites. They are widely used to make websites work efficiently, remember your shopping preferences, and supply aggregated analytical information to website operators.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-bold text-charcoal dark:text-cream mb-3">
              2. How FashionDB Uses Cookies
            </h2>
            <p className="mb-4">
              FashionDB utilizes both first-party cookies (set directly by our domain) and third-party cookies (set by external partners such as Amazon, Google, and partner affiliate networks).
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-gray-50 dark:bg-charcoal border border-gray-200 dark:border-gray-700">
                <h4 className="font-bold text-charcoal dark:text-cream mb-1 flex items-center gap-2">
                  <FiSliders className="text-gold" /> Essential & Preference Cookies
                </h4>
                <p className="text-xs text-gray-500">
                  Used to store your Dark Mode toggle, your saved Favorite clothes, and your Recently Viewed items on your local browser.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-gray-50 dark:bg-charcoal border border-gray-200 dark:border-gray-700">
                <h4 className="font-bold text-charcoal dark:text-cream mb-1 flex items-center gap-2">
                  <FiClock className="text-gold" /> Affiliate Tracking Cookies
                </h4>
                <p className="text-xs text-gray-500">
                  When you click a "Buy on Store" button, an affiliate cookie is placed by the retailer (e.g. Amazon, Flipkart) to attribute referral commissions.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="font-display text-2xl font-bold text-charcoal dark:text-cream mb-3">
              3. Retailer Affiliate Cookie Lifespans
            </h2>
            <p className="mb-3">
              When you click an external merchant link from FashionDB, the target e-commerce store sets a tracking cookie with a specific expiry window:
            </p>
            <ul className="space-y-2 pl-4">
              <li className="flex items-start gap-2">
                <FiCheck className="text-gold mt-1 shrink-0" />
                <span><strong>Amazon India:</strong> 24-hour standard session cookie. If items are placed in your cart, the cookie extends up to 89 days for qualifying purchases.</span>
              </li>
              <li className="flex items-start gap-2">
                <FiCheck className="text-gold mt-1 shrink-0" />
                <span><strong>Flipkart Affiliate Network:</strong> Typically between 24 hours to 30 days depending on the product vertical.</span>
              </li>
              <li className="flex items-start gap-2">
                <FiCheck className="text-gold mt-1 shrink-0" />
                <span><strong>Myntra, Meesho, Ajio:</strong> Standard referral sessions typically range from 24 hours to 7 days.</span>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-2xl font-bold text-charcoal dark:text-cream mb-3">
              4. Managing & Disabling Cookies
            </h2>
            <p className="mb-3">
              You possess the complete freedom to accept or decline cookies. Most web browsers automatically accept cookies, but you can modify your browser settings to decline cookies if you prefer.
            </p>
            <ul className="list-disc pl-6 space-y-1 text-xs text-gray-500 dark:text-gray-400">
              <li>Google Chrome: Settings → Privacy and security → Cookies and other site data</li>
              <li>Mozilla Firefox: Settings → Privacy & Security → Enhanced Tracking Protection</li>
              <li>Apple Safari: Preferences → Privacy → Block all cookies</li>
              <li>Microsoft Edge: Settings → Cookies and site permissions</li>
            </ul>
            <p className="text-xs text-gray-500 mt-3">
              Please note that disabling cookies may affect certain personalization features such as your Saved Favorites or Theme preferences.
            </p>
          </section>

          <section className="pt-4 border-t border-gray-200 dark:border-gray-800">
            <h2 className="font-display text-xl font-bold text-charcoal dark:text-cream mb-2">
              5. Contact Us Regarding Cookies
            </h2>
            <p className="text-xs text-gray-500">
              If you have any questions about our use of cookies or other technologies, please contact our data privacy officer at <a href="mailto:privacy@fashiondb.in" className="text-gold underline">privacy@fashiondb.in</a> or through our <a href="/contact" className="text-gold underline">Contact Us</a> page.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
