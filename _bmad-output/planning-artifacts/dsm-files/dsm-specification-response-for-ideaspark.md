# Pasportcard DSM Specification Response for IdeaSpark

**Prepared By:** Shay (DSM Agent)  
**Date:** 2026-01-11  
**For:** Sally (UX Designer) & IdeaSpark Team  
**Purpose:** Complete design system specifications for theming DaisyUI components

---

## 🎯 EXECUTIVE SUMMARY

This document provides the complete visual design language, brand identity, and design tokens from the **Pasportcard Design System Monorepo (DSM)**. These specifications will enable you to theme DaisyUI components to match the Pasportcard brand identity for the IdeaSpark project.

**What's Included:**
- Complete color palette with semantic naming
- Typography system (fonts, sizes, weights)
- Spacing scale and component spacing
- Border radius and shadow specifications
- Icon library reference
- Motion/animation guidelines
- Component-level styling specifications
- Accessibility standards
- DaisyUI-compatible token exports

---

## 📐 SECTION 1: DESIGN TOKENS & FOUNDATION

### 1.1 Color System

#### Primary Colors

**Brand Red (Primary):**
- **Name:** `brand.red`
- **Hex:** `#E10514`
- **RGB:** `rgb(225, 5, 20)`
- **Usage:** Primary CTAs, links, focus states, brand accents, dividers
- **Gradient Start:** `#E10514`
- **Gradient End:** `#A2191C`

**Dark Red (Primary Dark):**
- **Name:** `brand.darkRed`
- **Hex:** `#AD0F0F`
- **RGB:** `rgb(173, 15, 15)`
- **Usage:** Hover states, active states, error text, alerts

**Primary Variations:**
- No predefined shades beyond the two above
- Hover state: Use `brand.darkRed`
- Active state: Use `brand.darkRed`
- Disabled state: `#FBD9DC` (light pink)

---

#### Secondary Colors

**Brand Black:**
- **Name:** `brand.black`
- **Hex:** `#1D1C1D`
- **Usage:** Primary text, headings, icons

**Brand White:**
- **Name:** `brand.white`
- **Hex:** `#FFFFFF`
- **Usage:** Backgrounds, negative text, light UI elements

---

#### Semantic Colors

**Success:**
- Not explicitly defined in DSM
- **Recommendation:** Use green `#10B981` (from UX spec)

**Warning:**
- Not explicitly defined in DSM
- **Recommendation:** Use amber `#F59E0B` (from UX spec)

**Error/Danger:**
- **Hex:** `#AD0F0F` (same as `brand.darkRed`)
- **Usage:** Error text, alert borders, validation errors

**Info:**
- **Primary Link:** `#2246FC` (blue)
- **Usage:** Info messages, info icons

---

#### Neutral Colors

**Background Colors (Light Mode):**
- **Primary:** `#FFFFFF` (`background.primary`)
- **Secondary:** `#F5F4F2` (`background.secondary`) — Main page background
- **Tertiary:** `#EEEDE9` (`background.tertiary`) — Subtle differentiation
- **Disabled Inputs:** `#EEEEEE` (`background.disabledInputs`)

**Background Colors - Cards:**
- **Card Primary:** `#FFFFFF` (`background.cardPrimary`)
- **Card Secondary:** `#F5F4F2` (`background.cardSecondary`)
- **Card Tertiary:** `#FCF2F1` (`background.cardTertiary`) — Warm tint
- **Card Note:** `#FFFBAC` (`background.cardNote`) — Yellow highlight

**Background Colors - Status:**
- **Status 1 (Gray):** `#D0D0D0` — Neutral
- **Status 2 (Yellow):** `#F6F2D0` — Warning/Pending
- **Status 3 (Blue):** `#CDEDF7` — Info
- **Status 4 (Green):** `#D5F4C4` — Success
- **Status 5 (Purple):** `#DDD6F4` — Special
- **Status 6 (Orange):** `#F7E8C4` — Alert

**Text Colors:**
- **Primary:** `#1D1C1D` (`text.primary`)
- **Secondary:** `#525355` (`text.secondary`)
- **Disabled:** `#67686A` (`text.disabled`)
- **Placeholder:** `#525355` (`text.placeholder`)
- **Note:** `#4A4C4F` (`text.note`)
- **Negative:** `#FFFFFF` (`text.negative`) — Text on dark backgrounds
- **Error:** `#AD0F0F` (`text.error`)
- **Alerts:** `#AD0F0F` (`text.alerts`)

**Link Colors:**
- **Primary Link:** `#2246FC` (`text.linkPrimary`) — Blue links
- **Secondary Link:** `#E10514` (`text.linkSecondary`) — Brand red links

**Border Colors:**
- **Default:** `#525355` (`border.default`)
- **Inputs:** `#DFDFDF` (`border.inputs`) — Light gray for form fields
- **Cards:** `#DFDAD5` (`border.cards`) — Warm gray for card borders
- **Alerts:** `#AD0F0F` (`border.alerts`) — Error borders
- **Divider:** `#E10514` (`border.divider`) — Red accent dividers
- **Negative:** `#FFFFFF` (`border.negative`) — Borders on dark backgrounds
- **Focus:** `#1D1C1D` (`border.focus`) — Focus ring color

**Button Colors:**
- **Primary:** `#E10514` (`button.primary`)
- **Secondary:** `#E10514` (`button.secondary`)
- **Hover:** `#E10514` (`button.hover`)
- **Tertiary Hover:** `#EEEEEE` (`button.tertiaryHover`)
- **Disabled:** `#FBD9DC` (`button.disabled`)
- **Inactive:** `#525355` (`button.inactive`)
- **Selectable Default:** `#525355` (`button.selectableDefault`)
- **Selectable Active:** `#E10514` (`button.selectableActive`)
- **Selectable Inactive:** `#FBD9DC` (`button.selectableInactive`)
- **Selectable Inactive Secondary:** `#EEEDE9` (`button.selectableInactiveSecondary`)

**UI Colors:**
- **Overlay:** `rgba(29, 28, 29, 0.5)` (`background.overlay`) — Modal backdrop
- **Scroller Primary:** `rgba(29, 28, 29, 0.5)` (`ui.scrollerPrimary`)
- **Scroller Secondary:** `#DFDAD5` (`ui.scrollerSecondary`)
- **Progress Default:** `#F5F4F2` (`ui.progressDefault`)
- **Progress Fill:** `#E10514` (`ui.progressFill`)

---

#### Additional Questions

**Dark Mode:** Not currently supported in DSM. Light mode only.

**Gradients:**
- **Primary Gradient:** Linear gradient from `#E10514` to `#A2191C`
- **Usage:** Primary button backgrounds

**Contrast Ratio Requirement:** 
- Text: Minimum 4.5:1 (WCAG AA)
- UI components: Minimum 3:1 (WCAG AA)

**Color Combinations to Avoid:**
- Red text on red backgrounds
- Avoid using color alone to convey information

---

### 1.2 Typography System

#### Font Families

