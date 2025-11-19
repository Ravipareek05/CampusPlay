// const LOCAL_CSV_URL = "csv/stats.csv";

// document.addEventListener("DOMContentLoaded", async () => {
//   const user = JSON.parse(localStorage.getItem("campusPlayUser") || "{}");

//   if (user?.name) {
//     document.getElementById("user-name").textContent = user.name;
//     const initials = user.name
//       .split(" ")
//       .map((n) => n[0])
//       .join("")
//       .toUpperCase();
//     document.getElementById("user-initials").textContent = initials;
//   }

//   if (user?.role === "admin") {
//     document.getElementById("statsAdminPanel").style.display = "block";
//   }

//   const tableBody = document.getElementById("statsTableBody");
//   const sumPlayers = document.getElementById("sumPlayers");
//   const sumWinRate = document.getElementById("sumWinRate");
//   const sumKD = document.getElementById("sumKD");
//   const sumTopRating = document.getElementById("sumTopRating");

//   const filterGame = document.getElementById("statsFilterGame");
//   const filterCampus = document.getElementById("statsFilterCampus");

//   async function fetchStats() {
//     const q = new URLSearchParams();
//     if (filterGame.value) q.set("game", filterGame.value);
//     if (filterCampus.value) q.set("campus", filterCampus.value);

//     try {
//       const res = await fetch("/api/stats?" + q.toString());
//       const data = await res.json();
//       renderStats(data);
//     } catch (error) {
//       console.error("Error fetching stats:", error);
//       tableBody.innerHTML = `<tr><td colspan="8" class="small-muted">Error loading stats</td></tr>`;
//     }
//   }

//   function renderStats(data) {
//     sumPlayers.textContent = data.length || 0;

//     if (!data.length) {
//       tableBody.innerHTML = `<tr><td colspan="8" class="small-muted">No records found</td></tr>`;
//       sumWinRate.textContent = "0%";
//       sumKD.textContent = "0.00";
//       sumTopRating.textContent = "0";
//       return;
//     }

//     let winTotal = 0,
//       kdTotal = 0,
//       top = 0;

//     data.forEach((x) => {
//       const mp = Number(x.matchesPlayed || 0);
//       const w = Number(x.wins || 0);
//       const k = Number(x.kills || 0);
//       const d = Number(x.deaths || 0);

//       winTotal += mp ? (w / mp) * 100 : 0;
//       kdTotal += k / Math.max(1, d);
//       top = Math.max(top, Number(x.rating || 0));
//     });

//     sumWinRate.textContent = (winTotal / data.length).toFixed(1) + "%";
//     sumKD.textContent = (kdTotal / data.length).toFixed(2);
//     sumTopRating.textContent = top;

//     tableBody.innerHTML = data
//       .map((x) => {
//         const mp = x.matchesPlayed || 0;
//         const w = x.wins || 0;
//         const winpct = mp ? ((w / mp) * 100).toFixed(1) : "0.0";
//         const kd = (x.kills / Math.max(1, x.deaths)).toFixed(2);

//         return `
//       <tr>
//         <td>${x.playerName || x.playerId}</td>
//         <td>${x.campus || "-"}</td>
//         <td>${x.game || "-"}</td>
//         <td class="center">${mp}</td>
//         <td class="center">${w}</td>
//         <td class="center">${winpct}%</td>
//         <td class="center">${kd}</td>
//         <td class="center">${x.rating || 0}</td>
//       </tr>`;
//       })
//       .join("");
//   }

//   document.getElementById("statsApplyBtn").onclick = fetchStats;
//   document.getElementById("statsResetBtn").onclick = () => {
//     filterGame.value = "";
//     filterCampus.value = "";
//     fetchStats();
//   };

//   const statsCsvFile = document.getElementById("statsCsvFile");
//   const previewBtn = document.getElementById("statsParsePreviewBtn");
//   const uploadBtn = document.getElementById("statsUploadBtn");
//   const previewWrap = document.getElementById("statsPreviewWrap");
//   const previewMsg = document.getElementById("statsPreviewMsg");

//   function loadPapa() {
//     return new Promise((resolve) => {
//       if (window.Papa) return resolve();
//       const s = document.createElement("script");
//       s.src = "https://cdn.jsdelivr.net/npm/papaparse@5.4.1/papaparse.min.js";
//       s.onload = resolve;
//       document.head.appendChild(s);
//     });
//   }

//   previewBtn.onclick = async () => {
//     const f = statsCsvFile.files[0];
//     if (!f) {
//       previewMsg.textContent = "Please select a CSV file";
//       return;
//     }

//     await loadPapa();

//     Papa.parse(f, {
//       header: true,
//       skipEmptyLines: true,
//       complete: (results) => {
//         const rows = results.data;
//         if (!rows.length) {
//           previewMsg.textContent = "CSV file is empty";
//           return;
//         }

