---
version: alpha
name: Toolfolio Dark
description: A sleek dark discovery system with vivid blue accents and compact, modern cards.
colors:
  primary: "#5865F2"
  secondary: "#18181B"
  tertiary: "#262626"
  neutral: "#000000"
  surface: "#18181B"
  on-surface: "#FFFFFF"
  text-muted: "#A1A1AA"
  border: "#262626"
  overlay: "#000000CC"
  error: "#EF4444"
typography:
  headline-display:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: 700
    lineHeight: 38px
    letterSpacing: 0px
  headline-lg:
    fontFamily: Inter
    fontSize: 26px
    fontWeight: 600
    lineHeight: 31px
    letterSpacing: -0.5px
  headline-md:
    fontFamily: Inter
    fontSize: 22px
    fontWeight: 600
    lineHeight: 22.5px
    letterSpacing: 0px
  headline-sm:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: 500
    lineHeight: 21px
    letterSpacing: 0px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: 400
    lineHeight: 24px
    letterSpacing: 0px
  body-md:
    fontFamily: Inter
    fontSize: 15px
    fontWeight: 400
    lineHeight: 24px
    letterSpacing: 0px
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: 400
    lineHeight: 20px
    letterSpacing: 0px
  label-lg:
    fontFamily: Inter
    fontSize: 15px
    fontWeight: 500
    lineHeight: 20px
    letterSpacing: 0px
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: 500
    lineHeight: 18px
    letterSpacing: 0px
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: 500
    lineHeight: 16px
    letterSpacing: 0px
  caption:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: 400
    lineHeight: 16px
    letterSpacing: 0px
rounded:
  none: 0px
  sm: 8px
  md: 12px
  lg: 20px
  xl: 28px
  full: 9999px
spacing:
  xs: 2px
  sm: 6px
  md: 16px
  lg: 20px
  xl: 24px
  gutter: 24px
  section: 32px
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-surface}"
    typography: "{typography.label-md}"
    rounded: "{rounded.full}"
    padding: "8px 24px"
    height: "68px"
  button-primary-hover:
    backgroundColor: "#4451E8"
    textColor: "{colors.on-surface}"
    rounded: "{rounded.full}"
  button-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.on-surface}"
    typography: "{typography.label-md}"
    rounded: "{rounded.sm}"
    padding: "8px 24px"
    height: "68px"
  button-link:
    backgroundColor: "transparent"
    textColor: "{colors.on-surface}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.none}"
    padding: "0px"
  card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface}"
    rounded: "{rounded.md}"
    padding: "20px"
  input:
    backgroundColor: "#222226"
    textColor: "{colors.on-surface}"
    rounded: "{rounded.full}"
    padding: "12px 16px"
  chip:
    backgroundColor: "#2A2A2F"
    textColor: "{colors.text-muted}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.full}"
    padding: "8px 16px"
  modal:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface}"
    rounded: "{rounded.md}"
    padding: "0px"
---

# Toolfolio Dark

## Overview
Toolfolio feels like a polished, high-contrast product marketing and account creation experience for a tech-savvy audience. The tone is modern and confident, with a dark UI that lets bright accents and crisp white typography carry the hierarchy. Spacing is compact but not cramped, giving the interface a focused, premium feel.

