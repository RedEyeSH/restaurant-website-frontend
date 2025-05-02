document.addEventListener("DOMContentLoaded", async () => {
    const announcementsContainer = document.getElementById("announcements-container");
    const searchBar = document.getElementById("search-bar");

    let announcements = [];

    const calculateReadingTime = (content) => {
        const wordsPerMinute = 200; // Average reading speed
        const words = content.split(" ").length;
        const minutes = Math.ceil(words / wordsPerMinute);
        return `${minutes} min read`;
    };


    const renderAnnouncements = (filteredAnnouncements) => {
        announcementsContainer.innerHTML = "";
        filteredAnnouncements.forEach(announcement => {
            const readingTime = calculateReadingTime(announcement.content);
            const announcementDiv = document.createElement("div");
            announcementDiv.className = "announcements";
            announcementDiv.innerHTML = `
                <img src="https://10.120.32.59/app/${announcement.image_url}" alt="${announcement.title}" class="announcements-image">
                <h2>${announcement.title}</h2>
                <div class="footer">
                <p class="date">${new Date(announcement.created_at).toLocaleDateString('fi-FI')} ${new Date(announcement.created_at).toLocaleTimeString('fi-FI', { hour: '2-digit', minute: '2-digit' })}</p>
                <a href="index.html?id=${announcement.id}">Read More</a>
                </div>
            `;
            announcementsContainer.appendChild(announcementDiv);
        });
    };

    const fetchAndRenderSingleAnnouncement = async (id) => {
        try {
            const response = await fetch(`https://10.120.32.59/app/api/v1/announcements/${id}`);
            if (response.ok) {
                const announcement = await response.json();
                const readingTime = calculateReadingTime(announcement.content);
                document.getElementById("header-h1").innerText = announcement.title;
                announcementsContainer.innerHTML = `
                    <div class="announcement">
                        <p class="date">${new Date(announcement.created_at).toLocaleDateString('fi-FI')} ${new Date(announcement.created_at).toLocaleTimeString('fi-FI', { hour: '2-digit', minute: '2-digit' })}</p>
                        <p class="reading-time">${readingTime}</p>
                    <img src="https://10.120.32.59/app/${announcement.image_url}" alt="${announcement.title}" class="announcement-image">
                        <div>${announcement.content}</div>
                    </div>
                `;
            } else {
                announcementsContainer.innerHTML = "<p>Failed to load the announcement. Please try again later.</p>";
            }
        } catch (error) {
            console.error("Error fetching the announcement:", error);
            announcementsContainer.innerHTML = "<p>Error loading the announcement. Please check your connection.</p>";
        }
    };

    const urlParams = new URLSearchParams(window.location.search);
    const announcementId = urlParams.get("id");

    if (announcementId) {
        searchBar.style.display = "none";
        await fetchAndRenderSingleAnnouncement(announcementId);
    } else {
        try {
            const response = await fetch("https://10.120.32.59/app/api/v1/announcements");
            if (response.ok) {
                announcements = await response.json();
                renderAnnouncements(announcements);
            } else {
                announcementsContainer.innerHTML = "<p>Failed to load announcements. Please try again later.</p>";
            }
        } catch (error) {
            console.error("Error fetching announcements:", error);
            announcementsContainer.innerHTML = "<p>Error loading announcements. Please check your connection.</p>";
        }

        searchBar.addEventListener("input", (event) => {
            const query = event.target.value.toLowerCase();
            const filteredAnnouncements = announcements.filter(announcement =>
                announcement.title.toLowerCase().includes(query) ||
                announcement.content.toLowerCase().includes(query)
            );

            if (filteredAnnouncements.length === 0) {
                announcementsContainer.innerHTML = "<p class='search-text'>No announcements found matching your search.</p>";
            } else {
                renderAnnouncements(filteredAnnouncements);
            }
        });
    }
});