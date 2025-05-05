// Function to set badge color based on status
function getStatusBadgeClass(status) {
    const statusBadge = {
        'pending': '<span class="badge bg-warning text-dark">Pending</span>',
        'resolved': '<span class="badge bg-success">Resolved</span>',
        'closed': '<span class="badge bg-secondary">Closed</span>'
    }[status] || `<span class="badge bg-light">${status}</span>`;
    return statusBadge;
}

// Fetch user details by user ID
async function fetchUserName(userId) {
    try {
        const response = await fetch(`https://10.120.32.59/app/api/v1/users/${userId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch user details');
        }

        const user = await response.json();
        console.log(user.name); // Debugging line to check the user details
        return user.name || 'Unknown'; // Return user name or 'Unknown' if not available
    } catch (error) {
        console.error('Error fetching user details:', error);
        return 'Unknown';
    }
}

// Fetch and display contacts in a table
async function fetchContacts() {
    try {
        const response = await fetch('https://10.120.32.59/app/api/v1/contacts', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch contacts');
        }

        const contacts = await response.json();
        const tbody = document.getElementById('ContactsBody');
        tbody.innerHTML = '';
        for (const contact of contacts) { 
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${contact.id}</td>
                <td>${contact.user_id ? await fetchUserName(contact.user_id) : 'Null'}</td>
                <td>${contact.title}</td>
                <td>${contact.description}</td>
                <td>${getStatusBadgeClass(contact.status)}</td>
                <td>${new Date(contact.created_at).toLocaleString('fi')}</td>
                <td>${new Date(contact.updated_at).toLocaleString('fi')}</td>
                <td>${contact.updated_by ? await fetchUserName(contact.updated_by) : 'Not yet updated'}</td>
                
                <td>
                    <button class="btn btn-primary" onclick="viewContact(${contact.id})" data-bs-toggle="modal" data-bs-target="#viewContactModal">View</button>
                    <button class="btn btn-secondary" onclick="editContact(${contact.id})" data-bs-toggle="modal" data-bs-target="#editContactModal">Edit</button>
                </td>
            `;
            tbody.appendChild(row);
        }
    } catch (error) {
        console.error('Error fetching contacts:', error);
    }
}

// View contact details
async function viewContact(contactId) {
    try {
        const response = await fetch(`https://10.120.32.59/app/api/v1/contacts/${contactId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch contact details');
        }

        const contact = await response.json();
        const modalBody = document.getElementById('contactDetails');

        modalBody.innerHTML = `
        <div class="container">
      
          <!-- Ticket Overview -->
          <div class="card mb-3">
            <div class="card-header bg-primary text-white">
              <i class="bi bi-ticket-detailed me-2"></i>Ticket Overview
            </div>
            <div class="card-body">
              <p><i class="bi bi-person me-2"></i><strong>User Name:</strong> ${await fetchUserName(contact.user_id)}</p>
              <p><i class="bi bi-tag me-2"></i><strong>Title:</strong> ${contact.title}</p>
              <p><i class="bi bi-chat-left-text me-2"></i><strong>Description:</strong> ${contact.description}</p>
              <p><i class="bi bi-info-circle me-2"></i><strong>Status:</strong> ${getStatusBadgeClass(contact.status)}</p>
            </div>
          </div>
      
          <!-- Audit Info -->
          <div class="card mb-3">
            <div class="card-header bg-dark text-white">
              <i class="bi bi-clock-history me-2"></i>Audit Information
            </div>
            <div class="card-body">
              <p><i class="bi bi-calendar-plus me-2"></i><strong>Created At:</strong> ${new Date(contact.created_at).toLocaleString('fi')}</p>
              <p><i class="bi bi-calendar-check me-2"></i><strong>Updated At:</strong> ${new Date(contact.updated_at).toLocaleString('fi')}</p>
              <p><i class="bi bi-person-check me-2"></i><strong>Updated By:</strong> 
                ${contact.updated_by ? await fetchUserName(contact.updated_by) : 'Not yet updated'}
              </p>
            </div>
          </div>
      
        </div>
      `;
      
    } catch (error) {
        console.error('Error viewing contact:', error);
    }
}

// Populate edit contact modal
async function editContact(contactId) {
    document.getElementById('editLoading').style.display = 'none'; 
    try {
        const response = await fetch(`https://10.120.32.59/app/api/v1/contacts/${contactId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch contact details');
        }

        const contact = await response.json();
        document.getElementById('editContactUserName').textContent = await fetchUserName(contact.user_id); // Display user name
        document.getElementById('editContactTitle').value = contact.title;
        document.getElementById('editContactDescription').value = contact.description;
        document.getElementById('editContactStatus').value = contact.status; // Populate status field
        document.getElementById('editContactForm').dataset.contactId = contactId;
    } catch (error) {
        console.error('Error editing contact:', error);
    }
}

// Handle edit contact form submission
document.getElementById('editContactForm').addEventListener('submit', async function (event) {
    event.preventDefault();
    document.getElementById('editLoading').style.display = 'inline-block'; // Show loading spinner

    const contactId = this.dataset.contactId;
    const title = document.getElementById('editContactTitle').value;
    const description = document.getElementById('editContactDescription').value;
    const status = document.getElementById('editContactStatus').value; // Get status value

    try {
        const response = await fetch(`https://10.120.32.59/app/api/v1/contacts/${contactId}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ title, description, status }) // Include status in request body
        });

        if (!response.ok) {
            document.getElementById('editLoading').style.display = 'none';
            throw new Error('Failed to update contact');
        }

        showToast('Contact updated successfully!');
        fetchContacts();
        const editContactModal = bootstrap.Modal.getInstance(document.getElementById('editContactModal'));
        editContactModal.hide();
    } catch (error) {
        document.getElementById('editLoading').style.display = 'none';
        console.error('Error updating contact:', error);
    }
});


function showToast(message) {
    const toastElement = document.getElementById('successToast');
    const toastBody = toastElement.querySelector('.toast-body');
    toastBody.textContent = message;

    const toast = new bootstrap.Toast(toastElement);
    toast.show();
}
// Initialize contacts table on page load
document.addEventListener('DOMContentLoaded', fetchContacts);