//         let html = `<table class="stats-table"><thead><tr>`;
//         Object.keys(rows[0]).forEach((h) => (html += `<th>${h}</th>`));
//         html += `</tr></thead><tbody>`;

//         rows.forEach((r) => {
//           html += `<tr>`;
//           Object.values(r).forEach((v) => (html += `<td>${v}</td>`));
//           html += `</tr>`;
//         });

//         html += `</tbody></table>`;

//         previewWrap.innerHTML = html;
//         previewMsg.textContent = "";
//         uploadBtn.disabled = false;
//       },
//     });
//   };

//   uploadBtn.onclick = async () => {
//     const f = statsCsvFile.files[0];
//     if (!f) return;

//     const form = new FormData();
//     form.append("file", f);

//     previewMsg.textContent = "Uploading...";

//     try {
//       const res = await fetch("/api/stats/upload-csv", {
//         method: "POST",
//         body: form,
//         headers: { "x-admin": "true" },
//       });

//       const data = await res.json();

//       if (!res.ok) {
//         previewMsg.textContent = "Upload failed: " + data.error;
//         return;
//       }

//       previewMsg.textContent = "Upload successful!";
//       fetchStats();
//     } catch (error) {
//       previewMsg.textContent = "Upload error: " + error.message;
//     }
//   };

//   const manualForm = document.getElementById("statsManualForm");
//   const adminMsg = document.getElementById("statsAdminMsg");

//   manualForm.onsubmit = async (e) => {
//     e.preventDefault();

//     const fd = new FormData(manualForm);
//     const obj = Object.fromEntries(fd.entries());

//     [
//       "matchesPlayed",
//       "wins",
//       "losses",
//       "kills",
//       "deaths",
//       "assists",
//       "avgRank",
//       "rating",
//     ].forEach((k) => {
//       if (obj[k] !== "") obj[k] = Number(obj[k]);
//     });

//     try {
//       const res = await fetch("/api/stats", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           "x-admin": "true",
//         },
//         body: JSON.stringify(obj),
//       });

//       const data = await res.json();

//       if (!res.ok) {
//         adminMsg.textContent = "Error: " + data.error;
//         return;
//       }

//       adminMsg.textContent = "Stats saved successfully!";
//       manualForm.reset();
//       fetchStats();

//       setTimeout(() => {
//         adminMsg.textContent = "";
//       }, 3000);
//     } catch (error) {
//       adminMsg.textContent = "Error: " + error.message;
//     }
//   };

//   fetchStats();
// });     


// client/js/stats.js
// Full stats script with backend-first + local CSV fallback behavior.
// Drop this into your project as js/stats.js

// If you place a static CSV at client/csv/stats.csv, this URL will be used as fallback.
// const LOCAL_CSV_URL = "csv/stats.csv";

// Attempt to read API base from common build-time or runtime places.
// If none provided, API calls use relative /api/* paths.
// const API =
//   (typeof import.meta !== "undefined" && import.meta.env && import.meta.env.VITE_API_BASE_URL) ||
//   (typeof process !== "undefined" && process.env && process.env.REACT_APP_API_BASE_URL) ||
//   (typeof window !== "undefined" && window.__API_BASE__) ||
//   "";

// /** Helper to build API URL. If API is empty, returns relative /api path. */
// function apiUrl(path) {
//   if (!path) path = "";
//   if (!API) {
//     // ensure leading /api
//     return path.startsWith("/") ? `/api${path}` : `/api/${path}`;
//   }
//   const base = API.replace(/\/$/, "");
//   return path.startsWith("/") ? base + path : base + "/" + path;
// }

// /* ---------- Small helpers ---------- */
// function numberOr0(v) {
//   const n = Number(v);
//   return Number.isFinite(n) ? n : 0;
// }
// function escapeHtml(str = "") {
//   return String(str)
//     .replaceAll("&", "&amp;")
//     .replaceAll("<", "&lt;")
//     .replaceAll(">", "&gt;")
//     .replaceAll('"', "&quot;")
//     .replaceAll("'", "&#39;");
// }

// /* ---------- DOM refs ---------- */
// const statsTableBody = document.getElementById("statsTableBody");
// const sumPlayers = document.getElementById("sumPlayers");
// const sumWinRate = document.getElementById("sumWinRate");
// const sumKD = document.getElementById("sumKD");
// const sumTopRating = document.getElementById("sumTopRating");

// const statsFilterGame = document.getElementById("statsFilterGame");
// const statsFilterCampus = document.getElementById("statsFilterCampus");
// const statsApplyBtn = document.getElementById("statsApplyBtn");
// const statsResetBtn = document.getElementById("statsResetBtn");

// const statsAdminPanel = document.getElementById("statsAdminPanel");
// const statsCsvFile = document.getElementById("statsCsvFile");
// const statsParsePreviewBtn = document.getElementById("statsParsePreviewBtn");
// const statsUploadBtn = document.getElementById("statsUploadBtn");
// const statsPreviewMsg = document.getElementById("statsPreviewMsg");
// const statsPreviewWrap = document.getElementById("statsPreviewWrap");

