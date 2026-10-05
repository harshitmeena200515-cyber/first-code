"""
main.py — FastAPI application + all REST endpoints
"""
from __future__ import annotations

import json
import os
import shutil
from pathlib import Path
from typing import Optional


from fastapi import FastAPI, Depends, File, Form, HTTPException, Query, UploadFile, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware

security = HTTPBearer(auto_error=False)
def verify_admin(credentials: HTTPAuthorizationCredentials = Depends(security)):
    if not credentials or credentials.credentials != 'true':  # Uses simple token
        raise HTTPException(status_code=401, detail='Unauthorized')
    return True


from fastapi.staticfiles import StaticFiles
from fastapi.responses import RedirectResponse
from pydantic import BaseModel
from sqlalchemy import func
from sqlalchemy.orm import Session

from database import get_db, init_db, seed_db
from fraud_detection import analyse_product
from image_engine import analyse_review_photo, compute_phash
from models import FlaggedSeller, Product, ReviewPhoto, AnalysisResult, AffiliateClick

import analyze_listing
import affiliate

# ─── App setup ────────────────────────────────────────────────────────────────

app = FastAPI(title="FashionDB API", version="2.0", docs_url="/api/docs")


@app.middleware('http')
async def add_security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers['X-Content-Type-Options'] = 'nosniff'
    response.headers['X-Frame-Options'] = 'DENY'
    response.headers['X-XSS-Protection'] = '1; mode=block'
    return response

app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],
    allow_credentials=False,
    allow_methods=['*'],
    allow_headers=['*'],
)


UPLOAD_DIR = Path(__file__).resolve().parent / "uploads"
UPLOAD_DIR.mkdir(exist_ok=True)
app.mount("/uploads", StaticFiles(directory=str(UPLOAD_DIR)), name="uploads")


@app.on_event("startup")
async def startup():
    init_db()
    seed_db()


# ─── Helpers ──────────────────────────────────────────────────────────────────

SORT_MAP = {
    "price_asc":  Product.price.asc(),
    "price_desc": Product.price.desc(),
    "name_asc":   Product.name.asc(),
    "rating":     Product.rating.desc(),
    "trust":      Product.trust_score.desc(),
    "trend":      Product.trend_score.desc(),
    "popular":    Product.popularity.desc(),
    "newest":     Product.created_at.desc(),
}


def _parse(item: Product) -> dict:
    def j(v): return json.loads(v) if isinstance(v, str) and v.startswith("[") else (v or [])
    orig_price = getattr(item, "original_price", None)
    if (orig_price is None or orig_price <= 0) and item.price:
        orig_price = round(item.price * 1.35)
    return {
        "id": item.id,
        "name": item.name, "gender": item.gender,
        "category": item.category, "subcategory": item.subcategory,
        "style": item.style, "color": item.color, "fabric": item.fabric,
        "season": item.season, "occasion": item.occasion,
        "brand": item.brand, "price": item.price,
        "original_price": orig_price,
        "in_stock": getattr(item, "in_stock", True) if getattr(item, "in_stock", None) is not None else True,
        "description": item.description,
        "image_path": item.image_path, "customer_photo": item.customer_photo,
        "external_link": item.external_link,
        "body_type_suitability": j(item.body_type_suitability),
        "skin_tone_suitability": j(item.skin_tone_suitability),
        "age_group": item.age_group, "comfort_level": item.comfort_level,
        "trend_score": item.trend_score, "popularity": item.popularity,
        "rating": item.rating, "review_count": item.review_count,
        "trust_score": item.trust_score, "is_verified": item.is_verified,
        "styling_tips": j(item.styling_tips),
        "matching_items": j(item.matching_items),
        "dos": j(item.dos), "donts": j(item.donts),
        "created_at": item.created_at.isoformat() if item.created_at else None,
    }


