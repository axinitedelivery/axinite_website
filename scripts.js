/**
 * AXINITE SYSTEM | UI Infrastructure Controller v2.0
 * Single-overlay, deterministic scroll locking,
 * mobile keyboard–safe via Visual Viewport API.
 */

(function () {
    'use strict';

    /* -----------------------------
       STATE (Single Source of Truth)
    -------------------------------- */

    const UI_STATE = {
        activeOverlay: null,
        previousFocus: null
    };

    const body = document.body;

    /* -----------------------------
       SCROLL LOCK (No Jump)
    -------------------------------- */

    function lockScroll() {
        const scrollbarWidth =
            window.innerWidth - document.documentElement.clientWidth;

        body.style.paddingRight = `${scrollbarWidth}px`;
        body.style.overflow = 'hidden';
    }

    function unlockScroll() {
        body.style.removeProperty('padding-right');
        body.style.removeProperty('overflow');
    }

    /* -----------------------------
       VIEWPORT SYNC (Mobile Keyboard)
    -------------------------------- */

    function syncOverlayToViewport() {
        if (!window.visualViewport || !UI_STATE.activeOverlay) return;

        const vv = window.visualViewport;
        const overlay = document.getElementById(UI_STATE.activeOverlay);
        if (!overlay) return;

        overlay.style.top = `${vv.offsetTop}px`;
        overlay.style.height = `${vv.height}px`;
    }

    if (window.visualViewport) {
        window.visualViewport.addEventListener('resize', syncOverlayToViewport);
        window.visualViewport.addEventListener('scroll', syncOverlayToViewport);
    }

    /* -----------------------------
       OVERLAY CONTROLLER
    -------------------------------- */

    window.openOverlay = function (id, type = null) {
        const overlay = document.getElementById(id);
        if (!overlay) return;

        // Close existing overlay if one is open
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

        overlay.style.display = 'flex';
        overlay.style.zIndex = 1000;

        lockScroll();
        syncOverlayToViewport();

        // Focus first interactive element
        const focusable = overlay.querySelector(
            'a, button, input, textarea, select, [tabindex]:not([tabindex="-1"])'
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

    /* -----------------------------
       GLOBAL INTERACTIONS
    -------------------------------- */

    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeActiveOverlay();
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
