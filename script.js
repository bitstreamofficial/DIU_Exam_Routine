
// Global variables
let examData = [];
let filteredData = [];
let currentDepartment = 'cse'; // Default to CSE

// Department configuration
const departmentConfig = {
    cse: {
        file: 'media/cse_processed_exam_routine.json',
        name: 'CSE Department',
        fallback: 'media/exam_routine.json',
        fieldMapping: {
            courseId: 'ID',
            courseTitle: 'Course Title',
            department: 'Dept.',
            section: 'Section',
            teacher: 'Tech. Int.',
            roomNo: 'Room No',
            seats: 'Seat(s)',
            total: 'Total',
            date: 'Date',
            time: 'Time',
            slot: 'Slot',
            syllabus: 'Syllabus',
            notes: 'Notes'
        },
        displayConfig: {
            hasSeats: true,
            hasTeacher: true,
            hasSection: true,
            hasTotal: true,
            hasSyllabus: true,
            hasNotes: true,
            groupBySection: true
        }
    },
    swe: {
        file: 'media/swe_summer_mid.json',
        name: 'SWE Department',
        fallback: null,
        fieldMapping: {
            courseId: 'Course ID',
            courseTitle: 'Course Title',
            department: 'Department',
            
            section: 'Section',
            teacher: 'Tech. Int.',
            roomNo: 'Room No',
            seats: 'Seat(s)',
            total: 'Total',
            date: 'Date',
            time: 'Time',
            slot: 'Slot'
        },
        displayConfig: {

            hasSeats: true,
            hasTeacher: true,
            hasSection: true,
            hasTotal: true,
            hasSyllabus: false,
            hasNotes: false,

            hasBatch: false,
            groupBySection: true
        }
    }
};

// Load and initialize the application
document.addEventListener('DOMContentLoaded', function() {
    loadExamData();
    setupEventListeners();
    setupDepartmentSelector();
});

