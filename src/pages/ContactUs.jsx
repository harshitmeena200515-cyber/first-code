import { useState } from 'react'
import { motion } from 'framer-motion'
import { FiMail, FiMessageSquare, FiMapPin, FiSend, FiCheckCircle } from 'react-icons/fi'

export default function ContactUs() {
  const [submitted, setSubmitted] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: 'General Inquiry',
    message: ''
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    // Simulated contact form submission
    setSubmitted(true)
  }

  return (
    <div className="min-h-screen bg-cream dark:bg-charcoal-dark pt-16 sm:pt-24 pb-12 sm:pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <span className="text-xs uppercase tracking-widest text-gold font-semibold mb-2 block">
            Get in Touch
          </span>
          <h1 className="font-display text-2xl sm:text-4xl md:text-5xl font-bold text-charcoal dark:text-cream mb-4">
            Contact FashionDB
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-base max-w-xl mx-auto">
            Have questions about a curated product, brand partnerships, affiliate inquiries, or data corrections? We'd love to hear from you.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div className="bg-white dark:bg-charcoal-light p-6 rounded-2xl shadow-card border border-gold/10 text-center">
            <div className="w-12 h-12 rounded-xl bg-gold/10 text-gold flex items-center justify-center mx-auto mb-3 text-xl">
              <FiMail />
            </div>
            <h3 className="font-semibold text-charcoal dark:text-cream mb-1">Email Us</h3>
            <p className="text-xs text-gray-500 mb-2">Typically replies within 24 hours</p>
            <a href="mailto:support@fashiondb.in" className="text-sm text-gold font-medium hover:underline">
              support@fashiondb.in
            </a>
          </div>

          <div className="bg-white dark:bg-charcoal-light p-6 rounded-2xl shadow-card border border-gold/10 text-center">
            <div className="w-12 h-12 rounded-xl bg-gold/10 text-gold flex items-center justify-center mx-auto mb-3 text-xl">
              <FiMessageSquare />
            </div>
            <h3 className="font-semibold text-charcoal dark:text-cream mb-1">Affiliate & Brands</h3>
            <p className="text-xs text-gray-500 mb-2">Partnerships and listing requests</p>
            <a href="mailto:partners@fashiondb.in" className="text-sm text-gold font-medium hover:underline">
              partners@fashiondb.in
            </a>
          </div>

          <div className="bg-white dark:bg-charcoal-light p-6 rounded-2xl shadow-card border border-gold/10 text-center">
            <div className="w-12 h-12 rounded-xl bg-gold/10 text-gold flex items-center justify-center mx-auto mb-3 text-xl">
              <FiMapPin />
            </div>
            <h3 className="font-semibold text-charcoal dark:text-cream mb-1">Location</h3>
            <p className="text-xs text-gray-500 mb-2">Headquarters</p>
            <p className="text-sm text-charcoal dark:text-cream font-medium">Rajasthan, India</p>
          </div>
        </div>

        {/* Contact Form Card */}
        <div className="bg-white dark:bg-charcoal-light rounded-3xl p-8 sm:p-10 shadow-card border border-gold/15">
          {submitted ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-12 space-y-4"
            >
              <div className="w-16 h-16 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto text-3xl">
                <FiCheckCircle />
              </div>
              <h3 className="font-display text-2xl font-bold text-charcoal dark:text-cream">
                Message Sent Successfully!
              </h3>
              <p className="text-sm text-gray-500 max-w-md mx-auto">
                Thank you for reaching out, {formData.name}. Our team will review your message and reply via email within 24 to 48 hours.
              </p>
              <button
                onClick={() => setSubmitted(false)}
                className="mt-4 px-6 py-2.5 rounded-xl gradient-gold text-charcoal font-semibold text-sm hover:shadow-gold transition-all"
              >
                Send Another Message
              </button>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                    Your Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Harshit Meena"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-charcoal-dark text-charcoal dark:text-cream text-sm focus:ring-2 focus:ring-gold/50 focus:border-gold outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    placeholder="name@example.com"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-charcoal-dark text-charcoal dark:text-cream text-sm focus:ring-2 focus:ring-gold/50 focus:border-gold outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                  Topic / Purpose
                </label>
                <select
                  value={formData.subject}
                  onChange={e => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-charcoal-dark text-charcoal dark:text-cream text-sm focus:ring-2 focus:ring-gold/50 focus:border-gold outline-none"
                >
                  <option value="General Inquiry">General Inquiry</option>
                  <option value="Affiliate & Brand Partnership">Affiliate & Brand Partnership</option>
                  <option value="Report Incorrect Information">Report Incorrect Price / Listing</option>
                  <option value="DMCA & Copyright Notice">DMCA & Copyright Notice</option>
                  <option value="Technical Feedback">Technical Feedback / Bug Report</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                  Message
                </label>
                <textarea
                  rows="5"
                  required
                  value={formData.message}
                  onChange={e => setFormData({ ...formData, message: e.target.value })}
                  placeholder="How can we help you? Feel free to include product URLs or details..."
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-charcoal-dark text-charcoal dark:text-cream text-sm focus:ring-2 focus:ring-gold/50 focus:border-gold outline-none resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-xl gradient-gold text-charcoal font-bold text-sm hover:shadow-gold active:scale-[0.99] transition-all flex items-center justify-center gap-2"
              >
                <FiSend /> Send Message
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
