# PassportCard DaisyUI Theme

> **Generated from DSM Design System Tokens**  
> **Date:** January 11, 2026  
> **Source:** `packages/tokens/src/` color, typography, spacing, border-radius, and shadow tokens

---

## Complete Theme Configuration

Copy the following theme configuration into your CSS file:

```css
@plugin "daisyui/theme" {
  name: "Passportcard";
  default: true;
  prefersdark: false;
  color-scheme: "light";

  /* ═══════════════════════════════════════════════════════════════════════════
     BASE COLORS - Page backgrounds and content text
     Source: color.background.primary, secondary, tertiary + color.text.primary
     ═══════════════════════════════════════════════════════════════════════════ */
  --color-base-100: oklch(100% 0 0);              /* #ffffff - Primary background */
  --color-base-200: oklch(97% 0.004 75);          /* #f5f4f2 - Secondary background */
  --color-base-300: oklch(94% 0.006 75);          /* #eeede9 - Tertiary background */
  --color-base-content: oklch(20% 0.006 285);     /* #1d1c1d - Primary text (Brand Black) */

  /* ═══════════════════════════════════════════════════════════════════════════
     PRIMARY COLOR - Brand Red (PassportCard Red)
     Source: color.brand.red = #e10514
     ═══════════════════════════════════════════════════════════════════════════ */
  --color-primary: oklch(51% 0.225 27);           /* #e10514 - PassportCard Red */
  --color-primary-content: oklch(100% 0 0);       /* #ffffff - White text on primary */

  /* ═══════════════════════════════════════════════════════════════════════════
     SECONDARY COLOR - Dark Red (Hover states, emphasis)
     Source: color.brand.darkRed = #ad0f0f
     ═══════════════════════════════════════════════════════════════════════════ */
  --color-secondary: oklch(42% 0.175 25);         /* #ad0f0f - Dark Red */
  --color-secondary-content: oklch(100% 0 0);     /* #ffffff - White text on secondary */

  /* ═══════════════════════════════════════════════════════════════════════════
     ACCENT COLOR - Link Primary Blue
     Source: color.text.linkPrimary = #2246fc
     ═══════════════════════════════════════════════════════════════════════════ */
  --color-accent: oklch(50% 0.26 268);            /* #2246fc - Link Primary Blue */
  --color-accent-content: oklch(100% 0 0);        /* #ffffff - White text on accent */

  /* ═══════════════════════════════════════════════════════════════════════════
     NEUTRAL COLOR - Brand Black (Text and UI elements)
     Source: color.brand.black = #1d1c1d
     ═══════════════════════════════════════════════════════════════════════════ */
  --color-neutral: oklch(20% 0.006 285);          /* #1d1c1d - Brand Black */
  --color-neutral-content: oklch(100% 0 0);       /* #ffffff - White text on neutral */

  /* ═══════════════════════════════════════════════════════════════════════════
     INFO COLOR - Status3 (New/Completed status)
     Source: color.background.status3 = #cdedf7, color.text.status3 = #050c6f
     ═══════════════════════════════════════════════════════════════════════════ */
  --color-info: oklch(91% 0.04 220);              /* #cdedf7 - Info background */
  --color-info-content: oklch(26% 0.16 270);      /* #050c6f - Navy text */

  /* ═══════════════════════════════════════════════════════════════════════════
     SUCCESS COLOR - Status4 (Open/Active status)
     Source: color.background.status4 = #d5f4c4, color.text.status4 = #0b5a14
     ═══════════════════════════════════════════════════════════════════════════ */
  --color-success: oklch(92% 0.08 140);           /* #d5f4c4 - Success background */
  --color-success-content: oklch(38% 0.11 142);   /* #0b5a14 - Green text */

  /* ═══════════════════════════════════════════════════════════════════════════
     WARNING COLOR - Status6 (Pending/In-progress status)
     Source: color.background.status6 = #f7e8c4, color.text.status6 = #8e6119
     ═══════════════════════════════════════════════════════════════════════════ */
  --color-warning: oklch(93% 0.06 85);            /* #f7e8c4 - Warning background */
  --color-warning-content: oklch(52% 0.12 65);    /* #8e6119 - Brown/orange text */

  /* ═══════════════════════════════════════════════════════════════════════════
     ERROR COLOR - Brand Dark Red
     Source: color.text.error = #ad0f0f, color.border.alerts = #ad0f0f
     ═══════════════════════════════════════════════════════════════════════════ */
  --color-error: oklch(42% 0.175 25);             /* #ad0f0f - Error dark red */
  --color-error-content: oklch(100% 0 0);         /* #ffffff - White text on error */

  /* ═══════════════════════════════════════════════════════════════════════════
     BORDER RADIUS - From DSM borderRadius tokens
     Source: borderRadius.s = 10px, borderRadius.md = 20px, borderRadius.pill = 99px
     ═══════════════════════════════════════════════════════════════════════════ */
  --radius-selector: 6.25rem;                     /* 99px → pill shape for toggles/checkboxes */
  --radius-field: 1.25rem;                        /* 20px → md radius for inputs */
  --radius-box: 0.625rem;                         /* 10px → s radius for cards/containers */

  /* ═══════════════════════════════════════════════════════════════════════════
     SIZING - Based on DSM spacing tokens
     Source: spacing.xs = 4px, spacing.sm = 8px
     ═══════════════════════════════════════════════════════════════════════════ */
  --size-selector: 0.25rem;                       /* 4px - Selector size (checkbox, radio) */
  --size-field: 0.5rem;                           /* 8px - Field padding base */

  /* ═══════════════════════════════════════════════════════════════════════════
     BORDERS & EFFECTS
     Source: DSM design guidelines
     ═══════════════════════════════════════════════════════════════════════════ */
  --border: 1px;                                  /* Standard border width */
  --depth: 1;                                     /* Shadow depth multiplier */
  --noise: 0;                                     /* No noise texture */
}
```

