import { useState } from 'react';
import { FiInfo, FiX } from 'react-icons/fi';
import { Link } from 'react-router-dom';

export default function AffiliateDisclosureBanner({ className = '' }) {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className={`bg-gold/10 dark:bg-gold/5 border border-gold/20 rounded-lg px-4 py-2 text-sm flex items-center justify-between gap-3 ${className}`}>
      <div className="flex items-center gap-2 flex-1 flex-wrap sm:flex-nowrap">
        <FiInfo className="text-gold shrink-0 w-4 h-4" />
        <p className="text-charcoal dark:text-cream leading-tight m-0">
          This page contains affiliate links. We may earn a small commission at no extra cost to you.{' '}
          <Link to="/affiliate-disclosure" className="text-gold hover:underline whitespace-nowrap font-medium">
            Learn more
          </Link>
        </p>
      </div>
      <button 
        onClick={() => setIsVisible(false)}
        className="text-gray-500 hover:text-charcoal dark:hover:text-cream p-1 shrink-0 transition-colors"
        aria-label="Dismiss"
      >
        <FiX className="w-4 h-4" />
      </button>
    </div>
  );
}