**Primary Font (English/LTR):**
- **Name:** Montserrat
- **Weights:** Regular (400), Medium (500), SemiBold (600), Bold (700)
- **Fallback Chain:** `'Montserrat', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`
- **Source:** Google Fonts
- **CDN Link:** `https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&display=swap`
- **Licensing:** Open Font License (free)

**Secondary Font (Hebrew/RTL):**
- **Name:** Rubik
- **Weights:** Regular (400), Medium (500), SemiBold (600), Bold (700)
- **Fallback Chain:** `'Rubik', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`
- **Source:** Google Fonts
- **CDN Link:** `https://fonts.googleapis.com/css2?family=Rubik:wght@400;500;600;700&display=swap`
- **Licensing:** Open Font License (free)

**Monospace Font (Code):**
- **Name:** JetBrains Mono
- **Fallback Chain:** `'JetBrains Mono', 'Fira Code', ui-monospace, 'SF Mono', monospace`
- **Source:** Google Fonts
- **Licensing:** Apache License 2.0 (free)

---

#### Type Scale

All sizes are in **pixels** (convert to rem by dividing by 16):

| Element | Size (px) | Size (rem) | Weight | Line Height | Usage |
|---------|-----------|------------|--------|-------------|-------|
| **H1** | 40px | 2.5rem | 500 (Medium) | 1.0 | Main page title |
| **H2** | 26px | 1.625rem | 500 (Medium) | 1.0 | Section headers |
| **H3** | 24px | 1.5rem | 500 (Medium) | 1.0 | Subsection headers |
| **H4** | 20px | 1.25rem | 500 (Medium) | 1.0 | Small headers |
| **H5** | 18px | 1.125rem | 500 (Medium) | 1.0 | Minor headers |
| **H6** | 18px | 1.125rem | 500 (Medium) | 1.0 | Smallest headers |
| **Body Large** | 18px | 1.125rem | 400 (Regular) | 1.0 | Emphasized body |
| **Body Large Strong** | 18px | 1.125rem | 500 (Medium) | 1.0 | Bold emphasis |
| **Body Regular** | 16px | 1rem | 400 (Regular) | 1.0 | Default body text |
| **Body Regular Strong** | 16px | 1rem | 500 (Medium) | 1.0 | Bold body text |
| **Body Small** | 14px | 0.875rem | 400 (Regular) | 1.0 | Supporting text |
| **Body Small Strong** | 14px | 0.875rem | 500 (Medium) | 1.0 | Bold small text |
| **Body XS** | 12px | 0.75rem | 400 (Regular) | 1.0 | Captions, labels |
| **Body XS Strong** | 12px | 0.75rem | 500 (Medium) | 1.0 | Bold captions |
| **Disclaimer** | 10px | 0.625rem | 400 (Regular) | 1.0 | Fine print |
| **Disclaimer Strong** | 10px | 0.625rem | 500 (Medium) | 1.0 | Bold fine print |
| **Button Text** | 16px | 1rem | 500 (Medium) | 1.0 | Button labels |
| **Link Text** | 16px | 1rem | 400 (Regular) | 1.0 | Inline links |

**Letter Spacing:** `0em` (normal) for all text styles

---

#### Font Weights

| Weight Name | Value | When to Use |
|-------------|-------|-------------|
| Regular | 400 | Body text, default text |
| Medium | 500 | Headings, buttons, emphasis |
| SemiBold | 600 | Strong emphasis (optional) |
| Bold | 700 | High emphasis (optional) |

**Primary Weights Used:** 400 (Regular) and 500 (Medium)

---

#### Text Decoration

**Links:**
- **Default:** No underline, use link color (`#2246FC` or `#E10514`)
- **Hover:** Underline appears
- **Focus:** 2px focus ring with 2px offset

**Bold/Italic:**
- **Bold:** Use Medium (500) or SemiBold (600) weight
- **Italic:** Not commonly used in DSM
- **Code:** Monospace font, light background

---

### 1.3 Spacing System

#### Spacing Scale

**Base Unit:** 4px (0.25rem)

All spacing values are multiples of 4:

| Token | Value (rem) | Value (px) | Common Use |
|-------|-------------|------------|------------|
| `0` | 0 | 0 | No spacing |
| `3xs` | 0.125rem | 2px | Hairline gaps |
| `2xs` | 0.1875rem | 3px | Micro spacing |
| `xs` | 0.25rem | 4px | Tight gaps |
| `xs-plus` | 0.375rem | 6px | Small gaps |
| `sm` | 0.5rem | 8px | Internal spacing |
| `sm-plus` | 0.625rem | 10px | Between related items |
| `md` | 0.75rem | 12px | Standard gaps |
| `lg` | 1rem | 16px | Card padding |
| `xl` | 1.25rem | 20px | Container padding |
| `2xl` | 1.5rem | 24px | Section separation |
| `3xl` | 2rem | 32px | Major spacing |
| `4xl` | 2.5rem | 40px | Large section gaps |
| `5xl` | 3rem | 48px | Extra large gaps |
| `6xl` | 4rem | 64px | Huge spacing |
| `7xl` | 5rem | 80px | Massive spacing |
| `8xl` | 6rem | 96px | Maximum spacing |

---

#### Layout Spacing

**Container Padding:**
- **Value:** `1.25rem` (20px) (`spacing.layout.containerPadding`)
- **Usage:** Main content area padding

**Section Gap:**
- **Value:** `2.5rem` (40px) (`spacing.layout.sectionGap`)
- **Usage:** Vertical spacing between major sections

**Stack Gap (Vertical Spacing):**
- **Small:** `0.5rem` (8px)
- **Medium:** `0.75rem` (12px)
- **Large:** `1rem` (16px)

**Inline Gap (Horizontal Spacing):**
- **Small:** `0.25rem` (4px)
- **Medium:** `0.5rem` (8px)
- **Large:** `0.75rem` (12px)

**Grid Gutter:**
- **Recommendation:** `1rem` (16px) or `0.75rem` (12px)

---

#### Component Spacing

**Button:**
- **Padding X (Small):** `0.5rem` (8px)
- **Padding X (Medium):** `0.75rem` (12px)
- **Padding X (Large):** `1rem` (16px)
- **Padding Y (Small):** `0.25rem` (4px)
- **Padding Y (Medium):** `0.5rem` (8px)
- **Padding Y (Large):** `0.75rem` (12px)
- **Gap (Icon to Text):** `0.5rem` (8px)

**Input:**
- **Padding X:** `0.75rem` (12px)
- **Padding Y:** `0.5rem` (8px)

**Card:**
- **Padding:** `1rem` (16px)
- **Gap (between elements):** `0.75rem` (12px)

**Form:**
- **Field Gap (vertical):** `1rem` (16px)
- **Label Gap (label to input):** `0.25rem` (4px)

---

### 1.4 Border & Radius System

#### Border Width

| Token | Value (rem) | Value (px) | Usage |
|-------|-------------|------------|-------|
| `none` | 0 | 0 | No border |
| `thin` | 0.0625rem | 1px | Default borders, input borders |
| `medium` | 0.125rem | 2px | Emphasis borders, focus rings |
| `thick` | 0.1875rem | 3px | Strong emphasis, accent lines |

