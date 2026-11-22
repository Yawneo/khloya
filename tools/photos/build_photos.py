"""Кроп и оптимизация фото «Хлоя» под слоты сайта.

Нужны исходники в _tmp_photos/raw/pNN.jpg (см. fetch_photos.mjs).
Запуск: python tools/photos/build_photos.py
Результат: assets/photos/shop/*.jpg
"""
from pathlib import Path

from PIL import Image, ImageFilter

ROOT = Path(__file__).resolve().parents[2]
RAW = ROOT / "_tmp_photos" / "raw"
OUT = ROOT / "assets" / "photos" / "shop"
OUT.mkdir(parents=True, exist_ok=True)

# (имя файла, исходник pNN, пропорции w:h слота, фокус по вертикали 0..1, зум)
# зум < 1 — сначала берём центральный фрагмент (нужно, когда мешает фон или ручка корзины)
JOBS = [
    # hero — широкий баннер ≈2.2:1
    ("hero-bouquet-pastel", "p00", 22, 10, 0.30, 1.0),
    ("hero-bouquet-peach",  "p07", 22, 10, 0.24, 1.0),
    ("hero-studio",         "p06", 22, 10, 0.42, 1.0),

    # коллекции — 16:10
    ("collection-monobukety",        "p04", 16, 10, 0.10, 1.0),
    ("collection-bukety",            "p37", 16, 10, 0.14, 1.0),
    ("collection-shlyapnye-korobki", "p29", 16, 10, 0.58, 1.0),
    ("collection-cvety-v-korzine",   "p40", 16, 10, 0.64, 1.0),

    # товары — 4:3
    ("p1-krasnye-rozy",                 "p21", 4, 3, 0.18, 1.0),
    ("p2-vau-rozy",                     "p09", 4, 3, 0.14, 1.0),
    ("p3-buket-51-roza",                "p14", 4, 3, 0.16, 1.0),
    ("p4-25-roz",                       "p50", 4, 3, 0.22, 1.0),
    ("p5-rozy",                         "p59", 4, 3, 0.10, 1.0),
    ("p6-101-belaya-roza",              "p58", 4, 3, 0.10, 1.0),
    ("p7-shlyapnaya-korobka-rozovaya",  "p29", 4, 3, 0.40, 1.0),
    ("p8-shlyapnaya-korobka-belyy-sad", "p18", 4, 3, 0.42, 0.62),
    ("p9-korzina-piony-i-rozy",         "p41", 4, 3, 0.40, 1.0),
    ("p10-korzina-fruktovyy-sad",       "p32", 4, 3, 0.44, 1.0),
    ("p11-monobuket-tyulpanov",         "p53", 4, 3, 0.26, 1.0),
    ("p12-kompoziciya-vesna",           "p49", 4, 3, 0.15, 1.0),

    # баннер «Предложения» — 16:9
    ("offers", "p08", 16, 9, 0.20, 1.0),
]


def crop_to_ratio(im: Image.Image, rw: float, rh: float, focus: float, zoom: float = 1.0) -> Image.Image:
    """Зум-фрагмент, затем резка по целевому соотношению."""
    w, h = im.size
    if zoom < 1.0:
        zw, zh = int(w * zoom), int(h * zoom)
        x0 = (w - zw) // 2
        y0 = int((h - zh) * focus)
        im = im.crop((x0, y0, x0 + zw, y0 + zh))
        w, h = im.size

    target = rw / rh
    if w / h > target:
        new_w = int(round(h * target))
        x = (w - new_w) // 2
        return im.crop((x, 0, x + new_w, h))
    new_h = int(round(w / target))
    y = int(round((h - new_h) * focus))
    return im.crop((0, y, w, y + new_h))


def optimize(im: Image.Image, max_w: int = 1400) -> Image.Image:
    if im.width > max_w:
        im = im.resize((max_w, int(round(im.height * max_w / im.width))), Image.LANCZOS)
    return im.filter(ImageFilter.UnsharpMask(radius=1.1, percent=55, threshold=3))


if __name__ == "__main__":
    for name, src, rw, rh, focus, zoom in JOBS:
        with Image.open(RAW / f"{src}.jpg") as im:
            out_im = optimize(crop_to_ratio(im.convert("RGB"), rw, rh, focus, zoom))
        dst = OUT / f"{name}.jpg"
        out_im.save(dst, "JPEG", quality=82, optimize=True, progressive=True)
        print(f"{name:34s} <- {src}  {out_im.width}x{out_im.height}  {dst.stat().st_size // 1024} KB")
