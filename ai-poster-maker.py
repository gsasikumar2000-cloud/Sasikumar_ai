from PIL import Image, ImageDraw, ImageFont, ImageFilter
from pathlib import Path
import sys
import re

W, H = 1080, 1350
ROOT = Path(__file__).resolve().parent
TA_FONT = ROOT / "public/assets/fonts/NotoSansTamil-VF.ttf"
EN_FONT = ROOT / "public/assets/fonts/DejaVuSans.ttf"
LOGO_PATH = ROOT / "public/assets/sasikumar-ai-logo.png"

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
    title = clean_title(parts[0]) if parts else "SASIKUMAR AI"
    if not title:
        title = parts[0] if parts else "SASIKUMAR AI"
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

    panel = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    pd = ImageDraw.Draw(panel)
    pd.rounded_rectangle(
        (42, 650, 1038, 1295), radius=38,
        fill=(8, 24, 38, 218),
        outline=(255, 255, 255, 100), width=2
    )
    img = Image.alpha_composite(img, panel)
    draw = ImageDraw.Draw(img)

    if LOGO_PATH.is_file():
        logo = Image.open(LOGO_PATH).convert("RGBA")
        logo.thumbnail((92, 92), Image.Resampling.LANCZOS)
        img.alpha_composite(logo, (66, 675))
        draw = ImageDraw.Draw(img)

    brand_font = get_font("SASIKUMAR AI", 27)
    draw.text(
        (178, 696), "SASIKUMAR AI", font=brand_font,
        fill=(255, 255, 255, 255), stroke_width=1,
        stroke_fill=(0, 0, 0, 150)
    )
    draw.rounded_rectangle(
        (68, 790, 1012, 798), radius=4,
        fill=(91, 220, 180, 255)
    )

    y = 825
    for words in wrap_mixed(draw, title, 54, 920)[:2]:
        draw_mixed(
            draw, (72, y), words, 54, (255, 239, 160, 255),
            1, (0, 0, 0, 180)
        )
        y += 76
    y += 12

    if body:
        for paragraph in body.splitlines():
            paragraph = paragraph.strip()
            if not paragraph:
                continue
            for words in wrap_mixed(draw, paragraph, 31, 910):
                if y > 1170:
                    break
                draw_mixed(draw, (78, y), words, 31, (255, 255, 255, 255))
                y += 47
            if y > 1170:
                break

    draw.rounded_rectangle(
        (68, 1220, 1012, 1224), radius=2,
        fill=(91, 220, 180, 255)
    )
    draw.text(
        (72, 1240), "SASIKUMAR AI  •  AI POSTER",
        font=get_font("SASIKUMAR AI", 25),
        fill=(210, 245, 235, 255)
    )

    output = Path(sys.argv[3]) if len(sys.argv) > 3 else (
        ROOT / "public/posters/sasikumar-ai-poster.png"
    )
    output.parent.mkdir(parents=True, exist_ok=True)
    img.convert("RGB").save(output, "PNG", optimize=True)
    print("HD POSTER CREATED:", output)
    print("TITLE:", title)
    print("SIZE:", W, "x", H)

if __name__ == "__main__":
    main()
