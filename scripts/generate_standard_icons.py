#!/usr/bin/env python3
"""把 app 图标重做为 macOS 标准图标形状（Big Sur+ squircle）。

背景：之前图标是「白底方形 + 小圆角 + 填满画布」，比 macOS 标准 app 图标
显得更大更方。本脚本用实测 macOS 系统图标得到的标准参数重新生成：

  - 形状:  超椭圆 squircle，指数 n=4.8，形状占画布 81.2%（四周留 ~9.4% 透明边距）
  - 内容:  logo 等比缩放到「高度 = 画布 × 60%」，居中（白卡片内 logo 的标准留白）

所有目标尺寸都从最高清源（1024px）重采样，保证各尺寸内容一致、边缘平滑。

用法:
    python3 scripts/generate_standard_icons.py

参数可调：见下方 SHAPE_FRACTION / SQUIRCLE_N / CONTENT_HEIGHT_FRACTION。
幂等：每次从源重新生成全部目标，可重复执行。
"""
import os

import numpy as np
from PIL import Image

# ---- 可调参数 ----
SHAPE_FRACTION = 0.8125      # squircle 形状占画布比例（macOS 实测 81.2%）
SQUIRCLE_N = 4.8             # 超椭圆指数（macOS Big Sur 实测 n≈4.8）
CONTENT_HEIGHT_FRACTION = 0.60  # logo 内容高度占画布比例
# ------------------

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(SCRIPT_DIR)

SOURCE = os.path.join(ROOT, "scripts/assets/icons/icon-512@2x.png")  # 1024 最高清源
S = 1024  # 源画布尺寸

OUTPUTS = [
    # (目标路径, 尺寸)
    ("scripts/assets/icons/icon-512@2x.png", 1024),
    ("scripts/assets/icons/icon-512.png", 512),
    ("scripts/assets/icons/icon-256@2x.png", 512),
    ("scripts/assets/icons/icon-256.png", 256),
    ("scripts/assets/icons/icon-128@2x.png", 256),
    ("scripts/assets/icons/icon-128.png", 128),
    ("scripts/assets/icons/icon-32@2x.png", 64),
    ("scripts/assets/icons/icon-32.png", 32),
    ("scripts/assets/icons/icon-16@2x.png", 32),
    ("scripts/assets/icons/icon-16.png", 16),
    ("scripts/assets/icons/favicon-32x32.png", 32),
    ("scripts/assets/icons/favicon-16x16.png", 16),
    ("scripts/assets/logo.png", 1024),
    ("src/renderer/assets/logo.png", 1024),
]


def make_squircle_mask(size, frac=SHAPE_FRACTION, n=SQUIRCLE_N):
    """生成平滑的超椭圆布尔蒙版（超采样 2x 后缩小实现抗锯齿）。"""
    ss = size * 2
    a = frac / 2 * ss  # 半轴
    c = ss / 2
    yy, xx = np.mgrid[0:ss, 0:ss]
    dx = np.abs((xx - c) / a) ** n
    dy = np.abs((yy - c) / a) ** n
    mask = (dx + dy <= 1.0).astype(np.uint8) * 255
    return Image.fromarray(mask).resize((size, size), Image.LANCZOS)


def extract_content(img, near_white=245):
    """找出 logo 内容 bbox（与白底不同的不透明像素）。"""
    arr = np.asarray(img.convert("RGBA"))
    alpha = arr[:, :, 3]
    rgb = arr[:, :, :3]
    is_content = (alpha > 100) & ((rgb[:, :, 0] < near_white) | (rgb[:, :, 1] < near_white) | (rgb[:, :, 2] < near_white))
    ys, xs = np.where(is_content)
    if len(xs) == 0:
        raise RuntimeError("未检测到内容区域")
    return (xs.min(), ys.min(), xs.max() + 1, ys.max() + 1)


def main():
    src = Image.open(SOURCE).convert("RGBA")
    x0, y0, x1, y1 = extract_content(src)
    content = src.crop((x0, y0, x1, y1))
    cw, ch = content.size
    print(f"源内容 bbox=({x0},{y0})-({x1},{y1}) 尺寸={cw}x{ch}")

    # 等比缩放到目标内容高度
    target_h = CONTENT_HEIGHT_FRACTION * S
    s = target_h / ch
    target_w = round(cw * s)
    target_h = round(ch * s)
    content = content.resize((target_w, target_h), Image.LANCZOS)
    print(f"内容缩放后: {target_w}x{target_h} (高=画布{100*target_h/S:.0f}%)")

    # 白色 squircle 卡片：形状内填充白色背景，形状外透明
    mask = make_squircle_mask(S)
    canvas = Image.new("RGBA", (S, S), (255, 255, 255, 0))
    canvas.putalpha(mask)

    # logo 内容居中粘贴到卡片中心
    px = (S - target_w) // 2
    py = (S - target_h) // 2
    canvas.paste(content, (px, py), content)

    # 输出各尺寸
    for rel, size in OUTPUTS:
        out_path = os.path.join(ROOT, rel)
        im = canvas.resize((size, size), Image.LANCZOS)
        im.save(out_path)
        print(f"  -> {rel} ({size}x{size})")

    print("done")


if __name__ == "__main__":
    main()
