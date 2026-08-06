#!/usr/bin/env python3
"""给 app 图标烘焙圆角（四角透明）。

背景：打包用的图标源（scripts/assets/icons/*.png）是白底方形，
Windows/Linux 系统不会像 macOS 那样自动套圆角蒙版，所以打包后图标是方的。
本脚本把圆角直接画进 PNG 的 alpha 通道，让所有平台显示圆角。

用法:
    python3 scripts/round-icon-corners.py [file...]

不带参数时处理当前图标集（与打包/应用内展示相关的图标）。
可显式传文件路径，例如: python3 scripts/round-icon-corners.py a.png b.png

幂等：四角 alpha 已是透明(<250)的文件会跳过，不会二次圆角。
圆角半径 = 0.2237 * min(宽,高)，即 macOS Big Sur+ 图标的标准圆角比例。
"""
import os
import sys
from PIL import Image, ImageChops, ImageDraw

RADIUS_RATIO = 0.2237
ALPHA_OPAQUE = 250

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(SCRIPT_DIR)

DEFAULT_TARGETS = [
    # electron-builder 打包用的图标集
    "scripts/assets/icons/icon-16.png",
    "scripts/assets/icons/icon-16@2x.png",
    "scripts/assets/icons/icon-32.png",
    "scripts/assets/icons/icon-32@2x.png",
    "scripts/assets/icons/icon-128.png",
    "scripts/assets/icons/icon-128@2x.png",
    "scripts/assets/icons/icon-256.png",
    "scripts/assets/icons/icon-256@2x.png",
    "scripts/assets/icons/icon-512.png",
    "scripts/assets/icons/icon-512@2x.png",
    "scripts/assets/icons/favicon-16x16.png",
    "scripts/assets/icons/favicon-32x32.png",
    # 应用内顶部栏 logo（与图标同一幅画）
    "src/renderer/assets/logo.png",
    "scripts/assets/logo.png",
]


def already_rounded(im):
    w, h = im.size
    px = im.load()
    corners = (px[0, 0][3], px[w - 1, 0][3], px[0, h - 1][3], px[w - 1, h - 1][3])
    return min(corners) < ALPHA_OPAQUE


def round_icon(path):
    if not os.path.exists(path):
        print(f"!! not found: {path}")
        return
    im = Image.open(path).convert("RGBA")
    if already_rounded(im):
        print(f"skip (already rounded): {path}")
        return
    w, h = im.size
    r = round(min(w, h) * RADIUS_RATIO)
    mask = Image.new("L", (w, h), 0)
    draw = ImageDraw.Draw(mask)
    draw.rounded_rectangle([0, 0, w - 1, h - 1], radius=r, fill=255)
    alpha = ImageChops.multiply(im.getchannel("A"), mask)
    im.putalpha(alpha)
    im.save(path)
    print(f"rounded: {path} ({w}x{h}, radius={r})")


def main():
    files = sys.argv[1:] if len(sys.argv) > 1 else DEFAULT_TARGETS
    for f in files:
        if not os.path.isabs(f):
            f = os.path.join(ROOT, f)
        round_icon(f)


if __name__ == "__main__":
    main()
