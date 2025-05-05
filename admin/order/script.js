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

async function fetchOrders() {
    try {
        const response = await fetch('https://10.120.32.59/app/api/v1/orders/', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch orders');
        }

        const orders = await response.json();
        const tbody = document.getElementById('OrdersBody');
        tbody.innerHTML = '';

        for (const order of orders) {
            const itemsList = order.items.map(item => {
                const price = parseFloat(item.price) || 0; // Default to 0 if price is not a valid number
                return `${item.quantity} x Item (${item.id}) (€${price.toFixed(2)})`;
            }).join(', ');
            const address = order.method === "pickup" ? "N/A" : `${order.address.street}, ${order.address.postalCode}, ${order.address.city}`;

            // Add color badges for status
            const statusBadge = {
                'processing': '<span class="badge bg-warning text-dark">Processing</span>',
                'preparing': '<span class="badge bg-primary">Preparing</span>',
                'ready': '<span class="badge bg-info text-dark">Ready</span>',
                'completed': '<span class="badge bg-success">Completed</span>',
                'cancelled': '<span class="badge bg-danger">Order Cancelled</span>'
            }[order.status] || `<span class="badge bg-secondary">${order.status}</span>`;

            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${order.order_id}</td>
                <td>${statusBadge}</td>
                <td>${order.user_id ? await fetchUserName(order.user_id) : 'Null'}</td>
                <td>${order.customer_name}</td>
                <td>${order.customer_phone}</td>
                <td>${order.customer_email}</td>
                <td>${order.method}</td>
                <td>${address}</td>
                <td>${order.scheduled_time === 'Now' ? 'Now' : new Date(order.scheduled_time).toLocaleString('fi-FI')}</td>
                <td>${order.total_price}€</td>
                <td>${new Date(order.created_at).toLocaleString('fi')}</td>
                <td>${new Date(order.updated_at).toLocaleString('fi')}</td>
                <td>${order.updated_by ? await fetchUserName(order.updated_by) : 'Not yet updated'}</td>
                <td>
                    <button class="btn btn-primary view-order" onclick="viewOrderDetails(${order.order_id})" data-bs-toggle="modal" data-bs-target="#orderModal">View</button>
                    <button class="btn btn-secondary edit-order" onclick="populateEditOrderModal(${order.order_id})" data-bs-toggle="modal" data-bs-target="#editOrderModal">Edit</button>
                </td>
            `;
            tbody.appendChild(row);
        }

        initializeTable('#OrdersTable', 5);
    } catch (error) {
        console.error('Error fetching orders:', error);
    }
}


// Make viewOrderDetails globally accessible
async function viewOrderDetails(orderId) {
    try {
        const response = await fetch(`https://10.120.32.59/app/api/v1/orders/${orderId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch order details');
        }

        const order = await response.json();
        const modalBody = document.getElementById('orderDetails');

        // Fetch username using user_id
        const userName = order.user_id ? await fetchUserName(order.user_id) : 'No user ID';

        // Ensure total_price is a number
        const totalPrice = parseFloat(order.total_price);

        // Generate items table
        const itemsTable = `
            <table class="table">
                <thead>
                    <tr>
                        <th>Item Name</th>
                        <th>Quantity</th>
                        <th>Price</th>
                        <th>Total</th>
                    </tr>
                </thead>
                <tbody>
                    ${order.items.map(item => {
                        const price = parseFloat(item.price) || 0; // Default to 0 if price is not a valid number
                        return `
                            <tr>
                                <td>${item.details.name}</td>
                                <td>${item.quantity}</td>
                                <td>€${price.toFixed(2)}</td>
                                <td>€${(item.quantity * price).toFixed(2)}</td>
                            </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>
        `;

        // Generate address section if method is delivery
        const addressSection = order.method === "pickup" ? "" : `
            <p><strong>Address:</strong> ${order.address.street}, ${order.address.postalCode}, ${order.address.city}</p>
        `;

        // Add color badges for status
        const statusBadge = {
            'processing': '<span class="badge bg-warning text-dark">Processing</span>',
            'preparing': '<span class="badge bg-primary">Preparing</span>',
            'ready': '<span class="badge bg-info text-dark">Ready</span>',
            'completed': '<span class="badge bg-success">Completed</span>',
            'cancelled': '<span class="badge bg-danger">Order Cancelled</span>'
        }[order.status] || `<span class="badge bg-secondary">${order.status}</span>`;

        modalBody.innerHTML = `
        <div class="container">
      
          <!-- Order Overview -->
          <div class="card mb-3">
            <div class="card-header bg-primary text-white">
              <i class="bi bi-basket2-fill me-2"></i>Order Overview
            </div>
            <div class="card-body">
              <p><i class="bi bi-hash me-2"></i><strong>Order ID:</strong> ${order.order_id}</p>
              <p><i class="bi bi-person-circle me-2"></i><strong>Logged in User:</strong> ${userName}</p>
              <p><i class="bi bi-award me-2"></i><strong>Status:</strong> ${statusBadge}</p>
              <p><i class="bi bi-wallet2 me-2"></i><strong>Method:</strong> ${order.method}</p>
              <p><i class="bi bi-clock me-2"></i><strong>Scheduled Time:</strong> 
                ${order.scheduled_time === 'Now' ? 'Now' : new Date(order.scheduled_time).toLocaleString('fi-FI')}
              </p>
            </div>
          </div>
      
          <!-- Customer Info -->
          <div class="card mb-3">
            <div class="card-header bg-secondary text-white">
              <i class="bi bi-person-lines-fill me-2"></i>Customer Information
            </div>
            <div class="card-body">
              <p><i class="bi bi-person me-2"></i><strong>Name:</strong> ${order.customer_name}</p>
              <p><i class="bi bi-telephone me-2"></i><strong>Phone:</strong> ${order.customer_phone}</p>
              <p><i class="bi bi-envelope me-2"></i><strong>Email:</strong> ${order.customer_email}</p>
            </div>
          </div>
      
          <!-- Order Items -->
          <div class="card mb-3">
            <div class="card-header bg-info text-white">
              <i class="bi bi-list-ul me-2"></i>Order Items
            </div>
            <div class="card-body">
              ${itemsTable}
              <p class="mt-3"><i class="bi bi-cash-coin me-2"></i><strong>Total Order Price:</strong> €${totalPrice.toFixed(2)}</p>
            </div>
          </div>
      
          <!-- Delivery/Address Section -->
          ${addressSection ? `
          <div class="card mb-3">
            <div class="card-header bg-warning text-dark">
              <i class="bi bi-geo-alt me-2"></i>Delivery Address
            </div>
            <div class="card-body">
              ${addressSection}
            </div>
          </div>` : ''}
      
          <!-- Notes -->
          <div class="card mb-3">
            <div class="card-header bg-light">
              <i class="bi bi-chat-left-text me-2"></i>Notes
            </div>
            <div class="card-body">
              <p>${order.notes || 'None'}</p>
            </div>
          </div>
      
          <!-- Audit Trail -->
          <div class="card mb-3 ">
            <div class="card-header bg-dark text-white">
              <i class="bi bi-clock-history me-2"></i>Audit Information
            </div>
            <div class="card-body">
              <p><i class="bi bi-calendar-plus me-2"></i><strong>Created At:</strong> ${new Date(order.created_at).toLocaleString('fi-FI')}</p>
              <p><i class="bi bi-calendar-check me-2"></i><strong>Updated At:</strong> ${new Date(order.updated_at).toLocaleString('fi-FI')}</p>
              <p><i class="bi bi-person-check me-2"></i><strong>Updated By:</strong> 
                ${order.updated_by ? await fetchUserName(order.updated_by) : 'Not yet updated'}
              </p>
            </div>
          </div>
      
        </div>
      `;
      
    } catch (error) {
        console.error('Error fetching order details:', error);
    }
}

// Function to populate items in the Edit Order modal
async function populateEditItems(items) {
    const itemsContainer = document.getElementById('editItems');
    itemsContainer.innerHTML = ''; // Clear existing items
    for (const item of items) {
        await addItemRow({ id: item.id, quantity: item.quantity, price: item.price, type: item.type, useOrderPrice: true });
    }
}

// Function to calculate and populate the total price
function calculateAndPopulateTotalPrice() {
    const items = Array.from(document.querySelectorAll('#editItems .item-row'));
    let totalPrice = 0;

    items.forEach(row => {
        const quantity = parseInt(row.querySelector('.item-quantity').value, 10);
        const price = parseFloat(row.querySelector('.item-price').value);
        totalPrice += quantity * price;
    });

    document.getElementById('editTotalPrice').value = totalPrice.toFixed(2);
}

// Add event listeners to recalculate total price when items are updated
document.getElementById('editItems').addEventListener('input', calculateAndPopulateTotalPrice);

// Function to fetch items or meals based on the type and populate the select dropdown
async function fetchOptions(type) {
    const url = type === 'item' ? 'https://10.120.32.59/app/api/v1/items/' : 'https://10.120.32.59/app/api/v1/meals/';
    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            }
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch ${type}s`);
        }

        const data = await response.json();
        return data.map(item => ({ id: item.id, name: item.name, price: item.price  }));
    } catch (error) {
        console.error(error);
        return [];
    }
}

