/**
 * AXINITE SYSTEM | UI Overlay Controller v2.1
 * Single-overlay, scroll-locked, mobile-safe
 */

(function () {
  'use strict';

  const UI_STATE = {
    activeOverlay: null,
    previousFocus: null,
    scrollLocked: false
  };

  const body = document.body;

  /* -----------------------------
     Scroll Lock (No Jump)
  -------------------------------- */

  function lockScroll() {
    if (UI_STATE.scrollLocked) return;

    const scrollbarWidth =
      window.innerWidth - document.documentElement.clientWidth;

    body.style.paddingRight = `${scrollbarWidth}px`;
    body.style.overflow = 'hidden';

    UI_STATE.scrollLocked = true;
  }

  function unlockScroll() {
    if (!UI_STATE.scrollLocked) return;

    body.style.removeProperty('padding-right');
    body.style.removeProperty('overflow');

    UI_STATE.scrollLocked = false;
  }

  /* -----------------------------
     Helpers
  -------------------------------- */

  function ensureFocusable(el) {
    if (!el) return;
    if (!el.hasAttribute('tabindex')) el.setAttribute('tabindex', '-1');
  }

  function focusFirstInteractive(container) {
    const first = container.querySelector(
      'a, button, input, textarea, select, [tabindex]:not([tabindex="-1"])'
    );

    if (first) {
      first.focus();
    } else {
      ensureFocusable(container);
      container.focus();
    }
  }

  /* -----------------------------
     Overlay API
  -------------------------------- */

  window.openOverlay = function (id, type = null) {
    const overlay = document.getElementById(id);
    if (!overlay) return;

    UI_STATE.previousFocus =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;

    UI_STATE.activeOverlay = id;

    // Optional dynamic injection
    if (id === 'readme-overlay' && type) {
      const source = document.getElementById(
        type === 'readme' ? 'readme-content' : 'scope-content'
      );

      if (source) {
        const header = overlay.querySelector('.overlay-header span');
        const bodyPre = overlay.querySelector('.overlay-body pre');

        if (header) {
          header.textContent =
            type === 'readme'
              ? 'integration readme'
              : 'Delivery Scope & Commercial Terms';
        }

        if (bodyPre) {
          bodyPre.textContent = source.textContent.trim();
        }
      }
    }

    overlay.style.display = 'flex';
    overlay.setAttribute('aria-hidden', 'false');

    lockScroll();
    ensureFocusable(overlay);
    focusFirstInteractive(overlay);
  };

  window.closeActiveOverlay = function () {
    if (!UI_STATE.activeOverlay) return;

    const overlay = document.getElementById(UI_STATE.activeOverlay);
    if (overlay) {
      overlay.style.display = 'none';
      overlay.setAttribute('aria-hidden', 'true');
    }

    UI_STATE.activeOverlay = null;
    unlockScroll();

    if (
      UI_STATE.previousFocus &&
      typeof UI_STATE.previousFocus.focus === 'function'
    ) {
      UI_STATE.previousFocus.focus();
    }
  };

  /* -----------------------------
     Global interactions
  -------------------------------- */

  // Escape to close
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeActiveOverlay();
  });

  // Delegated clicks
  document.addEventListener(
    'click',
    (e) => {
      const target = e.target;

      // Backdrop click
      if (
        target instanceof HTMLElement &&
        target.classList.contains('overlay')
      ) {
        const active = UI_STATE.activeOverlay;
        if (active && document.getElementById(active) === target) {
          closeActiveOverlay();
        }
        return;
      }

      // Declarative open
      const openBtn =
        target.closest && target.closest('[data-open-overlay]');
      if (openBtn) {
        openOverlay(
          openBtn.dataset.openOverlay,
          openBtn.dataset.overlayType || null
        );
        return;
      }

      // Declarative close
      if (target.closest && target.closest('[data-close-overlay]')) {
        closeActiveOverlay();
      }
    },
    true
  );

})();


/**
 * Prevents Tab focus from leaving the active modal and handles Sticky Nav integration
 */
