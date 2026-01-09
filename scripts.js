/**
 * AXINITE SYSTEM | UI Infrastructure Controller v1.6
 * Consolidated Viewport Engine & Self-Healing Overlay Stack
 */
(function() {
    'use strict';

    const UI_STATE = {
        overlayStack: [],
        previousFocus: null
    };

    const body = document.body;

    /* -----------------------------
       1. CONSOLIDATED SYNC ENGINE
    -------------------------------- */

    /**
     * The single source of truth for viewport positioning.
     * Prevents the "jump" when moving between input fields.
     */
    function performGlobalSync() {
        if (!window.visualViewport || UI_STATE.overlayStack.length === 0) return;

        const vv = window.visualViewport;
        const activeId = UI_STATE.overlayStack[UI_STATE.overlayStack.length - 1];
        const overlay = document.getElementById(activeId);
        
        if (!overlay) return;

        // 1. Unified Keyboard Detection
        const isKeyboardUp = (window.innerHeight - vv.height) > 150;
        body.classList.toggle('keyboard-visible', isKeyboardUp);

        // 2. Anti-Leak Positioning
        // Forces the overlay to follow the user's eyes as the browser shifts
        overlay.style.top = `${vv.offsetTop}px`;
        overlay.style.height = `${vv.height}px`;
        
        // 3. CSS Variable Injection
        // Ensures content area resizes correctly for every form in the stack
        overlay.style.setProperty('--visual-height', `${vv.height}px`);
        
        const content = overlay.querySelector('.overlay-content') || overlay.querySelector('.overlay-body');
        if (content) {
            content.style.setProperty('--visual-height', `${vv.height}px`);
        }
    }

    /* -----------------------------
       2. OVERLAY CONTROLLER
    -------------------------------- */

    window.openOverlay = function(id, type = null) {
        const overlay = document.getElementById(id);
        if (!overlay) return;

        if (UI_STATE.overlayStack.length === 0) {
            UI_STATE.previousFocus = document.activeElement;
            // Lock background natively (Deterministic Lock v1.2)
            const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
            body.style.paddingRight = `${scrollbarWidth}px`;
            body.style.overflow = 'hidden';
        }

        // Dynamic Content Injection
        if (id === "readme-overlay" && type) {
            const source = document.getElementById(type === "readme" ? "readme-content" : "scope-content");
            if (source) {
                overlay.querySelector(".overlay-header span").textContent = 
                    type === "readme" ? "integration readme" : "Delivery Scope & Commercial Terms";
                overlay.querySelector(".overlay-body pre").textContent = source.textContent.trim();
            }
        }

        UI_STATE.overlayStack.push(id);
        overlay.style.display = "flex";
        overlay.style.zIndex = 1000 + UI_STATE.overlayStack.length;

        // Force an immediate sync so the second form is positioned correctly
        performGlobalSync();
        
        // Focus management
        const focusable = overlay.querySelectorAll('a, button, input, textarea, select, [tabindex]:not([tabindex="-1"])');
        if (focusable.length > 0) {
            setTimeout(() => focusable[0].focus(), 50);
        }
    };

    window.closeActiveOverlay = function() {
        if (UI_STATE.overlayStack.length === 0) return;

        const activeId = UI_STATE.overlayStack.pop();
        const overlay = document.getElementById(activeId);
        if (overlay) overlay.style.display = "none";

        if (UI_STATE.overlayStack.length === 0) {
            body.style.removeProperty('padding-right');
            body.style.removeProperty('overflow');
            if (UI_STATE.previousFocus) UI_STATE.previousFocus.focus();
        } else {
            // Re-sync to the previous overlay in the stack
            performGlobalSync();
        }
    };

    /* -----------------------------
       3. GLOBAL LISTENERS
    -------------------------------- */

    if (window.visualViewport) {
        // Only one set of listeners to prevent race conditions
        window.visualViewport.addEventListener('resize', performGlobalSync);
        window.visualViewport.addEventListener('scroll', performGlobalSync);
    }

    window.addEventListener("keydown", (e) => {
        if (e.key === "Escape") window.closeActiveOverlay();
    });

    window.addEventListener("click", (e) => {
        if (e.target.classList.contains('overlay')) window.closeActiveOverlay();
    });

    // Handle Audit Form specifically
    window.handleAuditSubmit = function(event) {
        event.preventDefault();
        window.closeActiveOverlay(); 
        setTimeout(() => {
            window.openOverlay("success-overlay");
            event.target.reset();
        }, 100);
    };

})();
