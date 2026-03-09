// Login Logic

const loginForm = document.getElementById("loginForm");
const usernameInput = document.getElementById("username");
const passwordInput = document.getElementById("password");
const loginError = document.getElementById("loginError");

// Demo credentials
const DEMO_USERNAME = "admin";
const DEMO_PASSWORD = "admin123";

// Handle login form submission
loginForm.addEventListener("submit", function (event) {
  event.preventDefault();

  const typedUsername = usernameInput.value.trim();
  const typedPassword = passwordInput.value.trim();

  if (typedUsername === DEMO_USERNAME && typedPassword === DEMO_PASSWORD) {
    loginError.classList.add("hidden");
    loginError.textContent = "";
    localStorage.setItem("isLoggedIn", "true");
    alert("Login successful! Welcome, " + DEMO_USERNAME + "!");
  } else {
    loginError.textContent =
      "Invalid username or password. Try admin / admin123";
    loginError.classList.remove("hidden");
  }
});
