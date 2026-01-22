# Design Guidelines

This document defines the standard landing page blueprint and premium auth UI
template. It is the source of truth for layout, components, motion, and theming.

## A) Blueprint Overview

- Single-page layout with a clear, consistent visual rhythm.
- Reuse primitives: Button, Card, Input, Section, Container.
- Theme-aware using semantic tokens (background, foreground, card, muted, border,
  primary, destructive).
- Motion is subtle and consistent (easeOut, short durations, staggered lists).
- Accessibility is non-negotiable (focus-visible rings, contrast, tap targets).

## B) Section Sequence (Canonical Order)

1. Sticky Header (brand + nav + theme toggle + primary CTA)
2. Hero (value prop + proof + primary/secondary CTA)
3. Interactive Proof (product demo OR stats OR mini “how it works”)
4. Feature Grid (capabilities)
5. How It Works (process)
6. Social Proof (logos/testimonials/metrics)
7. Pricing or Plan Teaser (optional but recommended for B2B)
8. FAQ (objection handling)
9. Final CTA (conversion endcap)
10. Footer (utility nav + legal)

## C) Section Details

### 1) Sticky Header
Purpose: Always-available navigation + trust anchor + conversion.

Components:
- Brand
- DesktopNav
- MobileNav
- ThemeToggle
- PrimaryCTAButton

Content Blocks:
- Brand mark + name
- 3–6 nav links
- “Sign in” / “Get started”
- Theme toggle

Layout Rules:
- Desktop: brand left; nav center/right; primary CTA right; theme toggle near nav.
- Mobile: brand left; theme toggle + hamburger right; hide desktop links.
- Scroll: transparent at top; on scroll add blur + border + subtle shadow.

Interaction Rules:
- Active link state
- Smooth scroll for anchors
- External links open new tab

Common Variations:
- Announcement bar above header
- Language selector
- Multi-product dropdown

### 2) Hero (Primary Value Prop)
Purpose: Explain what it is + who it’s for + why it’s better; drive first CTA.

Components:
- Eyebrow/Pill
- H1
- Supporting paragraph
- CTA group
- Trust bullets
- Optional hero visual

Content Structure:
- Eyebrow: 3–6 words + subtle icon/dot
- H1: max 2 lines, optional gradient emphasis
- Subcopy: 1–2 sentences, 1 quantified claim if credible
- CTAs: Primary + Secondary, optional tertiary
- Trust bullets: 2–4 short bullets

Layout Rules:
- Desktop: 60/40 split (copy/visual) or centered hero, max-width 6–7xl
- Tablet: stack visual under copy or maintain 2-col with reduced gaps
- Mobile: single column; CTAs stack vertically; tap targets >= 44px

Interaction Rules:
- CTA hover lift + shadow
- Secondary CTA border/color shift

Common Variations:
- Split hero
- Centered hero
- Hero with screenshot
- Hero with “cards” stack

### 3) Interactive Proof (Choose One)
Purpose: Reduce skepticism via interaction or quantified evidence.

Options:
- Try it now demo block
- Stats row (3–4 KPIs)
- Mini “how it works” (3 steps)

Components:
- Section header + two-column block OR horizontal stats row

Layout Rules:
- Desktop: 2-col (copy + interactive) or row of stats
- Mobile: stack; interactive below explanation

Interaction Rules:
- Inputs use focus-visible ring
- Results animate in subtly

Common Variations:
- Video modal
- Interactive widget
- Comparison slider

### 4) Feature Grid
Purpose: Convert value into concrete capabilities.

Components:
- Section header (pill + H2 + subcopy)
- FeatureCard list

Data Model:
features[] = { icon, title, description, category?, emphasisColor? }

Layout Rules:
- Desktop: 3 columns, 6 items typical
- Tablet: 2 columns
- Mobile: 1 column

Interaction Rules:
- Card hover: slight elevation + border accent
- Icon hover: subtle scale/rotate

