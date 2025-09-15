const API_BASE_URL = 'http://127.0.0.1:8000';

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
        const result = await response.json();
        alert(result.message);
        
        // Clear the form after successful submission
        document.getElementById('log-form').reset();
    } catch (error) {
        console.error('Error saving log:', error);
        alert('Failed to save log. Is the backend server running?');
    }
});

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