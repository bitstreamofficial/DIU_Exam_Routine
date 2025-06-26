# DIU Exam Routine Website

A modern, responsive web application that displays the Daffodil International University (DIU) exam routine from a JSON data source.

## Features

- **Date-wise Organization**: Exams are grouped and displayed by date in chronological order
- **Section Filtering**: Filter exams by specific sections
- **Course Search**: Search exams by course title, course ID, or teacher initials
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **Modern UI**: Beautiful gradient design with hover effects and smooth animations
- **Room Allocation Display**: Shows detailed room and seat allocation for each exam

## Files Structure

```
DIU_Exam_Routine/
├── index.html          # Main HTML file
├── styles.css          # CSS styles and responsive design
├── script.js           # JavaScript functionality
├── exam_routine.json   # Exam data source
└── README.md          # Project documentation
```

## How to Use

1. **Open the website**: Simply open `index.html` in any modern web browser
2. **View all exams**: The routine displays all exams organized by date
3. **Filter by section**: Use the "Filter by Section" dropdown to show exams for a specific section
4. **Search courses**: Type in the search box to find specific courses by title, ID, or teacher
5. **View details**: Each exam card shows:
   - Course title and ID
   - Department and section
   - Teacher initials
   - Total number of students
   - Room allocation with seat distribution

## Data Format

The application reads exam data from `exam_routine.json`. Each exam entry includes:

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

### Responsive Design
- Mobile-first approach
- Flexible grid layout
- Touch-friendly interface

### Search and Filter
- Real-time search with debouncing
- Case-insensitive search
- Multiple filter criteria support

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
