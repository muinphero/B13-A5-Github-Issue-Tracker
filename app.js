// Login Logic + Section Toggle Logic

// localStorage.removeItem("isLoggedIn");

// Login elements
const loginForm = document.getElementById("loginForm");
const usernameInput = document.getElementById("username");
const passwordInput = document.getElementById("password");
const loginError = document.getElementById("loginError");

// Section elements
const loginSection = document.getElementById("loginSection");
const mainSection = document.getElementById("mainSection");

// Main page elements
const loadingSpinner = document.getElementById("loadingSpinner");
const issuesContainer = document.getElementById("issuesContainer");
const emptyMessage = document.getElementById("emptyMessage");
const issueCount = document.getElementById("issueCount");
const openCount = document.getElementById("openCount");
const closedCount = document.getElementById("closedCount");

// Tab elements
const tabAll = document.getElementById("tabAll");
const tabOpen = document.getElementById("tabOpen");
const tabClosed = document.getElementById("tabClosed");

// Modal elements
const issueModal = document.getElementById("issueModal");
const modalTitle = document.getElementById("modalTitle");
const modalContent = document.getElementById("modalContent");

// Search elements
const searchForm = document.getElementById("searchForm");
const searchInput = document.getElementById("searchInput");

// Demo credentials
const DEMO_USERNAME = "admin";
const DEMO_PASSWORD = "admin123";

// API Endpoint
const ALL_ISSUES_API = "https://phi-lab-server.vercel.app/api/v1/lab/issues";
const SINGLE_ISSUE_API_BASE =
  "https://phi-lab-server.vercel.app/api/v1/lab/issue";
const SEARCH_ISSUES_API =
  "https://phi-lab-server.vercel.app/api/v1/lab/issues/search";

let allIssues = [];
let masterIssues = [];
let currentFilter = "all";

// Show login section
function showLoginSection() {
  loginSection.classList.remove("hidden");
  mainSection.classList.add("hidden");
}

// Show main section
function showMainSection() {
  loginSection.classList.add("hidden");
  mainSection.classList.remove("hidden");
}

// Show spinner
function showLoading() {
  loadingSpinner.classList.remove("hidden");
}

// Hide spinner
function hideLoading() {
  loadingSpinner.classList.add("hidden");
}

// Format date
function formatCreatedDate(rawDate) {
  if (!rawDate) return "N/A";
  const dateObject = new Date(rawDate);
  if (Number.isNaN(dateObject.getTime())) return "N/A";
  return dateObject.toLocaleDateString();
}

// API response helper
function getIssuesArray(apiResponse) {
  if (Array.isArray(apiResponse)) return apiResponse;
  if (Array.isArray(apiResponse.issues)) return apiResponse.issues;
  if (Array.isArray(apiResponse.data)) return apiResponse.data;
  return [];
}

//Set active tab style
function setActiveTab(tabName) {
  tabAll.classList.remove("active-tab");
  tabOpen.classList.remove("active-tab");
  tabClosed.classList.remove("active-tab");

  if (tabName === "all") tabAll.classList.add("active-tab");
  if (tabName === "open") tabOpen.classList.add("active-tab");
  if (tabName === "closed") tabClosed.classList.add("active-tab");
}

// Update summary counts
function updateSummaryCounts(issues) {
  const total = issues.length;
  const totalOpen = issues.filter((issue) => issue.status === "open").length;
  const totalClosed = issues.filter(
    (issue) => issue.status === "closed",
  ).length;

  issueCount.textContent = total;
  openCount.textContent = totalOpen + " Open";
  closedCount.textContent = totalClosed + " Closed";
}

// Render issue cards
function renderIssueCards(issues) {
  issuesContainer.innerHTML = "";

  if (issues.length === 0) {
    emptyMessage.classList.remove("hidden");
    return;
  } else {
    emptyMessage.classList.add("hidden");
  }

  issues.forEach((issue) => {
    const title = issue.title || "No Title";
    const description = issue.description || "No Description";
    const status = issue.status || "N/A";
    const author = issue.author || "Unknown";
    const priority = issue.priority || "N/A";
    const label =
      Array.isArray(issue.labels) && issue.labels.length
        ? issue.labels.join(", ")
        : "N/A";
    const createdAt = formatCreatedDate(issue.createdAt);

    const card = document.createElement("div");

    const isOpen = status.toLowerCase() === "open";
    const isClosed = status.toLowerCase() === "closed";

    let topBorderClass = "border-t-4 border-t-slate-300";
    if (isOpen) {
      topBorderClass = "border-t-4 border-t-emerald-500";
    } else if (isClosed) {
      topBorderClass = "border-t-4 border-t-violet-500";
    }

    card.className = `bg-white border border-slate-200 rounded-md p-4 shadow-sm cursor-pointer ${topBorderClass}`;

    card.innerHTML = `
      <h3 class="text-[16px] font-semibold text-slate-800 mb-2">${title}</h3>
      <p class="text-[13px] text-slate-600 mb-3 line-clamp-3">${description}</p>
      <div class="space-y-1 text-[13px] text-slate-700">
        <p><span class="font-medium">Status:</span> ${status}</p>
        <p><span class="font-medium">Author:</span> ${author}</p>
        <p><span class="font-medium">Priority:</span> ${priority}</p>
        <p><span class="font-medium">Label:</span> ${label}</p>
        <p><span class="font-medium">Created:</span> ${createdAt}</p>
      </div>
    `;

    card.addEventListener("click", function () {
      openIssueModal(issue.id);
    });

    issuesContainer.appendChild(card);
  });
}

