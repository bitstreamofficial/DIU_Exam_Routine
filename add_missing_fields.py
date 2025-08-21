import json

def add_missing_fields(json_file_path):
    """
    Add 'Syllabus' and 'Notes' fields to entries that are missing them
    """
    print(f"Processing {json_file_path}...")
    
    # Read the JSON file
    with open(json_file_path, 'r', encoding='utf-8') as file:
        data = json.load(file)
    
    modified_count = 0
    total_entries = len(data)
    
    # Check each entry
    for i, entry in enumerate(data):
        modified = False
        
        # Add Syllabus field if missing
        if 'Syllabus' not in entry:
            entry['Syllabus'] = ""
            modified = True
            print(f"Added Syllabus field to entry {i+1}")
        
        # Add Notes field if missing
        if 'Notes' not in entry:
            entry['Notes'] = ""
            modified = True
            print(f"Added Notes field to entry {i+1}")
        
        if modified:
            modified_count += 1
    
    # Save the updated file if any modifications were made
    if modified_count > 0:
        with open(json_file_path, 'w', encoding='utf-8') as file:
            json.dump(data, file, indent=2, ensure_ascii=False)
        print(f"\n✅ Updated {modified_count} entries out of {total_entries} total entries")
        print(f"✅ File saved: {json_file_path}")
    else:
        print(f"\n✅ All {total_entries} entries already have Syllabus and Notes fields")
        print("No modifications needed")

if __name__ == "__main__":
    # Process the CSE exam routine file
    json_file = "media/cse_processed_exam_routine.json"
    add_missing_fields(json_file)