---

## Token Mapping Reference

### Color Mappings

| DaisyUI Variable | DSM Token | Hex Value | Description |
|------------------|-----------|-----------|-------------|
| `--color-base-100` | `color.background.primary` | `#ffffff` | Primary page background |
| `--color-base-200` | `color.background.secondary` | `#f5f4f2` | Secondary background |
| `--color-base-300` | `color.background.tertiary` | `#eeede9` | Tertiary background |
| `--color-base-content` | `color.text.primary` | `#1d1c1d` | Primary text (Brand Black) |
| `--color-primary` | `color.brand.red` | `#e10514` | PassportCard Red |
| `--color-primary-content` | `color.text.negative` | `#ffffff` | White text on primary |
| `--color-secondary` | `color.brand.darkRed` | `#ad0f0f` | Dark Red (hover/emphasis) |
| `--color-secondary-content` | `color.text.negative` | `#ffffff` | White text on secondary |
| `--color-accent` | `color.text.linkPrimary` | `#2246fc` | Link Primary Blue |
| `--color-accent-content` | `color.text.negative` | `#ffffff` | White text on accent |
| `--color-neutral` | `color.brand.black` | `#1d1c1d` | Brand Black |
| `--color-neutral-content` | `color.text.negative` | `#ffffff` | White text on neutral |
| `--color-info` | `color.background.status3` | `#cdedf7` | New/Completed status bg |
| `--color-info-content` | `color.text.status3` | `#050c6f` | Navy status text |
| `--color-success` | `color.background.status4` | `#d5f4c4` | Open/Active status bg |
| `--color-success-content` | `color.text.status4` | `#0b5a14` | Green status text |
| `--color-warning` | `color.background.status6` | `#f7e8c4` | Pending status bg |
| `--color-warning-content` | `color.text.status6` | `#8e6119` | Orange/brown status text |
| `--color-error` | `color.text.error` | `#ad0f0f` | Error dark red |
| `--color-error-content` | `color.text.negative` | `#ffffff` | White text on error |

### Border Radius Mappings

| DaisyUI Variable | DSM Token | Value | Description |
|------------------|-----------|-------|-------------|
| `--radius-selector` | `borderRadius.pill` | `99px` | Pill shape for toggles |
| `--radius-field` | `borderRadius.md` | `20px` | Input field radius |
| `--radius-box` | `borderRadius.s` | `10px` | Card/container radius |

### Typography Reference (for custom CSS)

| Purpose | DSM Token | Value |
|---------|-----------|-------|
| Hebrew Font | `typography.fontFamily.hebrew` | `'Rubik', system-ui, sans-serif` |
| English Font | `typography.fontFamily.english` | `'Montserrat', system-ui, sans-serif` |
| Mono Font | `typography.fontFamily.mono` | `'JetBrains Mono', monospace` |
| H1 Size | `typography.fontSize.5xl` | `40px` |
| H2 Size | `typography.fontSize.4xl` | `26px` |
| H3 Size | `typography.fontSize.3xl` | `24px` |
| Body Default | `typography.fontSize.lg` | `16px` |
| Body Small | `typography.fontSize.md` | `14px` |
| Caption | `typography.fontSize.sm` | `12px` |
| Font Weight Regular | `typography.fontWeight.regular` | `400` |
| Font Weight Medium | `typography.fontWeight.medium` | `500` |