function handleFocusTrap(e) {
    if (UI_STATE.overlayStack.length === 0 || e.key !== "Tab") return;

    const activeId = UI_STATE.overlayStack[UI_STATE.overlayStack.length - 1];
    const overlay = document.getElementById(activeId);
    const nav = document.querySelector(".nav-sticky");
    
    let overlayEls = getFocusable(overlay);
    // Include nav in the tab cycle ONLY if it's the Readme overlay
    let navEls = (activeId === "readme-overlay") ? getFocusable(nav) : [];

    const focusOrder = [...navEls, ...overlayEls];
    if (!focusOrder.length) return;

    const currentIndex = focusOrder.indexOf(document.activeElement);

    if (e.shiftKey) { // Shift + Tab
        if (currentIndex <= 0) {
            e.preventDefault();
            focusOrder[focusOrder.length - 1].focus();
        }
    } else { // Tab
        if (currentIndex === focusOrder.length - 1 || currentIndex === -1) {
            e.preventDefault();
            focusOrder[0].focus();
        }
    }
}

/**
 * Disables focus for background content when modals are open
 */
function setMainInteractivity(enabled) {
    const main = document.getElementById("main");
    if (!main) return;
    
    main.querySelectorAll('a, button, input, textarea, select, [tabindex]').forEach(el => {
        if (!enabled) {
            if (!el.hasAttribute("data-prev-tabindex")) {
                el.setAttribute("data-prev-tabindex", el.getAttribute("tabindex") ?? "none");
                el.setAttribute("tabindex", "-1");
            }
        } else {
            const prev = el.getAttribute("data-prev-tabindex");
            if (prev === "none") el.removeAttribute("tabindex");
            else if (prev) el.setAttribute("tabindex", prev);
            el.removeAttribute("data-prev-tabindex");
        }
    });
}

/* -----------------------------
   2. UNIVERSAL OVERLAY CONTROLLER
-------------------------------- */

/**
 * Opens any modal by ID, handles stacking, and content injection for READMEs
 */
function openOverlay(id, type = null) {
    const overlay = document.getElementById(id);
    if (!overlay) return;

    // Save initial focus if this is the first modal opening
if (UI_STATE.overlayStack.length === 0) {
    UI_STATE.previousFocus = document.activeElement;
    lockScroll();
    setMainInteractivity(false);
}

    // Content injection for README / Scope
    if (id === "readme-overlay" && type) {
        const title = overlay.querySelector(".overlay-header span");
        const body = overlay.querySelector(".overlay-body pre");
        const downloadBtn = overlay.querySelector(".btn-secondary");
        const content = document.getElementById(type === "readme" ? "readme-content" : "scope-content");

        if (type === "readme") {
            title.textContent = "integration readme";
            downloadBtn.textContent = "Download .MD";
            downloadBtn.setAttribute("href", "integration-readme.md");
        } else {
            title.textContent = "Delivery Scope & Commercial Terms";
            downloadBtn.textContent = "Download .PDF";
            downloadBtn.setAttribute("href", "delivery-scope-commercial-terms.pdf");
        }
        body.textContent = content.textContent.trim();
    }

    // Stack Logic
    UI_STATE.overlayStack.push(id);
    overlay.style.display = "block";
    overlay.style.zIndex = 1000 + UI_STATE.overlayStack.length; // Ensure new modal is on top

    // Set Focus
    const firstFocus = getFocusable(overlay)[0] || overlay;
    firstFocus.focus();
}

/**
 * Closes the top-most modal in the stack and restores focus appropriately
 */
function closeActiveOverlay() {
    if (UI_STATE.overlayStack.length === 0) return;

    const activeId = UI_STATE.overlayStack.pop();
    const overlay = document.getElementById(activeId);
    
    if (overlay) {
        overlay.style.display = "none";
    }

    // Handle Cleanup
    if (UI_STATE.overlayStack.length === 0) {
        setMainInteractivity(true);
        if (UI_STATE.previousFocus) UI_STATE.previousFocus.focus();
    } else {
        // Return focus to the modal now on top
        const nextId = UI_STATE.overlayStack[UI_STATE.overlayStack.length - 1];
        const nextOverlay = document.getElementById(nextId);
        const focusables = getFocusable(nextOverlay);
        (focusables[0] || nextOverlay).focus();
    }
}

