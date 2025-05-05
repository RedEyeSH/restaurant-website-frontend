const apiUrl = "https://10.120.32.59/app/api/v1";

const daysTag = document.querySelector(".days"),
      currentDate = document.querySelector(".current-date"),
      prevNextIcon = document.querySelectorAll(".icons span"),
      guestInput = document.querySelector("#guest"),
      messageContainer = document.querySelector("#message"),
      timeInputContainer = document.querySelector("#time-input"),
      timeInput = document.querySelector("#time"),
      processBtn = document.querySelector("#process-btn"),
      calendarSection = document.querySelector("#calendar-section"),
      formSection = document.querySelector("#form-section"),
      backBtn = document.querySelector("#back-btn"),
      reservationForm = document.querySelector("#reservation-form"),
      summary = document.querySelector("#summary");

let date = new Date(),
    currYear = date.getFullYear(),
    currMonth = date.getMonth();

const months = ["January", "February", "March", "April", "May", "June", "July",
  "August", "September", "October", "November", "December"];

let availableDays = {
  noChairs: [],
  remainingChairs: [],
  closedDays: [],  // Track closed days
  notAvailable: [],  // Track not available days
  openDaysWithTime: [] // Track open days with specific open and close times
};

let selectedDate = "";
let selectedTime = "";
let selectedGuest = 1;  // To store the selected number of guest

const convertToISODate = (dateString) => {
  const [day, month, year] = dateString.split('.');
  return `${year}-${month}-${day}`;
};

const fetchAvailableDays = async () => {
  try {
    const response = await fetch(`${apiUrl}/reservations/available-days`);
    const data = await response.json();
    availableDays.noChairs = data.data.filter(item => item.status === 'full').map(item => convertToISODate(item.date));
    availableDays.remainingChairs = data.data.filter(item => item.status === 'available').map(item => ({
      date: convertToISODate(item.date),
      remainingChairs: item.remainingChairs
    }));
  } catch (error) {
    console.error('Error fetching available days:', error);
    document.getElementById("calendar-section").style.display = "none"; // Hide calendar section on error
    document.querySelector(".info-container").innerHTML = `<p style="color: red;">We are currently experiencing issues with the calendar server. Kindly try again later.</p>`;
  }
};

const fetchScheduleData = async () => {
  try {
    const scheduleResponse = await fetch(`${apiUrl}/schedule`);
    const scheduleData = await scheduleResponse.json();

    availableDays.closedDays = scheduleData.filter(item => item.status === 'close').map(item => ({
      date: item.date,
      message: item.message || "No special message available"
    }));

    availableDays.openDaysWithTime = scheduleData.filter(item => item.status === 'open' && item.open_time && item.close_time).map(item => ({
      date: item.date,
      openTime: item.open_time,
      closeTime: item.close_time,
      message: item.message || "No special message available"
    }));
  } catch (error) {
    console.error('Error fetching schedule data:', error);
    document.getElementById("calendar-section").style.display = "none"; // Hide calendar section on error
    document.querySelector(".info-container").innerHTML = `<p style="color: red;">We are currently experiencing issues with the calendar server. Kindly try again later. If you require further assistance, please contact us via <a href="mailto:burgersinhelsinki@gmail.com">email.</a></p>`;
  }
};

const fetchUnavailableDates = async (guest_count) => {
try {
const response = await fetch(`${apiUrl}/reservations/test`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ guest_count })
});

if (response.ok) {
  const data = await response.json();
  if (data.success) {
    // Update unavailable dates based on the response
    availableDays.notAvailable = data.unavailableDates.map(item => ({
      date: convertToISODate(item.date),
      remainingChairs: item.remainingChairs,
      freeTables: item.freeTables
    }));
  }
} else {
  console.error('Failed to fetch unavailable dates:', response.statusText);
}
} catch (error) {
console.error('Error fetching unavailable dates:', error);
}
};

