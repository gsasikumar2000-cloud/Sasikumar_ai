from PIL import Image, ImageDraw, ImageFont, ImageFilter
from pathlib import Path
import sys
import re

W, H = 1080, 1350
ROOT = Path(__file__).resolve().parent
TA_FONT = ROOT / "public/assets/fonts/NotoSansTamil-VF.ttf"
EN_FONT = ROOT / "public/assets/fonts/DejaVuSans.ttf"
LOGO_PATH = ROOT / "public/assets/sasikumar-ai-logo.lossless.webp"

def has_tamil(text):
    return bool(re.search(r"[\u0B80-\u0BFF]", text))

def get_font(text, size):
    path = TA_FONT if has_tamil(text) else EN_FONT
    if not path.is_file():
        raise FileNotFoundError(f"Missing font: {path}")
    return ImageFont.truetype(
        str(path), size, layout_engine=ImageFont.Layout.RAQM
    )

def wrap_mixed(draw, text, size, max_width):
    words = text.split()
    lines, current = [], []
    for word in words:
        candidate = current + [word]
        width = sum(
            draw.textlength(w, font=get_font(w, size)) for w in candidate
        ) + draw.textlength(" ", font=get_font("A", size)) * (len(candidate)-1)
        if width <= max_width or not current:
            current = candidate
        else:
            lines.append(current)
            current = [word]
    if current:
        lines.append(current)
    return lines

def draw_mixed(draw, xy, words, size, fill, stroke_width=0, stroke_fill=None):
    x, y = xy
    space = draw.textlength(" ", font=get_font("A", size))
    for word in words:
        font = get_font(word, size)
        draw.text(
            (x, y), word, font=font, fill=fill,
            stroke_width=stroke_width, stroke_fill=stroke_fill
        )
        x += draw.textlength(word, font=font) + space

def clean_title(text):
    text = re.sub(
        r'பற்றி\s*.*$|ஒரு அழகான.*$|தமிழ் போஸ்டர்.*$|போஸ்டர் உருவாக்கு.*$|about\s+.*$|make\s+.*poster.*$',
        '', text, flags=re.I
    )
    text = re.sub(r'^(தயவுசெய்து|தயவு செய்து)\s*', '', text)
    return text.strip(' :-–—')

def main():
    if len(sys.argv) < 3:
        print("Usage: python ai-poster-maker.py BACKGROUND_IMAGE TEXT [OUTPUT]")
        sys.exit(2)

    source = Path(sys.argv[1])
    content = sys.argv[2].strip()
    if not source.is_file():
        raise FileNotFoundError(source)

    parts = [line.strip() for line in content.splitlines() if line.strip()]
    explicit_title = sys.argv[4].strip() if len(sys.argv) > 4 else ""
    title = clean_title(explicit_title) if explicit_title else (
        clean_title(parts[0]) if parts else "வணக்கம்"
    )
    if not title:
        title = parts[0] if parts else "வணக்கம்"
    body = "\n".join(parts[1:]).strip()

    img = Image.open(source).convert("RGB")
    ratio = max(W / img.width, H / img.height)
    img = img.resize(
        (round(img.width * ratio), round(img.height * ratio)),
        Image.Resampling.LANCZOS
    )
    left = (img.width - W) // 2
    top = (img.height - H) // 2
    img = img.crop((left, top, left + W, top + H))
    img = img.filter(
        ImageFilter.UnsharpMask(radius=1.5, percent=125, threshold=3)
    ).convert("RGBA")

    # TOP HD IMAGE + CLEAN BOTTOM TEXT AND BRANDING PANEL
    draw = ImageDraw.Draw(img)

    panel_top = 850
    draw.rectangle((0, panel_top, W, H), fill=(255, 255, 255, 255))
    draw.rectangle((0, panel_top, W, panel_top + 5), fill=(30, 110, 210, 255))

    # Poster title
    title_size = 48
    title_lines = wrap_mixed(draw, title, title_size, 930)[:2]
    y = 890
    for words in title_lines:
        draw_mixed(draw, (70, y), words, title_size, (20, 35, 55, 255))
        y += 62

    # Poster body, fitted into the available clean area
    y += 8
    if body:
        body_size = 29
        body_lines = []
        for paragraph in body.splitlines():
            paragraph = paragraph.strip()
            if paragraph:
                body_lines.extend(wrap_mixed(draw, paragraph, body_size, 930))

        max_body_lines = 5
        for words in body_lines[:max_body_lines]:
            draw_mixed(draw, (74, y), words, body_size, (35, 45, 60, 255))
            y += 43

    # Original SASIKUMAR AI logo and brand footer
    logo = Image.open(LOGO_PATH).convert("RGBA")
    logo.thumbnail((82, 82), Image.Resampling.LANCZOS)
    logo_x, logo_y = 70, 1245
    img.alpha_composite(logo, (logo_x, logo_y))

    footer_draw = ImageDraw.Draw(img)
    draw_mixed(
        footer_draw, (170, 1250), ["SASIKUMAR", "AI"],
        27, (20, 45, 85, 255)
    )
    website = "https://sasikumar-ai-9wdq.onrender.com"
    footer_draw.text(
        (170, 1292), website,
        font=get_font(website, 17),
        fill=(35, 85, 145, 255)
    )


    output = Path(sys.argv[3]) if len(sys.argv) > 3 else (
        ROOT / "public/posters/sasikumar-ai-poster.png"
    )
    output.parent.mkdir(parents=True, exist_ok=True)
    img.convert("RGB").save(output, "PNG", optimize=True)
    print("CLEAN POSTER CREATED:", output)
    print("BRANDING: NONE")
    print("SIZE:", W, "x", H)


if __name__ == "__main__":
    main()
