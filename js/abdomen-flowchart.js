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

// Predefined zoom positions for different flowchart areas
const zoomPositions = {
    'start': { x: -200, y: -20 },
    'indeterminate': { x: -350, y: -80 },
    'size': { x: -280, y: -150 },
    'large': { x: -350, y: -200 },
    'small': { x: -250, y: -200 },
    'prior': { x: -200, y: -250 },
    'enlarging': { x: -250, y: -300 },
    'ct': { x: -320, y: -350 },
    'washout': { x: -350, y: -450 }
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
            zoomToArea(-75, -150);
            break;
        case 'indeterminate':
            highlightNodes(['node-size-small', 'node-size-large']);
            updateStep('Size Assessment: Choose appropriate size category');
            zoomToArea(-280, -150);
            break;
        case 'size-large':
            highlightNodes(['node-large-no-cancer', 'node-large-cancer']);
            updateStep('Large Mass Management: Based on cancer history');
            zoomToArea(-350, -200);
            break;
        case 'size-small':
            highlightNodes(['node-prior', 'node-no-prior']);
            updateStep('Clinical Assessment: Prior imaging and cancer history');
            zoomToArea(-250, -200);
            break;
        case 'prior':
            highlightNodes(['node-stable', 'node-enlarging']);
            updateStep('Stability Assessment: Compare with prior imaging');
            zoomToArea(-200, -270);
            break;
        case 'no-prior':
            highlightNodes(['node-small-benign', 'node-medium']);
            updateStep('Further Evaluation: Size-based approach');
            zoomToArea(-250, -330);
            break;
        case 'enlarging':
            updateStep('Assessment Complete: Consider advanced imaging or resection');
            zoomToArea(-250, -300);
            break;
        case 'ct':
            highlightNodes(['node-ct-benign', 'node-ct-washout']);
            updateStep('CT Assessment: Based on unenhanced CT values');
            zoomToArea(-320, -390);
            break;
        case 'washout':
            highlightNodes(['node-washout-benign', 'node-washout-indeterminate']);
            updateStep('Washout Study: APW/RPW percentage evaluation');
            zoomToArea(-350, -450);
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
    showFullAlgorithm();
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
    
    // Highlight current step nodes
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
    
    svg.addEventListener('mousedown', (e) => {
        if (!isPanMode) return;
        isPanning = true;
        panStartX = e.clientX;
        panStartY = e.clientY;
        svg.classList.add('panning');
        e.preventDefault();
    });
    
    document.addEventListener('mousemove', (e) => {
        if (!isPanning || !isPanMode) return;
        
        const deltaX = e.clientX - panStartX;
        const deltaY = e.clientY - panStartY;
        
        currentPanX += deltaX;
        currentPanY += deltaY;
        
        updatePanTransform();
        
        panStartX = e.clientX;
        panStartY = e.clientY;
    });
    
    document.addEventListener('mouseup', () => {
        if (isPanning) {
            isPanning = false;
            const svg = document.querySelector('.flowchart-svg');
            svg.classList.remove('panning');
        }
    });
}

function updatePanTransform() {
    const svg = document.querySelector('.flowchart-svg');
    if (isZoomed) {
        const currentX = parseFloat(svg.style.getPropertyValue('--zoom-x').replace('px', '')) || 0;
        const currentY = parseFloat(svg.style.getPropertyValue('--zoom-y').replace('px', '')) || 0;
        svg.style.setProperty('--zoom-x', (currentX + currentPanX / 2.5) + 'px');
        svg.style.setProperty('--zoom-y', (currentY + currentPanY / 2.5) + 'px');
    } else {
        // For full view, we need to modify the transform directly
        const baseTransform = 'scale(0.7) translateY(-50px)';
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
        // If already in full view, zoom to start level showing initial choices
        zoomToArea(-200, -20);
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
    
    // Show full algorithm at start - this is the FIRST level
    const svg = document.querySelector('.flowchart-svg');
    svg.classList.remove('zoomed');
    svg.classList.add('full-view');
    svg.style.transform = ''; // Clear any custom transforms
    svg.style.removeProperty('--zoom-x');
    svg.style.removeProperty('--zoom-y');
    isZoomed = false;
    
    updateStep('Step 1: Initial Assessment - Click on appropriate imaging findings');
    updateProgress();
    updateNavigation();
    
    // Reset button states
    document.getElementById('zoomOutBtn').style.display = 'none';
    document.getElementById('fullViewBtn').textContent = 'Zoom In';
    
    // Highlight the very first decision points (Level 1)
    setTimeout(() => {
        highlightNodes(['node-benign', 'node-indeterminate']);
    }, 100);
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
    initPanEvents();
    resetFlow();
});
