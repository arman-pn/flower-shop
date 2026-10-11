"""
عکس‌های فهرست‌شده در assets/js/photos.js را دانلود می‌کند و در assets/img می‌گذارد،
بعد photos.js را به مسیرهای محلی بازنویسی می‌کند تا سایت بدون اینترنت هم عکس داشته باشد.

اجرا (داخل همین پوشه):   python download-photos.py
اگر دانلودی شکست بخورد، همان خط دست‌نخورده می‌ماند و سایت برای آن محصول نقاشی نشان می‌دهد.
"""
import os
import re
import urllib.request

ROOT = os.path.dirname(os.path.abspath(__file__))
PHOTOS_JS = os.path.join(ROOT, "assets", "js", "photos.js")
IMG_DIR = os.path.join(ROOT, "assets", "img")
QUERY = "?auto=format&fit=crop&w=900&q=75&fm=jpg"
LINE = re.compile(r'^(\s*)(\w+):\s*\{\s*src:\s*"(https?://[^"]+)"(.*)$')


def download(url, path):
    request = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(request, timeout=40) as response:
        data = response.read()
    if len(data) < 2000:
        raise ValueError("file too small, probably not an image")
    with open(path, "wb") as out:
        out.write(data)


def main():
    os.makedirs(IMG_DIR, exist_ok=True)
    with open(PHOTOS_JS, encoding="utf-8") as source:
        lines = source.read().split("\n")

    saved, failed = 0, 0
    for index, line in enumerate(lines):
        match = LINE.match(line)
        if not match:
            continue
        indent, product_id, url, rest = match.groups()
        target = os.path.join(IMG_DIR, product_id + ".jpg")
        try:
            download(url + QUERY, target)
        except Exception as error:  # یک عکسِ خراب نباید بقیه را متوقف کند
            failed += 1
            print("failed  %-4s %s" % (product_id, error))
            continue
        lines[index] = '%s%s: { src: "assets/img/%s.jpg"%s' % (indent, product_id, product_id, rest)
        saved += 1
        print("saved   %-4s" % product_id)

    with open(PHOTOS_JS, "w", encoding="utf-8") as output:
        output.write("\n".join(lines))
    print("\n%d saved, %d failed. Refresh the site." % (saved, failed))


if __name__ == "__main__":
    main()