**Default Border Width:** `0.0625rem` (1px) — `thin`

---

#### Border Radius

| Token | Value (rem) | Value (px) | Usage |
|-------|-------------|------------|-------|
| `none` | 0 | 0 | Sharp corners |
| `xs` | 0.3125rem | 5px | Subtle rounding |
| `s` | 10px | 10px | Small rounding |
| `md` | 20px | 20px | Default rounding (buttons, cards, inputs) |
| `pill` | 99px | 99px | Fully rounded (badges, pills) |

**Default Radius:** `20px` (`md`) — Used for buttons, cards, inputs, modals

**Component-Specific Radii:**
- **Buttons:** `20px` (`md`)
- **Cards:** `20px` (`md`)
- **Inputs:** `20px` (`md`)
- **Modals:** `20px` (`md`)
- **Badges:** `99px` (`pill`)
- **Avatars:** `99px` (`pill`)

---

#### Border Styles & Focus Ring

**Dashed/Dotted Borders:** Not used in DSM

**Focus Ring Specification:**
- **Width:** `0.125rem` (2px) — `medium`
- **Color:** `#1D1C1D` (`border.focus`) — Black
- **Offset:** `0.125rem` (2px)
- **Style:** Solid
- **CSS Example:** `outline: 0.125rem solid #1D1C1D; outline-offset: 0.125rem;`

---

### 1.5 Shadows & Elevation

#### Shadow System

**Level 0 (Flat/No Elevation):**
- **Value:** `none`
- **Usage:** Flat buttons, inline elements

**Level 1 (Subtle - Cards):**
- **Value:** `0px 4px 20px 0px rgba(29, 28, 29, 0.15)`
- **Token:** `shadow.card`
- **Usage:** Cards, dropdown panels, subtle elevation

**Level 2 (Medium - Primary Button):**
- **Value:** `0px 6px 11px 0px rgba(225, 5, 20, 0.50)`
- **Token:** `shadow.button.primary`
- **Usage:** Primary buttons with gradient

**Level 3 (High - Tabs Selected):**
- **Value:** `0.03125rem 0.125rem 0.625rem rgba(0, 0, 0, 0.1), -0.03125rem 0.125rem 0.625rem rgba(0, 0, 0, 0.1)`
- **Token:** `shadow.tabs.selected`
- **Usage:** Selected tabs, emphasized elements

**Level 4 (Highest):**
- Not explicitly defined
- **Recommendation for Modals:** `0px 10px 40px 0px rgba(29, 28, 29, 0.3)`

---

#### Additional Shadow Types

**Focus Shadows:**
- Use focus ring instead of shadow (see Border Styles section)

**Hover State Shadows:**
- Buttons: Maintain existing shadow (no change on hover)
- Cards: Can add subtle shadow on hover (optional)

**Inner Shadows:**
- Not used in DSM

---

## 🎨 SECTION 2: VISUAL DESIGN LANGUAGE

### 2.1 Iconography

#### Icon System

**Icon Library:** Custom SVG icon set (178 icons)

**Icon Categories:**
- **Branded:** 100+ brand-specific icons (Passportcard logo, country flags, travel-related)
- **Actions:** 8 icons (view, share, filter, copy, download, edit, link, close)
- **Navigation:** 5 icons (arrow_left, chevron-up, chevron-down, chevron-left, home)
- **Status:** 6 icons (cloud, error, info, loader, notification, question)
- **Misc:** Various (receipt, file, pdf, card, schedule, video-call, leads)

**Icon Formats:**
- **Source:** SVG files in `packages/tokens/src/icons/source/`
- **Output:** React components, React Native components
- **Build System:** Automated build script converts SVGs to platform-specific components

**Default Icon Sizes:**
- **Small:** 16px (1rem)
- **Medium:** 20px (1.25rem)
- **Large:** 24px (1.5rem)

**Size Values (Numeric):**
- 16, 20, 24, 32, 40, 48, 56, 64

---

#### Icon Style

**Visual Style:**
- **Type:** Custom designed, mix of outlined and filled
- **Stroke Width:** Not standardized (varies per icon)
- **Style Mix:** Contextual — some icons are outlined, others filled based on design intent

**When to Use:**
- **Filled:** Primary actions, status indicators
- **Outlined:** Secondary actions, navigation

---

#### Icon Colors

**Default Icon Color:**
- **Primary:** `#1D1C1D` (text primary)
- **Secondary:** `#525355` (text secondary)
- **Disabled:** `#67686A` (text disabled)
- **On Primary Buttons:** `#FFFFFF` (negative)

**Semantic Icon Colors:**
- **Success:** Green (recommended `#10B981`)
- **Warning:** Amber (recommended `#F59E0B`)
- **Error:** `#AD0F0F` (brand dark red)
- **Info:** `#2246FC` (link primary blue)

**Customization:** Icons can use any color from the palette

---

#### Icon Usage Guidelines

**Common Action Icons:**
- **Add:** Not in current set (create custom or use `+` symbol)
- **Delete:** Use `close` icon
- **Edit:** `edit` icon
- **Search:** Not in current set (create custom or use magnifying glass)
- **View/Show:** `view` icon
- **Download:** `download` icon
- **Share:** `share` icon
- **Filter:** `filter` icon
- **Copy:** `copy` icon
- **Link:** `link` icon

**Icon List (Sample):**
- Branded: passport, passportcard, rocket, calendar, plane, hospital, dental, etc.
- Actions: view, share, filter, copy, download, edit, link, close
- Navigation: arrow_left, chevron-up, chevron-down, chevron-left, home
- Status: error, info, loader, notification, question

**Icons to Avoid:**
- No specific restrictions documented

---

### 2.2 Imagery & Media

#### Image Specifications

**Aspect Ratios:**
- Not explicitly defined in DSM
- **Recommendation:** 16:9 (landscape), 1:1 (square), 4:3 (standard)

**Border Radius for Images:**
- **Default:** `20px` (`borderRadius.md`)
- **Circular:** `99px` (`borderRadius.pill`)

