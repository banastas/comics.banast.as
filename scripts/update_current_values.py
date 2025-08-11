#!/usr/bin/env python3
import json, os, sys, time, re, statistics, urllib.parse
import requests
from datetime import datetime, timezone

EBAY_APP_ID = os.getenv("EBAY_APP_ID") or "YOUR-EBAY-APP-ID"  # https://developer.ebay.com/
SITE_ID = "0"  # US
ENDPOINT = "https://svcs.ebay.com/services/search/FindingService/v1"

# Tunables
MAX_RESULTS = 50           # how many completed items to fetch per book
USE_MEDIAN = True          # median beats average for outliers
MIN_SAMPLE = 4             # skip if too few comps
OUTLIER_Z = 2.0            # trim comps with z-score > threshold
INCLUDE_SHIPPING = False   # usually price already excludes shipping; leave False
SLEEP_BETWEEN_CALLS = 0.4  # basic rate limiting

def zscores(xs):
    if len(xs) < 2: return [0]*len(xs)
    mu, sigma = statistics.mean(xs), statistics.pstdev(xs) or 1e-9
    return [(x - mu) / sigma for x in xs]

def clean_title(t):
    return re.sub(r"\s+", " ", t or "").strip().lower()

def looks_variant(title):
    return any(k in title for k in ["variant", "1:25", "1:50", "virgin", "ratio"])

def looks_slabbed(title):
    return any(k in title for k in ["cgc", "cbcs", "slab", "9.", "graded"])

def build_query(book):
    # Title like: "Alien 2021 #2 Inhyuk Lee" with variant flag
    parts = []
    series = str(book.get("seriesName") or book.get("title") or "").strip()
    issue = str(book.get("issueNumber") or "").strip()
    cover = str(book.get("coverArtist") or "").strip()

    # Normalize parentheses in series names
    series_norm = re.sub(r"\s+", " ", series).strip()
    parts.append(series_norm)
    if issue:
        parts.append(f"#{issue}")

    # Helpful for moderns
    rd = str(book.get("releaseDate") or "")
    if re.match(r"^\d{4}-\d{2}-\d{2}$", rd):
        parts.append(rd[:4])

    if cover:
        parts.append(cover)

    q = " ".join(parts)
    # Steer matching by excluding unwanted
    negatives = [
        "-lot", "-bundle", "-set", "-facsimile", "-trade", "-tpb", "-omnibus",
        "-poster", "-tshirt", "-shirt", "-funko", "-statue"
    ]
    return f"{q} {' '.join(negatives)}"

def ebay_sold_prices(query, want_variant, want_slabbed):
    headers = {"X-EBAY-SOA-OPERATION-NAME": "findCompletedItems"}
    params = {
        "SERVICE-VERSION": "1.13.0",
        "SECURITY-APPNAME": EBAY_APP_ID,
        "GLOBAL-ID": "EBAY-US",
        "siteid": SITE_ID,
        "RESPONSE-DATA-FORMAT": "JSON",
        "keywords": query,
        "paginationInput.entriesPerPage": str(MAX_RESULTS),
        "outputSelector": "SellerInfo",
        "itemFilter(0).name": "SoldItemsOnly",
        "itemFilter(0).value": "true",
        # Filter by category 63 = Comics; keeps results tighter
        "categoryId": "63",
    }
    r = requests.get(ENDPOINT, headers=headers, params=params, timeout=30)
    r.raise_for_status()
    data = r.json()
    items = (
        data.get("findCompletedItemsResponse", [{}])[0]
            .get("searchResult", [{}])[0]
            .get("item", []) or []
    )
    prices = []
    for it in items:
        title = clean_title(it.get("title", [""])[0] if isinstance(it.get("title"), list) else it.get("title", ""))
        selling = it.get("sellingStatus", [{}])[0]
        price_node = selling.get("currentPrice", [{}])[0]
        try:
            price = float(price_node.get("__value__", price_node.get("value", "0")))
        except:
            continue
        # Optional shipping inclusion
        if INCLUDE_SHIPPING:
            ship = it.get("shippingInfo", [{}])[0].get("shippingServiceCost", [{}])[0]
            try:
                price += float(ship.get("__value__", ship.get("value", "0")))
            except:
                pass

        # Variant vs standard filter
        title_is_variant = looks_variant(title)
        if want_variant and not title_is_variant:
            continue
        if not want_variant and title_is_variant:
            continue

        # Slabbed vs raw filter
        title_is_slabbed = looks_slabbed(title)
        if want_slabbed and not title_is_slabbed:
            continue
        if not want_slabbed and title_is_slabbed:
            continue

        # Basic sanity filters
        if price <= 0 or price > 5000:  # cut absurdities
            continue
        prices.append(price)

    if len(prices) < MIN_SAMPLE:
        return None

    # Trim outliers via z-score
    zs = zscores(prices)
    trimmed = [p for p, z in zip(prices, zs) if abs(z) <= OUTLIER_Z]
    if len(trimmed) >= MIN_SAMPLE:
        prices = trimmed

    return statistics.median(prices) if USE_MEDIAN else statistics.mean(prices)

def main(path):
    if EBAY_APP_ID == "YOUR-EBAY-APP-ID":
        print("Set EBAY_APP_ID env var first")
        sys.exit(1)

    with open(path, "r", encoding="utf-8") as f:
        books = json.load(f)

    updated = 0
    now_iso = datetime.now(timezone.utc).isoformat(timespec="seconds")

    for b in books:
        want_variant = bool(b.get("isVariant"))
        want_slabbed = bool(b.get("isSlabbed"))
        q = build_query(b)
        val = None
        try:
            val = ebay_sold_prices(q, want_variant, want_slabbed)
        except Exception as e:
            # Soft-fail this book and continue
            val = None
        time.sleep(SLEEP_BETWEEN_CALLS)

        if val is None:
            continue

        # Optional grade adjustment for raw books
        # Simple heuristic: scale by grade vs NM 9.4 baseline
        g = b.get("grade")
        if g and not want_slabbed:
            try:
                g = float(g)
                scale = 1.0
                if g < 9.4:
                    # drop 3 percent per 0.5 below 9.4
                    scale -= max(0, (9.4 - g) / 0.5) * 0.03
                elif g > 9.4:
                    # add 3 percent per 0.2 above 9.4
                    scale += max(0, (g - 9.4) / 0.2) * 0.03
                val = max(0.5, round(val * scale, 2))
            except:
                pass

        b["currentValue"] = round(float(val), 2)
        b["updatedAt"] = now_iso
        updated += 1

    with open(path, "w", encoding="utf-8") as f:
        json.dump(books, f, ensure_ascii=False, indent=2)

    print(f"Updated {updated} books")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python update_current_values.py /path/to/comics.json")
        sys.exit(2)
    main(sys.argv[1])