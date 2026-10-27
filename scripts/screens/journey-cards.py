# Title and end cards for the journey video, 1920x1080 PNG. Used by the steps in
# scripts/screens/README.md, "Journey recording". Every figure on a card is named
# with its source on the same card; change a figure only with its source file.
# Usage: python3 journey-cards.py <build>/fonts <out dir>
import sys
from PIL import Image, ImageDraw, ImageFont

FONTS = sys.argv[1]
OUT = sys.argv[2]
W, H = 1920, 1080
BG = (6, 20, 38)
TEAL = (86, 214, 184)
INK = (241, 241, 241)
MUTED = (170, 182, 198)
MARGIN = 150
MAX_W = W - 2 * MARGIN


def font(name, size):
    return ImageFont.truetype(f"{FONTS}/{name}", size)


def wrap(draw, text, fnt, max_w):
    words, lines, line = text.split(), [], ""
    for w in words:
        trial = (line + " " + w).strip()
        if draw.textlength(trial, font=fnt) <= max_w:
            line = trial
        else:
            lines.append(line)
            line = w
    if line:
        lines.append(line)
    return lines


def card(path, tag, blocks, footer):
    img = Image.new("RGB", (W, H), BG)
    d = ImageDraw.Draw(img)
    y = 210
    d.text((MARGIN, y), tag.upper(), font=font("IBMPlexMono-Regular.ttf", 26), fill=TEAL)
    y += 80
    for kind, text in blocks:
        if kind == "head":
            f, gap, colour = font("IBMPlexSans-SemiBold.ttf", 64), 26, INK
        elif kind == "stat":
            f, gap, colour = font("IBMPlexSans-SemiBold.ttf", 46), 22, INK
        elif kind == "line":
            f, gap, colour = font("IBMPlexSans-Regular.ttf", 38), 18, INK
        else:  # note
            f, gap, colour = font("IBMPlexSans-Regular.ttf", 30), 14, MUTED
        for ln in wrap(d, text, f, MAX_W):
            d.text((MARGIN, y), ln, font=f, fill=colour)
            y += int(f.size * 1.3)
        y += gap
        if kind == "head":
            y += 20
    fp = font("IBMPlexSans-Regular.ttf", 26)
    fy = H - 60 - 26 * 1.4 * len(wrap(d, footer, fp, MAX_W))
    for ln in wrap(d, footer, fp, MAX_W):
        d.text((MARGIN, fy), ln, font=fp, fill=MUTED)
        fy += 26 * 1.4
    img.save(path)


card(
    f"{OUT}/card-title.png",
    "VUKA · VIGIL + ANCHOR",
    [
        ("head", "A journey, in the app's simulated preview"),
        ("line", "Illustrative: Thandi is a composite, not a real case."),
    ],
    "Browser rendering of the app's real code. SIMULATED: nothing is signed or sent. "
    "Not a phone recording. Testnet and simulated bank, as stated.",
)

card(
    f"{OUT}/card-problem.png",
    "The problem",
    [
        ("head", "A forced transfer looks like a willing one."),
        ("stat", "17,061 kidnappings in FY2023/24, up 264% since 2014/15. 44% during a hijacking."),
        ("stat", "R2.4 billion lost to digital banking crime in 2025 (gross losses)."),
        ("note", "Sources: SAPS via ISS Africa (kidnappings); SABRIC 2025 (losses). Both recorded as FACT in docs/EVIDENCE.md."),
    ],
    "Thandi is an illustrative composite. Not a case, and not a claim about any named person.",
)

card(
    f"{OUT}/card-cant.png",
    "What it can't do",
    [
        ("head", "It can't prove she was forced."),
        ("line", "It proves when a signal existed, and that it hasn't changed since. A record is tamper-evident: it can't be backdated or quietly edited without detection."),
        ("line", "A missing record is never evidence against anyone."),
        ("line", "If the phone is switched off before anything is detected, nothing escalates."),
    ],
    "Guardian copy and its wording are under review (D12). Listening wording is under review (D7).",
)

card(
    f"{OUT}/card-measured.png",
    "Measured, not claimed",
    [
        ("head", "Glass 46.0% (n = 139) · gunshot 54.6% (n = 108) · shatter 72.9% (n = 70) · scream 6.5% (n = 108)"),
        ("line", "Public test sets. Screams are our weakest point, and we publish it."),
        ("line", "Thresholds uncalibrated. Field accuracy, battery and uptime: not measured yet."),
        ("line", "Android only. No company-owned server yet. The ledger is Hedera testnet."),
    ],
    "Source: docs/eval/cem1-measurements.md, as recorded (FACT). Not re-run for this video.",
)

print("cards written to", OUT)