Common Variations:
- Feature rows (image left, text right)
- Grouped features
- Tabbed features

### 5) How It Works (Process)
Purpose: Make adoption feel easy; show path from signup to outcome.

Components:
- StepCard list (number, icon, title, description)

Data Model:
steps[] = { number, title, description, icon, color? }

Layout Rules:
- Desktop: 4 columns or 3 columns
- Tablet: 2 columns
- Mobile: 1 column

Interaction Rules:
- Hover elevation
- Optional staggered reveal

Common Variations:
- Timeline
- Numbered list with illustration
- Accordion steps

### 6) Social Proof
Purpose: Build trust (logos + testimonials + outcomes).

Components:
- LogosRow
- Testimonials grid or carousel
- Optional metric chips

Data Model:
logos[] = { name, src }
testimonials[] = { quote, name, role, company, rating?, avatar? }

Layout Rules:
- Logos: wrap, consistent height
- Testimonials: 1–3 cards visible based on viewport

Interaction Rules:
- Optional auto-advance; manual navigation always available

Common Variations:
- Case study cards
- Press mentions
- Review badges

### 7) Pricing / Plan Teaser
Purpose: Set expectations; remove pricing anxiety.

Components:
- PricingCard list

Data Model:
plans[] = { name, price, period, highlight, features[], cta, popular? }

Layout Rules:
- Desktop: 3 cards; “popular” visually elevated
- Mobile: stack

Interaction Rules:
- Hover elevation
- CTA consistent with primary/secondary patterns

Common Variations:
- Contact sales card
- Usage-based slider
- Comparison table

### 8) FAQ
Purpose: Address objections, reduce support burden.

Components:
- Accordion list

Data Model:
faqs[] = { question, answer }

Layout Rules:
- Single column; max width ~3–4xl

Interaction Rules:
- Short open/close animation; preserve focus-visible states

### 9) Final CTA (Endcap)
Purpose: Second conversion moment after full context.

Components:
- H3, subcopy, CTA pair, proof bullets

Layout Rules:
- Desktop: centered; CTAs inline
- Mobile: CTAs stacked
- Background: subtle gradient panel + soft blobs

Interaction Rules:
- Same CTA behavior as hero

### 10) Footer
Purpose: Utility navigation, credibility, compliance.

Components:
- Brand
- Nav columns
- Socials
- Legal

Layout Rules:
- Columns on desktop; stacked on mobile

Interaction Rules:
- Link hover underline
- Focus-visible rings for icon links

## D) System Rules

Tokens (use semantic):
- bg-background, text-foreground
- bg-card, text-muted-foreground
- border-border
- ring-ring
- bg-primary, text-primary-foreground
- bg-destructive, text-destructive-foreground

Typography:
- 1–2 fonts max
- H1: 48–72px desktop, 32–48px mobile
- Body: 16–18px
- Use muted text for supporting copy

Spacing:
- Section padding: 64–96px desktop, 48–64px mobile
- Consistent vertical rhythm

Radii:
- Default 12px
- Large panels 24px

Shadows:
- Subtle on cards and CTAs
- No heavy glow

Buttons:
- Primary: filled, strong contrast, hover lift + shadow, active press
- Secondary: outline, hover border/color shift
- Same height for primary/secondary
- Focus-visible ring + ring offset

Links:
- Clear hover state
- Focus-visible ring for keyboard users

Icons:
- Use sparingly for emphasis
- Keep size consistent across sections

Motion:
- Short, subtle, purposeful
- Use easeOut
- Stagger lists
- Avoid distracting loops

Accessibility:
- Keyboard navigable
- Visible focus
- Contrast in light/dark
- Tap targets >= 44px
- External links: rel="noopener"

## E) Implementation Checklist

