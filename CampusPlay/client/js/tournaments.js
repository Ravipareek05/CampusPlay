document.addEventListener("DOMContentLoaded", async () => {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("campusPlayUser"));
  const mainContent = document.querySelector(".main-content");

  // --- Helper Functions ---
  const showToast = (message) => {
    const toast = document.createElement("div");
    toast.className = "toast show";
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => {
      toast.classList.remove("show");
      setTimeout(() => document.body.removeChild(toast), 300);
    }, 3000);
  };

  const createTournamentCard = (tournament) => {
    const isParticipant = tournament.participants.includes(user?.id);
    const buttonText = isParticipant ? "Joined ✔️" : "Join Tournament";
    const buttonDisabled = isParticipant ? "disabled" : "";

    // Format date for display
    const eventDate = new Date(tournament.date);
    const formattedDate = eventDate.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

    return `
            <div class="tournament-card" data-id="${tournament._id}">
                <img src="images/avatar${
                  Math.floor(Math.random() * 3) + 1
                }.jpeg" alt="${tournament.title}" class="card-banner">
                <div class="card-body">
                    <h3 class="card-title">${tournament.title}</h3>
                    <div class="card-meta">
                        <span><i class="fas fa-gamepad"></i> ${
                          tournament.game
                        }</span>
                        <span><i class="fas fa-calendar-alt"></i> ${formattedDate}</span>
                    </div>
                    <div class="card-meta">
                        <span><i class="fas fa-users"></i> ${
                          tournament.participants.length
                        } Joined</span>
                    </div>
                    <button class="join-button" ${buttonDisabled}>${buttonText}</button>
                </div>
            </div>
        `;
  };

  // --- Main Logic: Fetch and Render Tournaments ---
  const loadTournaments = async () => {
    try {
      const response = await fetch("/api/tournaments");
      if (!response.ok) throw new Error("Failed to fetch tournaments");
      const tournaments = await response.json();

      if (tournaments.length > 0) {
        mainContent.innerHTML = tournaments.map(createTournamentCard).join("");
      } else {
        mainContent.innerHTML =
          '<p class="no-tournaments">No upcoming tournaments found. Why not create one?</p>';
      }
    } catch (error) {
      console.error("Error loading tournaments:", error);
      mainContent.innerHTML =
        '<p class="error">Could not load tournaments. Please try again later.</p>';
      showToast("Error: Could not load tournaments.");
    }
  };

  // --- Event Listener for Joining Tournaments ---
  mainContent.addEventListener("click", async (event) => {
    if (event.target.classList.contains("join-button")) {
      const button = event.target;
      const card = button.closest(".tournament-card");
      const tournamentId = card.dataset.id;

      if (!token || !user) {
        showToast("You must be logged in to join.");
        window.location.href = "login.html";
        return;
      }

      if (button.disabled) return;

      try {
        const response = await fetch(`/api/tournaments/${tournamentId}/join`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.error || "Failed to join");
        }

        button.textContent = "Joined ✔️";
        button.disabled = true;
        showToast(
          `Successfully joined "${
            card.querySelector(".card-title").textContent
          }"!`
        );

        // Optionally, update the participant count visually
        const participantsSpan = card.querySelector(".fa-users").parentElement;
        const currentCount = parseInt(
          participantsSpan.textContent.match(/\d+/)[0]
        );
        participantsSpan.innerHTML = `<i class="fas fa-users"></i> ${
          currentCount + 1
        } Joined`;
      } catch (error) {
        console.error("Error joining tournament:", error);
        showToast(`Error: ${error.message}`);
      }
    }
  });

  // --- Initial Load ---
  if (user) {
    document.getElementById("user-name").textContent = user.name;
    const initials = user.name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
    document.getElementById("user-initials").textContent = initials;
  }

  loadTournaments();
});
