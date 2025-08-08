// Theme Management
function initializeTheme() {
  const savedTheme = localStorage.getItem('theme') || 'dark';
  document.body.setAttribute('data-theme', savedTheme);
  updateThemeIcon(savedTheme);
}

function toggleTheme() {
  const currentTheme = document.body.getAttribute('data-theme') || 'dark';
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  
  document.body.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme', newTheme);
  updateThemeIcon(newTheme);
}

function updateThemeIcon(theme) {
  const themeIcon = document.querySelector('.theme-icon');
  if (themeIcon) {
    themeIcon.textContent = theme === 'dark' ? '☀' : '◐';
  }
}

// Search Animation Functions
function expandSearch(input) {
  const container = input.closest('.search-container');
  const searchWrapper = input.closest('.search');
  container.classList.add('expanded');
  searchWrapper.classList.add('expanded');
}

function contractSearch(input) {
  const container = input.closest('.search-container');
  const searchWrapper = input.closest('.search');
  setTimeout(() => {
    container.classList.remove('expanded');
    searchWrapper.classList.remove('expanded');
  }, 100);
}

// Splash Screen functionality
function enterSite() {
  const splashScreen = document.getElementById('splashScreen');
  const mainContent = document.getElementById('mainContent');
  
  // Fade out splash screen
  splashScreen.classList.add('fade-out');
  
  // After animation completes, hide splash and show main content
  setTimeout(() => {
    splashScreen.style.display = 'none';
    mainContent.style.display = 'block';
    mainContent.classList.add('show');
    // Initialize theme after entering main content
    initializeTheme();
  }, 500);
}

// Tab functionality
function showTab(tabId, clickedTab) {
  // Hide all content sections
  const sections = document.querySelectorAll('.content');
  sections.forEach(section => {
    section.style.display = 'none';
    section.classList.remove('active');

    // Restore original content if it was modified by search
    if (section.hasAttribute('data-original-content')) {
      section.innerHTML = section.getAttribute('data-original-content');
      section.removeAttribute('data-original-content');
    }
  });
  // Show the target content section
  const activeSection = document.getElementById(tabId);
  if (activeSection) {
    activeSection.style.display = 'block';
    activeSection.classList.add('active');
  }
  // Update tab appearance
  const tabs = document.querySelectorAll('.tabs .tab');
  // First, remove .active class from ALL tabs that have it
  tabs.forEach(t => t.classList.remove('active'));

  // Then, add the .active class ONLY to the tab that was clicked
  if (clickedTab) {
      clickedTab.classList.add('active');
  }
}

// Search function that filters resources based on user input
function filterResources(query) {
  query = query.toLowerCase().trim();

  // If search is empty, reset to normal tab state
  if (query === '') {
    // Reset any highlighted links
    document.querySelectorAll('a').forEach(link => {
      link.style.backgroundColor = '';
    });

    // Find which tab was active before searching
    const activeTab = document.querySelector('.tab.active');
    if (activeTab) {
      // Convert tab name to ID format (for example "ABDOMEN" -> "abd")
      const tabId = activeTab.querySelector('h2').textContent.toLowerCase().replace(/\s+/g, '');
      showTab(tabId, activeTab);
    } else {
      // Fallback to first tab if none is active
      const firstTab = document.querySelector('.tabs .tab');
      const firstTabId = firstTab.querySelector('h2').textContent.toLowerCase().replace(/\s+/g, '');
      showTab(firstTabId, firstTab);
    }

    // Remove any search-result classes
    document.querySelectorAll('.search-result').forEach(el => {
      el.classList.remove('search-result');
    });

    return;
  }

  // Hide all content sections first
  const sections = document.querySelectorAll('.content');
  sections.forEach(section => {
    section.style.display = 'none';
    section.classList.remove('active');
  });

  // Clear active state from all tabs
  const tabs = document.querySelectorAll('.tabs .tab');
  tabs.forEach(tab => tab.classList.remove('active'));

  let resultsFound = false;

  // Loop through all sections and show matching results
  sections.forEach(section => {
    const sectionTitle = section.querySelector('h2').textContent.toLowerCase();
    const links = section.querySelectorAll('a');
    let sectionHasMatches = sectionTitle.includes(query);

    // Check if any links in this section match
    links.forEach(link => {
      const linkText = link.textContent.toLowerCase();
      if (linkText.includes(query)) {
        sectionHasMatches = true;
        link.style.backgroundColor = '#ffffcc'; // Highlight matching links
      } else {
        link.style.backgroundColor = ''; // Reset highlight
      }
    });

    // Show sections with matches
    if (sectionHasMatches) {
      section.style.display = 'block';
      section.classList.add('search-result');
      resultsFound = true;
    }
  });

  // If no results found, show a message
  if (!resultsFound) {
    const firstSection = document.querySelector('.content');
    if (firstSection) {
      firstSection.style.display = 'block';
      firstSection.classList.add('active');
      // Store original content before replacing
      if (!firstSection.hasAttribute('data-original-content')) {
        firstSection.setAttribute('data-original-content', firstSection.innerHTML);
      }
      firstSection.innerHTML = `<h2>Search Results</h2><p>No resources found matching "${query}"</p>`;
    }
  }
}

// Initialize page when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  // Initialize theme if main content is visible (not on splash)
  const mainContent = document.getElementById('mainContent');
  if (mainContent && mainContent.style.display !== 'none') {
    initializeTheme();
  }
  
  // Set initial active tab
  showTab('abd', document.querySelector('.tabs .tab'));

  // Highlight hero on load
  const hero = document.querySelector('.hero');
  if (hero) {
    hero.classList.add('highlight');
  }

  // Add scroll event for hero highlight effect
  window.addEventListener('scroll', function() {
    if (hero) {
      if (window.scrollY > 20) {
        hero.classList.remove('highlight');
      } else {
        hero.classList.add('highlight');
      }
    }
  });
});
