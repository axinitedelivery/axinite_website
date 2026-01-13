AXINITE SYSTEM | INTEGRATION README

Scope: Foundation Tier (Web / CSS)
Artifact ID: ADS-RE-001
Version: 1.1
Status: DETERMINISTIC ARTIFACT

PURPOSE
---------------------------
This document defines the technical integration procedure for
the delivered Axinite design tokens. It exists solely to ensure
correct projection of audited Figma styles into the Web runtime
via CSS variables.


1. DELIVERED ARTIFACTS
---------------------------

[ ] ads-tokens.json
    Canonical token definition (machine-readable)

[ ] ads-tokens.css
    Web runtime projection (CSS custom properties)

[ ] ads-mapping-dictionary.md  
    Figma Style → Semantic Token mapping reference

[ ] ads-integration-readme.md  
    This document

[ ] ads-usage-snippets.md  
    Five reference component examples (verification only)


2. INTEGRATION (WEB / CSS)
---------------------------

STEP 1  
Place `ads-tokens.css` into your global styles directory.

STEP 2  
Import the file before any component or layout styles:

@import './styles/ads-tokens.css';

STEP 3  
Ensure components consume component-level tokens (L4) only:

.btn-primary {
  background: var(--color-action-primary);
  padding: var(--button-padding);
  border-radius: var(--button-radius);
  color: var(--color-text-on-action);
}

Direct usage of primitives (L1), semantic tokens (L2),
or policy tokens (L3) inside components is prohibited.


3. TOKEN HIERARCHY (INTEGRATION MODEL)
---------------------------

L1 — Primitives  
Raw numeric values (e.g. spacing units, pixel radii).

L2 — Semantic Tokens  
Named roles derived from primitives.

L3 — Policy Tokens  
Active bindings selecting which semantic variant is in force.

L4 — Component Tokens  
Explicit aliases consumed by UI components.

Components must read L4 only.
L4 is the integration API.


4. REFERENCE COMPONENTS
---------------------------

Reference components provided in Figma and in
`ads-usage-snippets.md` exist only to verify correct
token resolution and mapping.

They are not a production-ready component library.


5. RUNTIME VALIDATION
---------------------------

To verify correct runtime resolution:

getComputedStyle(document.documentElement)
  .getPropertyValue('--button-radius');

Expected output: a resolved numeric value (e.g. `8px`).

If values are empty or unresolved, check import order
and variable name integrity.


6. ENVIRONMENT NOTES
---------------------------

CSS custom properties require modern evergreen browsers.

For legacy or static builds, tokens must be compiled at
build time using the Client’s tooling.

The Provider does not ship runtime polyfills.


7. VERSIONING & UPDATES
---------------------------

This delivery is static.

Changes to Figma after delivery do not auto-sync.

Any updates to token values, policy bindings, or component
aliases require a new export or patch as defined by the
governing agreement.


End of Terms
ADS-RE-001 — Axinite Design System Foundation
