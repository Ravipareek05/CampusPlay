document.addEventListener("DOMContentLoaded", async () => {
  const user = JSON.parse(localStorage.getItem("campusPlayUser") || "{}");

  if (user?.name) {
    document.getElementById("user-name").textContent = user.name;
    const initials = user.name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
    document.getElementById("user-initials").textContent = initials;
  }

  if (user?.role === "admin") {
    document.getElementById("statsAdminPanel").style.display = "block";
  }

  const tableBody = document.getElementById("statsTableBody");
  const sumPlayers = document.getElementById("sumPlayers");
  const sumWinRate = document.getElementById("sumWinRate");
  const sumKD = document.getElementById("sumKD");
  const sumTopRating = document.getElementById("sumTopRating");

  const filterGame = document.getElementById("statsFilterGame");
  const filterCampus = document.getElementById("statsFilterCampus");

  async function fetchStats() {
    const q = new URLSearchParams();
    if (filterGame.value) q.set("game", filterGame.value);
    if (filterCampus.value) q.set("campus", filterCampus.value);

    try {
      const res = await fetch("/api/stats?" + q.toString());
      const data = await res.json();
      renderStats(data);
    } catch (error) {
      console.error("Error fetching stats:", error);
      tableBody.innerHTML = `<tr><td colspan="8" class="small-muted">Error loading stats</td></tr>`;
    }
  }

  function renderStats(data) {
    sumPlayers.textContent = data.length || 0;

    if (!data.length) {
      tableBody.innerHTML = `<tr><td colspan="8" class="small-muted">No records found</td></tr>`;
      sumWinRate.textContent = "0%";
      sumKD.textContent = "0.00";
      sumTopRating.textContent = "0";
      return;
    }

    let winTotal = 0,
      kdTotal = 0,
      top = 0;

    data.forEach((x) => {
      const mp = Number(x.matchesPlayed || 0);
      const w = Number(x.wins || 0);
      const k = Number(x.kills || 0);
      const d = Number(x.deaths || 0);

      winTotal += mp ? (w / mp) * 100 : 0;
      kdTotal += k / Math.max(1, d);
      top = Math.max(top, Number(x.rating || 0));
    });

    sumWinRate.textContent = (winTotal / data.length).toFixed(1) + "%";
    sumKD.textContent = (kdTotal / data.length).toFixed(2);
    sumTopRating.textContent = top;

    tableBody.innerHTML = data
      .map((x) => {
        const mp = x.matchesPlayed || 0;
        const w = x.wins || 0;
        const winpct = mp ? ((w / mp) * 100).toFixed(1) : "0.0";
        const kd = (x.kills / Math.max(1, x.deaths)).toFixed(2);

        return `
      <tr>
        <td>${x.playerName || x.playerId}</td>
        <td>${x.campus || "-"}</td>
        <td>${x.game || "-"}</td>
        <td class="center">${mp}</td>
        <td class="center">${w}</td>
        <td class="center">${winpct}%</td>
        <td class="center">${kd}</td>
        <td class="center">${x.rating || 0}</td>
      </tr>`;
      })
      .join("");
  }

  document.getElementById("statsApplyBtn").onclick = fetchStats;
  document.getElementById("statsResetBtn").onclick = () => {
    filterGame.value = "";
    filterCampus.value = "";
    fetchStats();
  };

  const statsCsvFile = document.getElementById("statsCsvFile");
  const previewBtn = document.getElementById("statsParsePreviewBtn");
  const uploadBtn = document.getElementById("statsUploadBtn");
  const previewWrap = document.getElementById("statsPreviewWrap");
  const previewMsg = document.getElementById("statsPreviewMsg");

  function loadPapa() {
    return new Promise((resolve) => {
      if (window.Papa) return resolve();
      const s = document.createElement("script");
      s.src = "https://cdn.jsdelivr.net/npm/papaparse@5.4.1/papaparse.min.js";
      s.onload = resolve;
      document.head.appendChild(s);
    });
  }

  previewBtn.onclick = async () => {
    const f = statsCsvFile.files[0];
    if (!f) {
      previewMsg.textContent = "Please select a CSV file";
      return;
    }

    await loadPapa();

    Papa.parse(f, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const rows = results.data;
        if (!rows.length) {
          previewMsg.textContent = "CSV file is empty";
          return;
        }

        let html = `<table class="stats-table"><thead><tr>`;
        Object.keys(rows[0]).forEach((h) => (html += `<th>${h}</th>`));
        html += `</tr></thead><tbody>`;

        rows.forEach((r) => {
          html += `<tr>`;
          Object.values(r).forEach((v) => (html += `<td>${v}</td>`));
          html += `</tr>`;
        });

        html += `</tbody></table>`;

        previewWrap.innerHTML = html;
        previewMsg.textContent = "";
        uploadBtn.disabled = false;
      },
    });
  };

  uploadBtn.onclick = async () => {
    const f = statsCsvFile.files[0];
    if (!f) return;

    const form = new FormData();
    form.append("file", f);

    previewMsg.textContent = "Uploading...";

    try {
      const res = await fetch("/api/stats/upload-csv", {
        method: "POST",
        body: form,
        headers: { "x-admin": "true" },
      });

      const data = await res.json();

      if (!res.ok) {
        previewMsg.textContent = "Upload failed: " + data.error;
        return;
      }

      previewMsg.textContent = "Upload successful!";
      fetchStats();
    } catch (error) {
      previewMsg.textContent = "Upload error: " + error.message;
    }
  };

  const manualForm = document.getElementById("statsManualForm");
  const adminMsg = document.getElementById("statsAdminMsg");

  manualForm.onsubmit = async (e) => {
    e.preventDefault();

    const fd = new FormData(manualForm);
    const obj = Object.fromEntries(fd.entries());

    [
      "matchesPlayed",
      "wins",
      "losses",
      "kills",
      "deaths",
      "assists",
      "avgRank",
      "rating",
    ].forEach((k) => {
      if (obj[k] !== "") obj[k] = Number(obj[k]);
    });

    try {
      const res = await fetch("/api/stats", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin": "true",
        },
        body: JSON.stringify(obj),
      });

      const data = await res.json();

      if (!res.ok) {
        adminMsg.textContent = "Error: " + data.error;
        return;
      }

      adminMsg.textContent = "Stats saved successfully!";
      manualForm.reset();
      fetchStats();

      setTimeout(() => {
        adminMsg.textContent = "";
      }, 3000);
    } catch (error) {
      adminMsg.textContent = "Error: " + error.message;
    }
  };

  fetchStats();
});     