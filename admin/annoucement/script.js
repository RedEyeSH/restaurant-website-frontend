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

// Define originalImageUrl globally
let originalImageUrl = '';

// Update the fetchAnnouncements function to include visible status
async function fetchAnnouncements() {
    try {
        const response = await fetch('https://10.120.32.59/app/api/v1/announcements', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('authToken')}` // Include token for authorization
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch announcements');
        }

        const announcements = await response.json();
        const tbody = document.getElementById('AnnouncementsBody');
        tbody.innerHTML = '';

        for (const announcement of announcements) {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${announcement.id}</td>
                <td><a href="https://users.metropolia.fi/~quangth/restaurant/annoucement/index.html?id=${announcement.id}" target="blank">${announcement.title}</td>
                <td><img src="https://10.120.32.59/app${announcement.image_url}" alt="Image" style="width: 50px; height: 50px;"></td>
                <td><span class="badge ${announcement.visible.toLowerCase() === 'yes' ? 'bg-success' : 'bg-danger'}">${announcement.visible.toLowerCase() === 'yes' ? 'Visible' : 'Not Visible'}</span></td>
                <td>${new Date(announcement.created_at).toLocaleString('fi')}</td>
                <td>${new Date(announcement.updated_at).toLocaleString('fi')}</td>
                <td>${announcement.added_by ? await fetchUserName(announcement.added_by) : 'Null'}</td>
                <td>${announcement.updated_by ? await fetchUserName(announcement.updated_by) : 'Not yet updated'}</td>
                <td>
                    <button class="btn btn-primary view-announcement" onclick="viewAnnouncementDetails(${announcement.id})" data-bs-toggle="modal" data-bs-target="#announcementModal">View</button>
                    <button class="btn btn-secondary edit-announcement" onclick="populateEditAnnouncementModal(${announcement.id})" data-bs-toggle="modal" data-bs-target="#editAnnouncementModal">Edit</button>
                    <button class="btn btn-danger delete-announcement" onclick="showDeleteConfirmationModal(${announcement.id})">Delete</button>
                </td>
            `;
            tbody.appendChild(row);
        };

        initializeTable('#AnnouncementsTable', 5);
    } catch (error) {
        console.error('Error fetching announcements:', error);
    }
}

// Function to view announcement details
async function viewAnnouncementDetails(announcementId) {
    try {
        const response = await fetch(`https://10.120.32.59/app/api/v1/announcements/${announcementId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('authToken')}` // Include token for authorization
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch announcement details');
        }

        const announcement = await response.json();
        const modalBody = document.getElementById('announcementDetails');

        modalBody.innerHTML = `
        <div class="container">
      
          <!-- Announcement Meta -->
          <div class="card mb-3">
            <div class="card-header bg-primary text-white">
              <i class="bi bi-megaphone me-2"></i>Announcement Info
            </div>
            <div class="card-body">
              <p><i class="bi bi-hash me-2"></i><strong>ID:</strong> ${announcement.id}</p>
              <p>
                <i class="bi bi-eye me-2"></i><strong>Visibility:</strong>
                <span class="badge ${announcement.visible.toLowerCase() === 'yes' ? 'bg-success' : 'bg-danger'}">
                  ${announcement.visible.toLowerCase() === 'yes' ? 'Visible' : 'Not Visible'}
                </span>
              </p>
            </div>
          </div>
      
          <!-- Announcement Image -->
          <div class="card mb-3">
            <div class="card-header bg-secondary text-white">
              <i class="bi bi-image me-2"></i>Preview Image
            </div>
            <div class="card-body text-center">
              <a href="https://10.120.32.59/app${announcement.image_url}" target="_blank">
                <img src="https://10.120.32.59/app${announcement.image_url}" alt="${announcement.title}" class="img-fluid rounded" style="max-height: 300px;">
              </a>
            </div>
          </div>
      
          <!-- Content -->
          <div class="card mb-3">
            <div class="card-header bg-info text-white">
              <i class="bi bi-journal-text me-2"></i>Content
            </div>
            <div class="card-body">
              <p><i class="bi bi-fonts me-2"></i><strong>Title:</strong> ${announcement.title}</p>
              <p><i class="bi bi-file-earmark-text me-2"></i><strong>Content:</strong></p>
              <div>${announcement.content}</div>
            </div>
          </div>
      
          <!-- Audit Info -->
          <div class="card mb-3">
            <div class="card-header bg-dark text-white">
              <i class="bi bi-clock-history me-2"></i>Audit Trail
            </div>
            <div class="card-body">
              <p><i class="bi bi-calendar-plus me-2"></i><strong>Created At:</strong> ${new Date(announcement.created_at).toLocaleString('fi')}</p>
              <p><i class="bi bi-calendar-check me-2"></i><strong>Updated At:</strong> ${new Date(announcement.updated_at).toLocaleString('fi')}</p>
              <p><i class="bi bi-person-plus me-2"></i><strong>Added By:</strong> ${announcement.added_by ? await fetchUserName(announcement.added_by) : 'Null'}</p>
              <p><i class="bi bi-person-check me-2"></i><strong>Updated By:</strong> ${announcement.updated_by ? await fetchUserName(announcement.updated_by) : 'Not yet updated'}</p>
            </div>
          </div>
      
        </div>
      `;
      
    } catch (error) {
        console.error('Error fetching announcement details:', error);
    }
}