### Spacing Reference (for custom CSS)

| DSM Token | Value | Description |
|-----------|-------|-------------|
| `spacing.xs` | `4px` | Tight gaps, icon-text |
| `spacing.sm` | `8px` | Internal component |
| `spacing.md` | `12px` | Related elements |
| `spacing.lg` | `16px` | Card padding |
| `spacing.xl` | `20px` | Container padding |
| `spacing.2xl` | `24px` | Section separation |
| `spacing.3xl` | `32px` | Major layout |
| `spacing.4xl` | `40px` | Section gaps |

### Shadow Reference (for custom CSS)

| DSM Token | Value |
|-----------|-------|
| `shadow.card` | `0px 4px 20px 0px rgba(29, 28, 29, 0.15)` |
| `shadow.button.primary` | `0px 6px 11px 0px rgba(225, 5, 20, 0.50)` |

---

## Additional Status Colors (Custom CSS Variables)

If you need all 6 status color pairs from the DSM, add these custom variables:

```css
:root {
  /* Status 1 - Inactive/Expired */
  --status-1-bg: #d0d0d0;
  --status-1-text: #1d1c1d;
  
  /* Status 2 - Underwriting */
  --status-2-bg: #f6f2d0;
  --status-2-text: #5c6000;
  
  /* Status 3 - New/Completed (mapped to --color-info) */
  --status-3-bg: #cdedf7;
  --status-3-text: #050c6f;
  
  /* Status 4 - Open/Active (mapped to --color-success) */
  --status-4-bg: #d5f4c4;
  --status-4-text: #0b5a14;
  
  /* Status 5 - Undefined Type 2 */
  --status-5-bg: #ddd6f4;
  --status-5-text: #5f31f3;
  
  /* Status 6 - Pending/In-Progress (mapped to --color-warning) */
  --status-6-bg: #f7e8c4;
  --status-6-text: #8e6119;
}
```

---

## Additional Semantic Colors (Custom CSS Variables)

```css
:root {
  /* Button specific */
  --btn-disabled-bg: #fbd9dc;
  --btn-inactive-bg: #525355;
  --btn-tertiary-hover: #eeeeee;
  
  /* Border colors */
  --border-default: #525355;
  --border-inputs: #dfdfdf;
  --border-cards: #dfdad5;
  --border-focus: #1d1c1d;
  
  /* Text variations */
  --text-secondary: #525355;
  --text-disabled: #67686a;
  --text-placeholder: #525355;
  --text-note: #4a4c4f;
  --text-link-secondary: #e10514;
  
  /* Backgrounds */
  --bg-overlay: rgba(29, 28, 29, 0.5);
  --bg-disabled-inputs: #eeeeee;
  --bg-card-tertiary: #fcf2f1;
  --bg-card-note: #fffbac;
  --bg-range: #fbd9dc;
}
```

---

## Hex to OKLCH Conversion Reference

| Hex | OKLCH | Usage |
|-----|-------|-------|
| `#ffffff` | `oklch(100% 0 0)` | White |
| `#f5f4f2` | `oklch(97% 0.004 75)` | Off-white/Cream |
| `#eeede9` | `oklch(94% 0.006 75)` | Light gray |
| `#1d1c1d` | `oklch(20% 0.006 285)` | Near black |
| `#e10514` | `oklch(51% 0.225 27)` | PassportCard Red |
| `#ad0f0f` | `oklch(42% 0.175 25)` | Dark Red |
| `#2246fc` | `oklch(50% 0.26 268)` | Link Blue |
| `#cdedf7` | `oklch(91% 0.04 220)` | Info Blue |
| `#050c6f` | `oklch(26% 0.16 270)` | Navy |
| `#d5f4c4` | `oklch(92% 0.08 140)` | Success Green |
| `#0b5a14` | `oklch(38% 0.11 142)` | Dark Green |
| `#f7e8c4` | `oklch(93% 0.06 85)` | Warning Yellow |
| `#8e6119` | `oklch(52% 0.12 65)` | Brown/Orange |

---

**Note:** OKLCH values are approximations. For pixel-perfect color matching, use a precise converter tool or test in the browser.
