
#!/usr/bin/env python3
"""
JSON File Merger Script
Combines all JSON files from media/data folder into a single swe_summer_mid.json file
Also automatically formats section fields (replaces hyphens with spaces)
"""

import json
import os
from pathlib import Path

def merge_json_files():
    """
    Merge all JSON files from media/data folder into swe_summer_mid.json
    Also formats section fields by replacing hyphens with spaces
    """
    # Define paths
    data_folder = Path("media/Data")
    output_file = Path("media/swe_summer_mid.json")
    
    # Check if data folder exists
    if not data_folder.exists():
        print(f"❌ Error: {data_folder} folder not found!")
        return False
    
    # Get all JSON files from data folder
    json_files = list(data_folder.glob("*.json"))
    
    if not json_files:
        print(f"❌ No JSON files found in {data_folder}")
        return False
    
    print(f"📁 Found {len(json_files)} JSON files in {data_folder}")
    
    # Combined data list
    merged_data = []
    
    # Process each JSON file
    for json_file in sorted(json_files):
        try:
            print(f"📄 Processing: {json_file.name}")
            
            with open(json_file, 'r', encoding='utf-8') as f:
                file_data = json.load(f)
            
            # Handle different data structures and fix section formatting
            if isinstance(file_data, list):
                # Process each entry and fix section formatting
                processed_entries = []
                for entry in file_data:
                    # Fix section field if it exists
                    if isinstance(entry, dict) and 'Section' in entry and entry['Section']:
                        entry['Section'] = entry['Section'].replace('-', ' ')
                    processed_entries.append(entry)
                
                # If file contains a list of objects, extend the merged data
                merged_data.extend(processed_entries)
                print(f"   ✅ Added {len(processed_entries)} entries from {json_file.name}")
            elif isinstance(file_data, dict):
                # Fix section field if it exists
                if 'Section' in file_data and file_data['Section']:
                    file_data['Section'] = file_data['Section'].replace('-', ' ')
                
                # If file contains a single object, append it
                merged_data.append(file_data)
                print(f"   ✅ Added 1 entry from {json_file.name}")
            else:
                print(f"   ⚠️  Warning: Unexpected data format in {json_file.name}")
                
        except json.JSONDecodeError as e:
            print(f"   ❌ Error reading {json_file.name}: Invalid JSON format - {e}")
        except Exception as e:
            print(f"   ❌ Error processing {json_file.name}: {e}")
    
    if not merged_data:
        print("❌ No data to merge!")
        return False
    
    # Save merged data to output file
    try:
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(merged_data, f, indent=2, ensure_ascii=False)
        
        print(f"\n✅ Successfully merged {len(merged_data)} entries into {output_file}")
        print(f"📊 Total files processed: {len(json_files)}")
        print(f"💾 Output saved to: {output_file.absolute()}")
        
        return True
        
    except Exception as e:
        print(f"❌ Error saving merged file: {e}")
        return False

def validate_merged_file():
    """
    Validate the merged JSON file and show summary
    """
    output_file = Path("media/swe_summer_mid.json")
    
    if not output_file.exists():
        print("❌ Merged file not found!")
        return
    
    try:
        with open(output_file, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        print(f"\n📋 Validation Summary:")
        print(f"   Total entries: {len(data)}")
        
        if data:
            # Show sample fields from first entry
            first_entry = data[0]
            print(f"   Sample fields: {list(first_entry.keys())}")
            
            # Count unique dates and sections
            dates = set()
            departments = set()
            sections_with_hyphen = 0
            sections_with_space = 0
            
            for entry in data:
                if 'Date' in entry and entry['Date']:
                    dates.add(entry['Date'])
                if 'Department' in entry and entry['Department']:
                    departments.add(entry['Department'])
                if 'Section' in entry and entry['Section']:
                    if '-' in entry['Section']:
                        sections_with_hyphen += 1
                    elif ' ' in entry['Section']:
                        sections_with_space += 1
            
            print(f"   Unique dates: {len(dates)} - {sorted(dates)}")
            print(f"   Departments: {sorted(departments)}")
            print(f"   Section formatting:")
            print(f"     - With hyphens: {sections_with_hyphen}")
            print(f"     - With spaces: {sections_with_space}")
            
            if sections_with_hyphen == 0:
                print("   ✅ All sections properly formatted with spaces!")
            else:
                print("   ⚠️  Some sections still contain hyphens")
        
        print("✅ Merged file is valid JSON!")
        
    except Exception as e:
        print(f"❌ Error validating merged file: {e}")

if __name__ == "__main__":
    print("🔄 Starting JSON file merger...")
    print("=" * 50)
    
    # Change to script directory
    script_dir = Path(__file__).parent
    os.chdir(script_dir)
    
    # Merge files
    success = merge_json_files()
    
    if success:
        # Validate the result
        validate_merged_file()
        print("\n🎉 Merge operation completed successfully!")
    else:
        print("\n💥 Merge operation failed!")
    
    print("=" * 50)