// Show the delete confirmation modal and handle the delete action
function showDeleteConfirmationModal(announcementId) {
    const deleteModal = new bootstrap.Modal(document.getElementById('deleteConfirmationModal'));
    const confirmDeleteButton = document.getElementById('confirmDeleteButton');

    confirmDeleteButton.onclick = async function () {
        try {
            const response = await fetch(`https://10.120.32.59/app/api/v1/announcements/${announcementId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}` // Include token for authorization
                }
            });

            if (!response.ok) {
                throw new Error('Failed to delete announcement');
            }

            showToast('Announcement deleted successfully!');
            fetchAnnouncements();
        } catch (error) {
            console.error('Error deleting announcement:', error);
        } finally {
            deleteModal.hide();
        }
    };

    deleteModal.show();
}

// Function to populate the edit announcement modal
async function populateEditAnnouncementModal(announcementId) {
    try {
        const response = await fetch(`https://10.120.32.59/app/api/v1/announcements/${announcementId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('authToken')}` // Include token for authorization
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch announcement details');
        }

        const announcement = await response.json();

        document.getElementById('editAnnouncementTitle').value = announcement.title;
        tinymce.get('editAnnouncementContent').setContent(announcement.content);
        document.getElementById('editAnnouncementVisible').value = announcement.visible;
        document.getElementById('editAnnouncementForm').dataset.announcementId = announcementId;

        // Set originalImageUrl to the announcement's image URL
        originalImageUrl = announcement.image_url;

        // Image Handling
        const imagePreviewContainer = document.getElementById('editAnnouncementImagePreviewContainer');
        const imagePreview = document.getElementById('editAnnouncementImagePreview');
        const imageHeading = document.getElementById('editAnnouncementImageHeading');
        const removeImageButton = document.getElementById('removeAnnouncementImageButton');

        if (announcement.image_url) {
            imagePreview.src = `https://10.120.32.59/app${announcement.image_url}`;
            imagePreviewContainer.style.display = 'block';
            imageHeading.innerText = 'Original Image';
            removeImageButton.style.display = 'none';
        } else {
            imagePreviewContainer.style.display = 'none';
            removeImageButton.style.display = 'none';
        }

        const imageInput = document.getElementById('editAnnouncementImage');
        imageInput.addEventListener('change', function () {
            const file = imageInput.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function (e) {
                    imagePreview.src = e.target.result;
                    imagePreviewContainer.style.display = 'block';
                    imageHeading.innerText = 'New Image';
                    removeImageButton.style.display = 'inline-block';
                };
                reader.readAsDataURL(file);
            } else {
                imagePreview.src = `https://10.120.32.59/app${announcement.image_url}`;
                imagePreviewContainer.style.display = 'block';
                imageHeading.innerText = 'Original Image';
                removeImageButton.style.display = 'none';
            }
        });

        removeImageButton.addEventListener('click', function () {
            imagePreview.src = `https://10.120.32.59/app${announcement.image_url}`;
            imagePreviewContainer.style.display = 'block';
            imageHeading.innerText = 'Original Image';
            removeImageButton.style.display = 'none';
            imageInput.value = '';
        });

    } catch (error) {
        console.error('Error populating edit announcement modal:', error);
    }
}

