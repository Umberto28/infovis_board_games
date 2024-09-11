import colorsys
import random

def generate_colors_by_hue(n):
    colors = []
    for i in range(n):
        hue = (i * 137.508) % 360 / 360
        saturation = random.uniform(0.5, 0.8)
        lightness = random.uniform(0.5, 0.8)
        rgb = colorsys.hls_to_rgb(hue, lightness, saturation)
        hex_color = '#{:02x}{:02x}{:02x}'.format(int(rgb[0] * 255), int(rgb[1] * 255), int(rgb[2] * 255))
        colors.append(hex_color)
    random.shuffle(colors)
    random.shuffle(colors)
    return colors

# Generate 123 distinct colors
distinct_colors = generate_colors_by_hue(50)
print(distinct_colors)
print(len(distinct_colors))

