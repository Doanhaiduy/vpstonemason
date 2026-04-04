#!/usr/bin/env python3
"""Crawl YDL Stone website hierarchy and export product data to JSON.

Hierarchy crawled:
- Home (product categories)
- Category pages (product ranges)
- Range pages (products)
- Product pages (description, images, specifications)
"""

from __future__ import annotations

import argparse
import copy
import json
import re
import sys
import time
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional, Sequence
from urllib.parse import urljoin, urlparse

try:
    import requests
    from bs4 import BeautifulSoup, Tag
except ImportError as exc:
    raise SystemExit(
        "Missing dependencies. Install with: pip install requests beautifulsoup4"
    ) from exc

Node = Dict[str, Any]


class YDLStoneCrawler:
    """Crawler for ydlstone.com.au catalog hierarchy."""

    REQUIRED_SPEC_KEYS = [
        "Slab Dimensions",
        "Surface Finish",
        "Weights",
        "Available Thickness",
        "Crystalline Silica Free",
    ]

    def __init__(
        self,
        home_url: str,
        timeout: int = 30,
        delay: float = 0.0,
        max_products: Optional[int] = None,
        max_products_total: Optional[int] = None,
        verbose: bool = False,
    ) -> None:
        raw_home_url = home_url.strip()
        parsed = urlparse(raw_home_url)
        self.base_netloc = parsed.netloc.lower()
        self.home_url = self._normalize_url(raw_home_url) or raw_home_url
        self.timeout = timeout
        self.delay = max(0.0, delay)
        self.max_products = max_products
        self.max_products_total = max_products_total
        self.verbose = verbose

        self.session = requests.Session()
        self.session.headers.update(
            {
                "User-Agent": (
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                    "AppleWebKit/537.36 (KHTML, like Gecko) "
                    "Chrome/124.0.0.0 Safari/537.36"
                )
            }
        )

        self._soup_cache: Dict[str, BeautifulSoup] = {}
        self._node_cache: Dict[str, Node] = {}
        self.product_count = 0

    def _log(self, message: str) -> None:
        if self.verbose:
            print(f"[crawler] {message}", file=sys.stderr)

    @staticmethod
    def _clean_text(value: Optional[str]) -> str:
        if not value:
            return ""
        normalized = re.sub(r"\s+", " ", value).strip()
        normalized = re.sub(r"\s+([,.;:!?])", r"\1", normalized)
        return normalized

    def _normalize_short_label(self, text: str) -> str:
        text = self._clean_text(text)
        if not text:
            return ""

        has_mixed_case_noise = bool(re.search(r"[A-Z][a-z][A-Z]|[a-z][A-Z]", text))
        if text.islower() or text.isupper() or has_mixed_case_noise:
            return text.title()

        return text

    def _normalize_url(self, href: Optional[str]) -> Optional[str]:
        if not href:
            return None

        href = self._clean_text(href)
        if not href:
            return None

        base_for_join = getattr(self, "home_url", "") or href
        absolute = urljoin(base_for_join, href)
        absolute = absolute.split("#", 1)[0]

        parsed = urlparse(absolute)
        if parsed.scheme not in {"http", "https"}:
            return None

        if self.base_netloc and self.base_netloc not in parsed.netloc.lower():
            return None

        return absolute

    def _fetch_soup(self, url: str) -> BeautifulSoup:
        normalized = self._normalize_url(url) or url
        if normalized in self._soup_cache:
            return self._soup_cache[normalized]

        if self.delay > 0:
            time.sleep(self.delay)

        self._log(f"GET {normalized}")
        response = self.session.get(normalized, timeout=self.timeout)
        response.raise_for_status()

        soup = BeautifulSoup(response.text, "html.parser")
        self._soup_cache[normalized] = soup
        return soup

    def _text(self, node: Optional[Tag]) -> str:
        if node is None:
            return ""
        return self._clean_text(" ".join(node.stripped_strings))

    def _extract_image_url(self, img: Optional[Tag]) -> Optional[str]:
        if img is None:
            return None

        for attr in ("src", "data-src", "data-lazy-src"):
            src = img.get(attr)
            if src:
                normalized = self._normalize_url(src)
                if normalized:
                    return normalized

        srcset = img.get("srcset")
        if srcset:
            first_candidate = srcset.split(",", 1)[0].strip().split(" ", 1)[0]
            normalized = self._normalize_url(first_candidate)
            if normalized:
                return normalized

        return None

    def _extract_banner_image(self, soup: BeautifulSoup) -> Optional[str]:
        banner = soup.select_one(".module--subpage-banner")
        if not banner:
            return None

        style = banner.get("style", "")
        match = re.search(r"url\((['\"]?)(.*?)\1\)", style)
        if not match:
            return None

        return self._normalize_url(match.group(2))

    def _extract_og_image(self, soup: BeautifulSoup) -> Optional[str]:
        meta = soup.select_one('meta[property="og:image"][content]')
        if not meta:
            return None
        return self._normalize_url(meta.get("content"))

    def _extract_meta_description(self, soup: BeautifulSoup) -> str:
        meta = soup.select_one('meta[name="description"][content]')
        if not meta:
            return ""
        return self._clean_text(meta.get("content"))

    def _extract_h1(self, soup: BeautifulSoup) -> str:
        selectors = [
            ".single-product-main-content .title-part h1",
            ".module--subpage-banner h1",
            "h1",
        ]
        for selector in selectors:
            node = soup.select_one(selector)
            text = self._text(node)
            if text:
                return text
        return ""

    def _extract_intro_description(self, soup: BeautifulSoup) -> str:
        selectors = [
            ".single-product-main-content .product-content-wrapper > p",
            ".content-with-image-thumbnails-container .top-content .left-content p",
            ".module--text-media .content .wysiwyg-wrapper > p",
            ".module--text-media .wysiwyg-wrapper p",
            ".page-content .wysiwyg-wrapper p",
        ]

        for selector in selectors:
            for node in soup.select(selector):
                text = self._text(node)
                if len(text) >= 20:
                    return text

        return ""

    def _extract_category_description(self, soup: BeautifulSoup) -> str:
        for node in soup.select(
            ".content-with-image-thumbnails-container .top-content .left-content p"
        ):
            text = self._text(node)
            if len(text) >= 20:
                return text

        return self._extract_intro_description(soup)

    def _extract_category_item_description(self, soup: BeautifulSoup) -> str:
        # Category pages do not always expose the short card subtitle clearly.
        # Fall back to known brand copy so description_item is never empty.
        text = self._extract_meta_description(soup)
        if text and len(text) <= 80:
            return self._normalize_short_label(text)

        return ""

    def _extract_range_description(self, soup: BeautifulSoup) -> str:
        heading = ""
        heading_node = soup.select_one(
            ".module--text-media .content .wysiwyg-wrapper h2"
        )
        if heading_node:
            heading = self._text(heading_node)
            if heading and heading.lower() == heading:
                heading = heading.title()

        paragraphs: List[str] = []
        for node in soup.select(
            ".module--text-media .content .wysiwyg-wrapper > p"
        ):
            text = self._text(node)
            if len(text) >= 20:
                paragraphs.append(text)

        if heading and paragraphs:
            return f"{heading}. {paragraphs[0]}"

        if paragraphs:
            return paragraphs[0]

        if heading:
            return heading

        return self._extract_intro_description(soup)

    def _extract_range_item_description(self, soup: BeautifulSoup) -> str:
        heading_node = soup.select_one(
            ".module--text-media .content .wysiwyg-wrapper h2"
        )
        heading = self._text(heading_node)
        if heading:
            return self._normalize_short_label(heading)

        # Fallback: first short title-like segment before first period.
        description = self._extract_range_description(soup)
        if description:
            first_sentence = description.split(".", 1)[0]
            if 0 < len(first_sentence) <= 80:
                return self._normalize_short_label(first_sentence)

        return ""

    @staticmethod
    def _append_unique(images: List[str], candidate: Optional[str]) -> None:
        if candidate and candidate not in images:
            images.append(candidate)

    def _extract_category_detail_images(self, soup: BeautifulSoup) -> List[str]:
        images: List[str] = []
        self._append_unique(images, self._extract_banner_image(soup))
        return images

    def _extract_range_detail_images(self, soup: BeautifulSoup) -> List[str]:
        images: List[str] = []
        self._append_unique(images, self._extract_banner_image(soup))
        self._append_unique(
            images,
            self._extract_image_url(
                soup.select_one(
                    ".module--text-media .cell.media img.module-image, "
                    ".module--text-media .media img.module-image, "
                    ".module--text-media .cell.media img, "
                    ".module--text-media .media img"
                )
            ),
        )
        return images

    def _extract_product_description(self, soup: BeautifulSoup) -> str:
        # Product description should come from the main intro paragraph first,
        # then fall back to SEO meta description if the intro paragraph is missing.
        for node in soup.select(".single-product-main-content .product-content-wrapper > p"):
            text = self._text(node)
            if len(text) >= 20:
                return text

        meta_desc = self._extract_meta_description(soup)
        if meta_desc:
            return meta_desc

        og_desc = soup.select_one('meta[property="og:description"][content]')
        if og_desc:
            return self._clean_text(og_desc.get("content"))

        return ""

    def _extract_list_cards(
        self, soup: BeautifulSoup, allowed_prefixes: Sequence[str]
    ) -> List[Node]:
        cards: List[Node] = []
        seen_urls = set()

        for item in soup.select(".item-list-wrapper .list-item"):
            link = item.select_one("h3.title a[href]") or item.select_one("a.item-link[href]")
            if not link:
                continue

            url = self._normalize_url(link.get("href"))
            if not url:
                continue

            path = urlparse(url).path.lower()
            if allowed_prefixes and not any(path.startswith(prefix) for prefix in allowed_prefixes):
                continue

            if url in seen_urls:
                continue
            seen_urls.add(url)

            title = self._text(item.select_one("h3.title")) or self._text(link)
            description = self._text(item.select_one(".sub-title"))
            image_main = self._extract_image_url(item.select_one("img.item-image, img"))

            cards.append(
                {
                    "url": url,
                    "title": title,
                    "description": description,
                    "image_main": image_main,
                    "description_item": description,
                    "image_item": image_main,
                    "image_sub": [],
                }
            )

        return cards

    def _extract_product_cards(self, soup: BeautifulSoup) -> List[Node]:
        cards: List[Node] = []
        seen_urls = set()

        articles = soup.select(".module--product-list-with-facet article.tease-product")
        if not articles:
            articles = soup.select("article.tease-product")

        for article in articles:
            link = article.select_one("h2.tease-title a[href]") or article.select_one(
                "a.tease-link[href]"
            )
            if not link:
                continue

            url = self._normalize_url(link.get("href"))
            if not url:
                continue

            if not urlparse(url).path.lower().startswith("/products/"):
                continue

            if url in seen_urls:
                continue
            seen_urls.add(url)

            title = self._text(article.select_one("h2.tease-title")) or self._text(link)
            image_main = self._extract_image_url(article.select_one("img.tease-img, img"))

            cards.append(
                {
                    "url": url,
                    "title": title,
                    "description": "",
                    "image_main": image_main,
                    "image_sub": [],
                }
            )

        return cards

    def _extract_product_specs(self, soup: BeautifulSoup) -> Dict[str, str]:
        specs: Dict[str, str] = {}

        for item_content in soup.select(".product-icon-list-wrapper .item-content"):
            key = self._text(item_content.select_one("h4.title, h4, .title"))
            value = self._text(item_content.select_one("p.sub-title"))

            if not key:
                continue

            if not value and "crystalline silica free" in key.lower():
                value = "Yes"

            specs[key] = value

        if not all(required in specs for required in self.REQUIRED_SPEC_KEYS):
            lines = [self._clean_text(text) for text in soup.stripped_strings]
            lines = [line for line in lines if line]
            lower_lines = [line.lower() for line in lines]

            for key in self.REQUIRED_SPEC_KEYS:
                if key in specs:
                    continue

                key_lower = key.lower()
                for idx, line in enumerate(lower_lines):
                    if line != key_lower:
                        continue

                    candidate_value = ""
                    for next_text in lines[idx + 1 : idx + 8]:
                        if not next_text:
                            continue
                        if next_text.lower() == key_lower:
                            continue
                        candidate_value = next_text
                        break

                    if not candidate_value and "crystalline silica free" in key_lower:
                        candidate_value = "Yes"

                    specs[key] = candidate_value
                    break

        for required in self.REQUIRED_SPEC_KEYS:
            specs.setdefault(required, "")

        return specs

    def _extract_product_sub_images(self, soup: BeautifulSoup) -> List[str]:
        selectors = [
            ".module--gallery-slider img.gallery-img",
            ".module--gallery-slider img",
            ".gallery-slider img",
        ]

        images: List[str] = []
        seen = set()

        for selector in selectors:
            nodes = soup.select(selector)
            if not nodes:
                continue

            for img in nodes:
                url = self._extract_image_url(img)
                if not url or url in seen:
                    continue
                seen.add(url)
                images.append(url)

            if images:
                break

        return images

    def _extract_product_features(self, soup: BeautifulSoup) -> List[str]:
        features: List[str] = []
        seen = set()

        for item in soup.select(".product-features .wysiwyg-wrapper li, .product-features li"):
            text = self._text(item)
            if not text or text in seen:
                continue
            seen.add(text)
            features.append(text)

        return features

    @staticmethod
    def _build_node(
        node_type: str,
        url: str,
        title: str,
        description: str,
        image_main: Optional[str],
        image_sub: Optional[List[str]] = None,
        extra: Optional[Dict[str, Any]] = None,
    ) -> Node:
        extra = extra or {}

        node: Node = {
            "type": node_type,
            "url": url,
            "title": title,
            "description": description,
            "description_item": extra.get("description_item", ""),
            "image_main": image_main or "",
            "image_item": extra.get("image_item", ""),
            "image_detail": extra.get("image_detail", ""),
            "image_sub": image_sub or [],
            "children": [],
        }

        for key, value in extra.items():
            if key in {"description_item", "image_item", "image_detail"}:
                continue
            node[key] = value

        return node

    def crawl(self) -> Node:
        soup = self._fetch_soup(self.home_url)

        home_title = self._extract_h1(soup) or "YDL Stone"
        home_desc = self._extract_meta_description(soup) or self._extract_intro_description(soup)
        home_image = self._extract_og_image(soup) or self._extract_banner_image(soup)

        root = self._build_node(
            node_type="home",
            url=self.home_url,
            title=home_title,
            description=home_desc,
            image_main=home_image,
            image_sub=[],
        )

        categories = self._extract_list_cards(soup, allowed_prefixes=("/product-category/",))
        for category_card in categories:
            category_node = self._crawl_category(category_card)
            root["children"].append(category_node)

        return root

    def _crawl_category(self, card: Node) -> Node:
        url = card["url"]
        if url in self._node_cache:
            return copy.deepcopy(self._node_cache[url])

        soup = self._fetch_soup(url)

        title = card.get("title") or self._extract_h1(soup)
        description_item = self._normalize_short_label(card.get("description") or "")
        if not description_item:
            description_item = self._extract_category_item_description(soup)
        description = self._extract_category_description(soup) or description_item

        image_item = card.get("image_main")
        detail_images = self._extract_category_detail_images(soup)
        image_detail = detail_images[0] if detail_images else ""
        image_main = image_item or image_detail or self._extract_og_image(soup)

        image_sub: List[str] = []
        for detail_image in detail_images:
            if detail_image and detail_image != image_main and detail_image not in image_sub:
                image_sub.append(detail_image)

        node = self._build_node(
            node_type="category",
            url=url,
            title=title,
            description=description,
            image_main=image_main,
            image_sub=image_sub,
            extra={
                "description_item": description_item,
                "image_item": image_item or "",
                "image_detail": image_detail,
            },
        )

        ranges = self._extract_list_cards(soup, allowed_prefixes=("/product-range/",))
        for range_card in ranges:
            range_node = self._crawl_range(range_card)
            node["children"].append(range_node)

        self._node_cache[url] = copy.deepcopy(node)
        return node

    def _crawl_range(self, card: Node) -> Node:
        url = card["url"]
        if url in self._node_cache:
            return copy.deepcopy(self._node_cache[url])

        soup = self._fetch_soup(url)

        title = card.get("title") or self._extract_h1(soup)
        description_item = self._normalize_short_label(card.get("description") or "")
        if not description_item:
            description_item = self._extract_range_item_description(soup)
        description = self._extract_range_description(soup) or description_item

        image_item = card.get("image_main")
        detail_images = self._extract_range_detail_images(soup)
        image_detail = detail_images[0] if detail_images else ""
        image_main = image_item or image_detail or self._extract_og_image(soup)

        image_sub: List[str] = []
        for detail_image in detail_images:
            if detail_image and detail_image != image_main and detail_image not in image_sub:
                image_sub.append(detail_image)

        node = self._build_node(
            node_type="range",
            url=url,
            title=title,
            description=description,
            image_main=image_main,
            image_sub=image_sub,
            extra={
                "description_item": description_item,
                "image_item": image_item or "",
                "image_detail": image_detail,
            },
        )

        product_cards = self._extract_product_cards(soup)
        range_product_count = 0
        for product_card in product_cards:
            if (
                self.max_products_total is not None
                and self.product_count >= self.max_products_total
            ):
                break

            if self.max_products is not None and range_product_count >= self.max_products:
                break

            product_node = self._crawl_product(product_card)
            node["children"].append(product_node)
            range_product_count += 1

        self._node_cache[url] = copy.deepcopy(node)
        return node

    def _crawl_product(self, card: Node) -> Node:
        url = card["url"]
        if url in self._node_cache:
            return copy.deepcopy(self._node_cache[url])

        soup = self._fetch_soup(url)

        title = card.get("title") or self._extract_h1(soup)
        description = card.get("description") or self._extract_product_description(soup)

        main_image = (
            card.get("image_main")
            or self._extract_image_url(
                soup.select_one(
                    ".single-product-main-content .featured-image-wrapper img.product-image, "
                    ".single-product-main-content .featured-image-wrapper img"
                )
            )
            or self._extract_og_image(soup)
            or self._extract_banner_image(soup)
        )

        sub_images = self._extract_product_sub_images(soup)
        specs = self._extract_product_specs(soup)
        features = self._extract_product_features(soup)

        node = self._build_node(
            node_type="product",
            url=url,
            title=title,
            description=description,
            image_main=main_image,
            image_sub=sub_images,
            extra={"specifications": specs, "features": features},
        )

        self.product_count += 1
        self._node_cache[url] = copy.deepcopy(node)
        return node


