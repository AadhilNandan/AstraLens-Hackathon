import csv
import json

# --- CONFIGURATION ---
CSV_FILE_PATH = 'lunar_features.csv'
JSON_FILE_PATH = 'features_all.json'
# -------------------

lunar_features_list = []
feature_counter = 0 # To generate unique IDs

print(f"Reading data from {CSV_FILE_PATH}...")

try:
    with open(CSV_FILE_PATH, mode='r', encoding='utf-8') as csv_file:
        csv_reader = csv.DictReader(csv_file)
        
        for row in csv_reader:
            # CORRECTED: Since 'Approval Status' is missing, we will not check for it.
            # We will still check that the coordinate columns exist and are not empty.
            # CORRECTED: Use the exact, strangely-spaced column name for Longitude.
            if row['Center Latitude'] and row['Center Longitude']:
                
                feature_counter += 1
                # CORRECTED: Generate a simple unique ID since 'Feature ID' is also missing.
                feature_id = f"{row['Feature Name'][:3].upper()}-{feature_counter}"
                
                # Create the feature object in the format our app needs
                feature = {
                    "id": feature_id,
                    "name": row['Feature Name'],
                    "coordinates": [
                        float(row['Center Latitude']),
                        float(row['Center Longitude']) # CORRECTED
                    ],
                    "description": f"A {row['Feature Type']} on the Moon with a diameter of {row['Diameter']} km.",
                    "imageUrl": "" 
                }
                lunar_features_list.append(feature)

except FileNotFoundError:
    print(f"ERROR: Could not find the file {CSV_FILE_PATH}.")
    exit()
    
print(f"Successfully processed {len(lunar_features_list)} features.")

# Write the list of features to a new JSON file
with open(JSON_FILE_PATH, 'w', encoding='utf-8') as json_file:
    json.dump(lunar_features_list, json_file, indent=2)
    
print(f"All features have been saved to {JSON_FILE_PATH}")