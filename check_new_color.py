from PIL import Image
import os

path = r'c:\Users\Shinhee Yun\Documents\test2\vue-project\media__1775733463836.png'
if os.path.exists(path):
    img = Image.open(path).convert('RGB')
    pixels = [img.getpixel((x, y)) for x in [10, 50, 100] for y in [10, 50, 100]]
    avg_color = tuple(sum(col)//len(pixels) for col in zip(*pixels))
    hex_color = '#{:02x}{:02x}{:02x}'.format(*avg_color)
    print(f"HEX_COLOR: {hex_color}")
else:
    print("File not found")
