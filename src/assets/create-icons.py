#!/usr/bin/env python3
"""
Simple script to create placeholder PNG icons for the Starling add-in.
This creates basic PNG files with the Starling bird outline.
"""

try:
    from PIL import Image, ImageDraw
    PIL_AVAILABLE = True
except ImportError:
    PIL_AVAILABLE = False
    print("PIL not available. Creating placeholder files instead.")

import os

def create_simple_bird_icon(size):
    """Create a simple bird icon using basic shapes"""
    if not PIL_AVAILABLE:
        return None
        
    # Create image with white background
    img = Image.new('RGBA', (size, size), (255, 255, 255, 255))
    draw = ImageDraw.Draw(img)
    
    # Scale factor for the icon
    scale = size / 100.0
    
    # Draw simple bird shape
    # Body (ellipse)
    body_x = int(20 * scale)
    body_y = int(30 * scale)
    body_w = int(40 * scale)
    body_h = int(25 * scale)
    draw.ellipse([body_x, body_y, body_x + body_w, body_y + body_h], 
                 outline=(0, 0, 0), width=max(1, int(2 * scale)))
    
    # Head (circle)
    head_x = int(15 * scale)
    head_y = int(25 * scale)
    head_r = int(12 * scale)
    draw.ellipse([head_x, head_y, head_x + head_r, head_y + head_r], 
                 outline=(0, 0, 0), width=max(1, int(2 * scale)))
    
    # Beak (triangle)
    beak_points = [
        (int(10 * scale), int(32 * scale)),
        (int(5 * scale), int(30 * scale)),
        (int(10 * scale), int(28 * scale))
    ]
    draw.polygon(beak_points, outline=(0, 0, 0), width=max(1, int(2 * scale)))
    
    # Eye (small circle)
    eye_x = int(18 * scale)
    eye_y = int(28 * scale)
    eye_r = max(1, int(2 * scale))
    draw.ellipse([eye_x, eye_y, eye_x + eye_r, eye_y + eye_r], fill=(0, 0, 0))
    
    # Tail (lines)
    tail_start_x = int(60 * scale)
    tail_start_y = int(42 * scale)
    tail_end_x = int(80 * scale)
    
    for i in range(3):
        y_offset = int(i * 3 * scale)
        draw.line([tail_start_x, tail_start_y + y_offset, 
                  tail_end_x, tail_start_y + y_offset], 
                 fill=(0, 0, 0), width=max(1, int(2 * scale)))
    
    # Legs (simple lines)
    leg1_x = int(35 * scale)
    leg2_x = int(45 * scale)
    leg_top_y = int(55 * scale)
    leg_bottom_y = int(70 * scale)
    
    draw.line([leg1_x, leg_top_y, leg1_x, leg_bottom_y], 
             fill=(0, 0, 0), width=max(1, int(2 * scale)))
    draw.line([leg2_x, leg_top_y, leg2_x, leg_bottom_y], 
             fill=(0, 0, 0), width=max(1, int(2 * scale)))
    
    return img

def create_placeholder_file(filename, size):
    """Create a placeholder file if PIL is not available"""
    # Create a minimal PNG file (1x1 transparent pixel)
    # This is a base64 encoded 1x1 transparent PNG
    import base64
    
    # Minimal transparent PNG data
    png_data = base64.b64decode(
        'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChAI9jU77zgAAAABJRU5ErkJggg=='
    )
    
    with open(filename, 'wb') as f:
        f.write(png_data)
    
    print(f"Created placeholder {filename} ({size}x{size})")

def main():
    sizes = [16, 32, 64, 80]
    
    for size in sizes:
        filename = f"icon-{size}.png"
        
        if PIL_AVAILABLE:
            img = create_simple_bird_icon(size)
            if img:
                img.save(filename)
                print(f"Created {filename} ({size}x{size})")
            else:
                create_placeholder_file(filename, size)
        else:
            create_placeholder_file(filename, size)

if __name__ == "__main__":
    main()
