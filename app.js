let gasTimeTotal = 15 * 60; 
let gasTimeLeft = gasTimeTotal;
let gasInterval = null;
let isGasTimerRunning = false;

let appointments = [];
let medications = [];

const alarmAudio = document.getElementById('alarmSound');

// --- GAS TIMER LOGIC ---
function adjustTime(minutes) {
  if (isGasTimerRunning) return; 
  gasTimeTotal += minutes * 60;
  if (gasTimeTotal > 3599) gasTimeTotal = 3599; 
  gasTimeLeft = gasTimeTotal;
  updateTimerDisplay();
}

function resetTimerValue() {
  if (isGasTimerRunning) return;
  gasTimeTotal = 15 * 60; 
  gasTimeLeft = gasTimeTotal;
  updateTimerDisplay();
}

function updateTimerDisplay() {
  const display = document.getElementById('timerDisplay');
  let mins = Math.floor(gasTimeLeft / 60);
  let secs = gasTimeLeft % 60;
  display.innerText = `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

function toggleGasTimer() {
  const btn = document.getElementById('gasBtn');
  const display = document.getElementById('timerDisplay');
  
  if (isGasTimerRunning) {
    clearInterval(gasInterval);
    alarmAudio.pause();
    alarmAudio.currentTime = 0;
    gasTimeLeft = gasTimeTotal;
    updateTimerDisplay();
    
    btn.innerText = "START GAS TIMER";
    btn.style.backgroundColor = "#e74c3c";
    isGasTimerRunning = false;
  } else {
    isGasTimerRunning = true;
    btn.innerText = "🛑 STOP ALARM / RESET";
    btn.style.backgroundColor = "#34495e";
    
    gasInterval = setInterval(() => {
      gasTimeLeft--;
      updateTimerDisplay();
      
      if (gasTimeLeft <= 0) {
        clearInterval(gasInterval);
        alarmAudio.play().catch(e => console.log("Audio unlock required")); 
        display.innerText = "⚠️ OFF THE GAS!";
      }
    }, 1000);
  }
}

// --- MEDICINE ALARM LOGIC ---
function addMedicineAlarm() {
  const medName = document.getElementById('medName').value.trim() || "Medicine";
  const medTime = document.getElementById('medTime').value;
  
  if (!medTime) {
    alert("Please set a time for your medicine!");
    return;
  }
  
  medications.push({ name: medName, time: medTime });
  
  renderSchedule();
  alert(`💊 Alarm set for ${medName}!`);
  document.getElementById('medName').value = '';
  document.getElementById('medTime').value = '';
}

// --- MULTI-OPTION APPOINTMENT LOGIC ---
function addAppointment() {
  const dateInput = document.getElementById('appDate').value;
  const appType = document.getElementById('appType').value;
  const priority = document.querySelector('input[name="priority"]:checked').value;
  
  if (!dateInput) {
    alert("Please select a date and time first!");
    return;
  }

  appointments.push({
    time: new Date(dateInput),
    type: appType,
    priority: priority
  });
  
  renderSchedule();
  alert("Event Saved Successfully!");
  document.getElementById('appDate').value = ''; 
}

// --- RENDER COMBINED SCHEDULE LIST ---
function renderSchedule() {
  const list = document.getElementById('appointmentList');
  list.innerHTML = '';
  
  if (appointments.length === 0 && medications.length === 0) {
    list.innerHTML = '<p class="no-apps">No upcoming events or medications scheduled.</p>';
    return;
  }
  
  medications.forEach((med) => {
    const item = document.createElement('div');
    item.className = 'appointment-item priority-med';
    item.innerHTML = `
      <div style="font-size: 1rem; text-transform: uppercase; margin-bottom: 5px; color: #8e44ad; font-weight: bold;">💊 Daily Medicine Alarm</div>
      Take: <strong>${med.name}</strong> at ⏰ ${med.time}
    `;
    list.appendChild(item);
  });

  appointments.forEach((app) => {
    let priorityLabel = "🟢 Routine / Casual";
    if (app.priority === 'urgent') priorityLabel = "🟡 Urgent / Important";
    if (app.priority === 'emergency') priorityLabel = "🔴 Critical / Treatment";

    const item = document.createElement('div');
    item.className = `appointment-item priority-${app.priority}`;
    item.innerHTML = `
      <div style="font-size: 1rem; text-transform: uppercase; margin-bottom: 5px; opacity: 0.9; font-weight: bold;">${priorityLabel}</div>
      ${app.type}: ${app.time.toLocaleDateString()} at ${app.time.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
    `;
    list.appendChild(item);
  });
}

// --- BACKGROUND CHECKER ---
setInterval(() => {
  const now = new Date();
  const currentHours = String(now.getHours()).padStart(2, '0');
  const currentMinutes = String(now.getMinutes()).padStart(2, '0');
  const currentTimeString = `${currentHours}:${currentMinutes}`;
  
  medications.forEach((med) => {
    if (currentTimeString === med.time && now.getSeconds() === 0) {
      alarmAudio.play().catch(e => console.log("Waiting for user tap"));
      alert(`⏰ MEDICINE ALARM FOR AGNES:\nTime to take your [ ${med.name} ]!`);
    }
  });

  appointments.forEach((app) => {
    if (
      now.getFullYear() === app.time.getFullYear() &&
      now.getMonth() === app.time.getMonth() &&
      now.getDate() === app.time.getDate() &&
      now.getHours() === app.time.getHours() &&
      now.getMinutes() === app.time.getMinutes() &&
      now.getSeconds() === 0 
    ) {
      alarmAudio.play().catch(e => console.log("Waiting for user tap"));
      alert(`⏰ AGNES GUARD REMINDER:\nYour scheduled event [ ${app.type} ] starts now!`);
    }
  });
}, 1000);
