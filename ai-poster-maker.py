from PIL import Image, ImageDraw, ImageFont, ImageFilter
from pathlib import Path
import sys

W, H = 1080, 1350

POSTER_DIR = Path("public/posters")
LOGO_PATH = Path("public/assets/sasikumar-ai-logo.png")

TAMIL = "/system/fonts/SECTamil-Regular.otf"
TAMIL_BOLD = "/system/fonts/SECTamil-Bold.otf"
ENGLISH = "/system/fonts/Roboto-Regular.ttf"

def font(path, size):
    return ImageFont.truetype(
        path, size, layout_engine=ImageFont.Layout.RAQM
    )

def fit_text(draw, text, path, max_size, max_width):
    for size in range(max_size, 17, -1):
        f = font(path, size)
        box = draw.textbbox((0, 0), text, font=f, language="ta")
        if box[2] - box[0] <= max_width:
            return f
    return font(path, 18)

def main():
    if len(sys.argv) < 3:
        print("Usage: python ai-poster-maker.py BACKGROUND_IMAGE TAMIL_TEXT")
        sys.exit(2)

    background_path = Path(sys.argv[1])
    poster_text = sys.argv[2].strip()
    poster_lines = [
        line.strip() for line in poster_text.splitlines()
        if line.strip()
    ]
    title = poster_lines[0] if poster_lines else "இனிய நாள் வாழ்த்துகள்!"
    message = "\\n".join(poster_lines[1:])

    if not background_path.is_file():
        raise FileNotFoundError(f"Background image not found: {background_path}")

    if not message:
        raise ValueError("Please provide Tamil poster text.")

    if not LOGO_PATH.is_file():
        raise FileNotFoundError(f"Logo not found: {LOGO_PATH}")

    POSTER_DIR.mkdir(parents=True, exist_ok=True)

    # Load and crop the AI background to a 4:5 portrait poster.
    bg = Image.open(background_path).convert("RGB")
    ratio = max(W / bg.width, H / bg.height)
    bg = bg.resize(
        (round(bg.width * ratio), round(bg.height * ratio)),
        Image.Resampling.LANCZOS
    )
    left = (bg.width - W) // 2
    top = (bg.height - H) // 2
    bg = bg.crop((left, top, left + W, top + H)).convert("RGBA")

    # Add a gentle dark overlay so the text remains readable.
    overlay = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    od = ImageDraw.Draw(overlay)
    od.rectangle((0, 0, W, 220), fill=(0, 0, 0, 125))
    od.rounded_rectangle(
        (55, 780, W - 55, 1195),
        radius=42,
        fill=(0, 0, 0, 145),
        outline=(255, 218, 130, 230),
        width=3
    )
    bg = Image.alpha_composite(bg, overlay)

    draw = ImageDraw.Draw(bg)

    # Logo badge.
    logo = Image.open(LOGO_PATH).convert("RGBA")
    logo.thumbnail((120, 120), Image.Resampling.LANCZOS)
    draw.ellipse((35, 28, 175, 168), fill=(255, 255, 255, 255))
    bg.alpha_composite(logo, (45 + (120-logo.width)//2, 38 + (120-logo.height)//2))
    draw = ImageDraw.Draw(bg)

    # Brand header.
    brand_font = font(ENGLISH, 45)
    draw.text(
        (185, 55), "SASIKUMAR AI",
        font=brand_font, fill=(255, 255, 255),
        stroke_width=2, stroke_fill=(0, 0, 0, 150)
    )
    draw.text(
        (188, 116), "YOUR DIGITAL CREATIVE STUDIO",
        font=font(ENGLISH, 21), fill=(255, 225, 155)
    )

    # Tamil title and message.
    title_font = fit_text(draw, title, TAMIL_BOLD, 48, 900)
    draw.text(
        (W//2, 835), title,
        font=title_font, fill=(255, 225, 135),
        anchor="mm", language="ta",
        stroke_width=2, stroke_fill=(30, 25, 15)
    )

    message_font = fit_text(draw, message, TAMIL_BOLD, 42, 860)
    lines = []
    current = ""
    for word in message.split():
        candidate = f"{current} {word}".strip()
        if draw.textbbox((0, 0), candidate, font=message_font, language="ta")[2] <= 850:
            current = candidate
        else:
            if current:
                lines.append(current)
            current = word
    if current:
        lines.append(current)

    y = 920
    for line in lines[:5]:
        draw.text(
            (W//2, y), line, font=message_font,
            fill=(255, 255, 255), anchor="mm", language="ta",
            stroke_width=1, stroke_fill=(0, 0, 0, 180)
        )
        y += 57

    # Small footer.
    footer = "SASIKUMAR AI • CREATE • INSPIRE"
    draw.text(
        (W//2, 1240), footer,
        font=font(ENGLISH, 25), fill=(255, 231, 180), anchor="mm"
    )

    output = Path(sys.argv[3]) if len(sys.argv) > 3 else (
        POSTER_DIR / "sasikumar-ai-tamil-poster.png"
    )
    output.parent.mkdir(parents=True, exist_ok=True)
    bg.convert("RGB").save(output, "PNG", optimize=True)
    print(f"AI POSTER CREATED: {output}")
    print(f"Size: {W} x {H}")

if __name__ == "__main__":
    main()
