#!/usr/bin/env python3
"""
DIU Exam Routine Data Processor

This script processes and standardizes exam routine data:
- Combines all JSON files in the media folder into one dataset
- Standardizes section names to format like "61 A"
- Groups exams by date for better website display
- Saves processed data to media folder
"""

import json
import os
import re
import glob
from datetime import datetime
from collections import defaultdict, OrderedDict


def combine_json_files(media_folder):
    """
    Combine all JSON files in the media folder into one dataset
    """
    combined_data = []
    json_files = []
    
    # Find all JSON files in the media folder
    json_pattern = os.path.join(media_folder, "*.json")
    json_files = glob.glob(json_pattern)
    
    # Filter out processed files to avoid recursion
    json_files = [f for f in json_files if not os.path.basename(f).startswith("processed_")]
    
    if not json_files:
        print(f"❌ No JSON files found in {media_folder}")
        return None
    
    print(f"📁 Found {len(json_files)} JSON files to combine:")
    for file_path in sorted(json_files):
        filename = os.path.basename(file_path)
        print(f"   • {filename}")
    
    # Combine all JSON files
    for file_path in sorted(json_files):
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
                
            if isinstance(data, list):
                combined_data.extend(data)
                print(f"   ✅ {os.path.basename(file_path)}: {len(data)} entries")
            else:
                print(f"   ⚠️  {os.path.basename(file_path)}: Not a list, skipping")
                
        except json.JSONDecodeError as e:
            print(f"   ❌ {os.path.basename(file_path)}: JSON decode error - {e}")
        except Exception as e:
            print(f"   ❌ {os.path.basename(file_path)}: Error - {e}")
    
    print(f"\n🔗 Combined total: {len(combined_data)} entries")
    return combined_data


def standardize_section_name(section):
    """
    Standardize section names to format like "61 A"
    Handles formats: 67_A, 67A, 67 A -> 67 A
    """
    if not section:
        return section
    
    # Clean the section name
    clean_section = section.strip()
    
    # Replace underscore with space
    clean_section = clean_section.replace('_', ' ')
    
    # Add space between number and letter if missing
    clean_section = re.sub(r'(\d+)([A-Z])', r'\1 \2', clean_section)
    
    # Replace multiple spaces with single space
    clean_section = re.sub(r'\s+', ' ', clean_section)
    
    return clean_section.upper()


def standardize_date(date_str):
    """
    Ensure date is in DD-MM-YYYY format
    """
    if not date_str:
        return date_str
    
    parts = date_str.split('-')
    if len(parts) == 3:
        day, month, year = parts
        return f"{day.zfill(2)}-{month.zfill(2)}-{year}"
    
    return date_str


def clean_exam_data(exam_data):
    """
    Clean and standardize exam data
    """
    cleaned_data = []
    
    for exam in exam_data:
        cleaned_exam = {
            "Dept.": exam.get("Dept.", exam.get("Department", "")).strip(),
            "ID": exam.get("ID", exam.get("Course ID", "")).strip(),
            "Course Title": exam.get("Course Title", "").strip(),
            "Tech. Int.": exam.get("Tech. Int.", "").strip(),
            "Section": standardize_section_name(exam.get("Section", "")),
            "Room No": str(exam.get("Room No", "")).strip(),
            "Seat(s)": str(exam.get("Seat(s)", "")).strip(),
            "Total": str(exam.get("Total", "")).strip() if exam.get("Total") else "",
            "Date": standardize_date(exam.get("Date", "")),
            "Time": exam.get("Time", "").strip(),
            "Slot": exam.get("Slot", "").strip(),
            "Syllabus": exam.get("Syllabus", "").strip(),
            "Notes": exam.get("Notes", "").strip()
        }
        cleaned_data.append(cleaned_exam)
    
    return cleaned_data


def group_exams_by_date_and_course(exam_data):
    """
    Group exams by date and course for better display
    """
    grouped = defaultdict(lambda: defaultdict(lambda: {
        "course_info": None,
        "rooms": []
    }))
    
    for exam in exam_data:
        date = exam["Date"]
        course_key = f"{exam['ID']}-{exam['Section']}"
        
        # Store course information
        if grouped[date][course_key]["course_info"] is None:
            grouped[date][course_key]["course_info"] = {
                "Dept.": exam["Dept."],
                "ID": exam["ID"],
                "Course Title": exam["Course Title"],
                "Tech. Int.": exam["Tech. Int."],
                "Section": exam["Section"],
                "Date": exam["Date"],
                "Total": exam["Total"] or "",
                "Time": exam["Time"],
                "Slot": exam["Slot"],
                "Syllabus": exam["Syllabus"],
                "Notes": exam["Notes"]
            }
        
        # Add room information
        grouped[date][course_key]["rooms"].append({
            "Room No": exam["Room No"],
            "Seat(s)": exam["Seat(s)"]
        })
        
        # Update total if current exam has total and stored total is empty
        if exam["Total"] and not grouped[date][course_key]["course_info"]["Total"]:
            grouped[date][course_key]["course_info"]["Total"] = exam["Total"]
    
    return grouped


