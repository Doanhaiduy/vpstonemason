#!/usr/bin/env python3
"""Batch add watermark and bottom-left stone label to reference images.

Example:
  python docs/image_temp/add_watermark_and_label.py \
    --input-dir docs/image_temp \
    --output-dir docs/image_temp/watermarked \
    --watermark-text "PVstoneau"
"""

from __future__ import annotations

import argparse
import re
from pathlib import Path
from typing import Dict, Iterable, Optional, Tuple

from PIL import Image, ImageDraw, ImageFont


SUPPORTED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".tif", ".tiff"}


def parse_args() -> argparse.Namespace:
    script_dir = Path(__file__).resolve().parent
    parser = argparse.ArgumentParser(
        description=(
            "Add text/image watermark and a bottom-left stone label to all images in a folder."
        )
    )
    parser.add_argument(
        "--input-dir",
        type=Path,
        default=script_dir,
        help="Folder containing source images (default: docs/image_temp).",
    )
    parser.add_argument(
        "--include-glob",
        type=str,
        default="*",
        help="Glob pattern relative to --input-dir (example: *-reference.jpg).",
    )
    parser.add_argument(
        "--output-dir",
        type=Path,
        default=script_dir / "watermarked",
        help="Folder to save processed images.",
    )
    parser.add_argument(
        "--manifest",
        type=Path,
        default=script_dir / "image-manifest.md",
        help="Markdown manifest with Stone + Stone Code + Local Path columns.",
    )
    parser.add_argument(
        "--watermark-text",
        type=str,
        default="PVstoneau",
        help="Watermark text shown in top-right. Set empty string to disable text watermark.",
    )
    parser.add_argument(
        "--watermark-image",
        type=Path,
        default=None,
        help="Optional logo image path (PNG recommended).",
    )
    parser.add_argument(
        "--watermark-opacity",
        type=float,
        default=0.24,
        help="Opacity for watermark in range 0..1 (default: 0.24).",
    )
    parser.add_argument(
        "--font-path",
        type=Path,
        default=None,
        help="Optional .ttf/.otf font path for watermark and label text.",
    )
    parser.add_argument(
        "--label-template",
        type=str,
        default="{name} ({code})",
        help=(
            "Label format placeholders: {name}, {code}. "
            "If stone name is unknown, code is used."
        ),
    )
    parser.add_argument(
        "--replace-original",
        action="store_true",
        help="Overwrite source images instead of writing to --output-dir.",
    )
    parser.add_argument(
        "--jpeg-quality",
        type=int,
        default=100,
        help="JPEG quality (1-100). Use 100 for minimal visible loss.",
    )
    parser.add_argument(
        "--lossless-png",
        action="store_true",
        help=(
            "Write output as PNG lossless to avoid extra JPEG recompression. "
            "Output extension becomes .png."
        ),
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Preview mapping and output paths without writing files.",
    )
    return parser.parse_args()


def clamp(value: float, min_value: float, max_value: float) -> float:
    return max(min_value, min(value, max_value))


def load_font(font_path: Optional[Path], size: int, bold: bool = False) -> ImageFont.FreeTypeFont:
    candidates = []
    if font_path:
        candidates.append(str(font_path))

    if bold:
        candidates.extend(["arialbd.ttf", "segoeuib.ttf", "DejaVuSans-Bold.ttf"])
    else:
        candidates.extend(["arial.ttf", "segoeui.ttf", "DejaVuSans.ttf"])

    for candidate in candidates:
        try:
            return ImageFont.truetype(candidate, size=size)
        except OSError:
            continue

    return ImageFont.load_default()


def parse_manifest_row(line: str) -> Optional[Tuple[str, str, str]]:
    # Expected row format:
    # | Atlantis | PV1016 | ... | docs/image_temp/2026-04-05-pv1016-reference.jpg | ... |
    if not line.strip().startswith("|"):
        return None

    parts = [part.strip() for part in line.split("|")]
    if len(parts) < 6:
        return None

    stone = parts[1]
    code = parts[2]
    local_path = parts[4]

    if not stone or stone.lower() == "stone":
        return None
    if not code or code.lower() == "stone code":
        return None
    if not local_path or local_path.lower() == "local path":
        return None

    return stone, code.upper(), local_path


