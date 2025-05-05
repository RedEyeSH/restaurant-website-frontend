// Fetch and display the restaurant schedule
async function fetchSchedule() {
    try {
        const response = await fetch('https://10.120.32.59/app/api/v1/schedule', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch schedule');
        }

        const schedule = await response.json();
        const tbody = document.getElementById('ScheduleBody');
        tbody.innerHTML = '';

        schedule.forEach(entry => {
            const row = document.createElement('tr');
            row.dataset.id = entry.id;
            row.innerHTML = `
                <td class="date">${new Date(entry.date).toLocaleDateString('fi-FI')}</td>
                <td class="open-time">${entry.open_time || 'N/A'}</td>
                <td class="close-time">${entry.close_time || 'N/A'}</td>
                <td class="message">${entry.message || 'No message'}</td>
                <td class="status">${entry.status === 'open' ? '<span class="badge bg-success">Open</span>' : '<span class="badge bg-danger">Closed</span>'}</td>
                <td>
                    <button class="btn btn-primary edit-btn">Edit</button>
                    <button class="btn btn-danger delete-btn">Delete</button>
                </td>
            `;
            tbody.appendChild(row);
        });
    } catch (error) {
        console.error('Error fetching schedule:', error);
    }
}

// Set the minimum date for schedule date inputs to today
const today = new Date().toISOString().split('T')[0];
document.getElementById('scheduleDate').setAttribute('min', today);
document.getElementById('editScheduleDate').setAttribute('min', today);


// Handle Add Schedule Form Submission
document.getElementById('addScheduleForm').addEventListener('submit', async function (event) {
    event.preventDefault();

    document.getElementById('addLoading').style.display = 'inline-block'; // Show loading spinner

    const openTime = document.getElementById('openTime').value;
    const closeTime = document.getElementById('closeTime').value;

    // Ensure open time is before close time
    if (openTime && closeTime && openTime >= closeTime) {
        alert('Open time must be before close time.');
        document.getElementById('addLoading').style.display = 'none'; // Hide loading spinner
        return;
    }

    const newSchedule = {
        date: document.getElementById('scheduleDate').value,
        open_time: openTime || null,
        close_time: closeTime || null,
        message: document.getElementById('scheduleMessage').value || null,
        status: document.getElementById('scheduleStatus').value
    };

    try {
        const response = await fetch('https://10.120.32.59/app/api/v1/schedule', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            },
            body: JSON.stringify(newSchedule)
        });

        if (!response.ok) {
            document.getElementById('addLoading').style.display = 'none'; // Hide loading spinner
            throw new Error('Failed to add schedule');
        }

        // Refresh the schedule table
        showToast('Schedule added successfully!');
        fetchSchedule();

        // Close the modal
        const addScheduleModal = bootstrap.Modal.getInstance(document.getElementById('addScheduleModal'));
        addScheduleModal.hide();

        // Reset the form
        document.getElementById('addScheduleForm').reset();
    } catch (error) {
        console.error('Error adding schedule:', error);
    }
});