// const statsManualForm = document.getElementById("statsManualForm");
// const statsAdminMsg = document.getElementById("statsAdminMsg");

// /* ---------- PapaParse loader (dynamic) ---------- */
// let papaLoaded = false;
// function loadPapaParse() {
//   return new Promise((resolve, reject) => {
//     if (papaLoaded || window.Papa) {
//       papaLoaded = true;
//       return resolve();
//     }
//     const s = document.createElement("script");
//     s.src = "https://cdn.jsdelivr.net/npm/papaparse@5.4.1/papaparse.min.js";
//     s.onload = () => {
//       papaLoaded = true;
//       resolve();
//     };
//     s.onerror = (e) => reject(new Error("Failed to load PapaParse"));
//     document.head.appendChild(s);
//   });
// }

// /* ---------- Render helpers ---------- */
// function renderStatsTable(rows) {
//   statsTableBody.innerHTML = "";

//   if (!rows || rows.length === 0) {
//     statsTableBody.innerHTML = `<tr><td colspan="8" class="small-muted">No data available</td></tr>`;
//     return;
//   }

//   const html = rows
//     .map((r) => {
//       const mp = numberOr0(r.matchesPlayed ?? r.matches ?? r.matches_played);
//       const w = numberOr0(r.wins ?? r.win);
//       const kills = numberOr0(r.kills ?? r.kills_count);
//       const deaths = numberOr0(r.deaths ?? r.deaths_count);
//       const rating = numberOr0(r.rating ?? r.avgRating ?? r.rated);

//       const winpct = mp ? ((w / mp) * 100).toFixed(1) : "0.0";
//       const kd = deaths ? (kills / deaths).toFixed(2) : (kills ? "∞" : "0.00");

//       return `
//       <tr>
//         <td>${escapeHtml(r.playerName ?? r.player_name ?? r.playerId ?? r.player_id ?? "—")}</td>
//         <td>${escapeHtml(r.campus ?? "—")}</td>
//         <td>${escapeHtml(r.game ?? "—")}</td>
//         <td class="center">${mp}</td>
//         <td class="center">${w}</td>
//         <td class="center">${winpct}%</td>
//         <td class="center">${kd}</td>
//         <td class="center">${rating}</td>
//       </tr>`;
//     })
//     .join("");
//   statsTableBody.innerHTML = html;
// }

// function renderSummary(rows) {
//   if (!rows) rows = [];
//   sumPlayers.textContent = rows.length || 0;

//   if (!rows.length) {
//     sumWinRate.textContent = "0%";
//     sumKD.textContent = "0.00";
//     sumTopRating.textContent = "0";
//     return;
//   }

//   let winAccum = 0;
//   let kdAccum = 0;
//   let kdCount = 0;
//   let top = 0;

//   rows.forEach((r) => {
//     const mp = numberOr0(r.matchesPlayed ?? r.matches ?? r.matches_played);
//     const w = numberOr0(r.wins ?? r.win);
//     const k = numberOr0(r.kills ?? 0);
//     const d = numberOr0(r.deaths ?? 0);
//     const rating = numberOr0(r.rating ?? r.avgRating ?? 0);

//     if (mp) winAccum += (w / mp) * 100;
//     if (d || k) {
//       const kd = d ? k / d : k;
//       if (Number.isFinite(kd)) {
//         kdAccum += kd;
//         kdCount++;
//       }
//     }
//     if (rating > top) top = rating;
//   });

//   const avgWin = rows.length ? (winAccum / rows.length) : 0;
//   const avgKD = kdCount ? (kdAccum / kdCount) : 0;

//   sumWinRate.textContent = `${avgWin.toFixed(1)}%`;
//   sumKD.textContent = avgKD.toFixed(2);
//   sumTopRating.textContent = top;
// }

// function renderStats(rows) {
//   // ensure rows is an array
//   if (!Array.isArray(rows)) rows = [];
//   renderSummary(rows);
//   renderStatsTable(rows);
// }

// /* ---------- Fetching (backend first, CSV fallback) ---------- */
// async function fetchStats() {
//   const q = new URLSearchParams();
//   if (statsFilterGame && statsFilterGame.value) q.set("game", statsFilterGame.value);
//   if (statsFilterCampus && statsFilterCampus.value) q.set("campus", statsFilterCampus.value);

//   // Try backend API first
//   try {
//     const url = apiUrl("/stats?" + q.toString());
//     const res = await fetch(url, { method: "GET", credentials: "include" });
//     if (res.ok) {
//       const data = await res.json();
//       console.log("Loaded stats from backend API");
//       renderStats(data);
//       return;
//     }
//     throw new Error("Backend responded with status " + res.status);
//   } catch (apiErr) {
//     console.warn("Backend fetch failed, falling back to local CSV:", apiErr);
//     // Fallback to static CSV
//     try {
//       await loadPapaParse();
//       const csvText = await fetch(LOCAL_CSV_URL).then((r) => {
//         if (!r.ok) throw new Error("CSV not found: " + r.status);
//         return r.text();
//       });