def convert_to_flat_array(grouped_data):
    """
    Convert grouped data back to flat array for website compatibility
    """
    result = []
    
    # Sort dates, handling empty dates
    valid_dates = [date for date in grouped_data.keys() if date and date.strip()]
    sorted_dates = sorted(valid_dates, key=lambda x: datetime.strptime(x, "%d-%m-%Y"))
    
    # Add any entries with empty dates at the end
    empty_date_key = ""
    if empty_date_key in grouped_data:
        sorted_dates.append(empty_date_key)
    
    for date in sorted_dates:
        courses = grouped_data[date]
        for course_key, course_data in courses.items():
            course_info = course_data["course_info"]
            rooms = course_data["rooms"]
            
            # Create one entry per room for compatibility
            for i, room in enumerate(rooms):
                result.append({
                    "Dept.": course_info["Dept."],
                    "ID": course_info["ID"],
                    "Course Title": course_info["Course Title"],
                    "Tech. Int.": course_info["Tech. Int."],
                    "Section": course_info["Section"],
                    "Room No": room["Room No"],
                    "Seat(s)": room["Seat(s)"],
                    "Total": course_info["Total"] if i == 0 else "",  # Only show total on first room
                    "Date": course_info["Date"],
                    "Time": course_info["Time"] if i == 0 else "",  # Only show time on first room
                    "Slot": course_info["Slot"] if i == 0 else "",   # Only show slot on first room
                    "Syllabus": course_info["Syllabus"] if i == 0 else "",  # Only show syllabus on first room
                    "Notes": course_info["Notes"] if i == 0 else ""         # Only show notes on first room
                })
    
    return result


def get_statistics(exam_data):
    """
    Generate statistics about the exam data
    """
    unique_sections = sorted(list(set(exam["Section"] for exam in exam_data)))
    unique_courses = sorted(list(set(exam["ID"] for exam in exam_data)))
    unique_departments = sorted(list(set(exam["Dept."] for exam in exam_data)))
    
    # Filter out empty dates for statistics
    valid_dates = [exam["Date"] for exam in exam_data if exam["Date"] and exam["Date"].strip()]
    unique_dates = sorted(list(set(valid_dates)), 
                         key=lambda x: datetime.strptime(x, "%d-%m-%Y"))
    
    # Count entries per section
    section_counts = defaultdict(int)
    for exam in exam_data:
        section_counts[exam["Section"]] += 1
    
    return {
        "total_entries": len(exam_data),
        "unique_courses": len(unique_courses),
        "unique_sections": len(unique_sections),
        "unique_departments": unique_departments,
        "date_range": {
            "start": unique_dates[0] if unique_dates else "",
            "end": unique_dates[-1] if unique_dates else "",
            "total_days": len(unique_dates)
        },
        "sections": unique_sections,
        "section_counts": dict(section_counts),
        "courses": unique_courses
    }


def process_exam_routine(media_folder, output_file):
    """
    Main processing function - now combines all JSON files first
    """
    try:
        print("📚 Processing DIU Exam Routine Data...")
        print("=" * 50)
        
        # Combine all JSON files in the media folder
        exam_data = combine_json_files(media_folder)
        
        if exam_data is None:
            return False
        
        print(f"\n📊 Combined data: {len(exam_data)} entries")
        
        # Clean and standardize the data
        cleaned_data = clean_exam_data(exam_data)
        print(f"🧹 Cleaned data: {len(cleaned_data)} entries")
        
        # Group by date and course, then convert back to flat array
        grouped_data = group_exams_by_date_and_course(cleaned_data)
        processed_data = convert_to_flat_array(grouped_data)
        print(f"🔄 Processed data: {len(processed_data)} entries")
        
        # Create output directory if it doesn't exist
        output_dir = os.path.dirname(output_file)
        if output_dir and not os.path.exists(output_dir):
            os.makedirs(output_dir)
        
        # Write the processed data
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(processed_data, f, indent=2, ensure_ascii=False)
        
        # Generate and display statistics
        stats = get_statistics(processed_data)
        
        print("\n✅ Processing Complete!")
        print("=" * 50)
        print("📈 Statistics:")
        print(f"   • Total entries: {stats['total_entries']}")
        print(f"   • Unique courses: {stats['unique_courses']}")
        print(f"   • Unique sections: {stats['unique_sections']}")
        print(f"   • Departments: {', '.join(stats['unique_departments'])}")
        print(f"   • Date range: {stats['date_range']['start']} to {stats['date_range']['end']}")
        print(f"   • Total exam days: {stats['date_range']['total_days']}")
        
        print("\n📝 Sections found:")
        for section in stats['sections']:
            count = stats['section_counts'][section]
            print(f"   • {section}: {count} entries")
        
        print(f"\n💾 Processed data saved to: {output_file}")
        
        # Create summary file
        summary_file = output_file.replace('.json', '_summary.json')
        summary_data = {
            **stats,
            "last_updated": datetime.now().isoformat(),
            "processed_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "input_folder": media_folder,
            "output_file": output_file
        }
        
        with open(summary_file, 'w', encoding='utf-8') as f:
            json.dump(summary_data, f, indent=2, ensure_ascii=False)
        
        print(f"📋 Summary saved to: {summary_file}")
        print("\n🎯 Data is now ready for your website!")
        
        return True
        
    except Exception as e:
        print(f"❌ Error processing exam routine: {str(e)}")
        return False


def main():
    """
    Main function to run the script
    """
    print("🎓 DIU Exam Routine Data Processor")
    print("=" * 50)
    
    # Define paths
    media_folder = "media"
    output_file = "media/cse_processed_exam_routine.json"
    
    # Check if media folder exists
    if not os.path.exists(media_folder):
        print(f"❌ Media folder not found: {media_folder}")
        print("\n📁 Please ensure the following file structure:")
        print("   media/")
        print("   ├── 01_7_2025.json")
        print("   ├── 02_07_2025.json")
        print("   └── ... (other date-based JSON files)")
        return
    
    # Process the data
    success = process_exam_routine(media_folder, output_file)
    
    if success:
        print("\n🚀 Next steps:")
        print("   1. Open your website (index.html)")
        print("   2. The current date will be highlighted")
        print("   3. Use section filter to filter by sections")
        print("   4. All section names are now standardized")
        print("   5. All JSON files have been combined and processed")
    else:
        print("\n❌ Processing failed. Please check the error messages above.")


if __name__ == "__main__":
    main()
