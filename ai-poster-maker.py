from PIL import Image, ImageFilter
from pathlib import Path
import sys

W, H = 1080, 1350

def main():
    if len(sys.argv) < 3:
        print("Usage: python ai-poster-maker.py BACKGROUND_IMAGE TEXT [OUTPUT]")
        sys.exit(2)

    source = Path(sys.argv[1])
    if not source.is_file():
        raise FileNotFoundError(source)

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
    )

    output = Path(sys.argv[3]) if len(sys.argv) > 3 else Path(
        "public/posters/sasikumar-ai-poster.png"
    )

    output.parent.mkdir(parents=True, exist_ok=True)
    img.save(output, "PNG", optimize=True)

    print("HD IMAGE CREATED:", output)
    print("SIZE:", W, "x", H)

if __name__ == "__main__":
    main()