//       const parsed = Papa.parse(csvText, { header: true, skipEmptyLines: true });
//       let rows = parsed.data || [];

//       // apply client-side filters (case-insensitive)
//       if (statsFilterGame && statsFilterGame.value) {
//         const g = statsFilterGame.value.toLowerCase();
//         rows = rows.filter((r) => (r.game || "").toLowerCase() === g);
//       }
//       if (statsFilterCampus && statsFilterCampus.value) {
//         const c = statsFilterCampus.value.toLowerCase();
//         rows = rows.filter((r) => (r.campus || "").toLowerCase() === c);
//       }

//       console.log("Loaded stats from local CSV");
//       renderStats(rows);
//       return;
//     } catch (csvErr) {
//       console.error("Failed to load local CSV:", csvErr);
//       statsTableBody.innerHTML = `<tr><td colspan="8" class="small-muted">Could not load stats</td></tr>`;
//       sumPlayers.textContent = "0";
//       sumWinRate.textContent = "0%";
//       sumKD.textContent = "0.00";
//       sumTopRating.textContent = "0";
//     }
//   }
// }

// /* ---------- CSV preview + upload (admin) ---------- */
// if (statsParsePreviewBtn) {
//   statsParsePreviewBtn.addEventListener("click", async () => {
//     const f = statsCsvFile && statsCsvFile.files && statsCsvFile.files[0];
//     if (!f) {
//       statsPreviewMsg.textContent = "Please select a CSV file";
//       return;
//     }
//     try {
//       await loadPapaParse();
//       statsPreviewMsg.textContent = "Parsing...";
//       Papa.parse(f, {
//         header: true,
//         skipEmptyLines: true,
//         complete: (results) => {
//           const rows = results.data || [];
//           if (!rows.length) {
//             statsPreviewMsg.textContent = "CSV file is empty";
//             statsPreviewWrap.innerHTML = "";
//             statsUploadBtn.disabled = true;
//             return;
//           }

//           // preview first 12 rows (or less)
//           const sample = rows.slice(0, 12);
//           const cols = Object.keys(sample[0] || {});
//           let html = `<table class="csv-preview-table"><thead><tr>`;
//           cols.forEach((c) => (html += `<th>${escapeHtml(c)}</th>`));
//           html += `</tr></thead><tbody>`;

//           sample.forEach((r) => {
//             html += "<tr>";
//             cols.forEach((c) => (html += `<td>${escapeHtml(r[c] ?? "")}</td>`));
//             html += "</tr>";
//           });

//           html += "</tbody></table>";
//           statsPreviewWrap.innerHTML = html;
//           statsPreviewMsg.textContent = `Previewing ${rows.length} rows (showing ${sample.length})`;
//           statsUploadBtn.disabled = false;
//         },
//         error: (err) => {
//           statsPreviewMsg.textContent = "Parse error: " + err.message;
//           statsPreviewWrap.innerHTML = "";
//           statsUploadBtn.disabled = true;
//         },
//       });
//     } catch (err) {
//       statsPreviewMsg.textContent = "Could not load parser: " + err.message;
//     }
//   });
// }

// if (statsUploadBtn) {
//   statsUploadBtn.addEventListener("click", async () => {
//     const f = statsCsvFile && statsCsvFile.files && statsCsvFile.files[0];
//     if (!f) {
//       statsPreviewMsg.textContent = "No file selected";
//       return;
//     }

//     const fd = new FormData();
//     fd.append("file", f);

//     try {
//       statsUploadBtn.disabled = true;
//       statsUploadBtn.textContent = "Uploading...";
//       const res = await fetch(apiUrl("/stats/upload-csv"), {
//         method: "POST",
//         body: fd,
//         headers: { "x-admin": "true" }, // remove/replace with real auth header in production
//       });

//       const json = await res.json();
//       if (!res.ok) {
//         statsPreviewMsg.textContent = "Upload failed: " + (json.error || res.statusText || "");
//         statsUploadBtn.disabled = false;
//         statsUploadBtn.textContent = "Upload to Database";
//         return;
//       }

//       statsPreviewMsg.textContent = `Upload successful (${json.count || 0} rows). Refreshing...`;
//       statsUploadBtn.textContent = "Upload to Database";
//       await fetchStats();
//       statsUploadBtn.disabled = false;
//     } catch (err) {
//       statsPreviewMsg.textContent = "Upload error: " + err.message;
//       statsUploadBtn.disabled = false;
//       statsUploadBtn.textContent = "Upload to Database";
//     }
//   });
// }

// /* ---------- Manual entry (admin) ---------- */
// if (statsManualForm) {
//   statsManualForm.addEventListener("submit", async (ev) => {
//     ev.preventDefault();
//     const fd = new FormData(statsManualForm);
//     const obj = Object.fromEntries(fd.entries());

