from PIL import Image
import os

path = r'c:\Users\Shinhee Yun\Documents\test2\vue-project\src\assets\logo_the_real_one.png'
if os.path.exists(path):
    img = Image.open(path).convert('RGB')
    # Sample background near an edge
    pixels = [img.getpixel((x, y)) for x in [5, 10, 20] for y in [5, 10, 20]]
    avg_color = tuple(sum(col)//len(pixels) for col in zip(*pixels))
    print(f"AVG_COLOR: {avg_color}")
else:
    print("File not found")
