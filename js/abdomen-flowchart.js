// Abdomen Flowchart Interactive JavaScript
// Variables for flowchart state management
let currentStep = 1;
let stepHistory = [1];
let isZoomed = false;
let navigationHistory = [];
let isPanMode = false;
let isPanning = false;
let panStartX = 0;
let panStartY = 0;
let currentPanX = 0;
let currentPanY = 0;
let isMobile = window.innerWidth <= 768;

// Mobile detection and touch handling
function checkMobile() {
    isMobile = window.innerWidth <= 768 || 'ontouchstart' in window;
}

// Mobile-optimized zoom positions
const zoomPositions = {
    'start': { x: isMobile ? -200 : -400, y: isMobile ? 20 : 30 },
    'level1': { x: isMobile ? -200 : -400, y: isMobile ? 20 : 30 },
    'benign': { x: isMobile ? -100 : -200, y: isMobile ? 150 : 250 },
    'indeterminate': { x: isMobile ? -200 : -400, y: isMobile ? 120 : 200 },
    'size': { x: isMobile ? -250 : -500, y: isMobile ? 180 : 300 },
    'large': { x: isMobile ? -350 : -650, y: isMobile ? 250 : 400 },
    'small': { x: isMobile ? -175 : -350, y: isMobile ? 250 : 400 },
    'prior': { x: isMobile ? -150 : -300, y: isMobile ? 320 : 520 },
    'enlarging': { x: isMobile ? -200 : -400, y: isMobile ? 420 : 680 },
    'ct': { x: isMobile ? -275 : -550, y: isMobile ? 520 : 850 },
    'washout': { x: isMobile ? -300 : -600, y: isMobile ? 600 : 1000 }
};

// Main navigation function for selecting flowchart paths
function selectPath(path) {
    // Save current state to navigation history
    navigationHistory.push({
        step: currentStep,
        highlights: getCurrentHighlights(),
        zoomState: isZoomed,
        zoomPosition: isZoomed ? { 
            x: document.querySelector('.flowchart-svg').style.getPropertyValue('--zoom-x'),
            y: document.querySelector('.flowchart-svg').style.getPropertyValue('--zoom-y')
        } : null
    });
    
    clearHighlights();
    
    switch(path) {
        case 'benign':
            highlightNode('node-benign-result');
            updateStep('Assessment Complete: Benign lesion, no follow-up needed');
            zoomToArea(zoomPositions.benign.x, zoomPositions.benign.y);
            break;
        case 'indeterminate':
            highlightNodes(['node-size-small', 'node-size-large']);
            updateStep('Size Assessment: Choose appropriate size category');
            zoomToArea(zoomPositions.size.x, zoomPositions.size.y);
            break;
        case 'size-large':
            highlightNodes(['node-large-no-cancer', 'node-large-cancer']);
            updateStep('Large Mass Management: Based on cancer history');
            zoomToArea(zoomPositions.large.x, zoomPositions.large.y);
            break;
        case 'size-small':
            highlightNodes(['node-prior', 'node-no-prior']);
            updateStep('Clinical Assessment: Prior imaging and cancer history');
            zoomToArea(zoomPositions.small.x, zoomPositions.small.y);
            break;
        case 'prior':
            highlightNodes(['node-stable', 'node-enlarging']);
            updateStep('Stability Assessment: Compare with prior imaging');
            zoomToArea(zoomPositions.prior.x, zoomPositions.prior.y);
            break;
        case 'no-prior':
            highlightNodes(['node-small-benign', 'node-medium']);
            updateStep('Further Evaluation: Size-based approach');
            zoomToArea(zoomPositions.small.x, zoomPositions.small.y + 150);
            break;
        case 'enlarging':
            updateStep('Assessment Complete: Consider advanced imaging or resection');
            zoomToArea(zoomPositions.enlarging.x, zoomPositions.enlarging.y);
            break;
        case 'ct':
            highlightNodes(['node-ct-benign', 'node-ct-washout']);
            updateStep('CT Assessment: Based on unenhanced CT values');
            zoomToArea(zoomPositions.ct.x, zoomPositions.ct.y);
            break;
        case 'washout':
            highlightNodes(['node-washout-benign', 'node-washout-indeterminate']);
            updateStep('Washout Study: APW/RPW percentage evaluation');
            zoomToArea(zoomPositions.washout.x, zoomPositions.washout.y);
            break;
        case 'final':
            updateStep('Assessment Complete: Follow recommended management');
            break;
    }
    
    stepHistory.push(currentStep + 1);
    currentStep++;
    updateProgress();
    updateNavigation();
}

// Zoom functionality
function zoomToArea(x, y) {
    const svg = document.querySelector('.flowchart-svg');
    svg.classList.remove('full-view');
    svg.classList.add('zoomed');
    svg.style.setProperty('--zoom-x', x + 'px');
    svg.style.setProperty('--zoom-y', y + 'px');
    isZoomed = true;
    
    document.getElementById('fullViewBtn').textContent = 'See Full Algorithm';
    document.getElementById('zoomOutBtn').style.display = 'block';
}

