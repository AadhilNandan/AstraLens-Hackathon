import os
import math
from PIL import Image

# Set this to None to handle very large images
Image.MAX_IMAGE_PIXELS = None

# --- Configuration ---
INPUT_IMAGE_PATH = r"Assets\Moon.tiff"
OUTPUT_DIR = "tiles/moon"  # Base folder for tiles
TILE_SIZE = 256

# Maximum resolution is Z=0 in the Leaflet Simple CRS convention
MAX_LEAFLET_ZOOM = 0

# --- Initial Setup ---
os.makedirs(OUTPUT_DIR, exist_ok=True)

print(f"Opening image: {INPUT_IMAGE_PATH}")
try:
    large_image = Image.open(INPUT_IMAGE_PATH)
except FileNotFoundError:
    print(f"ERROR: The input file was not found at '{INPUT_IMAGE_PATH}'")
    exit()

original_width, original_height = large_image.size
print(f"Original Image size: {original_width}x{original_height} pixels")

# Calculate the minimum zoom level (Z_min) where the entire image fits into one tile (256x256)
max_dim = max(original_width, original_height)
# The math.ceil is used to ensure we start at a zoom level where the image is just *smaller* than the tile size
MIN_LEAFLET_ZOOM = -math.ceil(math.log2(max_dim / TILE_SIZE))

print(f"Calculated Zoom Range: Z={MIN_LEAFLET_ZOOM} to Z={MAX_LEAFLET_ZOOM}")
print("Starting Tiling Process for Full Pyramid... This may take a while.")

# --- Tiling Function (Ensures Correct Path: {z}/{y}/{x}.png) ---
def tile_image(img, zoom_level, img_width, img_height):
    zoom_dir = os.path.join(OUTPUT_DIR, str(zoom_level))
    os.makedirs(zoom_dir, exist_ok=True)
    
    for y in range(0, img_height, TILE_SIZE):
        for x in range(0, img_width, TILE_SIZE):
            # Crop box (left, upper, right, lower)
            box = (x, y, x + TILE_SIZE, y + TILE_SIZE)
            tile = img.crop(box)

            # Compute indices
            tile_x_index = x // TILE_SIZE
            tile_y_index = y // TILE_SIZE

            # Folder structure: tiles/moon/{z}/{y}/{x}.png
            # Y index is the folder
            tile_y_dir = os.path.join(zoom_dir, str(tile_y_index))
            os.makedirs(tile_y_dir, exist_ok=True)

            # X index is the file name
            output_path = os.path.join(tile_y_dir, f"{tile_x_index}.png")
            tile.save(output_path)


# --- Main Pyramid Generation Loop ---
for z in range(MIN_LEAFLET_ZOOM, MAX_LEAFLET_ZOOM + 1):
    # Scale factor relative to Z=0
    scale_factor = math.pow(2, z)
    
    # Calculate the size of the image at this zoom level
    current_width = round(original_width * scale_factor)
    current_height = round(original_height * scale_factor)
    
    # Skip if the resized image is too small to even produce one tile
    if current_width < 1 or current_height < 1:
        continue

    print(f"  > Processing Z={z} ({current_width}x{current_height})...")
    
    # Resize the original image to the current size for this zoom level
    # Use LANCZOS (high quality resampling)
    resized_image = large_image.resize((current_width, current_height), Image.Resampling.LANCZOS)
    
    # Tile the resized image
    tile_image(resized_image, z, current_width, current_height)

print(f"\n✅ Full tile pyramid generation complete! Tiles are in '{OUTPUT_DIR}/{{z}}/{{y}}/{{x}}.png' format.")