// Get issues based on current tab
function getFilteredIssues() {
  if (currentFilter === "open") {
    return allIssues.filter((issue) => issue.status === "open");
  } else if (currentFilter === "closed") {
    return allIssues.filter((issue) => issue.status === "closed");
  } else {
    return allIssues;
  }
}

// Render using selected filter
function renderIssuesByCurrentFilter() {
  const filteredIssues = getFilteredIssues();
  updateSummaryCounts(filteredIssues);
  renderIssueCards(filteredIssues);
  setActiveTab(currentFilter);
}

// Fetch all issues from API
async function loadAllIssues() {
  try {
    showLoading();
    const response = await fetch(ALL_ISSUES_API);
    if (!response.ok) {
      throw new Error("Failed to load issues");
    }

    const data = await response.json();
    allIssues = getIssuesArray(data);
    masterIssues = [...allIssues];
    renderIssuesByCurrentFilter();
  } catch (error) {
    issuesContainer.innerHTML = `
      <p class="text-red-500 text-center col-span-full">
        Something went wrong while loading issues.
      </p>
    `;
    emptyMessage.classList.add("hidden");
    issueCount.textContent = "0";
    openCount.textContent = "0 Open";
    closedCount.textContent = "0 Closed";
  } finally {
    hideLoading();
  }
}

// Fetch single issue details from API
async function openIssueModal(issueId) {
  try {
    modalTitle.textContent = "Issue Details";
    modalContent.innerHTML = "<p>Loading issue details...</p>";
    issueModal.showModal();

    const response = await fetch(`${SINGLE_ISSUE_API_BASE}/${issueId}`);
    if (!response.ok) {
      throw new Error("Failed to load single issue");
    }

    const result = await response.json();
    const issue = result.data || result.issue || result;

    const labels =
      Array.isArray(issue.labels) && issue.labels.length
        ? issue.labels.join(", ")
        : "N/A";

    modalTitle.textContent = issue.title || "Issue Details";
    modalContent.innerHTML = `
      <p><span class="font-semibold">ID:</span> ${issue.id ?? "N/A"}</p>
      <p><span class="font-semibold">Description:</span> ${issue.description || "N/A"}</p>
      <p><span class="font-semibold">Status:</span> ${issue.status || "N/A"}</p>
      <p><span class="font-semibold">Author:</span> ${issue.author || "Unknown"}</p>
      <p><span class="font-semibold">Assignee:</span> ${issue.assignee || "N/A"}</p>
      <p><span class="font-semibold">Priority:</span> ${issue.priority || "N/A"}</p>
      <p><span class="font-semibold">Labels:</span> ${labels}</p>
      <p><span class="font-semibold">Created:</span> ${formatCreatedDate(issue.createdAt)}</p>
      <p><span class="font-semibold">Updated:</span> ${formatCreatedDate(issue.updatedAt)}</p>
    `;
  } catch (error) {
    modalContent.innerHTML =
      "<p class='text-red-500'>Could not load issue details.</p>";
  }
}

// Fetch search results from API
async function searchIssues(searchText) {
  try {
    showLoading();

    const response = await fetch(
      `${SEARCH_ISSUES_API}?q=${encodeURIComponent(searchText)}`,
    );

    if (!response.ok) {
      throw new Error("Failed to search issues");
    }

    const data = await response.json();

    allIssues = getIssuesArray(data);
    currentFilter = "all";
    renderIssuesByCurrentFilter();
    searchInput.value = ""; // clear search box
  } catch (error) {
    issuesContainer.innerHTML = `
      <p class="text-red-500 text-center col-span-full">
        Something went wrong while searching issues.
      </p>
    `;
    emptyMessage.classList.add("hidden");
    issueCount.textContent = "0";
    openCount.textContent = "0 Open";
    closedCount.textContent = "0 Closed";
  } finally {
    hideLoading();
  }
}

// Handle login form submission
loginForm.addEventListener("submit", function (event) {
  event.preventDefault();

  const typedUsername = usernameInput.value.trim();
  const typedPassword = passwordInput.value.trim();

  if (typedUsername === DEMO_USERNAME && typedPassword === DEMO_PASSWORD) {
    loginError.classList.add("hidden");
    loginError.textContent = "";
    localStorage.setItem("isLoggedIn", "true");
    showMainSection();
    loadAllIssues();
  } else {
    loginError.textContent =
      "Invalid username or password. Try admin / admin123";
    loginError.classList.remove("hidden");
  }
});

// Tab click event listeners
tabAll.addEventListener("click", function () {
  currentFilter = "all";
  renderIssuesByCurrentFilter();
});

tabOpen.addEventListener("click", function () {
  currentFilter = "open";
  renderIssuesByCurrentFilter();
});

tabClosed.addEventListener("click", function () {
  currentFilter = "closed";
  renderIssuesByCurrentFilter();
});

setActiveTab("all");

// Search form submission event listener
searchForm.addEventListener("submit", function (event) {
  event.preventDefault();

  const searchText = searchInput.value.trim();

  if (searchText === "") {
    allIssues = [...masterIssues];
    currentFilter = "all";
    renderIssuesByCurrentFilter();
    return;
  }

  searchIssues(searchText);
});

// Check login status on page load
const savedLoginState = localStorage.getItem("isLoggedIn");

if (savedLoginState === "true") {
  showMainSection();
  loadAllIssues();
} else {
  showLoginSection();
}
