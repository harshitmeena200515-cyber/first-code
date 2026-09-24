import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

export default function TermsOfService() {
  const [activeSection, setActiveSection] = useState('acceptance')

  const sections = [
    { id: 'acceptance', title: '1. Acceptance of Terms' },
    { id: 'description', title: '2. Description of Service' },
    { id: 'responsibilities', title: '3. User Responsibilities' },
    { id: 'disclaimer', title: '4. Disclaimer' },
    { id: 'liability', title: '5. Limitation of Liability' },
    { id: 'ip', title: '6. Intellectual Property' },
    { id: 'third-party', title: '7. Third-Party Links' },
    { id: 'affiliate', title: '8. Affiliate Links' },
    { id: 'modifications', title: '9. Modifications' },
    { id: 'governing-law', title: '10. Governing Law' },
    { id: 'contact', title: '11. Contact' },
  ]

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY
      for (const section of sections) {
        const element = document.getElementById(section.id)
        if (element) {
          const offsetTop = element.offsetTop
          if (scrollY >= offsetTop - 150) {
            setActiveSection(section.id)
          }
        }
      }
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [sections])

  const scrollToSection = (id) => {
    const element = document.getElementById(id)
    if (element) {
      window.scrollTo({
        top: element.offsetTop - 100,
        behavior: 'smooth'
      })
    }
  }

  return (
    <div className="min-h-screen bg-cream dark:bg-charcoal-dark">
      {/* Hero Banner */}
      <div className="relative py-20 gradient-dark text-center overflow-hidden">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative z-10 max-w-3xl mx-auto px-6">
          <h1 className="font-display text-5xl font-bold text-white mb-4">Terms of Service</h1>
          <p className="text-gray-300 text-lg uppercase tracking-widest text-xs font-semibold">Last Updated: September 2024</p>
        </motion.div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-12 flex flex-col md:flex-row gap-12">
        {/* Sidebar TOC */}
        <div className="hidden md:block w-64 flex-shrink-0">
          <div className="sticky top-24 bg-white dark:bg-charcoal-light/30 p-6 rounded-2xl shadow-card border border-border dark:border-gray-800">
            <h3 className="font-bold text-charcoal dark:text-cream mb-4 uppercase text-xs tracking-wider">Table of Contents</h3>
            <ul className="space-y-3">
              {sections.map(s => (
                <li key={s.id}>
                  <button
                    onClick={() => scrollToSection(s.id)}
                    className={`text-sm text-left w-full transition-colors ${activeSection === s.id ? 'text-gold font-bold' : 'text-gray-600 dark:text-gray-400 hover:text-gold'}`}
                  >
                    {s.title}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Content */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 space-y-12 text-gray-700 dark:text-gray-300 leading-relaxed">
          
          <section id="acceptance">
            <h2 className="font-display text-3xl font-bold text-charcoal dark:text-cream mb-4">1. Acceptance of Terms</h2>
            <p>By accessing or using the 8clothes (FashionDB) website, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any part of these terms, you may not use our services.</p>
          </section>

          <section id="description">
            <h2 className="font-display text-3xl font-bold text-charcoal dark:text-cream mb-4">2. Description of Service</h2>
            <p>8clothes provides an online fashion catalog, automated listing analysis tools, and personalized recommendations. Our platform helps users discover fashion items and analyze third-party e-commerce listings for authenticity and quality indicators.</p>
          </section>

          <section id="responsibilities">
            <h2 className="font-display text-3xl font-bold text-charcoal dark:text-cream mb-4">3. User Responsibilities</h2>
            <p>You agree to use our services only for lawful purposes. You must not:</p>
            <ul className="list-disc pl-5 mt-4 space-y-2">
              <li>Provide false or misleading information when using our tools.</li>
              <li>Misuse our analysis tools to generate automated spam or disrupt the service.</li>
              <li>Attempt to reverse-engineer our proprietary algorithms or pHash engines.</li>
            </ul>
          </section>

          <section id="disclaimer">
            <h2 className="font-display text-3xl font-bold text-charcoal dark:text-cream mb-4">4. Disclaimer</h2>
            <p>The analysis results, trust scores, and product recommendations provided by 8clothes are for informational purposes only. They do not constitute legal, financial, or guaranteed purchase advice. We make our best effort to detect fake or misleading listings, but we cannot guarantee 100% accuracy.</p>
          </section>

          <section id="liability">
            <h2 className="font-display text-3xl font-bold text-charcoal dark:text-cream mb-4">5. Limitation of Liability</h2>
            <p>In no event shall 8clothes or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on our website, even if notified orally or in writing of the possibility of such damage.</p>
          </section>

          <section id="ip">
            <h2 className="font-display text-3xl font-bold text-charcoal dark:text-cream mb-4">6. Intellectual Property</h2>
            <p>All content, features, functionality, algorithms, and UI designs on this website are the exclusive property of 8clothes and are protected by international copyright, trademark, patent, trade secret, and other intellectual property laws.</p>
          </section>

          <section id="third-party">
            <h2 className="font-display text-3xl font-bold text-charcoal dark:text-cream mb-4">7. Third-Party Links</h2>
            <p>Our service may contain links to third-party web sites or services (e.g., Amazon, Flipkart, Myntra) that are not owned or controlled by 8clothes. We have no control over, and assume no responsibility for, the content, privacy policies, or practices of any third-party websites or services.</p>
          </section>

          <section id="affiliate">
            <h2 className="font-display text-3xl font-bold text-charcoal dark:text-cream mb-4">8. Affiliate Links</h2>
            <p>8clothes participates in various affiliate marketing programs, which means we may get paid commissions on purchases made through our links to retailer sites. This does not impact our reviews, trust scores, or analysis results, which remain independent and data-driven.</p>
          </section>

          <section id="modifications">
            <h2 className="font-display text-3xl font-bold text-charcoal dark:text-cream mb-4">9. Modifications</h2>
            <p>We reserve the right to revise these terms of service at any time without notice. By using this website, you are agreeing to be bound by the then-current version of these Terms of Service.</p>
          </section>

          <section id="governing-law">
            <h2 className="font-display text-3xl font-bold text-charcoal dark:text-cream mb-4">10. Governing Law</h2>
            <p>These terms and conditions are governed by and construed in accordance with the laws of India, and you irrevocably submit to the exclusive jurisdiction of the courts in that location.</p>
          </section>

          <section id="contact">
            <h2 className="font-display text-3xl font-bold text-charcoal dark:text-cream mb-4">11. Contact</h2>
            <p>If you have any questions about these Terms, please contact us at:</p>
            <p className="mt-4 font-bold text-gold italic">Contact email will be updated soon.</p>
          </section>

        </motion.div>
      </div>
    </div>
  )
}
