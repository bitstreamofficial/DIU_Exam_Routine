#!/usr/bin/env python3
"""
Section Field Formatter Script
Replaces hyphens with spaces in the "Section" field of the SWE JSON file
"""

import json
from pathlib import Path

def fix_section_hyphens():
    """
    Replace hyphens with spaces in Section field of swe_summer_mid.json
    """
    json_file = Path("media/swe_summer_mid.json")
    backup_file = Path("media/swe_summer_mid_backup.json")
    
    # Check if file exists
    if not json_file.exists():
        print(f"❌ Error: {json_file} not found!")
        return False
    
    try:
        # Read the JSON file
        print(f"📖 Reading {json_file}...")
        with open(json_file, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        print(f"📊 Found {len(data)} entries to process")
        
        # Create backup
        print(f"💾 Creating backup as {backup_file}...")
        with open(backup_file, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        
        # Process each entry
        modified_count = 0
        for entry in data:
            if 'Section' in entry and entry['Section']:
                original_section = entry['Section']
                # Replace hyphen with space
                new_section = original_section.replace('-', ' ')
                
                if original_section != new_section:
                    entry['Section'] = new_section
                    modified_count += 1
        
        print(f"✏️  Modified {modified_count} section entries")
        
        # Save the updated JSON
        print(f"💾 Saving updated data to {json_file}...")
        with open(json_file, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        
        print(f"✅ Successfully updated {json_file}")
        print(f"📂 Backup saved as {backup_file}")
        
        # Show some examples of changes
        if modified_count > 0:
            print(f"\n📋 Sample changes made:")
            sample_count = 0
            for entry in data:
                if 'Section' in entry and ' ' in entry['Section']:
                    original = entry['Section'].replace(' ', '-')
                    print(f"   {original} → {entry['Section']}")
                    sample_count += 1
                    if sample_count >= 5:  # Show first 5 examples
                        break
        
        return True
        
    except json.JSONDecodeError as e:
        print(f"❌ Error: Invalid JSON format - {e}")
        return False
    except Exception as e:
        print(f"❌ Error processing file: {e}")
        return False

def validate_changes():
    """
    Validate the changes by checking section formats
    """
    json_file = Path("media/swe_summer_mid.json")
    
    try:
        with open(json_file, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        sections_with_hyphen = []
        sections_with_space = []
        
        for entry in data:
            if 'Section' in entry and entry['Section']:
                section = entry['Section']
                if '-' in section:
                    sections_with_hyphen.append(section)
                elif ' ' in section:
                    sections_with_space.append(section)
        
        unique_sections_hyphen = list(set(sections_with_hyphen))
        unique_sections_space = list(set(sections_with_space))
        
        print(f"\n🔍 Validation Results:")
        print(f"   Sections with hyphens: {len(unique_sections_hyphen)}")
        if unique_sections_hyphen:
            print(f"   Examples: {unique_sections_hyphen[:5]}")
        
        print(f"   Sections with spaces: {len(unique_sections_space)}")
        if unique_sections_space:
            print(f"   Examples: {unique_sections_space[:5]}")
        
        if len(unique_sections_hyphen) == 0:
            print("✅ All sections now use spaces instead of hyphens!")
        else:
            print("⚠️  Some sections still contain hyphens")
        
    except Exception as e:
        print(f"❌ Error during validation: {e}")

if __name__ == "__main__":
    print("🔧 Starting Section Field Formatter...")
    print("=" * 50)
    
    # Change to script directory
    script_dir = Path(__file__).parent
    import os
    os.chdir(script_dir)
    
    # Fix section hyphens
    success = fix_section_hyphens()
    
    if success:
        # Validate the changes
        validate_changes()
        print("\n🎉 Section formatting completed successfully!")
    else:
        print("\n💥 Section formatting failed!")
    
    print("=" * 50)