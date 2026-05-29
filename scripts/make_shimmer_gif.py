#!/usr/bin/env python3
"""
Creates a seamlessly looping shimmer/gleam GIF from a source image.
Effect: subtle brightness pulse + diagonal light sweep across the image.
Loop is seamless because all parameters use full sine cycles (0 → 2π).
"""

import sys
import math
import numpy as np
from PIL import Image, ImageEnhance, ImageFilter
from pathlib import Path


def apply_brightness(img: Image.Image, factor: float) -> Image.Image:
    return ImageEnhance.Brightness(img).enhance(factor)


def apply_saturation(img: Image.Image, factor: float) -> Image.Image:
    return ImageEnhance.Color(img).enhance(factor)


def make_shimmer_overlay(width: int, height: int, angle_deg: float,
                          position: float, sharpness: float = 0.18) -> Image.Image:
    """
    Creates a single diagonal light-streak overlay (RGBA).
    position: 0.0 → 1.0 controls where the streak is across the image.
    """
    angle = math.radians(angle_deg)
    overlay = np.zeros((height, width, 4), dtype=np.float32)

    xs = np.arange(width, dtype=np.float32)
    ys = np.arange(height, dtype=np.float32)
    xx, yy = np.meshgrid(xs, ys)

    # Project pixel coords onto the sweep direction
    proj = xx * math.cos(angle) + yy * math.sin(angle)
    proj_min, proj_max = proj.min(), proj.max()
    proj_norm = (proj - proj_min) / (proj_max - proj_min + 1e-8)

    # Gaussian spotlight along the sweep axis
    dist = proj_norm - position
    intensity = np.exp(-0.5 * (dist / sharpness) ** 2)

    # White streak with alpha
    overlay[..., 0] = 255
    overlay[..., 1] = 255
    overlay[..., 2] = 255
    overlay[..., 3] = (intensity * 55).clip(0, 255)  # max alpha ~55/255

    return Image.fromarray(overlay.astype(np.uint8), mode='RGBA')


def make_shimmer_gif(input_path: str, output_path: str,
                     n_frames: int = 36,
                     fps: int = 18,
                     max_brightness: float = 0.07,
                     max_saturation: float = 0.06,
                     streak_alpha_max: float = 0.8):
    """
    n_frames    – total frames for one loop (higher = smoother but bigger file)
    fps         – playback speed
    max_brightness – ±brightness swing around 1.0
    max_saturation – ±saturation swing around 1.0
    streak_alpha_max – how visible the light sweep is (0–1 scale)
    """
    src = Image.open(input_path).convert('RGBA')
    w, h = src.size
    src_rgb = src.convert('RGB')

    frames = []
    delay_ms = int(1000 / fps)

    for i in range(n_frames):
        t = 2 * math.pi * i / n_frames  # 0 → 2π, seamless by definition

        # --- 1. Subtle brightness pulse (two harmonics for richness) ---
        b_factor = 1.0 + max_brightness * math.sin(t) + (max_brightness * 0.4) * math.sin(2 * t + 0.5)
        frame = apply_brightness(src_rgb, b_factor)

        # --- 2. Subtle saturation shimmer (slightly offset phase) ---
        s_factor = 1.0 + max_saturation * math.sin(t + math.pi / 3)
        frame = apply_saturation(frame, s_factor)

        frame = frame.convert('RGBA')

        # --- 3. Diagonal light sweep (position sweeps 0→1, sine eased) ---
        # Use (sin(t)+1)/2 so it eases in/out and the streak "glides"
        streak_pos = (math.sin(t - math.pi / 2) + 1) / 2  # 0→1 smooth
        overlay = make_shimmer_overlay(w, h, angle_deg=65, position=streak_pos,
                                        sharpness=0.14)

        # Scale down streak alpha by streak_alpha_max
        r, g, b, a = overlay.split()
        a = a.point(lambda x: int(x * streak_alpha_max))
        overlay = Image.merge('RGBA', (r, g, b, a))

        # Composite streak over frame
        frame = Image.alpha_composite(frame, overlay)

        # Convert to palette mode for GIF (smaller file, decent quality)
        frames.append(frame.convert('RGB').convert('P', palette=Image.ADAPTIVE, colors=256))

    # Save as looping GIF
    frames[0].save(
        output_path,
        save_all=True,
        append_images=frames[1:],
        loop=0,            # 0 = loop forever
        duration=delay_ms,
        optimize=False,    # keep quality
    )
    size_mb = Path(output_path).stat().st_size / 1_000_000
    print(f"Saved {output_path}  ({w}×{h}, {n_frames} frames, {size_mb:.1f} MB)")


if __name__ == '__main__':
    if len(sys.argv) < 3:
        print("Usage: python make_shimmer_gif.py input.jpg output.gif [n_frames] [fps]")
        sys.exit(1)

    inp = sys.argv[1]
    out = sys.argv[2]
    n   = int(sys.argv[3]) if len(sys.argv) > 3 else 36
    fps = int(sys.argv[4]) if len(sys.argv) > 4 else 18

    make_shimmer_gif(inp, out, n_frames=n, fps=fps)
