"""
Fraud Detection Engine
======================
Trust_Score = (Rating × Image_Ratio × 20) − Spike_Penalty − Image_Penalty − EXIF_Penalty

Detects:
  • Sudden 5-star review spikes within a 3-day window
  • Suspiciously edited / duplicate review images (from image_engine)
  • Missing EXIF metadata patterns
"""
from __future__ import annotations

from datetime import datetime, timedelta
from typing import Any

# ─── Constants ────────────────────────────────────────────────────────────────

SPIKE_WINDOW_DAYS   = 3      # rolling window to detect review bursts
SPIKE_THRESHOLD     = 5      # min reviews in window to count as a spike
SPIKE_PENALTY       = 15     # score deducted per spike event
IMAGE_PENALTY_EACH  = 5      # per suspicious review image
MAX_EXIF_PENALTY    = 15     # cap on EXIF-missing penalty
MIN_SCORE           = 0
MAX_SCORE           = 100


# ─── Core functions ───────────────────────────────────────────────────────────

def image_ratio(total_reviews: int, reviews_with_photos: int) -> float:
    """Fraction of reviews that include a photo (capped at 1.0)."""
    if total_reviews <= 0:
        return 0.0
    return min(reviews_with_photos / total_reviews, 1.0)


def detect_rating_spikes(
    review_timestamps: list[datetime],
    min_rating: float = 4.5,
) -> dict[str, Any]:
    """
    Slide a SPIKE_WINDOW_DAYS window over sorted timestamps and count
    windows with ≥ SPIKE_THRESHOLD reviews.

    Returns
    -------
    dict  has_spike, spike_count, spike_windows (list of dicts)
    """
    if not review_timestamps:
        return {"has_spike": False, "spike_count": 0, "spike_windows": []}

    timestamps = sorted(review_timestamps)
    spikes: list[dict] = []
    seen_starts: set[str] = set()

    for i, ts in enumerate(timestamps):
        window_end = ts + timedelta(days=SPIKE_WINDOW_DAYS)
        count = sum(1 for t in timestamps[i:] if t <= window_end)
        ts_key = ts.isoformat()
        if count >= SPIKE_THRESHOLD and ts_key not in seen_starts:
            spikes.append({
                "start": ts.isoformat(),
                "end": window_end.isoformat(),
                "count": count,
            })
            seen_starts.add(ts_key)

    return {
        "has_spike":     len(spikes) > 0,
        "spike_count":   len(spikes),
        "spike_windows": spikes[:5],
    }


def calculate_trust_score(
    rating: float,
    total_reviews: int,
    reviews_with_photos: int,
    suspicious_image_count: int = 0,
    spike_events: int = 0,
    missing_exif_ratio: float = 0.0,
) -> dict[str, Any]:
    """
    Main scoring formula.

    Base = Rating (0-5) × Image_Ratio (0-1) × 20  → max 100
    Deductions:
        • SPIKE_PENALTY per spike event
        • IMAGE_PENALTY_EACH per suspicious review image
        • up to MAX_EXIF_PENALTY for missing EXIF
    """
    img_ratio   = image_ratio(total_reviews, reviews_with_photos)
    base        = rating * img_ratio * 20
    spike_pen   = spike_events * SPIKE_PENALTY
    image_pen   = suspicious_image_count * IMAGE_PENALTY_EACH
    exif_pen    = min(missing_exif_ratio * MAX_EXIF_PENALTY, MAX_EXIF_PENALTY)

    score = max(MIN_SCORE, min(MAX_SCORE, base - spike_pen - image_pen - exif_pen))

    if score >= 80:
        level, label = "high",     "✅ Verified Trustworthy"
    elif score >= 60:
        level, label = "medium",   "🔍 Mostly Trustworthy"
    elif score >= 40:
        level, label = "low",      "⚠️ Use Caution"
    else:
        level, label = "very_low", "🚨 Likely Fake Reviews"

    return {
        "trust_score":  round(score, 1),
        "trust_level":  level,
        "trust_label":  label,
        "breakdown": {
            "base_score":   round(base, 1),
            "image_ratio":  round(img_ratio, 2),
            "spike_penalty": spike_pen,
            "image_penalty": image_pen,
            "exif_penalty":  round(exif_pen, 1),
        },
    }


def analyse_product(product_data: dict[str, Any]) -> dict[str, Any]:
    """
    Full fraud analysis for one product.

    Parameters
    ----------
    product_data : dict
        rating, review_count, reviews_with_photos,
        suspicious_images, spike_events, missing_exif_count
    """
    rating              = float(product_data.get("rating", 0))
    total               = int(product_data.get("review_count", 0))
    with_photos         = int(product_data.get("reviews_with_photos", 0))
    suspicious_imgs     = int(product_data.get("suspicious_images", 0))
    spikes              = int(product_data.get("spike_events", 0))
    missing_exif        = int(product_data.get("missing_exif_count", 0))
    missing_exif_ratio  = missing_exif / max(with_photos, 1)

    result = calculate_trust_score(
        rating, total, with_photos,
        suspicious_imgs, spikes, missing_exif_ratio,
    )

    # Build human-readable flags
    flags: list[str] = []
    if spikes:
        flags.append(f"⚠️ {spikes} suspicious rating spike(s) in 3-day windows")
    if suspicious_imgs:
        flags.append(f"⚠️ {suspicious_imgs} edited / duplicate review photo(s)")
    if total and with_photos / total < 0.1:
        flags.append("⚠️ Fewer than 10 % of reviews include photos")
    if rating > 4.7 and total < 50:
        flags.append("⚠️ Suspiciously high rating with very few reviews")
    if missing_exif_ratio > 0.5:
        flags.append("⚠️ Most review photos lack EXIF camera data")

    recommendations = {
        "high":     ["✅ Product appears genuine", "✅ Reviews look authentic"],
        "medium":   ["🔍 Check the most recent reviews carefully", "📸 Prioritise reviews with photos"],
        "low":      ["⚠️ Compare this listing with other sellers", "⚠️ Review the return policy before buying"],
        "very_low": ["🚨 High risk of fake reviews — avoid this listing", "🚨 Search for the same product on other platforms"],
    }.get(result["trust_level"], [])

    return {**result, "flags": flags, "recommendations": recommendations}
