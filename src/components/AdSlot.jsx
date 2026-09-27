import { useEffect, useRef } from 'react';

// ── Set your real AdSense publisher ID here once approved ──────────
// Leave empty until you have a real ID — the component will show a
// graceful placeholder instead of making broken ad requests.
const ADSENSE_PUB_ID = '';   // e.g. 'ca-pub-1234567890123456'

const AD_FORMATS = {
  horizontal: { style: { display: 'block', width: '100%', height: '90px' }, slot: 'HORIZONTAL_SLOT' },
  rectangle: { style: { display: 'inline-block', width: '336px', height: '280px' }, slot: 'RECTANGLE_SLOT' },
  vertical: { style: { display: 'inline-block', width: '160px', height: '600px' }, slot: 'VERTICAL_SLOT' },
  'in-article': { style: { display: 'block', textAlign: 'center' }, slot: 'IN_ARTICLE_SLOT' },
  'in-feed': { style: { display: 'block', width: '100%', height: '250px' }, slot: 'IN_FEED_SLOT' },
};

export default function AdSlot({ slotId, format = 'rectangle', className = '' }) {
  const adRef = useRef(false);
  const adConfig = AD_FORMATS[format] || AD_FORMATS['rectangle'];
  const finalSlotId = slotId || adConfig.slot;

  const showRealAd = ADSENSE_PUB_ID && !import.meta.env.DEV;

  useEffect(() => {
    if (showRealAd && !adRef.current) {
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
        adRef.current = true;
      } catch (e) {
        console.error("AdSense error", e);
      }
    }
  }, [showRealAd]);

  return (
    <div className={`text-center my-4 ${className}`}>
      <span className="block text-[10px] text-gray-400 mb-1 uppercase tracking-wider">Advertisement</span>
      {showRealAd ? (
        <ins
          className="adsbygoogle"
          style={adConfig.style}
          data-ad-client={ADSENSE_PUB_ID}
          data-ad-slot={finalSlotId}
          data-ad-format={format}
        />
      ) : (
        <div 
          style={adConfig.style}
          className="border border-dashed border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-800 mx-auto flex items-center justify-center text-gray-500 dark:text-gray-400 text-sm rounded"
        >
          Ad Space Available
        </div>
      )}
    </div>
  );
}