//     [
//       "matchesPlayed",
//       "wins",
//       "losses",
//       "kills",
//       "deaths",
//       "assists",
//       "avgRank",
//       "rating",
//     ].forEach((k) => {
//       if (obj[k] !== undefined && obj[k] !== "") obj[k] = numberOr0(obj[k]);
//     });

//     try {
//       const res = await fetch(apiUrl("/stats"), {
//         method: "POST",
//         headers: { "Content-Type": "application/json", "x-admin": "true" },
//         body: JSON.stringify(obj),
//       });
//       const json = await res.json();
//       if (!res.ok) {
//         statsAdminMsg.textContent = "Error: " + (json.error || res.statusText);
//         return;
//       }
//       statsAdminMsg.textContent = "Stats saved successfully!";
//       statsManualForm.reset();
//       await fetchStats();
//       setTimeout(() => (statsAdminMsg.textContent = ""), 3000);
//     } catch (err) {
//       statsAdminMsg.textContent = "Error: " + err.message;
//     }
//   });
// }

// /* ---------- Filters ---------- */
// if (statsApplyBtn) statsApplyBtn.addEventListener("click", fetchStats);
// if (statsResetBtn) statsResetBtn.addEventListener("click", () => {
//   if (statsFilterGame) statsFilterGame.value = "";
//   if (statsFilterCampus) statsFilterCampus.value = "";
//   fetchStats();
// });

// /* ---------- Admin visibility (simple) ---------- */
// /* Shows admin panel if localStorage has campusPlayUser.role === 'admin' */
// (function applyAdminModeFromLocalStorage() {
//   try {
//     const user = JSON.parse(localStorage.getItem("campusPlayUser") || "{}");
//     if (user?.role === "admin") {
//       if (statsAdminPanel) statsAdminPanel.style.display = "block";
//     } else {
//       if (statsAdminPanel) statsAdminPanel.style.display = "none";
//     }
//   } catch (e) {
//     if (statsAdminPanel) statsAdminPanel.style.display = "none";
//   }
// })();

// /* ---------- Init on load ---------- */
// document.addEventListener("DOMContentLoaded", () => {
//   // show user display if exists
//   try {
//     const user = JSON.parse(localStorage.getItem("campusPlayUser") || "{}");
//     if (user?.name) {
//       const elName = document.getElementById("user-name");
//       const elInitials = document.getElementById("user-initials");
//       if (elName) elName.textContent = user.name;
//       if (elInitials) {
//         const initials = user.name.split(" ").map(n => n[0]).join("").toUpperCase();
//         elInitials.textContent = initials;
//       }
//     }
//   } catch (e) {
//     // ignore
//   }

//   // initial load
//   fetchStats();
// });




/********************************************************************
 * FINAL STATS.JS — FULL CSV READER + DYNAMIC TABLE + ALL COLUMNS
 * Supports: bgmi_sat.csv with all fields included
 ********************************************************************/

// const LOCAL_CSV_URL = "csv/bgmi_sat.csv"; // <-- your CSV path

// /* -------- Helper: escape HTML -------- */
// function escapeHtml(str = "") {
//   return String(str)
//     .replace(/&/g, "&amp;")
//     .replace(/</g, "&lt;")
//     .replace(/>/g, "&gt;")
//     .replace(/"/g, "&quot;");
// }

// function setupUserDropdown() {
//   const userRaw = localStorage.getItem("campusPlayUser") || "{}";
//   let user = {};
//   try {
//     user = JSON.parse(userRaw);
//   } catch (e) {
//     user = {};
//   }}
//   // --- populate logged-in user name & initials (reusable) ---
// function populateLoggedInUser() {
//   try {
//     const raw = localStorage.getItem("campusPlayUser");
//     if (!raw) return; // no user

//     const user = JSON.parse(raw || "{}");
//     const nameEl = document.getElementById("user-name");
//     const initialsEl = document.getElementById("user-initials");

//     if (user?.name) {
//       if (nameEl) nameEl.textContent = user.name;

//       if (initialsEl) {
//         const initials = user.name
//           .split(" ")
//           .map((n) => n && n[0])
//           .filter(Boolean)
//           .slice(0, 2)
//           .join("")
//           .toUpperCase();
//         initialsEl.textContent = initials;
//       }
//     } else {
//       // fallback if not logged in
//       if (nameEl) nameEl.textContent = "";
//       if (initialsEl) initialsEl.textContent = "G";
//     }
//   } catch (err) {
//     console.warn("populateLoggedInUser:", err);
//   }
// }


// /* -------- Elements -------- */
// const tableBody = document.getElementById("statsTableBody");
// const sumPlayers = document.getElementById("sumPlayers");
// const sumWinRate = document.getElementById("sumWinRate");
// const sumKD = document.getElementById("sumKD");
// const sumTopRating = document.getElementById("sumTopRating");

