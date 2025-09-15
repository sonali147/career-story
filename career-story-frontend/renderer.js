const API_BASE_URL = 'http://127.0.0.1:8000';

// Function to clear all form fields
function clearForm() {
    document.getElementById('log-date').value = '';
    document.getElementById('project-name').value = '';
    document.getElementById('tasks-completed').value = '';
    document.getElementById('tasks-planned').value = '';
    document.getElementById('blockers').value = '';
    document.getElementById('reflection-well').value = '';
    document.getElementById('reflection-improve').value = '';
}

// Function to populate form with existing log data
function populateForm(logData) {
    document.getElementById('log-date').value = logData.log_date;
    document.getElementById('project-name').value = logData.project;
    document.getElementById('tasks-completed').value = logData.tasks_completed.join('\n');
    document.getElementById('tasks-planned').value = logData.tasks_planned.join('\n');
    document.getElementById('blockers').value = logData.blockers.join('\n');
    document.getElementById('reflection-well').value = logData.reflection_well;
    document.getElementById('reflection-improve').value = logData.reflection_improve;
}

// Function to fetch and populate existing log data
async function fetchExistingLog(logDate) {
    try {
        const response = await fetch(`${API_BASE_URL}/log/${logDate}`);
        if (response.ok) {
            const logData = await response.json();
            populateForm(logData);
            return true; // Log exists and was loaded
        }
    } catch (error) {
        // Log doesn't exist or error occurred
        console.log(`No existing log found for ${logDate}`);
    }
    return false; // No existing log
}

// Event listener for date change
document.getElementById('log-date').addEventListener('change', async (e) => {
    const selectedDate = e.target.value;
    if (selectedDate) {
        const logExists = await fetchExistingLog(selectedDate);
        if (logExists) {
            // Show a subtle indicator that existing data was loaded
            const dateInput = document.getElementById('log-date');
            dateInput.style.backgroundColor = '#e8f5e8';
            setTimeout(() => {
                dateInput.style.backgroundColor = '';
            }, 2000);
        } else {
            // Clear form for new log
            clearForm();
            document.getElementById('log-date').value = selectedDate;
        }
    }
});

// Form submission handler
document.getElementById('log-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const logData = {
        log_date: document.getElementById('log-date').value,
        name: "Sonali Gupta", // Or get from input
        project: document.getElementById('project-name').value,
        tasks_completed: document.getElementById('tasks-completed').value.split('\n').filter(t => t.trim()),
        tasks_planned: document.getElementById('tasks-planned').value.split('\n').filter(t => t.trim()),
        blockers: document.getElementById('blockers').value.split('\n').filter(t => t.trim()),
        reflection_well: document.getElementById('reflection-well').value.trim(),
        reflection_improve: document.getElementById('reflection-improve').value.trim()
    };

    try {
        const response = await fetch(`${API_BASE_URL}/log`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(logData)
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || 'Failed to save log');
        }
        
        const result = await response.json();
        
        // Show success message with indication if it was an update
        const existingLog = await fetchExistingLog(logData.log_date);
        const message = existingLog ? 'Log updated successfully!' : 'Log saved successfully!';
        alert(message);
        
        // Don't clear the form after successful submission - keep the data visible
        // User might want to make additional changes
        
    } catch (error) {
        console.error('Error saving log:', error);
        alert('Failed to save log. Is the backend server running?');
    }
});

// Report generation handler
document.getElementById('generate-btn').addEventListener('click', async () => {
    const startDate = document.getElementById('start-date').value;
    const endDate = document.getElementById('end-date').value;
    const reportOutput = document.getElementById('report-output');

    if (!startDate || !endDate) {
        alert('Please select both a start and end date.');
        return;
    }

    reportOutput.textContent = 'Generating report... Please wait.';

    try {
        const response = await fetch(`${API_BASE_URL}/generate-report`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ start_date: startDate, end_date: endDate })
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || 'Failed to generate report');
        }

        const result = await response.json();
        // We'll just display the raw markdown. A library like 'marked' could render it as HTML.
        reportOutput.textContent = result.report; 

    } catch (error) {
        console.error('Error generating report:', error);
        reportOutput.textContent = `Error: ${error.message}`;
    }
});

// Add a "New Log" button to clear the form
document.addEventListener('DOMContentLoaded', () => {
    // Add a "New Log" button after the form
    const form = document.getElementById('log-form');
    const newLogButton = document.createElement('button');
    newLogButton.type = 'button';
    newLogButton.textContent = 'New Log';
    newLogButton.style.marginLeft = '10px';
    newLogButton.style.backgroundColor = '#f0f0f0';
    newLogButton.style.border = '1px solid #ccc';
    newLogButton.style.padding = '8px 16px';
    newLogButton.style.borderRadius = '4px';
    newLogButton.style.cursor = 'pointer';
    
    newLogButton.addEventListener('click', () => {
        clearForm();
    });
    
    // Insert the button after the submit button
    const submitButton = form.querySelector('button[type="submit"]');
    submitButton.parentNode.insertBefore(newLogButton, submitButton.nextSibling);
});