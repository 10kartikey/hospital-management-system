const doctorForm = document.getElementById("doctorForm");
const doctorList = document.getElementById("doctorList");
const logoutBtn = document.getElementById("logoutBtn");
const deptSelect = document.getElementById("department");
let editingDoctorId = null;

// Logout button function  
if (logoutBtn) {
  logoutBtn.onclick = async function () {
    await fetch('/api/admin/logout', { method: 'POST' });
    window.location.href = "/html/admin-login.html";
  };
}

// Helper: Group consecutive time slots into ranges
function groupTimeSlotsToRanges(slots) {
  if (!slots.length) return [];
  const sorted = slots.slice().sort();
  const ranges = [];
  let start = sorted[0];
  let prev = sorted[0];

  for (let i = 1; i < sorted.length; i++) {
    const [ph, pm] = prev.split(":").map(Number);
    const [ch, cm] = sorted[i].split(":").map(Number);
    const prevMinutes = ph * 60 + pm;
    const currMinutes = ch * 60 + cm;
    if (currMinutes - prevMinutes !== 30) { // 30 min gap
      ranges.push({ start, end: prev });
      start = sorted[i];
    }
    prev = sorted[i];
  }
  ranges.push({ start, end: prev });
  return ranges;
}

// Helper: Expand ranges to slot strings for editing
function expandRangesToSlots(ranges) {
  const slots = [];
  ranges.forEach(range => {
    let [h, m] = range.start.split(":").map(Number);
    const [endH, endM] = range.end.split(":").map(Number);
    while (h < endH || (h === endH && m < endM)) {
      slots.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
      m += 30;
      if (m >= 60) {
        h += 1;
        m -= 60;
      }
    }
    slots.push(range.end); // include the end time
  });
  return slots;
}

// Generate 30-minute time slots from 00:00 to 23:30
function generateTimeSlots() {
  const dropdown = document.getElementById("timeSlotDropdown");
  dropdown.innerHTML = "";
  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += 30) {
      const time = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
      const li = document.createElement("li");
      li.innerHTML = `
        <div class="form-check px-3">
          <input class="form-check-input time-checkbox" type="checkbox" value="${time}" id="slot-${time}">
          <label class="form-check-label" for="slot-${time}">${time}</label>
        </div>
      `;
      dropdown.appendChild(li);
    }
  }
}

// Get selected time slot values
function getSelectedTimeSlots() {
  const checkboxes = document.querySelectorAll(".time-checkbox:checked");
  return Array.from(checkboxes).map(cb => cb.value);
}

// Render doctors in admin dashboard and hook up edit/delete buttons
async function updateDoctorList() {
  doctorList.innerHTML = "";
  const doctors = await getDoctors();
  doctors.forEach((doc) => {
    const li = document.createElement("li");
    li.className = "list-group-item";

    // Display ranges as "08:00 - 10:00"
    const ranges = doc.timeSlots.map(r => `${r.start} - ${r.end}`);

    li.innerHTML = `
      <div class="d-flex justify-content-between align-items-start flex-column flex-md-row">
        <div>
          <strong>${doc.name}</strong> - ${doc.department}<br>
          ₹${doc.fee}<br>
          Time Slots: ${ranges.map(r => `<span class="badge bg-secondary me-1">${r}</span>`).join(" ")}
        </div>
        <div class="mt-2 mt-md-0">
          <button class="btn btn-sm btn-warning me-2 edit-btn" data-id="${doc._id}">Edit</button>
          <button class="btn btn-sm btn-danger delete-btn" data-id="${doc._id}">Delete</button>
        </div>
      </div>
    `;
    doctorList.appendChild(li);
  });
}

// Edit doctor
doctorList.addEventListener('click', async function(e) {
  if (e.target.classList.contains('edit-btn')) {
    const id = e.target.getAttribute('data-id');
    const doctors = await getDoctors();
    const doc = doctors.find(d => d._id === id);

    document.getElementById("doctorName").value = doc.name;

    // Ensure department options are present before setting value
    setTimeout(() => {
      document.getElementById("department").value = doc.department;
    }, 0);

    // Expand ranges to slots and check the boxes
    const selectedSlots = expandRangesToSlots(doc.timeSlots || []);
    document.querySelectorAll(".time-checkbox").forEach(cb => {
      cb.checked = selectedSlots.includes(cb.value);
    });
    document.getElementById("fee").value = doc.fee;
    editingDoctorId = id;
    doctorForm.querySelector("button[type='submit']").innerText = "Update Doctor";
  }
});

// Delete doctor
doctorList.addEventListener('click', async function(e) {
  if (e.target.classList.contains('delete-btn')) {
    const id = e.target.getAttribute('data-id');
    if (confirm("Are you sure you want to delete this doctor?")) {
      await handleDeleteDoctor(id);
    }
  }
});

// Doctor form submit handler
doctorForm.onsubmit = async function (e) {
  e.preventDefault();
  let name = document.getElementById("doctorName").value.trim();
  name = name
    .split(" ")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
  if (!name.startsWith("Dr.")) {
    name = "Dr. " + name;
  }
  let dept = document.getElementById("department").value.trim();
  let fee = document.getElementById("fee").value.trim();
  let timeSlots = getSelectedTimeSlots(); // e.g. ["08:00", "08:30", "09:00"]
  let timeRanges = groupTimeSlotsToRanges(timeSlots); // [{start, end}, ...]

  const doctor = { name, department: dept, timeSlots: timeRanges, fee };

  if (editingDoctorId) {
    await handleUpdateDoctor(editingDoctorId, doctor);
    editingDoctorId = null;
    doctorForm.querySelector("button[type='submit']").innerText = "Add Doctor";
  } else {
    await handleAddDoctor(doctor);
  }

  doctorForm.reset();
  document.querySelectorAll(".time-checkbox").forEach(cb => cb.checked = false);
};

// Populate form and doctor list on load
window.addEventListener("DOMContentLoaded", () => {
  generateTimeSlots();
  updateDoctorList();
});

// API helpers
async function getDoctors() {
  const response = await fetch('http://localhost:5000/api/doctors');
  return response.json();
}

async function addDoctor(doctor) {
  const response = await fetch('http://localhost:5000/api/doctors', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(doctor)
  });
  return response.json();
}

async function updateDoctor(id, doctor) {
  const response = await fetch(`http://localhost:5000/api/doctors/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(doctor)
  });
  return response.json();
}

async function deleteDoctor(id) {
  const response = await fetch(`http://localhost:5000/api/doctors/${id}`, {
    method: 'DELETE'
  });
  return response.json();
}

// Add doctor
async function handleAddDoctor(doctor) {
  try {
    await addDoctor(doctor);
    await updateDoctorList();
  } catch (err) {
    alert("Error adding doctor: " + err.message);
  }
}

// Update doctor
async function handleUpdateDoctor(id, doctor) {
  try {
    await updateDoctor(id, doctor);
    await updateDoctorList();
  } catch (err) {
    alert("Error updating doctor: " + err.message);
  }
}

// Delete doctor
async function handleDeleteDoctor(id) {
  try {
    await deleteDoctor(id);
    await updateDoctorList();
  } catch (err) {
    alert("Error deleting doctor: " + err.message);
  }
}