// const filterGame = document.getElementById("statsFilterGame");
// const filterCampus = document.getElementById("statsFilterCampus");

// const uploadBtn = document.getElementById("statsUploadBtn");
// const previewBtn = document.getElementById("statsParsePreviewBtn");
// const csvFileInput = document.getElementById("statsCsvFile");
// const previewWrap = document.getElementById("statsPreviewWrap");
// const previewMsg = document.getElementById("statsPreviewMsg");

// /* -------- Load PapaParse -------- */
// function loadPapa() {
//   return new Promise((resolve) => {
//     if (window.Papa) return resolve();
//     const s = document.createElement("script");
//     s.src = "https://cdn.jsdelivr.net/npm/papaparse@5.4.1/papaparse.min.js";
//     s.onload = resolve;
//     document.head.appendChild(s);
//   });
// }

// /* -------- MAIN — Load CSV and show stats -------- */
// async function fetchStats() {
//   try {
//     await loadPapa();
//     const csvText = await fetch(LOCAL_CSV_URL).then((r) => r.text());
//     let rows = Papa.parse(csvText, { header: true, skipEmptyLines: true }).data;

//     if (!rows || !rows.length) {
//       tableBody.innerHTML = `<tr><td colspan="50">No records found</td></tr>`;
//       return;
//     }

//     // Inject mandatory fields that were missing
//     rows = rows.map((r) => ({
//       ...r,
//       game: "BGMI",
//       campus: "-",
//     }));

//     // Apply Game & Campus filters
//     if (filterGame.value) {
//       rows = rows.filter((r) => (r.game || "").toLowerCase() === filterGame.value.toLowerCase());
//     }
//     if (filterCampus.value) {
//       rows = rows.filter((r) => (r.campus || "").toLowerCase() === filterCampus.value.toLowerCase());
//     }

//     renderStats(rows);
//   } catch (err) {
//     console.error("CSV load error:", err);
//     tableBody.innerHTML = `<tr><td colspan="50">Error loading CSV file</td></tr>`;
//   }
// }

// /* -------- Render Stats Summary + Table with ALL CSV COLUMNS -------- */
// function renderStats(rows) {
//   if (!rows.length) {
//     tableBody.innerHTML = `<tr><td colspan="50">No records</td></tr>`;
//     return;
//   }

//   // -------- SUMMARY CARDS --------
//   sumPlayers.textContent = rows.length;

//   const avgWin = average(rows.map((r) => Number(r.Wins || 0)));
//   const avgKD = average(
//     rows.map((r) => {
//       const k = Number(r.Kills || 0);
//       const d = Number(r.Deaths || 0);
//       return d === 0 ? k : k / d;
//     })
//   );
//   const topRating = mostCommonRank(rows);

//   sumWinRate.textContent = avgWin.toFixed(1) + "%";
//   sumKD.textContent = avgKD.toFixed(2);
//   sumTopRating.textContent = topRating;

//   // -------- TABLE HEADERS --------
//   const columns = Object.keys(rows[0]);

//   let headerHTML = "<tr>";
//   columns.forEach((col) => (headerHTML += `<th>${escapeHtml(col)}</th>`));
//   headerHTML += "</tr>";

//   // Replace table headers
//   document.querySelector(".stats-table thead").innerHTML = headerHTML;

//   // -------- TABLE BODY --------
//   tableBody.innerHTML = rows
//     .map((row) => {
//       let rowHTML = "<tr>";
//       columns.forEach((col) => {
//         rowHTML += `<td>${escapeHtml(row[col])}</td>`;
//       });
//       rowHTML += "</tr>";
//       return rowHTML;
//     })
//     .join("");
// }

// /* -------- Utility: Average -------- */
// function average(arr) {
//   arr = arr.filter((v) => !isNaN(v));
//   if (!arr.length) return 0;
//   return arr.reduce((a, b) => a + b, 0) / arr.length;
// }

// /* -------- Utility: Most Common Rank -------- */
// function mostCommonRank(rows) {
//   const freq = {};
//   rows.forEach((r) => {
//     const rank = r.Rank || "Unranked";
//     freq[rank] = (freq[rank] || 0) + 1;
//   });

//   return Object.entries(freq).sort((a, b) => b[1] - a[1])[0][0];
// }

// /* -------- Filter Buttons -------- */
// document.getElementById("statsApplyBtn").onclick = fetchStats;
// document.getElementById("statsResetBtn").onclick = () => {
//   filterGame.value = "";
//   filterCampus.value = "";
//   fetchStats();
// };

// /* -------- CSV Preview (Admin) -------- */
// previewBtn.onclick = async () => {
//   const f = csvFileInput.files[0];
//   if (!f) return (previewMsg.textContent = "No file selected");

//   await loadPapa();
//   Papa.parse(f, {
//     header: true,
//     skipEmptyLines: true,
//     complete: (r) => {
//       const rows = r.data;
//       if (!rows.length) {
//         previewMsg.textContent = "CSV is empty.";
//         return;
//       }

