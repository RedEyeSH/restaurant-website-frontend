document.addEventListener('DOMContentLoaded', async () => {
    const fetchOrders = async () => {
        try {
            const response = await fetch('http://localhost:3000/api/v1/orders/', {
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

            orders.forEach(order => {
                const row = document.createElement('tr');
                const statusBadge = `<span class="badge bg-${getStatusColor(order.status)}">${order.status}</span>`;
                row.innerHTML = `
                    <td>${order.order_id}</td>
                    <td>${order.customer_name}</td>
                    <td>${order.customer_phone}</td>
                    <td>${order.method}</td>
                    <td>${new Date(order.scheduled_time).toLocaleString()}</td>
                    <td>${order.total_price}€</td>
                    <td>${order.status}</td>
                `;
                tbody.appendChild(row);
            });

            // Helper function to determine badge color based on status
            function getStatusColor(status) {
                switch (status.toLowerCase()) {
                    case 'processing':
                        return 'primary';
                    case 'preparing':
                        return 'info';
                    case 'ready':
                        return 'warning';
                    case 'completed':
                        return 'success';
                    default:
                        return 'secondary';
                }
            }

            // Refresh the Bootstrap Table after data is loaded
            $('#OrdersTable').bootstrapTable('load', orders);
        } catch (error) {
            console.error('Error fetching orders:', error);
        }
    };

    // Initialize the table with Bootstrap Table plugin
    $('#OrdersTable').bootstrapTable({
        search: true,       // Enable search
        pagination: true,   // Enable pagination
        pageSize: 5, // Set number of items per page
        sortable: true,     // Enable sorting
        filterControl: true, // Enable filter control
    });

    // Fetch and load orders
    fetchOrders();
});