const renderCalendar = async () => {
let firstDayofMonth = new Date(currYear, currMonth, 1).getDay(),
  lastDateofMonth = new Date(currYear, currMonth + 1, 0).getDate(),
  lastDayofMonth = new Date(currYear, currMonth, lastDateofMonth).getDay(),
  lastDateofLastMonth = new Date(currYear, currMonth, 0).getDate();

let liTag = "";

// Get today's date to compare with the days of the current month
const today = new Date();
const todayYear = today.getFullYear();
const todayMonth = today.getMonth();
const todayDate = today.getDate();

// Loop through the previous month's dates
for (let i = firstDayofMonth; i > 0; i--) {
liTag += `<li class=\"inactive\">${lastDateofLastMonth - i + 1}</li>`;
}

// Loop through the current month's dates
for (let i = 1; i <= lastDateofMonth; i++) {
let isToday = i === todayDate && currMonth === todayMonth && currYear === todayYear ? "active" : "",
    currentDateString = `${currYear}-${(currMonth + 1).toString().padStart(2, '0')}-${i.toString().padStart(2, '0')}`,
    status = "green";  // Default

const currentDate = new Date(currYear, currMonth, i);
const isPastDay = currentDate.setHours(0, 0, 0, 0) < today.setHours(0, 0, 0, 0);

if (isPastDay) {
    status = "disabled";
} else if (availableDays.closedDays.some(item => item.date === currentDateString)) {
    status = "closed";
} else if (availableDays.noChairs.includes(currentDateString)) {
    status = "no-chairs";
} else if (availableDays.notAvailable.some(item => item.date === currentDateString)) {
    status = "not-available";
} else if (availableDays.openDaysWithTime.some(item => item.date === currentDateString)) {
    status = "open-with-time";
}

let isAvailable = status === "green" || status === "open-with-time";
let selectedClass = (currentDateString === selectedDate && isAvailable) ? "selected" : "";

liTag += `<li class="${isToday} ${status} ${selectedClass}" data-date="${currentDateString}">${i}</li>`;
}


// Loop through the next month's dates (fill in empty cells)
for (let i = lastDayofMonth; i < 6; i++) {
liTag += `<li class=\"inactive\">${i - lastDayofMonth + 1}</li>`;
}

currentDate.innerText = `${months[currMonth]} ${currYear}`;
daysTag.innerHTML = liTag;
};





// Check if the currently selected time is within the new limits

// Event listener for day click
document.addEventListener("click", (e) => {
if (e.target && e.target.tagName === "LI") {
const clickedDate = e.target.getAttribute("data-date");
const clickedDay = e.target.classList.contains("green") || e.target.classList.contains("open-with-time");


if (clickedDay) {
  const currentSelectedTime = timeInput.value;
selectedDate = clickedDate;
const formattedDate = formatDate(selectedDate);
const openDay = availableDays.openDaysWithTime.find(item => item.date === selectedDate);

if (openDay) {
  messageContainer.innerHTML = `Selected Date: <strong>${formattedDate}</strong><br><p style="margin-top:10px; margin-bottom:10px; color:red">Restaurant Open Time: <strong>${openDay.openTime}</strong> - Close Time: <strong>${openDay.closeTime}</strong><br>${openDay.message}</p>`;
  updateTimeInputLimits(openDay.openTime, openDay.closeTime); // Update time input limits
  timeInputContainer.style.display = "block";
} else {
  // Default time for green days
  messageContainer.innerHTML = `Selected Date: <strong>${formattedDate}</strong><br> <p style="margin-top:10px; margin-bottom:10px;">Please select a time between 9:00 - 20:00</p>`;
  updateTimeInputLimits("09:00", "21:00"); // Default time for green days
  timeInputContainer.style.display = "block";
}

if (currentSelectedTime && currentSelectedTime >= timeInput.min && currentSelectedTime <= timeInput.max) {
  processBtn.style.display = "block";
  selectedTime = currentSelectedTime;  // Retain selection
} else {
  processBtn.style.display = "none";
  selectedTime = ""; // Reset if no longer valid
}
renderCalendar();
} else {
  // Special cases
  const closedDay = availableDays.closedDays.find(item => item.date === clickedDate);
  if (closedDay) {
    messageContainer.innerHTML = `Sorry, Restaurant is closed on <strong>${formatDate(clickedDate)}</strong><br>${closedDay.message || "No special message available"}`;
  } else if (availableDays.noChairs.includes(clickedDate)) {
    messageContainer.innerHTML = `Sorry, the date <strong>${formatDate(clickedDate)}</strong> has no available space.`;
  } else if (availableDays.remainingChairs.find(item => item.date === clickedDate && item.remainingChairs <= 0)) {
    messageContainer.innerHTML = `Sorry, the date <strong>${formatDate(clickedDate)}</strong> is not available for your selected guests.`;
  } else if (availableDays.notAvailable.find(item => item.date === clickedDate)) {
    messageContainer.innerHTML = `Sorry, the date <strong>${formatDate(clickedDate)}</strong> is not available for your selected guests.`;
  }

  timeInputContainer.style.display = "none"; 
}

}
});


