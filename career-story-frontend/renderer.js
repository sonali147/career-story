const API_BASE_URL = 'http://127.0.0.1:8000';

// Task management functions
function addTask(listId) {
    const taskList = document.getElementById(listId);
    
    // Remove empty state if it exists
    const emptyState = taskList.querySelector('.empty-state');
    if (emptyState) {
        emptyState.remove();
    }
    
    // Create task input container
    const taskInputContainer = document.createElement('div');
    taskInputContainer.className = 'task-input-container';
    
    const taskInput = document.createElement('input');
    taskInput.type = 'text';
    taskInput.className = 'task-input';
    taskInput.placeholder = 'Enter task...';
    
    const saveBtn = document.createElement('button');
    saveBtn.type = 'button';
    saveBtn.className = 'task-btn save-task-btn';
    saveBtn.textContent = 'Save';
    
    const cancelBtn = document.createElement('button');
    cancelBtn.type = 'button';
    cancelBtn.className = 'task-btn cancel-task-btn';
    cancelBtn.textContent = 'Cancel';
    
    taskInputContainer.appendChild(taskInput);
    taskInputContainer.appendChild(saveBtn);
    taskInputContainer.appendChild(cancelBtn);
    
    taskList.appendChild(taskInputContainer);
    
    // Focus on input
    taskInput.focus();
    
    // Save task
    const saveTask = () => {
        const taskText = taskInput.value.trim();
        if (taskText) {
            createTaskItem(listId, taskText);
        }
        taskInputContainer.remove();
        updateEmptyState(listId);
    };
    
    // Cancel task
    const cancelTask = () => {
        taskInputContainer.remove();
        updateEmptyState(listId);
    };
    
    // Event listeners
    saveBtn.addEventListener('click', saveTask);
    cancelBtn.addEventListener('click', cancelTask);
    
    // Save on Enter key
    taskInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            saveTask();
        }
    });
    
    // Cancel on Escape key
    taskInput.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            cancelTask();
        }
    });
}

function createTaskItem(listId, taskText) {
    const taskList = document.getElementById(listId);
    
    const taskItem = document.createElement('div');
    taskItem.className = 'task-item';
    
    const taskTextElement = document.createElement('input');
    taskTextElement.type = 'text';
    taskTextElement.className = 'task-text';
    taskTextElement.value = taskText;
    taskTextElement.readOnly = true;
    
    const taskActions = document.createElement('div');
    taskActions.className = 'task-actions';
    
    const editBtn = document.createElement('button');
    editBtn.type = 'button';
    editBtn.className = 'task-btn save-task-btn';
    editBtn.textContent = 'Edit';
    
    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.className = 'task-btn remove-task-btn';
    removeBtn.textContent = 'Remove';
    
    taskActions.appendChild(editBtn);
    taskActions.appendChild(removeBtn);
    
    taskItem.appendChild(taskTextElement);
    taskItem.appendChild(taskActions);
    
    taskList.appendChild(taskItem);
    
    // Edit functionality
    let isEditing = false;
    editBtn.addEventListener('click', () => {
        if (!isEditing) {
            taskTextElement.readOnly = false;
            taskTextElement.focus();
            taskTextElement.select();
            editBtn.textContent = 'Save';
            isEditing = true;
        } else {
            taskTextElement.readOnly = true;
            editBtn.textContent = 'Edit';
            isEditing = false;
        }
    });
    
    // Save on Enter when editing
    taskTextElement.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && isEditing) {
            taskTextElement.readOnly = true;
            editBtn.textContent = 'Edit';
            isEditing = false;
        }
    });
    
    // Remove functionality
    removeBtn.addEventListener('click', () => {
        taskItem.remove();
        updateEmptyState(listId);
    });
}

function updateEmptyState(listId) {
    const taskList = document.getElementById(listId);
    const taskItems = taskList.querySelectorAll('.task-item');
    
    if (taskItems.length === 0) {
        const emptyState = document.createElement('div');
        emptyState.className = 'empty-state';
        
        if (listId === 'tasks-completed-list') {
            emptyState.textContent = 'No tasks completed yet. Click + to add tasks.';
        } else if (listId === 'tasks-planned-list') {
            emptyState.textContent = 'No tasks planned yet. Click + to add tasks.';
        } else if (listId === 'blockers-list') {
            emptyState.textContent = 'No blockers yet. Click + to add blockers.';
        }
        
        taskList.appendChild(emptyState);
    }
}

function getTasksFromList(listId) {
    const taskList = document.getElementById(listId);
    const taskItems = taskList.querySelectorAll('.task-item');
    const tasks = [];
    
    taskItems.forEach(item => {
        const taskText = item.querySelector('.task-text').value.trim();
        if (taskText) {
            tasks.push(taskText);
        }
    });
    
    return tasks;
}

function populateTasksInList(listId, tasks) {
    const taskList = document.getElementById(listId);
    taskList.innerHTML = '';
    
    if (tasks.length === 0) {
        updateEmptyState(listId);
    } else {
        tasks.forEach(task => {
            createTaskItem(listId, task);
        });
    }
}

// Function to clear all form fields
function clearForm() {
    document.getElementById('log-date').value = '';
    document.getElementById('project-name').value = '';
    populateTasksInList('tasks-completed-list', []);
    populateTasksInList('tasks-planned-list', []);
    populateTasksInList('blockers-list', []);
    document.getElementById('reflection-well').value = '';
    document.getElementById('reflection-improve').value = '';
}

// Function to populate form with existing log data
function populateForm(logData) {
    document.getElementById('log-date').value = logData.log_date;
    document.getElementById('project-name').value = logData.project;
    populateTasksInList('tasks-completed-list', logData.tasks_completed || []);
    populateTasksInList('tasks-planned-list', logData.tasks_planned || []);
    populateTasksInList('blockers-list', logData.blockers || []);
    document.getElementById('reflection-well').value = logData.reflection_well || '';
    document.getElementById('reflection-improve').value = logData.reflection_improve || '';
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
        tasks_completed: getTasksFromList('tasks-completed-list'),
        tasks_planned: getTasksFromList('tasks-planned-list'),
        blockers: getTasksFromList('blockers-list'),
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