def load_manifest_mapping(manifest_path: Path) -> Tuple[Dict[str, Tuple[str, str]], Dict[str, str]]:
    by_file: Dict[str, Tuple[str, str]] = {}
    by_code: Dict[str, str] = {}

    if not manifest_path.exists():
        return by_file, by_code

    content = manifest_path.read_text(encoding="utf-8")
    for line in content.splitlines():
        row = parse_manifest_row(line)
        if not row:
            continue
        stone_name, stone_code, local_path = row

        file_name = Path(local_path.replace("\\", "/")).name.lower()
        by_file[file_name] = (stone_name, stone_code)
        by_code[stone_code.lower()] = stone_name

    return by_file, by_code


def infer_code_from_filename(file_name: str) -> Optional[str]:
    match = re.search(r"(pv\d{4})", file_name, flags=re.IGNORECASE)
    if not match:
        return None
    return match.group(1).upper()


def get_stone_label(
    image_path: Path,
    by_file: Dict[str, Tuple[str, str]],
    by_code: Dict[str, str],
    label_template: str,
) -> str:
    file_key = image_path.name.lower()

    if file_key in by_file:
        stone_name, code = by_file[file_key]
        return label_template.format(name=stone_name, code=code)

    code = infer_code_from_filename(image_path.name)
    if not code:
        return image_path.stem

    stone_name = by_code.get(code.lower())
    if not stone_name:
        return code

    return label_template.format(name=stone_name, code=code)


