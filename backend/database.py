"""
database.py — SQLAlchemy engine, session factory, and DB initialiser.
"""
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from models import Base

DATABASE_URL = "sqlite:///./fashion.db"

engine       = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    """Create all tables (idempotent)."""
    Base.metadata.create_all(bind=engine)


def seed_db():
    """Populate the database with sample data if it is empty."""
    from seed_data import _build_seed_items
    from models import Product

    db = SessionLocal()
    try:
        if db.query(Product).count() > 0:
            return
        items = _build_seed_items()
        for data in items:
            valid = {c.key for c in Product.__table__.columns}
            filtered = {k: v for k, v in data.items() if k in valid}
            db.add(Product(**filtered))
        db.commit()
        print(f"[SUCCESS] Seeded {len(items)} clothing items")
    except Exception as exc:
        db.rollback()
        print(f"[ERROR] Seeding failed: {exc}")
        raise
    finally:
        db.close()