function zoomOut() {
    // Show 2 levels above current position by reducing zoom and adjusting position
    if (isZoomed) {
        const svg = document.querySelector('.flowchart-svg');
        const currentX = parseFloat(svg.style.getPropertyValue('--zoom-x').replace('px', '')) || 0;
        const currentY = parseFloat(svg.style.getPropertyValue('--zoom-y').replace('px', '')) || 0;
        
        // Reduce zoom to show more context (2 levels up)
        svg.classList.remove('zoomed');
        svg.classList.add('zoomed');
        svg.style.setProperty('--zoom-x', (currentX * 0.7) + 'px');
        svg.style.setProperty('--zoom-y', (currentY * 0.7 - 100) + 'px');
        
        // Update the CSS scale for zoom out level
        svg.style.transform = 'scale(0.8) translate(var(--zoom-x, 0px), var(--zoom-y, 0px))';
    }
}

function showFullAlgorithm() {
    const svg = document.querySelector('.flowchart-svg');
    svg.classList.remove('zoomed');
    svg.classList.add('full-view');
    svg.style.transform = ''; // Clear any custom transforms
    svg.style.removeProperty('--zoom-x');
    svg.style.removeProperty('--zoom-y');
    isZoomed = false;
    document.getElementById('fullViewBtn').textContent = 'Zoom In';
    document.getElementById('zoomOutBtn').style.display = 'none';
    
    // Reset pan position
    currentPanX = 0;
    currentPanY = 0;
    
    // Highlight current step nodes based on current step
    highlightCurrentStep();
}

// Pan functionality
function togglePan() {
    isPanMode = !isPanMode;
    const panBtn = document.getElementById('panBtn');
    const svg = document.querySelector('.flowchart-svg');
    
    if (isPanMode) {
        panBtn.textContent = 'Exit Pan';
        panBtn.style.background = '#e74c3c';
        svg.classList.add('pan-mode');
    } else {
        panBtn.textContent = 'Pan Mode';
        panBtn.style.background = '#2aa198';
        svg.classList.remove('pan-mode', 'panning');
    }
}

// Highlight management functions
function getCurrentHighlights() {
    return Array.from(document.querySelectorAll('.node.highlighted')).map(node => node.id);
}

function restoreHighlights(nodeIds) {
    clearHighlights();
    nodeIds.forEach(id => {
        const node = document.getElementById(id);
        if (node) node.classList.add('highlighted');
    });
}

function highlightCurrentStep() {
    clearHighlights();
    if (currentStep === 1) {
        highlightNodes(['node-benign', 'node-indeterminate']);
    }
    // Add more step-specific highlighting as needed
}

function highlightNode(nodeId) {
    const node = document.getElementById(nodeId);
    if (node) node.classList.add('highlighted');
}

function highlightNodes(nodeIds) {
    nodeIds.forEach(id => highlightNode(id));
}

function clearHighlights() {
    document.querySelectorAll('.node.highlighted').forEach(node => {
        node.classList.remove('highlighted');
    });
}

// Pan event initialization and management
function initPanEvents() {
    const svg = document.querySelector('.flowchart-svg');
    
    // Mouse events
    svg.addEventListener('mousedown', handlePanStart);
    document.addEventListener('mousemove', handlePanMove);
    document.addEventListener('mouseup', handlePanEnd);
    
    // Touch events for mobile
    svg.addEventListener('touchstart', handleTouchStart, { passive: false });
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd);
}

function handlePanStart(e) {
    if (!isPanMode) return;
    isPanning = true;
    panStartX = e.clientX;
    panStartY = e.clientY;
    const svg = document.querySelector('.flowchart-svg');
    svg.classList.add('panning');
    e.preventDefault();
}

function handleTouchStart(e) {
    if (!isPanMode || e.touches.length !== 1) return;
    isPanning = true;
    const touch = e.touches[0];
    panStartX = touch.clientX;
    panStartY = touch.clientY;
    const svg = document.querySelector('.flowchart-svg');
    svg.classList.add('panning');
    e.preventDefault();
}

function handlePanMove(e) {
    if (!isPanning || !isPanMode) return;
    
    const deltaX = e.clientX - panStartX;
    const deltaY = e.clientY - panStartY;
    
    currentPanX += deltaX;
    currentPanY += deltaY;
    
    updatePanTransform();
    
    panStartX = e.clientX;
    panStartY = e.clientY;
}

function handleTouchMove(e) {
    if (!isPanning || !isPanMode || e.touches.length !== 1) return;
    
    const touch = e.touches[0];
    const deltaX = touch.clientX - panStartX;
    const deltaY = touch.clientY - panStartY;
    
    currentPanX += deltaX;
    currentPanY += deltaY;
    
    updatePanTransform();
    
    panStartX = touch.clientX;
    panStartY = touch.clientY;
    e.preventDefault();
}

function handlePanEnd() {
    if (isPanning) {
        isPanning = false;
        const svg = document.querySelector('.flowchart-svg');
        svg.classList.remove('panning');
    }
}

function handleTouchEnd() {
    handlePanEnd();
}

