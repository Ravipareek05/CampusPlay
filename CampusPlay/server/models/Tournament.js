// const mongoose = require("mongoose");
// const Schema = mongoose.Schema;

// const tournamentSchema = new Schema(
//   {
//     title: {
//       type: String,
//       required: true,
//       trim: true,
//     },
//     game: {
//       type: String,
//       required: true,
//       trim: true,
//     },
//     date: {
//       type: Date,
//       required: true,
//     },
//     createdBy: {
//       type: Schema.Types.ObjectId,
//       ref: "User", // This creates a reference to the User model
//       required: true,
//     },
//     participants: [
//       {
//         type: Schema.Types.ObjectId,
//         ref: "User", // An array of users who have joined
//       },
//     ],
//   },
//   {
//     timestamps: true, // Automatically adds createdAt and updatedAt fields
//   }
// );

// module.exports = mongoose.model("Tournament", tournamentSchema);
// // controllers/tournaments.js (join)
// const Tournament = require('../models/Tournament');

// exports.join = async (req, res) => {
//   try {
//     const tournamentId = req.params.id;
//     const userId = req.userId; // set by auth middleware

//     if (!tournamentId) return res.status(400).json({ error: 'Tournament id required' });
//     if (!userId) return res.status(401).json({ error: 'Authentication required' });

//     // atomically add user to participants only if not present
//     const updated = await Tournament.findByIdAndUpdate(
//       tournamentId,
//       { $addToSet: { participants: userId } },
//       { new: true }
//     ).populate('createdBy', 'name').lean();

//     if (!updated) return res.status(404).json({ error: 'Tournament not found' });

//     return res.json(updated);
//   } catch (err) {
//     console.error('Join error:', err);
//     return res.status(500).json({ error: 'Server error' });
//   }
// };

// js/tournaments.js - paste entire file
// ----------------- CONFIG -----------------
const API_BASE = 'https://campusplay-backend.onrender.com/api/tournaments'; // ← update if backend deployed
const DUMMY_USER_ID = null; // optional: for testing; set to '69010bd28fd59bc72e14e56f' if needed

// ----------------- UTIL / TOAST -----------------
function toast(msg, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return console.log('toast:', msg);
  const el = document.createElement('div');
  el.className = `toast toast-${type}`;
  el.textContent = msg;
  el.style.cssText = 'background:#222;color:#fff;padding:8px 12px;border-radius:6px;margin:6px;box-shadow:0 2px 8px rgba(0,0,0,0.4);';
  container.appendChild(el);
  setTimeout(() => el.remove(), 3500);
}

// ----------------- RENDER HELPERS -----------------
function createTournamentCard(t) {
  const wrapper = document.createElement('div');
  wrapper.className = 'tournament-card';
  wrapper.style.cssText = 'background:var(--card-bg); border:1px solid var(--border-color); padding:12px; border-radius:8px; display:flex; justify-content:space-between; align-items:center; gap:12px;';

  const left = document.createElement('div');
  left.style.minWidth = '220px';
  left.innerHTML = `
    <div style="font-weight:700">${escapeHtml(t.title || 'Untitled')}</div>
    <div style="color:var(--text-medium); font-size:0.95em">${escapeHtml(t.game || '')} • ${new Date(t.date).toLocaleString()}</div>
    <div style="margin-top:6px; color:var(--text-medium)">${(t.participants || []).length} joined</div>
  `;

  const right = document.createElement('div');
  right.style.display = 'flex';
  right.style.alignItems = 'center';
  right.style.gap = '8px';

  const joinBtn = document.createElement('button');
  joinBtn.className = 'btn btn-primary join-tournament-btn';
  joinBtn.setAttribute('data-id', t._id);
  joinBtn.type = 'button';
  joinBtn.textContent = 'Join';
  right.appendChild(joinBtn);

  wrapper.appendChild(left);
  wrapper.appendChild(right);
  return wrapper;
}

