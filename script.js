const FIREBASE_URL = "https://iot-series-cc5a7-default-rtdb.firebaseio.com/motion_data.json";

// Listen for real-time updates using EventSource (Firebase REST streaming)
function listenForRealtimeUpdates() {
  const eventSource = new EventSource(
    "https://iot-series-cc5a7-default-rtdb.firebaseio.com/motion_data.json"
  );

  eventSource.onmessage = function () {
    fetchMotionData();
  };

  eventSource.onerror = function (err) {
    console.error("Realtime connection error:", err);
    eventSource.close();
    // Optionally, try to reconnect after a delay
    setTimeout(listenForRealtimeUpdates, 5000);
  };
}

async function fetchMotionData() {
  try {
    const res = await fetch(FIREBASE_URL);
    const data = await res.json();
    const tbody = document.getElementById("motionData");
    tbody.innerHTML = "";

    if (!data) {
      tbody.innerHTML = "<tr><td colspan='2'>No data available.</td></tr>";
      return;
    }

    const entries = Object.entries(data)
      .map(([id, value]) => ({ id, ...value }))
      .sort((a, b) => b.timestamp - a.timestamp); // newest first

    for (let entry of entries) {
      const row = document.createElement("tr");

      const timeCell = document.createElement("td");
      if (entry.timestamp && !isNaN(entry.timestamp)) {
        // If your timestamps are in seconds, use * 1000
        timeCell.textContent = new Date(entry.timestamp * 1000).toLocaleString();
      } else {
        timeCell.textContent = "N/A";
      }

      const statusCell = document.createElement("td");
      statusCell.textContent = entry.motion;

      row.appendChild(timeCell);
      row.appendChild(statusCell);
      tbody.appendChild(row);
    }
  } catch (err) {
    console.error("Failed to fetch motion data:", err);
    document.getElementById("motionData").innerHTML =
      "<tr><td colspan='2'>Error loading data.</td></tr>";
  }
}

// Initial fetch
fetchMotionData();
// Start listening for real-time updates
listenForRealtimeUpdates();