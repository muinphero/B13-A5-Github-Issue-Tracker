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
    const createdAt = formatCreatedDate(issue.createdAt);

    const isOpen = status.toLowerCase() === "open";
    const isClosed = status.toLowerCase() === "closed";

    const statusIcon = isClosed
      ? "./assets/Closed- Status .png"
      : "./assets/Open-Status.png";

    let topBorderClass = "border-t-4 border-t-slate-300";
    if (isOpen) {
      topBorderClass = "border-t-4 border-t-emerald-500";
    } else if (isClosed) {
      topBorderClass = "border-t-4 border-t-violet-500";
    }

    let priorityClass = "bg-slate-200 text-slate-500";
    if (priority.toLowerCase() === "high") {
      priorityClass = "bg-red-100 text-red-500";
    } else if (priority.toLowerCase() === "medium") {
      priorityClass = "bg-amber-100 text-amber-600";
    } else if (priority.toLowerCase() === "low") {
      priorityClass = "bg-slate-200 text-slate-500";
    }

    const labels = Array.isArray(issue.labels) ? issue.labels : [];
    const labelsHtml =
      labels.length > 0
        ? labels
            .map((labelText) => {
              const lower = labelText.toLowerCase();
              let cls = "border-slate-300 bg-slate-100 text-slate-600";

              if (lower === "bug") {
                cls = "border-red-300 bg-red-100 text-red-500";
              } else if (lower === "help wanted") {
                cls = "border-amber-400 bg-amber-100 text-amber-600";
              } else if (lower === "enhancement") {
                cls = "border-emerald-300 bg-emerald-100 text-emerald-600";
              }

              return `<span class="inline-flex items-center rounded-full border px-2 py-[2px] text-[11px] font-medium uppercase leading-none ${cls}">${labelText}</span>`;
            })
            .join(" ")
        : '<span class="inline-flex items-center rounded-full border border-slate-300 bg-slate-100 px-2 py-[2px] text-[11px] font-medium uppercase leading-none text-slate-600">No Label</span>';

    const card = document.createElement("div");
    card.className = `cursor-pointer overflow-hidden rounded-md border border-slate-200 bg-[#f5f6f8] shadow-sm ${topBorderClass} h-full flex flex-col`;

    card.innerHTML = `
      <div class="px-4 pt-3 pb-4 flex-1 flex flex-col">
        <div class="mb-3 flex items-center justify-between">
          <img src="${statusIcon}" alt="${status}" class="h-5 w-5" />
          <span class="inline-flex min-w-[88px] items-center justify-center rounded-full px-3 py-[3px] text-[12px] font-semibold uppercase leading-none ${priorityClass}">${priority}</span>
        </div>

        <h3 class="mb-2 line-clamp-2 text-[16px] font-semibold leading-tight text-slate-800">${title}</h3>
        <p class="mb-3 line-clamp-2 text-[15px] leading-[1.35] text-slate-500">${description}</p>

        <div class="mt-auto flex flex-wrap gap-2 min-h-[22px]">${labelsHtml}</div>
      </div>

      <div class="border-t border-slate-300 px-4 py-3 text-[13px] text-slate-500">
        <p>#${issue.id ?? "N/A"} by ${author}</p>
        <p class="mt-1">${createdAt}</p>
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
    modalContent.innerHTML = "<p class=\"text-slate-500\">Loading issue details...</p>";
    issueModal.showModal();

    const response = await fetch(`${SINGLE_ISSUE_API_BASE}/${issueId}`);
    if (!response.ok) {
      throw new Error("Failed to load single issue");
    }

    const result = await response.json();
    const issue = result.data || result.issue || result;

    const issueTitle = issue.title || "Issue Details";
    const issueStatus = (issue.status || "open").toLowerCase();
    const issueAuthor = issue.author || "Unknown";
    const issueDescription = issue.description || "No description available.";
    const issueAssignee = issue.assignee || "N/A";
    const issuePriority = (issue.priority || "N/A").toUpperCase();

    const createdDateObject = new Date(issue.createdAt);
    const openedDate = Number.isNaN(createdDateObject.getTime())
      ? "N/A"
      : createdDateObject.toLocaleDateString("en-GB");

    const statusClass =
      issueStatus === "closed"
        ? "bg-violet-100 text-violet-600"
        : "bg-emerald-500 text-white";

    let priorityClass = "bg-slate-200 text-slate-600";
    if (issuePriority === "HIGH") {
      priorityClass = "bg-red-500 text-white";
    } else if (issuePriority === "MEDIUM") {
      priorityClass = "bg-amber-400 text-slate-900";
    } else if (issuePriority === "LOW") {
      priorityClass = "bg-slate-300 text-slate-700";
    }

    const labels = Array.isArray(issue.labels) ? issue.labels : [];
    const labelsHtml =
      labels.length > 0
        ? labels
            .map((labelText) => {
              const lower = labelText.toLowerCase();
              let cls = "border-slate-300 bg-slate-100 text-slate-600";

              if (lower === "bug") {
                cls = "border-red-300 bg-red-100 text-red-500";
              } else if (lower === "help wanted") {
                cls = "border-amber-400 bg-amber-100 text-amber-600";
              } else if (lower === "enhancement") {
                cls = "border-emerald-300 bg-emerald-100 text-emerald-600";
              }

              return `<span class="inline-flex items-center rounded-full border px-2 py-[2px] text-[11px] font-medium uppercase leading-none ${cls}">${labelText}</span>`;
            })
            .join(" ")
        : '<span class="inline-flex items-center rounded-full border border-slate-300 bg-slate-100 px-2 py-[2px] text-[11px] font-medium uppercase leading-none text-slate-600">No Label</span>';

    modalTitle.textContent = issueTitle;
    modalContent.innerHTML = `
      <div class="space-y-4">
        <div class="flex flex-wrap items-center gap-2 text-[14px] text-slate-500">
          <span class="inline-flex items-center rounded-full px-3 py-1 text-[12px] font-semibold leading-none ${statusClass}">${issueStatus.charAt(0).toUpperCase() + issueStatus.slice(1)}</span>
          <span>•</span>
          <span>Opened by ${issueAuthor}</span>
          <span>•</span>
          <span>${openedDate}</span>
        </div>

        <div class="flex flex-wrap gap-2">${labelsHtml}</div>

        <p class="text-[16px] leading-[1.55] text-slate-600">${issueDescription}</p>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 rounded-lg bg-slate-100 p-3">
          <div>
            <p class="text-[14px] text-slate-500 mb-1">Assignee:</p>
            <p class="text-[20px] font-semibold text-slate-800">${issueAssignee}</p>
          </div>
          <div>
            <p class="text-[14px] text-slate-500 mb-1">Priority:</p>
            <span class="inline-flex items-center rounded-full px-3 py-[4px] text-[12px] font-semibold leading-none ${priorityClass}">${issuePriority}</span>
          </div>
        </div>
      </div>
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





