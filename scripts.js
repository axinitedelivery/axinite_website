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

    window.openOverlay = function (id) {
        const overlay = document.getElementById(id);
        if (!overlay) return;

        // Force close if something is already open
        if (UI_STATE.activeOverlay) {
            const current = document.getElementById(UI_STATE.activeOverlay);
            if (current) current.style.display = 'none';
        } else {
            // Only lock background if this is the first overlay
            lockScroll();
        }

        UI_STATE.activeOverlay = id;
        overlay.style.display = 'flex';
        
        // Focus management
        const btn = overlay.querySelector('button');
        if (btn) setTimeout(() => btn.focus(), 50);
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


    // Form Submission
document.addEventListener('submit', (e) => {
        if (e.target.id === 'auditForm') {
            e.preventDefault();
            
            const ndaChecked = document.getElementById("nda-required").checked;
            const msg = ndaChecked 
                ? "NDA request received. Check email for steps." 
                : "Audit scheduled. Expect delivery in 48h.";

            const msgNode = document.getElementById('success-message');
            if (msgNode) msgNode.textContent = msg;

            window.openOverlay('success-overlay');
        }
    });

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
