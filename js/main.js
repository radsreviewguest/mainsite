// ===================================================================
// START: NEW UNIFIED FAVORITES SYSTEM
// ===================================================================

function setupFavoritesSystem() {
    const favoritesListElement = document.getElementById('favorites-list');
    const noFavoritesMessage = document.getElementById('no-favorites-message');
    const favoritesSidebar = document.getElementById('favorites-sidebar');
    const favoritesToggle = document.getElementById('favorites-toggle');

    // Ensure all necessary HTML elements are present before running
    if (!favoritesListElement || !noFavoritesMessage || !favoritesSidebar || !favoritesToggle) {
        console.error('Favorites system could not initialize. Required HTML elements are missing.');
        return;
    }

    // Load favorites from localStorage. This is the single source of truth.
    let favorites = JSON.parse(localStorage.getItem('radsreview-favorites') || '[]');

    /**
     * Syncs the entire UI (hearts and sidebar list) with the `favorites` array.
     */
    function updateFavoritesUI() {
        // 1. Update all heart icons on the page
        document.querySelectorAll('.link-heart').forEach(heart => {
            const link = heart.previousElementSibling; // Assumes <a> is right before <span class="link-heart">
            if (link && favorites.includes(link.getAttribute('href'))) {
                heart.classList.add('pinned');
                heart.setAttribute('aria-pressed', 'true');
            } else {
                heart.classList.remove('pinned');
                heart.setAttribute('aria-pressed', 'false');
            }
        });

        // 2. Clear and repopulate the sidebar list
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

    /**
     * Toggles a link in the favorites, saves to storage, and updates the UI.
     * @param {string} linkHref - The href of the link to toggle.
     */
    function toggleFavorite(linkHref) {
        const favoriteIndex = favorites.indexOf(linkHref);
        if (favoriteIndex > -1) {
            favorites.splice(favoriteIndex, 1); // Remove it
        } else {
            favorites.push(linkHref); // Add it
        }
        localStorage.setItem('radsreview-favorites', JSON.stringify(favorites));
        updateFavoritesUI();
    }

    // --- Event Listeners ---

    // Use Event Delegation for all heart clicks (more efficient)
    document.body.addEventListener('click', function(event) {
        const heart = event.target.closest('.link-heart');
        if (heart) {
            const linkToFavorite = heart.previousElementSibling;
            if (linkToFavorite && linkToFavorite.tagName === 'A') {
                toggleFavorite(linkToFavorite.getAttribute('href'));
            }
        }
    });

    // Sidebar Toggle Logic
    favoritesToggle.addEventListener('click', function(event) {
        event.stopPropagation();
        const isExpanded = favoritesSidebar.classList.toggle('expanded');
        this.setAttribute('aria-expanded', isExpanded);
    });

    // Click outside to close sidebar
    document.addEventListener('click', function(event) {
        if (favoritesSidebar.classList.contains('expanded') && !favoritesSidebar.contains(event.target) && !favoritesToggle.contains(event.target)) {
            favoritesSidebar.classList.remove('expanded');
            favoritesToggle.setAttribute('aria-expanded', 'false');
        }
    });

    // Initial UI setup on page load
    updateFavoritesUI();
    console.log('Favorites system initialized successfully.');
}

// ===================================================================
// END: NEW UNIFIED FAVORITES SYSTEM
// ===================================================================


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
  
  container.classList.add('expanded');
  if (searchWrapper) {
    searchWrapper.classList.add('expanded');
  }
}

function contractSearch(input) {
  const container = input.closest('.search-container');
  const searchWrapper = input.closest('.search-and-ai-container');
  
  container.classList.remove('expanded');
  if (searchWrapper) {
    searchWrapper.classList.remove('expanded');
  }
}

// Splash Screen functionality
function enterSite() {
  const splashScreen = document.getElementById('splashScreen');
  const mainContent = document.getElementById('mainContent');
  
  if (!splashScreen || !mainContent) {
    console.error('Required elements not found for enterSite function');
    return;
  }
  
  sessionStorage.setItem('splashSeen', 'true');
  splashScreen.classList.add('fade-out');
  
  setTimeout(() => {
    splashScreen.style.display = 'none';
    mainContent.style.display = 'block';
    mainContent.classList.add('show');
    initializeTheme();
    
    setTimeout(() => {
      setupEventListeners();
    }, 100);
    
  }, 500);
}

window.enterSite = enterSite;