// Ensure the editAnnouncementForm includes the visible field
const editAnnouncementForm = document.getElementById('editAnnouncementForm');
editAnnouncementForm.addEventListener('submit', async function (event) {
    event.preventDefault();
    document.getElementById('editLoading').style.display = 'inline-block'; // Show loading spinner

    const announcementId = this.dataset.announcementId;
    const formData = new FormData();
    formData.append('title', document.getElementById('editAnnouncementTitle').value);
    formData.append('content', tinymce.get('editAnnouncementContent').getContent());
    formData.append('visible', document.getElementById('editAnnouncementVisible').value);

    const newImage = document.getElementById('editAnnouncementImage').files[0];
    if (newImage) {
        formData.append('image', newImage);
    } else {
        formData.append('image', originalImageUrl);
    }

    try {
        const response = await fetch(`https://10.120.32.59/app/api/v1/announcements/${announcementId}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('authToken')}` // Include token for authorization
            },
            body: formData,
        });

        console.log('Response:', response); // Log the response for debugging
        // can you add a console log here to see the formData content in pretty format
        for (const [key, value] of formData.entries()) {
            console.log(`${key}: ${value}`); // Log each key-value pair in the FormData
        }
        if (!response.ok) {
            document.getElementById('editLoading').style.display = 'none'; // Hide loading spinner
            throw new Error('Failed to update announcement');
        }

        showToast('Announcement updated successfully!');
        fetchAnnouncements();
        document.getElementById('editLoading').style.display = 'none'; // Hide loading spinner

        const editAnnouncementModal = bootstrap.Modal.getInstance(document.getElementById('editAnnouncementModal'));
        editAnnouncementModal.hide();
    } catch (error) {
        document.getElementById('editLoading').style.display = 'none'; // Hide loading spinner
        console.error('Error updating announcement:', error);
    }
});

// Ensure the addAnnouncementForm includes the visible field
const addAnnouncementForm = document.getElementById('addAnnouncementForm');
addAnnouncementForm.addEventListener('submit', async function (event) {
    event.preventDefault();
    document.getElementById('addLoading').style.display = 'inline-block'; // Show loading spinner

    const formData = new FormData();
    formData.append('title', document.getElementById('addAnnouncementTitle').value);
    formData.append('content', tinymce.get('addAnnouncementContent').getContent());
    formData.append('visible', document.getElementById('addAnnouncementVisible').value);
    const imageFile = document.getElementById('imageAnnouncement').files[0];
    if (imageFile) {
        formData.append('image', imageFile);
    }

    try {
        const response = await fetch('https://10.120.32.59/app/api/v1/announcements', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('authToken')}` // Include token for authorization
            },
            body: formData,
        });

        if (!response.ok) {
            document.getElementById('addLoading').style.display = 'none'; // Hide loading spinner
            throw new Error('Failed to add announcement');
        }

        showToast('Announcement added successfully!');
        fetchAnnouncements();
        document.getElementById('addLoading').style.display = 'none'; // Hide loading spinner

        // Reset the add announcement form after successful submission
        document.getElementById('addAnnouncementForm').reset();
        tinymce.get('addAnnouncementContent').setContent('');

        // Clear the image input and preview after successful submission
        const imageInput = document.getElementById('imageAnnouncement');
        const imagePreview = document.getElementById('imagePreviewContainerAnnouncement');
        imageInput.value = '';
        if (imagePreview) {
            imagePreview.src = '';
            imagePreview.style.display = 'none';
        }

        const addAnnouncementModal = bootstrap.Modal.getInstance(document.getElementById('addAnnouncementModal'));
        addAnnouncementModal.hide();
    } catch (error) {
        console.error('Error adding announcement:', error);
        document.getElementById('addLoading').style.display = 'none'; // Hide loading spinner
        alert(`Error adding announcement: ${error.message}`);
    }
});

function showToast(message) {
    const toastElement = document.getElementById('successToast');
    const toastBody = toastElement.querySelector('.toast-body');
    toastBody.textContent = message;

    const toast = new bootstrap.Toast(toastElement);
    toast.show();
}

// Initialize the announcements table on page load
document.addEventListener('DOMContentLoaded', fetchAnnouncements);