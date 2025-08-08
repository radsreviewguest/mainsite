// Fleischner Society 2017 Guidelines Interactive Tool JavaScript
// Database of all guidelines from the image
const guidelines = {
    solid: {
        single_low: {
            lt_6: { rec: "No routine follow-up.", com: "Nodules <6 mm do not require routine follow-up in low-risk patients (recommendation 1A)." },
            '6_8': { rec: "CT at 6-12 months, then consider CT at 18-24 months.", com: "" },
            gt_8: { rec: "Consider CT at 3 months, PET/CT, or tissue sampling.", com: "" }
        },
        single_high: {
            lt_6: { rec: "Optional CT at 12 months.", com: "Certain patients at high risk with suspicious nodule morphology, upper lobe location, or both may warrant 12-month follow-up (recommendation 1A)." },
            '6_8': { rec: "CT at 6-12 months, then consider CT at 18-24 months.", com: "" },
            gt_8: { rec: "Consider CT at 3 months, PET/CT, or tissue sampling.", com: "" }
        },
        multiple_low: {
            lt_6: { rec: "No routine follow-up.", com: "Use most suspicious nodule as guide to management. Follow-up intervals may vary according to size and risk (recommendation 2A)." },
            '6_8': { rec: "CT at 3-6 months, then consider CT at 18-24 months.", com: "Use most suspicious nodule as guide to management. Follow-up intervals may vary according to size and risk (recommendation 2A)." },
            gt_8: { rec: "CT at 3-6 months, then consider CT at 18-24 months.", com: "Use most suspicious nodule as guide to management. Follow-up intervals may vary according to size and risk (recommendation 2A)." }
        },
        multiple_high: {
            lt_6: { rec: "Optional CT at 12 months.", com: "Use most suspicious nodule as guide to management. Follow-up intervals may vary according to size and risk (recommendation 2A)." },
            '6_8': { rec: "CT at 3-6 months, then consider CT at 18-24 months.", com: "Use most suspicious nodule as guide to management. Follow-up intervals may vary according to size and risk (recommendation 2A)." },
            gt_8: { rec: "CT at 3-6 months, then consider CT at 18-24 months.", com: "Use most suspicious nodule as guide to management. Follow-up intervals may vary according to size and risk (recommendation 2A)." }
        }
    },
    subsolid: {
        single_gg: {
            lt_6: { rec: "No routine follow-up.", com: "In certain suspicious nodules < 6 mm, consider follow-up at 2 and 4 years. If solid component(s) or growth develops, consider resection. (Recommendations 3A and 4A)." },
            gte_6: { rec: "CT at 6-12 months to confirm persistence, then CT every 2 years until 5 years.", com: "" }
        },
        single_part_solid: {
            lt_6: { rec: "No routine follow-up.", com: "In practice, part-solid nodules cannot be defined as such until >=6 mm, and nodules <6 mm do not usually require follow-up. Persistent part-solid nodules with solid components >=6 mm should be considered highly suspicious (recommendations 4A-4C)." },
            gte_6: { rec: "CT at 3-6 months to confirm persistence. If unchanged and solid component remains <6 mm, annual CT should be performed for 5 years.", com: "" }
        },
        multiple: {
            lt_6: { rec: "CT at 3-6 months. If stable, consider CT at 2 and 4 years.", com: "Multiple <6 mm pure ground-glass nodules are usually benign, but consider follow-up in selected patients at high risk at 2 and 4 years (recommendation 5A)." },
            gte_6: { rec: "CT at 3-6 months. Subsequent management based on the most suspicious nodule(s).", com: "" }
        }
    }
};

// DOM Elements - initialized when DOM is loaded
let form, solidityInputs, solidOptions, subsolidOptions, subsolidCountInputs, subsolidSingleTypeOptions, recommendationEl, commentsEl;

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Get DOM Elements
    form = document.getElementById('nodule-form');
    solidityInputs = form.elements['solidity'];
    solidOptions = document.getElementById('solid-options');
    subsolidOptions = document.getElementById('subsolid-options');
    subsolidCountInputs = form.elements['subsolid_count'];
    subsolidSingleTypeOptions = document.getElementById('subsolid-single-type-options');
    recommendationEl = document.getElementById('recommendation');
    commentsEl = document.getElementById('comments');

    // Event Listener for all form changes
    form.addEventListener('change', function(event) {
        // Show/hide main sections based on solidity
        const selectedSolidity = form.elements['solidity'].value;
        if (selectedSolidity === 'solid') {
            solidOptions.classList.remove('hidden');
            subsolidOptions.classList.add('hidden');
        } else if (selectedSolidity === 'subsolid') {
            solidOptions.classList.add('hidden');
            subsolidOptions.classList.remove('hidden');
        }

        // Show/hide subsolid single type options
        const selectedSubsolidCount = form.elements['subsolid_count'].value;
         if (selectedSolidity === 'subsolid' && selectedSubsolidCount === 'single') {
            subsolidSingleTypeOptions.classList.remove('hidden');
        } else if (selectedSolidity === 'subsolid') {
            subsolidSingleTypeOptions.classList.add('hidden');
        }

        updateRecommendation();
    });
});

// Update recommendation based on current form selections
function updateRecommendation() {
    const solidity = form.elements['solidity'].value;
    let result = null;

    if (solidity === 'solid') {
        const type = form.elements['solid_type'].value;
        const size = form.elements['solid_size'].value;
        if (type && size) {
            result = guidelines.solid[type][size];
        }
    } else if (solidity === 'subsolid') {
        const count = form.elements['subsolid_count'].value;
        const size = form.elements['subsolid_size'].value;
        if (count === 'single') {
            const singleType = form.elements['subsolid_single_type'].value;
            if (singleType && size) {
                result = guidelines.subsolid[singleType === 'gg' ? 'single_gg' : 'single_part_solid'][size];
            }
        } else if (count === 'multiple') {
             if (size) {
                result = guidelines.subsolid.multiple[size];
            }
        }
    }

    if (result) {
        recommendationEl.textContent = result.rec;
        commentsEl.textContent = result.com || ""; // Use empty string if no comment
        
        // Scroll to result on mobile after selection
        if (window.innerWidth <= 768) {
            setTimeout(() => {
                document.getElementById('result-container').scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }, 100);
        }
    } else {
        recommendationEl.textContent = "Please complete all selections to see the guideline.";
        commentsEl.textContent = "";
    }
}

// Mobile optimization: Add touch event handling
document.addEventListener('DOMContentLoaded', function() {
    // Add touch feedback for radio button labels
    if ('ontouchstart' in window) {
        const labels = document.querySelectorAll('.radio-group label');
        labels.forEach(label => {
            label.addEventListener('touchstart', function() {
                this.style.transform = 'scale(0.98)';
            }, { passive: true });
            
            label.addEventListener('touchend', function() {
                this.style.transform = 'scale(1)';
            }, { passive: true });
            
            label.addEventListener('touchcancel', function() {
                this.style.transform = 'scale(1)';
            }, { passive: true });
        });
    }
    
    // Prevent zoom on double-tap for iOS
    let lastTouchEnd = 0;
    document.addEventListener('touchend', function(event) {
        const now = (new Date()).getTime();
        if (now - lastTouchEnd <= 300) {
            event.preventDefault();
        }
        lastTouchEnd = now;
    }, false);
});
