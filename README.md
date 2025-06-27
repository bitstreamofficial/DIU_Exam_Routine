# DIU Exam Routine Website

A modern, responsive website for displaying DIU exam routines with filtering capabilities and standardized section names.

## Features

- 📅 **Date-wise grouping**: Exams are organized by date for easy navigation
- 🎯 **Multi-level filtering**: Filter by batch, then by section, and by specific dates
- 🔍 **Enhanced search**: Search by course title, ID, teacher, section, or batch number
- 🎨 **Modern UI**: Clean, responsive design that works on all devices
- ✨ **Current date highlighting**: Today's exams are highlighted automatically
- 📊 **Standardized sections**: Section names are formatted consistently (e.g., "61 A")
- 🔄 **Multi-file support**: Combines multiple JSON files into one dataset
- 🏢 **Room allocation**: Shows detailed room and seat distribution
- 📱 **Responsive design**: Works seamlessly on desktop, tablet, and mobile

## Files Structure

```
DIU_Exam_Routine/
├── index.html                          # Main website
├── styles.css                          # Website styling
├── script.js                           # Website functionality
├── process_exam_data.py                 # Data processing script
├── data_processor.html                 # Web-based data processor
├── process_data.bat                    # Batch file to run Python script
├── media/
│   ├── 01_7_2025.json                 # Date-based exam data files
│   ├── 02_07_2025.json
│   ├── ... (other date files)
│   ├── cse_processed_exam_routine.json     # Combined & processed CSE data
│   ├── cse_processed_exam_routine_summary.json # CSE processing statistics
│   ├── swe_summer_mid.json            # SWE department exam data
│   └── Bit_Stream_Logo.png            # Logo/favicon
└── README.md                           # This documentation
```

## How to Use

### Option 1: Using Python Script (Recommended)

1. **Add your JSON files** to the `media/` folder
   - Name them by date (e.g., `01_7_2025.json`, `02_07_2025.json`)
   - Each file should contain an array of exam objects

2. **Run the processing script**:
   ```bash
   python process_exam_data.py
   ```
   Or double-click `process_data.bat` on Windows

3. **Open the website**: Open `index.html` in your browser

### Option 2: Using Web-based Processor

1. Open `data_processor.html` in your browser
2. Upload your JSON files or paste JSON data
3. Click "Process Data" to combine and clean
4. Download the processed file as `cse_processed_exam_routine.json`
5. Place it in the `media/` folder
6. Open `index.html` in your browser

### Using the Website

1. **View all exams**: The routine displays all exams organized by date
2. **Filter by batch**: Use the "Filter by Batch" dropdown to select a specific batch (e.g., Batch 61, Batch 62)
3. **Filter by section**: After selecting a batch, the section dropdown will show only sections from that batch
4. **Filter by date**: Select a specific exam date to view only exams on that day
5. **Enhanced search**: Type in the search box to find:
   - Course titles (e.g., "Web Engineering")
   - Course IDs (e.g., "CSE414")
   - Teacher initials (e.g., "MIZ")
   - Section names (e.g., "61 A")
   - Batch numbers (e.g., "61" or "batch 61")
6. **Current date**: Today's exams are automatically highlighted with a special border

### Filtering Workflow

The filtering system works with multiple levels:
```
All Batches → Batch 61 → Section 61 A → Friday, June 28, 2025 → Search "Web Engineering"
```

- **Step 1**: Select a batch (60, 61, 62, etc.) or leave as "All Batches"
- **Step 2**: Section dropdown updates to show only relevant sections
- **Step 3**: Select a specific section or leave as "All Sections"
- **Step 4**: Select a specific date or leave as "All Dates"
- **Step 5**: Use search to find specific content within the filtered results

### Search Examples

- `"Web Engineering"` → Finds courses with "Web Engineering" in title
- `"CSE414"` → Finds course by ID
- `"MIZ"` → Finds exams by teacher initials
- `"61 A"` → Finds all exams for section 61 A
- `"61"` or `"batch 61"` → Finds all exams for batch 61

## Data Format

### Input JSON Format
Each JSON file should contain an array of exam objects:

```json
[
  {
    "Dept.": "CSE",
    "ID": "CSE414",
    "Course Title": "Web Engineering",
    "Tech. Int.": "MIZ", 
    "Section": "61_A",
    "Room No": "208",
    "Seat(s)": "27",
    "Total": "49",
    "Date": "28-06-2025"
  }
]
```

### Processing Features

The Python script automatically:
- ✅ Combines all JSON files in the `media/` folder
- ✅ Standardizes section names (e.g., `61_A` → `61 A`)
- ✅ Groups exams by date and course
- ✅ Handles multiple rooms for the same exam
- ✅ Generates statistics and summary

### Output Format

Each processed exam entry includes:

```json
{
    "Dept.": "CSE",
    "ID": "CSE414",
    "Course Title": "Web Engineering",
    "Tech. Int.": "MIZ",
    "Section": "61 A",
    "Room No": "208",
    "Seat(s)": "27",
    "Total": "49",
    "Date": "28-06-2025"
}
```

## Browser Compatibility

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## Features in Detail

### Advanced Filtering System
- **Batch Filtering**: Filter by specific batches (60, 61, 62, etc.)
- **Section Filtering**: Dynamic section dropdown based on selected batch
- **Date Filtering**: Filter by specific exam dates with chronological sorting
- **Multi-criteria**: Combine batch, section, and date filters simultaneously

### Enhanced Search
- **Multi-field Search**: Search across course titles, IDs, teacher initials, sections, and batch numbers
- **Real-time Results**: Instant search with debouncing for better performance
- **Case-insensitive**: Search works regardless of capitalization
- **Batch-aware**: Search for "61" or "batch 61" to find all batch 61 exams

### Responsive Design
- **Mobile-first Approach**: Optimized for smartphones and tablets
- **Flexible Grid Layout**: Adapts from 4-column to single-column layout
- **Touch-friendly Interface**: Large tap targets for mobile users
- **Breakpoint System**: Custom layouts for different screen sizes

### Visual Design
- Modern gradient backgrounds
- Card-based layout
- Smooth hover animations
- Color-coded sections

## Future Enhancements

- Export functionality (PDF, Excel)
- Print-friendly version
- Dark mode toggle
- Exam calendar view
- Notification reminders

## Technical Notes

- Pure HTML, CSS, and JavaScript (no external dependencies)
- Uses ES6+ features (async/await, arrow functions, template literals)
- Responsive CSS Grid and Flexbox layout
- Fetch API for data loading

---

Created for Daffodil International University Exam Management System
