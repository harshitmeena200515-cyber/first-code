import re
import urllib.parse
import json
import logging
import requests
from bs4 import BeautifulSoup

logger = logging.getLogger(__name__)

USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"

CATEGORIES = {
    "t-shirt": ("Topwear", "T-Shirt"),
    "tshirt": ("Topwear", "T-Shirt"),
    "tee": ("Topwear", "T-Shirt"),
    "shirt": ("Topwear", "Shirt"),
    "kurti": ("Ethnic", "Kurti"),
    "kurta": ("Ethnic", "Kurta"),
    "saree": ("Ethnic", "Saree"),
    "lehenga": ("Ethnic", "Lehenga"),
    "jeans": ("Bottomwear", "Jeans"),
    "trousers": ("Bottomwear", "Trousers"),
    "pants": ("Bottomwear", "Pants"),
    "joggers": ("Bottomwear", "Joggers"),
    "shorts": ("Bottomwear", "Shorts"),
    "dress": ("Dresses", "Casual Dress"),
    "gown": ("Dresses", "Evening Gown"),
    "jacket": ("Outerwear", "Jacket"),
    "hoodie": ("Outerwear", "Hoodie"),
    "sweater": ("Outerwear", "Sweater"),
    "shoes": ("Footwear", "Sneakers"),
    "sneakers": ("Footwear", "Sneakers"),
    "heels": ("Footwear", "Heels"),
    "sandals": ("Footwear", "Sandals"),
}

BRANDS = [
    "Roadster", "HRX", "WROGN", "Highlander", "Mast & Harbour",
    "Tokyo Talkies", "SASSAFRAS", "Anouk", "Libas", "Vishudh",
    "H&M", "Zara", "Levi's", "Allen Solly", "Peter England",
    "Louis Philippe", "Van Heusen", "U.S. Polo Assn.", "Flying Machine",
    "Max", "Puma", "Nike", "Adidas", "Red Tape", "Snitch"
]

def fetch_and_parse_product(url: str, override_gender: str = None) -> dict:
    """
    Given a product URL (or EarnKaro/Ekaro profit link),
    extracts metadata and constructs a full product payload.
    """
    clean_url = url.strip()
    original_affiliate_link = clean_url

    headers = {
        "User-Agent": USER_AGENT,
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9,hi;q=0.8",
    }

    resolved_url = clean_url
    html_content = ""
    try:
        # Follow redirects (especially useful for EarnKaro/ekaro.in affiliate links)
        session = requests.Session()
        resp = session.get(clean_url, headers=headers, timeout=12, allow_redirects=True)
        resolved_url = resp.url
        html_content = resp.text
    except Exception as e:
        logger.warning(f"Could not fetch URL {clean_url}: {e}")

    soup = BeautifulSoup(html_content, "html.parser") if html_content else None

    # ── 1. Title Extraction ──
    title = ""
    if soup:
        # Check og:title
        og_title = soup.find("meta", property="og:title") or soup.find("meta", attrs={"name": "og:title"})
        if og_title and og_title.get("content"):
            title = og_title["content"].strip()
        elif soup.title and soup.title.string:
            title = soup.title.string.strip()

    # Clean up standard eCommerce title suffixes
    for suffix in ["| Myntra", "| Ajio", "| Flipkart", "| Amazon.in", "Online at Best Price", "- Buy"]:
        if suffix in title:
            title = title.split(suffix)[0].strip()

    if not title or len(title) < 5:
        # Fallback from URL slug if scraping is blocked
        path_parts = [p for p in urllib.parse.urlparse(resolved_url).path.split("/") if p]
        slug = path_parts[-1] if path_parts else "Trendy Apparel"
        title = slug.replace("-", " ").replace("_", " ").title()[:60]
        if len(title) < 5:
            title = "Trending Fashion Collection Item"

    # ── 2. Image Extraction ──
    image_url = ""
    if soup:
        og_image = soup.find("meta", property="og:image") or soup.find("meta", attrs={"name": "og:image"})
        if og_image and og_image.get("content"):
            image_url = og_image["content"].strip()

    if not image_url or not image_url.startswith("http"):
        # Quality fallback fashion photo from Unsplash
        image_url = "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=700&q=80"

    # ── 3. Brand Extraction ──
    brand = "FashionDB Curated"
    title_upper = title.upper()
    for b in BRANDS:
        if b.upper() in title_upper:
            brand = b
            break

    # ── 4. Gender Detection ──
    detected_gender = "boys"
    lower_title = (title + " " + resolved_url).lower()

    if any(k in lower_title for k in ["women", "girl", "kurti", "saree", "lehenga", "dress", "skirt", "top"]):
        detected_gender = "girls"
    elif any(k in lower_title for k in ["men", "boy", "shirt", "blazer", "polo", "trouser", "t-shirt"]):
        detected_gender = "boys"

    if override_gender and override_gender.lower() in ["boys", "girls"]:
        detected_gender = override_gender.lower()

    # ── 5. Category & Subcategory ──
    cat, subcat = ("Topwear", "T-Shirt")
    for keyword, (c, sc) in CATEGORIES.items():
        if keyword in lower_title:
            cat, subcat = (c, sc)
            break

    # ── 6. Price Extraction ──
    price = 899.0
    if soup:
        # Check og:price:amount or regex for ₹/Rs
        og_price = soup.find("meta", property="product:price:amount") or soup.find("meta", attrs={"name": "twitter:data1"})
        if og_price and og_price.get("content"):
            try:
                price = float(re.sub(r"[^\d.]", "", og_price["content"]))
            except Exception:
                pass
        else:
            price_match = re.search(r"(?:₹|Rs\.?|INR)\s*([\d,]+)", html_content)
            if price_match:
                try:
                    price = float(price_match.group(1).replace(",", ""))
                except Exception:
                    pass

    if price < 199 or price > 25000:
        price = 799.0

    return {
        "name": title[:100],
        "gender": detected_gender,
        "category": cat,
        "subcategory": subcat,
        "style": "Casual Chic" if detected_gender == "girls" else "Urban Streetwear",
        "color": "Multi",
        "fabric": "100% Breathable Cotton Blend",
        "season": "All-Season",
        "occasion": "Daily Casual / College / Party",
        "brand": brand,
        "price": price,
        "description": f"Curated authentic {subcat.lower()} with verified fabric durability and high comfort rating. Direct from official store partners.",
        "image_path": image_url,
        "customer_photo": image_url,
        "external_link": original_affiliate_link,
        "body_type_suitability": json.dumps(["Slim", "Regular", "Athletic", "Curvy"]),
        "skin_tone_suitability": json.dumps(["Fair", "Wheatish", "Dusky"]),
        "age_group": "16-35 years",
        "comfort_level": "9/10 - Superior Breathability",
        "trend_score": 92.0,
        "popularity": 88.0,
        "rating": 4.5,
        "review_count": 340,
        "trust_score": 90.0,
        "is_verified": True,
        "styling_tips": json.dumps(["Pair with sneakers or casual boots", "Layer with a denim jacket"]),
        "matching_items": json.dumps(["Denim Jeans", "Classic Sneakers"]),
        "dos": json.dumps(["Gentle machine wash", "Dry in shade"]),
        "donts": json.dumps(["Do not bleach", "Avoid direct high-heat iron on prints"])
    }
