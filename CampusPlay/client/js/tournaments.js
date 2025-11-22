// document.addEventListener("DOMContentLoaded", async () => {
//   const token = localStorage.getItem("token");
//   const user = JSON.parse(localStorage.getItem("campusPlayUser"));
//   const mainContent = document.querySelector(".main-content");

//   // --- Helper Functions ---
//   const showToast = (message) => {
//     const toast = document.createElement("div");
//     toast.className = "toast show";
//     toast.textContent = message;
//     document.body.appendChild(toast);
//     setTimeout(() => {
//       toast.classList.remove("show");
//       setTimeout(() => document.body.removeChild(toast), 300);
//     }, 3000);
//   };

//   const createTournamentCard = (tournament) => {
//     const isParticipant = tournament.participants.includes(user?.id);
//     const buttonText = isParticipant ? "Joined ✔️" : "Join Tournament";
//     const buttonDisabled = isParticipant ? "disabled" : "";

//     // Format date for display
//     const eventDate = new Date(tournament.date);
//     const formattedDate = eventDate.toLocaleDateString("en-US", {
//       month: "short",
//       day: "numeric",
//       year: "numeric",
//     });

//     return `
//             <div class="tournament-card" data-id="${tournament._id}">
//                 <img src="images/avatar${
//                   Math.floor(Math.random() * 3) + 1
//                 }.jpeg" alt="${tournament.title}" class="card-banner">
//                 <div class="card-body">
//                     <h3 class="card-title">${tournament.title}</h3>
//                     <div class="card-meta">
//                         <span><i class="fas fa-gamepad"></i> ${
//                           tournament.game
//                         }</span>
//                         <span><i class="fas fa-calendar-alt"></i> ${formattedDate}</span>
//                     </div>
//                     <div class="card-meta">
//                         <span><i class="fas fa-users"></i> ${
//                           tournament.participants.length
//                         } Joined</span>
//                     </div>
//                     <button class="join-button" ${buttonDisabled}>${buttonText}</button>
//                 </div>
//             </div>
//         `;
//   };

//   // --- Main Logic: Fetch and Render Tournaments ---
//   const loadTournaments = async () => {
//     try {
//       const response = await fetch("/api/tournaments");
//       if (!response.ok) throw new Error("Failed to fetch tournaments");
//       const tournaments = await response.json();

//       if (tournaments.length > 0) {
//         mainContent.innerHTML = tournaments.map(createTournamentCard).join("");
//       } else {
//         mainContent.innerHTML =
//           '<p class="no-tournaments">No upcoming tournaments found. Why not create one?</p>';
//       }
//     } catch (error) {
//       console.error("Error loading tournaments:", error);
//       mainContent.innerHTML =
//         '<p class="error">Could not load tournaments. Please try again later.</p>';
//       showToast("Error: Could not load tournaments.");
//     }
//   };

//   // --- Event Listener for Joining Tournaments ---
//   mainContent.addEventListener("click", async (event) => {
//     if (event.target.classList.contains("join-button")) {
//       const button = event.target;
//       const card = button.closest(".tournament-card");
//       const tournamentId = card.dataset.id;

//       if (!token || !user) {
//         showToast("You must be logged in to join.");
//         window.location.href = "login.html";
//         return;
//       }

//       if (button.disabled) return;

//       try {
//         const response = await fetch(`/api/tournaments/${tournamentId}/join`, {
//           method: "POST",
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         });

//         if (!response.ok) {
//           const errData = await response.json();
//           throw new Error(errData.error || "Failed to join");
//         }

//         button.textContent = "Joined ✔️";
//         button.disabled = true;
//         showToast(
//           `Successfully joined "${
//             card.querySelector(".card-title").textContent
//           }"!`
//         );

//         // Optionally, update the participant count visually
//         const participantsSpan = card.querySelector(".fa-users").parentElement;
//         const currentCount = parseInt(
//           participantsSpan.textContent.match(/\d+/)[0]
//         );
//         participantsSpan.innerHTML = `<i class="fas fa-users"></i> ${
//           currentCount + 1
//         } Joined`;
//       } catch (error) {
//         console.error("Error joining tournament:", error);
//         showToast(`Error: ${error.message}`);
//       }
//     }
//   });

//   // --- Initial Load ---
//   if (user) {
//     document.getElementById("user-name").textContent = user.name;
//     const initials = user.name
//       .split(" ")
//       .map((n) => n[0])
//       .join("")
//       .toUpperCase();
//     document.getElementById("user-initials").textContent = initials;
//   }

//   loadTournaments();
// });

// js/tournaments.js
// Gaming-style UI behavior (keeps your original fetch/join logic intact, adds UX polish)

