/**
 * AXINITE SYSTEM | UI Infrastructure Controller
 * Single-overlay, deterministic, no stacking, no movement
 */

(function () {
    'use strict';

    /* -----------------------------
       STATE (Single Overlay Only)
    -------------------------------- */

    const UI_STATE = {
        activeOverlay: null,
        previousFocus: null
    };

    const body = document.body;

    /* -----------------------------
       SCROLL LOCK (NO JUMP)
    -------------------------------- */

function lockScroll() {
    // Capture the current scroll position
    const scrollY = window.scrollY;

    body.style.position = 'fixed';
    body.style.top = `-${scrollY}px`;
    body.style.width = '100%';
    // Optional: add overflowY scroll to prevent layout shift from scrollbar disappearing
    body.style.overflowY = 'scroll'; 
}

function unlockScroll() {
    const scrollY = Math.abs(parseInt(body.style.top || '0', 10));

    // 1. Force the HTML element to ignore smooth scrolling temporarily
    document.documentElement.style.scrollBehavior = 'auto';

    // 2. Remove the "fixed" lock
    body.style.removeProperty('position');
    body.style.removeProperty('top');
    body.style.removeProperty('width');
    body.style.removeProperty('overflow-y');

    // 3. Jump to the position instantly
    window.scrollTo(0, scrollY);

    // 4. Restore smooth scrolling after the jump (use requestAnimationFrame for safety)
    requestAnimationFrame(() => {
        document.documentElement.style.removeProperty('scroll-behavior');
    });
}
    /* -----------------------------
       OVERLAY CONTROL
    -------------------------------- */

    window.openOverlay = function (id, type = null) {
        const overlay = document.getElementById(id);
        if (!overlay) return;

        // Close any existing overlay (hard guarantee)
        if (UI_STATE.activeOverlay) {
            closeActiveOverlay();
        }

        UI_STATE.previousFocus = document.activeElement;
        UI_STATE.activeOverlay = id;

        // Optional dynamic content injection
        if (id === 'readme-overlay' && type) {
            const source = document.getElementById(
                type === 'readme' ? 'readme-content' : 'scope-content'
            );
            if (source) {
                overlay.querySelector('.overlay-header span').textContent =
                    type === 'readme'
                        ? 'integration readme'
                        : 'Delivery Scope & Commercial Terms';

                overlay.querySelector('.overlay-body pre').textContent =
                    source.textContent.trim();
            }
        }

        lockScroll();

        overlay.style.display = 'flex';
        overlay.style.zIndex = '1000';

        // Focus first interactive element
        const focusable = overlay.querySelector(
            'button, [href], input, textarea, select, [tabindex]:not([tabindex="-1"])'
        );

        (focusable || overlay).focus();
    };

    window.closeActiveOverlay = function () {
        if (!UI_STATE.activeOverlay) return;

        const overlay = document.getElementById(UI_STATE.activeOverlay);
        if (overlay) overlay.style.display = 'none';

        UI_STATE.activeOverlay = null;
        unlockScroll();

        if (UI_STATE.previousFocus) {
            UI_STATE.previousFocus.focus();
        }
    };

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

    /* -----------------------------
       GLOBAL INTERACTIONS
    -------------------------------- */

    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeActiveOverlay();
        }
    });

    document.addEventListener('click', (e) => {
        // Backdrop click
        if (e.target.classList.contains('overlay')) {
            closeActiveOverlay();
        }

        // Declarative open
        const openBtn = e.target.closest('[data-open-overlay]');
        if (openBtn) {
            openOverlay(
                openBtn.dataset.openOverlay,
                openBtn.dataset.overlayType
            );
        }

        // Declarative close
        if (e.target.closest('[data-close-overlay]')) {
            closeActiveOverlay();
        }
    });

})();
