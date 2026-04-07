#!/usr/bin/env python3
"""Batch watermark and label stone images for Facebook posts.

Designed around a folder-based workflow:
  - SINGLE stone post:  posts/2026-04-05-VP1017/raw/  →  .../final/
  - MULTI stone post:   posts/2026-04-05-collection/VP1017/raw/  →  .../final/

Supports both folder roots:
    - .github/stone-content/posts/
    - .github/stone-content/output/

The stone code is detected from the FOLDER name (not the image filename),
so AI-generated images with random names work perfectly.

Quick usage:
    # From tools folder:
    python add_watermark_and_label.py --post 2026-04-05-VP1017

    # From stone-content folder:
    python tools/add_watermark_and_label.py --post 2026-04-05-collection

Full usage:
  python tools/add_watermark_and_label.py --input-dir <path> --stone-code VP1017
"""

from __future__ import annotations

import argparse
import re
import sys
from pathlib import Path
from typing import Dict, List, Optional, Tuple

from PIL import Image, ImageDraw, ImageFont

# ── Constants ──────────────────────────────────────────────────────────────

SUPPORTED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".tif", ".tiff"}
SCRIPT_DIR = Path(__file__).resolve().parent
CONTENT_MEDIA_DIR = SCRIPT_DIR.parent
POSTS_DIR = CONTENT_MEDIA_DIR / "posts"
OUTPUT_DIR = CONTENT_MEDIA_DIR / "output"

# Stone name lookup (VP code → display name).
# Agent auto-generates this, or user can edit.
STONE_NAMES: Dict[str, str] = {
    "VP1017": "Amazonite",
    "VP1019": "Arabescato Corchia",
    "VP1016": "Atlantis",
    "VP1015": "Magma Gold",
    "VP6010": "Dolomite",
    "VP6011": "Calacatta",
    "VP0806": "Opal",
    "VP8020": "Nero Marquina",
    "VP3044": "Pure White",
}


# ── CLI ────────────────────────────────────────────────────────────────────

def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Add PVStoneau watermark and stone code label to images.",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Process a single-stone post folder:
  python tools/add_watermark_and_label.py --post 2026-04-05-VP1017

  # Process a multi-stone post folder (auto-detects subfolders):
  python tools/add_watermark_and_label.py --post 2026-04-05-collection

  # Process arbitrary folder with explicit stone code:
  python tools/add_watermark_and_label.py --input-dir ./my-images --stone-code VP1017

  # Dry run (preview without writing):
  python tools/add_watermark_and_label.py --post 2026-04-05-VP1017 --dry-run
