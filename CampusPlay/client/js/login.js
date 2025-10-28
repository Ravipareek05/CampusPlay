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
    this.setupGoogleSignInButtons(); // 🆕 Call new setup function
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
        const { name, email, password, confirmPassword, isValid } = this.validateRegisterForm();
        if (isValid) this.createUser(name, email, password);
      });
    }
    
    // NOTE: The IDs 'show-register' and 'show-login' don't exist in your HTML.
    // The link for switching forms is handled by the 'onclick="showAuthModal()"' in the HTML.
    // I am commenting this out to avoid errors:

    // document
    //   .getElementById("show-register")
    //   .addEventListener("click", () => this.switchForm("register"));
    // document
    //   .getElementById("show-login")
    //   .addEventListener("click", () => this.switchForm("login"));
  }

  // 🆕 Logic to trigger Google One-Tap/Prompt on button click
  setupGoogleSignInButtons() {
    document.querySelectorAll(".google-signin-btn").forEach(button => {
      button.addEventListener('click', (e) => {
        e.preventDefault();
        // This method requests the Google One-Tap prompt to be displayed immediately
        if (window.google && window.google.accounts && window.google.accounts.id) {
            window.google.accounts.id.prompt();
        } else {
            this.showToast("Google client not loaded. Please try again.", "error");
        }
      });
    });
  }


  // NOTE: This switchForm method is not used in your current HTML, 
  // as the HTML uses a global function `showAuthModal()`. 
  // I'm keeping it for completeness but it is currently uncalled.
  switchForm(formName) {
    const loginSection = document.getElementById("login-section");
    const registerSection = document.getElementById("register-section");
    if (loginSection && registerSection) {
        if (formName === "register") {
            loginSection.style.display = "none";
            registerSection.style.display = "block";
        } else {
            loginSection.style.display = "block";
            registerSection.style.display = "none";
        }
    }
  }

  // Form Validation
  validateLoginForm() {
    // These IDs now match the corrected HTML inputs
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
    // These IDs now match the corrected HTML inputs
    const name = document.getElementById("register-name").value;
    const email = document.getElementById("register-email").value;
    const password = document.getElementById("register-password").value;
    const confirmPassword = document.getElementById("register-confirm-password").value;
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
    } else if (password !== confirmPassword) {
      this.showToast("Passwords do not match.", "error");
      isValid = false;
    }

    return {
      name,
      email,
      password,
      confirmPassword,
      isValid,
    };
  }

  // API Calls
  async authenticateUser(email, password) {
    // Show loading spinner/disable button here if you want UI feedback
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
    } finally {
        // Hide loading spinner/enable button here
    }
  }

  async createUser(name, email, password) {
    // Show loading spinner/disable button here
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
    } finally {
        // Hide loading spinner/enable button here
    }
  }

  // UI Helpers
  showToast(message, type = "info") {
    // Ensure toast container exists
    const toastContainer = document.getElementById("toast-container");
    if (!toastContainer) {
        console.error("Toast container not found.");
        return;
    }

    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    toast.textContent = message;
    toastContainer.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  }

  setupPasswordToggles() {
    document.querySelectorAll(".password-toggle").forEach((toggle) => {
      toggle.addEventListener("click", () => {
        // Using previousElementSibling assumes the input is directly before the button
        const input = toggle.previousElementSibling; 
        const icon = toggle.querySelector("i");
        if (input && icon) {
            if (input.type === "password") {
              input.type = "text";
              icon.classList.remove("fa-eye");
              icon.classList.add("fa-eye-slash");
            } else {
              input.type = "password";
              icon.classList.remove("fa-eye-slash");
              icon.classList.add("fa-eye");
            }
        }
      });
    });
  }

  // Navigation and other UI setups from your existing code
  setupNavigation() {
    // Logic for setting active nav links, etc.
  }
}

// Initialize the app
window.campusPlayApp = new CampusPlayApp();

// --- GOOGLE SIGN-IN INTEGRATION ---

// This function will be called by Google after the user signs in.
function handleCredentialResponse(response) {
  // Use the existing app instance to show toast messages
  const app = window.campusPlayApp || new CampusPlayApp();
  
  // TODO: Send this 'response.credential' token to your backend!
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
      localStorage.setItem("token", data.token); // Assuming token is returned
      app.currentUser = data.user;
      app.showToast("Google Sign-In successful! Redirecting...", "success");
      window.location.href = "/"; 
    } else {
      app.showToast(data.error || "Google Sign-In failed. Please ensure you use a thapar.edu account.", "error");
    }
  })
  .catch(() => {
    app.showToast("A network error occurred during Google sign-in.", "error");
  });
}

// This function initializes the Google Sign-In client.
window.onload = function () {
  // Check if google accounts library is available
  if (window.google && window.google.accounts && window.google.accounts.id) {
      google.accounts.id.initialize({
        // IMPORTANT: Replace this with your own Google Cloud Client ID
        client_id: "YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com", 
        callback: handleCredentialResponse,
        // The hd (hosted domain) parameter ensures only thapar.edu accounts can proceed easily
        hd: "thapar.edu" 
      });

      // This renders the Google One-Tap prompt in the top-right corner
      google.accounts.id.prompt(); 
  }
};

// Global function to show the modal, referenced by onclick in HTML
// Since this is a utility function, we define it globally.
window.showAuthModal = function(formType) {
    const modal = document.getElementById("auth-modal");
    if (modal) {
        modal.classList.remove("hidden");
    }
    
    // Logic to switch between login and register forms inside the modal
    const registerContainer = document.getElementById("register-form-container");
    // NOTE: Your HTML doesn't explicitly have a separate container for a login form 
    // inside the modal, so we'll just show the register form if 'register' is requested.
    // If you want a separate login form in the modal, you'd need to add that HTML.
    if (registerContainer) {
      if (formType === 'register') {
          registerContainer.style.display = 'block';
      } else {
          // You could hide it or switch to a login form if one were present
          registerContainer.style.display = 'block'; // Keeping it visible for now as the login form is outside the modal
      }
    }
}

// Global function to close the modal
window.closeAuthModal = function() {
    const modal = document.getElementById("auth-modal");
    if (modal) {
        modal.classList.add("hidden");
    }
}