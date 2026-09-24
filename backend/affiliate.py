import os
import urllib.parse
from datetime import datetime

# ── Optional affiliate IDs — set via environment variables ──────────
# When empty / unset, outbound links pass through without any tracking
# params so the site works perfectly before you register with any program.
#
#   set AMAZON_AFFILIATE_TAG=your-tag-21
#   set FLIPKART_AFFILIATE_ID=your-affid
#   set MYNTRA_UTM_SOURCE=your-source
#   set CONTACT_EMAIL=you@example.com       (used by legal pages)
#
AFFILIATE_CONFIG = {
    'amazon':   {'param': 'tag',    'value': os.getenv('AMAZON_AFFILIATE_TAG', ''),   'base_search': 'https://www.amazon.in/s?k='},
    'flipkart': {'param': 'affid',  'value': os.getenv('FLIPKART_AFFILIATE_ID', ''),  'base_search': 'https://www.flipkart.com/search?q='},
    'myntra':   {'utm_source': os.getenv('MYNTRA_UTM_SOURCE', ''), 'utm_medium': 'affiliate', 'base_search': 'https://www.myntra.com/search?q='}
}

CONTACT_EMAIL = os.getenv('CONTACT_EMAIL', '')   # empty = "not yet configured"

def detect_platform_from_url(url: str) -> str:
    if not url:
        return 'unknown'
    domain = urllib.parse.urlparse(url).netloc.lower()
    if 'amazon' in domain:
        return 'amazon'
    elif 'flipkart' in domain:
        return 'flipkart'
    elif 'myntra' in domain:
        return 'myntra'
    return 'unknown'

def generate_affiliate_link(base_url: str, platform: str) -> str:
    """Append affiliate tracking params **only** when the relevant ID is configured."""
    if platform not in AFFILIATE_CONFIG:
        return base_url

    config = AFFILIATE_CONFIG[platform]

    if platform in ['amazon', 'flipkart']:
        affiliate_value = config.get('value', '')
        if not affiliate_value:          # ID not configured — return URL as-is
            return base_url
        parsed = urllib.parse.urlparse(base_url)
        query_params = urllib.parse.parse_qs(parsed.query)
        query_params[config['param']] = [affiliate_value]
        new_query = urllib.parse.urlencode(query_params, doseq=True)
        return urllib.parse.urlunparse(
            (parsed.scheme, parsed.netloc, parsed.path, parsed.params, new_query, parsed.fragment)
        )
    elif platform == 'myntra':
        utm_source = config.get('utm_source', '')
        if not utm_source:               # UTM source not configured — return as-is
            return base_url
        parsed = urllib.parse.urlparse(base_url)
        query_params = urllib.parse.parse_qs(parsed.query)
        query_params['utm_source'] = [utm_source]
        query_params['utm_medium'] = [config['utm_medium']]
        new_query = urllib.parse.urlencode(query_params, doseq=True)
        return urllib.parse.urlunparse(
            (parsed.scheme, parsed.netloc, parsed.path, parsed.params, new_query, parsed.fragment)
        )

    return base_url

def log_affiliate_click(db, product_id, platform, user_agent, referrer):
    from models import AffiliateClick
    click = AffiliateClick(
        product_id=product_id,
        platform=platform,
        user_agent=user_agent,
        referrer=referrer
    )
    db.add(click)
    db.commit()
    db.refresh(click)
    return click