prevNextIcon.forEach(icon => {
  icon.addEventListener("click", () => {
    currMonth = icon.id === "prev" ? currMonth - 1 : currMonth + 1;
    if (currMonth < 0 || currMonth > 11) {
      date = new Date(currYear, currMonth, new Date().getDate());
      currYear = date.getFullYear();
      currMonth = date.getMonth();
    } else {
      date = new Date();
    }
    renderCalendar();
  });
});

// Create the number of guest options
for (let i = 1; i <= 10; i++) {
const option = document.createElement("option");
option.value = i;
option.text = i;

// Set the default option to 1
if (i === 1) {
option.selected = true;
}

guestInput.appendChild(option);
}

// Event listener for when the user selects number of guest
guestInput.addEventListener("change", async () => {
selectedGuest = parseInt(guestInput.value);
await fetchUnavailableDates(selectedGuest);
messageContainer.innerHTML = ""; // Clear any previous messages
// Check if selectedDate is now unavailable
if (availableDays.notAvailable.some(item => item.date === selectedDate)) {
selectedDate = ""; // Reset selection
messageContainer.innerHTML = ""; // Clear any previous selected date message
timeInputContainer.style.display = "none"; // Hide time input
}

renderCalendar();
});


// Format selected date for displaying in the form
function formatDate(dateString) {
  const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
  return new Date(dateString).toLocaleDateString('en-GB', options); // DD/MM/YYYY
}




// Update the time input's min and max attributes dynamically based on the selected date
const updateTimeInputLimits = (minTime, maxTime) => {
// Convert maxTime (HH:MM) to Date object
const [maxHour, maxMinute] = maxTime.split(":").map(Number);
const maxDate = new Date();
maxDate.setHours(maxHour);
maxDate.setMinutes(maxMinute);

// Subtract 1 hour
maxDate.setHours(maxDate.getHours() - 1);

// Format adjusted max time as H:MM (remove leading zero from hour)
const adjustedMaxTime = `${maxDate.getHours()}:${String(maxDate.getMinutes()).padStart(2, "0")}`;

// Format minTime (remove leading zero if present)
const [minHour, minMinute] = minTime.split(":").map(Number);
const adjustedMinTime = `${minHour}:${String(minMinute).padStart(2, "0")}`;

timeInput.min = minTime;
timeInput.max = adjustedMaxTime;
};


// When the time is selected, show the process button if the selected time is valid
timeInput.addEventListener("input", () => {
const selectedTimeValue = timeInput.value;
selectedTime = selectedTimeValue;

if (selectedTimeValue >= timeInput.min && selectedTimeValue <= timeInput.max) {
processBtn.style.display = "block";
document.getElementById("time-error").innerText = "";
} else {
processBtn.style.display = "none";
document.getElementById("time-error").innerText = `Please select a valid time within the limits. ${timeInput.min} - ${timeInput.max}`;
}
});