function escapeHtml(s) {
  if (!s) return '';
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

// ----------------- LOAD TOURNAMENTS -----------------
async function loadTournaments() {
  const featuredGrid = document.getElementById('featured-tournaments-grid');
  const upcomingGrid = document.getElementById('upcoming-tournaments-grid');
  if (featuredGrid) featuredGrid.innerHTML = 'Loading...';
  if (upcomingGrid) upcomingGrid.innerHTML = '';

  try {
    const res = await fetch(API_BASE);
    if (!res.ok) throw new Error('Failed to load tournaments');
    const data = await res.json();

    // Filter upcoming only (future), sort by date
    const now = new Date();
    const upcoming = (Array.isArray(data) ? data : [])
      .filter(d => new Date(d.date) >= now)
      .sort((a,b) => new Date(a.date) - new Date(b.date));

    const featured = upcoming.slice(0, 3);
    const rest = upcoming.slice(3);

    if (featuredGrid) {
      featuredGrid.innerHTML = '';
      if (featured.length === 0) featuredGrid.innerHTML = '<p style="color:var(--text-medium)">No featured tournaments.</p>';
      featured.forEach(t => featuredGrid.appendChild(createTournamentCard(t)));
    }
    if (upcomingGrid) {
      upcomingGrid.innerHTML = '';
      if (rest.length === 0) upcomingGrid.innerHTML = '<p style="color:var(--text-medium)">No upcoming tournaments.</p>';
      rest.forEach(t => upcomingGrid.appendChild(createTournamentCard(t)));
    }
  } catch (err) {
    console.error('loadTournaments error', err);
    if (featuredGrid) featuredGrid.innerHTML = '<p style="color:var(--text-medium)">Error loading tournaments.</p>';
  }
}

// ----------------- EVENT DELEGATION: JOIN -----------------
document.addEventListener('click', async (e) => {
  const btn = e.target.closest('.join-tournament-btn');
  if (!btn) return;

  e.preventDefault();
  const tournamentId = btn.getAttribute('data-id');
  if (!tournamentId) {
    console.error('Join button missing data-id', btn);
    toast('Cannot join: missing tournament id', 'error');
    return;
  }

  try {
    btn.disabled = true;
    btn.textContent = 'Joining...';

    // If you use JWT auth save token to localStorage('token')
    const token = localStorage.getItem('token') || '';
    const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
    // If your backend expects JSON header (it doesn't need a body for join)
    headers['Content-Type'] = 'application/json';

    const res = await fetch(`${API_BASE}/${tournamentId}/join`, {
      method: 'POST',
      headers
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `Join failed (${res.status})`);
    }

    const updated = await res.json();
    toast('Joined tournament', 'success');

    // Refresh UI (quick)
    await loadTournaments();
  } catch (err) {
    console.error('Join error', err);
    toast(err.message || 'Error joining', 'error');
    btn.disabled = false;
    btn.textContent = 'Join';
  }
});

// ----------------- OPTIONAL: Create form handler (only runs if form present) -----------------
(function setupCreateFormIfPresent() {
  const form = document.getElementById('create-tournament-form');
  const toggleBtn = document.getElementById('toggle-create-form');
  const cancelBtn = document.getElementById('cancel-create');

  if (toggleBtn && form) {
    toggleBtn.addEventListener('click', () => {
      form.style.display = form.style.display === 'flex' ? 'none' : 'flex';
      form.style.flexWrap = 'wrap';
    });
  }
  if (cancelBtn && form) {
    cancelBtn.addEventListener('click', () => form.style.display = 'none');
  }

  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const title = form.title.value.trim();
    const game = form.game.value.trim();
    const dateVal = form.date.value;
    if (!title || !game || !dateVal) return toast('Please fill all fields', 'error');

    const isoDate = new Date(dateVal).toISOString();
    try {
      const token = localStorage.getItem('token') || '';
      const res = await fetch(API_BASE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ title, game, date: isoDate })
      });

      if (!res.ok) {
        const err = await res.json().catch(()=>({}));
        throw new Error(err.error || 'Create failed');
      }

      const created = await res.json();
      toast(`Created: ${created.title}`, 'success');
      form.reset();
      form.style.display = 'none';
      loadTournaments();
    } catch (err) {
      console.error('create tournament error', err);
      toast(err.message || 'Error creating tournament', 'error');
    }
  });
})();

// ----------------- UTIL: quick debug helper -----------------
window._loadTournaments = loadTournaments; // alias for debugging in console

// ----------------- INITIAL LOAD -----------------
document.addEventListener('DOMContentLoaded', loadTournaments);
