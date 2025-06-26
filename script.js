// Global variables
let examData = [];
let filteredData = [];

// Load and initialize the application
document.addEventListener('DOMContentLoaded', function() {
    loadExamData();
    setupEventListeners();
});

// Load exam data from JSON file
async function loadExamData() {
    try {
        const response = await fetch('exam_routine.json');
        examData = await response.json();
        filteredData = [...examData];
        
        populateSectionFilter();
        displayExamRoutine(filteredData);
    } catch (error) {
        console.error('Error loading exam data:', error);
        showError('Failed to load exam routine data.');
    }
}

// Setup event listeners
function setupEventListeners() {
    const sectionFilter = document.getElementById('sectionFilter');
    const courseSearch = document.getElementById('courseSearch');
    
    sectionFilter.addEventListener('change', filterData);
    courseSearch.addEventListener('input', debounce(filterData, 300));
}

// Debounce function for search input
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Populate section filter dropdown
function populateSectionFilter() {
    const sectionFilter = document.getElementById('sectionFilter');
    const sections = [...new Set(examData.map(exam => exam.Section))].sort();
    
    // Clear existing options except "All Sections"
    sectionFilter.innerHTML = '<option value="">All Sections</option>';
    
    sections.forEach(section => {
        const option = document.createElement('option');
        option.value = section;
        option.textContent = section;
        sectionFilter.appendChild(option);
    });
}

// Filter data based on section and search criteria
function filterData() {
    const sectionFilter = document.getElementById('sectionFilter').value;
    const searchTerm = document.getElementById('courseSearch').value.toLowerCase();
    
    filteredData = examData.filter(exam => {
        const matchesSection = !sectionFilter || exam.Section === sectionFilter;
        const matchesSearch = !searchTerm || 
            exam['Course Title'].toLowerCase().includes(searchTerm) ||
            exam.ID.toLowerCase().includes(searchTerm) ||
            exam['Tech. Int.'].toLowerCase().includes(searchTerm);
        
        return matchesSection && matchesSearch;
    });
    
    displayExamRoutine(filteredData);
}

// Display exam routine grouped by date
function displayExamRoutine(data) {
    const container = document.getElementById('routineContainer');
    const noResults = document.getElementById('noResults');
    
    if (data.length === 0) {
        container.style.display = 'none';
        noResults.style.display = 'block';
        return;
    }
    
    container.style.display = 'block';
    noResults.style.display = 'none';
    
    // Group exams by date
    const examsByDate = groupExamsByDate(data);
    
    // Sort dates
    const sortedDates = Object.keys(examsByDate).sort((a, b) => new Date(parseDate(a)) - new Date(parseDate(b)));
    
    // Generate HTML
    container.innerHTML = sortedDates.map(date => createDateGroupHTML(date, examsByDate[date])).join('');
}

// Group exams by date
function groupExamsByDate(data) {
    return data.reduce((groups, exam) => {
        const date = exam.Date;
        if (!groups[date]) {
            groups[date] = [];
        }
        groups[date].push(exam);
        return groups;
    }, {});
}

// Parse date string to Date object
function parseDate(dateString) {
    const [day, month, year] = dateString.split('-');
    return new Date(year, month - 1, day);
}

// Format date for display
function formatDate(dateString) {
    const date = parseDate(dateString);
    const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    };
    return date.toLocaleDateString('en-US', options);
}

// Create HTML for a date group
function createDateGroupHTML(date, exams) {
    const formattedDate = formatDate(date);
    const examsBySession = groupExamsBySession(exams);
    
    return `
        <div class="date-group">
            <div class="date-header">
                ${formattedDate}
            </div>
            <div class="exams-grid">
                ${Object.entries(examsBySession).map(([session, sessionExams]) => 
                    createSessionHTML(session, sessionExams)
                ).join('')}
            </div>
        </div>
    `;
}

// Group exams by course and section for the same session
function groupExamsBySession(exams) {
    const sessions = {};
    
    exams.forEach(exam => {
        const sessionKey = `${exam.ID}-${exam.Section}`;
        if (!sessions[sessionKey]) {
            sessions[sessionKey] = {
                course: exam,
                rooms: []
            };
        }
        sessions[sessionKey].rooms.push({
            roomNo: exam['Room No'],
            seats: exam['Seat(s)'],
            total: exam.Total
        });
    });
    
    return sessions;
}

// Create HTML for a session (course with multiple rooms)
function createSessionHTML(sessionKey, sessionData) {
    const { course, rooms } = sessionData;
    
    return `
        <div class="exam-card">
            <div class="course-header">
                <div class="course-title">${course['Course Title']}</div>
                <div class="course-id">${course.ID}</div>
            </div>
            
            <div class="exam-details">
                <div class="detail-item">
                    <span class="detail-label">Department:</span>
                    <span class="detail-value">${course['Dept.']}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Section:</span>
                    <span class="detail-value">
                        <span class="section-tag">${course.Section}</span>
                    </span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Teacher:</span>
                    <span class="detail-value">
                        <span class="teacher-tag">${course['Tech. Int.']}</span>
                    </span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Total Students:</span>
                    <span class="detail-value">${rooms.find(r => r.total)?.total || 'N/A'}</span>
                </div>
            </div>
            
            <div class="room-info">
                <strong>Room Allocation:</strong>
                ${rooms.map(room => `
                    <div class="room-details">
                        <span class="room-number">Room ${room.roomNo}</span>
                        <span class="seat-info">${room.seats} seats</span>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

// Show error message
function showError(message) {
    const container = document.getElementById('routineContainer');
    container.innerHTML = `
        <div class="error-message" style="text-align: center; padding: 40px; background: white; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.1);">
            <h3 style="color: #e74c3c; margin-bottom: 10px;">Error</h3>
            <p style="color: #7f8c8d;">${message}</p>
        </div>
    `;
}

// Utility function to get unique values from array
function getUniqueValues(array, key) {
    return [...new Set(array.map(item => item[key]))];
}

// Add smooth scrolling for better UX
document.addEventListener('DOMContentLoaded', function() {
    const style = document.createElement('style');
    style.textContent = `
        html {
            scroll-behavior: smooth;
        }
    `;
    document.head.appendChild(style);
});