/* -----------------------------
   3. AUDIT PROTOCOL & VALIDATION
-------------------------------- */

/**
 * Real-time validation for business emails
 */
function validateBusinessEmail() {
    const emailInput = document.getElementById("audit-email");
    const email = emailInput.value.trim().toLowerCase();
    const warning = document.getElementById("email-warning");
    const emailPattern = /^[a-z0-9._%+\-]+@[a-z0-9.\-]+\.[a-z]{2,}$/i;

    if (email === "") {
        warning.style.display = "none";
        emailInput.style.borderColor = "var(--border)";
        return false;
    }

    if (!emailPattern.test(email)) {
        emailInput.style.borderColor = "var(--error)";
        return false;
    }

    const freeDomains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'aol.com', 'live.com'];
    const domain = email.split('@')[1];
    const isFree = freeDomains.includes(domain);

    warning.style.display = isFree ? "block" : "none";
    emailInput.style.borderColor = isFree ? "var(--text-main)" : "var(--success)";
    
    return true; 
}

/**
 * Toggles Figma URL requirement based on NDA selection
 */
function toggleFigmaRequirement() {
    const ndaChecked = document.getElementById("nda-required").checked;
    const figmaInput = document.getElementById("figma-url");
    const figmaStar = document.getElementById("figma-star");
    
    figmaInput.required = !ndaChecked;
    if (figmaStar) figmaStar.style.display = ndaChecked ? "none" : "inline";
    figmaInput.placeholder = ndaChecked ? "Optional until NDA is signed" : "https://www.figma.com/file/xxxx";
}

/**
 * Final submission handler
 */
function handleAuditSubmit(event) {
    event.preventDefault();
    const form = event.target;
    
    // 1. Basic Structure Validation
    if (!validateBusinessEmail()) {
        alert("Input Error: Please provide a valid email address.");
        document.getElementById("audit-email").focus();
        return;
    }

    // 2. Business Policy Enforcement
    const isFreeDomain = document.getElementById("email-warning").style.display === "block";
    const isCompanyManaged = document.getElementById("managed-email").checked;
    if (isFreeDomain && !isCompanyManaged) {
        alert("Domain Verification: Please use a business email or confirm this is a company-managed account.");
        return;
    }

    // 3. Figma/NDA Logic
    const ndaChecked = document.getElementById("nda-required").checked;
    const figmaUrl = document.getElementById("figma-url").value.trim();
    if (!ndaChecked && figmaUrl === "") {
        alert("Technical Requirement: Please provide a Figma URL or check 'NDA Required'.");
        document.getElementById("figma-url").focus();
        return;
    }

    // 4. Submission Success Sequence
    const successMsg = ndaChecked 
        ? "Protocol Initialized: NDA request received. Check your email for execution steps."
        : "Data Received: Audit scheduled. Expect delivery within 48 business hours.";

    // Option: Close current form and open success
    closeActiveOverlay(); 
    document.getElementById("success-message").textContent = successMsg;
    openOverlay("success-overlay");
    
    form.reset();
}

/* -----------------------------
   4. GLOBAL EVENT LISTENERS
-------------------------------- */

// Global Keyboard: Escape and Tab
window.addEventListener("keydown", function (e) {
    if (UI_STATE.overlayStack.length === 0) return;
    
    if (e.key === "Escape") closeActiveOverlay();
    if (e.key === "Tab") handleFocusTrap(e);
});

// Click Outside: Closes top-most modal if clicking background
window.addEventListener("click", function (e) {
    if (e.target.classList.contains('overlay')) {
        closeActiveOverlay();
    }
});

// Navigation: Smooth Scroll with Sticky Header Offset
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener("click", function (e) {
        // If an overlay is open, close it before scrolling
        while (UI_STATE.overlayStack.length > 0) closeActiveOverlay();

        const target = document.querySelector(this.getAttribute("href"));
        if (!target) return;

        e.preventDefault();
        const navHeight = document.querySelector(".nav-sticky")?.offsetHeight || 80;
        const offset = target.getBoundingClientRect().top + window.pageYOffset - navHeight;

        window.scrollTo({ top: offset, behavior: "smooth" });
    });
});
