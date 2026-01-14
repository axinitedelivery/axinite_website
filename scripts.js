/**
 * AXINITE SYSTEM | UI Infrastructure Controller
 * Final Build: Zero-Jump, No-Reflow Logic
 *
 * Reworked: single submit handler, deterministic overlay flow,
 * policy-driven token sandbox, and safe server-side submission.
 */

(function () {
  'use strict';

  /* -----------------------------
     STATE
  -------------------------------- */
  const UI_STATE = {
    activeOverlay: null,
    scrollPos: 0
  };

  const body = document.body;
  const html = document.documentElement;

  /* -----------------------------
     SCROLL LOCK
  -------------------------------- */
  function lockScroll() {
    // Capture exact pixel position
    UI_STATE.scrollPos = window.pageYOffset || html.scrollTop || 0;

    // Pin the body so background doesn't jump
    body.style.position = 'fixed';
    body.style.top = `-${UI_STATE.scrollPos}px`;
    body.style.width = '100%';
    // keep vertical gutter consistent
    body.style.overflowY = 'scroll';
  }

  function unlockScroll() {
    // Temporarily disable smooth behavior to jump instantly
    html.style.scrollBehavior = 'auto';
    body.style.scrollBehavior = 'auto';

    body.style.removeProperty('position');
    body.style.removeProperty('top');
    body.style.removeProperty('width');
    body.style.removeProperty('overflow-y');

    // Jump back to original location
    window.scrollTo(0, UI_STATE.scrollPos || 0);

    // Cleanup and restore smooth scrolling on next frame
    requestAnimationFrame(() => {
      html.style.removeProperty('scroll-behavior');
      body.style.removeProperty('scroll-behavior');
    });
  }

  /* -----------------------------
     OVERLAY CONTROLLER
  -------------------------------- */
  window.openOverlay = async function (id, fileName = null) {
    const overlay = document.getElementById(id);
    if (!overlay) return;

    // mapping technical file -> human title
    const labelMap = {
      'ads-integration-readme.md': 'INTEGRATION README',
      'ads-commercial-terms.md': 'COMMERCIAL TERMS',
      'ads-privacy-policy.md': 'PRIVACY POLICY',
      'ads-terms-of-service.md': 'TERMS OF SERVICE'
    };

    // If another overlay is active, hide it but keep scroll locked.
    if (UI_STATE.activeOverlay && UI_STATE.activeOverlay !== id) {
      const prev = document.getElementById(UI_STATE.activeOverlay);
      if (prev) prev.style.display = 'none';
    } else if (!UI_STATE.activeOverlay) {
      // First overlay open: lock scroll
      lockScroll();
    }

    // Update overlay label if present
    const labelNode = overlay.querySelector('.overlay-label');
    if (labelNode) {
      labelNode.textContent = labelMap[fileName] || 'DOCUMENTATION';
    }

    // Update download button (if overlay includes an anchor with [download])
    const downloadBtn = overlay.querySelector('.btn-secondary[download]');
    if (downloadBtn && fileName) {
      downloadBtn.href = fileName;
      downloadBtn.setAttribute('download', fileName);
    }

    // Fetch and inject content into .readme-text element, if present
    const target = overlay.querySelector('.readme-text');
    if (fileName && target) {
      target.textContent = 'Fetching system artifact...';
      try {
        const response = await fetch(fileName);
        if (!response.ok) throw new Error('Not found');
        const text = await response.text();
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
     RADIUS / TOKEN SANDBOX
     L1 -> L2 -> L3 -> L4 demonstration
  -------------------------------- */
  (function initRadiusSandbox() {
    const buttons = document.querySelectorAll('.radius-toggle [data-scale]');
    const previewSurface = document.querySelector('.preview-surface');
    const codeOut = document.getElementById('token-debug') || document.getElementById('token-code');
    const tokenLine = document.getElementById('token-line');

    if (!buttons || !buttons.length) return;

    const SEMANTIC = {
      sm: { surface: '--radius-surface-sm', control: '--radius-control-sm', label: 'sm' },
      md: { surface: '--radius-surface-md', control: '--radius-control-md', label: 'md' },
      lg: { surface: '--radius-surface-lg', control: '--radius-control-lg', label: 'lg' }
    };

    function setRadiusPolicy(size) {
      const cfg = SEMANTIC[size];
      if (!cfg) return;

      // Button UI state
      buttons.forEach(b => {
        const active = b.dataset.scale === size;
        b.classList.toggle('is-active', active);
        b.setAttribute('aria-pressed', String(active));
      });

      // local preview attribute (CSS reads this for demonstration)
      if (previewSurface) previewSurface.setAttribute('data-radius', size);

      // Set L3 policy tokens on :root (authoritative)
      const root = document.documentElement;
      root.style.setProperty('--radius-surface', `var(${cfg.surface})`);
      root.style.setProperty('--radius-control', `var(${cfg.control})`);

      // Explicit L4 component aliases for clarity/debugging
      root.style.setProperty('--card-radius', 'var(--radius-surface)');
      root.style.setProperty('--input-radius', 'var(--radius-control)');
      root.style.setProperty('--button-radius', 'var(--radius-control)');

      // Human readable line
      if (tokenLine) tokenLine.textContent = `radius.surface → ${cfg.label} · radius.control → ${cfg.label}`;

      // Show the projected CSS policy in the code preview
      if (codeOut) {
        codeOut.textContent = `:root {\n  /* Policy (active semantics) */\n  --radius-surface: var(${cfg.surface});\n  --radius-control: var(${cfg.control});\n\n  /* Component bindings */\n  --card-radius: var(--radius-surface);\n  --input-radius: var(--radius-control);\n  --button-radius: var(--radius-control);\n}`;
      }

      // SR hint
      if (previewSurface) {
        previewSurface.setAttribute('aria-live', 'polite');
        setTimeout(() => previewSurface.removeAttribute('aria-live'), 600);
      }
    }

    // Attach listeners
    buttons.forEach(btn => {
      btn.addEventListener('click', () => {
        const size = btn.getAttribute('data-scale') || btn.dataset.scale;
        setRadiusPolicy(size);
      });
    });

    // Initial
    const initial = (previewSurface && previewSurface.getAttribute('data-radius')) || 'md';
    setRadiusPolicy(initial);
  })();

  /* -----------------------------
     SINGLE, DETERMINISTIC FORM SUBMIT
     (replaces earlier duplicate handlers)
  -------------------------------- */
  window.handleSetupSubmit = async function (e) {
    if (e && e.preventDefault) e.preventDefault();

    const form = (typeof e.target === 'object' && e.target) ? e.target : document.getElementById('setupForm');
    if (!form) {
      alert('Form not found.');
      return false;
    }

    // Basic client-side collection & validation
    const formData = new FormData(form);
    const payload = {
      name: (formData.get('name') || '').toString().trim(),
      email: (formData.get('email') || '').toString().trim(),
      platform: (formData.get('platform') || form.querySelector('input[name="platform"]:checked')?.value || '').toString(),
      figma_url: (formData.get('figma_url') || '').toString().trim(),
      outcome: (formData.get('outcome') || '').toString(),
      consent_files: formData.get('consent_files') === 'on',
      consent_data: formData.get('consent_data') === 'on',
      submitted_at: new Date().toISOString()
    };

    // Required fields guard
    if (!payload.name || !payload.email || !payload.platform || !payload.outcome) {
      alert('Please fill required fields (name, email, platform, requested service).');
      return false;
    }
    if (!payload.consent_files || !payload.consent_data) {
      alert('Please confirm you have the rights and consent to share this information.');
      return false;
    }

    // Set UI to submitting
    const submitBtn = document.querySelector('button[form="setupForm"][type="submit"]');
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Submitting…';
    }

    try {
      const res = await fetch('/api/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        console.error('Submission error', body || res.statusText);
        throw new Error(body?.error || 'Submission failed');
      }

      // Keep background pinned; hide the form overlay and show the success overlay
      const setupOverlay = document.getElementById('setup-overlay');
      if (setupOverlay) setupOverlay.style.display = 'none';

      const successMsg = "Your request has been received and will be reviewed. You’ll receive next steps by email within 24–48 hours.";
      const messageNode = document.getElementById('success-message');
      if (messageNode) messageNode.textContent = successMsg;

      // openOverlay will set UI_STATE.activeOverlay and keep scroll locked
      window.openOverlay('success-overlay');

      // reset form
      form.reset();

    } catch (err) {
      alert('Submission failed. Try again later.');
      console.error(err);
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Start Setup';
      }
    }

    return false; // legacy safety
  };

  /* -----------------------------
     GLOBAL CLICK / KEY HANDLERS
  -------------------------------- */
  document.addEventListener('click', (e) => {
    // Close overlay when clicking on backdrop (overlay element)
    if (e.target && e.target.classList && e.target.classList.contains('overlay')) {
      closeActiveOverlay();
    }

    // Open overlay via data-open-overlay attribute
    const openBtn = e.target.closest && e.target.closest('[data-open-overlay]');
    if (openBtn) {
      e.preventDefault();
      const target = openBtn.dataset.openOverlay;
      const file = openBtn.dataset.file || null;
      window.openOverlay(target, file);
    }

    // Close via data-close-overlay
    if (e.target.closest && e.target.closest('[data-close-overlay]')) {
      closeActiveOverlay();
    }
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeActiveOverlay();
  });

})();
