/**
 * AXINITE SYSTEM | UI Infrastructure Controller v1.2
 * Simplified logic for Viewport Sync, Scroll Locking, and Modals.
 */

const UI_STATE = {
    overlayStack: [],
    previousFocus: null,
    scrollPosition: 0
};

const body = document.body;

/**
 * AXINITE DETERMINISTIC LOCK v1.2
 * Prevents scroll without resetting the body position.
 */
function toggleScrollLock(lock) {
    if (lock) {
        // 1. Calculate scrollbar width to prevent "layout shift"
        const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
        
        // 2. Add padding to body to compensate for disappearing scrollbar
        body.style.paddingRight = `${scrollbarWidth}px`;
        
        // 3. Lock the scroll natively without changing position
        body.style.overflow = 'hidden';
        
        // 4. Accessibility
        setMainInteractivity(false);
    } else {
        // 1. Remove temporary styles to restore natural state
        body.style.removeProperty('padding-right');
        body.style.removeProperty('overflow');
        
        // 2. Restore interactivity
        setMainInteractivity(true);
    }
}

/* -----------------------------
   2. OVERLAY CONTROLLER
-------------------------------- */

function openOverlay(id, type = null) {
    const overlay = document.getElementById(id);
    if (!overlay) return;

    if (UI_STATE.overlayStack.length === 0) {
        UI_STATE.previousFocus = document.activeElement;
        toggleScrollLock(true);
    }

    // Dynamic Injection Logic
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

    
    // Focus management
    const focusable = overlay.querySelectorAll('a, button, input, textarea, select, [tabindex]:not([tabindex="-1"])');
    (focusable[0] || overlay).focus();
}

function closeActiveOverlay() {
    const activeId = UI_STATE.overlayStack.pop();
    if (activeId) document.getElementById(activeId).style.display = "none";

    if (UI_STATE.overlayStack.length === 0) {
        toggleScrollLock(false);
        if (UI_STATE.previousFocus) UI_STATE.previousFocus.focus();
    }
}

/* -----------------------------
   3. UTILITIES & LISTENERS
-------------------------------- */

function setMainInteractivity(enabled) {
    const main = document.getElementById("main");
    if (!main) return;
    main.querySelectorAll('a, button, input, select, textarea').forEach(el => {
        if (!enabled) {
            el.setAttribute("data-prev-tabindex", el.getAttribute("tabindex") || "0");
            el.tabIndex = -1;
            el.setAttribute("aria-hidden", "true");
        } else {
            el.tabIndex = el.getAttribute("data-prev-tabindex");
            el.removeAttribute("aria-hidden");
        }
    });
}

// Keyboard & Click Listeners
window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeActiveOverlay();
    if (e.key === "Tab" && UI_STATE.overlayStack.length > 0) {
        // Simple Focus Trap logic can be added here if needed
    }
});

window.addEventListener("click", (e) => {
    if (e.target.classList.contains('overlay')) closeActiveOverlay();
});

// Smooth Scroll for Navigation
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener("click", function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute("href"));
        if (!target) return;
        
        while(UI_STATE.overlayStack.length > 0) closeActiveOverlay();
        const navHeight = document.querySelector(".nav-sticky")?.offsetHeight || 64;
        window.scrollTo({ top: target.offsetTop - navHeight, behavior: "smooth" });
    });
});