def _save_image(file: UploadFile) -> str:
    if not file or not file.filename:
        return ""
    ext = Path(file.filename).suffix.lower()
    if ext not in ['.jpg', '.jpeg', '.png', '.webp']:
        raise HTTPException(status_code=400, detail='Invalid file format. Only JPG, JPEG, PNG, and WEBP are allowed.')
    name = f"{os.urandom(8).hex()}{ext}"
    dest = UPLOAD_DIR / name
    max_size = 10 * 1024 * 1024  # 10MB
    size = 0
    with open(dest, "wb") as f:
        while chunk := file.file.read(65536):
            size += len(chunk)
            if size > max_size:
                dest.unlink(missing_ok=True)
                raise HTTPException(status_code=400, detail='Image file exceeds 10MB limit.')
            f.write(chunk)
    return f"/uploads/{name}"


# ─── GET /api/clothes ─────────────────────────────────────────────────────────

class LoginReq(BaseModel):
    password: str

@app.post("/api/admin/login")
def admin_login(req: LoginReq):
    correct_password = os.getenv("ADMIN_PASSWORD", "Harshit284147")
    if req.password == correct_password:
        return {"success": True, "token": "true"}
    raise HTTPException(status_code=401, detail="Invalid password")

@app.get("/api/clothes")
def list_clothes(
    gender: Optional[str] = None, category: Optional[str] = None,
    subcategory: Optional[str] = None, style: Optional[str] = None,
    color: Optional[str] = None, brand: Optional[str] = None,
    season: Optional[str] = None, occasion: Optional[str] = None,
    min_price: Optional[float] = None, max_price: Optional[float] = None,
    body_type: Optional[str] = None, skin_tone: Optional[str] = None,
    age_group: Optional[str] = None, min_rating: Optional[float] = None,
    min_trust: Optional[float] = None, q: Optional[str] = None,
    sort: str = "trend", page: int = 1, limit: int = 12,
    db: Session = Depends(get_db),
):
    query = db.query(Product)
    if gender:     query = query.filter(Product.gender == gender)
    if category:   query = query.filter(Product.category == category)
    if subcategory: query = query.filter(Product.subcategory == subcategory)
    if style:      query = query.filter(Product.style == style)
    if color:      query = query.filter(Product.color.ilike(f"%{color}%"))
    if brand:      query = query.filter(Product.brand.ilike(f"%{brand}%"))
    if season:     query = query.filter(Product.season.ilike(f"%{season}%"))
    if occasion:   query = query.filter(Product.occasion.ilike(f"%{occasion}%"))
    if min_price:  query = query.filter(Product.price >= min_price)
    if max_price:  query = query.filter(Product.price <= max_price)
    if body_type:  query = query.filter(Product.body_type_suitability.ilike(f"%{body_type}%"))
    if skin_tone:  query = query.filter(Product.skin_tone_suitability.ilike(f"%{skin_tone}%"))
    if age_group:  query = query.filter(Product.age_group.ilike(f"%{age_group}%"))
    if min_rating: query = query.filter(Product.rating >= min_rating)
    if min_trust:  query = query.filter(Product.trust_score >= min_trust)
    if q:
        term = f"%{q}%"
        query = query.filter(
            Product.name.ilike(term) | Product.brand.ilike(term) |
            Product.description.ilike(term) | Product.subcategory.ilike(term)
        )
    query = query.order_by(SORT_MAP.get(sort, Product.trend_score.desc()))
    total = query.count()
    items = query.offset((page - 1) * limit).limit(limit).all()
    return {"items": [_parse(p) for p in items], "total": total, "page": page,
            "total_pages": max(1, (total + limit - 1) // limit), "limit": limit}


@app.get("/api/clothes/{item_id}")
def get_cloth(item_id: int, db: Session = Depends(get_db)):
    item = db.query(Product).get(item_id)
    if not item:
        raise HTTPException(404, "Item not found")
    return _parse(item)


@app.get("/api/trending")
def trending(gender: Optional[str] = None, limit: int = 8, db: Session = Depends(get_db)):
    q = db.query(Product)
    if gender: q = q.filter(Product.gender == gender)
    return [_parse(p) for p in q.order_by(Product.trend_score.desc()).limit(limit)]


@app.get("/api/new-arrivals")
def new_arrivals(limit: int = 8, db: Session = Depends(get_db)):
    return [_parse(p) for p in db.query(Product).order_by(Product.created_at.desc()).limit(limit)]


@app.get("/api/categories")
def categories(gender: Optional[str] = None, db: Session = Depends(get_db)):
    q = db.query(Product.category, func.count(Product.id).label("count"))
    if gender: q = q.filter(Product.gender == gender)
    return [{"category": r.category, "count": r.count} for r in q.group_by(Product.category)]


@app.get("/api/subcategories")
def subcategories(gender: Optional[str] = None, category: Optional[str] = None, db: Session = Depends(get_db)):
    q = db.query(Product.subcategory, func.count(Product.id).label("count"))
    if gender:   q = q.filter(Product.gender == gender)
    if category: q = q.filter(Product.category == category)
    return [{"subcategory": r.subcategory, "count": r.count}
            for r in q.group_by(Product.subcategory).order_by(func.count(Product.id).desc())]


@app.get("/api/filters")
def filter_options(gender: Optional[str] = None, db: Session = Depends(get_db)):
    q = db.query(Product)
    if gender: q = q.filter(Product.gender == gender)
    items = q.all()
    return {
        "brands":   sorted({p.brand   for p in items if p.brand}),
        "styles":   sorted({p.style   for p in items if p.style}),
        "colors":   sorted({p.color   for p in items if p.color}),
        "seasons":  sorted({p.season  for p in items if p.season}),
        "occasions":sorted({p.occasion for p in items if p.occasion}),
        "fabrics":  sorted({p.fabric  for p in items if p.fabric}),
    }


@app.get("/api/stats")
def stats(db: Session = Depends(get_db)):
    total   = db.query(func.count(Product.id)).scalar() or 0
    in_stock = db.query(func.count(Product.id)).filter(Product.in_stock != False).scalar() or 0
    out_of_stock = total - in_stock
    boys    = db.query(func.count(Product.id)).filter(Product.gender == "boys").scalar() or 0
    girls   = db.query(func.count(Product.id)).filter(Product.gender == "girls").scalar() or 0
    avg_p   = db.query(func.avg(Product.price)).scalar()
    avg_t   = db.query(func.avg(Product.trust_score)).scalar()
    verified = db.query(func.count(Product.id)).filter(Product.is_verified == True).scalar() or 0
    flagged  = db.query(func.count(FlaggedSeller.id)).scalar() or 0
    by_cat  = db.query(Product.category, func.count(Product.id)).group_by(Product.category).all()
    brands  = db.query(Product.brand, func.count(Product.id)).group_by(Product.brand).order_by(func.count(Product.id).desc()).limit(10).all()
    return {
        "total": total, "in_stock": in_stock, "out_of_stock": out_of_stock,
        "categories_count": len(by_cat),
        "boys": boys, "girls": girls,
        "avg_price": round(avg_p or 0, 2), "avg_trust": round(avg_t or 0, 1),
        "verified": verified, "flagged": flagged,
        "by_category": [{"category": r[0], "count": r[1]} for r in by_cat],
        "top_brands":  [{"brand": r[0], "count": r[1]} for r in brands],
    }


# ─── AI Recommendations ───────────────────────────────────────────────────────

class RecommendReq(BaseModel):
    gender:    Optional[str] = None
    body_type: Optional[str] = None
    skin_tone: Optional[str] = None
    occasion:  Optional[str] = None
    season:    Optional[str] = None
    budget:    Optional[float] = None
    age_group: Optional[str] = None
    style:     Optional[str] = None
    min_trust: float = 55


@app.post("/api/recommend")
def recommend(req: RecommendReq, db: Session = Depends(get_db)):
    q = db.query(Product)
    if req.gender:    q = q.filter(Product.gender == req.gender)
    if req.body_type: q = q.filter(Product.body_type_suitability.ilike(f"%{req.body_type}%"))
    if req.skin_tone: q = q.filter(Product.skin_tone_suitability.ilike(f"%{req.skin_tone}%"))
    if req.occasion:  q = q.filter(Product.occasion.ilike(f"%{req.occasion}%"))
    if req.season:    q = q.filter(Product.season.ilike(f"%{req.season}%"))
    if req.budget:    q = q.filter(Product.price <= req.budget)
    if req.age_group: q = q.filter(Product.age_group.ilike(f"%{req.age_group}%"))
    if req.style:     q = q.filter(Product.style == req.style)
    q = q.filter(Product.trust_score >= req.min_trust)
    items = q.order_by(Product.trust_score.desc(), Product.trend_score.desc()).limit(12).all()
    return [_parse(p) for p in items]


# ─── Image analysis ───────────────────────────────────────────────────────────

@app.post("/api/analyze-image")
async def analyze_image(
    image_url: str = Form(...),
    product_id: Optional[int] = Form(None),
    db: Session = Depends(get_db),
):
    studio_phash = None
    if product_id:
        prod = db.query(Product).get(product_id)
        if prod and prod.image_path:
            studio_phash = compute_phash(prod.image_path)
    return analyse_review_photo(image_url, studio_phash)


@app.post("/api/fraud-analyze/{product_id}")
def fraud_analyze(product_id: int, db: Session = Depends(get_db)):
    prod = db.query(Product).get(product_id)
    if not prod:
        raise HTTPException(404)
    photos = db.query(ReviewPhoto).filter(ReviewPhoto.product_id == product_id).all()
    suspicious = sum(1 for p in photos if p.is_suspicious)
    result = analyse_product({
        "rating": prod.rating, "review_count": prod.review_count,
        "reviews_with_photos": len(photos), "suspicious_images": suspicious,
        "spike_events": 0, "missing_exif_count": sum(1 for p in photos if not p.camera_model),
    })
    prod.trust_score = result["trust_score"]
    db.commit()
    return result


# ─── CRUD ─────────────────────────────────────────────────────────────────────

@app.post("/api/clothes", status_code=201, dependencies=[Depends(verify_admin)])
async def create_cloth(
    name: str = Form(...),
    category: str = Form(...),
    price: float = Form(0),
    original_price: Optional[float] = Form(None),
    in_stock: Optional[bool] = Form(True),
    gender: Optional[str] = Form("unisex"),
    subcategory: Optional[str] = Form(None),
    brand: Optional[str] = Form("Fashion Brand"),
    description: Optional[str] = Form(""),
    image_path: Optional[str] = Form(None),
    customer_photo: Optional[str] = Form(None),
    external_link: Optional[str] = Form(None),
    style: Optional[str] = Form("Casual"),
    color: Optional[str] = Form(None),
    fabric: Optional[str] = Form(None),
    season: Optional[str] = Form("All-Season"),
    occasion: Optional[str] = Form("Casual"),
    body_type_suitability: str = Form("[]"),
    skin_tone_suitability: str = Form("[]"),
    age_group: Optional[str] = Form("All"),
    comfort_level: str = Form("High"),
    trend_score: float = Form(75.0),
    popularity: float = Form(70.0),
    rating: float = Form(4.5),
    review_count: int = Form(12),
    trust_score: float = Form(85.0),
    styling_tips: str = Form("[]"),
    matching_items: str = Form("[]"),
    dos: str = Form("[]"),
    donts: str = Form("[]"),
    image: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
):
    clean_name = (name or "").strip()
    if not clean_name:
        raise HTTPException(status_code=400, detail="Product name is required.")
    if price < 0:
        raise HTTPException(status_code=400, detail="Price cannot be negative.")
    if original_price is not None and original_price < 0:
        raise HTTPException(status_code=400, detail="Original price cannot be negative.")

    # Image handling: Upload file has precedence, then image_path URL string
    img = None
    if image and image.filename:
        img = _save_image(image)
    elif image_path and image_path.strip():
        img = image_path.strip()

    clean_category = (category or "upperwear").strip().lower()
    clean_subcat = (subcategory or clean_category).strip()

    if original_price is None or original_price == 0:
        original_price = round(price * 1.35) if price > 0 else 0

    prod = Product(
        name=clean_name, gender=(gender or "unisex").strip().lower(),
        category=clean_category, subcategory=clean_subcat,
        style=style or "Casual", color=color, fabric=fabric,
        season=season or "All-Season", occasion=occasion or "Casual",
        brand=(brand or "Fashion Brand").strip(),
        price=float(price), original_price=float(original_price),
        in_stock=bool(in_stock) if in_stock is not None else True,
        description=description or "",
        image_path=img, customer_photo=customer_photo or img,
        external_link=external_link,
        body_type_suitability=body_type_suitability, skin_tone_suitability=skin_tone_suitability,
        age_group=age_group or "All", comfort_level=comfort_level or "High",
        trend_score=trend_score, popularity=popularity,
        rating=rating, review_count=review_count, trust_score=trust_score,
        is_verified=True,
        styling_tips=styling_tips, matching_items=matching_items, dos=dos, donts=donts,
    )
    db.add(prod)
    db.commit()
    db.refresh(prod)
    return _parse(prod)


@app.put("/api/clothes/{item_id}", dependencies=[Depends(verify_admin)])
async def update_cloth(
    item_id: int,
    name: Optional[str] = Form(None),
    gender: Optional[str] = Form(None),
    category: Optional[str] = Form(None),
    subcategory: Optional[str] = Form(None),
    style: Optional[str] = Form(None),
    color: Optional[str] = Form(None),
    fabric: Optional[str] = Form(None),
    season: Optional[str] = Form(None),
    occasion: Optional[str] = Form(None),
    brand: Optional[str] = Form(None),
    price: Optional[float] = Form(None),
    original_price: Optional[float] = Form(None),
    in_stock: Optional[bool] = Form(None),
    description: Optional[str] = Form(None),
    image_path: Optional[str] = Form(None),
    customer_photo: Optional[str] = Form(None),
    external_link: Optional[str] = Form(None),
    body_type_suitability: Optional[str] = Form(None),
    skin_tone_suitability: Optional[str] = Form(None),
    age_group: Optional[str] = Form(None),
    comfort_level: Optional[str] = Form(None),
    trend_score: Optional[float] = Form(None),
    popularity: Optional[float] = Form(None),
    rating: Optional[float] = Form(None),
    review_count: Optional[int] = Form(None),
    trust_score: Optional[float] = Form(None),
    styling_tips: Optional[str] = Form(None),
    matching_items: Optional[str] = Form(None),
    dos: Optional[str] = Form(None),
    donts: Optional[str] = Form(None),
    image: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
):
    prod = db.query(Product).get(item_id)
    if not prod:
        raise HTTPException(status_code=404, detail="Product not found")

    if price is not None and price < 0:
        raise HTTPException(status_code=400, detail="Price cannot be negative.")
    if original_price is not None and original_price < 0:
        raise HTTPException(status_code=400, detail="Original price cannot be negative.")

    # Safe Image Update:
    # 1. New file upload replaces image
    # 2. Or valid non-empty URL string replaces image
    # 3. Otherwise existing image is preserved!
    if image and image.filename:
        prod.image_path = _save_image(image)
    elif image_path is not None and image_path.strip() != "":
        prod.image_path = image_path.strip()

    if name is not None and name.strip() != "":
        prod.name = name.strip()
    if gender is not None and gender.strip() != "":
        prod.gender = gender.strip().lower()
    if category is not None and category.strip() != "":
        prod.category = category.strip().lower()
    if subcategory is not None and subcategory.strip() != "":
        prod.subcategory = subcategory.strip()
    if price is not None:
        prod.price = float(price)
    if original_price is not None:
        prod.original_price = float(original_price)
    if in_stock is not None:
        prod.in_stock = bool(in_stock)
    if description is not None:
        prod.description = description
    if brand is not None and brand.strip() != "":
        prod.brand = brand.strip()
    if external_link is not None:
        prod.external_link = external_link.strip()
    if customer_photo is not None and customer_photo.strip() != "":
        prod.customer_photo = customer_photo.strip()
    if style is not None and style.strip() != "":
        prod.style = style.strip()
    if color is not None and color.strip() != "":
        prod.color = color.strip()
    if fabric is not None and fabric.strip() != "":
        prod.fabric = fabric.strip()
    if season is not None and season.strip() != "":
        prod.season = season.strip()
    if occasion is not None and occasion.strip() != "":
        prod.occasion = occasion.strip()
    if body_type_suitability is not None:
        prod.body_type_suitability = body_type_suitability
    if skin_tone_suitability is not None:
        prod.skin_tone_suitability = skin_tone_suitability
    if age_group is not None:
        prod.age_group = age_group
    if comfort_level is not None:
        prod.comfort_level = comfort_level
    if trend_score is not None:
        prod.trend_score = float(trend_score)
    if popularity is not None:
        prod.popularity = float(popularity)
    if rating is not None:
        prod.rating = float(rating)
    if review_count is not None:
        prod.review_count = int(review_count)
    if trust_score is not None:
        prod.trust_score = float(trust_score)

    db.commit()
    db.refresh(prod)
    return _parse(prod)


@app.patch("/api/clothes/{item_id}/toggle-stock", dependencies=[Depends(verify_admin)])
def toggle_stock(item_id: int, db: Session = Depends(get_db)):
    prod = db.query(Product).get(item_id)
    if not prod:
        raise HTTPException(status_code=404, detail="Product not found")
    cur_stock = getattr(prod, "in_stock", True)
    prod.in_stock = not (cur_stock if cur_stock is not None else True)
    db.commit()
    db.refresh(prod)
    return {"success": True, "in_stock": prod.in_stock, "product": _parse(prod)}


@app.delete("/api/clothes/{item_id}", dependencies=[Depends(verify_admin)])
def delete_cloth(item_id: int, db: Session = Depends(get_db)):
    prod = db.query(Product).get(item_id)
    if not prod: raise HTTPException(404)
    if prod.image_path and prod.image_path.startswith("/uploads/"):
        p = Path(prod.image_path[1:])
        if p.exists(): p.unlink(missing_ok=True)
    db.delete(prod); db.commit()
    return {"success": True}


# ─── Review photos ────────────────────────────────────────────────────────────

@app.get("/api/clothes/{product_id}/reviews")
def get_reviews(product_id: int, db: Session = Depends(get_db)):
    photos = db.query(ReviewPhoto).filter(ReviewPhoto.product_id == product_id).all()
    return [{"id": p.id, "image_url": p.image_url, "phash_string": p.phash_string,
             "camera_model": p.camera_model, "software_used": p.software_used,
             "is_suspicious": p.is_suspicious, "is_duplicate": p.is_duplicate,
             "hamming_distance": p.hamming_distance} for p in photos]


# ─── Analytics & Affiliate ───────────────────────────────────────────────────

class AnalyzeReq(BaseModel):
    url: Optional[str] = None
    title: Optional[str] = None
    price: Optional[float] = None
    rating: Optional[float] = None
    review_count: Optional[int] = None
    image_url: Optional[str] = None
    description: Optional[str] = None


@app.post("/api/analyze-listing")
def analyze_listing_endpoint(
    req: AnalyzeReq,
    db: Session = Depends(get_db)
):
    result = analyze_listing.analyze_listing(
        url=req.url,
        title=req.title,
        price=req.price,
        rating=req.rating,
        review_count=req.review_count,
        image_url=req.image_url,
        description=req.description
    )
    
    db_record = AnalysisResult(
        url=req.url,
        platform=analyze_listing.detect_platform(req.url) if req.url else 'unknown',
        risk_score=result['risk_score'],
        indicators=json.dumps(result['indicators']),
        thumbnail_url=req.image_url,
        product_title=req.title
    )
    db.add(db_record)
    db.commit()
    db.refresh(db_record)
    
    return result


@app.post("/api/analyze-video")
def analyze_video_endpoint(
    video: UploadFile = File(...),
):
    path = _save_image(video)
    local_path = UPLOAD_DIR / Path(path).name
    return analyze_listing.analyze_video_frames(str(local_path))


@app.get("/api/analysis-history")
def get_analysis_history(page: int = 1, limit: int = 10, db: Session = Depends(get_db)):
    query = db.query(AnalysisResult).order_by(AnalysisResult.analyzed_at.desc())
    total = query.count()
    items = query.offset((page - 1) * limit).limit(limit).all()
    return {
        "items": [{
            "id": i.id,
            "url": i.url,
            "platform": i.platform,
            "risk_score": i.risk_score,
            "indicators": json.loads(i.indicators) if i.indicators else [],
            "thumbnail_url": i.thumbnail_url,
            "product_title": i.product_title,
            "analyzed_at": i.analyzed_at.isoformat() if i.analyzed_at else None
        } for i in items],
        "total": total,
        "page": page,
        "limit": limit
    }


@app.get("/api/affiliate/redirect/{product_id}")
def affiliate_redirect(product_id: int, request: Request, db: Session = Depends(get_db)):
    prod = db.query(Product).get(product_id)
    if not prod or not prod.external_link:
        raise HTTPException(status_code=404, detail="Product or external link not found")
        
    platform = affiliate.detect_platform_from_url(prod.external_link)
    
    affiliate.log_affiliate_click(
        db=db,
        product_id=product_id,
        platform=platform,
        user_agent=request.headers.get("user-agent", ""),
        referrer=request.headers.get("referer", "")
    )
    
    redirect_url = affiliate.generate_affiliate_link(prod.external_link, platform)
    return RedirectResponse(url=redirect_url)


@app.get("/api/affiliate/stats")
def affiliate_stats(db: Session = Depends(get_db)):
    from datetime import datetime, timedelta
    
    total = db.query(func.count(AffiliateClick.id)).scalar()
    
    seven_days_ago = datetime.utcnow() - timedelta(days=7)
    last_7_days = db.query(func.count(AffiliateClick.id)).filter(AffiliateClick.clicked_at >= seven_days_ago).scalar()
    
    by_platform = db.query(AffiliateClick.platform, func.count(AffiliateClick.id)).group_by(AffiliateClick.platform).all()
    
    return {
        "total_clicks": total,
        "last_7_days": last_7_days,
        "by_platform": [{"platform": r[0], "count": r[1]} for r in by_platform]
    }


class ImportURLRequest(BaseModel):
    url: str
    gender: Optional[str] = None


@app.post("/api/admin/import-url")
def import_product_url(
    payload: ImportURLRequest,
    db: Session = Depends(get_db),
    authorized: bool = Depends(verify_admin)
):
    try:
        from product_importer import fetch_and_parse_product
        data = fetch_and_parse_product(payload.url, override_gender=payload.gender)
        
        # Check if product already exists with same external_link
        existing = db.query(Product).filter(Product.external_link == data["external_link"]).first()
        if existing:
            return {"status": "exists", "product": _parse(existing), "message": "Product already exists in catalogue"}
            
        prod = Product(
            name=data["name"],
            gender=data["gender"],
            category=data["category"],
            subcategory=data["subcategory"],
            style=data["style"],
            color=data["color"],
            fabric=data["fabric"],
            season=data["season"],
            occasion=data["occasion"],
            brand=data["brand"],
            price=data["price"],
            description=data["description"],
            image_path=data["image_path"],
            customer_photo=data.get("customer_photo") or data["image_path"],
            external_link=data["external_link"],
            body_type_suitability=json.dumps(data.get("body_type_suitability", ["All"])),
            skin_tone_suitability=json.dumps(data.get("skin_tone_suitability", ["All"])),
            age_group=data.get("age_group", "All"),
            comfort_level=data.get("comfort_level", "High"),
            trend_score=data.get("trend_score", 90.0),
            popularity=data.get("popularity", 85.0),
            rating=data.get("rating", 4.5),
            review_count=data.get("review_count", 100),
            trust_score=data.get("trust_score", 85.0),
            is_verified=True,
            styling_tips=json.dumps(data.get("styling_tips", [])),
            matching_items=json.dumps(data.get("matching_items", [])),
            dos=json.dumps(data.get("dos", [])),
            donts=json.dumps(data.get("donts", []))
        )
        db.add(prod)
        db.commit()
        db.refresh(prod)
        return {"status": "success", "product": _parse(prod), "message": "Product successfully imported and added to catalogue!"}
    except Exception as e:
        logger.error(f"Error importing product from URL: {e}")
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