def add_text_watermark(
    layer: Image.Image,
    text: str,
    opacity: float,
    font_path: Optional[Path],
) -> None:
    if not text:
        return

    draw = ImageDraw.Draw(layer)
    width, height = layer.size

    font_size = int(clamp(min(width, height) * 0.038, 24, 120))
    margin = int(clamp(min(width, height) * 0.022, 12, 80))
    stroke_width = max(1, font_size // 18)
    font = load_font(font_path, font_size, bold=True)

    bbox = draw.textbbox((0, 0), text, font=font, stroke_width=stroke_width)
    text_w = bbox[2] - bbox[0]

    x = width - text_w - margin
    y = margin

    alpha = int(255 * clamp(opacity, 0.0, 1.0))
    stroke_alpha = int(255 * clamp(opacity + 0.30, 0.0, 1.0))

    draw.text(
        (x, y),
        text,
        fill=(255, 255, 255, alpha),
        font=font,
        stroke_width=stroke_width,
        stroke_fill=(0, 0, 0, stroke_alpha),
    )


def add_logo_watermark(
    layer: Image.Image,
    logo_path: Path,
    opacity: float,
) -> None:
    if not logo_path.exists():
        raise FileNotFoundError(f"Watermark image not found: {logo_path}")

    base_w, base_h = layer.size
    margin = int(clamp(min(base_w, base_h) * 0.022, 12, 80))
    target_w = int(clamp(base_w * 0.18, 120, 560))

    with Image.open(logo_path) as logo_img:
        logo = logo_img.convert("RGBA")
        ratio = target_w / logo.width
        target_h = max(1, int(logo.height * ratio))
        logo = logo.resize((target_w, target_h), Image.Resampling.LANCZOS)

        alpha_band = logo.getchannel("A")
        alpha_band = alpha_band.point(lambda p: int(p * clamp(opacity, 0.0, 1.0)))
        logo.putalpha(alpha_band)

        x = base_w - logo.width - margin
        y = margin
        layer.alpha_composite(logo, (x, y))


def add_bottom_left_label(
    layer: Image.Image,
    label: str,
    font_path: Optional[Path],
) -> None:
    draw = ImageDraw.Draw(layer)
    width, height = layer.size

    font_size = int(clamp(min(width, height) * 0.032, 20, 80))
    font = load_font(font_path, font_size, bold=True)
    margin = int(clamp(min(width, height) * 0.022, 12, 80))
    pad_x = int(clamp(font_size * 0.55, 10, 32))
    pad_y = int(clamp(font_size * 0.42, 8, 22))
    stroke_width = max(1, font_size // 20)

    bbox = draw.textbbox((0, 0), label, font=font, stroke_width=stroke_width)
    text_w = bbox[2] - bbox[0]
    text_h = bbox[3] - bbox[1]

    x0 = margin
    y1 = height - margin
    x1 = x0 + text_w + (pad_x * 2)
    y0 = y1 - text_h - (pad_y * 2)

    radius = int(clamp(font_size * 0.35, 6, 30))

    draw.rounded_rectangle(
        [(x0, y0), (x1, y1)],
        radius=radius,
        fill=(0, 0, 0, 150),
    )

    draw.text(
        (x0 + pad_x, y0 + pad_y - 1),
        label,
        font=font,
        fill=(255, 255, 255, 245),
        stroke_width=stroke_width,
        stroke_fill=(0, 0, 0, 180),
    )


def gather_images(folder: Path, include_glob: str) -> Iterable[Path]:
    for path in sorted(folder.glob(include_glob)):
        if path.is_file() and path.suffix.lower() in SUPPORTED_EXTENSIONS:
            yield path


def save_preserving_quality(
    image_rgba: Image.Image,
    source_path: Path,
    output_path: Path,
    jpeg_quality: int,
    exif_data: Optional[bytes],
    icc_profile: Optional[bytes],
    force_png: bool,
) -> None:
    ext = source_path.suffix.lower()
    save_kwargs = {}

    if icc_profile:
        save_kwargs["icc_profile"] = icc_profile

    if force_png:
        image_rgba.save(output_path, compress_level=3, **save_kwargs)
        return

    if exif_data:
        save_kwargs["exif"] = exif_data

    if ext in {".jpg", ".jpeg"}:
        rgb = image_rgba.convert("RGB")
        rgb.save(
            output_path,
            quality=int(clamp(jpeg_quality, 1, 100)),
            subsampling=0,
            optimize=True,
            **save_kwargs,
        )
        return

    if ext == ".png":
        image_rgba.save(output_path, compress_level=3, **save_kwargs)
        return

    if ext == ".webp":
        image_rgba.save(output_path, quality=100, method=6, **save_kwargs)
        return

    image_rgba.save(output_path, **save_kwargs)


def process_image(
    image_path: Path,
    output_path: Path,
    label: str,
    watermark_text: str,
    watermark_image: Optional[Path],
    watermark_opacity: float,
    font_path: Optional[Path],
    jpeg_quality: int,
    force_png: bool,
    dry_run: bool,
) -> None:
    if dry_run:
        print(f"DRY  {image_path.name} -> {output_path.name} | label='{label}'")
        return

    with Image.open(image_path) as src:
        exif_data = src.info.get("exif")
        icc_profile = src.info.get("icc_profile")

        base = src.convert("RGBA")
        overlay = Image.new("RGBA", base.size, (0, 0, 0, 0))

        if watermark_image:
            add_logo_watermark(overlay, watermark_image, watermark_opacity)
        if watermark_text:
            add_text_watermark(overlay, watermark_text, watermark_opacity, font_path)

        add_bottom_left_label(overlay, label, font_path)

        merged = Image.alpha_composite(base, overlay)

        output_path.parent.mkdir(parents=True, exist_ok=True)
        save_preserving_quality(
            merged,
            source_path=image_path,
            output_path=output_path,
            jpeg_quality=jpeg_quality,
            exif_data=exif_data,
            icc_profile=icc_profile,
            force_png=force_png,
        )


def main() -> int:
    args = parse_args()

    input_dir = args.input_dir.resolve()
    output_dir = args.output_dir.resolve()
    manifest_path = args.manifest.resolve()

    if args.replace_original and args.lossless_png:
        raise ValueError("--replace-original cannot be used with --lossless-png")

    if not input_dir.exists() or not input_dir.is_dir():
        raise FileNotFoundError(f"Input directory not found: {input_dir}")

    by_file, by_code = load_manifest_mapping(manifest_path)
    images = list(gather_images(input_dir, args.include_glob))

    if not images:
        print(f"No supported images found in: {input_dir}")
        return 0

    print(f"Found {len(images)} image(s) in {input_dir}")
    if manifest_path.exists():
        print(f"Manifest loaded: {manifest_path}")
    else:
        print("Manifest missing: fallback to filename-derived labels")

    processed = 0
    for image_path in images:
        label = get_stone_label(image_path, by_file, by_code, args.label_template)
        output_name = image_path.name
        if args.lossless_png and not args.replace_original:
            output_name = f"{image_path.stem}.png"

        out_path = image_path if args.replace_original else output_dir / output_name

        process_image(
            image_path=image_path,
            output_path=out_path,
            label=label,
            watermark_text=args.watermark_text.strip(),
            watermark_image=args.watermark_image,
            watermark_opacity=clamp(args.watermark_opacity, 0.0, 1.0),
            font_path=args.font_path,
            jpeg_quality=args.jpeg_quality,
            force_png=args.lossless_png,
            dry_run=args.dry_run,
        )
        processed += 1
        print(f"OK   {image_path.name} -> {out_path}")

    print(f"Done. Processed {processed} image(s).")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())