from sqlalchemy import Column, Integer, String, Float, Text, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship, DeclarativeBase
from datetime import datetime


class Base(DeclarativeBase):
    pass


class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)

    # Core identity
    name          = Column(String(200), nullable=False, index=True)
    gender        = Column(String(10), nullable=False, index=True)   # boys | girls
    category      = Column(String(50), nullable=False, index=True)   # upperwear | lowerwear | footwear | headwear | accessories
    subcategory   = Column(String(80), nullable=False, index=True)   # T-Shirt | Jeans | Sneakers …

    # Fashion attributes
    style         = Column(String(80))    # Casual | Formal | Sporty | Streetwear | Traditional
    color         = Column(String(80))
    fabric        = Column(String(80))
    season        = Column(String(80))    # Summer | Winter | All-Season …
    occasion      = Column(String(120))   # Casual | Party | Office | Wedding …

    # Commerce
    brand         = Column(String(80), index=True)
    price         = Column(Float, default=0.0)
    description   = Column(Text)
    image_path    = Column(Text)          # Studio/listing photo URL
    customer_photo = Column(Text)         # Customer review photo (for E-vs-R slider)
    external_link = Column(Text)          # Flipkart / Amazon link

    # Fashion intelligence
    body_type_suitability  = Column(Text, default="[]")   # JSON list
    skin_tone_suitability  = Column(Text, default="[]")   # JSON list
    age_group              = Column(String(40))            # Teen | Young Adult | Adult | All
    comfort_level          = Column(String(20), default="Medium")
    trend_score            = Column(Float, default=70.0)   # 0-100
    popularity             = Column(Float, default=50.0)   # 0-100

    # Ratings & trust
    rating         = Column(Float, default=4.0)
    review_count   = Column(Integer, default=0)
    trust_score    = Column(Float, default=75.0)   # 0-100, computed
    is_verified    = Column(Boolean, default=False)

    # Educational content (stored as JSON strings)
    styling_tips   = Column(Text, default="[]")
    matching_items = Column(Text, default="[]")
    dos            = Column(Text, default="[]")
    donts          = Column(Text, default="[]")

    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    review_photos  = relationship("ReviewPhoto", back_populates="product", cascade="all, delete-orphan")
    flagged_sellers = relationship("FlaggedSeller", back_populates="product", cascade="all, delete-orphan")


class ReviewPhoto(Base):
    """Stores customer-submitted review photos with authenticity metadata."""
    __tablename__ = "review_photos"

    id             = Column(Integer, primary_key=True, autoincrement=True)
    product_id     = Column(Integer, ForeignKey("products.id"), nullable=False, index=True)

    image_url      = Column(Text, nullable=False)
    phash_string   = Column(String(64))   # 16-char hex perceptual hash
    camera_model   = Column(String(120))  # From EXIF IFD
    software_used  = Column(String(120))  # Photoshop / Canva / Lightroom flag
    is_suspicious  = Column(Boolean, default=False)
    is_duplicate   = Column(Boolean, default=False)
    hamming_distance = Column(Integer)    # Distance from studio photo pHash

    uploaded_at = Column(DateTime, default=datetime.utcnow)

    product = relationship("Product", back_populates="review_photos")


class FlaggedSeller(Base):
    """Products / sellers flagged by the fraud detection engine."""
    __tablename__ = "flagged_sellers"

    id                    = Column(Integer, primary_key=True, autoincrement=True)
    product_id            = Column(Integer, ForeignKey("products.id"), nullable=False, index=True)
    seller_name           = Column(String(120))
    reason                = Column(String(120))   # rating_spike | duplicate_images | missing_exif
    suspicious_spike_count = Column(Integer, default=0)
    flagged_at            = Column(DateTime, default=datetime.utcnow)
    is_resolved           = Column(Boolean, default=False)

    product = relationship("Product", back_populates="flagged_sellers")


class AnalysisResult(Base):
    __tablename__ = "analysis_results"

    id = Column(Integer, primary_key=True, autoincrement=True)
    url = Column(Text)
    platform = Column(String(50))
    risk_score = Column(Float, default=50.0)
    indicators = Column(Text, default="[]")
    thumbnail_url = Column(Text)
    product_title = Column(String(300))
    analyzed_at = Column(DateTime, default=datetime.utcnow)


class AffiliateClick(Base):
    __tablename__ = "affiliate_clicks"

    id = Column(Integer, primary_key=True, autoincrement=True)
    product_id = Column(Integer, ForeignKey("products.id"), index=True)
    platform = Column(String(50))
    clicked_at = Column(DateTime, default=datetime.utcnow)
    user_agent = Column(Text)
    referrer = Column(Text)
