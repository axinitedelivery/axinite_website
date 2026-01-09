/**
 * AXINITE SYSTEM | UI Infrastructure Controller v1.4
 * Standardized for Deterministic Scroll Locking, Visual Viewport Sync,
 * and Mobile Keyboard Infrastructure.
 */

(function() {
    'use strict';

    const UI_STATE = {
        overlayStack: [],
        previousFocus: null
    };

    const body = document.body;

    /* -----------------------------
       1. CORE ENGINE: SCROLL LOCKING (v1.2)
    -------------------------------- */

    /**
     * Locks scroll without resetting body position to prevent "jumping"
     */
    function toggleScrollLock(lock) {
        if (lock) {
            // 1. Calculate scrollbar width to prevent "layout shift"
            const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
            
            // 2. Compensate for the disappearing scrollbar
            body.style.paddingRight = `${scrollbarWidth}px`;
            
            // 3. Lock natively without position: fixed
            body.style.overflow = 'hidden';
            
            setMainInteractivity(false);
        } else {
            body.style.removeProperty('padding-right');
            body.style.removeProperty('overflow');
            
            setMainInteractivity(true);
        }
    }

    /* -----------------------------
       2. VIEWPORT SYNC (The "No-Leak" Engine)
    -------------------------------- */

    /**
     * Pins the overlay to the visual window, closing the background "gap" 
     * that occurs when mobile browsers shift the window for the keyboard.
     */
    function syncViewportToOverlay() {
        if (!window.visualViewport || UI_STATE.overlayStack.length === 0) return;

        const vv = window.visualViewport;
        const activeId = UI_STATE.overlayStack[UI_STATE.overlayStack.length - 1];
        const overlay = document.getElementById(activeId);
        
        if (!overlay) return;

        // 1. Detect Keyboard (Standardized Threshold)
        const isKeyboardUp = (window.innerHeight - vv.height) > 150;
        body.classList.toggle('keyboard-visible', isKeyboardUp);

        // 2. THE LEAK FIX: Offset the overlay's 'top' to match the browser's shift
        overlay.style.top = `${vv.offsetTop}px`;
        
        // 3. Update Height and CSS Variable for internal content scrolling
        overlay.style.height = `${vv.height}px`;
        overlay.style.setProperty('--visual-height', `${vv.height}px`);
    }

    /* -----------------------------
       3. OVERLAY CONTROLLER
    -------------------------------- */

    window.openOverlay = function(id, type = null) {
        const overlay = document.getElementById(id);
        if (!overlay) return;

        if (UI_STATE.overlayStack.length === 0) {
            UI_STATE.previousFocus = document.activeElement;
            toggleScrollLock(true);
        }

        // Dynamic Injection Logic (Readme/Scope)
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

        // Immediate sync to ensure the overlay covers the screen correctly
        syncViewportToOverlay();
        
        // Focus management
        const focusable = overlay.querySelectorAll('a, button, input, textarea, select, [tabindex]:not([tabindex="-1"])');
        (focusable[0] || overlay).focus();
    };

    window.closeActiveOverlay = function() {
        if (UI_STATE.overlayStack.length === 0) return;

        const activeId = UI_STATE.overlayStack.pop();
        const overlay = document.getElementById(activeId);
        if (overlay) overlay.style.display = "none";

        if (UI_STATE.overlayStack.length === 0) {
            toggleScrollLock(false);
            if (UI_STATE.previousFocus) UI_STATE.previousFocus.focus();
        }
    };

    /* -----------------------------
       4. FORM VALIDATION
    -------------------------------- */

    window.validateBusinessEmail = function() {
        const email = document.getElementById('audit-email');
        const warning = document.getElementById('email-warning');
        if (!email || !warning) return;
        
        const freeDomains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'icloud.com', 'aol.com'];
        const domain = email.value.toLowerCase().split('@')[1];
        
        warning.style.display = freeDomains.includes(domain) ? 'block' : 'none';
    };

    window.toggleFigmaRequirement = function() {
        const ndaChecked = document.getElementById('nda-required').checked;
        const figmaUrl = document.getElementById('figma-url');
        const figmaStar = document.getElementById('figma-star');
        
        if (!figmaUrl || !figmaStar) return;
        
        if (ndaChecked) {
            figmaUrl.removeAttribute('required');
            figmaStar.style.display = 'none';
        } else {
            figmaUrl.setAttribute('required', 'required');
            figmaStar.style.display = 'inline';
        }
    };

    window.handleAuditSubmit = function(event) {
        event.preventDefault();
        const form = event.target;
        const submitBtn = form.querySelector('button[type="submit"]');
        
        submitBtn.textContent = 'Submitting...';
        submitBtn.disabled = true;

        // Simulate API delay
        setTimeout(() => {
            submitBtn.textContent = 'Request Audit';
            submitBtn.disabled = false;
            window.closeActiveOverlay();
            
            setTimeout(() => {
                window.openOverlay('success-overlay');
                form.reset();
            }, 300);
        }, 1200);
    };

    /* -----------------------------
       5. LISTENERS & UTILITIES
    -------------------------------- */

    function setMainInteractivity(enabled) {
        const main = document.getElementById("main");
        if (!main) return;
        main.querySelectorAll('a, button, input, select, textarea').forEach(el => {
            if (!enabled) {
                el.setAttribute("data-prev-tabindex", el.getAttribute("tabindex") || "0");
                el.tabIndex = -1;
            } else {
                el.tabIndex = el.getAttribute("data-prev-tabindex") || 0;
            }
        });
    }

    // Viewport Listeners for Keyboard Handling
    if (window.visualViewport) {
        window.visualViewport.addEventListener('resize', syncViewportToOverlay);
        window.visualViewport.addEventListener('scroll', syncViewportToOverlay);
    }

    // Global Interaction Listeners
    window.addEventListener("keydown", (e) => {
        if (e.key === "Escape") window.closeActiveOverlay();
    });

    document.addEventListener('click', (e) => {
        // Overlay backdrop click
        if (e.target.classList.contains('overlay')) window.closeActiveOverlay();
        
        // Data-driven open/close
        const openBtn = e.target.closest('[data-open-overlay]');
        if (openBtn) window.openOverlay(openBtn.dataset.openOverlay, openBtn.dataset.overlayType);
        
        if (e.target.closest('[data-close-overlay]')) window.closeActiveOverlay();
    });

    // Smooth Scroll Integration
    document.addEventListener('DOMContentLoaded', () => {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener("click", function (e) {
                const target = document.querySelector(this.getAttribute("href"));
                if (!target) return;
                e.preventDefault();
                while (UI_STATE.overlayStack.length > 0) window.closeActiveOverlay();

                const navHeight = document.querySelector(".nav-sticky")?.offsetHeight || 64;
                window.scrollTo({ top: target.offsetTop - navHeight, behavior: "smooth" });
            });
        });

        // Initialize Form Listeners
        const emailInput = document.getElementById('audit-email');
        if (emailInput) emailInput.addEventListener('blur', window.validateBusinessEmail);
        
        const ndaCheck = document.getElementById('nda-required');
        if (ndaCheck) ndaCheck.addEventListener('change', window.toggleFigmaRequirement);
    });

})();