## Colors
- **Primary (#5865F2):** A vivid electric blue used for brand emphasis and action-forward elements. It brings energy to the otherwise restrained dark palette.
- **Secondary (#18181B):** The main surface color for cards and panels. This near-black charcoal creates the core dark mode foundation.
- **Tertiary (#262626):** A slightly lighter structural tone used for dividers, borders, and secondary controls. It subtly separates areas without breaking the dark aesthetic.
- **Neutral (#000000):** The backdrop color for the full-page environment and deep visual framing. It makes the modal and content layers feel suspended above the page.
- **On-surface (#FFFFFF):** The primary text and icon color on dark surfaces. It provides strong legibility and the cleanest possible contrast.
- **Text-muted (#A1A1AA):** A softened gray used for helper text, secondary links, and less prominent labels. It keeps hierarchy clear without introducing more colors.
- **Border (#262626):** A restrained separator tone for outlines and structural edges. Borders are minimal and mostly perceptual rather than decorative.
- **Overlay (#000000CC):** Used for dimming and depth behind elevated content. It reinforces focus on the centered modal pattern.
- **Error (#EF4444):** A utility warning color reserved for destructive states or validation. It is not dominant in the observed interface but fits the system's functional needs.

## Typography
Inter is the sole type family, supporting the design’s clean, product-led tone. Headings use strong weights from 500 to 700, while body copy stays at 400 and labels at 500 for clarity and scannability. The largest heading style is compact and centered, with tight line heights and slight negative tracking on the mid-size heading to improve polish.

Use `headline-display` for the main promotional headline, `headline-lg` and `headline-md` for supporting hierarchy, and `headline-sm` for smaller section titles. Body content should rely on `body-md` or `body-sm` to keep the interface lightweight. Labels and button text should use `label-md` or `label-sm` for crisp, modern control text. Uppercase treatment is not a primary feature; the system leans on weight and contrast instead of letter-spacing tricks.

## Layout
The layout is centered and modal-driven, with a fixed-width card composition rather than a fluid editorial grid. Content is split into two clear columns inside the modal: a visual panel on the left and a functional sign-up panel on the right. Internal spacing follows a compact rhythm using 2px, 6px, 16px, 20px, and 24px increments, which keeps the interface tight and consistent.

Sections inside the right panel use generous vertical separation between the headline, feature chips, divider, and sign-in actions. The card padding of 20px supports a self-contained composition without feeling oversized. Horizontal alignment is precise, and elements are centered or evenly distributed to preserve balance in a relatively small modal footprint.

## Elevation & Depth
Depth is created primarily through contrast rather than heavy shadows. The modal and card surfaces are separated from the black page background by tonal layering: black outside, charcoal inside, and bright white text on top. The shadow treatment is subtle to nearly absent, so the system depends on surface color differences, spacing, and the bright image panel to establish hierarchy.

The modal reads as an elevated object because of its rounded edges, centered placement, and strong boundary against the dim background. Dividers and chip backgrounds add micro-depth without introducing glossy effects or complex elevation stacks.

## Shapes
The shape language is soft and modern, with rounded corners used consistently on cards, pills, and action buttons. The strongest shape cue is the full pill radius on primary actions and chips, which gives the interface a friendly, consumer-friendly feel. Secondary containers use modest 8px to 12px rounding, keeping the system clean and controlled.

Overall, the geometry is smooth rather than angular. There are no sharp corners on key interactive elements, and the rounded language helps soften the dark palette.

## Components
Buttons are the most expressive components in the system. `button-primary` is the main call to action: filled with `colors.primary`, white text, full pill rounding, and a substantial 68px height. `button-secondary` should remain low-contrast and mostly transparent, supporting alternate actions without competing with the primary CTA. `button-link` is reserved for inline navigation such as “Continue with email” or “Sign in,” using no container chrome and relying on underline or color for affordance.

Cards use `card` styling with `colors.surface`, 20px padding, and `rounded.md`. They should feel like self-contained content shells, especially for modal layouts and tool previews. Inputs should be dark, pill-shaped, and minimally styled, with clear focus states rather than decorative borders. Chips use `chip` styling: compact, pill-shaped tags with muted text and a slightly lighter dark fill, ideal for feature summaries such as search, newsletter, bookmarks, and collections.

The modal should function as the primary composite container, using the same surface tone as cards but with stronger spatial prominence. Inline icons are small and understated, supporting labels rather than leading the design. Dividers are thin and low-contrast, used only to organize blocks of content.

## Do's and Don'ts
- Do keep all major surfaces dark and rely on contrast, not bright backgrounds, for hierarchy.
- Do use Inter consistently across headlines, body copy, labels, and buttons.
- Do keep primary actions pill-shaped and visually dominant.
- Do preserve the compact spacing rhythm; avoid large open gaps inside the modal.
- Don't add heavy shadows, glass effects, or glossy gradients to core containers.
- Don't introduce multiple accent colors; the blue primary should remain the main brand signal.
- Don't square off chips, buttons, or modal corners.
- Don't make secondary links look as prominent as the main CTA.