async function fetchUserName(userId) {
    try {
        const response = await fetch(`http://localhost:3000/api/v1/users/${userId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch user details');
        }

        const user = await response.json();
        return user.name || 'Unknown User';
    } catch (error) {
        console.error('Error fetching user name:', error);
        return 'Unknown User';
    }
}


// Fetch and display the restaurant schedule
async function fetchSchedule() {
    try {
        const response = await fetch('http://localhost:3000/api/v1/schedule', {
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

        for (const entry of schedule) {
            const row = document.createElement('tr');
            row.dataset.id = entry.id;
            row.innerHTML = `
                <td>${new Date(entry.date).toLocaleString('fi-FI')}</td>
                <td>${entry.open_time || 'N/A'}</td>
                <td>${entry.close_time || 'N/A'}</td>
                <td>${entry.message || 'No message'}</td>
                <td>${entry.status === 'open' ? '<span class="badge bg-success">Open</span>' : '<span class="badge bg-danger">Closed</span>'}</td>
                <td>${new Date(entry.created_at).toLocaleString('fi-FI')}</td>
                <td>${new Date(entry.updated_at).toLocaleString('fi-FI')}</td>
                <td>${entry.added_by ? await fetchUserName(entry.added_by) : 'Null'}</td>
                <td>${entry.updated_by ? await fetchUserName(entry.updated_by) : 'Not yet updated'}</td>
                <td>
                    <button class="btn btn-primary edit-btn" onclick="populateEditScheduleModal(${entry.id})" data-bs-toggle="modal" data-bs-target="#editScheduleModal">Edit</button>
                    <button class="btn btn-danger delete-btn" onclick="showDeleteConfirmationModal(${entry.id})" data-bs-toggle="modal">Delete</button>
                </td>
            `;
            tbody.appendChild(row);
        };
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
        const response = await fetch('http://localhost:3000/api/v1/schedule', {
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

async function populateEditScheduleModal(scheduleId) {
    try {
        const response = await fetch(`http://localhost:3000/api/v1/schedule/${scheduleId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch schedule details');
        }


        const schedule = await response.json();
        document.getElementById('editScheduleDate').value = schedule.date;
        document.getElementById('editOpenTime').value = schedule.open_time || '';
        document.getElementById('editCloseTime').value = schedule.close_time || '';
        document.getElementById('editScheduleMessage').value = schedule.message || '';
        document.getElementById('editScheduleStatus').value = schedule.status;

        document.getElementById('editScheduleForm').dataset.scheduleId = scheduleId;
    } catch (error) {
        console.error('Error populating edit schedule modal:', error);
    }
}


// Handle Edit Schedule Form Submission
document.getElementById('editScheduleForm').addEventListener('submit', async function (event) {
    event.preventDefault();

    document.getElementById('editLoading').style.display = 'inline-block'; // Show loading spinner

    const scheduleId = this.dataset.scheduleId;

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
        const response = await fetch(`http://localhost:3000/api/v1/schedule/${scheduleId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            },
            body: JSON.stringify(updatedSchedule)
        });

        if (!response.ok) {
            document.getElementById('editLoading').style.display = 'none'; // Hide loading spinner
            console.error('Failed to update schedule:', response.statusText);
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


// Function to show delete confirmation modal
function showDeleteConfirmationModal(scheduleId) {
    const deleteModal = new bootstrap.Modal(document.getElementById('deleteScheduleModal'));
    const confirmDeleteButton = document.getElementById('confirmDeleteButton');

    confirmDeleteButton.onclick = function () {
        deleteSchedule(scheduleId);
    };

    deleteModal.show();
}

// Function to delete a Schedule
async function deleteSchedule(scheduleId) {
    try {
        const response = await fetch(`http://localhost:3000/api/v1/schedule/${scheduleId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('authToken')}` // Include token for authorization
            }
        });

        if (!response.ok) {
            throw new Error('Failed to delete Schedule');
        }

        showToast('Schedule deleted successfully!');
        fetchSchedule(); // Refresh the schedule table

        const deleteModal = bootstrap.Modal.getInstance(document.getElementById('deleteScheduleModal'));
        deleteModal.hide();
    } catch (error) {
        console.error('Error deleting Schedule:', error);
    }
}

function showToast(message) {
    const toastElement = document.getElementById('successToast');
    const toastBody = toastElement.querySelector('.toast-body');
    toastBody.textContent = message;

    const toast = new bootstrap.Toast(toastElement);
    toast.show();
}

// Initialize the schedule table on page load
document.addEventListener('DOMContentLoaded', fetchSchedule);