def flatten_tree(node: Node, parent_url: str = "", level: int = 0, path: Optional[List[str]] = None) -> List[Node]:
    path = (path or []) + ([node.get("title", "")] if node.get("title") else [])

    flat_item: Node = {
        "type": node.get("type", ""),
        "url": node.get("url", ""),
        "title": node.get("title", ""),
        "description": node.get("description", ""),
        "image_main": node.get("image_main", ""),
        "image_sub": node.get("image_sub", []),
        "parent_url": parent_url,
        "level": level,
        "path": " > ".join(path),
    }

    if "specifications" in node:
        flat_item["specifications"] = node["specifications"]

    if "features" in node:
        flat_item["features"] = node["features"]

    if "description_item" in node:
        flat_item["description_item"] = node["description_item"]

    if "image_item" in node:
        flat_item["image_item"] = node["image_item"]

    if "image_detail" in node:
        flat_item["image_detail"] = node["image_detail"]

    items = [flat_item]

    for child in node.get("children", []):
        items.extend(
            flatten_tree(
                child,
                parent_url=node.get("url", ""),
                level=level + 1,
                path=path,
            )
        )

    return items


def count_by_type(flat_items: List[Node], node_type: str) -> int:
    return sum(1 for item in flat_items if item.get("type") == node_type)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Crawl YDL Stone product hierarchy into a JSON file."
    )
    parser.add_argument(
        "--home-url",
        default="https://www.ydlstone.com.au/",
        help="Starting home page URL.",
    )
    parser.add_argument(
        "--output",
        default="scripts/ydl_products_hierarchy.json",
        help="Output JSON path.",
    )
    parser.add_argument(
        "--timeout",
        type=int,
        default=30,
        help="Request timeout in seconds.",
    )
    parser.add_argument(
        "--delay",
        type=float,
        default=0.0,
        help="Delay between requests in seconds.",
    )
    parser.add_argument(
        "--max-products",
        type=int,
        default=None,
        help="Limit number of product detail pages crawled per range (for testing).",
    )
    parser.add_argument(
        "--max-products-total",
        type=int,
        default=None,
        help="Limit total number of product detail pages crawled across all ranges.",
    )
    parser.add_argument(
        "--verbose",
        action="store_true",
        help="Print progress logs to stderr.",
    )
    return parser.parse_args()


def main() -> int:
    args = parse_args()

    crawler = YDLStoneCrawler(
        home_url=args.home_url,
        timeout=args.timeout,
        delay=args.delay,
        max_products=args.max_products,
        max_products_total=args.max_products_total,
        verbose=args.verbose,
    )

    try:
        tree = crawler.crawl()
    except requests.RequestException as exc:
        print(f"Crawl failed: {exc}", file=sys.stderr)
        return 1

    flat_items = flatten_tree(tree)

    result = {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "source": args.home_url,
        "summary": {
            "total_items": len(flat_items),
            "categories": count_by_type(flat_items, "category"),
            "ranges": count_by_type(flat_items, "range"),
            "products": count_by_type(flat_items, "product"),
        },
        "tree": tree,
        "items_flat": flat_items,
    }

    output_path = Path(args.output)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding="utf-8")

    print(f"Saved: {output_path}")
    print(
        "Summary: "
        f"categories={result['summary']['categories']}, "
        f"ranges={result['summary']['ranges']}, "
        f"products={result['summary']['products']}"
    )

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