// When the user clicks on the "Proceed to Form" button
processBtn.addEventListener("click", () => {
if (!selectedTime) {
messageContainer.innerHTML = "Please select a time before proceeding.";
return;
}
backBtn.addEventListener("click", () => {
  formSection.style.display = "none";
  calendarSection.style.display = "block";
});

// Include selectedTime in the summary, and format selectedDate
summary.innerHTML = `You have selected <strong>${selectedGuest}</strong> guest(s) for the date <strong>${formatDate(selectedDate)}</strong> at <strong>${selectedTime}</strong>.`;
formSection.style.display = "block";
calendarSection.style.display = "none";
});


// Handle form submission
reservationForm.addEventListener("submit", async (e) => {
e.preventDefault();
// Disable all fields and the button
const submitBtn = document.getElementById("submit-btn");
const spinner = document.getElementById("spinner");
submitBtn.disabled = true;
submitBtn.style.background = '#F7B41A';
spinner.style.display = 'inline-block'; // Show the spinner

const reservationData = {
name: document.getElementById("name").value,
phone: document.getElementById("phone").value,
email: document.getElementById("email").value,
guest_count: selectedGuest,
date: selectedDate, // Ensure selectedDate is in correct format
time: selectedTime,
notes: document.getElementById("notes").value,
};

try {
const response = await fetch(`${apiUrl}/reservations/`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(reservationData)
});

   if (response.ok) {
  // Hide form, show success message
  document.getElementById("form-hide").style.display = "none";
  document.getElementById("form-message").classList.remove('hidden');
  document.getElementById("form-message").innerHTML = 'Reservation successful! Please check your email for confirmation.';
  showReservationSuccessModal()
} else {
  // Show error message
  const errorData = await response.json();
  document.getElementById("form-message").classList.remove('hidden');
  document.getElementById("form-message").innerHTML = `Error: ${errorData.message || 'Something went wrong. Please try again.'}`;
  spinner.style.display = 'none'; // Hide spinner
  submitBtn.disabled = false;
  submitBtn.style.background = '#FFC94B';
}
} catch (error) {
// Handle network error
document.getElementById("form-message").classList.remove('hidden');
document.getElementById("form-message").innerHTML = 'Server error. Please try again later.';
spinner.style.display = 'none'; // Hide spinner
submitBtn.disabled = false;
submitBtn.style.background = '#FFC94B';
}
});

const showReservationSuccessModal = () => {
  const modal = document.createElement("div");
  modal.style.position = "fixed";
  modal.style.top = "0";
  modal.style.left = "0";
  modal.style.width = "100%";
  modal.style.height = "100%";
  modal.style.backgroundColor = "rgba(0, 0, 0, 0.8)";
  modal.style.display = "flex";
  modal.style.justifyContent = "center";
  modal.style.alignItems = "center";
  modal.style.zIndex = "1000";

  const modalContent = document.createElement("div");
  modalContent.style.backgroundColor = "#191919";
  modalContent.style.color = "white";
  modalContent.style.padding = "20px";
  modalContent.style.borderRadius = "10px";
  modalContent.style.textAlign = "center";
  modalContent.style.maxWidth = "500px";
  modalContent.style.width = "100%";

  modalContent.innerHTML = `
  <h2>Table Reservation Confirmed!</h2>
  
  <p style="margin-top:20px">A confirmation email with your reservation details has been sent to your email. 📩</p>
  <button id="close-modal" style="margin-top: 20px; padding: 10px 20px; background-color: #F7B41A; color: #0D0D0D; border: none; border-radius: 5px; cursor: pointer;">Close</button>
`;

  modal.appendChild(modalContent);
  document.body.appendChild(modal);

  const closeModalButton = document.getElementById("close-modal");
  closeModalButton.addEventListener("click", () => {
      modal.remove();
      window.location.reload();
  });
};

// Initialize everything
fetchAvailableDays().then(() => {
  renderCalendar();
});
fetchScheduleData().then(() => {
  renderCalendar();
});