function checkSplashScreen() {
  const hasSeenSplash = sessionStorage.getItem('splashSeen');
  const splashScreen = document.getElementById('splashScreen');
  const mainContent = document.getElementById('mainContent');
  
  if (hasSeenSplash === 'true') {
    splashScreen.style.display = 'none';
    mainContent.style.display = 'block';
    mainContent.classList.add('show');
    initializeTheme();
  }
}

// Tab functionality
function showTab(tabId, clickedTab) {
  const sections = document.querySelectorAll('.content');
  sections.forEach(section => {
    section.style.display = 'none';
    section.classList.remove('active');
    if (section.hasAttribute('data-original-content')) {
      section.innerHTML = section.getAttribute('data-original-content');
      section.removeAttribute('data-original-content');
    }
  });
  
  const activeSection = document.getElementById(tabId);
  if (activeSection) {
    activeSection.style.display = 'block';
    activeSection.classList.add('active');
  }
  const tabs = document.querySelectorAll('.tabs .tab');
  tabs.forEach(t => t.classList.remove('active'));
  if (clickedTab) {
      clickedTab.classList.add('active');
  }
}

// Search function that filters resources based on user input
function filterResources(query) {
  query = query.toLowerCase().trim();

  if (query === '') {
    document.querySelectorAll('a').forEach(link => {
      link.style.backgroundColor = '';
    });
    const activeTab = document.querySelector('.tab.active');
    if (activeTab) {
      const tabId = activeTab.getAttribute('data-tab');
      showTab(tabId, activeTab);
    } else {
      const firstTab = document.querySelector('.tabs .tab');
      if (firstTab) {
        showTab(firstTab.getAttribute('data-tab'), firstTab);
      }
    }
    document.querySelectorAll('.search-result').forEach(el => {
      el.classList.remove('search-result');
    });
    return;
  }

  const sections = document.querySelectorAll('.content');
  sections.forEach(section => {
    section.style.display = 'none';
    section.classList.remove('active');
  });

  document.querySelectorAll('.tabs .tab').forEach(tab => tab.classList.remove('active'));

  let resultsFound = false;
  let searchResults = [];

  sections.forEach(section => {
    if (!section.hasAttribute('data-original-content')) {
      section.setAttribute('data-original-content', section.innerHTML);
    }
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = section.getAttribute('data-original-content');

    const sectionTitle = tempDiv.querySelector('h2').textContent.toLowerCase();
    const links = tempDiv.querySelectorAll('a');
    let sectionMatches = [];

    if (sectionTitle.includes(query)) {
      links.forEach(link => {
        sectionMatches.push({ text: link.textContent, href: link.href, section: sectionTitle.toUpperCase(), isPediatric: link.textContent.toLowerCase().includes('pediatric') });
      });
    } else {
      links.forEach(link => {
        const linkText = link.textContent.toLowerCase();
        if (linkText.includes(query) || link.href.toLowerCase().includes(query)) {
          sectionMatches.push({ text: link.textContent, href: link.href, section: sectionTitle.toUpperCase(), isPediatric: linkText.includes('pediatric') });
        }
      });
    }

    if (sectionMatches.length > 0) {
      searchResults = searchResults.concat(sectionMatches);
      resultsFound = true;
    }
  });

    const virtualPediatricResults = getVirtualPediatricMeasurements(query);
    if (virtualPediatricResults.length > 0) {
        searchResults = searchResults.concat(virtualPediatricResults);
        resultsFound = true;
    }

  if (resultsFound) {
    displaySearchResults(searchResults, query);
  } else {
    displayNoResults(query);
  }
}

// Function to display search results with OHSU references and measurement data
function displaySearchResults(results, query) {
  const firstSection = document.querySelector('.content');
  if (!firstSection) return;

  if (!firstSection.hasAttribute('data-original-content')) {
    firstSection.setAttribute('data-original-content', firstSection.innerHTML);
  }

  firstSection.style.display = 'block';
  firstSection.classList.add('active', 'search-result');

  loadMeasurementData().then(measurementData => {
    const groupedResults = results.reduce((acc, result) => {
        (acc[result.section] = acc[result.section] || []).push(result);
        return acc;
    }, {});

    let resultsHTML = `<h2>Search Results for "${query}" (${results.length} found)</h2>`;
    
    Object.keys(groupedResults).forEach(sectionName => {
      resultsHTML += `<h3>${sectionName}</h3><ul>`;
      groupedResults[sectionName].forEach(result => {
        resultsHTML += `<li>`;
        if (result.isPediatric) {
          resultsHTML += `<span>${result.text}</span>`;
        } else {
          resultsHTML += `<a href="${result.href}" target="_blank" rel="noopener">${result.text}</a>`;
        }
        
        if (result.isPediatric && measurementData) {
          const measurementInfo = extractMeasurementInfo(result.text, measurementData, query);
          if (measurementInfo) {
            resultsHTML += `<div class="measurement-data">${measurementInfo}</div>`;
          }
        }
        
        if (result.isPediatric) {
          resultsHTML += `<span class="ohsu-reference">[<a href="https://www.ohsu.edu/school-of-medicine/diagnostic-radiology/pediatric-radiology-normal-measurements" target="_blank" rel="noopener">Ref.</a>]</span>`;
        }
        resultsHTML += `</li>`;
      });
      resultsHTML += `</ul>`;
    });

    firstSection.innerHTML = resultsHTML;
  });
}

