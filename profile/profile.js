"use strict";

import { fetchData } from "../lib/fetchData";

const sections = document.querySelectorAll(".container section");
const navigationLinks = document.querySelectorAll(".navigation-link");

navigationLinks.forEach(link => {
    link.addEventListener("click", (event) => {
        event.preventDefault(); // Prevent default link behavior

        // Remove 'link-active' from all links
        navigationLinks.forEach(nav => nav.classList.remove("link-active"));

        // Add 'link-active' to the clicked link
        event.currentTarget.classList.add("link-active");

        // Get the section ID from the link's ID (e.g., 'account-link' -> 'profile')
        const sectionId = event.currentTarget.id.replace("-link", "");

        console.log(sectionId)

        // Hide all sections and show the corresponding section
        sections.forEach(section => {
            console.log(section);
            section.style.display = section.id === sectionId ? "block" : "none";
        });
    });
});

const apiUrl = "https://10.120.32.59/app/api/v1/";

const getUserByToken = async () => {
    const token = localStorage.getItem("authtoken");
    const options = {
        method: "GET",
        headers: {
            "Authorization": token
        }
    }
    const data = fetchData(`${apiUrl}/users`, options);
    
}