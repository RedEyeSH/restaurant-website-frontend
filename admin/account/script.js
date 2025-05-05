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
        return user.name || 'Unknown User';
    } catch (error) {
        console.error('Error fetching user name:', error);
        return 'Unknown User';
    }
}


// Function to fetch and display all users
async function fetchUsers() {
    try {
        const response = await fetch('https://10.120.32.59/app/api/v1/users', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('authToken')}` // Include token for authorization
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch users');
        }

        const users = await response.json();
        const tbody = document.getElementById('UsersBody');
        tbody.innerHTML = '';
        for (const user of users) {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${user.id}</td>
                <td>${user.name}</td>
                <td>${user.email}</td>
                <td>${user.role}</td>
                <td>${user.status === 'enabled' ? '<span class="badge bg-success">Enabled</span>' : '<span class="badge bg-danger">Disabled</span>'}</td>
                <td>${user.verified == '1' ? '<span class="badge bg-success">Verified</span>' : '<span class="badge bg-danger">Not verified</span>'}</td>
                <td>${new Date(user.last_login).toLocaleString('fi')}</td>
                <td>${new Date(user.created_at).toLocaleString('fi')}</td>
                <td>${new Date(user.updated_at).toLocaleString('fi')}</td>
                <td>${user.updated_by ? await fetchUserName(user.updated_by) : 'Not yet updated'}</td>
                <td>
                    <button class="btn btn-primary view-user" onclick="viewUserDetails(${user.id})" data-bs-toggle="modal" data-bs-target="#userModal">View</button>
                    <button class="btn btn-secondary edit-user" onclick="populateEditUserModal(${user.id})" data-bs-toggle="modal" data-bs-target="#editUserModal">Edit</button>
                    <button class="btn btn-danger delete-user" onclick="showDeleteConfirmationModal(${user.id})" data-bs-target="#deleteUserModal">Delete</button>
                </td>
            `;
            tbody.appendChild(row);
        }
    } catch (error) {
        console.error('Error fetching users:', error);
    }
}

// Function to view user details
async function viewUserDetails(userId) {
    try {
        const response = await fetch(`https://10.120.32.59/app/api/v1/users/${userId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('authToken')}` // Include token for authorization
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch user details');
        }

        const user = await response.json();
        const modalBody = document.getElementById('userDetails');

        modalBody.innerHTML = `
        <div class="container">
      
          <!-- User Info -->
          <div class="card mb-3">
            <div class="card-header bg-primary text-white">
              <i class="bi bi-person-badge me-2"></i>User Information
            </div>
            <div class="card-body">
              <p><i class="bi bi-hash me-2"></i><strong>ID:</strong> ${user.id}</p>
              <p><i class="bi bi-person me-2"></i><strong>Name:</strong> ${user.name}</p>
              <p><i class="bi bi-envelope me-2"></i><strong>Email:</strong> ${user.email}</p>
              <p><i class="bi bi-shield-lock me-2"></i><strong>Role:</strong> ${user.role}</p>
            </div>
          </div>
      
          <!-- Status Info -->
          <div class="card mb-3">
            <div class="card-header bg-secondary text-white">
              <i class="bi bi-check-circle me-2"></i>Status & Verification
            </div>
            <div class="card-body">
              <p><i class="bi bi-toggle-on me-2"></i><strong>Status:</strong> ${user.status === 'enabled' 
                  ? '<span class="badge bg-success">Enabled</span>' 
                  : '<span class="badge bg-danger">Disabled</span>'}</p>
              <p><i class="bi bi-patch-check me-2"></i><strong>Verify:</strong> ${user.verified == '1' 
                  ? '<span class="badge bg-success">Verified</span>' 
                  : '<span class="badge bg-danger">Not verified</span>'}</p>
            </div>
          </div>
      
          <!-- Audit Info -->
          <div class="card mb-3">
            <div class="card-header bg-dark text-white">
              <i class="bi bi-clock-history me-2"></i>Audit Trail
            </div>
            <div class="card-body">
              <p><i class="bi bi-clock me-2"></i><strong>Last Login:</strong> ${new Date(user.last_login).toLocaleString('fi')}</p>
              <p><i class="bi bi-calendar-plus me-2"></i><strong>Created At:</strong> ${new Date(user.created_at).toLocaleString('fi')}</p>
              <p><i class="bi bi-calendar-check me-2"></i><strong>Updated At:</strong> ${new Date(user.updated_at).toLocaleString('fi')}</p>
              <p><i class="bi bi-person-check me-2"></i><strong>Updated By:</strong> ${user.updated_by 
                  ? await fetchUserName(user.updated_by) 
                  : 'Not yet updated'}</p>
            </div>
          </div>
      
        </div>
      `;
      
    } catch (error) {
        console.error('Error fetching user details:', error);
    }
}