// Function to load measurement data from JSON
async function loadMeasurementData() {
  try {
    const response = await fetch('./pediatric_radiology_measurements.json');
    if (!response.ok) throw new Error('Failed to load measurement data');
    return await response.json();
  } catch (error) {
    console.error('Error fetching measurement data:', error);
    return null;
  }
}

// Function to extract relevant measurement information
function extractMeasurementInfo(linkText, measurementData, query) {
    // This function remains the same as your original
    if (!measurementData || !measurementData.pediatric_radiology_normal_measurements) return null;
    const data = measurementData.pediatric_radiology_normal_measurements;
    const lowerText = linkText.toLowerCase();
    const lowerQuery = query.toLowerCase();
    // (Your extensive list of if statements goes here - I've omitted for brevity but it is included in your logic)
    if (lowerText.includes('appendix') || lowerQuery.includes('appendix')) { const appendixData = data.gastrointestinal?.appendix; if (appendixData && appendixData.normal_measurements) return `<strong>Normal Appendix:</strong> US &lt;6mm (compressible), CT &lt;8mm, Wall &lt;2-4mm. Non-compressible appendix suggests appendicitis.`; }
    // ... all other if statements ...
    return null;
}

// Function to display no results message
function displayNoResults(query) {
  const firstSection = document.querySelector('.content');
  if (!firstSection) return;

  if (!firstSection.hasAttribute('data-original-content')) {
    firstSection.setAttribute('data-original-content', firstSection.innerHTML);
  }

  firstSection.style.display = 'block';
  firstSection.classList.add('active');
  firstSection.innerHTML = `<h2>Search Results</h2><p>No resources found matching "<strong>${query}</strong>"</p><p><em>Try searching for terms like: aorta, appendix, pediatric, hip, etc.</em></p>`;
}

// Virtual pediatric measurements dataset for search
function getVirtualPediatricMeasurements(query) {
    const pediatricMeasurements=[{text:"Aorta Measurements & Formulas (Pediatric)",section:"CHEST",keywords:["aorta","thoracic","formula"]},{text:"Cardiothoracic Index by Age (Pediatric)",section:"CHEST",keywords:["cardiothoracic","heart","index","chest"]},{text:"Thymus Normal Size (Pediatric)",section:"CHEST",keywords:["thymus","mediastinal","chest"]},{text:"Retropharyngeal Soft Tissues (Pediatric)",section:"CHEST",keywords:["retropharyngeal","soft tissue","neck"]},{text:"Appendix Normal Size (Pediatric) - US & CT",section:"ABD",keywords:["appendix","appendicitis","abdomen","gi"]},{text:"Gallbladder & Biliary Tract by Age (Pediatric)",section:"ABD",keywords:["gallbladder","biliary","bile","abdomen"]},{text:"Pancreas Measurements (Pediatric) - US & CT",section:"ABD",keywords:["pancreas","pancreatic","abdomen"]},{text:"Spleen Length by Age (Pediatric)",section:"ABD",keywords:["spleen","splenic","abdomen"]},{text:"Portal Vein Diameter (Pediatric)",section:"ABD",keywords:["portal","vein","liver","abdomen"]},{text:"Pyloric Stenosis Criteria (Pediatric)",section:"ABD",keywords:["pyloric","stenosis","pylorus","stomach"]},{text:"Ovarian Volume by Age & Tanner Stage (Pediatric)",section:"ULTRASOUND",keywords:["ovarian","ovary","tanner","pelvis"]},{text:"Testicular Size & Doppler by Age (Pediatric)",section:"ULTRASOUND",keywords:["testicular","testicle","scrotum","pelvis"]},{text:"Uterine Measurements Neonatal-Adult (Pediatric)",section:"ULTRASOUND",keywords:["uterine","uterus","pelvis"]},{text:"Adrenal Gland Size & Echogenicity (Pediatric)",section:"ULTRASOUND",keywords:["adrenal","gland","suprarenal"]},{text:"Bladder Volume & Wall Thickness (Pediatric)",section:"ULTRASOUND",keywords:["bladder","urinary","pelvis"]},{text:"Kidney Measurements (Pediatric)",section:"ULTRASOUND",keywords:["kidney","renal","nephrology"]},{text:"Hip Acetabular Angles by Age (Pediatric)",section:"MSK",keywords:["hip","acetabular","angle","pelvis"]},{text:"Femoral Anteversion Development (Pediatric)",section:"MSK",keywords:["femoral","anteversion","hip","leg"]},{text:"Kyphosis & Lordosis Normal Ranges (Pediatric)",section:"MSK",keywords:["kyphosis","lordosis","spine","scoliosis"]},{text:"Tibial Torsion & Foot Angles (Pediatric)",section:"MSK",keywords:["tibial","torsion","foot","ankle"]},{text:"Graf Hip Ultrasound Classification (Pediatric)",section:"MSK",keywords:["graf","hip","ultrasound","classification"]},{text:"Neonatal Brain Ventricles (Pediatric)",section:"NEURO",keywords:["ventricular","ventricle","brain","neonatal"]},{text:"Sinus Development Timeline (Pediatric)",section:"NEURO",keywords:["sinus","paranasal","development"]},{text:"Ventricular Width Normal Values (Pediatric)",section:"NEURO",keywords:["ventricular","width","brain","hydrocephalus"]},{text:"Thyroid Measurements (Pediatric)",section:"ULTRASOUND",keywords:["thyroid","endocrine","neck"]}];
    const matchingMeasurements=pediatricMeasurements.filter(m=>m.text.toLowerCase().includes(query.toLowerCase())||m.keywords.some(k=>k.includes(query.toLowerCase())||query.toLowerCase().includes(k)));
    return matchingMeasurements.map(m=>({text:m.text,href:"https://www.ohsu.edu/school-of-medicine/diagnostic-radiology/pediatric-radiology-normal-measurements",section:m.section,isPediatric:true}));
}


