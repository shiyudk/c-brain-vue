import os

file_path = r"c:\Users\Shinhee Yun\Documents\test2\vue-project\src\assets\main.css"
with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
    content = f.read()

old_block = """.phil-overlay-text {
  position: absolute;
  bottom: 8%;
  left: 50%;
  transform: translateX(-50%);
  text-align: center;
  width: 90%;
  max-width: 1000px;
  z-index: 10;
}"""

new_block = """.phil-overlay-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  width: 90%;
  max-width: 1000px;
  z-index: 10;
}"""

if old_block in content:
    new_content = content.replace(old_block, new_block)
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(new_content)
    print("Successfully updated.")
else:
    # Try a slightly different version in case formatting changed
    import re
    pattern = r"\.phil-overlay-text\s*\{[^}]*bottom:\s*8%;[^}]*\}"
    if re.search(pattern, content):
        new_content = re.sub(pattern, new_block, content)
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print("Successfully updated with regex.")
    else:
        print("Could not find the block.")