// Function to add a new item row in the items section
async function addItemRow(item = { id: '', quantity: 1, price: 0.00, type: 'item', useOrderPrice: false }) {
    const itemsContainer = document.getElementById('editItems');
    const itemRow = document.createElement('div');
    itemRow.classList.add('item-row', 'mb-2');

    // Create the select options dynamically based on the type
    const itemOptions = await fetchOptions(item.type);

    // Get already selected item IDs to disable them in the dropdown
    const selectedIds = Array.from(document.querySelectorAll('#editItems .item-id')).map(select => select.value);

    const itemSelectOptions = itemOptions.map(option => 
        `<option value="${option.id}" data-price="${option.price}" ${option.id === item.id ? 'selected' : ''} ${selectedIds.includes(option.id.toString()) && option.id !== item.id ? 'disabled' : ''}>${option.name}</option>`
    ).join('');

    // Ensure item.price is a valid number before calling toFixed
    const price = parseFloat(item.price) || 0; // Default to 0 if price is not a valid number
    itemRow.innerHTML = `
        <div class="row">
            <div class="col-md-2">
                <select class="form-select item-type" required>
                    <option value="item" ${item.type === 'item' ? 'selected' : ''}>Item</option>
                    <option value="meal" ${item.type === 'meal' ? 'selected' : ''}>Meal</option>
                </select>
            </div>
            <div class="col-md-3">
                <select class="form-select item-id" required>
                    <option value="">Select Item/Meal</option>
                    ${itemSelectOptions}
                </select>
            </div>
            <div class="col-md-2">
                <input type="number" class="form-control item-quantity" placeholder="Quantity" value="${item.quantity}" min="1" required>
            </div>
            <div class="col-md-3">
                <input type="number" class="form-control item-price" placeholder="Price" value="${price.toFixed(2)}" step="0.01" disabled required>
            </div>
            <div class="col-md-2">
                <button type="button" class="btn btn-danger remove-item-button">Remove</button>
            </div>
        </div>
    `;
    itemsContainer.appendChild(itemRow);

    // Add event listener to remove button
    itemRow.querySelector('.remove-item-button').addEventListener('click', () => {
        itemRow.remove();
        calculateAndPopulateTotalPrice();
        updateDisabledOptions(); // Update disabled options when an item is removed
    });

    // Add event listener to handle type change and update the item/meal select
    itemRow.querySelector('.item-type').addEventListener('change', async function () {
        const selectedType = this.value;
        const newItemOptions = await fetchOptions(selectedType);
        const itemSelect = itemRow.querySelector('.item-id');
        const selectedIds = Array.from(document.querySelectorAll('#editItems .item-id')).map(select => select.value);
        itemSelect.innerHTML = `<option value="">Select ${selectedType.charAt(0).toUpperCase() + selectedType.slice(1)}</option>`;
        newItemOptions.forEach(option => {
            itemSelect.innerHTML += `<option value="${option.id}" data-price="${option.price}" ${selectedIds.includes(option.id.toString()) ? 'disabled' : ''}>${option.name}</option>`;
        });
    });

    // Add event listener to the item ID selection dropdown to update the price when an item/meal is selected
    const itemSelect = itemRow.querySelector('.item-id');
    itemSelect.addEventListener('change', function () {
        const selectedOption = itemSelect.options[itemSelect.selectedIndex];
        const price = parseFloat(selectedOption.getAttribute('data-price')) || 0;
        const useOrderPrice = item.useOrderPrice && selectedOption.value == item.id;
        itemRow.querySelector('.item-price').value = useOrderPrice ? item.price.toFixed(2) : price.toFixed(2);
        calculateAndPopulateTotalPrice(); // Recalculate total price whenever the price is updated
        updateDisabledOptions(); // Update disabled options when a new item is selected
    });
}