**Default Image Placeholder:**
- Not explicitly defined
- **Recommendation:** Use `background.secondary` (#F5F4F2) with icon

**Image Loading States:**
- **Skeleton:** Not defined (recommend gray pulse animation)
- **Spinner:** Use `loader` icon (see Status icons)
- **Blur:** Not defined (can implement progressive blur)

---

#### Photo Style

**Photography Guidelines:** Not explicitly documented in DSM

**Recommended Style:**
- Bright, authentic, modern
- No heavy filters
- Consistent lighting

**Image Format:**
- **Preferred:** WebP (modern browsers)
- **Fallback:** JPEG (photos), PNG (graphics with transparency)

---

#### Illustrations

**Illustration Assets:** Not included in current DSM

**Recommendation:** If needed, create illustrations matching:
- Brand red (#E10514) as accent color
- Flat or semi-flat style
- Minimal, modern aesthetic

---

### 2.3 Motion & Animation

#### Animation Principles

**Philosophy:** Subtle, purposeful animations that enhance usability without distraction

**Default Animation Duration:**
- **Short:** 150ms (hover, focus)
- **Medium:** 300ms (transitions, modal enter/exit)
- **Long:** 500ms (page transitions, complex animations)

**Easing Functions:**
- **Default:** `ease` (cubic-bezier(0.25, 0.1, 0.25, 1))
- **Ease-out:** `ease-out` (cubic-bezier(0, 0, 0.2, 1)) — Elements entering
- **Ease-in:** `ease-in` (cubic-bezier(0.4, 0, 1, 1)) — Elements exiting
- **Ease-in-out:** `ease-in-out` (cubic-bezier(0.4, 0, 0.2, 1)) — General transitions

---

#### Common Animations

**Hover State Transitions:**
- **Duration:** 150ms
- **Property:** `background-color`, `color`, `border-color`, `opacity`
- **Easing:** `ease`
- **CSS Example:** `transition: all 150ms ease;`

**Focus State Transitions:**
- **Duration:** 150ms
- **Property:** `outline`, `box-shadow`
- **Easing:** `ease`

**Modal/Dialog Animations:**
- **Enter:** Fade in + scale from 0.95 to 1.0, 300ms, ease-out
- **Exit:** Fade out + scale from 1.0 to 0.95, 200ms, ease-in

**Page Transitions:**
- Not explicitly defined in DSM
- **Recommendation:** Fade (300ms) or slide (400ms)

**Loading Animations:**
- **Spinner:** 360° rotation, 1000ms, linear, infinite
- **Skeleton:** Pulse opacity 0.6 to 1.0, 1500ms, ease-in-out, infinite
- **Progress Bar:** Linear left-to-right fill animation

---

#### Performance

**Mobile Animations:**
- Use same animations on mobile
- Respect device capabilities (reduce complexity if needed)

**Prefers-Reduced-Motion:**
- **MUST RESPECT:** All animations disabled when `prefers-reduced-motion: reduce` is set
- **CSS Example:** 
  ```css
  @media (prefers-reduced-motion: reduce) {
    * {
      animation-duration: 0.01ms !important;
      transition-duration: 0.01ms !important;
    }
  }
  ```

---

## 🧩 SECTION 3: COMPONENT-LEVEL SPECIFICATIONS

### 3.1 Buttons

#### Button Variants

**Primary Button (Filled):**
- **Background:** Linear gradient `#E10514` to `#A2191C`
- **Text Color:** `#FFFFFF` (white)
- **Border:** None
- **Border Radius:** `20px`
- **Shadow:** `0px 6px 11px 0px rgba(225, 5, 20, 0.50)`
- **Hover:** No background change (gradient stays)
- **Active:** Slightly darker gradient (optional)
- **Disabled:** Background `#FBD9DC`, text `#FFFFFF`, no shadow

**Secondary Button (Outlined):**
- **Background:** Transparent
- **Text Color:** `#E10514` (brand red)
- **Border:** `1px solid #E10514`
- **Border Radius:** `20px`
- **Shadow:** None
- **Hover:** Background `#EEEEEE` (subtle gray)
- **Active:** Background slightly darker
- **Disabled:** Border `#FBD9DC`, text `#FBD9DC`

**Tertiary/Ghost Button:**
- **Background:** Transparent
- **Text Color:** `#1D1C1D` (black)
- **Border:** None
- **Border Radius:** `20px`
- **Shadow:** None
- **Hover:** Background `#EEEEEE`
- **Active:** Background `#E0E0E0`
- **Disabled:** Text `#67686A` (disabled gray)

**Link-Subtle Button:**
- **Background:** Transparent
- **Text Color:** `#2246FC` (link blue)
- **Border:** None
- **Border Radius:** None
- **Shadow:** None
- **Hover:** Underline
- **Active:** Color darker blue
- **Disabled:** Text `#67686A`

**Destructive/Danger Button:**
- **Background:** `#AD0F0F` (dark red)
- **Text Color:** `#FFFFFF`
- **Border:** None
- **Border Radius:** `20px`
- **Shadow:** `0px 6px 11px 0px rgba(173, 15, 15, 0.50)`
- **Hover:** Background slightly darker
- **Active:** Background even darker
- **Disabled:** Background `#FBD9DC`, text `#FFFFFF`

**Icon-Only Buttons:**
- **Size:** 44px × 44px (default), 32px × 32px (small)
- **Background:** Transparent (tertiary style)
- **Icon Size:** 20px (default), 16px (small)
- **Padding:** Equal on all sides to center icon
- **Border Radius:** `20px`

---

#### Button Sizes

**Small Button:**
- **Height:** 32px (2rem)
- **Padding X:** `0.5rem` (8px)
- **Padding Y:** `0.25rem` (4px)
- **Font Size:** 14px (0.875rem)
- **Icon Size:** 16px

**Medium/Default Button:**
- **Height:** 44px (2.75rem)
- **Padding X:** `0.75rem` (12px)
- **Padding Y:** `0.5rem` (8px)
- **Font Size:** 16px (1rem)
- **Icon Size:** 20px

**Large Button:**
- **Height:** 56px (3.5rem)
- **Padding X:** `1rem` (16px)
- **Padding Y:** `0.75rem` (12px)
- **Font Size:** 18px (1.125rem)
- **Icon Size:** 24px

---

#### Button States

**Default State:**
- Normal appearance as defined above

**Hover State:**
- Subtle background color change (see variant specifications)
- Cursor: `pointer`
- Transition: 150ms ease

**Active/Pressed State:**
- Slightly darker than hover
- Optional scale: `transform: scale(0.98);`

**Focus State:**
- Focus ring: `2px solid #1D1C1D`
- Offset: `2px`
- Maintains other styles

**Disabled State:**
- **Opacity:** 50% (optional, or use specific disabled colors)
- **Cursor:** `not-allowed`
- **Background:** Disabled color (see variants)
- **No interaction:** Cannot click or hover

**Loading State:**
- **Spinner:** Replaces text or appears next to text
- **Button Disabled:** User cannot click while loading
- **Width:** Maintains size (doesn't shrink)

---

### 3.2 Input Fields

#### Input Style

**Default Input Field:**
- **Height:** 44px (2.75rem)
- **Background:** `#FFFFFF`
- **Border:** `1px solid #DFDFDF` (light gray)
- **Border Radius:** `20px`
- **Padding X:** `0.75rem` (12px)
- **Padding Y:** `0.5rem` (8px)
- **Font Size:** 16px (1rem)
- **Font Weight:** 400 (Regular)
- **Text Color:** `#1D1C1D`
- **Placeholder Color:** `#525355`

**Input Sizes:**
- **Small:** Height 32px, padding `8px 12px`, font 14px
- **Medium:** Height 44px, padding `12px 12px`, font 16px
- **Large:** Height 56px, padding `16px 12px`, font 18px

**Input States:**
- **Default:** Border `#DFDFDF`
- **Focus:** Border `#1D1C1D` (black), focus ring `2px solid #1D1C1D` with `2px offset`
- **Error:** Border `#AD0F0F` (dark red), red error text below
- **Disabled:** Background `#EEEEEE`, border `#DFDFDF`, text color `#67686A`, cursor `not-allowed`
- **Success:** Border green (recommended `#10B981`), optional checkmark icon

---

#### Form Elements

**Checkbox:**
- **Size:** 20px × 20px
- **Border:** `1px solid #525355`
- **Border Radius:** `5px` (slightly rounded)
- **Background (Unchecked):** `#FFFFFF`
- **Background (Checked):** `#E10514` (brand red)
- **Checkmark Color:** `#FFFFFF` (white)
- **Hover:** Border `#1D1C1D`
- **Focus:** Focus ring `2px solid #1D1C1D` with `2px offset`
- **Disabled:** Background `#EEEEEE`, border `#DFDFDF`

**Radio Button:**
- **Size:** 20px × 20px
- **Border:** `1px solid #525355`
- **Border Radius:** `99px` (fully round)
- **Background (Unselected):** `#FFFFFF`
- **Inner Circle (Selected):** `#E10514` (brand red), 10px diameter
- **Hover:** Border `#1D1C1D`
- **Focus:** Focus ring `2px solid #1D1C1D` with `2px offset`
- **Disabled:** Background `#EEEEEE`, border `#DFDFDF`

**Toggle/Switch:**
- **Width:** 44px
- **Height:** 24px
- **Border Radius:** `99px` (pill)
- **Background (Off):** `#DFDFDF` (gray)
- **Background (On):** `#E10514` (brand red)
- **Knob:** 20px circle, `#FFFFFF` (white)
- **Knob Position (Off):** Left (2px from edge)
- **Knob Position (On):** Right (2px from edge)
- **Transition:** 300ms ease
- **Disabled:** Background `#EEEEEE`, knob `#DFDFDF`

**Select/Dropdown:**
- **Style:** Same as input field
- **Chevron Icon:** `chevron-down` icon, 16px, positioned right
- **Padding Right:** `2.5rem` (40px) to accommodate chevron
- **Dropdown Panel:** Background `#FFFFFF`, border `1px solid #DFDAD5`, border radius `20px`, shadow `0px 4px 20px 0px rgba(29, 28, 29, 0.15)`

**Textarea:**
- **Style:** Same as input field
- **Min Height:** 80px (5 rows)
- **Resize:** Vertical only
- **Padding:** `0.75rem` (12px)

---

#### Labels & Helper Text

**Label Positioning:**
- **Default:** Top (above input)
- **Spacing:** `0.25rem` (4px) below label, above input

**Label Typography:**
- **Font Size:** 14px (0.875rem)
- **Font Weight:** 500 (Medium)
- **Color:** `#1D1C1D` (text primary)

**Helper Text:**
- **Font Size:** 12px (0.75rem)
- **Font Weight:** 400 (Regular)
- **Color:** `#525355` (text secondary)
- **Position:** Below input, `0.25rem` (4px) spacing

**Error Message:**
- **Font Size:** 12px (0.75rem)
- **Font Weight:** 400 (Regular)
- **Color:** `#AD0F0F` (text error)
- **Position:** Replaces helper text when error occurs

**Required Field Indicator:**
- **Symbol:** Asterisk `*`
- **Position:** Before label text (in reading direction)
- **Color:** `#AD0F0F` (red)
- **Example:** `* Email Address`

---

### 3.3 Cards & Containers

#### Card Specifications

**Default Card:**
- **Background:** `#FFFFFF` (`background.cardPrimary`)
- **Border:** `1px solid #DFDAD5` (`border.cards`)
- **Border Radius:** `20px` (`borderRadius.md`)
- **Shadow:** `0px 4px 20px 0px rgba(29, 28, 29, 0.15)` (`shadow.card`)
- **Padding:** `1rem` (16px) (`spacing.component.card.padding`)

**Card Variants:**

**Flat Card:**
- **Background:** `#FFFFFF`
- **Border:** None
- **Shadow:** None
- **Border Radius:** `20px`

**Elevated Card:**
- **Background:** `#FFFFFF`
- **Border:** None
- **Shadow:** `0px 4px 20px 0px rgba(29, 28, 29, 0.15)`
- **Border Radius:** `20px`

**Outlined Card:**
- **Background:** `#FFFFFF`
- **Border:** `1px solid #DFDAD5`
- **Shadow:** None
- **Border Radius:** `20px`

**Interactive/Clickable Card:**
- **Default:** Same as elevated card
- **Hover:** Shadow increases: `0px 6px 24px 0px rgba(29, 28, 29, 0.20)`
- **Cursor:** `pointer`
- **Transition:** `box-shadow 150ms ease`
- **Focus:** Focus ring `2px solid #1D1C1D` with `2px offset`

---

### 3.4 Navigation & Menus

#### Navigation Bar

**Height:** 64px (4rem) — Recommended

**Background Color:** `#FFFFFF` (`background.primary`)

**Typography for Nav Items:**
- **Font Size:** 16px (1rem)
- **Font Weight:** 500 (Medium)
- **Color (Default):** `#525355` (`text.secondary`)
- **Color (Hover):** `#1D1C1D` (`text.primary`)
- **Color (Active/Selected):** `#E10514` (`brand.red`)

**Active/Selected State Styling:**
- **Text Color:** `#E10514`
- **Bottom Border:** `3px solid #E10514` (`borderWidth.thick`)
- **Font Weight:** 500 (Medium)

**Mobile Menu Behavior:**
- **Hamburger Icon:** Custom or use `close`/navigation icons
- **Mobile Menu:** Full-width drawer from left (LTR) or right (RTL)
- **Background:** `#FFFFFF`
- **Overlay:** `rgba(29, 28, 29, 0.5)` (`background.overlay`)

---

#### Dropdown Menus

**Menu Item Height:** 44px (2.75rem)

**Menu Item Padding:** `0.75rem 1rem` (12px 16px)

**Menu Item Typography:**
- **Font Size:** 16px (1rem)
- **Font Weight:** 400 (Regular)
- **Color:** `#1D1C1D`

**Menu Item Hover State:**
- **Background:** `#F5F4F2` (`background.secondary`)
- **Cursor:** `pointer`

**Menu Item Active State:**
- **Background:** `#EEEDE9` (`background.tertiary`)
- **Text Color:** `#E10514` (`brand.red`)

**Menu Padding:** `0.5rem` (8px) top/bottom

**Divider Style:**
- **Height:** `1px`
- **Background:** `#DFDAD5` (`border.cards`)
- **Margin:** `0.5rem 0` (8px top/bottom)

---

### 3.5 Feedback Components

#### Alerts/Notifications

**Success Alert:**
- **Background:** `#D5F4C4` (`background.status4`) — Light green
- **Border:** `1px solid #10B981` (green)
- **Icon Color:** `#10B981` (green)
- **Text Color:** `#0B5A14` (`text.status4`) — Dark green

**Warning Alert:**
- **Background:** `#F6F2D0` (`background.status2`) — Light yellow
- **Border:** `1px solid #F59E0B` (amber)
- **Icon Color:** `#F59E0B` (amber)
- **Text Color:** `#5C6000` (`text.status2`) — Dark yellow

**Error Alert:**
- **Background:** `#FBD9DC` (light red/pink)
- **Border:** `1px solid #AD0F0F` (`border.alerts`)
- **Icon Color:** `#AD0F0F` (dark red)
- **Text Color:** `#AD0F0F` (`text.error`)

**Info Alert:**
- **Background:** `#CDEDF7` (`background.status3`) — Light blue
- **Border:** `1px solid #2246FC` (blue)
- **Icon Color:** `#2246FC` (blue)
- **Text Color:** `#050C6F` (`text.status3`) — Dark blue

**Neutral Alert:**
- **Background:** `#F5F4F2` (`background.secondary`)
- **Border:** `1px solid #DFDAD5` (`border.cards`)
- **Icon Color:** `#525355` (`text.secondary`)
- **Text Color:** `#1D1C1D` (`text.primary`)

**Common Styling:**
- **Border Radius:** `20px`
- **Padding:** `1rem` (16px)
- **Icon Size:** 20px
- **Icon Position:** Left (LTR) or Right (RTL)
- **Close Button:** Optional, tertiary button style

---

#### Toasts

**Toast Positioning:**
- **Desktop:** Top-right corner, 20px from edge
- **Mobile:** Bottom center, full width with 20px padding

**Toast Duration (Default):** 3000ms (3 seconds)

**Toast Style Specifications:**
- **Same as Alerts** (use alert color schemes)
- **Width (Desktop):** 320px
- **Shadow:** `0px 4px 20px 0px rgba(29, 28, 29, 0.15)`

**Toast Animation:**
- **Enter:** Slide in from top (desktop) or bottom (mobile), 300ms ease-out
- **Exit:** Fade out, 200ms ease-in

---

#### Modals/Dialogs

**Modal Backdrop:**
- **Color:** `rgba(29, 28, 29, 0.5)` (`background.overlay`)
- **Click to Close:** Yes (configurable)

**Modal Border Radius:** `20px`

**Modal Shadow:** `0px 10px 40px 0px rgba(29, 28, 29, 0.3)` (high elevation)

**Modal Max-Width:**
- **Small:** 400px
- **Medium:** 600px
- **Large:** 800px
- **Full Width Mobile:** 100% width on mobile

**Modal Padding:** `1.5rem` (24px)

**Modal Close Button:**
- **Style:** Icon-only tertiary button
- **Icon:** `close` icon, 20px
- **Position:** Top-right corner (LTR) or Top-left (RTL), 16px from edges

**Modal Animation:**
- **Enter:** Fade in backdrop + scale modal from 0.95 to 1.0, 300ms ease-out
- **Exit:** Fade out backdrop + scale modal from 1.0 to 0.95, 200ms ease-in

---

## 📱 SECTION 4: RESPONSIVE DESIGN

### 4.1 Breakpoints

**Viewport Breakpoints:**

| Breakpoint | Range | Usage |
|------------|-------|-------|
| **Mobile** | 0px - 767px | Smartphones, mobile-first design |
| **Tablet** | 768px - 1023px | iPads, tablets, landscape phones |
| **Desktop** | 1024px - 1439px | Standard desktop screens |
| **Large Desktop** | 1440px+ | Large monitors, high-res displays |

**Mobile-First Approach:** Yes, design for mobile first, then add enhancements for larger screens

---

### 4.2 Responsive Behavior

**Spacing Scaling:**
- **Mobile:** Base spacing as defined
- **Tablet:** 1.25× base spacing (optional)
- **Desktop:** 1.5× base spacing (optional)
- **Recommendation:** Keep spacing consistent, adjust layout density instead

**Typography Scaling:**
- **Mobile:** Base font sizes
- **Desktop:** Can increase by 1-2px for readability
- **H1 Example:** 32px (mobile) → 40px (desktop)

---

### 4.3 Mobile-Specific Guidelines

**Touch Target Minimum Size:** 44px × 44px (per WCAG guidelines)

**Mobile-Specific Component Variations:**
- **Buttons:** Full width on mobile, auto width on desktop
- **Inputs:** Full width on mobile
- **Modals:** Full screen on mobile, centered (max-width 600px) on desktop
- **Navigation:** Hamburger menu on mobile, horizontal nav on desktop

**Mobile Navigation Patterns:**
- **Hamburger Menu:** Opens from left (LTR) or right (RTL)
- **Bottom Tab Bar:** Alternative for primary navigation
- **Drawer:** Slide-in drawer with overlay

**Mobile Spacing Adjustments:**
- **Container Padding:** 16px (mobile) vs 20px (desktop)
- **Section Gaps:** 24px (mobile) vs 40px (desktop)

---

## ♿ SECTION 5: ACCESSIBILITY STANDARDS

### 5.1 Accessibility Requirements

**WCAG Compliance:** WCAG 2.2 Level AA + Israeli Standard 5568

**Minimum Contrast Ratios:**
- **Text (Normal):** 4.5:1 minimum
- **Text (Large 18px+):** 3:1 minimum
- **UI Components:** 3:1 minimum
- **Focus Indicators:** 3:1 minimum against adjacent colors

**Color-Blind Safe Palette:** Yes, all semantic colors verified for color-blind accessibility (use icons + text, never color alone)

---

### 5.2 Focus Management

**Focus Indicator Specifications (All Interactive Elements):**
- **Width:** `2px` solid
- **Color:** `#1D1C1D` (black) — High contrast
- **Offset:** `2px` from element edge
- **Style:** Solid outline
- **CSS:** `outline: 2px solid #1D1C1D; outline-offset: 2px;`

**Focus Order:** Natural DOM order, logical tab sequence

**Skip-to-Content Link:**
- **Requirement:** Recommended for all pages
- **Position:** First focusable element
- **Style:** Visually hidden until focused, then visible at top
- **Text:** "Skip to main content"

---

### 5.3 Screen Reader Support

**ARIA Label Requirements:**
- **Icon-Only Buttons:** Must have `aria-label`
- **Form Inputs:** Must have associated `<label>` or `aria-label`
- **Interactive Elements:** Must have accessible name

**Alternative Text for Icons:**
- **Decorative Icons:** `aria-hidden="true"`
- **Functional Icons:** `aria-label` with action description
- **Example:** `<button aria-label="Close dialog"><CloseIcon aria-hidden="true" /></button>`

**Semantic HTML Expectations:**
- Use semantic HTML elements (`<button>`, `<nav>`, `<main>`, `<article>`, `<section>`, `<header>`, `<footer>`)
- Avoid `<div>` for interactive elements
- Use proper heading hierarchy (H1 → H2 → H3)

---

## 🎯 SECTION 6: BRAND-SPECIFIC GUIDELINES

### 6.1 Brand Voice & Personality

**Visual Personality:**
- **Descriptive Words:** Modern, clean, trustworthy, professional, approachable
- **Style:** Bold use of brand red, generous white space, rounded corners
- **Tone:** Confident but not aggressive, friendly but not casual

**Emotions to Evoke:**
- **Trust:** Reliable, secure, professional
- **Confidence:** Clear, decisive, authoritative
- **Approachability:** Friendly, helpful, accessible

**What Makes This Design System Unique:**
- Strong brand red as primary color (distinctive, memorable)
- Generous border radius (20px) creates friendly, modern feel
- Bilingual support (Hebrew RTL + English LTR) built into foundation
- Cross-platform consistency (React, Angular, React Native)

---

### 6.2 Do's and Don'ts

**Do's (Visual Patterns to Always Use):**
- ✅ Use brand red (#E10514) for primary actions and key accents
- ✅ Maintain 20px border radius for consistency
- ✅ Use generous white space for clarity
- ✅ Apply shadows to create hierarchy and elevation
- ✅ Use Montserrat (English) and Rubik (Hebrew) fonts
- ✅ Ensure all text meets 4.5:1 contrast ratio
- ✅ Include icons with text (never color alone)

**Don'ts (Visual Patterns to Avoid):**
- ❌ Don't use multiple primary buttons in one section
- ❌ Don't use red on red (poor contrast)
- ❌ Don't use color alone to convey information
- ❌ Don't use sharp corners (maintain 20px radius)
- ❌ Don't use low-contrast text colors
- ❌ Don't forget RTL support for Hebrew content
- ❌ Don't use Arial or default system fonts

**Common Mistakes to Watch Out For:**
- Using `px` values instead of `rem` (breaks scalability)
- Forgetting focus indicators on interactive elements
- Not testing in RTL mode
- Using hardcoded colors instead of design tokens
- Skipping hover/focus/disabled states

---

### 6.3 Logo & Brand Mark

**Logo Specifications:**

**Logo File Formats:**
- **SVG:** Primary format (scalable, best quality)
- **PNG:** High-res export (2x, 3x for retina)

**Logo Variations:**
- **Full Lockup:** Passportcard logo with text
- **Icon Only:** Passportcard symbol
- **Monochrome:** Single color version (white or black)

**Logo Minimum Size:**
- **Full Lockup:** 120px width minimum
- **Icon Only:** 32px × 32px minimum

**Logo Clear Space:**
- **Clearance:** Minimum 20px clear space on all sides

**Logo on Light Background:**
- **Full Color:** Brand red (#E10514) + black text
- **Monochrome:** Black (#1D1C1D)

**Logo on Dark Background:**
- **Full Color:** Brand red (#E10514) + white text
- **Monochrome:** White (#FFFFFF)

**Logo Asset Location:** `packages/tokens/src/icons/source/branded/passportcard-logo.svg`

---

## 📦 SECTION 7: DELIVERABLES

### 7.1 Design Token Export

**JSON Export (DaisyUI-Compatible):**

```json
{
  "colors": {
    "primary": "#E10514",
    "primary-focus": "#AD0F0F",
    "primary-content": "#FFFFFF",
    "secondary": "#1D1C1D",
    "secondary-focus": "#000000",
    "secondary-content": "#FFFFFF",
    "accent": "#2246FC",
    "accent-focus": "#1B38CA",
    "accent-content": "#FFFFFF",
    "neutral": "#525355",
    "neutral-focus": "#1D1C1D",
    "neutral-content": "#FFFFFF",
    "base-100": "#FFFFFF",
    "base-200": "#F5F4F2",
    "base-300": "#EEEDE9",
    "base-content": "#1D1C1D",
    "info": "#2246FC",
    "info-content": "#FFFFFF",
    "success": "#10B981",
    "success-content": "#FFFFFF",
    "warning": "#F59E0B",
    "warning-content": "#FFFFFF",
    "error": "#AD0F0F",
    "error-content": "#FFFFFF"
  },
  "borderRadius": {
    "base": "1.25rem",
    "sm": "0.625rem",
    "md": "1.25rem",
    "lg": "1.25rem",
    "xl": "1.25rem",
    "badge": "99px",
    "btn": "1.25rem"
  },
  "fontSize": {
    "xs": "0.75rem",
    "sm": "0.875rem",
    "base": "1rem",
    "lg": "1.125rem",
    "xl": "1.25rem",
    "2xl": "1.5rem",
    "3xl": "1.625rem",
    "4xl": "2.5rem"
  }
}
```

**CSS Custom Properties Export:**

```css
:root {
  /* Brand Colors */
  --color-brand-red: #E10514;
  --color-brand-dark-red: #AD0F0F;
  --color-brand-black: #1D1C1D;
  --color-brand-white: #FFFFFF;
  
  /* Text Colors */
  --color-text-primary: #1D1C1D;
  --color-text-secondary: #525355;
  --color-text-disabled: #67686A;
  --color-text-placeholder: #525355;
  --color-text-error: #AD0F0F;
  --color-text-link-primary: #2246FC;
  --color-text-link-secondary: #E10514;
  --color-text-negative: #FFFFFF;
  
  /* Background Colors */
  --color-bg-primary: #FFFFFF;
  --color-bg-secondary: #F5F4F2;
  --color-bg-tertiary: #EEEDE9;
  --color-bg-overlay: rgba(29, 28, 29, 0.5);
  --color-bg-disabled: #EEEEEE;
  
  /* Border Colors */
  --color-border-default: #525355;
  --color-border-inputs: #DFDFDF;
  --color-border-cards: #DFDAD5;
  --color-border-focus: #1D1C1D;
  --color-border-error: #AD0F0F;
  
  /* Spacing */
  --spacing-xs: 0.25rem;
  --spacing-sm: 0.5rem;
  --spacing-md: 0.75rem;
  --spacing-lg: 1rem;
  --spacing-xl: 1.25rem;
  --spacing-2xl: 1.5rem;
  --spacing-3xl: 2rem;
  --spacing-4xl: 2.5rem;
  
  /* Border Radius */
  --radius-xs: 0.3125rem;
  --radius-s: 0.625rem;
  --radius-md: 1.25rem;
  --radius-pill: 99px;
  
  /* Shadows */
  --shadow-card: 0px 4px 20px 0px rgba(29, 28, 29, 0.15);
  --shadow-button-primary: 0px 6px 11px 0px rgba(225, 5, 20, 0.50);
  
  /* Typography */
  --font-family-english: 'Montserrat', system-ui, -apple-system, sans-serif;
  --font-family-hebrew: 'Rubik', system-ui, -apple-system, sans-serif;
  --font-weight-regular: 400;
  --font-weight-medium: 500;
  --font-weight-semibold: 600;
  --font-weight-bold: 700;
}
```

---

### 7.2 Asset Package

**Icon Set:**
- **Format:** SVG files
- **Location:** `packages/tokens/src/icons/source/`
- **Count:** 178 icons (branded, actions, navigation, status, misc)
- **Delivery Method:** ZIP file or GitHub repository access

**Logo Files:**
- **Passportcard Logo:** `passportcard-logo.svg`
- **Passportcard Icon:** `passportcard.svg`
- **Variations:** Full color, monochrome (white/black)

**Custom Illustration Assets:** Not included in current DSM

**Sample Images:** Not included in current DSM (photography style guidelines provided)

---

### 7.3 Documentation

**Existing DSM Documentation:**
- **Architecture:** `docs/architecture-tokens-icons-types.md`
- **UX Specification:** `docs/ux-design-specification.md`
- **Component Documentation:** Various files in `docs/` directory
- **Storybook Tags:** `docs/storybook-tags.md`

**Component Usage Examples:**
- Available in Storybook (React, Angular, React Native)
- Code examples in `.stories.tsx` files

**Brand Guidelines Document:**
- Compiled in this specification response

---

### 7.4 Code Snippets

**Tailwind Config Customization (DaisyUI Theme):**

```javascript
// tailwind.config.js
module.exports = {
  content: ['./src/**/*.{html,js,jsx,ts,tsx}'],
  plugins: [require('daisyui')],
  daisyui: {
    themes: [
      {
        pasportcard: {
          'primary': '#E10514',
          'primary-focus': '#AD0F0F',
          'primary-content': '#FFFFFF',
          'secondary': '#1D1C1D',
          'secondary-focus': '#000000',
          'secondary-content': '#FFFFFF',
          'accent': '#2246FC',
          'accent-focus': '#1B38CA',
          'accent-content': '#FFFFFF',
          'neutral': '#525355',
          'neutral-focus': '#1D1C1D',
          'neutral-content': '#FFFFFF',
          'base-100': '#FFFFFF',
          'base-200': '#F5F4F2',
          'base-300': '#EEEDE9',
          'base-content': '#1D1C1D',
          'info': '#2246FC',
          'info-content': '#FFFFFF',
          'success': '#10B981',
          'success-content': '#FFFFFF',
          'warning': '#F59E0B',
          'warning-content': '#FFFFFF',
          'error': '#AD0F0F',
          'error-content': '#FFFFFF',
          '--rounded-box': '1.25rem',
          '--rounded-btn': '1.25rem',
          '--rounded-badge': '99px',
          '--animation-btn': '0.15s',
          '--animation-input': '0.15s',
          '--btn-focus-scale': '0.98',
          '--border-btn': '1px',
          '--tab-border': '2px',
          '--tab-radius': '1.25rem',
        },
      },
    ],
  },
  theme: {
    extend: {
      fontFamily: {
        'sans': ['Montserrat', 'system-ui', '-apple-system', 'sans-serif'],
        'hebrew': ['Rubik', 'system-ui', '-apple-system', 'sans-serif'],
        'mono': ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      fontSize: {
        'xs': '0.75rem',
        'sm': '0.875rem',
        'base': '1rem',
        'lg': '1.125rem',
        'xl': '1.25rem',
        '2xl': '1.5rem',
        '3xl': '1.625rem',
        '4xl': '2.5rem',
      },
      spacing: {
        '3xs': '0.125rem',
        '2xs': '0.1875rem',
        'xs': '0.25rem',
        'xs-plus': '0.375rem',
        'sm': '0.5rem',
        'sm-plus': '0.625rem',
        'md': '0.75rem',
        'lg': '1rem',
        'xl': '1.25rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
        '4xl': '2.5rem',
        '5xl': '3rem',
        '6xl': '4rem',
        '7xl': '5rem',
        '8xl': '6rem',
      },
      boxShadow: {
        'card': '0px 4px 20px 0px rgba(29, 28, 29, 0.15)',
        'button-primary': '0px 6px 11px 0px rgba(225, 5, 20, 0.50)',
      },
    },
  },
};
```

**CSS Utility Classes to Maintain:**

```css
/* Brand Gradient */
.bg-gradient-primary {
  background: linear-gradient(135deg, #E10514 0%, #A2191C 100%);
}

/* Focus Ring */
.focus-ring {
  outline: 2px solid #1D1C1D;
  outline-offset: 2px;
}

/* RTL Support */
[dir="rtl"] .font-sans {
  font-family: 'Rubik', system-ui, -apple-system, sans-serif;
}

[dir="ltr"] .font-sans {
  font-family: 'Montserrat', system-ui, -apple-system, sans-serif;
}

/* Prefers Reduced Motion */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## ✅ NEXT STEPS FOR IDEASPARK TEAM

### Implementation Checklist

**1. Install Fonts:**
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&family=Rubik:wght@400;500;600;700&display=swap" rel="stylesheet">
```

**2. Configure DaisyUI Theme:**
- Copy Tailwind config from Section 7.4
- Apply `pasportcard` theme to your app: `<html data-theme="pasportcard">`

**3. Import CSS Custom Properties:**
- Add CSS variables from Section 7.1 to your global stylesheet

**4. Download Icon Assets:**
- Request access to `packages/tokens/src/icons/source/` directory
- Convert SVGs to your preferred format (React components, icon font, etc.)

**5. Test Accessibility:**
- Verify contrast ratios using axe DevTools
- Test keyboard navigation
- Test RTL mode with Hebrew content
- Enable screen reader testing

**6. Document Deviations:**
- If you make any changes to the design system, document them
- Keep a changelog of customizations for IdeaSpark

---

## 📝 NOTES & CLARIFICATIONS

### What's Not Defined in Pasportcard DSM

The following elements are **not explicitly defined** in the current DSM implementation and may need custom definition for IdeaSpark:

1. **Success/Warning Colors:** Recommended values provided, but not in original DSM
2. **Illustration Style:** No illustrations currently in DSM
3. **Photography Guidelines:** General recommendations only
4. **Page Layout Grid:** No explicit grid system defined
5. **Data Visualization Colors:** No chart/graph color palette defined
6. **Print Styles:** Web-only focus, no print CSS

### DaisyUI Compatibility Notes

**DaisyUI has more component variants than Pasportcard DSM defines.** When styling DaisyUI components not covered in this spec:

- Use brand red (#E10514) for primary actions
- Use neutral gray (#525355) for secondary actions
- Use 20px border radius for consistency
- Maintain 4.5:1 text contrast ratios

**DaisyUI-specific customizations:**
- Tabs: Use 2px bottom border, brand red for active state
- Badges: Use `pill` radius (99px)
- Alerts: Use status colors from Section 3.5
- Loading: Use brand red for spinners/progress bars

---

## 📧 CONTACT & SUPPORT

**For Questions or Clarifications:**
- **Agent:** Shay (DSM Component Organizer)
- **Repository:** design-system-monorepo
- **Documentation:** See `docs/` directory in repository

**Additional Resources:**
- **Consolidated DSM Knowledge:** `.bmad/custom/src/agents/ux-organizer/sidecar/prompts/consolidated-dsm-knowledge.md`
- **Architecture Documentation:** `docs/architecture-tokens-icons-types.md`
- **UX Specification:** `docs/ux-design-specification.md`

---

**End of Specification Response**

**Prepared by:** Shay (DSM Agent)  
**Date:** 2026-01-11  
**Version:** 1.0.0  
**Status:** Complete ✅

---

**Thank you for using Pasportcard DSM as the foundation for IdeaSpark! 🚀**
