import sys
from PIL import Image, ImageDraw, ImageFont, ImageOps
shots = sys.argv[1].rstrip('/') + '/'; out = sys.argv[2].rstrip('/') + '/'
import os
F = os.path.join(os.path.dirname(os.path.abspath(__file__)), '../../app/android/app/src/main/assets/fonts/')
def font(name, size): return ImageFont.truetype(F + name, size)
CAP = 'Browser rendering of the real VIGIL UI code, SIMULATED preview (nothing signed or sent), 26 Oct 2026. Not a photo of an Android phone.'
DCAP = 'VUKA Ledger, rendered from the repository (dashboard/), 26 Oct 2026. Offline: this sandbox had no route to Hedera, so no live data is shown.'

def framed(path, w=600):
    im = Image.open(path).convert('RGB')
    im = im.resize((w, round(im.height * w / im.width)), Image.LANCZOS)
    r = 46; pad = 14
    fw, fh = im.width + 2 * pad, im.height + 2 * pad
    frame = Image.new('RGBA', (fw, fh), (0, 0, 0, 0))
    d = ImageDraw.Draw(frame)
    d.rounded_rectangle([0, 0, fw - 1, fh - 1], radius=r + pad, fill=(24, 26, 30, 255))
    mask = Image.new('L', im.size, 0)
    ImageDraw.Draw(mask).rounded_rectangle([0, 0, im.width - 1, im.height - 1], radius=r, fill=255)
    frame.paste(im, (pad, pad), mask)
    return frame

def wrap(d, text, f, width):
    words, lines, cur = text.split(), [], ''
    for wd in words:
        t = (cur + ' ' + wd).strip()
        if d.textlength(t, font=f) <= width: cur = t
        else: lines.append(cur); cur = wd
    lines.append(cur); return lines

def caption_band(img, text, bg=(255, 255, 255), fg=(70, 70, 76), size=22):
    f = font('IBMPlexSans-Regular.ttf', size)
    d0 = ImageDraw.Draw(img)
    lines = wrap(d0, text, f, img.width - 60)
    h = 24 + len(lines) * (size + 8) + 16
    out_im = Image.new('RGB', (img.width, img.height + h), bg)
    out_im.paste(img, (0, 0), img if img.mode == 'RGBA' else None)
    d = ImageDraw.Draw(out_im)
    y = img.height + 20
    for ln in lines: d.text((30, y), ln, font=f, fill=fg); y += size + 8
    return out_im

def single(name, src, label):
    ph = framed(shots + src, 620)
    W = ph.width + 80
    canvas = Image.new('RGBA', (W, ph.height + 110), (255, 255, 255, 255))
    canvas.paste(ph, (40, 30), ph)
    d = ImageDraw.Draw(canvas)
    fl = font('IBMPlexSans-SemiBold.ttf', 28)
    d.text((W // 2, ph.height + 60), label, font=fl, fill=(30, 32, 36), anchor='mm')
    caption_band(canvas.convert('RGB'), CAP, size=20).save(out + name, optimize=True)

single('vigil-home-framed.png', 'vigil-home.png', 'Active: listening on this phone, asks before alerting')
single('vigil-guardian-framed.png', 'vigil-guardian-alert.png', "Guardian view (simulated preview): Don't call or text. Call 10111.")

# 4-up journey
items = [('vigil-home.png', '1 · Active'), ('vigil-checkin.png', '2 · A sound opens a check-in'),
         ('vigil-checked-normal.png', '3 · "Checked in", same after either PIN'), ('vigil-guardian-alert.png', '4 · What a guardian sees on an alert (separate preview)')]
phones = [framed(shots + s, 520) for s, _ in items]
gap = 60; W = sum(p.width for p in phones) + gap * (len(phones) + 1); H = phones[0].height + 150
canvas = Image.new('RGBA', (W, H), (255, 255, 255, 255)); d = ImageDraw.Draw(canvas)
fl = font('IBMPlexSans-SemiBold.ttf', 30); x = gap
for p, (_, lab) in zip(phones, items):
    canvas.paste(p, (x, 40), p)
    for i, ln in enumerate(wrap(d, lab, fl, p.width + 20)):
        d.text((x + p.width // 2, p.height + 75 + i * 38), ln, font=fl, fill=(30, 32, 36), anchor='mm')
    x += p.width + gap
caption_band(canvas.convert('RGB'), CAP + " Screen 3 after a normal and after a duress PIN was pixel-identical in this rendering (n = 1 each); not tested on a device. Screen 4 is the app's guardian-view preview (Settings, Guardian view), not a live alert from screen 3.", size=26).save(out + 'vigil-journey-4up.png', optimize=True)

# 2-up for investor product slide: check-in + guardian
pair = [framed(shots + 'vigil-checkin.png', 560), framed(shots + 'vigil-guardian-alert.png', 560)]
W = sum(p.width for p in pair) + gap * 3; canvas = Image.new('RGBA', (W, pair[0].height + 80), (255, 255, 255, 255)); x = gap
for p in pair: canvas.paste(p, (x, 40), p); x += p.width + gap
caption_band(canvas.convert('RGB'), CAP, size=24).save(out + 'vigil-checkin-guardian-2up.png', optimize=True)

# dashboard
b = Image.open(shots + 'dash-banks.png').convert('RGB'); b = b.crop((0, 384, b.width, b.height))
caption_band(b, DCAP, size=30).save(out + 'dash-banks.png', optimize=True)
v = Image.open(shots + 'dash-verify.png').convert('RGB')
caption_band(v, DCAP + ' The red "Hedera testnet" chip shows the mirror was unreachable from here.', size=30).save(out + 'dash-verify.png', optimize=True)
print('ok')
