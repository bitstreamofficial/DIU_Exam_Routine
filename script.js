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
        // Try to load processed data first, fallback to original if not available
        let response;
        try {
            response = await fetch('media/processed_exam_routine.json');
            if (!response.ok) throw new Error('Processed file not found');
            console.log('✅ Loading processed exam data...');
        } catch (e) {
            console.log('📁 Loading original exam data...');
            response = await fetch('media/exam_routine.json');
        }
        
        examData = await response.json();
        filteredData = [...examData];
        
        populateBatchFilter();
        populateSectionFilter();
        populateDateFilter();
        displayExamRoutine(filteredData);
    } catch (error) {
        console.error('Error loading exam data:', error);
        showError('Failed to load exam routine data. Please check if the JSON file exists in the media folder.');
    }
}

// Setup event listeners
function setupEventListeners() {
    const batchFilter = document.getElementById('batchFilter');
    const sectionFilter = document.getElementById('sectionFilter');
    const dateFilter = document.getElementById('dateFilter');
    const courseSearch = document.getElementById('courseSearch');
    
    batchFilter.addEventListener('change', onBatchChange);
    sectionFilter.addEventListener('change', filterData);
    dateFilter.addEventListener('change', filterData);
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

// Extract batch number from section name (e.g., "61 A" -> "61")
function extractBatch(section) {
    const match = section.match(/^(\d+)/);
    return match ? match[1] : '';
}

// Populate batch filter dropdown
function populateBatchFilter() {
    const batchFilter = document.getElementById('batchFilter');
    const batches = [...new Set(examData.map(exam => extractBatch(exam.Section)))].filter(batch => batch).sort();
    
    // Clear existing options except "All Batches"
    batchFilter.innerHTML = '<option value="">All Batches</option>';
    
    batches.forEach(batch => {
        const option = document.createElement('option');
        option.value = batch;
        option.textContent = `Batch ${batch}`;
        batchFilter.appendChild(option);
    });
}

// Handle batch filter change - update sections dropdown
function onBatchChange() {
    const selectedBatch = document.getElementById('batchFilter').value;
    populateSectionFilterByBatch(selectedBatch);
    
    // Reset section and date filters when batch changes
    document.getElementById('sectionFilter').value = '';
    document.getElementById('dateFilter').value = '';
    
    // Apply filtering
    filterData();
}

// Populate section filter based on selected batch
function populateSectionFilterByBatch(selectedBatch) {
    const sectionFilter = document.getElementById('sectionFilter');
    let sections;
    
    if (selectedBatch) {
        // Filter sections by batch
        sections = [...new Set(examData
            .filter(exam => extractBatch(exam.Section) === selectedBatch)
            .map(exam => exam.Section))]
            .sort();
    } else {
        // Show all sections
        sections = [...new Set(examData.map(exam => exam.Section))].sort();
    }
    
    // Clear existing options except "All Sections"
    sectionFilter.innerHTML = '<option value="">All Sections</option>';
    
    sections.forEach(section => {
        const option = document.createElement('option');
        option.value = section;
        option.textContent = section;
        sectionFilter.appendChild(option);
    });
}

// Populate section filter dropdown
function populateSectionFilter() {
    populateSectionFilterByBatch(''); // Show all sections initially
}

// Populate date filter dropdown
function populateDateFilter() {
    const dateFilter = document.getElementById('dateFilter');
    const dates = [...new Set(examData.map(exam => exam.Date))].filter(date => date && date.trim());
    
    // Sort dates chronologically
    const sortedDates = dates.sort((a, b) => {
        const dateA = parseDate(a);
        const dateB = parseDate(b);
        return dateA - dateB;
    });
    
    // Clear existing options except "All Dates"
    dateFilter.innerHTML = '<option value="">All Dates</option>';
    
    sortedDates.forEach(date => {
        const option = document.createElement('option');
        option.value = date;
        option.textContent = formatDate(date);
        dateFilter.appendChild(option);
    });
}

// Filter data based on batch, section, date and search criteria
function filterData() {
    const batchFilter = document.getElementById('batchFilter').value;
    const sectionFilter = document.getElementById('sectionFilter').value;
    const dateFilter = document.getElementById('dateFilter').value;
    const searchTerm = document.getElementById('courseSearch').value.toLowerCase();
    
    filteredData = examData.filter(exam => {
        const matchesBatch = !batchFilter || extractBatch(exam.Section) === batchFilter;
        const matchesSection = !sectionFilter || exam.Section === sectionFilter;
        const matchesDate = !dateFilter || exam.Date === dateFilter;
        
        // Enhanced search: course title, ID, teacher, section, and batch
        const matchesSearch = !searchTerm || 
            exam['Course Title'].toLowerCase().includes(searchTerm) ||
            exam.ID.toLowerCase().includes(searchTerm) ||
            exam['Tech. Int.'].toLowerCase().includes(searchTerm) ||
            exam.Section.toLowerCase().includes(searchTerm) ||
            extractBatch(exam.Section).includes(searchTerm) ||
            `batch ${extractBatch(exam.Section)}`.includes(searchTerm);
        
        return matchesBatch && matchesSection && matchesDate && matchesSearch;
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
    const isToday = isCurrentDate(date);
    
    return `
        <div class="date-group ${isToday ? 'current-date' : ''}">
            <div class="date-header">
                ${formattedDate}
                ${isToday ? '<span class="today-badge">TODAY</span>' : ''}
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

// Check if a date string matches today's date
function isCurrentDate(dateString) {
    const examDate = parseDate(dateString);
    const today = new Date();
    
    return examDate.getDate() === today.getDate() &&
           examDate.getMonth() === today.getMonth() &&
           examDate.getFullYear() === today.getFullYear();
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
