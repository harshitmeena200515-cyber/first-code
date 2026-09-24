"""
Image Engine
============
Perceptual hashing (pHash) via imagehash + PIL EXIF analysis.
Used to detect duplicate / edited review images and flag suspicious sellers.
"""
from __future__ import annotations

import logging
from io import BytesIO
from typing import Optional

import imagehash
import requests
from PIL import Image, ExifTags

logger = logging.getLogger(__name__)

_HEADERS = {"User-Agent": "Mozilla/5.0 (FashionBot/2.0)"}
_TIMEOUT  = 6          # seconds per HTTP request
_HAMMING_THRESHOLD = 10  # images within this distance are "duplicates"

SUSPICIOUS_SW = {
    "photoshop", "canva", "lightroom", "gimp", "snapseed",
    "facetune", "meitu", "picsart", "vsco",
}


# ─── Helpers ──────────────────────────────────────────────────────────────────

def _open_from_url(url: str) -> Optional[Image.Image]:
    try:
        r = requests.get(url, timeout=_TIMEOUT, headers=_HEADERS)
        r.raise_for_status()
        return Image.open(BytesIO(r.content))
    except Exception as exc:
        logger.warning("Could not open image %s: %s", url, exc)
        return None


def _open_from_bytes(data: bytes) -> Optional[Image.Image]:
    try:
        return Image.open(BytesIO(data))
    except Exception as exc:
        logger.warning("Could not open image from bytes: %s", exc)
        return None


# ─── Public API ───────────────────────────────────────────────────────────────

def compute_phash(source: str | bytes) -> Optional[str]:
    """
    Compute a 64-bit perceptual hash (pHash) for an image.

    Parameters
    ----------
    source : str | bytes
        Either an image URL or raw image bytes.

    Returns
    -------
    str | None
        16-char hex string, or None on failure.
    """
    img = _open_from_url(source) if isinstance(source, str) else _open_from_bytes(source)
    if img is None:
        return None
    try:
        return str(imagehash.phash(img))
    except Exception as exc:
        logger.warning("pHash computation failed: %s", exc)
        return None


def hamming_distance(hash1: str, hash2: str) -> int:
    """Compute Hamming distance between two pHash hex strings."""
    try:
        return imagehash.hex_to_hash(hash1) - imagehash.hex_to_hash(hash2)
    except Exception:
        return 999


def is_duplicate(hash1: str, hash2: str) -> tuple[bool, int]:
    """Return (is_duplicate, distance)."""
    dist = hamming_distance(hash1, hash2)
    return dist < _HAMMING_THRESHOLD, dist


def extract_exif(source: str | bytes) -> dict:
    """
    Extract EXIF metadata and flag suspicious editing software.

    Returns
    -------
    dict with keys:
        has_exif, camera_model, software, is_suspicious, flags
    """
    result: dict = {
        "has_exif": False,
        "camera_model": None,
        "software": None,
        "is_suspicious": False,
        "flags": [],
    }

    img = _open_from_url(source) if isinstance(source, str) else _open_from_bytes(source)
    if img is None:
        result["flags"].append("image_load_failed")
        result["is_suspicious"] = True
        return result

    try:
        raw_exif = img._getexif()  # type: ignore[attr-defined]
    except AttributeError:
        raw_exif = None

    if not raw_exif:
        result["flags"].append("no_exif_data")
        result["is_suspicious"] = True
        return result

    result["has_exif"] = True
    tags = {ExifTags.TAGS.get(k, k): v for k, v in raw_exif.items()}

    # Camera model
    result["camera_model"] = (
        tags.get("Model") or tags.get("Make") or tags.get("LensMake")
    )
    if not result["camera_model"]:
        result["flags"].append("no_camera_model")
        result["is_suspicious"] = True

    # Software
    sw = str(tags.get("Software", "")).lower()
    result["software"] = tags.get("Software")
    for sus in SUSPICIOUS_SW:
        if sus in sw:
            result["is_suspicious"] = True
            result["flags"].append(f"edited_with_{sus}")
            break

    return result


def analyse_review_photo(
    review_url: str,
    studio_phash: Optional[str] = None,
) -> dict:
    """
    Full analysis pipeline for a single customer review photo.

    Returns
    -------
    dict
        phash, is_duplicate, hamming_distance, exif, trust_contribution (0-100)
    """
    result: dict = {
        "phash": None,
        "is_duplicate": False,
        "hamming_distance": None,
        "exif": {},
        "trust_contribution": 100,
    }

    # 1. Perceptual hash
    result["phash"] = compute_phash(review_url)

    # 2. Duplicate check against studio photo
    if result["phash"] and studio_phash:
        dup, dist = is_duplicate(result["phash"], studio_phash)
        result["is_duplicate"]      = dup
        result["hamming_distance"]  = dist
        if dup:
            result["trust_contribution"] -= 40  # copied listing image penalty

    # 3. EXIF analysis
    exif = extract_exif(review_url)
    result["exif"] = exif
    if exif["is_suspicious"]:
        result["trust_contribution"] -= 20
    if not exif["has_exif"]:
        result["trust_contribution"] -= 10

    result["trust_contribution"] = max(0, result["trust_contribution"])
    return result
