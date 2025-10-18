// Application State
class CampusPlayApp {
  constructor() {
    this.currentUser = null;
    this.init();
  }

  init() {
    // load saved user if exists
    try {
      // FIX: Use the standardized key 'campusPlayUser'
      this.currentUser = JSON.parse(
        localStorage.getItem("campusPlayUser") || "null"
      );
    } catch (e) {
      this.currentUser = null;
    }
    this.setupEventListeners();
    this.setupNavigation();
    this.setupAuthForms();
    this.setupPasswordToggles();
  }

  // ✅ allow only thapar.edu emails
  isThaparEmail(email) {
    return String(email || "")
      .toLowerCase()
      .endsWith("@thapar.edu");
  }

  // Event Listeners Setup
  setupEventListeners() {
    const navToggle = document.getElementById("nav-toggle");
    const navMenu = document.getElementById("nav-menu");

    if (navToggle) {
      navToggle.addEventListener("click", () => {
        navMenu.classList.toggle("active");
        const icon = navToggle.querySelector("i");
        icon.classList.toggle("fa-bars");
        icon.classList.toggle("fa-times");
      });
    }

    document.querySelectorAll(".nav__link").forEach((link) => {
      link.addEventListener("click", () => {
        navMenu.classList.remove("active");
        const icon = navToggle.querySelector("i");
        if (icon) {
          icon.classList.remove("fa-times");
          icon.classList.add("fa-bars");
        }
      });
    });
  }

  // Auth Form Logic
  setupAuthForms() {
    const loginForm = document.getElementById("login-form");
    const registerForm = document.getElementById("register-form");

    if (loginForm) {
      loginForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const { email, password, isValid } = this.validateLoginForm();
        if (isValid) this.authenticateUser(email, password);
      });
    }

    if (registerForm) {
      registerForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const { name, email, password, isValid } = this.validateRegisterForm();
        if (isValid) this.createUser(name, email, password);
      });
    }

    document
      .getElementById("show-register")
      .addEventListener("click", () => this.switchForm("register"));
    document
      .getElementById("show-login")
      .addEventListener("click", () => this.switchForm("login"));
  }

  switchForm(formName) {
    const loginSection = document.getElementById("login-section");
    const registerSection = document.getElementById("register-section");
    if (formName === "register") {
      loginSection.style.display = "none";
      registerSection.style.display = "block";
    } else {
      loginSection.style.display = "block";
      registerSection.style.display = "none";
    }
  }

  // Form Validation
  validateLoginForm() {
    const email = document.getElementById("login-email").value;
    const password = document.getElementById("login-password").value;
    let isValid = true;

    if (!this.isThaparEmail(email)) {
      this.showToast("Please use a valid thapar.edu email.", "error");
      isValid = false;
    } else if (password.length < 6) {
      this.showToast("Password must be at least 6 characters.", "error");
      isValid = false;
    }

    return {
      email,
      password,
      isValid,
    };
  }

  validateRegisterForm() {
    const name = document.getElementById("register-name").value;
    const email = document.getElementById("register-email").value;
    const password = document.getElementById("register-password").value;
    let isValid = true;

    if (!name) {
      this.showToast("Name is required.", "error");
      isValid = false;
    } else if (!this.isThaparEmail(email)) {
      this.showToast("Please use a valid thapar.edu email.", "error");
      isValid = false;
    } else if (password.length < 6) {
      this.showToast("Password must be at least 6 characters.", "error");
      isValid = false;
    }

    return {
      name,
      email,
      password,
      isValid,
    };
  }

  // API Calls
  async authenticateUser(email, password) {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });
      const data = await response.json();
      if (response.ok) {
        localStorage.setItem("token", data.token);
        // FIX: Use the standardized key 'campusPlayUser'
        localStorage.setItem("campusPlayUser", JSON.stringify(data.user));
        this.currentUser = data.user;
        window.location.href = "/"; // Redirect to home on success
      } else {
        this.showToast(data.error || "Login failed.", "error");
      }
    } catch (error) {
      this.showToast("An error occurred. Please try again.", "error");
    }
  }

  async createUser(name, email, password) {
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          password,
        }),
      });
      const data = await response.json();
      if (response.ok) {
        localStorage.setItem("token", data.token);
        // FIX: Use the standardized key 'campusPlayUser'
        localStorage.setItem("campusPlayUser", JSON.stringify(data.user));
        this.currentUser = data.user;
        window.location.href = "/"; // Redirect to home on success
      } else {
        this.showToast(data.error || "Registration failed.", "error");
      }
    } catch (error) {
      this.showToast("An error occurred. Please try again.", "error");
    }
  }

  // UI Helpers
  showToast(message, type = "info") {
    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  }

  setupPasswordToggles() {
    document.querySelectorAll(".password-toggle").forEach((toggle) => {
      toggle.addEventListener("click", () => {
        const input = toggle.previousElementSibling;
        const icon = toggle.querySelector("i");
        if (input.type === "password") {
          input.type = "text";
          icon.classList.remove("fa-eye");
          icon.classList.add("fa-eye-slash");
        } else {
          input.type = "password";
          icon.classList.remove("fa-eye-slash");
          icon.classList.add("fa-eye");
        }
      });
    });
  }

  // Navigation and other UI setups from your existing code
  setupNavigation() {
    // Assuming this is part of your app logic
  }
}

// Initialize the app
window.campusPlayApp = new CampusPlayApp();
// --- GOOGLE SIGN-IN INTEGRATION ---

// This function will be called by Google after the user signs in.
// It receives the user's credential token.
function handleCredentialResponse(response) {
  console.log("Encoded JWT ID token: " + response.credential);
  
  // TODO: Send this 'response.credential' token to your backend!
  // Your backend will verify the token, check if the email is from '@thapar.edu',
  // and then either log the user in or create a new account in MongoDB.

  // Example of what you would do next:
  /*
  fetch('/api/auth/google-signin', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token: response.credential })
  })
  .then(res => res.json())
  .then(data => {
    if (data.user) {
      // Save user to localStorage and redirect, just like in your manual login
      localStorage.setItem("campusPlayUser", JSON.stringify(data.user));
      window.location.href = "/"; // Redirect to the main page
    } else {
      // Use your existing toast function to show an error
      new CampusPlayApp().showToast(data.error || "Google Sign-In failed.", "error");
    }
  });
  */
  
  // For now, let's just show a success message
  new CampusPlayApp().showToast("Google Sign-In successful! Redirecting...", "success");
}

// This function initializes the Google Sign-In client.
window.onload = function () {
  google.accounts.id.initialize({
    // IMPORTANT: Replace this with your own Google Cloud Client ID
    client_id: "YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com", 
    callback: handleCredentialResponse,
    login_uri: "http://localhost:3000/api/auth/google-signin", // Your backend endpoint
    // This makes sure only Thapar accounts are shown
    hd: "thapar.edu" 
  });

  // This renders the Google button in the top-right corner prompt
  google.accounts.id.prompt(); 
};
