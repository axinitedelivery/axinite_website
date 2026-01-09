/**
 * AXINITE SYSTEM | UI Infrastructure Controller v1.3
 * Complete logic for Viewport Sync, Scroll Locking, Modals, and Form Handling.
 */

// Wrap everything in IIFE to prevent global scope pollution while still exposing needed functions
(function() {
    'use strict';

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

window.openOverlay = function(id, type = null) {
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

window.closeActiveOverlay = function() {
    const activeId = UI_STATE.overlayStack.pop();
    if (activeId) document.getElementById(activeId).style.display = "none";

    if (UI_STATE.overlayStack.length === 0) {
        toggleScrollLock(false);
        if (UI_STATE.previousFocus) UI_STATE.previousFocus.focus();
    }
}

/* -----------------------------
   3. FORM VALIDATION FUNCTIONS
-------------------------------- */

/**
 * Validates if the email is a business email
 * Shows warning for free email providers
 */
window.validateBusinessEmail = function() {
    const email = document.getElementById('audit-email');
    const warning = document.getElementById('email-warning');
    const managedCheckbox = document.getElementById('managed-email');
    
    if (!email || !warning) return;
    
    const emailValue = email.value.toLowerCase();
    const freeEmailDomains = [
        'gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com',
        'icloud.com', 'aol.com', 'protonmail.com', 'mail.com'
    ];
    
    const domain = emailValue.split('@')[1];
    
    if (domain && freeEmailDomains.includes(domain)) {
        warning.style.display = 'block';
        // Don't make it required, just show the warning
        if (managedCheckbox) {
            managedCheckbox.checked = false;
        }
    } else {
        warning.style.display = 'none';
    }
}

/**
 * Toggles Figma URL requirement based on NDA checkbox
 */
window.toggleFigmaRequirement = function() {
    const ndaChecked = document.getElementById('nda-required').checked;
    const figmaUrl = document.getElementById('figma-url');
    const figmaStar = document.getElementById('figma-star');
    const helperText = figmaUrl?.parentElement.querySelector('.helper-text');
    
    if (!figmaUrl || !figmaStar) return;
    
    if (ndaChecked) {
        figmaUrl.removeAttribute('required');
        figmaStar.style.display = 'none';
        if (helperText) {
            helperText.textContent = 'Optional since NDA is required. We'll contact you for file access.';
        }
    } else {
        figmaUrl.setAttribute('required', 'required');
        figmaStar.style.display = 'inline';
        if (helperText) {
            helperText.textContent = 'Optional if \'NDA Required\' is checked.';
        }
    }
}

/**
 * Handles audit form submission
 */
window.handleAuditSubmit = function(event) {
    event.preventDefault();
    
    const form = event.target;
    const formData = new FormData(form);
    
    // Check if business email warning is shown and managed checkbox is not checked
    const warning = document.getElementById('email-warning');
    const managedCheckbox = document.getElementById('managed-email');
    
    if (warning && warning.style.display !== 'none' && 
        managedCheckbox && !managedCheckbox.checked) {
        alert('Please confirm this is a company-managed email or use a business email address.');
        return;
    }
    
    // Collect form data
    const auditData = {
        name: formData.get('name'),
        email: formData.get('email'),
        platform: formData.get('platform'),
        figma_url: formData.get('figma_url'),
        nda_required: formData.get('nda_required') === 'on',
        volume: formData.get('volume'),
        outcome: formData.get('outcome'),
        timestamp: new Date().toISOString()
    };
    
    // Show loading state
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Submitting...';
    submitBtn.disabled = true;
    
    // Simulate API call (replace with actual endpoint)
    // In production, you'd send this to your backend:
    // fetch('/api/audit-request', {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify(auditData)
    // })
    
    setTimeout(() => {
        // Reset button
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
        
        // Close audit form
        closeActiveOverlay();
        
        // Show success overlay
        setTimeout(() => {
            const successMessage = document.getElementById('success-message');
            if (successMessage) {
                successMessage.innerHTML = `
                    <strong>Audit request received.</strong><br><br>
                    Results will be sent to <strong>${auditData.email}</strong> within 48 business hours.<br><br>
                    Reference: AUD-${Date.now().toString(36).toUpperCase()}
                `;
            }
            openOverlay('success-overlay');
            
            // Reset form
            form.reset();
            
            // Log to console for development (remove in production)
            console.log('Audit Request:', auditData);
        }, 300);
    }, 1500); // Simulate network delay
}

/* -----------------------------
   4. MOBILE KEYBOARD DETECTION
-------------------------------- */

let lastHeight = window.innerHeight;
let keyboardTimeout;

function handleKeyboardVisibility() {
    const currentHeight = window.innerHeight;
    
    // Clear any existing timeout
    clearTimeout(keyboardTimeout);
    
    // If viewport height decreased significantly (keyboard opened)
    if (currentHeight < lastHeight - 150) {
        body.classList.add('keyboard-visible');
        
        // Set CSS variable for overlay height
        document.documentElement.style.setProperty('--visual-height', `${currentHeight}px`);
    } else {
        // Add a small delay to prevent flickering
        keyboardTimeout = setTimeout(() => {
            body.classList.remove('keyboard-visible');
            document.documentElement.style.removeProperty('--visual-height');
        }, 100);
    }
    
    lastHeight = currentHeight;
}

// Listen for viewport changes (keyboard open/close)
window.addEventListener('resize', handleKeyboardVisibility);

// iOS specific: handle visual viewport changes
if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', handleKeyboardVisibility);
}

/* -----------------------------
   5. UTILITIES & LISTENERS
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
            el.tabIndex = el.getAttribute("data-prev-tabindex") || 0;
            el.removeAttribute("aria-hidden");
            el.removeAttribute("data-prev-tabindex");
        }
    });
}

// Keyboard & Click Listeners
window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && UI_STATE.overlayStack.length > 0) {
        closeActiveOverlay();
    }
});

window.addEventListener("click", (e) => {
    if (e.target.classList.contains('overlay')) {
        closeActiveOverlay();
    }
});

// Smooth Scroll for Navigation
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener("click", function (e) {
            const href = this.getAttribute("href");
            
            // Ignore empty hash or just "#"
            if (!href || href === "#") {
                e.preventDefault();
                return;
            }
            
            const target = document.querySelector(href);
            if (!target) return;
            
            e.preventDefault();
            
            // Close any open overlays
            while(UI_STATE.overlayStack.length > 0) {
                closeActiveOverlay();
            }
            
            // Calculate scroll position
            const navHeight = document.querySelector(".nav-sticky")?.offsetHeight || 64;
            const targetPosition = target.offsetTop - navHeight;
            
            // Smooth scroll
            window.scrollTo({ 
                top: targetPosition, 
                behavior: "smooth" 
            });
            
            // Update focus for accessibility
            target.tabIndex = -1;
            target.focus();
        });
    });
    
    // Add email validation listener
    const emailInput = document.getElementById('audit-email');
    if (emailInput) {
        emailInput.addEventListener('blur', validateBusinessEmail);
        emailInput.addEventListener('input', () => {
            const warning = document.getElementById('email-warning');
            if (warning && warning.style.display !== 'none') {
                validateBusinessEmail();
            }
        });
    }
    
    // Add NDA checkbox listener
    const ndaCheckbox = document.getElementById('nda-required');
    if (ndaCheckbox) {
        ndaCheckbox.addEventListener('change', toggleFigmaRequirement);
    }
});

/* -----------------------------
   6. PERFORMANCE OPTIMIZATION
-------------------------------- */

// Debounce function for performance
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Apply debounce to resize handlers
const debouncedKeyboardHandler = debounce(handleKeyboardVisibility, 100);
window.removeEventListener('resize', handleKeyboardVisibility);
window.addEventListener('resize', debouncedKeyboardHandler);

/* -----------------------------
   7. ACCESSIBILITY ENHANCEMENTS
-------------------------------- */

// Trap focus within overlay
function trapFocus(element) {
    const focusableElements = element.querySelectorAll(
        'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
    );
    
    if (focusableElements.length === 0) return;
    
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    
    element.addEventListener('keydown', function(e) {
        if (e.key !== 'Tab') return;
        
        if (e.shiftKey) {
            if (document.activeElement === firstElement) {
                lastElement.focus();
                e.preventDefault();
            }
        } else {
            if (document.activeElement === lastElement) {
                firstElement.focus();
                e.preventDefault();
            }
        }
    });
}

// Apply focus trap to overlays when they open
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.overlay').forEach(overlay => {
        trapFocus(overlay);
    });
});

})(); // End of IIFE