// Handle Edit Schedule Form Submission
document.getElementById('editScheduleForm').addEventListener('submit', async function (event) {
    event.preventDefault();

    document.getElementById('editLoading').style.display = 'inline-block'; // Show loading spinner

    const id = document.getElementById('editScheduleId').value;
    const openTime = document.getElementById('editOpenTime').value;
    const closeTime = document.getElementById('editCloseTime').value;

    // Ensure open time is before close time
    if (openTime && closeTime && openTime >= closeTime) {
        alert('Open time must be before close time.');
        document.getElementById('editLoading').style.display = 'none'; // Hide loading spinner
        return;
    }

    const updatedSchedule = {
        date: document.getElementById('editScheduleDate').value,
        open_time: openTime || null,
        close_time: closeTime || null,
        message: document.getElementById('editScheduleMessage').value || null,
        status: document.getElementById('editScheduleStatus').value
    };

    try {
        const response = await fetch(`https://10.120.32.59/app/api/v1/schedule/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            },
            body: JSON.stringify(updatedSchedule)
        });

        if (!response.ok) {
            document.getElementById('editLoading').style.display = 'none'; // Hide loading spinner
            throw new Error('Failed to update schedule');
        }

        // Refresh the schedule table
        document.getElementById('editLoading').style.display = 'none'; // Hide loading spinner
        showToast('Schedule updated successfully!');
        fetchSchedule();

        // Close the modal
        const editScheduleModal = bootstrap.Modal.getInstance(document.getElementById('editScheduleModal'));
        editScheduleModal.hide();

        // Reset the form
        document.getElementById('editScheduleForm').reset();
    } catch (error) {
        document.getElementById('editLoading').style.display = 'none'; // Hide loading spinner
        console.error('Error updating schedule:', error);
    }
});

// Handle Delete Schedule
async function deleteSchedule(id) {
    try {
        const response = await fetch(`https://10.120.32.59/app/api/v1/schedule/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to delete schedule');
        }

        // Refresh the schedule table
    
        fetchSchedule();
    } catch (error) {
        console.error('Error deleting schedule:', error);
    }
}

let scheduleIdToDelete = null;

// Show delete confirmation modal
document.addEventListener('click', function (event) {
    if (event.target.classList.contains('delete-btn')) {
        scheduleIdToDelete = event.target.closest('tr').dataset.id;
        const deleteConfirmationModal = new bootstrap.Modal(document.getElementById('deleteConfirmationModal'));
        deleteConfirmationModal.show();
    }
});

// Handle delete confirmation
document.getElementById('confirmDeleteButton').addEventListener('click', async function () {
    if (scheduleIdToDelete) {
        try {
            const response = await fetch(`https://10.120.32.59/app/api/v1/schedule/${scheduleIdToDelete}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to delete schedule');
            }

            // Refresh the schedule table
            showToast('Schedule deleted successfully!');
            fetchSchedule();

            // Close the modal
            const deleteConfirmationModal = bootstrap.Modal.getInstance(document.getElementById('deleteConfirmationModal'));
            deleteConfirmationModal.hide();

            scheduleIdToDelete = null;
        } catch (error) {
            console.error('Error deleting schedule:', error);
        }
    }
});

// Add event listeners for edit and delete buttons
document.addEventListener('click', function (event) {
    if (event.target.classList.contains('edit-btn')) {
        const row = event.target.closest('tr');
        const id = row.dataset.id;
        const date = row.querySelector('.date').textContent;
        const openTime = row.querySelector('.open-time').textContent;
        const closeTime = row.querySelector('.close-time').textContent;
        const message = row.querySelector('.message').textContent;
        const status = row.querySelector('.status').textContent.includes('Open') ? 'open' : 'close';

        // Convert date to YYYY-MM-DD format
        const formattedDate = new Date(date.split('.').reverse().join('-')).toISOString().split('T')[0];

        document.getElementById('editScheduleId').value = id;
        document.getElementById('editScheduleDate').value = formattedDate;
        document.getElementById('editOpenTime').value = openTime !== 'N/A' ? openTime : '';
        document.getElementById('editCloseTime').value = closeTime !== 'N/A' ? closeTime : '';
        document.getElementById('editScheduleMessage').value = message !== 'No message' ? message : '';
        document.getElementById('editScheduleStatus').value = status;

        const editScheduleModal = new bootstrap.Modal(document.getElementById('editScheduleModal'));
        editScheduleModal.show();
    }
});

function showToast(message) {
    const toastElement = document.getElementById('successToast');
    const toastBody = toastElement.querySelector('.toast-body');
    toastBody.textContent = message;

    const toast = new bootstrap.Toast(toastElement);
    toast.show();
}

// Initialize the schedule table on page load
document.addEventListener('DOMContentLoaded', fetchSchedule);