function updateDisabledOptions() {
    const selectedIds = Array.from(document.querySelectorAll('#editItems .item-id')).map(select => select.value);
    document.querySelectorAll('#editItems .item-id').forEach(select => {
        Array.from(select.options).forEach(option => {
            if (selectedIds.includes(option.value) && option.value !== select.value) {
                option.disabled = true;
            } else {
                option.disabled = false;
            }
        });
    });
}

async function populateEditOrderModal(orderId) {
    try {
        const response = await fetch(`https://10.120.32.59/app/api/v1/orders/${orderId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch order details');
        }

        const order = await response.json();

        hideFormErrors(); // Hide any previous error messages
        
        document.getElementById('editCustomerName').value = order.customer_name;
        document.getElementById('editCustomerPhone').value = order.customer_phone;
        document.getElementById('editCustomerEmail').value = order.customer_email;
        document.getElementById('editMethod').value = order.method;
        document.getElementById('editNotes').value = order.notes;
        document.getElementById('editStatus').value = order.status;
        document.getElementById('editTotalPrice').value = parseFloat(order.total_price).toFixed(2); // Ensure total price is a number

        // Populate scheduled time field and radio buttons
        if (order.scheduled_time === 'Now') {
            document.getElementById('scheduledNow').checked = true;
            document.getElementById('editScheduledTime').disabled = true;
        } else {
            document.getElementById('scheduledSpecific').checked = true;
            document.getElementById('editScheduledTime').disabled = false;
            document.getElementById('editScheduledTime').value = order.scheduled_time;
        }

        // Populate items
        populateEditItems(order.items);

        // Show or hide address fields based on method selection
        document.getElementById('editMethod').addEventListener('change', function() {
            const addressSection = document.getElementById('editAddressSection');
            if (this.value === 'delivery') {
                addressSection.style.display = 'block';
            } else {
                addressSection.style.display = 'none';
                document.getElementById('editStreet').value = '';
                document.getElementById('editPostalCode').value = '';
                document.getElementById('editCity').value = '';
            }
        });

        // Populate address fields if method is delivery
        if (order.method === 'delivery' && order.address) {
            document.getElementById('editStreet').value = order.address.street || '';
            document.getElementById('editPostalCode').value = order.address.postalCode || '';
            document.getElementById('editCity').value = order.address.city || '';
            document.getElementById('editAddressSection').style.display = 'block';
        } else {
            document.getElementById('editAddressSection').style.display = 'none';
        }

        // Store order ID for submission
        document.getElementById('editOrderForm').dataset.orderId = orderId;
    } catch (error) {
        console.error('Error populating edit order modal:', error);
    }
}

document.getElementById('editOrderForm').addEventListener('submit', async function (event) {
    event.preventDefault();
    document.getElementById('editLoading').style.display = 'inline-block'; // Show loading spinner

    const orderId = this.dataset.orderId;
    const scheduledTimeOption = document.querySelector('input[name="scheduledTimeOption"]:checked').value;
    const scheduledTime = scheduledTimeOption === 'now' ? 'Now' : document.getElementById('editScheduledTime').value;

    const updatedOrder = {
        order_id: orderId,
        customer_name: document.getElementById('editCustomerName').value,
        customer_phone: document.getElementById('editCustomerPhone').value,
        customer_email: document.getElementById('editCustomerEmail').value,
        items: Array.from(document.querySelectorAll('#editItems .item-row')).map(row => ({
            id: parseInt(row.querySelector('.item-id').value, 10),
            quantity: parseInt(row.querySelector('.item-quantity').value, 10),
            price: parseFloat(row.querySelector('.item-price').value),
            type: row.querySelector('.item-type').value
        })),
        method: document.getElementById('editMethod').value,
        address: document.getElementById('editMethod').value === 'delivery' ? {
            street: document.getElementById('editStreet').value,
            postalCode: document.getElementById('editPostalCode').value,
            city: document.getElementById('editCity').value
        } : null,
        scheduled_time: scheduledTime,
        notes: document.getElementById('editNotes').value,
        total_price: parseFloat(document.getElementById('editTotalPrice').value).toFixed(2),
        status: document.getElementById('editStatus').value
    };

    try {
        const response = await fetch(`https://10.120.32.59/app/api/v1/orders/${orderId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            },
            body: JSON.stringify(updatedOrder)
        });

        if (!response.ok) {
            document.getElementById('editLoading').style.display = 'none'; // Hide loading spinner
            const errorData = await response.json();  // Get the error message from the response
            throw new Error(errorData.message || 'Failed to update order.');  // Default to generic error if message is not found
        }

        // Log the updated order in the console for debugging
        showToast('Order updated successfully!');
        fetchOrders();  // Refresh the orders list
        document.getElementById('editLoading').style.display = 'none'; // Hide loading spinner

        // Close modal
        const editOrderModal = bootstrap.Modal.getInstance(document.getElementById('editOrderModal'));
        editOrderModal.hide();
    } catch (error) {
        // Log the error message from the API or the generic error message
        console.error('Error updating order:', error.message);
        document.getElementById('editLoading').style.display = 'none'; // Hide loading spinner
        showFormErrors([`Error: ${error.message}`]);
    }
});

