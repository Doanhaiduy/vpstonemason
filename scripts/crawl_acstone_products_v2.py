#!/usr/bin/env python3
"""Crawl AC Stone hierarchy and export product data to JSON.

Hierarchy crawled:
- Home (category cards with Explore Range links)
- Category pages (multiple ranges grouped in one page)
- Product pages (description, images, additional information, metadata)
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
from typing import Any, Dict, List, Optional
from urllib.parse import urljoin, urlparse

try:
    import requests
    from bs4 import BeautifulSoup, Tag
except ImportError as exc:
    raise SystemExit(
        "Missing dependencies. Install with: pip install requests beautifulsoup4"
    ) from exc

Node = Dict[str, Any]


class ACStoneCrawlerV2:
    """Crawler for acstone.com.au hierarchy with WooCommerce product details."""

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

        self.base_netloc = self._normalize_netloc(parsed.netloc)
        self.base_domain = self._to_base_domain(self.base_netloc)
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
            print(f"[acstone] {message}", file=sys.stderr)

    @staticmethod
    def _normalize_netloc(netloc: str) -> str:
        return netloc.strip().lower().split(":", 1)[0]

    @staticmethod
    def _to_base_domain(netloc: str) -> str:
        if netloc.startswith("www."):
            return netloc[4:]
        return netloc

    @staticmethod
    def _clean_text(value: Optional[str]) -> str:
        if not value:
            return ""
        normalized = re.sub(r"\s+", " ", value).strip()
        normalized = re.sub(r"\s+([,.;:!?])", r"\1", normalized)
        return normalized

    def _normalize_title(self, text: str) -> str:
        text = self._clean_text(text)
        if not text:
            return ""
        return text[0].upper() + text[1:] if text else text

    def _is_allowed_host(self, netloc: str) -> bool:
        host = self._to_base_domain(self._normalize_netloc(netloc))
        if not host:
            return False
        if not self.base_domain:
            return True
        return host == self.base_domain or host.endswith(f".{self.base_domain}")

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

        if parsed.netloc and not self._is_allowed_host(parsed.netloc):
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

    def _extract_image_url(self, node: Optional[Tag]) -> Optional[str]:
        if node is None:
            return None

        attr_order = ("src", "data-src", "data-lazy-src", "srcset", "data-srcset")
        for attr in attr_order:
            value = node.get(attr)
            if not value:
                continue

            candidate = value
            if "srcset" in attr:
                candidate = value.split(",", 1)[0].strip().split(" ", 1)[0]

            if not candidate or candidate.startswith("data:image"):
                continue

            normalized = self._normalize_url(candidate)
            if normalized:
                return normalized

        picture = node.find_parent("picture")
        if picture:
            for source in picture.find_all("source"):
                srcset = source.get("srcset") or source.get("data-srcset")
                if not srcset:
                    continue
                candidate = srcset.split(",", 1)[0].strip().split(" ", 1)[0]
                if candidate.startswith("data:image"):
                    continue
                normalized = self._normalize_url(candidate)
                if normalized:
                    return normalized

        return None

    @staticmethod
    def _append_unique(items: List[str], value: Optional[str]) -> None:
        if value and value not in items:
            items.append(value)

    @staticmethod
    def _slugify(text: str) -> str:
        slug = re.sub(r"[^a-zA-Z0-9]+", "-", text.lower()).strip("-")
        return slug or "range"

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

    def _extract_home_cards(self, soup: BeautifulSoup) -> List[Node]:
        cards: List[Node] = []
        seen_urls = set()

        for wrap in soup.select(".wrap.mcb-wrap.test2"):
            button = None
            for candidate in wrap.select("a.button[href]"):
                label = self._text(candidate.select_one(".button_label")) or self._text(candidate)
                if "explore range" in label.lower():
                    button = candidate
                    break

            if button is None:
                continue

            url = self._normalize_url(button.get("href"))
            if not url or url in seen_urls:
                continue

            seen_urls.add(url)

            title = self._normalize_title(self._text(wrap.select_one("h3.title")))
            description = self._text(wrap.select_one(".column_column .column_attr p"))
            image = self._extract_image_url(wrap.select_one(".column_image img, picture img, img"))

            cards.append(
                {
                    "url": url,
                    "title": title,
                    "description": description,
                    "image_main": image,
                    "description_item": description,
                    "image_item": image,
                    "image_sub": [],
                }
            )

        return cards

    def _extract_page_h1(self, soup: BeautifulSoup) -> str:
        for selector in ("h1", "#Subheader .title", ".entry-title"):
            title = self._text(soup.select_one(selector))
            if title:
                return title
        return ""

    def _extract_meta_description(self, soup: BeautifulSoup) -> str:
        meta = soup.select_one('meta[name="description"][content]')
        if not meta:
            return ""
        return self._clean_text(meta.get("content"))

    def _extract_og_image(self, soup: BeautifulSoup) -> Optional[str]:
        meta = soup.select_one('meta[property="og:image"][content]')
        if not meta:
            return None
        return self._normalize_url(meta.get("content"))

    def _extract_wrap_heading(self, wrap: Tag) -> str:
        for selector in ("h2.title", "h1.title", "h3.title"):
            heading = self._text(wrap.select_one(selector))
            if heading:
                return heading
        return ""

    def _extract_wrap_subtitle(self, wrap: Tag, heading: str = "") -> str:
        normalized_heading = self._clean_text(heading).lower()

        for selector in (
            ".column_heading .title",
            ".column_column .column_attr h3",
            ".column_column .column_attr h4",
            ".column_column .column_attr p strong",
            ".column_column .column_attr p b",
        ):
            for node in wrap.select(selector):
                subtitle = self._text(node)
                if not subtitle:
                    continue
                if normalized_heading and subtitle.lower() == normalized_heading:
                    continue
                return subtitle

        # Fallback: pick another title element if wrap has multiple titles.
        for node in wrap.select(".title"):
            subtitle = self._text(node)
            if not subtitle:
                continue
            if normalized_heading and subtitle.lower() == normalized_heading:
                continue
            return subtitle

        return ""

    def _extract_wrap_description(self, wrap: Tag) -> str:
        description_parts: List[str] = []
        for para in wrap.select(".column_column .column_attr p"):
            text = self._text(para)
            if text:
                description_parts.append(text)
        return "\n".join(description_parts)

    def _extract_product_cards_from_wrap(self, wrap: Tag) -> List[Node]:
        product_cards: List[Node] = []
        seen_product_urls = set()

        products = wrap.select("ul.products li.product")
        for product in products:
            link = None

            for candidate in product.select("h4.mfn-woo-product-title a[href], a[href]"):
                href = candidate.get("href")
                normalized_href = self._normalize_url(href)
                if not normalized_href:
                    continue
                if "/product/" not in urlparse(normalized_href).path.lower():
                    continue
                link = candidate
                break

            if link is None:
                continue

            product_url = self._normalize_url(link.get("href"))
            if not product_url or product_url in seen_product_urls:
                continue

            seen_product_urls.add(product_url)

            title = self._text(product.select_one("h4.mfn-woo-product-title a"))
            if not title:
                title = self._text(link)
            if not title:
                title = self._clean_text(link.get("aria-label"))

            image_main = self._extract_image_url(
                product.select_one(".product-loop-thumb img, .image_wrapper img, img")
            )

            product_cards.append(
                {
                    "url": product_url,
                    "title": title,
                    "description": "",
                    "image_main": image_main,
                    "image_sub": [],
                }
            )

        return product_cards

    def _extract_range_sections(self, soup: BeautifulSoup, category_url: str) -> List[Node]:
        sections: List[Node] = []
        seen_section_keys = set()

        entry_root = soup.select_one(".entry-content") or soup
        wraps = entry_root.select(".wrap.mcb-wrap.test2")

        pending_range_meta: Optional[Dict[str, str]] = None
        section_index = 0

        for wrap in wraps:
            heading = self._extract_wrap_heading(wrap)
            subtitle = self._extract_wrap_subtitle(wrap, heading=heading)
            description = self._extract_wrap_description(wrap)
            product_cards = self._extract_product_cards_from_wrap(wrap)

            if not product_cards:
                if heading:
                    pending_range_meta = {
                        "title": self._normalize_title(heading),
                        "subtitle": self._normalize_title(subtitle) if subtitle else "",
                        "description": description,
                        "image_main": self._extract_image_url(
                            wrap.select_one(
                                ".column_banner_box img, .column_image img, picture img, img"
                            )
                        )
                        or "",
                    }
                continue

            resolved_title = self._normalize_title(heading) if heading else ""
            resolved_subtitle = self._normalize_title(subtitle) if subtitle else ""
            resolved_description = description

            if not resolved_title and pending_range_meta:
                resolved_title = pending_range_meta.get("title", "")
                if not resolved_subtitle:
                    resolved_subtitle = pending_range_meta.get("subtitle", "")
                if not resolved_description:
                    resolved_description = pending_range_meta.get("description", "")

            if not resolved_title:
                continue

            section_index += 1
            section_slug_seed = f"{resolved_title} {resolved_subtitle}".strip()
            section_slug = self._slugify(section_slug_seed)
            section_url = f"{category_url}#range-{section_slug}-{section_index}"

            # Keep same title allowed; subtitle (e.g. Full Body/Standard) differentiates ranges.
            first_product_url = (product_cards[0].get("url") or "").lower()
            section_key = (
                resolved_title.lower(),
                resolved_subtitle.lower(),
                first_product_url,
            )
            if section_key in seen_section_keys:
                continue
            seen_section_keys.add(section_key)

            description_item = resolved_subtitle or resolved_title
            image_main = product_cards[0].get("image_main", "")
            if not image_main and pending_range_meta:
                image_main = pending_range_meta.get("image_main", "")

            sections.append(
                {
                    "url": section_url,
                    "title": resolved_title,
                    "description": resolved_description,
                    "description_item": description_item,
                    "image_main": image_main,
                    "image_item": image_main,
                    "image_detail": "",
                    "image_sub": [],
                    "products": product_cards,
                }
            )
            pending_range_meta = None

        return sections

    def _extract_product_images(self, soup: BeautifulSoup) -> List[str]:
        images: List[str] = []

        selectors = [
            ".woocommerce-product-gallery__wrapper .woocommerce-product-gallery__image a[href]",
            ".woocommerce-product-gallery__wrapper .woocommerce-product-gallery__image img",
            ".woocommerce-product-gallery img",
        ]

        for selector in selectors:
            for node in soup.select(selector):
                candidate = None
                if node.name == "a":
                    candidate = self._normalize_url(node.get("href"))
                else:
                    candidate = self._extract_image_url(node)
                self._append_unique(images, candidate)

        if not images:
            self._append_unique(images, self._extract_og_image(soup))

        return images

    def _extract_product_short_description(self, soup: BeautifulSoup) -> str:
        short_block = soup.select_one(".woocommerce-product-details__short-description")
        return self._text(short_block)

    def _extract_product_full_description(self, soup: BeautifulSoup) -> str:
        description_panel = soup.select_one("#tab-description")
        if not description_panel:
            return ""

        paragraphs: List[str] = []
        for node in description_panel.select("p"):
            text = self._text(node)
            if text:
                paragraphs.append(text)

        if paragraphs:
            return "\n".join(paragraphs)

        return self._text(description_panel)

    def _extract_product_features(self, soup: BeautifulSoup) -> List[str]:
        features: List[str] = []
        seen = set()

        for item in soup.select(
            "#tab-description li, .woocommerce-product-details__short-description li"
        ):
            text = self._text(item)
            if not text or text in seen:
                continue
            seen.add(text)
            features.append(text)

        return features

    def _extract_additional_information(self, soup: BeautifulSoup) -> Dict[str, str]:
        info: Dict[str, str] = {}

        for row in soup.select("table.woocommerce-product-attributes tr"):
            key = self._text(row.select_one("th"))
            value = self._text(row.select_one("td"))
            if key:
                info[key] = value

        return info

    def _extract_product_meta(self, soup: BeautifulSoup) -> Dict[str, Any]:
        meta: Dict[str, Any] = {}
        meta_block = soup.select_one(".product_meta")
        if not meta_block:
            return meta

        sku = self._text(meta_block.select_one(".sku"))
        if sku:
            meta["sku"] = sku

        categories = [
            self._text(node)
            for node in meta_block.select(".posted_in a")
            if self._text(node)
        ]
        if categories:
            meta["categories"] = categories

        tags = [
            self._text(node)
            for node in meta_block.select(".tagged_as a")
            if self._text(node)
        ]
        if tags:
            meta["tags"] = tags

        for span in meta_block.select(":scope > span"):
            classes = set(span.get("class", []))
            if classes & {"sku_wrapper", "posted_in", "tagged_as"}:
                continue

            key = " ".join(sorted(classes)).strip()
            key = key or "meta"
            value = self._text(span)
            if value:
                meta[key] = value

        return meta

    def crawl(self) -> Node:
        soup = self._fetch_soup(self.home_url)

        home_title = self._extract_page_h1(soup) or "AC Stone"
        home_desc = self._extract_meta_description(soup)
        home_image = self._extract_og_image(soup)

        root = self._build_node(
            node_type="home",
            url=self.home_url,
            title=home_title,
            description=home_desc,
            image_main=home_image,
            image_sub=[],
        )

        category_cards = self._extract_home_cards(soup)
        for card in category_cards:
            try:
                category_node = self._crawl_category(card)
                root["children"].append(category_node)
            except requests.RequestException as exc:
                self._log(f"Skip category {card.get('url')}: {exc}")

        return root

    def _crawl_category(self, card: Node) -> Node:
        url = card["url"]
        if url in self._node_cache:
            return copy.deepcopy(self._node_cache[url])

        soup = self._fetch_soup(url)

        title = card.get("title") or self._extract_page_h1(soup)
        description_item = card.get("description") or ""
        description = description_item or self._extract_meta_description(soup)
        image_item = card.get("image_main") or ""

        image_main = image_item or self._extract_og_image(soup)
        image_detail = image_main or ""

        node = self._build_node(
            node_type="category",
            url=url,
            title=title,
            description=description,
            image_main=image_main,
            image_sub=[],
            extra={
                "description_item": description_item,
                "image_item": image_item,
                "image_detail": image_detail,
            },
        )

        ranges = self._extract_range_sections(soup, category_url=url)
        for range_card in ranges:
            range_node = self._crawl_range(range_card)
            node["children"].append(range_node)

        self._node_cache[url] = copy.deepcopy(node)
        return node

    def _crawl_range(self, card: Node) -> Node:
        range_url = card["url"]

        title = card.get("title", "")
        description = card.get("description", "")
        image_main = card.get("image_main", "")

        node = self._build_node(
            node_type="range",
            url=range_url,
            title=title,
            description=description,
            image_main=image_main,
            image_sub=card.get("image_sub", []),
            extra={
                "description_item": card.get("description_item", ""),
                "image_item": card.get("image_item", ""),
                "image_detail": card.get("image_detail", ""),
            },
        )

        range_product_count = 0
        for product_card in card.get("products", []):
            if (
                self.max_products_total is not None
                and self.product_count >= self.max_products_total
            ):
                break

            if self.max_products is not None and range_product_count >= self.max_products:
                break

            try:
                product_node = self._crawl_product(product_card)
            except requests.RequestException as exc:
                self._log(f"Skip product {product_card.get('url')}: {exc}")
                continue

            node["children"].append(product_node)
            range_product_count += 1

        return node

    def _crawl_product(self, card: Node) -> Node:
        url = card["url"]
        if url in self._node_cache:
            return copy.deepcopy(self._node_cache[url])

        soup = self._fetch_soup(url)

        title = card.get("title") or self._text(soup.select_one("h1.product_title"))
        short_description = self._extract_product_short_description(soup)
        full_description = self._extract_product_full_description(soup)

        description = short_description or full_description
        if short_description and full_description and full_description != short_description:
            description = short_description

        images = self._extract_product_images(soup)
        image_main = card.get("image_main") or (images[0] if images else "")

        image_sub: List[str] = []
        for image in images:
            if image and image != image_main and image not in image_sub:
                image_sub.append(image)

        additional_info = self._extract_additional_information(soup)
        product_meta = self._extract_product_meta(soup)
        features = self._extract_product_features(soup)

        node = self._build_node(
            node_type="product",
            url=url,
            title=title,
            description=description,
            image_main=image_main,
            image_sub=image_sub,
            extra={
                "image_item": card.get("image_main", ""),
                "image_detail": image_main,
                "description_full": full_description,
                "additional_information": additional_info,
                "specifications": additional_info,
                "product_meta": product_meta,
                "features": features,
            },
        )

        self.product_count += 1
        self._node_cache[url] = copy.deepcopy(node)
        return node


def flatten_tree(
    node: Node,
    parent_url: str = "",
    level: int = 0,
    path: Optional[List[str]] = None,
) -> List[Node]:
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

    optional_fields = [
        "description_item",
        "image_item",
        "image_detail",
        "description_full",
        "additional_information",
        "specifications",
        "product_meta",
        "features",
    ]

    for field in optional_fields:
        if field in node:
            flat_item[field] = node[field]

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


def rebrand_text(text: str, brand_name: str) -> str:
    """Rewrite brand phrases in text while preserving all URLs."""
    updated = text

    # Keep this order: specific phrases first, then broader brand token.
    updated = re.sub(
        r"\bAC\s+Stone\s+Group(?:['’]s)?\b",
        brand_name,
        updated,
        flags=re.IGNORECASE,
    )
    updated = re.sub(
        r"\bAC\s+Stone(?:['’]s)?\b",
        brand_name,
        updated,
        flags=re.IGNORECASE,
    )
    return updated


def rebrand_data(value: Any, brand_name: str) -> Any:
    if isinstance(value, dict):
        return {
            key: rebrand_data(child, brand_name=brand_name)
            for key, child in value.items()
        }

    if isinstance(value, list):
        return [
            rebrand_data(item, brand_name=brand_name)
            for item in value
        ]

    if isinstance(value, str):
        return rebrand_text(value, brand_name=brand_name)

    return value


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Crawl AC Stone hierarchy into a JSON file."
    )
    parser.add_argument(
        "--home-url",
        default="https://acstone.com.au/",
        help="Starting home page URL.",
    )
    parser.add_argument(
        "--output",
        default="scripts/pvstone_products_hierarchy_v2.json",
        help="Output JSON path.",
    )
    parser.add_argument(
        "--brand-name",
        default="PVStone",
        help="Brand name to write in exported content.",
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
        help="Limit product pages crawled per range (for testing).",
    )
    parser.add_argument(
        "--max-products-total",
        type=int,
        default=None,
        help="Limit total product pages crawled across all ranges.",
    )
    parser.add_argument(
        "--verbose",
        action="store_true",
        help="Print progress logs to stderr.",
    )

    return parser.parse_args()


def main() -> int:
    args = parse_args()

    crawler = ACStoneCrawlerV2(
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

    tree = rebrand_data(
        tree,
        brand_name=args.brand_name,
    )

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
