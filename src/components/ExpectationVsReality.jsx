import React, { useState, useRef, useCallback, useEffect } from 'react'

/**
 * ExpectationVsReality
 * ─────────────────────
 * Drag the divider to compare:
 *   LEFT  — Studio / listing photo (what you expect)
 *   RIGHT — Customer review photo  (what you get)
 */
export default function ExpectationVsReality({ studioSrc, customerSrc, className = '' }) {
  const [pos, setPos]       = useState(50)         // 0-100 percent
  const [dragging, setDrag] = useState(false)
  const containerRef        = useRef(null)

  const calcPos = useCallback((clientX) => {
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return
    const raw = ((clientX - rect.left) / rect.width) * 100
    setPos(Math.max(2, Math.min(98, raw)))
  }, [])

  // Mouse
  const onMouseDown = (e) => { e.preventDefault(); setDrag(true) }
  useEffect(() => {
    if (!dragging) return
    const move = (e) => calcPos(e.clientX)
    const up   = ()  => setDrag(false)
    window.addEventListener('mousemove', move)
    window.addEventListener('mouseup',   up)
    return () => { window.removeEventListener('mousemove', move); window.removeEventListener('mouseup', up) }
  }, [dragging, calcPos])

  // Touch
  const onTouchStart = () => setDrag(true)
  useEffect(() => {
    if (!dragging) return
    const move = (e) => calcPos(e.touches[0].clientX)
    const up   = ()  => setDrag(false)
    window.addEventListener('touchmove', move, { passive: true })
    window.addEventListener('touchend',  up)
    return () => { window.removeEventListener('touchmove', move); window.removeEventListener('touchend', up) }
  }, [dragging, calcPos])

  const fallback = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="500" viewBox="0 0 400 500"%3E%3Crect fill="%23f3f4f6" width="400" height="500"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" fill="%236b7280" font-size="16" font-family="sans-serif"%3ENo Image%3C/text%3E%3C/svg%3E'

  return (
    <div className={`evr-container rounded-2xl overflow-hidden select-none ${className}`}
         ref={containerRef} style={{ cursor: dragging ? 'col-resize' : 'col-resize' }}>

      {/* ── BEFORE image (studio) — full width, clipped on right ── */}
      <div className="relative w-full" style={{ paddingBottom: '133%' }}>
        <img
          src={studioSrc || fallback}
          alt="Studio photo"
          className="absolute inset-0 w-full h-full object-cover"
          onError={e => { e.target.src = fallback }}
          draggable={false}
        />

        {/* ── AFTER image (customer) — clipped on left ── */}
        <div
          className="absolute inset-0 overflow-hidden"
          style={{ left: `${pos}%` }}
        >
          <img
            src={customerSrc || fallback}
            alt="Customer review photo"
            className="absolute inset-0 h-full object-cover"
            style={{ width: `${10000 / pos}%`, left: `${-10000 / pos * (pos / 100)}%`, maxWidth: 'none' }}
            onError={e => { e.target.src = fallback }}
            draggable={false}
          />
        </div>

        {/* ── Labels ── */}
        <div className="absolute top-3 left-3 z-10">
          <span className="text-xs font-semibold px-2 py-1 rounded-full bg-charcoal/80 text-white backdrop-blur-sm">
            📸 Studio
          </span>
        </div>
        <div className="absolute top-3 right-3 z-10">
          <span className="text-xs font-semibold px-2 py-1 rounded-full bg-charcoal/80 text-white backdrop-blur-sm">
            👤 Reality
          </span>
        </div>

        {/* ── Divider handle ── */}
        <div
          className="absolute top-0 z-20 flex items-center justify-center"
          style={{ left: `${pos}%`, width: '3px', height: '100%', transform: 'translateX(-50%)' }}
          onMouseDown={onMouseDown}
          onTouchStart={onTouchStart}
        >
          {/* line */}
          <div className="absolute inset-0 bg-white/90 shadow-lg" />
          {/* circle button */}
          <div
            className={`relative z-10 w-10 h-10 rounded-full bg-white shadow-xl flex items-center justify-center
              transition-transform ${dragging ? 'scale-110' : 'scale-100'}`}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="#1A1A1A" strokeWidth="2.5" className="w-5 h-5">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            <svg viewBox="0 0 24 24" fill="none" stroke="#1A1A1A" strokeWidth="2.5" className="w-5 h-5 -ml-1">
              <polyline points="9 6 15 12 9 18" />
            </svg>
          </div>
        </div>

        {/* ── Range input (transparent overlay for accessibility) ── */}
        <input
          type="range" min={2} max={98} value={pos}
          onChange={e => setPos(Number(e.target.value))}
          className="evr-slider"
          aria-label="Drag to compare studio vs customer photo"
        />
      </div>

      {/* ── Caption bar ── */}
      <div className="flex text-xs font-medium">
        <div className="flex-1 py-2 text-center bg-charcoal text-white">
          Expectation (Listing)
        </div>
        <div className="flex-1 py-2 text-center bg-gold text-charcoal">
          Reality (Customer)
        </div>
      </div>
    </div>
  )
}