// Handle enabling/disabling the scheduled time input based on the selected option
document.querySelectorAll('input[name="scheduledTimeOption"]').forEach(option => {
    option.addEventListener('change', function () {
        const scheduledTimeInput = document.getElementById('editScheduledTime');
        if (this.value === 'specific') {
            scheduledTimeInput.disabled = false; // Enable the input when 'Specific Date & Time' is selected
        } else {
            scheduledTimeInput.disabled = true; // Disable the input when 'Now' is selected
        }
    });
});

function showToast(message) {
    const toastElement = document.getElementById('successToast');
    const toastBody = toastElement.querySelector('.toast-body');
    toastBody.textContent = message;

    const toast = new bootstrap.Toast(toastElement);
    toast.show();
}

// Function to show form errors below the Save Changes button
function showFormErrors(errors) {
    const errorContainer = document.getElementById('formErrorContainer');
    const errorList = document.getElementById('formErrorList');
    errorList.innerHTML = '';

    errors.forEach(error => {
        const listItem = document.createElement('li');
        listItem.textContent = error;
        errorList.appendChild(listItem);
    });

    errorContainer.classList.remove('d-none');
}

// Function to hide form errors
function hideFormErrors() {
    const errorContainer = document.getElementById('formErrorContainer');
    errorContainer.classList.add('d-none');
}

document.addEventListener('DOMContentLoaded', fetchOrders);