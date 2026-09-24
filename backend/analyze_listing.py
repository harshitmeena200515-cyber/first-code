import json
import io
from urllib.parse import urlparse
import image_engine
from PIL import Image

def detect_platform(url: str) -> str:
    if not url:
        return 'unknown'
    domain = urlparse(url).netloc.lower()
    if 'amazon' in domain:
        return 'amazon'
    elif 'flipkart' in domain:
        return 'flipkart'
    elif 'myntra' in domain:
        return 'myntra'
    return 'unknown'

def get_risk_level(score: float) -> str:
    if score >= 80:
        return 'safe'
    elif score >= 60:
        return 'caution'
    elif score >= 40:
        return 'suspicious'
    return 'dangerous'

def analyze_listing(url=None, title=None, price=None, rating=None, review_count=None, image_url=None, description=None) -> dict:
    score = 100.0
    indicators = []
    
    if price is not None and price < 100:
        score -= 20
        indicators.append({"type": "too_low_price", "severity": "high", "message": "Price anomaly", "detail": "Price is suspiciously low for clothing (<100)."})
        
    if rating is not None and rating > 4.8 and review_count is not None and review_count < 50:
        score -= 15
        indicators.append({"type": "rating_manipulation", "severity": "medium", "message": "Rating manipulation", "detail": "Unusually high rating with few reviews."})
        
    if review_count in [100, 500, 1000]:
        score -= 15
        indicators.append({"type": "review_count_anomaly", "severity": "high", "message": "Review count anomaly", "detail": "Exactly round number of reviews is highly suspicious."})
        
    if title:
        words = title.split()
        if len(words) > 15:
            score -= 10
            indicators.append({"type": "keyword_stuffing", "severity": "low", "message": "Keyword stuffing", "detail": "Title contains too many words (>15)."})
            
    if description:
        if len(description) < 50:
            score -= 10
            indicators.append({"type": "description_quality", "severity": "low", "message": "Poor description", "detail": "Description is too short."})
            
    if image_url:
        exif = image_engine.extract_exif(image_url)
        if not exif.get("has_exif"):
            score -= 10
            indicators.append({"type": "missing_exif", "severity": "medium", "message": "No EXIF data", "detail": "Image lacks camera metadata."})
        if exif.get("is_suspicious"):
            score -= 20
            indicators.append({"type": "suspicious_image_software", "severity": "high", "message": "Edited image", "detail": f"Image software flagged: {exif.get('software')}"})
            
    platform = detect_platform(url) if url else 'unknown'
    if platform == 'unknown' and url:
        score -= 15
        indicators.append({"type": "unknown_platform", "severity": "medium", "message": "Unknown platform", "detail": "URL is not from a recognized platform."})
        
    score = max(0, min(100, score))
    
    recommendation = "Proceed with caution."
    if score >= 80:
        recommendation = "Listing looks safe."
    elif score <= 40:
        recommendation = "Highly suspicious listing, avoid purchasing."
        
    return {
        "risk_score": score,
        "risk_level": get_risk_level(score),
        "indicators": indicators,
        "recommendation": recommendation
    }

def analyze_video_frames(file_path: str):
    results = []
    try:
        with Image.open(file_path) as img:
            frame_idx = 0
            while True:
                if getattr(img, "is_animated", False) and frame_idx % 30 == 0:
                    buf = io.BytesIO()
                    img.convert('RGB').save(buf, format='JPEG')
                    frame_bytes = buf.getvalue()
                    results.append({
                        "frame_index": frame_idx,
                        "phash": image_engine.compute_phash(frame_bytes),
                        "exif": image_engine.extract_exif(frame_bytes)
                    })
                elif not getattr(img, "is_animated", False):
                    buf = io.BytesIO()
                    img.convert('RGB').save(buf, format='JPEG')
                    frame_bytes = buf.getvalue()
                    results.append({
                        "frame_index": 0,
                        "phash": image_engine.compute_phash(frame_bytes),
                        "exif": image_engine.extract_exif(frame_bytes)
                    })
                    break
                
                try:
                    img.seek(img.tell() + 1)
                    frame_idx += 1
                except EOFError:
                    break
    except Exception as e:
        results.append({"error": str(e)})
    return results
