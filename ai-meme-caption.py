from PIL import Image, ImageDraw, ImageFont, ImageOps
from pathlib import Path
import sys
import re

ROOT = Path(__file__).resolve().parent
TA_FONT = ROOT / "public/assets/fonts/NotoSansTamil-VF.ttf"
EN_FONT = ROOT / "public/assets/fonts/DejaVuSans.ttf"

def font_for(text, size):
    path = TA_FONT if re.search(r"[\u0B80-\u0BFF]", text) else EN_FONT
    if not path.is_file():
        raise FileNotFoundError(f"Missing font: {path}")
    return ImageFont.truetype(
        str(path), size, layout_engine=ImageFont.Layout.RAQM
    )

def main():
    if len(sys.argv) != 4:
        raise SystemExit("Usage: ai-meme-caption.py INPUT PUNCHLINE OUTPUT")

    source = Path(sys.argv[1])
    text = str(sys.argv[2]).strip()
    output = Path(sys.argv[3])
    if not source.is_file() or not text:
        raise ValueError("Meme image or punchline is missing.")

    img = Image.open(source).convert("RGBA")
    img = ImageOps.fit(
        img,
        (1080, 1350),
        method=Image.Resampling.LANCZOS,
        centering=(0.5, 0.5)
    )
    w, h = img.size
    draw = ImageDraw.Draw(img)

    panel_h = min(340, max(230, h // 4))
    panel_y = h - panel_h

    draw.rectangle((0, panel_y, w, h), fill=(255, 226, 92, 248))
    draw.rectangle((0, panel_y, w, panel_y + 12), fill=(235, 65, 125, 255))

    max_width = w - 100
    size = max(34, min(58, w // 16))
    lines = []

    while size >= 30:
        font = font_for(text, size)
        lines = []
        current = ""
        for word in text.split():
            candidate = (current + " " + word).strip()
            if draw.textlength(candidate, font=font) <= max_width:
                current = candidate
            else:
                if current:
                    lines.append(current)
                current = word
        if current:
            lines.append(current)
        if len(lines) <= 3:
            break
        size -= 3

    if len(lines) > 3:
        lines = lines[:3]
        lines[-1] = lines[-1].rstrip(" .") + "…"

    font = font_for(text, size)
    line_h = size + 18
    total_h = len(lines) * line_h
    y = panel_y + max(24, (panel_h - total_h - 48) // 2)

    for line in lines:
        draw.text(
            (w // 2, y), line, font=font, fill=(35, 35, 45, 255),
            anchor="mt", align="center"
        )
        y += line_h

    brand_font = ImageFont.truetype(str(EN_FONT), max(16, w // 55))
    draw.text(
        (w // 2, h - 18), "SASIKUMAR AI STUDIO",
        font=brand_font, fill=(55, 55, 75, 255), anchor="ms"
    )

    output.parent.mkdir(parents=True, exist_ok=True)
    img.convert("RGB").save(output, "PNG", optimize=True)
    print("MEME CAPTION CREATED:", output, img.size)

if __name__ == "__main__":
    main()
