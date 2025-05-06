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
                // Format items array into a readable string (e.g., 2 x Item 7 (€10.00))
                const itemsList = order.items.map(item => `${item.quantity} x Item (${item.id}) (€${item.price.toFixed(2)})`).join(', ');

                // Conditionally format address based on method
                const address = order.method === "pickup" ? "N/A" : `${order.address.street}, ${order.address.postalCode}, ${order.address.city}`;

                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${order.order_id}</td>
                    <td>${order.customer_name}</td>
                    <td>${order.customer_phone}</td>
                    <td>${order.customer_email}</td>
                    <td>${itemsList}</td>
                    <td>${order.method}</td>
                    <td>${address}</td>
                    <td>${order.scheduled_time}</td>
                    <td>${order.notes}</td>
                    <td>${order.total_price}€</td>
                    <td>${order.status}</td>
                `;
                tbody.appendChild(row);
            });

         initializeTable('#OrdersTable', 5);
        } catch (error) {
            console.error('Error fetching orders:', error);
        }
    };


    // Fetch and load orders
    fetchOrders();
});