document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("campusPlayUser")) || null;

  // DOM targets (grids from your HTML)
  const featuredGrid = document.getElementById("featured-tournaments-grid");
  const upcomingGrid = document.getElementById("upcoming-tournaments-grid");

  // Ensure a toast container (in case HTML not present)
  let toastContainer = document.getElementById("toast-container");
  if (!toastContainer) {
    toastContainer = document.createElement("div");
    toastContainer.id = "toast-container";
    toastContainer.className = "toast-container";
    document.body.appendChild(toastContainer);
  }

  // small helper to show toasts
  function showToast(message, options = {}) {
    const t = document.createElement("div");
    t.className = "toast";
    t.textContent = message;
    toastContainer.appendChild(t);

    const duration = options.duration || 3200;
    // entrance animation
    t.style.opacity = "1";
    t.style.transform = "translateX(0)";
    setTimeout(() => {
      t.style.transition = "opacity .28s ease, transform .28s ease";
      t.style.opacity = "0";
      t.style.transform = "translateX(16px)";
    }, duration - 300);
    setTimeout(() => { if (t.parentElement) t.parentElement.removeChild(t); }, duration);
  }

  // Build a tournament card element
  function createTournamentCard(tournament) {
    const isParticipant = user && Array.isArray(tournament.participants) && tournament.participants.includes(user.id);
    const buttonText = isParticipant ? "Joined ✔️" : "Join";

    // safe date formatting
    const eventDate = new Date(tournament.date);
    const formattedDate = isNaN(eventDate.getTime())
      ? "TBA"
      : eventDate.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });

    // fallback banner image if not present
    const bannerSrc = tournament.banner || `images/avatar${Math.floor(Math.random() * 3) + 1}.jpeg`;

    const card = document.createElement("div");
    card.className = "tournament-card";
    card.dataset.id = tournament._id || tournament.id || "";

    card.innerHTML = `
      <img src="${bannerSrc}" alt="${(tournament.title || "Tournament").replace(/"/g, "")}" class="card-banner" />
      <div class="card-body">
        <div class="card-title">${tournament.title || "Untitled Tournament"}</div>
        <div class="card-meta">
          <span class="badge"><i class="fas fa-gamepad"></i>&nbsp; ${tournament.game || "Unknown"}</span>
          <span class="badge"><i class="fas fa-calendar-alt"></i>&nbsp; ${formattedDate}</span>
          <span class="card-prize">${tournament.prize ? "₹" + tournament.prize : ""}</span>
        </div>
        <div class="card-desc">${tournament.description ? escapeHtml(tournament.description).slice(0, 140) : ""}</div>
        <div class="card-footer">
          <div class="slots"><i class="fas fa-users"></i>&nbsp; ${tournament.participants ? tournament.participants.length : 0} Joined</div>
          <div><button class="join-button"${isParticipant ? " disabled" : ""}>${buttonText}</button></div>
        </div>
      </div>
    `;
    return card;
  }

  // simple html-escape for safety in innerHTML
  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  // Load tournaments from backend
  async function loadTournaments() {
    try {
      const res = await fetch("/api/tournaments");
      if (!res.ok) throw new Error("Failed to fetch tournaments");
      const data = await res.json();

      // split featured vs upcoming (fallback: all upcoming)
      const featured = Array.isArray(data) ? data.filter(d => d.featured).slice(0, 6) : [];
      const upcoming = Array.isArray(data) ? data.filter(d => !d.featured) : [];

      // clear
      if (featuredGrid) featuredGrid.innerHTML = "";
      if (upcomingGrid) upcomingGrid.innerHTML = "";

      if (featured.length === 0 && featuredGrid) {
        featuredGrid.innerHTML = '<div class="no-tournaments">No featured tournaments yet.</div>';
      } else if (featuredGrid) {
        featured.forEach(t => featuredGrid.appendChild(createTournamentCard(t)));
      }

      if (upcoming.length === 0 && upcomingGrid) {
        upcomingGrid.innerHTML = '<div class="no-tournaments">No upcoming tournaments found.</div>';
      } else if (upcomingGrid) {
        upcoming.forEach(t => upcomingGrid.appendChild(createTournamentCard(t)));
      }
    } catch (err) {
      console.error("Error loading tournaments:", err);
      if (featuredGrid) featuredGrid.innerHTML = '<div class="no-tournaments">Could not load tournaments.</div>';
      if (upcomingGrid) upcomingGrid.innerHTML = '<div class="no-tournaments">Could not load tournaments.</div>';
      showToast("Error: could not load tournaments");
    }
  }

  // Event delegation for Join button
  document.addEventListener("click", async (ev) => {
    const btn = ev.target.closest(".join-button");
    if (!btn) return;

    const card = btn.closest(".tournament-card");
    const tournamentId = card ? card.dataset.id : null;
    if (!tournamentId) { showToast("Invalid tournament"); return; }

    if (!token || !user) {
      showToast("Please login to join");
      window.location.href = "login.html";
      return;
    }

    if (btn.disabled) return;

    // optimistic UI
    btn.disabled = true;
    const previousText = btn.textContent;
    btn.textContent = "Joining...";

    try {
      const res = await fetch(`/api/tournaments/${tournamentId}/join`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` }
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || errData.message || "Join failed");
      }

      // success: update UI
      btn.textContent = "Joined ✔️";
      btn.disabled = true;

      // update participants count
      const slots = card.querySelector(".slots");
      if (slots) {
        const match = slots.textContent.match(/\d+/);
        const curr = match ? parseInt(match[0], 10) : 0;
        slots.innerHTML = `<i class="fas fa-users"></i>&nbsp; ${curr + 1} Joined`;
      }

      const title = card.querySelector(".card-title") ? card.querySelector(".card-title").textContent : "Tournament";
      showToast(`Successfully joined "${title}"`);
    } catch (err) {
      console.error("Join error:", err);
      btn.disabled = false;
      btn.textContent = previousText || "Join";
      showToast("Error: " + (err.message || "Could not join"));
    }
  });

  // display user name & initials if present
  if (user) {
    const nameEl = document.getElementById("user-name");
    const initialsEl = document.getElementById("user-initials");
    if (nameEl) nameEl.textContent = user.name || "";
    if (initialsEl) {
      const initials = (user.name || "").split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() || "U";
      initialsEl.textContent = initials;
    }
  }

  // start
  loadTournaments();
});
