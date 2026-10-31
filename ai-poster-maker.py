from PIL import Image, ImageDraw, ImageFont, ImageFilter
from pathlib import Path
import sys

W, H = 1080, 1350

BASE_DIR = Path(__file__).resolve().parent
POSTER_DIR = BASE_DIR / "public" / "posters"
LOGO_PATH = BASE_DIR / "public" / "assets" / "sasikumar-ai-logo.png"

TAMIL = str(BASE_DIR / "public" / "assets" / "sasikumar-tamil.ttf")
TAMIL_BOLD = TAMIL
ENGLISH = str(BASE_DIR / "public" / "assets" / "sasikumar-roboto.ttf")

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
    message = "\n".join(poster_lines[1:]).strip() or title

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

    # Mixed Tamil + English text rendering.
    def is_tamil(ch):
        return "\u0B80" <= ch <= "\u0BFF"

    def mixed_runs(text):
        runs = []
        current = ""
        current_tamil = None

        for ch in text:
            tamil = is_tamil(ch)
            if current_tamil is not None and tamil != current_tamil:
                runs.append((current, current_tamil))
                current = ""
            current += ch
            current_tamil = tamil

        if current:
            runs.append((current, current_tamil))

        return runs

    def mixed_width(text, size):
        total = 0
        for part, tamil in mixed_runs(text):
            path = TAMIL_BOLD if tamil else ENGLISH
            f = font(path, size)
            total += draw.textlength(
                part, font=f, language="ta" if tamil else "en"
            )
        return total

    def draw_mixed_centered(text, y, size, fill, max_width):
        x = (W - mixed_width(text, size)) / 2

        for part, tamil in mixed_runs(text):
            path = TAMIL_BOLD if tamil else ENGLISH
            f = font(path, size)
            lang = "ta" if tamil else "en"

            draw.text(
                (round(x), y), part,
                font=f, fill=fill,
                anchor="lm", language=lang,
                stroke_width=1,
                stroke_fill=(0, 0, 0, 180)
            )
            x += draw.textlength(part, font=f, language=lang)

    # Fit title using both fonts.
    title_size = 48
    while title_size > 18 and mixed_width(title, title_size) > 900:
        title_size -= 1

    draw_mixed_centered(
        title, 835, title_size,
        (255, 225, 135), 900
    )

    # Wrap message by measured mixed-font width.
    message_size = 42
    while message_size > 18:
        if all(
            mixed_width(word, message_size) <= 850
            for word in message.split()
        ):
            break
        message_size -= 1

    lines = []
    current = ""

    for word in message.split():
        candidate = f"{current} {word}".strip()

        if mixed_width(candidate, message_size) <= 850:
            current = candidate
        else:
            if current:
                lines.append(current)
            current = word

    if current:
        lines.append(current)

    y = 920
    for line in lines[:5]:
        draw_mixed_centered(
            line, y, message_size,
            (255, 255, 255), 850
        )
        y += 57

    # Bottom brand logo and small footer.
    footer_logo = Image.open(LOGO_PATH).convert("RGBA")
    footer_logo.thumbnail((15, 15), Image.Resampling.LANCZOS)
    logo_x = (W - footer_logo.width) // 2
    bg.alpha_composite(footer_logo, (logo_x, 1200))

    draw = ImageDraw.Draw(bg)
    footer = "SASIKUMAR AI • CREATIVE INSPIRE"
    draw.text(
        (W//2, 1280), footer,
        font=font(ENGLISH, 18),
        fill=(255, 231, 180),
        anchor="mm"
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
