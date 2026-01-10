/**
 * AXINITE SYSTEM | UI Infrastructure Controller
 * Final Build: Zero-Jump, No-Reflow Logic
 */

(function () {
    'use strict';

    const UI_STATE = {
        activeOverlay: null,
        scrollPos: 0
    };

    const body = document.body;
    const html = document.documentElement;

    /* -----------------------------
       SCROLL LOCK (RE-ENGINEERED)
    -------------------------------- */

    function lockScroll() {
        // Capture exact pixel
        UI_STATE.scrollPos = window.pageYOffset || html.scrollTop;

        // Pin body
        body.style.position = 'fixed';
        body.style.top = `-${UI_STATE.scrollPos}px`;
        body.style.width = '100%';
        body.style.overflowY = 'scroll'; // Force gutter to stay
    }

    function unlockScroll() {
        // 1. Kill smooth scrolling globally immediately
        html.style.scrollBehavior = 'auto';
        body.style.scrollBehavior = 'auto';

        // 2. Remove fixed constraints
        body.style.removeProperty('position');
        body.style.removeProperty('top');
        body.style.removeProperty('width');
        body.style.removeProperty('overflow-y');

        // 3. Instant jump
        window.scrollTo(0, UI_STATE.scrollPos);

        // 4. Clean up: Wait for the browser to acknowledge the jump before restoring smooth
        requestAnimationFrame(() => {
            html.style.removeProperty('scroll-behavior');
            body.style.removeProperty('scroll-behavior');
        });
    }

    /* -----------------------------
       OVERLAY CONTROL
    -------------------------------- */

/**
 * UPDATED OVERLAY CONTROLLER
 * Supports fetching external .md files and injecting content
 */
window.openOverlay = async function (id, fileName = null) {
    const overlay = document.getElementById(id);
    if (!overlay) return;

    // 1. Single-Overlay Guarantee: Close existing before opening new
    if (UI_STATE.activeOverlay) {
        const current = document.getElementById(UI_STATE.activeOverlay);
        if (current) current.style.display = 'none';
    } else {
        // Only lock the background if no overlay is currently open
        lockScroll();
    }

    // 2. Specific Logic for "integration-readme.md" Injection
    // Checks if the ID matches the readme overlay and a filename was provided
    if (id === 'readme-overlay' && fileName) {
        const target = overlay.querySelector('.readme-text'); // The <pre> or <div> inside the modal
        
        if (target) {
            target.textContent = "Loading system documentation..."; // UX Placeholder
            
            try {
                // Fetch the external file
                const response = await fetch(fileName);
                
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                
                const text = await response.text();
                
                // Inject the text content and trim whitespace
                target.textContent = text.trim();
            } catch (error) {
                console.error("Axinite System Error: Failed to fetch readme.", error);
                target.textContent = `Error: Could not load the file "${fileName}". Ensure the file exists on the server.`;
            }
        }
    }

    // 3. Finalize State and Display
    UI_STATE.activeOverlay = id;
    overlay.style.display = 'flex';

    // Focus first button for accessibility
    const closeBtn = overlay.querySelector('button');
    if (closeBtn) setTimeout(() => closeBtn.focus(), 50);
};

    window.closeActiveOverlay = function () {
        if (!UI_STATE.activeOverlay) return;

        const overlay = document.getElementById(UI_STATE.activeOverlay);
        if (overlay) overlay.style.display = 'none';

        UI_STATE.activeOverlay = null;
        unlockScroll();
    };

    /* -----------------------------
       GLOBAL INTERACTIONS
    -------------------------------- */


window.toggleFigmaRequirement = function () {
    const ndaChecked = document.getElementById("nda-required").checked;
    const figmaInput = document.getElementById("figma-url");
    const figmaStar = document.getElementById("figma-star");

    // If NDA is required → Figma URL becomes optional
    figmaInput.required = !ndaChecked;

    // Hide/show required asterisk if it exists
    if (figmaStar) {
        figmaStar.style.display = ndaChecked ? "none" : "inline";
    }

    // Update placeholder for clarity
    figmaInput.placeholder = ndaChecked
        ? "Optional until NDA is signed"
        : "https://www.figma.com/file/xxxx";
    }


/**
 * HANDLES AUDIT FORM SUBMISSION
 * Transition logic from Form -> Success Overlay
 */
window.handleAuditSubmit = function (e) {
    // 1. Prevent the browser from refreshing the page
    if (e && e.preventDefault) e.preventDefault();

    // 2. Identify the user's intent (NDA vs. Direct Audit)
    const ndaCheckbox = document.getElementById("nda-required");
    const isNdaRequested = ndaCheckbox ? ndaCheckbox.checked : false;

    // 3. Select the appropriate deterministic message
    const successMsg = isNdaRequested
        ? "Protocol Initialized: NDA request received. Check your email for execution steps."
        : "Data Received: Audit scheduled. Expect delivery within 48 business hours.";

    // 4. Inject the message into the success overlay
    const messageNode = document.getElementById('success-message');
    if (messageNode) {
        messageNode.textContent = successMsg;
    }

    /* 5. TRANSITION LOGIC 
       We do NOT call unlockScroll() here because we want the background 
       to stay pinned while we swap the Form for the Success Message.
    */
    
    // Hide the audit form overlay immediately
    const auditOverlay = document.getElementById('audit-overlay');
    if (auditOverlay) auditOverlay.style.display = 'none';

    // Open the success overlay
    // Note: We use window.openOverlay so it sets UI_STATE.activeOverlay correctly
    window.openOverlay('success-overlay');

    // 6. Final Clean up
    const form = document.getElementById('auditForm');
    if (form) form.reset();
    
    return false; // Extra safety for legacy browsers
};

    // Clicks & Keys
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('overlay')) closeActiveOverlay();
        
        const openBtn = e.target.closest('[data-open-overlay]');
        if (openBtn) {
            e.preventDefault(); // Prevents <a href="#"> from jumping
            window.openOverlay(openBtn.dataset.openOverlay);
        }

        if (e.target.closest('[data-close-overlay]')) closeActiveOverlay();
    });

    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeActiveOverlay();
    });

})();
