import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

export default function PrivacyPolicy() {
  const [activeSection, setActiveSection] = useState('intro')

  const sections = [
    { id: 'intro', title: '1. Introduction' },
    { id: 'collect', title: '2. Information We Collect' },
    { id: 'use', title: '3. How We Use Information' },
    { id: 'cookies', title: '4. Cookies & Advertising' },
    { id: 'third-party', title: '5. Third-Party Links' },
    { id: 'security', title: '6. Data Security' },
    { id: 'rights', title: '7. Your Rights' },
    { id: 'children', title: '8. Children\'s Privacy' },
    { id: 'changes', title: '9. Changes to Policy' },
    { id: 'contact', title: '10. Contact Us' },
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
          <h1 className="font-display text-5xl font-bold text-white mb-4">Privacy Policy</h1>
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
          
          <section id="intro">
            <h2 className="font-display text-3xl font-bold text-charcoal dark:text-cream mb-4">1. Introduction</h2>
            <p>Welcome to 8clothes (FashionDB). We respect your privacy and are committed to protecting your personal data. This privacy policy will inform you as to how we look after your personal data when you visit our website and tell you about your privacy rights and how the law protects you.</p>
          </section>

          <section id="collect">
            <h2 className="font-display text-3xl font-bold text-charcoal dark:text-cream mb-4">2. Information We Collect</h2>
            <p>We may collect, use, store and transfer different kinds of data about you which we have grouped together as follows:</p>
            <ul className="list-disc pl-5 mt-4 space-y-2">
              <li><strong>Local Storage Data:</strong> Information stored locally on your device such as favorites, recently viewed items, and generated outfits.</li>
              <li><strong>Uploaded Content:</strong> Images or videos you upload to our Listing Analyzer tool for analysis.</li>
              <li><strong>Usage Analytics:</strong> Information about how you use our website, products, and services.</li>
            </ul>
          </section>

          <section id="use">
            <h2 className="font-display text-3xl font-bold text-charcoal dark:text-cream mb-4">3. How We Use Information</h2>
            <p>We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances:</p>
            <ul className="list-disc pl-5 mt-4 space-y-2">
              <li>To provide our listing analysis services and process your requests.</li>
              <li>To improve our fraud detection algorithms and overall service quality.</li>
              <li>To display personalized content and recommendations.</li>
            </ul>
          </section>

          <section id="cookies">
            <h2 className="font-display text-3xl font-bold text-charcoal dark:text-cream mb-4">4. Cookies & Advertising</h2>
            <p>We use cookies and similar tracking technologies to track the activity on our service and hold certain information. Specifically:</p>
            <ul className="list-disc pl-5 mt-4 space-y-2">
              <li><strong>Google AdSense:</strong> We use Google AdSense to display ads. Google uses cookies to serve ads based on your prior visits to our website or other websites.</li>
              <li><strong>Affiliate Tracking:</strong> We use affiliate cookies to track purchases made through our referral links to partner sites.</li>
            </ul>
            <p className="mt-4">You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.</p>
          </section>

          <section id="third-party">
            <h2 className="font-display text-3xl font-bold text-charcoal dark:text-cream mb-4">5. Third-Party Links</h2>
            <p>Our website includes links to third-party e-commerce websites (e.g., Amazon, Flipkart, Myntra). Clicking on those links or enabling those connections may allow third parties to collect or share data about you. We do not control these third-party websites and are not responsible for their privacy statements. When you leave our website, we encourage you to read the privacy notice of every website you visit.</p>
          </section>

          <section id="security">
            <h2 className="font-display text-3xl font-bold text-charcoal dark:text-cream mb-4">6. Data Security</h2>
            <p>We have put in place appropriate security measures to prevent your personal data from being accidentally lost, used, or accessed in an unauthorized way. Images and videos uploaded for the Listing Analyzer are processed in-memory or stored temporarily for the duration of the analysis, and are not stored long-term on our servers.</p>
          </section>

          <section id="rights">
            <h2 className="font-display text-3xl font-bold text-charcoal dark:text-cream mb-4">7. Your Rights</h2>
            <p>Under certain circumstances, you have rights under data protection laws in relation to your personal data, including the right to request deletion of your data and manage your cookie preferences. Since much of our user data is stored locally on your device, you can clear this data at any time by clearing your browser's local storage.</p>
          </section>

          <section id="children">
            <h2 className="font-display text-3xl font-bold text-charcoal dark:text-cream mb-4">8. Children's Privacy</h2>
            <p>Our website is not intended for children under 13 years of age. We do not knowingly collect personal data relating to children. If you are a parent or guardian and you are aware that your child has provided us with personal data, please contact us.</p>
          </section>

          <section id="changes">
            <h2 className="font-display text-3xl font-bold text-charcoal dark:text-cream mb-4">9. Changes to Policy</h2>
            <p>We keep our privacy policy under regular review. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date at the top.</p>
          </section>

          <section id="contact">
            <h2 className="font-display text-3xl font-bold text-charcoal dark:text-cream mb-4">10. Contact Us</h2>
            <p>If you have any questions about this privacy policy or our privacy practices, please contact us at:</p>
            <p className="mt-4 font-bold text-gold italic">Contact email will be updated soon.</p>
          </section>

        </motion.div>
      </div>
    </div>
  )
}
