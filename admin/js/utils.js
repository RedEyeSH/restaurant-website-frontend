document.addEventListener('DOMContentLoaded', () => {
    const toggleButton = document.getElementById('navbar-toggle');
    const sidebar = document.querySelector('nav.nav');

    // Set the initial state of the toggle button icon based on sidebar visibility
    if (!sidebar.classList.contains('d-none')) {
        toggleButton.innerHTML = '<i class="bi bi-arrow-left"></i>'; // Set to arrow icon if sidebar is visible
    } else {
        toggleButton.innerHTML = '<i class="bi bi-list"></i>'; // Set to list icon if sidebar is hidden
    }

    toggleButton.addEventListener('click', () => {
        const mainContent = document.querySelector('.flex-grow-1');
        if (sidebar.classList.contains('d-none')) {
            sidebar.classList.remove('d-none', 'slide-out');
            sidebar.classList.add('slide-in');
            toggleButton.innerHTML = '<i class="bi bi-arrow-left"></i>'; // Change to arrow icon
            mainContent.classList.remove('full-width');
        } else {
            sidebar.classList.remove('slide-in');
            sidebar.classList.add('slide-out');
            setTimeout(() => sidebar.classList.add('d-none'), 300); // Wait for animation to finish
            toggleButton.innerHTML = '<i class="bi bi-list"></i>'; // Change back to list icon
            mainContent.classList.add('full-width');
        }

        toggleButton.style.position = sidebar.classList.contains('d-none') ? 'absolute' : 'fixed';
        toggleButton.style.top = '15px';
    });
});