// Load exam data from JSON file
async function loadExamData(department = currentDepartment) {
    try {
        const config = departmentConfig[department];
        let response;
        
        try {
            response = await fetch(config.file);
            if (!response.ok) throw new Error(`${config.name} file not found`);
            console.log(`✅ Loading ${config.name} exam data...`);
        } catch (e) {
            if (config.fallback) {
                console.log(`📁 Loading fallback exam data for ${config.name}...`);
                response = await fetch(config.fallback);
            } else {
                throw new Error(`No data available for ${config.name}`);
            }
        }
        
        examData = await response.json();
        filteredData = [...examData];
        
        // Update current department
        currentDepartment = department;
        
        populateBatchFilter();
        populateSectionFilter();
        populateDateFilter();
        displayExamRoutine(filteredData);
    } catch (error) {
        console.error('Error loading exam data:', error);
        showError(`Failed to load ${departmentConfig[department]?.name || 'exam'} routine data. Please check if the JSON file exists in the media folder.`);
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

// Populate batch filter dropdown - Dynamic based on department
function populateBatchFilter() {
    const batchFilter = document.getElementById('batchFilter');
    const config = departmentConfig[currentDepartment];
    let batches = [];
    
    if (config.displayConfig.hasSection) {
        // For CSE - extract batch from section
        batches = [...new Set(examData.map(exam => extractBatch(exam[config.fieldMapping.section])))].filter(batch => batch).sort();
    } else if (config.displayConfig.hasBatch) {
        // For SWE - use batch field directly
        batches = [...new Set(examData.map(exam => exam[config.fieldMapping.batch]))].filter(batch => batch && batch !== 'Retake').sort();
        // Add retake at the end if it exists
        if (examData.some(exam => exam[config.fieldMapping.batch] === 'Retake')) {
            batches.push('Retake');
        }
    }
    
    // Clear existing options except "All Batches"
    batchFilter.innerHTML = '<option value="">All Batches</option>';
    
    batches.forEach(batch => {
        const option = document.createElement('option');
        option.value = batch;
        option.textContent = config.displayConfig.hasBatch ? 
            (batch === 'Retake' ? 'Retake' : `Batch ${batch}`) : 
            `Batch ${batch}`;
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

// Populate section filter based on selected batch - Dynamic
function populateSectionFilterByBatch(selectedBatch) {
    const sectionFilter = document.getElementById('sectionFilter');
    const config = departmentConfig[currentDepartment];
    let sections = [];
    
    if (config.displayConfig.hasSection) {
        // For CSE department with sections
        if (selectedBatch) {
            sections = [...new Set(examData
                .filter(exam => extractBatch(exam[config.fieldMapping.section]) === selectedBatch)
                .map(exam => exam[config.fieldMapping.section]))]
                .sort();
        } else {
            sections = [...new Set(examData.map(exam => exam[config.fieldMapping.section]))].sort();
        }
    } else if (config.displayConfig.hasBatch) {
        // For SWE department with batch field
        if (selectedBatch) {
            sections = [...new Set(examData
                .filter(exam => exam[config.fieldMapping.batch] === selectedBatch)
                .map(exam => exam[config.fieldMapping.courseId]))]
                .sort();
        } else {
            sections = [...new Set(examData.map(exam => exam[config.fieldMapping.courseId]))].sort();
        }
        
        // Change label for SWE
        sectionFilter.previousElementSibling.textContent = 'Filter by Course:';
    } else {
        // No section/batch filtering available
        sectionFilter.style.display = 'none';
        sectionFilter.previousElementSibling.style.display = 'none';
        return;
    }
    
    // Show section filter
    sectionFilter.style.display = 'block';
    sectionFilter.previousElementSibling.style.display = 'block';
    
    // Set appropriate label
    if (config.displayConfig.hasSection) {
        sectionFilter.previousElementSibling.textContent = 'Filter by Section:';
    }
    
    // Clear existing options
    const defaultText = config.displayConfig.hasSection ? 'All Sections' : 'All Courses';
    sectionFilter.innerHTML = `<option value="">${defaultText}</option>`;
    
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

// Populate date filter dropdown - Dynamic
function populateDateFilter() {
    const dateFilter = document.getElementById('dateFilter');
    const config = departmentConfig[currentDepartment];
    const dates = [...new Set(examData.map(exam => exam[config.fieldMapping.date]))].filter(date => date && date.trim());
    
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
    
    const config = departmentConfig[currentDepartment];
    const mapping = config.fieldMapping;
    const display = config.displayConfig;
    
    filteredData = examData.filter(exam => {
        // Dynamic batch matching
        let matchesBatch = true;
        if (batchFilter) {
            if (display.hasSection) {
                // CSE: extract batch from section
                matchesBatch = extractBatch(exam[mapping.section]) === batchFilter;
            } else if (display.hasBatch) {
                // SWE: use batch field directly
                matchesBatch = exam[mapping.batch] === batchFilter;
            }
        }
        
        // Dynamic section/course matching
        let matchesSection = true;
        if (sectionFilter) {
            if (display.hasSection) {
                matchesSection = exam[mapping.section] === sectionFilter;
            } else if (display.hasBatch) {
                // For SWE, section filter shows courses
                matchesSection = exam[mapping.courseId] === sectionFilter;
            }
        }
        
        // Dynamic date matching
        const matchesDate = !dateFilter || exam[mapping.date] === dateFilter;
        
        // Dynamic search
        let matchesSearch = true;
        if (searchTerm) {
            const courseTitle = exam[mapping.courseTitle]?.toLowerCase() || '';
            const courseId = exam[mapping.courseId]?.toLowerCase() || '';
            
            let searchFields = [courseTitle, courseId];
            
            // Add department-specific search fields
            if (display.hasTeacher && mapping.teacher) {
                searchFields.push(exam[mapping.teacher]?.toLowerCase() || '');
            }
            if (display.hasSection && mapping.section) {
                searchFields.push(exam[mapping.section]?.toLowerCase() || '');
                searchFields.push(extractBatch(exam[mapping.section]).toLowerCase());
                searchFields.push(`batch ${extractBatch(exam[mapping.section])}`.toLowerCase());
            }
            if (display.hasBatch && mapping.batch) {
                searchFields.push(exam[mapping.batch]?.toLowerCase() || '');
                searchFields.push(`batch ${exam[mapping.batch]}`.toLowerCase());
            }
            
            matchesSearch = searchFields.some(field => field.includes(searchTerm));
        }
        
        return matchesBatch && matchesSection && matchesDate && matchesSearch;
    });
    
    displayExamRoutine(filteredData);
}

// Display exam routine grouped by date
function displayExamRoutine(data) {
    const container = document.getElementById('routineContainer');
    const noResults = document.getElementById('noResults');
    const todayExams = document.getElementById('todayExams');
    const nextExams = document.getElementById('nextExams');
    const pastExams = document.getElementById('pastExams');
    const todayContainer = document.getElementById('todayExamsContainer');
    const nextContainer = document.getElementById('nextExamsContainer');
    const pastContainer = document.getElementById('pastExamsContainer');
    
    if (data.length === 0) {
        container.style.display = 'none';
        todayExams.style.display = 'none';
        nextExams.style.display = 'none';
        pastExams.style.display = 'none';
        noResults.style.display = 'block';
        return;
    }
    
    noResults.style.display = 'none';
    
    // Get current date
    const today = new Date();
    const todayStr = formatDateForComparison(today);
    
    // Separate exams into categories
    const { todayExamsData, nextExamsData, pastExamsData, futureExamsData } = categorizeExams(data, todayStr);
    
    // Display today's exams
    if (todayExamsData.length > 0) {
        todayExams.style.display = 'block';
        const todayGrouped = groupExamsBySession(todayExamsData);
        todayContainer.innerHTML = `<div class="exams-grid">${
            Object.entries(todayGrouped).map(([sessionKey, sessionData]) => 
                createSessionHTML(sessionKey, sessionData)
            ).join('')
        }</div>`;
    } else {
        todayExams.style.display = 'none';
    }
    
    // Display next upcoming exams
    if (nextExamsData.length > 0) {
        nextExams.style.display = 'block';
        const nextGrouped = groupExamsBySession(nextExamsData);
        nextContainer.innerHTML = `<div class="exams-grid">${
            Object.entries(nextGrouped).map(([sessionKey, sessionData]) => 
                createSessionHTML(sessionKey, sessionData)
            ).join('')
        }</div>`;
    } else {
        nextExams.style.display = 'none';
    }
    
    // Display future exams (routine)
    if (futureExamsData.length > 0) {
        container.style.display = 'block';
        const examsByDate = groupExamsByDate(futureExamsData);
        const sortedDates = Object.keys(examsByDate).sort((a, b) => parseDate(a) - parseDate(b));
        container.innerHTML = sortedDates.map(date => createDateGroupHTML(date, examsByDate[date])).join('');
    } else {
        container.style.display = 'none';
    }
    
    // Display past exams
    if (pastExamsData.length > 0) {
        pastExams.style.display = 'block';
        const pastGrouped = groupExamsBySession(pastExamsData);
        pastContainer.innerHTML = `<div class="exams-grid">${
            Object.entries(pastGrouped).map(([sessionKey, sessionData]) => 
                createSessionHTML(sessionKey, sessionData)
            ).join('')
        }</div>`;
    } else {
        pastExams.style.display = 'none';
    }
}

// Categorize exams into today, next, past, and future
function categorizeExams(data, todayStr) {
    const config = departmentConfig[currentDepartment];
    const dateField = config.fieldMapping.date;
    const today = new Date();
    const todayDateOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    
    const todayExamsData = [];
    const nextExamsData = [];
    const pastExamsData = [];
    const futureExamsData = [];
    
    // Find the next exam date after today
    const futureDates = [...new Set(data.map(exam => exam[dateField]))]
        .filter(date => {
            const examDate = parseDate(date);
            const examDateOnly = new Date(examDate.getFullYear(), examDate.getMonth(), examDate.getDate());
            return examDateOnly > todayDateOnly;
        })
        .sort((a, b) => parseDate(a) - parseDate(b));
    
    const nextExamDate = futureDates[0];
    
    data.forEach(exam => {
        const examDateStr = exam[dateField];
        const examDate = parseDate(examDateStr);
        const examDateOnly = new Date(examDate.getFullYear(), examDate.getMonth(), examDate.getDate());
        
        if (examDateOnly.getTime() === todayDateOnly.getTime()) {
            todayExamsData.push(exam);
        } else if (examDateStr === nextExamDate && nextExamDate) {
            nextExamsData.push(exam);
        } else if (examDateOnly < todayDateOnly) {
            pastExamsData.push(exam);
        } else {
            futureExamsData.push(exam);
        }
    });
    
    return { todayExamsData, nextExamsData, pastExamsData, futureExamsData };
}

// Format date for comparison (DD-MM-YYYY)
function formatDateForComparison(date) {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
}

// Group exams by date
function groupExamsByDate(data) {
    const config = departmentConfig[currentDepartment];
    const dateField = config.fieldMapping.date;
    
    return data.reduce((groups, exam) => {
        const date = exam[dateField];
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
    const config = departmentConfig[currentDepartment];
    const sessions = {};
    
    exams.forEach(exam => {
        const courseId = exam[config.fieldMapping.courseId];
        
        // Create a session key based on available data
        // Don't include slot/time in grouping since some entries have empty values
        let sessionKey;
        if (config.displayConfig.hasSection) {
            const section = exam[config.fieldMapping.section];
            sessionKey = `${courseId}-${section}`;
        } else if (config.displayConfig.hasBatch) {
            const batch = exam[config.fieldMapping.batch];
            sessionKey = `${courseId}-${batch}`;
        } else {
            sessionKey = `${courseId}`;
        }
        
        if (!sessions[sessionKey]) {
            sessions[sessionKey] = {
                course: exam,
                rooms: []
            };
        } else {
            // Update course info with the entry that has complete information (time, slot)
            const currentTime = sessions[sessionKey].course[config.fieldMapping.time];
            const examTime = exam[config.fieldMapping.time];
            if (!currentTime && examTime) {
                sessions[sessionKey].course = exam;
            }
        }
        
        // Add room information
        const roomInfo = {
            roomNo: exam[config.fieldMapping.roomNo]
        };
        
        // Add seats if available
        if (config.displayConfig.hasSeats && exam[config.fieldMapping.seats]) {
            roomInfo.seats = exam[config.fieldMapping.seats];
        }
        
        // Add total if available
        if (config.displayConfig.hasTotal && exam[config.fieldMapping.total]) {
            roomInfo.total = exam[config.fieldMapping.total];
        }
        
        sessions[sessionKey].rooms.push(roomInfo);
    });
    
    return sessions;
}

// Create HTML for a session (course with multiple rooms) - Dynamic based on department
function createSessionHTML(sessionKey, sessionData) {
    const { course, rooms } = sessionData;
    const config = departmentConfig[currentDepartment];
    const mapping = config.fieldMapping;
    const display = config.displayConfig;
    
    // Get course information dynamically
    const courseTitle = course[mapping.courseTitle];
    const courseId = course[mapping.courseId];
    const department = course[mapping.department];
    const time = course[mapping.time];
    const examDate = course[mapping.date];
    
    // Build details section dynamically
    let detailsHTML = `
        <div class="detail-item">
            <span class="detail-label">Department:</span>
            <span class="detail-value">${department}</span>
        </div>
    `;
    
    // Add section if available
    if (display.hasSection && mapping.section) {
        const section = course[mapping.section];
        detailsHTML += `
            <div class="detail-item">
                <span class="detail-label">Section:</span>
                <span class="detail-value">
                    <span class="section-tag">${section}</span>
                </span>
            </div>
        `;
    }
    
    // Add batch if available (for SWE)
    if (display.hasBatch && mapping.batch) {
        const batch = course[mapping.batch];
        detailsHTML += `
            <div class="detail-item">
                <span class="detail-label">Batch:</span>
                <span class="detail-value">
                    <span class="batch-tag">${batch}</span>
                </span>
            </div>
        `;
    }
    
    // Add teacher if available
    if (display.hasTeacher && mapping.teacher) {
        const teacher = course[mapping.teacher];
        detailsHTML += `
            <div class="detail-item">
                <span class="detail-label">Teacher:</span>
                <span class="detail-value">
                    <span class="teacher-tag">${teacher}</span>
                </span>
            </div>
        `;
    }
    
    // Add total students if available
    if (display.hasTotal) {
        const total = rooms.find(r => r.total)?.total || 'N/A';
        detailsHTML += `
            <div class="detail-item">
                <span class="detail-label">Total Students:</span>
                <span class="detail-value">${total}</span>
            </div>
        `;
    }
    
    // Build room info dynamically
    let roomInfoHTML = rooms.map(room => {
        let roomHTML = `<div class="room-details">
            <span class="room-number">${room.roomNo}</span>`;
        
        if (display.hasSeats && room.seats) {
            roomHTML += `<span class="seat-info">${room.seats}</span>`;
        }
        
        roomHTML += `</div>`;
        return roomHTML;
    }).join('');
    
    // Build resources section if available
    let resourcesHTML = '';
    if (display.hasSyllabus || display.hasNotes) {
        resourcesHTML = '<div class="exam-resources">';
        
        if (display.hasSyllabus) {
            const syllabus = course[mapping.syllabus];
            resourcesHTML += `
                <div class="resource-item">
                    <div class="resource-header">
                        <span class="resource-icon">📚</span>
                        <span class="resource-label">Syllabus</span>
                    </div>
                    <div class="resource-content">
                        ${syllabus ? `<a href="${syllabus}" target="_blank" class="resource-link">View Syllabus</a>` : '<span class="resource-na">Not Available</span>'}
                    </div>
                </div>
            `;
        }
        
        if (display.hasNotes) {
            const notes = course[mapping.notes];
            resourcesHTML += `
                <div class="resource-item">
                    <div class="resource-header">
                        <span class="resource-icon">📝</span>
                        <span class="resource-label">Notes</span>
                    </div>
                    <div class="resource-content">
                        ${notes ? `<a href="${notes}" target="_blank" class="resource-link">View Notes</a>` : '<span class="resource-na">Not Available</span>'}
                    </div>
                </div>
            `;
        }
        
        resourcesHTML += '</div>';
    }
    
    return `
        <div class="exam-card">
            <div class="course-header">
                <div class="course-title-row">
                    <div class="course-title">${courseTitle}</div>
                    <div class="exam-date-badge">${formatDate(examDate)}</div>
                    <div class="course-id">${courseId}</div>
                </div>
                ${time ? `<div class="exam-time">${time}</div>` : ''}
            </div>
            
            <div class="exam-details">
                ${detailsHTML}
            </div>
            
            <div class="room-info">
                ${roomInfoHTML}
            </div>
            
            ${resourcesHTML}
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

// Setup department selector
function setupDepartmentSelector() {
    const departmentTabs = document.querySelectorAll('.department-tab');
    
    departmentTabs.forEach(tab => {
        tab.addEventListener('click', async function() {
            const selectedDepartment = this.getAttribute('data-department');
            
            // Don't reload if already selected
            if (selectedDepartment === currentDepartment) return;
            
            // Update active tab
            departmentTabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active', 'loading');
            
            try {
                // Clear current data
                document.getElementById('routineContainer').innerHTML = '<div style="text-align: center; padding: 40px; color: #666;">Loading exam routine...</div>';
                
                // Reset filters
                resetFilters();
                
                // Load new department data
                await loadExamData(selectedDepartment);
                
                console.log(`✅ Switched to ${departmentConfig[selectedDepartment].name}`);
            } catch (error) {
                console.error('Error switching department:', error);
                showError(`Failed to load ${departmentConfig[selectedDepartment]?.name || 'department'} data.`);
                
                // Revert to previous department tab
                departmentTabs.forEach(t => t.classList.remove('active'));
                document.querySelector(`[data-department="${currentDepartment}"]`).classList.add('active');
            } finally {
                // Remove loading state
                this.classList.remove('loading');
            }
        });
    });
}

// Reset all filters to default state
function resetFilters() {
    document.getElementById('batchFilter').value = '';
    document.getElementById('sectionFilter').value = '';
    document.getElementById('dateFilter').value = '';
    document.getElementById('courseSearch').value = '';
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

// Helper functions and utilities can be added here
