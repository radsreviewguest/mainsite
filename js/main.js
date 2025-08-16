'use strict';

// ===================================================================
// START: SAFE STORAGE WRAPPER (Handles Private Browsing)
// ===================================================================

/**
 * Safely writes data to localStorage, catching errors if storage is blocked.
 * @param {string} key The key to store the data under.
 * @param {string} value The value to store.
 */
function safeSetStorage(key, value) {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch (error) {
    console.warn('LocalStorage is not available. Data will not be saved.', error);
    return false;
  }
}

/**
 * Safely reads data from localStorage, catching errors if storage is blocked.
 * @param {string} key The key to retrieve.
 * @returns {string|null} The stored value or null if unavailable.
 */
function safeGetStorage(key) {
  try {
    return localStorage.getItem(key);
  } catch (error) {
    console.warn('LocalStorage is not available. Cannot read saved data.', error);
    return null;
  }
}

// ===================================================================
// FAVORITES SYSTEM (Now using Safe Storage)
// ===================================================================

function setupFavoritesSystem() {
    const favoritesListElement = document.getElementById('favorites-list');
    const noFavoritesMessage = document.getElementById('no-favorites-message');
    const favoritesSidebar = document.getElementById('favorites-sidebar');
    const favoritesToggle = document.getElementById('favorites-toggle');

    if (!favoritesListElement || !noFavoritesMessage || !favoritesSidebar || !favoritesToggle) {
        console.error('Favorites system could not initialize. Required HTML elements are missing.');
        return;
    }

    let favorites = JSON.parse(safeGetStorage('radsreview-favorites') || '[]');

    function updateFavoritesUI() {
        document.querySelectorAll('.link-heart').forEach(heart => {
            const link = heart.previousElementSibling;
            if (link && favorites.includes(link.getAttribute('href'))) {
                heart.classList.add('pinned');
                heart.setAttribute('aria-pressed', 'true');
            } else {
                heart.classList.remove('pinned');
                heart.setAttribute('aria-pressed', 'false');
            }
        });

        favoritesListElement.innerHTML = '';
        if (favorites.length > 0) {
            noFavoritesMessage.style.display = 'none';
            favorites.forEach(href => {
                const originalLink = document.querySelector(`a[href="${href}"]`);
                if (originalLink) {
                    const listItem = document.createElement('li');
                    listItem.appendChild(originalLink.cloneNode(true));
                    favoritesListElement.appendChild(listItem);
                }
            });
        } else {
            noFavoritesMessage.style.display = 'block';
        }
    }

    function toggleFavorite(linkHref) {
        const favoriteIndex = favorites.indexOf(linkHref);
        if (favoriteIndex > -1) {
            favorites.splice(favoriteIndex, 1);
        } else {
            favorites.push(linkHref);
        }
        safeSetStorage('radsreview-favorites', JSON.stringify(favorites));
        updateFavoritesUI();
    }

    document.body.addEventListener('click', function(event) {
        const heart = event.target.closest('.link-heart');
        if (heart) {
            const linkToFavorite = heart.previousElementSibling;
            if (linkToFavorite && linkToFavorite.tagName === 'A') {
                toggleFavorite(linkToFavorite.getAttribute('href'));
            }
        }
    });

    favoritesToggle.addEventListener('click', function(event) {
        event.stopPropagation();
        const isExpanded = favoritesSidebar.classList.toggle('expanded');
        this.setAttribute('aria-expanded', isExpanded);
    });

    document.addEventListener('click', function(event) {
        if (favoritesSidebar.classList.contains('expanded') && !favoritesSidebar.contains(event.target) && !favoritesToggle.contains(event.target)) {
            favoritesSidebar.classList.remove('expanded');
            favoritesToggle.setAttribute('aria-expanded', 'false');
        }
    });

    updateFavoritesUI();
    console.log('Favorites system initialized.');
}


// ===================================================================
// THEME MANAGEMENT (Now using Safe Storage)
// ===================================================================

function initializeTheme() {
  const savedTheme = safeGetStorage('theme') || 'dark';
  document.body.setAttribute('data-theme', savedTheme);
  updateThemeIcon(savedTheme);
  updateLogo(savedTheme);
}

function toggleTheme() {
  const currentTheme = document.body.getAttribute('data-theme') || 'dark';
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  
  document.body.setAttribute('data-theme', newTheme);
  safeSetStorage('theme', newTheme);
  updateThemeIcon(newTheme);
  updateLogo(newTheme);
}

function updateThemeIcon(theme) {
  const themeIcon = document.querySelector('.theme-icon');
  if (themeIcon) {
    themeIcon.textContent = theme === 'dark' ? '☀' : '◐';
  }
}

function updateLogo(theme) {
  const logoImages = document.querySelectorAll('img[alt="RadsReview Logo"]');
  logoImages.forEach(img => {
    if (theme === 'light') {
      img.src = './images/radreview_text_dark.PNG';
    } else {
      img.src = './images/radreview_text.png';
    }
  });
}


// ===================================================================
// ALL OTHER SITE FUNCTIONALITY (Remains the same)
// ===================================================================

// Search Animation Functions
function expandSearch(input) {
  const container = input.closest('.search-container');
  const searchWrapper = input.closest('.search-and-ai-container');
  container.classList.add('expanded');
  if (searchWrapper) searchWrapper.classList.add('expanded');
}

function contractSearch(input) {
  const container = input.closest('.search-container');
  const searchWrapper = input.closest('.search-and-ai-container');
  container.classList.remove('expanded');
  if (searchWrapper) searchWrapper.classList.remove('expanded');
}