//       previewMsg.textContent = "Preview loaded";
//       let html = "<table><tr>";

//       // Headers
//       Object.keys(rows[0]).forEach((h) => (html += `<th>${escapeHtml(h)}</th>`));
//       html += "</tr>";

//       // First 10 rows
//       rows.slice(0, 10).forEach((row) => {
//         html += "<tr>";
//         Object.values(row).forEach((v) => (html += `<td>${escapeHtml(v)}</td>`));
//         html += "</tr>";
//       });

//       html += "</table>";
//       previewWrap.innerHTML = html;

//       uploadBtn.disabled = false;
//     },
//   });
// };

// /* -------- Simulated Upload (Since you don’t use backend now) -------- */
// uploadBtn.onclick = () => {
//   previewMsg.textContent = "Since CSV loads directly, upload is not required.";
// };

// /* -------- INITIAL LOAD -------- */
// // document.addEventListener("DOMContentLoaded", fetchStats);

// document.addEventListener("DOMContentLoaded", () => {
//   populateLoggedInUser();   // <-- add this line
//   setupUserDropdown && setupUserDropdown(); // if you have that function
//   fetchStats();
// });




const LOCAL_CSV_URL = "csv/bgmi_sat.csv"; // <-- your CSV path

/* -------- Helper: escape HTML -------- */
function escapeHtml(str = "") {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/* -------- Setup user dropdown & admin visibility (fixed) -------- */
function setupUserDropdown() {
  let user = {};
  try {
    const userRaw = localStorage.getItem("campusPlayUser") || "{}";
    user = JSON.parse(userRaw);
  } catch (e) {
    user = {};
  }

  // populate name + initials if those elements exist
  const nameEl = document.getElementById("user-name");
  const initialsEl = document.getElementById("user-initials");
  if (user?.name) {
    if (nameEl) nameEl.textContent = user.name;
    if (initialsEl) {
      const initials = user.name
        .split(" ")
        .map((n) => n && n[0])
        .filter(Boolean)
        .slice(0, 2)
        .join("")
        .toUpperCase();
      initialsEl.textContent = initials;
    }
  } else {
    if (nameEl) nameEl.textContent = "";
    if (initialsEl) initialsEl.textContent = "G";
  }

  // show admin panel if role === "admin"
  try {
    if (user?.role === "admin") {
      const panel = document.getElementById("statsAdminPanel");
      if (panel) panel.style.display = "block";
    }
  } catch (e) {
    /* ignore */
  }

  // Add a simple logout button handler if an element with id logoutBtn exists inside page
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", (ev) => {
      ev.preventDefault();
      localStorage.removeItem("campusPlayUser");
      localStorage.removeItem("token");
      window.location.href = "login.html";
    });
  }
}

/* -------- Elements -------- */
const tableBody = document.getElementById("statsTableBody");
const sumPlayers = document.getElementById("sumPlayers");
const sumWinRate = document.getElementById("sumWinRate");
const sumKD = document.getElementById("sumKD");
const sumTopRating = document.getElementById("sumTopRating");

const filterGame = document.getElementById("statsFilterGame");
const filterCampus = document.getElementById("statsFilterCampus");

const uploadBtn = document.getElementById("statsUploadBtn");
const previewBtn = document.getElementById("statsParsePreviewBtn");
const csvFileInput = document.getElementById("statsCsvFile");
const previewWrap = document.getElementById("statsPreviewWrap");
const previewMsg = document.getElementById("statsPreviewMsg");

/* -------- Load PapaParse -------- */
function loadPapa() {
  return new Promise((resolve) => {
    if (window.Papa) return resolve();
    const s = document.createElement("script");
    s.src = "https://cdn.jsdelivr.net/npm/papaparse@5.4.1/papaparse.min.js";
    s.onload = resolve;
    document.head.appendChild(s);
  });
}

/* -------- MAIN — Load CSV and show stats -------- */
async function fetchStats() {
  try {
    await loadPapa();
    const csvText = await fetch(LOCAL_CSV_URL).then((r) => {
      if (!r.ok) throw new Error("CSV not found: " + r.status);
      return r.text();
    });
    let rows = Papa.parse(csvText, { header: true, skipEmptyLines: true }).data;

    if (!rows || !rows.length) {
      if (tableBody) tableBody.innerHTML = `<tr><td colspan="50">No records found</td></tr>`;
      return;
    }

    // Inject mandatory fields that were missing
    rows = rows.map((r) => ({
      ...r,
      game: r.game || "BGMI",
      campus: r.campus || "-",
    }));

    // Apply Game & Campus filters (if present)
    if (filterGame && filterGame.value) {
      rows = rows.filter((r) => (r.game || "").toLowerCase() === filterGame.value.toLowerCase());
    }
    if (filterCampus && filterCampus.value) {
      rows = rows.filter((r) => (r.campus || "").toLowerCase() === filterCampus.value.toLowerCase());
    }

    renderStats(rows);
  } catch (err) {
    console.error("CSV load error:", err);
    if (tableBody) tableBody.innerHTML = `<tr><td colspan="50">Error loading CSV file</td></tr>`;
  }
}

