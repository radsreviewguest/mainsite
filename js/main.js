// Theme Management
function initializeTheme() {
  const savedTheme = localStorage.getItem('theme') || 'dark';
  document.body.setAttribute('data-theme', savedTheme);
  updateThemeIcon(savedTheme);
  updateLogo(savedTheme);
}

function toggleTheme() {
  const currentTheme = document.body.getAttribute('data-theme') || 'dark';
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  
  document.body.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme', newTheme);
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

// Search Animation Functions
function expandSearch(input) {
  const container = input.closest('.search-container');
  const searchWrapper = input.closest('.search-and-ai-container');
  
  // Add expanded class with smooth transition
  container.classList.add('expanded');
  if (searchWrapper) {
    searchWrapper.classList.add('expanded');
  }
}

function contractSearch(input) {
  const container = input.closest('.search-container');
  const searchWrapper = input.closest('.search-and-ai-container');
  
  // Remove expanded class immediately for fluid animation
  container.classList.remove('expanded');
  if (searchWrapper) {
    searchWrapper.classList.remove('expanded');
  }
}

// Splash Screen functionality
function enterSite() {
  const splashScreen = document.getElementById('splashScreen');
  const mainContent = document.getElementById('mainContent');
  
  // Mark that splash has been seen this session
  sessionStorage.setItem('splashSeen', 'true');
  
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

// Check if splash should be shown
function checkSplashScreen() {
  const hasSeenSplash = sessionStorage.getItem('splashSeen');
  const splashScreen = document.getElementById('splashScreen');
  const mainContent = document.getElementById('mainContent');
  
  if (hasSeenSplash === 'true') {
    // Skip splash screen, go directly to main content
    splashScreen.style.display = 'none';
    mainContent.style.display = 'block';
    mainContent.classList.add('show');
    initializeTheme();
  }
  // If hasSeenSplash is null/false, splash screen will show by default
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
  // Register service worker for performance optimization
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
        .then(registration => {
          console.log('SW registered: ', registration);
        })
        .catch(registrationError => {
          console.log('SW registration failed: ', registrationError);
        });
    });
  }
  
  // Check if splash screen should be shown
  checkSplashScreen();
  
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

  // Mobile-specific optimizations
  addMobileOptimizations();
});

// Mobile optimization functions
function addMobileOptimizations() {
  // Detect if device is mobile
  const isMobile = window.innerWidth <= 768 || /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  
  if (isMobile) {
    // Add touch event handlers for better mobile interaction
    addTouchHandlers();
    
    // Prevent zoom on input focus for iOS
    preventInputZoom();
    
    // Optimize scroll behavior
    optimizeScrolling();
    
    // Add viewport height fix for mobile browsers
    fixMobileViewport();
  }
}

function addTouchHandlers() {
  // Add touch feedback for tabs
  const tabs = document.querySelectorAll('.tab');
  tabs.forEach(tab => {
    tab.addEventListener('touchstart', function() {
      this.style.transform = 'scale(0.95)';
    });
    
    tab.addEventListener('touchend', function() {
      setTimeout(() => {
        this.style.transform = '';
      }, 150);
    });
  });
  
  // Add touch feedback for buttons
  const buttons = document.querySelectorAll('button, .splash-enter-btn');
  buttons.forEach(button => {
    button.addEventListener('touchstart', function() {
      this.style.transform = 'scale(0.95)';
    });
    
    button.addEventListener('touchend', function() {
      setTimeout(() => {
        this.style.transform = '';
      }, 150);
    });
  });
}

function preventInputZoom() {
  // Prevent zoom on input focus for iOS devices
  const inputs = document.querySelectorAll('input[type="text"], input[type="search"]');
  inputs.forEach(input => {
    input.addEventListener('focus', function() {
      // Temporarily set font-size to 16px to prevent zoom
      this.style.fontSize = '16px';
    });
    
    input.addEventListener('blur', function() {
      // Reset font-size after blur
      this.style.fontSize = '';
    });
  });
}

function optimizeScrolling() {
  // Add smooth scrolling behavior
  document.documentElement.style.scrollBehavior = 'smooth';
  
  // Debounce scroll events for better performance
  let scrollTimer = null;
  const originalScrollHandler = window.onscroll;
  
  window.addEventListener('scroll', function() {
    if (scrollTimer !== null) {
      clearTimeout(scrollTimer);
    }
    scrollTimer = setTimeout(function() {
      if (originalScrollHandler) {
        originalScrollHandler();
      }
    }, 16); // ~60fps
  }, { passive: true });
}

function fixMobileViewport() {
  // Fix for mobile browsers that change viewport height when address bar shows/hides
  function setVH() {
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
  }
  
  setVH();
  window.addEventListener('resize', setVH);
  window.addEventListener('orientationchange', () => {
    setTimeout(setVH, 100);
  });
}

// Enhanced search function for mobile
function filterResources(query) {
  const allSections = document.querySelectorAll('.content');
  let hasResults = false;

  allSections.forEach(section => {
    // Store original content if not already stored
    if (!section.hasAttribute('data-original-content')) {
      section.setAttribute('data-original-content', section.innerHTML);
    }

    const originalContent = section.getAttribute('data-original-content');
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = originalContent;

    if (query.trim() === '') {
      // If query is empty, restore original content
      section.innerHTML = originalContent;
      section.style.display = section.classList.contains('active') ? 'block' : 'none';
    } else {
      const links = tempDiv.querySelectorAll('a');
      const matchingLinks = Array.from(links).filter(link =>
        link.textContent.toLowerCase().includes(query.toLowerCase()) ||
        link.href.toLowerCase().includes(query.toLowerCase())
      );

      if (matchingLinks.length > 0) {
        hasResults = true;
        // Show section and highlight matching content
        section.style.display = 'block';
        section.classList.add('active');
        
        // Create filtered content
        const filteredHTML = `
          <h2>${tempDiv.querySelector('h2').textContent}</h2>
          <ul>
            ${matchingLinks.map(link => `<li>${link.outerHTML}</li>`).join('')}
          </ul>
        `;
        section.innerHTML = filteredHTML;
      } else {
        section.style.display = 'none';
        section.classList.remove('active');
      }
    }
  });

  // On mobile, scroll to first result if search has results
  if (hasResults && query.trim() !== '' && window.innerWidth <= 768) {
    const firstVisibleSection = document.querySelector('.content[style*="block"]');
    if (firstVisibleSection) {
      firstVisibleSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
}