// Splash Screen functionality
function enterSite() {
  const splashScreen = document.getElementById('splashScreen');
  const mainContent = document.getElementById('mainContent');
  if (!splashScreen || !mainContent) return;
  
  sessionStorage.setItem('splashSeen', 'true');
  splashScreen.classList.add('fade-out');
  
  setTimeout(() => {
    showMainContent();
  }, 300); // Shortened delay for faster entry
}

// Tab functionality
function showTab(tabId, clickedTab) {
  document.querySelectorAll('.content').forEach(section => {
    section.classList.remove('active');
  });
  
  const activeSection = document.getElementById(tabId);
  if (activeSection) activeSection.classList.add('active');

  document.querySelectorAll('.tabs .tab').forEach(t => t.classList.remove('active'));
  if (clickedTab) clickedTab.classList.add('active');
}

// Search and other functions...
// (The rest of your functions like filterResources, displaySearchResults, etc., remain unchanged)
// NOTE: I am omitting the very long search-related functions for brevity,
// but you should keep them in your file. I will include the core setup and initialization logic below.

function filterResources(query) {
    // Your existing filterResources function...
}
function displaySearchResults(results, query) {
    // Your existing displaySearchResults function...
}
async function loadMeasurementData() {
    // Your existing loadMeasurementData function...
}
function extractMeasurementInfo(linkText, measurementData, query) {
    // Your existing extractMeasurementInfo function...
}
function displayNoResults(query) {
    // Your existing displayNoResults function...
}
function getVirtualPediatricMeasurements(query) {
    // Your existing getVirtualPediatricMeasurements function...
}

// Sidebar and Calculator functionality
function setupEventListeners() {
  const themeToggleBtn = document.getElementById('themeToggleBtn');
  if (themeToggleBtn) themeToggleBtn.addEventListener('click', toggleTheme);

  const aiButton = document.getElementById('aiButton');
  if (aiButton) aiButton.addEventListener('click', () => window.open('cerebrai.html', '_blank'));

  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    let searchTimeout;
    searchInput.addEventListener('input', (e) => {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => filterResources(e.target.value), 150);
    });
    searchInput.addEventListener('focus', (e) => {
      expandSearch(e.target);
      if (e.target.value.trim() !== '') filterResources(e.target.value);
    });
    searchInput.addEventListener('blur', (e) => contractSearch(e.target));
    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        e.target.value = '';
        filterResources('');
        e.target.blur();
      }
    });
  }

  const tabs = document.querySelectorAll('.tab[data-tab]');
  tabs.forEach(tab => {
    tab.addEventListener('click', function() {
      showTab(this.getAttribute('data-tab'), this);
    });
  });

  setupSidebarEventListeners();
  setupCalculatorEventListeners();
}

function setupSidebarEventListeners() {
  const sidebarToggle = document.getElementById('sidebarToggle');
  if (sidebarToggle) {
    sidebarToggle.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      toggleSidebar();
    });
  }
}

function toggleSidebar() {
  const sidebar = document.getElementById('floatingSidebar');
  if (sidebar) {
    sidebar.classList.toggle('expanded');
    const toggleIcon = sidebar.querySelector('.toggle-icon');
    if (toggleIcon) {
      toggleIcon.innerHTML = sidebar.classList.contains('expanded') ? '×' : '⊞';
    }
  }
}

document.addEventListener('click', function(event) {
  const sidebar = document.getElementById('floatingSidebar');
  const isClickInside = sidebar && sidebar.contains(event.target);
  const isToggleButton = event.target.closest('#sidebarToggle');
  if (sidebar && sidebar.classList.contains('expanded') && !isClickInside && !isToggleButton) {
    toggleSidebar();
  }
});

document.addEventListener('keydown', function(event) {
  if (event.key === 'Escape') {
    const sidebar = document.getElementById('floatingSidebar');
    if (sidebar && sidebar.classList.contains('expanded')) {
      toggleSidebar();
    }
  }
});

// (Keep your calculator functions here...)
function setupCalculatorEventListeners() { /* ... */ }
let currentInput = '0';
let operator = null;
let waitingForNewInput = false;
function updateDisplay() { /* ... */ }
function appendToDisplay(value) { /* ... */ }
function clearCalculator() { /* ... */ }
function clearEntry() { /* ... */ }
function deleteLast() { /* ... */ }
function calculateResult() { /* ... */ }


// ===================================================================
// MAIN INITIALIZATION LOGIC
// ===================================================================
function showMainContent() {
    const splashScreen = document.getElementById('splashScreen');
    const mainContent = document.getElementById('mainContent');
    
    splashScreen.style.display = 'none';
    mainContent.style.display = 'flex'; // Use flex to match your CSS
    mainContent.classList.add('show');

    // Initialize everything that needs the main content to be visible
    initializeTheme();
    setupEventListeners();
    setupFavoritesSystem();

    // Set the default active tab
    const firstTab = document.querySelector('.tabs .tab');
    if (firstTab) {
        showTab(firstTab.getAttribute('data-tab'), firstTab);
    }
}

document.addEventListener('DOMContentLoaded', function() {
  console.log('DOM loaded, starting initialization...');

  const enterSiteButton = document.getElementById('enterSiteBtn');
  if (enterSiteButton) {
    enterSiteButton.addEventListener('click', enterSite);
  }

  if (sessionStorage.getItem('splashSeen') === 'true') {
    showMainContent();
  }
});