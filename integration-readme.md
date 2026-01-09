Integration README — Axinite Foundation

Purpose
Fast, deterministic instructions for developers to import and validate delivered tokens in a single-platform build. Use this to confirm parity between design and production.

1. Delivered artifacts (example)

tokens.json — canonical token source (W3C-like structure)

style-dictionary.config — transform config used to generate outputs

tokens.css or Tokens.swift or Tokens.kt / colors.xml — platform runtime output (one selected)

mapping-dictionary.md — exact Figma style → token mappings

integration-readme.md — this file

reference-components/ — Figma instances + minimal code snippets

2. Prerequisites

Node 16+ (for local transforms / verification) — optional if you only need runtime files

Access to the codebase where tokens will be consumed (branch with CI or a feature branch)

Developer with basic familiarity with the chosen platform (CSS variables, Swift constants, or Kotlin resources)

3. Quick install (Web)

Copy tokens.css into your project’s src/styles/ or import from static hosting.

In your global entry (e.g. index.css or index.js):

@import './styles/tokens.css';
:root { /* tokens already defined in tokens.css */ }


Use variable in components:

.button { background: var(--color-action-primary); color: var(--color-text-on-action); padding: var(--space-control-md); }

4. Quick install (iOS — Swift)

Add Tokens.swift to the app module (e.g., Sources/AxiniteTokens/).

Example usage:

// Tokens.swift exposes constants, e.g. Tokens.Color.actionPrimary
let bg = UIColor(hex: Tokens.Color.actionPrimary)
let padding = CGFloat(Tokens.Spacing.controlMd)


Integrate into design system components (SwiftUI or UIKit) via these constants.

5. Quick install (Android — Kotlin)

Add Tokens.kt into a tokens package (e.g., com.company.tokens).

Example usage (Compose):

val ActionPrimary = Color(parseColor(Tokens.Color.ActionPrimary))
Button(colors = ButtonDefaults.buttonColors(backgroundColor = ActionPrimary)) { ... }


(If colors.xml was delivered, add into res/values/colors.xml and reference via resource IDs.)

6. Token mapping example (from mapping-dictionary.md)
Figma style name	Token identifier	Runtime output
Primary / Brand / 500	color.brand.500	--color-brand-500: #0A84FF;
Text / Body / Primary	color.text.primary	--color-text-primary: #0A0A0A;
Control / Height / MD	space.control.md	--space-control-md: 16px;

Use mapping-dictionary.md as the single source for renaming or lookup. If a value is missing here, it triggers the Quality Gate.

7. Token update workflow (recommended)

Modify tokens.json (source-of-truth).

Run transform (local): npx style-dictionary build --config style-dictionary.config (optional — we can provide CI workflow)

Commit tokens.json + generated runtime files or publish them via static hosting.

Open PR: include mapping diff, affected components, and run verification tests.

8. Verification checklist (what you must test)

 Runtime tokens compile / parse without syntax errors (CSS parses; Swift/Kotlin source compiles)

 Reference components render with tokens only (no hard-coded colors/spacings)

 Visual spot-check: screenshot or run Storybook static build and compare with Figma instances

 Mapping document is included in PR and accepted by design owner

9. Common troubleshooting

CSS variables not applied → confirm tokens.css is imported before component styles.

Swift constants not recognized → check namespace and Swift access modifiers; ensure file added to correct target.

Android mismatch → confirm whether Tokens.kt or colors.xml was delivered; they are not interchangeable without conversion.

10. Acceptance (what we sign off on)

We consider tokens accepted when:

Delivered runtime file compiles (or CSS parses) in target environment.

Reference components show pixel-parity (within reasonable tolerance) with Figma instances.

No open Quality Gate issues exist.

11. Contact & support

Delivery owner: [your-email@example.com
]

Include: project name, platform, token JSON excerpt, and a screenshot of failing vs expected UI.