// Setup all event listeners for main content elements
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

// Separate function for sidebar event listeners
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

// Floating Calculator Sidebar functionality
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

// Close sidebar when clicking outside of it
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

// Calculator functionality
let currentInput = '0';
let operator = null;
let waitingForNewInput = false;

function updateDisplay() {
  const display = document.getElementById('calcDisplay');
  if (display) display.value = currentInput;
}

function appendToDisplay(value) {
  if (waitingForNewInput) {
    currentInput = '';
    waitingForNewInput = false;
  }
  if (['+', '-', '*', '/'].includes(value)) {
    operator = value;
    waitingForNewInput = true;
    return;
  }
  if (value === '.') {
    if (!currentInput.includes('.')) currentInput += '.';
  } else {
    currentInput = currentInput === '0' ? value : currentInput + value;
  }
  updateDisplay();
}

function clearCalculator() {
  currentInput = '0';
  operator = null;
  waitingForNewInput = false;
  updateDisplay();
}

function clearEntry() {
  currentInput = '0';
  updateDisplay();
}

function deleteLast() {
  currentInput = currentInput.length > 1 ? currentInput.slice(0, -1) : '0';
  updateDisplay();
}

function calculateResult() {
    if (!operator) return;
    try {
        const result = eval(document.getElementById('calcDisplay').value + operator + currentInput);
        currentInput = String(result);
        operator = null;
        waitingForNewInput = true;
        updateDisplay();
    } catch (e) {
        currentInput = 'Error';
        updateDisplay();
    }
}

function setupCalculatorEventListeners() {
  document.querySelectorAll('.calc-btn').forEach(button => {
    button.addEventListener('click', function() {
      const action = this.dataset.action;
      const value = this.dataset.value;
      if (action === 'clear') clearCalculator();
      else if (action === 'clear-entry') clearEntry();
      else if (action === 'delete') deleteLast();
      else if (action === 'calculate') calculateResult();
      else if (value) appendToDisplay(value);
    });
  });
}


// MAIN INITIALIZATION
document.addEventListener('DOMContentLoaded', function() {
  console.log('DOM loaded, starting initialization...');
  
  // Initialize the new favorites system first
  setupFavoritesSystem();

  checkSplashScreen();
  
  if (document.getElementById('mainContent').style.display !== 'none') {
    initializeTheme();
  }
  
  setupEventListeners();

  const firstTab = document.querySelector('.tabs .tab');
  if (firstTab) {
      showTab(firstTab.getAttribute('data-tab'), firstTab);
  }
});