function updatePanTransform() {
    const svg = document.querySelector('.flowchart-svg');
    if (isZoomed) {
        const currentX = parseFloat(svg.style.getPropertyValue('--zoom-x').replace('px', '')) || 0;
        const currentY = parseFloat(svg.style.getPropertyValue('--zoom-y').replace('px', '')) || 0;
        svg.style.setProperty('--zoom-x', (currentX + currentPanX / 1.5) + 'px');
        svg.style.setProperty('--zoom-y', (currentY + currentPanY / 1.5) + 'px');
    } else {
        // For full view, we need to modify the transform directly
        const baseTransform = 'scale(0.4) translateY(50px)';
        const panTransform = `translate(${currentPanX}px, ${currentPanY}px)`;
        svg.style.transform = `${baseTransform} ${panTransform}`;
    }
    currentPanX = 0;
    currentPanY = 0;
}

// View reset and navigation functions
function resetView() {
    const svg = document.querySelector('.flowchart-svg');
    if (isZoomed) {
        showFullAlgorithm();
    } else {
        // Start at the first level showing initial choices
        zoomToArea(zoomPositions.level1.x, zoomPositions.level1.y);
        highlightNodes(['node-benign', 'node-indeterminate']);
        updateStep('Step 1: Initial Assessment - Choose imaging findings');
        document.getElementById('fullViewBtn').textContent = 'See Full Algorithm';
    }
}

function resetFlow() {
    clearHighlights();
    navigationHistory = [];
    currentStep = 1;
    stepHistory = [1];
    
    // Reset pan mode
    if (isPanMode) {
        togglePan();
    }
    
function resetFlow() {
    clearHighlights();
    navigationHistory = [];
    currentStep = 1;
    stepHistory = [1];
    
    // Reset pan mode
    if (isPanMode) {
        togglePan();
    }
    
    // Start zoomed into the first level showing initial decisions
    zoomToArea(zoomPositions.level1.x, zoomPositions.level1.y);
    
    updateStep('Step 1: Initial Assessment - Click on appropriate imaging findings');
    updateProgress();
    updateNavigation();
    
    // Reset button states
    document.getElementById('zoomOutBtn').style.display = 'block';
    document.getElementById('fullViewBtn').textContent = 'See Full Algorithm';
    
    // Highlight the very first decision points (Level 1)
    setTimeout(() => {
        highlightNodes(['node-benign', 'node-indeterminate']);
    }, 100);
}
}

function previousStep() {
    if (navigationHistory.length > 0) {
        const previousState = navigationHistory.pop();
        currentStep = previousState.step;
        
        // Remove last entry from stepHistory
        if (stepHistory.length > 1) {
            stepHistory.pop();
        }
        
        clearHighlights();
        
        // Restore previous zoom state
        const svg = document.querySelector('.flowchart-svg');
        if (previousState.zoomState) {
            svg.classList.add('zoomed');
            svg.classList.remove('full-view');
            if (previousState.zoomPosition) {
                svg.style.setProperty('--zoom-x', previousState.zoomPosition.x);
                svg.style.setProperty('--zoom-y', previousState.zoomPosition.y);
            }
            isZoomed = true;
            document.getElementById('fullViewBtn').textContent = 'See Full Algorithm';
            document.getElementById('zoomOutBtn').style.display = 'block';
        } else {
            svg.classList.remove('zoomed');
            svg.classList.add('full-view');
            isZoomed = false;
            document.getElementById('fullViewBtn').textContent = 'Zoom In';
            document.getElementById('zoomOutBtn').style.display = 'none';
        }
        
        // Restore highlights
        restoreHighlights(previousState.highlights);
        
        updateProgress();
        updateNavigation();
        updateStep(`Step ${currentStep}: Navigate using highlighted options`);
    }
}

// UI update functions
function updateStep(description) {
    document.getElementById('stepIndicator').textContent = `Step ${currentStep}: ${description}`;
}

function updateProgress() {
    const progressPercent = Math.min((currentStep / 8) * 100, 100);
    document.getElementById('progress').style.width = progressPercent + '%';
}

function updateNavigation() {
    const prevBtn = document.getElementById('prevBtn');
    if (navigationHistory.length > 0) {
        prevBtn.classList.remove('hidden');
    } else {
        prevBtn.classList.add('hidden');
    }
}

// Initialize the flowchart when the DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    checkMobile();
    initPanEvents();
    resetFlow();
    
    // Add window resize handler for mobile optimization
    window.addEventListener('resize', function() {
        checkMobile();
        // Reset zoom positions for mobile
        Object.keys(zoomPositions).forEach(key => {
            zoomPositions[key] = {
                x: isMobile ? zoomPositions[key].x / 2 : zoomPositions[key].x * 2,
                y: isMobile ? zoomPositions[key].y * 0.6 : zoomPositions[key].y * 1.67
            };
        });
    });
    
    // Prevent default touch behaviors that might interfere
    document.addEventListener('touchmove', function(e) {
        if (isPanMode) {
            e.preventDefault();
        }
    }, { passive: false });
});