/* -------- Render Stats Summary + Table with ALL CSV COLUMNS -------- */
function renderStats(rows) {
  if (!rows || !rows.length) {
    if (tableBody) tableBody.innerHTML = `<tr><td colspan="50">No records</td></tr>`;
    if (sumPlayers) sumPlayers.textContent = "0";
    if (sumWinRate) sumWinRate.textContent = "0%";
    if (sumKD) sumKD.textContent = "0.00";
    if (sumTopRating) sumTopRating.textContent = "0";
    return;
  }

  // -------- SUMMARY CARDS --------
  if (sumPlayers) sumPlayers.textContent = rows.length;

  const avgWin = average(rows.map((r) => Number(r.Wins || 0)));
  const avgKD = average(
    rows.map((r) => {
      const k = Number(r.Kills || 0);
      const d = Number(r.Deaths || 0);
      return d === 0 ? k : k / d;
    })
  );
  const topRating = mostCommonRank(rows);

  if (sumWinRate) sumWinRate.textContent = avgWin.toFixed(1) + "%";
  if (sumKD) sumKD.textContent = avgKD.toFixed(2);
  if (sumTopRating) sumTopRating.textContent = topRating;

  // -------- TABLE HEADERS --------
  const columns = Object.keys(rows[0] || {});
  let headerHTML = "<tr>";
  columns.forEach((col) => (headerHTML += `<th>${escapeHtml(col)}</th>`));
  headerHTML += "</tr>";

  const thead = document.querySelector(".stats-table thead");
  if (thead) thead.innerHTML = headerHTML;

  // -------- TABLE BODY --------
  if (tableBody) {
    tableBody.innerHTML = rows
      .map((row) => {
        let rowHTML = "<tr>";
        columns.forEach((col) => {
          rowHTML += `<td>${escapeHtml(row[col] ?? "")}</td>`;
        });
        rowHTML += "</tr>";
        return rowHTML;
      })
      .join("");
  }
}

/* -------- Utility: Average -------- */
function average(arr) {
  arr = arr.map((v) => Number(v)).filter((v) => !isNaN(v));
  if (!arr.length) return 0;
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

/* -------- Utility: Most Common Rank -------- */
function mostCommonRank(rows) {
  const freq = {};
  rows.forEach((r) => {
    const rank = r.Rank || r.rank || "Unranked";
    freq[rank] = (freq[rank] || 0) + 1;
  });
  const sorted = Object.entries(freq).sort((a, b) => b[1] - a[1]);
  return sorted.length ? sorted[0][0] : "—";
}

/* -------- Filter Buttons -------- */
const applyBtn = document.getElementById("statsApplyBtn");
const resetBtn = document.getElementById("statsResetBtn");
if (applyBtn) applyBtn.onclick = fetchStats;
if (resetBtn)
  resetBtn.onclick = () => {
    if (filterGame) filterGame.value = "";
    if (filterCampus) filterCampus.value = "";
    fetchStats();
  };

/* -------- CSV Preview (Admin) -------- */
if (previewBtn) {
  previewBtn.onclick = async () => {
    const f = csvFileInput && csvFileInput.files && csvFileInput.files[0];
    if (!f) return (previewMsg.textContent = "No file selected");

    await loadPapa();
    Papa.parse(f, {
      header: true,
      skipEmptyLines: true,
      complete: (r) => {
        const rows = r.data;
        if (!rows.length) {
          previewMsg.textContent = "CSV is empty.";
          return;
        }

        previewMsg.textContent = "Preview loaded";
        let html = "<table><tr>";
        Object.keys(rows[0]).forEach((h) => (html += `<th>${escapeHtml(h)}</th>`));
        html += "</tr>";
        rows.slice(0, 10).forEach((row) => {
          html += "<tr>";
          Object.values(row).forEach((v) => (html += `<td>${escapeHtml(v)}</td>`));
          html += "</tr>";
        });
        html += "</table>";
        if (previewWrap) previewWrap.innerHTML = html;
        if (uploadBtn) uploadBtn.disabled = false;
      },
      error: (err) => {
        if (previewMsg) previewMsg.textContent = "Parse error: " + err.message;
        if (previewWrap) previewWrap.innerHTML = "";
        if (uploadBtn) uploadBtn.disabled = true;
      },
    });
  };
}

/* -------- Simulated Upload (Since you don’t use backend now) -------- */
if (uploadBtn) {
  uploadBtn.onclick = () => {
    if (previewMsg) previewMsg.textContent = "Since CSV loads directly, upload is not required.";
  };
}

/* -------- INITIAL LOAD -------- */
document.addEventListener("DOMContentLoaded", () => {
  setupUserDropdown();
  fetchStats();
});