""",
    )

    # ── Input mode (mutually exclusive) ──
    group = parser.add_mutually_exclusive_group(required=True)
    group.add_argument(
        "--post",
        type=str,
        help="Post folder name inside content-media/output/ or content-media/posts/ (e.g. 2026-04-05-VP1017)",
    )
    group.add_argument(
        "--input-dir",
        type=Path,
        help="Explicit input directory containing images.",
    )

    # ── Options ──
    parser.add_argument(
        "--stone-code",
        type=str,
        default=None,
        help="Override stone code for label (e.g. VP1017). Required with --input-dir.",
    )
    parser.add_argument(
        "--stone-name",
        type=str,
        default=None,
        help="Override stone display name (e.g. Amazonite).",
    )
    parser.add_argument(
        "--output-dir",
        type=Path,
        default=None,
        help="Override output directory (default: auto-created 'final' folder).",
    )
    parser.add_argument(
        "--watermark-text",
        type=str,
        default="PVStoneau",
        help="Brand watermark text (top-right). Empty to disable.",
    )
    parser.add_argument(
        "--watermark-image",
        type=Path,
        default=None,
        help="Optional logo image (PNG) for watermark.",
    )
    parser.add_argument(
        "--watermark-opacity",
        type=float,
        default=0.24,
        help="Watermark opacity 0.0–1.0 (default: 0.24).",
    )
    parser.add_argument(
        "--font-path",
        type=Path,
        default=None,
        help="Custom .ttf/.otf font path.",
    )
    parser.add_argument(
        "--label-template",
        type=str,
        default="{name} | {code}",
        help="Label format. Placeholders: {name}, {code}.",
    )
    parser.add_argument(
        "--jpeg-quality",
        type=int,
        default=100,
        help="JPEG output quality 1-100 (default: 100 for best quality).",
    )
    parser.add_argument(
        "--lossless-png",
        action="store_true",
        help="Output as lossless PNG (avoids JPEG recompression).",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Preview mapping without writing files.",
    )

    return parser.parse_args()


# ── Helpers ────────────────────────────────────────────────────────────────

def clamp(value: float, lo: float, hi: float) -> float:
    return max(lo, min(value, hi))


def load_font(font_path: Optional[Path], size: int, bold: bool = False) -> ImageFont.FreeTypeFont:
    candidates = []
    if font_path:
        candidates.append(str(font_path))
    if bold:
        candidates.extend(["arialbd.ttf", "segoeuib.ttf", "DejaVuSans-Bold.ttf"])
    else:
        candidates.extend(["arial.ttf", "segoeui.ttf", "DejaVuSans.ttf"])
    for c in candidates:
        try:
            return ImageFont.truetype(c, size=size)
        except OSError:
            continue
    return ImageFont.load_default()


def extract_vp_code(text: str) -> Optional[str]:
    """Extract VP/PV code from a string (case-insensitive)."""
    match = re.search(r"\b(VP|PV)(\d{3,5})\b", text, flags=re.IGNORECASE)
    if match:
        return f"VP{match.group(2)}"
    return None


def get_stone_name(code: str, override_name: Optional[str] = None) -> str:
    """Get display name for a stone code."""
    if override_name:
        return override_name
    return STONE_NAMES.get(code.upper(), "")


def format_label(code: str, name: str, template: str) -> str:
    """Format the bottom-left label."""
    if name:
        return template.format(name=name, code=code)
    return code


# ── Drawing ────────────────────────────────────────────────────────────────

def add_text_watermark(
    layer: Image.Image, text: str, opacity: float, font_path: Optional[Path]
) -> None:
    if not text:
        return
    draw = ImageDraw.Draw(layer)
    w, h = layer.size
    font_size = int(clamp(min(w, h) * 0.038, 24, 120))
    margin = int(clamp(min(w, h) * 0.022, 12, 80))
    stroke_w = max(1, font_size // 18)
    font = load_font(font_path, font_size, bold=True)
    bbox = draw.textbbox((0, 0), text, font=font, stroke_width=stroke_w)
    tw = bbox[2] - bbox[0]
    alpha = int(255 * clamp(opacity, 0.0, 1.0))
    stroke_alpha = int(255 * clamp(opacity + 0.30, 0.0, 1.0))
    draw.text(
        (w - tw - margin, margin), text,
        fill=(255, 255, 255, alpha), font=font,
        stroke_width=stroke_w, stroke_fill=(0, 0, 0, stroke_alpha),
    )


def add_logo_watermark(layer: Image.Image, logo_path: Path, opacity: float) -> None:
    if not logo_path or not logo_path.exists():
        return
    bw, bh = layer.size
    margin = int(clamp(min(bw, bh) * 0.022, 12, 80))
    target_w = int(clamp(bw * 0.18, 120, 560))
    with Image.open(logo_path) as logo_img:
        logo = logo_img.convert("RGBA")
        ratio = target_w / logo.width
        logo = logo.resize((target_w, max(1, int(logo.height * ratio))), Image.Resampling.LANCZOS)
        alpha_band = logo.getchannel("A")
        alpha_band = alpha_band.point(lambda p: int(p * clamp(opacity, 0.0, 1.0)))
        logo.putalpha(alpha_band)
        layer.alpha_composite(logo, (bw - logo.width - margin, margin))


def add_bottom_left_label(
    layer: Image.Image, label: str, font_path: Optional[Path]
) -> None:
    draw = ImageDraw.Draw(layer)
    w, h = layer.size
    font_size = int(clamp(min(w, h) * 0.032, 20, 80))
    font = load_font(font_path, font_size, bold=True)
    margin = int(clamp(min(w, h) * 0.022, 12, 80))
    pad_x = int(clamp(font_size * 0.55, 10, 32))
    pad_y = int(clamp(font_size * 0.42, 8, 22))
    stroke_w = max(1, font_size // 20)
    bbox = draw.textbbox((0, 0), label, font=font, stroke_width=stroke_w)
    tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
    x0, y1 = margin, h - margin
    x1, y0 = x0 + tw + pad_x * 2, y1 - th - pad_y * 2
    radius = int(clamp(font_size * 0.35, 6, 30))
    draw.rounded_rectangle([(x0, y0), (x1, y1)], radius=radius, fill=(0, 0, 0, 150))
    draw.text(
        (x0 + pad_x, y0 + pad_y - 1), label, font=font,
        fill=(255, 255, 255, 245), stroke_width=stroke_w, stroke_fill=(0, 0, 0, 180),
    )


# ── Image Processing ──────────────────────────────────────────────────────

def gather_images(folder: Path) -> List[Path]:
    return sorted(
        p for p in folder.iterdir()
        if p.is_file() and p.suffix.lower() in SUPPORTED_EXTENSIONS
    )


def save_image(
    image_rgba: Image.Image, source_path: Path, output_path: Path,
    jpeg_quality: int, force_png: bool,
) -> None:
    """Save with maximum quality preservation."""
    with Image.open(source_path) as src:
        exif_data = src.info.get("exif")
        icc_profile = src.info.get("icc_profile")

    save_kw = {}
    if icc_profile:
        save_kw["icc_profile"] = icc_profile

    output_path.parent.mkdir(parents=True, exist_ok=True)

    if force_png:
        out = output_path.with_suffix(".png")
        image_rgba.save(out, compress_level=3, **save_kw)
        return

    if exif_data:
        save_kw["exif"] = exif_data

    ext = source_path.suffix.lower()
    if ext in {".jpg", ".jpeg"}:
        rgb = image_rgba.convert("RGB")
        rgb.save(output_path, quality=jpeg_quality, subsampling=0, optimize=True, **save_kw)
    elif ext == ".png":
        image_rgba.save(output_path, compress_level=3, **save_kw)
    elif ext == ".webp":
        image_rgba.save(output_path, quality=100, method=6, **save_kw)
    else:
        image_rgba.save(output_path, **save_kw)


def process_single_image(
    image_path: Path, output_path: Path, label: str,
    watermark_text: str, watermark_image: Optional[Path],
    watermark_opacity: float, font_path: Optional[Path],
    jpeg_quality: int, force_png: bool,
) -> None:
    with Image.open(image_path) as src:
        base = src.convert("RGBA")

    overlay = Image.new("RGBA", base.size, (0, 0, 0, 0))
    if watermark_image:
        add_logo_watermark(overlay, watermark_image, watermark_opacity)
    if watermark_text:
        add_text_watermark(overlay, watermark_text, watermark_opacity, font_path)
    add_bottom_left_label(overlay, label, font_path)

    merged = Image.alpha_composite(base, overlay)
    save_image(merged, image_path, output_path, jpeg_quality, force_png)


# ── Post Folder Logic ─────────────────────────────────────────────────────

def detect_post_type(post_dir: Path) -> str:
    """Detect if post folder is 'single' or 'multi' stone."""
    # If subfolders have VP codes, it's multi
    for child in post_dir.iterdir():
        if child.is_dir() and extract_vp_code(child.name):
            return "multi"
    # If folder name contains VP code, it's single
    if extract_vp_code(post_dir.name):
        return "single"
    # If there's a 'raw' subfolder, it's single
    if (post_dir / "raw").is_dir():
        return "single"
    # Check if any subfirectory has 'raw' inside (multi)
    for child in post_dir.iterdir():
        if child.is_dir() and (child / "raw").is_dir():
            return "multi"
    return "single"


def resolve_jobs(args: argparse.Namespace) -> List[Tuple[Path, Path, str, str]]:
    """
    Returns list of (input_dir, output_dir, stone_code, stone_name) tuples.
    Each tuple = one batch of images to watermark with the same label.
    """
    jobs: List[Tuple[Path, Path, str, str]] = []

    if args.input_dir:
        # Explicit input mode
        input_dir = args.input_dir.resolve()
        code = args.stone_code or extract_vp_code(input_dir.name) or "UNKNOWN"
        name = get_stone_name(code, args.stone_name)
        output_dir = args.output_dir or input_dir.parent / "final"
        jobs.append((input_dir, output_dir.resolve(), code, name))
        return jobs

    # Post mode
    post_dir = OUTPUT_DIR / args.post
    if not post_dir.exists():
        post_dir = POSTS_DIR / args.post

    if not post_dir.exists():
        print(
            "❌ Post folder not found in either location:\n"
            f"   - {OUTPUT_DIR / args.post}\n"
            f"   - {POSTS_DIR / args.post}"
        )
        sys.exit(1)

    post_type = detect_post_type(post_dir)

    if post_type == "single":
        code = args.stone_code or extract_vp_code(post_dir.name) or "UNKNOWN"
        name = get_stone_name(code, args.stone_name)
        raw_dir = post_dir / "raw"
        if not raw_dir.is_dir():
            # Fallback: images directly in post folder
            raw_dir = post_dir
        output_dir = args.output_dir or post_dir / "final"
        jobs.append((raw_dir, output_dir.resolve(), code, name))
    else:
        # Multi-stone: each subfolder with a VP code
        output_dir = args.output_dir or post_dir / "final"
        for child in sorted(post_dir.iterdir()):
            if not child.is_dir():
                continue
            code = extract_vp_code(child.name)
            if not code:
                continue
            raw_dir = child / "raw" if (child / "raw").is_dir() else child
            name = get_stone_name(code, None)
            jobs.append((raw_dir, output_dir.resolve(), code, name))

    return jobs


# ── Main ───────────────────────────────────────────────────────────────────

def main() -> int:
    args = parse_args()
    jobs = resolve_jobs(args)

    if not jobs:
        print("❌ No image jobs found. Check your folder structure.")
        return 1

    total_processed = 0
    summary: List[dict] = []

    for input_dir, output_dir, code, name in jobs:
        label = format_label(code, name, args.label_template)
        images = gather_images(input_dir)

        if not images:
            print(f"⚠️  No images in: {input_dir}")
            continue

        print(f"\n{'━' * 60}")
        print(f"📁 Input:  {input_dir}")
        print(f"📁 Output: {output_dir}")
        print(f"🏷️  Label:  {label}")
        print(f"🖼️  Images: {len(images)}")
        print(f"{'━' * 60}")

        for img_path in images:
            out_name = img_path.name
            if args.lossless_png:
                out_name = f"{img_path.stem}.png"
            out_path = output_dir / out_name

            if args.dry_run:
                print(f"  DRY  {img_path.name} → {out_path.name}  label='{label}'")
            else:
                process_single_image(
                    image_path=img_path,
                    output_path=out_path,
                    label=label,
                    watermark_text=args.watermark_text.strip(),
                    watermark_image=args.watermark_image,
                    watermark_opacity=clamp(args.watermark_opacity, 0.0, 1.0),
                    font_path=args.font_path,
                    jpeg_quality=args.jpeg_quality,
                    force_png=args.lossless_png,
                )
                print(f"  ✅  {img_path.name} → {out_path.name}")

            total_processed += 1

        summary.append({
            "stone_code": code,
            "stone_name": name,
            "label": label,
            "images_count": len(images),
            "input_dir": str(input_dir),
            "output_dir": str(output_dir),
        })

    # Print summary
    print(f"\n{'═' * 60}")
    print(f"✅ Done! {total_processed} image(s) processed.")
    for s in summary:
        print(f"   {s['stone_code']}: {s['images_count']} images → {s['output_dir']}")
    print(f"{'═' * 60}")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