// Function to populate the edit user modal
async function populateEditUserModal(userId) {
    try {
        const response = await fetch(`https://10.120.32.59/app/api/v1/users/${userId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('authToken')}` // Include token for authorization
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch user details');
        }

        const user = await response.json();

        document.getElementById('editUserName').value = user.name;
        document.getElementById('editUserEmail').value = user.email;
        document.getElementById('editUserRole').value = user.role;
        document.getElementById('editUserStatus').value = user.status;
        document.getElementById('editUserForm').dataset.userId = userId;
    } catch (error) {
        console.error('Error populating edit user modal:', error);
    }
}

// Function to handle the edit user form submission
const editUserForm = document.getElementById('editUserForm');
editUserForm.addEventListener('submit', async function (event) {
    event.preventDefault();
    document.getElementById('editLoading').style.display = 'block'; // Show loading spinner

    const userId = this.dataset.userId;
    const updatedUser = {
        name: document.getElementById('editUserName').value,
        email: document.getElementById('editUserEmail').value,
        role: document.getElementById('editUserRole').value,
        status: document.getElementById('editUserStatus').value,
    };

    try {
        const response = await fetch(`https://10.120.32.59/app/api/v1/users/${userId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('authToken')}` // Include token for authorization
            },
            body: JSON.stringify(updatedUser),
        });

        if (!response.ok) {
            document.getElementById('editLoading').style.display = 'none'; // Hide loading spinner
            throw new Error('Failed to update user');
        }

        showToast('User updated successfully!'); // Show success toast
        fetchUsers();
        document.getElementById('editLoading').style.display = 'none'; // Hide loading spinner

        const editUserModal = bootstrap.Modal.getInstance(document.getElementById('editUserModal'));
        editUserModal.hide();
    } catch (error) {
        document.getElementById('editLoading').style.display = 'none'; // Hide loading spinner
        console.error('Error updating user:', error);
    }
});

// Function to show delete confirmation modal
function showDeleteConfirmationModal(userId) {
    const deleteModal = new bootstrap.Modal(document.getElementById('deleteUserModal'));
    const confirmDeleteButton = document.getElementById('confirmDeleteButton');

    confirmDeleteButton.onclick = function () {
        deleteUser(userId);
    };

    deleteModal.show();
}

// Function to delete a user
async function deleteUser(userId) {
    try {
        const response = await fetch(`https://10.120.32.59/app/api/v1/users/${userId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('authToken')}` // Include token for authorization
            }
        });

        if (!response.ok) {
            throw new Error('Failed to delete user');
        }

        showToast('User deleted successfully!'); // Show success toast
        fetchUsers();

        const deleteModal = bootstrap.Modal.getInstance(document.getElementById('deleteUserModal'));
        deleteModal.hide();
    } catch (error) {
        console.error('Error deleting user:', error);
    }
}

function showToast(message) {
    const toastElement = document.getElementById('successToast');
    const toastBody = toastElement.querySelector('.toast-body');
    toastBody.textContent = message;

    const toast = new bootstrap.Toast(toastElement);
    toast.show();
}


// Initialize the users table on page load
document.addEventListener('DOMContentLoaded', fetchUsers);