- Theme: every section readable in light/dark/system
- Responsive: mobile/tablet/desktop stacking verified
- CTAs: consistent copy and styling
- Focus-visible: all interactive elements
- Performance: optimized images, minimal motion, no layout shift
- Content: clear H1, scannable sections, concise FAQ

## Auth Component Template

### Page-level Layout

- Full viewport container: min-h-screen
- Background: soft multi-stop gradient (light) and dark neutral gradient (dark)
- Floating blobs: 3 circles, low opacity, pointer-events-none, animated
- Motion: page container with stagger; item entrance variants

### Header (Top Nav)

- Left: brand link to "/"
- Right: theme toggle + secondary CTA (Sign In / Create Account)
- Container: max width, px-4, py-6, z-10

### Responsive Layout

- Mobile: stacked (hero -> auth card -> feature list -> social proof)
- Desktop: 2-column grid (hero left, form right), gap-12

### Hero Section

- H1: “Welcome back to <Brand>” (signin) or “Create <outcome> in <time> with <Brand>”
- Gradient text for brand word
- Supporting paragraph 18–24px
- Sparkle icon with subtle rotation/scale

### Auth Card

- Card: bg-white/80 (light), bg-gray-800/80 (dark), backdrop blur
- Shadow-2xl, border-0
- Header: centered, 2xl title, subtle description
- Animate header scale on mount

### Form (Reusable Component)

Props:
- type: "signin" | "signup"
- email, setEmail
- password, setPassword
- fullName + companyName (signup only)
- onSubmit, loading, error

Layout Rules:
- Space-y-6
- Labels: text-sm font-medium
- Inputs: h-11 desktop, h-12 mobile; rounded-md, focus-visible ring
- Signup top row: 2-column grid

### Password Input

- Right-side eye icon toggle
- sr-only label for accessibility
- Optional tabIndex={-1} on icon button

### Primary Submit Button

- Full width, h-11/h-12
- Gradient overlay on hover
- Loading state with spinner + text

### Secondary Actions

- Below form: link to sign in/up
- Primary color for link
- Subtle motion on hover/tap

### Inline Error Panel

- Red tint panel, rounded-lg, animated scale+opacity

### Trust Indicators (Signup Only)

- Divider + chips: “Free to start”, “No credit card”, “Cancel anytime”
- CheckCircle icon
- Staggered entry

### Feature List Block

- Title: “Why Choose <Brand>?”
- 3 rows in glass panels
- Hover: slight shift + scale
- Icon hover: rotate + scale

### Social Proof (Signup Only)

- Avatars row, 5-star rating, short quote
- Staggered entry

### Accessibility & Semantics

- Proper labels linked to inputs
- H1 for page headline
- Contrast safe in dark mode
- No placeholder-only labels
- Proper button types

### Engineering Constraints

- Auth logic lives in pages
- UI components are pure presentational
- No routing logic inside shared components
- Responsive via Tailwind breakpoints

## One-Page Skeleton (Sections)

- Header (sticky)
- Hero
- Interactive Proof
- Feature Grid
- How It Works
- Social Proof
- Pricing (optional)
- FAQ
- Final CTA
- Footer

## Example Data Objects

features[]:
[
  {
    "icon": "Sparkles",
    "title": "Plain-language insights",
    "description": "Understand spending patterns without jargon."
  }
]

steps[]:
[
  {
    "number": 1,
    "title": "Connect or add spending",
    "description": "Import or add transactions in minutes."
  }
]

testimonials[]:
[
  {
    "quote": "This made budgeting feel human.",
    "name": "Alex Rivera",
    "role": "Designer",
    "company": "Studio Co"
  }
]

plans[]:
[
  {
    "name": "Starter",
    "price": "$0",
    "period": "mo",
    "features": ["Basic insights", "Weekly check-ins"],
    "cta": "Get started",
    "popular": false
  }
]

faqs[]:
[
  {
    "question": "Is my data safe?",
    "answer": "We use encryption and never sell your data."
  }
]
