from PIL import Image, ImageDraw, ImageFont
import os

W, H = 1080, 1900
img = Image.new("RGB", (W, H), "#F1F7FF")
draw = ImageDraw.Draw(img)

def font(size, bold=False):
    paths = [
        "/system/fonts/Roboto-Bold.ttf" if bold else "/system/fonts/Roboto-Regular.ttf",
        "/data/data/com.termux/files/usr/share/fonts/TTF/DejaVuSans-Bold.ttf" if bold else "/data/data/com.termux/files/usr/share/fonts/TTF/DejaVuSans.ttf",
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf" if bold else "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
    ]
    for p in paths:
        if os.path.exists(p):
            try:
                return ImageFont.truetype(p, size)
            except Exception:
                pass
    return ImageFont.load_default()

title_font = font(43, True)
subtitle_font = font(24, True)
item_font = font(21, True)
footer_font = font(23, True)

# Header
draw.rounded_rectangle(
    (25, 20, W-25, 280),
    radius=35, fill="#FFFFFF", outline="#72A7F5", width=4
)

logo_path = "public/assets/sasikumar-ai-logo.png"
if not os.path.exists(logo_path):
    raise SystemExit("ERROR: SASIKUMAR AI logo not found")

logo = Image.open(logo_path).convert("RGBA")
logo.thumbnail((155, 155))
img.paste(logo, ((W-logo.width)//2, 30), logo)

draw.text((W//2, 200), "SASIKUMAR AI", anchor="mm",
          font=title_font, fill="#1556B3")
draw.text((W//2, 247), "YOUR MULTI-LANGUAGE AI ASSISTANT",
          anchor="mm", font=subtitle_font, fill="#3973B9")
draw.text((W//2, 320), "COMPLETE MENU — 31 SERVICES",
          anchor="mm", font=title_font, fill="#174A91")

items = [
    "1. AI Assistant",
    "2. Live Gold & Silver Rate",
    "3. Gold Loan / EMI Calculator",
    "4. Banking Services",
    "5. Gold Expert",
    "6. Gold Appraisal",
    "7. Education",
    "8. Jobs & Careers",
    "9. Business & Technology News",
    "10. Breaking News",
    "11. General AI Chat",
    "12. Poster & Creative Design",
    "13. AI Image Maker",
    "14. Video Maker",
    "15. Global Web Search",
    "16. Sports Updates",
    "17. Daily Thirukkural",
    "18. Tamil Kavithai",
    "19. Ponmozhigal",
    "20. Thathuvam",
    "21. Motivation",
    "22. Leadership History",
    "23. Audio & Video Songs Hub",
    "24. Live FM Radio",
    "25. Audio / Video Song Cutter",
    "26. Mobile App Download",
    "27. Business Ideas",
    "28. AI Tools",
    "29. Website Services",
    "30. Contact & Customer Feedback",
    "31. All Content — Complete Services"
]

# Two-column layout
start_y = 365
row_h = 70
gap = 5
left_x, right_x = 35, 548
box_w = 497
colors = ["#E4F1FF", "#E6F8F0"]

for i, item in enumerate(items):
    row = i // 2
    col = i % 2
    x = left_x if col == 0 else right_x
    y = start_y + row * (row_h + gap)

    draw.rounded_rectangle(
        (x, y, x+box_w, y+row_h),
        radius=15,
        fill=colors[row % 2],
        outline="#9CC5F2",
        width=2
    )

    draw.text(
        (x+14, y+row_h//2),
        item,
        anchor="lm",
        font=item_font,
        fill="#174A75"
    )

# Footer
draw.rounded_rectangle(
    (35, 1640, W-35, 1810),
    radius=25,
    fill="#D9E9FF",
    outline="#72A7F5",
    width=3
)
draw.text((W//2, 1680), "0 — MAIN MENU",
          anchor="mm", font=footer_font, fill="#174A91")
draw.text((W//2, 1725), "Send a service number on WhatsApp",
          anchor="mm", font=footer_font, fill="#174A91")
draw.text((W//2, 1770), "sasikumar-ai-9wdq.onrender.com",
          anchor="mm", font=font(21, True), fill="#174A91")

out = "public/assets/whatsapp-menu.png"
img.save(out, optimize=True)

print("SUCCESS:", out)
print("Image size:", img.size)
print("Options:", len(items))
print("Backup created successfully")
