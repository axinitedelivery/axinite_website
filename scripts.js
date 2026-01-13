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
 * AXINITE SYSTEM | Unified Markdown Controller
 * Handles 4 Files: README, Terms, Privacy, Scope
 */

window.openOverlay = async function (id, fileName = null) {
    const overlay = document.getElementById(id);
    if (!overlay) return;

    // 1. Label Mapping (Technical file -> Human Title)
    const labelMap = {
        'ads-integration-readme.md': 'INTEGRATION README',
        'ads-commercial-terms.md': 'COMMERCIAL TERMS',
        'ads-privacy-policy.md': 'PRIVACY POLICY',
        'ads-terms-of-service.md': 'TERMS OF SERVICE'
    };

    // 2. Lock scroll and switch views
    if (UI_STATE.activeOverlay) {
        document.getElementById(UI_STATE.activeOverlay).style.display = 'none';
    } else {
        lockScroll();
    }

    // 3. Update Header Label
    const labelNode = overlay.querySelector('.overlay-label');
    if (labelNode) {
        labelNode.textContent = labelMap[fileName] || 'DOCUMENTATION';
    }

    // 4. UPDATE DOWNLOAD BUTTON (Crucial step)
    const downloadBtn = overlay.querySelector('.btn-secondary[download]');
    if (downloadBtn && fileName) {
        downloadBtn.href = fileName;
        downloadBtn.setAttribute('download', fileName);
    }

    // 5. Fetch and Inject Content
    const target = overlay.querySelector('.readme-text');
    if (fileName && target) {
        target.textContent = "Fetching system artifact...";
        try {
            const response = await fetch(fileName);
            if (!response.ok) throw new Error();
            const text = await response.text();
            
            // Injects text into your <pre class="readme-text">
            target.textContent = text.trim();
        } catch (err) {
            target.textContent = `ERROR 404: [${fileName}] not found in repository.`;
        }
    }

    UI_STATE.activeOverlay = id;
    overlay.style.display = 'flex';
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

(function () {
  const buttons = document.querySelectorAll('.radius-toggle [data-scale]');
  const previewSurface = document.querySelector('.preview-surface');
  const codeOut = document.getElementById('token-debug') || document.getElementById('token-code');
  const tokenLine = document.getElementById('token-line');

  if (!buttons.length) return;

  // Map of semantic options (L2). These must already exist as CSS variables.
  const SEMANTIC = {
    sm: {
      surface: '--radius-surface-sm',
      control: '--radius-control-sm',
      label: 'sm'
    },
    md: {
      surface: '--radius-surface-md',
      control: '--radius-control-md',
      label: 'md'
    },
    lg: {
      surface: '--radius-surface-lg',
      control: '--radius-control-lg',
      label: 'lg'
    }
  };

  /**
   * Set the L3 policy variables on :root so the whole page or exported tokens respond.
   * This is the authoritative action that demonstrates governance.
   */
  function setRadiusPolicy(size) {
    const cfg = SEMANTIC[size];
    if (!cfg) return;

    // Update button UI state
    buttons.forEach(b => {
      const active = b.dataset.scale === size;
      b.classList.toggle('is-active', active);
      b.setAttribute('aria-pressed', String(active));
    });

    // Optionally keep the demo preview-surface data attribute for local scoping or copy
    if (previewSurface) previewSurface.setAttribute('data-radius', size);

    // Set the L3 policy variables on :root
    const root = document.documentElement;
    // Policy tokens (active semantics)
    root.style.setProperty('--radius-surface', `var(${cfg.surface})`);
    root.style.setProperty('--radius-control', `var(${cfg.control})`);

    // Optional explicit component bindings (L4). Not necessary if your CSS uses these aliases,
    // but explicit assignment makes the demo and debugging clear.
    root.style.setProperty('--card-radius', 'var(--radius-surface)');
    root.style.setProperty('--input-radius', 'var(--radius-control)');
    root.style.setProperty('--button-radius', 'var(--radius-control)');

    // Update the human-readable token line if present
    if (tokenLine) {
      tokenLine.textContent = `radius.surface → ${cfg.label} · radius.control → ${cfg.label}`;
    }

    // Update the code preview (CSS projection of the policy)
    if (codeOut) {
      codeOut.textContent = `:root {\n  /* Policy (active semantics) */\n  --radius-surface: var(${cfg.surface});\n  --radius-control: var(${cfg.control});\n\n  /* Component bindings */\n  --card-radius: var(--radius-surface);\n  --input-radius: var(--radius-control);\n  --button-radius: var(--radius-control);\n}`;
    }

    // Accessibility: small SR hint
    if (previewSurface) {
      previewSurface.setAttribute('aria-live', 'polite');
      setTimeout(() => previewSurface.removeAttribute('aria-live'), 600);
    }
  }

  // Attach listeners
  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      const size = btn.getAttribute('data-scale');
      setRadiusPolicy(size);
    });
  });

  // Initialize from preview DOM or default md
  const initial = (previewSurface && previewSurface.getAttribute('data-radius')) || 'md';
  setRadiusPolicy(initial);

})();


/**
 * HANDLES AUDIT FORM SUBMISSION
 * Transition logic from Form -> Success Overlay
 */
window.handleSetupSubmit = function (e) {
    // 1. Prevent the browser from refreshing the page
    if (e && e.preventDefault) e.preventDefault();


    // 3. Select the appropriate deterministic message
     const successMsg =   "Your request has been received and will be reviewed. You’ll receive next steps by email within 24–48 hours.";

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
    const auditOverlay = document.getElementById('setup-overlay');
    if (auditOverlay) auditOverlay.style.display = 'none';

    // Open the success overlay
    // Note: We use window.openOverlay so it sets UI_STATE.activeOverlay correctly
    window.openOverlay('success-overlay');

    // 6. Final Clean up
    const form = document.getElementById('setupForm');
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

