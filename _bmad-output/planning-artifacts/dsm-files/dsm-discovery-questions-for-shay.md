# DSM Discovery Questionnaire for SHAY
**Purpose:** Extract design system specifications from Pasportcard DSM to create a unified design identity for IdeaSpark using DaisyUI components

**Target Agent:** SHAY (DSM Agent)  
**Date:** 2026-01-11  
**Project:** IdeaSpark  
**Prepared by:** Sally (UX Designer)

---

## 🎯 OBJECTIVE

We are building IdeaSpark using **DaisyUI** as our component library. We need to extract the visual design language, brand identity, and design tokens from the Pasportcard DSM to apply on top of DaisyUI components, ensuring brand consistency without rebuilding components from scratch.

**What we need from you (SHAY):** Design system specifications that define the *visual identity layer* - colors, typography, spacing, iconography, and other design tokens that we'll use to theme and style our DaisyUI implementation.

---

## 📐 SECTION 1: DESIGN TOKENS & FOUNDATION

### 1.1 Color System

Please provide complete color specifications:

**Primary Colors:**
- What is the primary brand color? (name, hex, RGB, usage guidelines)
- Are there primary color variations/shades? (light, dark, hover states)
- When should the primary color be used? (CTAs, links, highlights)

**Secondary Colors:**
- What secondary colors exist in the system?
- What are their specific use cases?
- Provide all hex values and semantic naming

**Semantic Colors:**
- Success color (hex value, usage)
- Warning color (hex value, usage)
- Error/Danger color (hex value, usage)
- Info color (hex value, usage)

**Neutral Colors:**
- Background colors (light mode): primary, secondary, tertiary
- Background colors (dark mode - if applicable): primary, secondary, tertiary
- Text colors: primary, secondary, disabled, placeholder
- Border colors: default, focus, hover
- Divider/separator colors

**Additional Questions:**
- Does the DSM support dark mode? If yes, provide complete dark mode palette
- Are there any gradient specifications?
- What is the contrast ratio requirement for accessibility?
- Are there any color combinations that should be avoided?

---

### 1.2 Typography System

**Font Families:**
- What is the primary font family? (with fallbacks)
- Is there a secondary font family? (for headings, special use)
- Where can we obtain these fonts? (Google Fonts, custom files, CDN links)
- Are there any font licensing considerations?

**Type Scale:**
Please provide the complete typographic scale with:
- Font size (px/rem)
- Line height
- Font weight
- Letter spacing (if applicable)

For each of these elements:
- H1 (Main page title)
- H2 (Section headers)
- H3 (Subsection headers)
- H4, H5, H6 (if defined)
- Body Large
- Body Regular (default)
- Body Small
- Caption
- Label
- Button text
- Link text

**Font Weights:**
- What font weights are used? (300, 400, 500, 600, 700, etc.)
- When should each weight be used?

**Text Decoration:**
- How should links be styled? (underline, color, hover states)
- Are there specific rules for bold, italic, code text?

---

### 1.3 Spacing System

**Spacing Scale:**
- What is the base spacing unit? (e.g., 4px, 8px)
- Provide the complete spacing scale (e.g., 0, 4, 8, 12, 16, 24, 32, 40, 48, 64, 80, 96, 128)

**Layout Spacing:**
- Container max-width specifications
- Content padding (mobile, tablet, desktop)
- Section spacing (vertical rhythm between sections)
- Grid gutter specifications

**Component Spacing:**
- Default padding inside components (buttons, cards, inputs)
- Spacing between form elements
- Spacing around text and icons

---

### 1.4 Border & Radius System

**Border Width:**
- Default border width
- Thick border width (for emphasis)
- Are there specific border widths for different components?

**Border Radius:**
- What is the default border radius? (e.g., 4px, 8px)
- Are there variations? (small, medium, large, full/pill)
- When should each radius size be used?
- Should buttons, cards, inputs, modals have different radii?

**Border Styles:**
- Are dashed or dotted borders used anywhere?
- Focus ring specifications (color, width, offset)

---

### 1.5 Shadows & Elevation

**Shadow System:**
Please provide complete shadow specifications for:
- No elevation (flat)
- Level 1 (subtle, e.g., cards)
- Level 2 (medium, e.g., dropdowns)
- Level 3 (high, e.g., modals)
- Level 4 (highest, if applicable)

For each level, provide:
- CSS box-shadow values
- When/where to use this elevation

**Additional Shadow Types:**
- Focus shadows
- Hover state shadows
- Inner shadows (if used)

---

## 🎨 SECTION 2: VISUAL DESIGN LANGUAGE

### 2.1 Iconography

**Icon System:**
- What icon library does DSM use? (Material Icons, Font Awesome, Heroicons, custom, etc.)
- If custom, how can we access the icon set?
- What is the default icon size? (e.g., 16px, 20px, 24px)
- What sizes are available in the system? (small, medium, large)

**Icon Style:**
- Are icons outlined, filled, or both?
- What is the default stroke width for outlined icons?
- When should we use outlined vs. filled?

**Icon Colors:**
- Can icons use any color from the palette?
- Are there semantic icon colors (success, warning, error)?
- Default icon color for inactive/neutral states?

**Icon Usage Guidelines:**
- Are there specific icons for common actions? (add, delete, edit, search, etc.)
- Can you provide a list of commonly used icons with their names/identifiers?
- Any icons that should NOT be used for specific meanings?

---

### 2.2 Imagery & Media

**Image Specifications:**
- Aspect ratios to use (1:1, 16:9, 4:3, etc.)
- Border radius for images
- Default image placeholder treatment
- Image loading states (skeleton, spinner, blur)

**Photo Style:**
- Are there guidelines for photography style? (bright, moody, authentic, etc.)
- Any filters or treatments applied to images?
- Preferred image format (WebP, JPEG, PNG)?

**Illustrations:**
- Does DSM include illustration assets?
- If yes, what style? (flat, isometric, hand-drawn, 3D, etc.)
- Where can we access illustration files?

---

### 2.3 Motion & Animation

**Animation Principles:**
- What is the philosophy around motion? (subtle, playful, minimal, etc.)
- Default animation duration (ms)
- Easing functions used (ease-in, ease-out, custom cubic-bezier)

**Common Animations:**
- Hover state transitions (duration, property)
- Focus state transitions
- Modal/dialog enter/exit animations
- Page transitions (if applicable)
- Loading animations (spinner, skeleton, progress)

**Performance:**
- Should we limit animations on mobile?
- Respect prefers-reduced-motion?

---

## 🧩 SECTION 3: COMPONENT-LEVEL SPECIFICATIONS

### 3.1 Buttons

**Button Variants:**
- Primary button style (filled, color, hover, active, disabled states)
- Secondary button style
- Tertiary/Ghost button style
- Destructive/Danger button style
- Icon-only buttons

**Button Sizes:**
- Small button specifications (height, padding, font size)
- Medium/Default button specifications
- Large button specifications

**Button States:**
- Default state
- Hover state
- Active/Pressed state
- Focus state (focus ring)
- Disabled state
- Loading state (if applicable)

---

### 3.2 Input Fields

**Input Style:**
- Default input field style (border, background, height)
- Input sizes (small, medium, large)
- Input states (default, focus, error, disabled, success)

**Form Elements:**
- Checkbox style
- Radio button style
- Toggle/Switch style
- Select/Dropdown style
- Textarea style

**Labels & Helper Text:**
- Label positioning (top, left, inside)
- Label typography
- Helper text style
- Error message style
- Required field indicator (asterisk, label)

---

### 3.3 Cards & Containers

**Card Specifications:**
- Default card style (background, border, shadow)
- Card padding
- Card border radius
- Card hover state (if applicable)

**Card Variants:**
- Flat card
- Elevated card
- Outlined card
- Interactive/clickable card

---

### 3.4 Navigation & Menus

**Navigation Bar:**
- Height specification
- Background color
- Typography for nav items
- Active/selected state styling
- Mobile menu behavior

**Dropdown Menus:**
- Menu item height
- Menu item hover state
- Menu item active state
- Menu padding and spacing
- Divider style

---

### 3.5 Feedback Components

**Alerts/Notifications:**
- Success alert style
- Warning alert style
- Error alert style
- Info alert style
- Neutral alert style

**Toasts:**
- Toast positioning
- Toast duration (default)
- Toast style specifications
- Toast animation

**Modals/Dialogs:**
- Modal backdrop color/opacity
- Modal border radius
- Modal shadow
- Modal max-width
- Modal padding
- Modal close button style

---

## 📱 SECTION 4: RESPONSIVE DESIGN

### 4.1 Breakpoints

**Viewport Breakpoints:**
- Mobile: from ___ to ___ px
- Tablet: from ___ to ___ px  
- Desktop: from ___ to ___ px
- Large Desktop: from ___ px and up

**Responsive Behavior:**
- How should spacing scale across breakpoints?
- How should typography scale across breakpoints?
- Mobile-first or desktop-first approach?

---

### 4.2 Mobile-Specific Guidelines

- Touch target minimum size (e.g., 44x44px)
- Mobile-specific component variations
- Mobile navigation patterns
- Mobile spacing adjustments

---

## ♿ SECTION 5: ACCESSIBILITY STANDARDS

### 5.1 Accessibility Requirements

**WCAG Compliance:**
- What WCAG level does DSM target? (A, AA, AAA)
- Minimum contrast ratios enforced
- Color-blind safe palette verification

**Focus Management:**
- Focus indicator specifications (all interactive elements)
- Focus order considerations
- Skip-to-content link requirements

**Screen Reader Support:**
- ARIA label requirements
- Alternative text requirements for icons
- Semantic HTML expectations

---

## 🎯 SECTION 6: BRAND-SPECIFIC GUIDELINES

### 6.1 Brand Voice & Personality

**Visual Personality:**
- How would you describe the brand's visual personality? (modern, playful, serious, minimal, etc.)
- What emotions should the design evoke?
- What makes this design system unique?

**Do's and Don'ts:**
- Visual patterns that should always be used
- Visual patterns that should be avoided
- Common mistakes to watch out for

---

### 6.2 Logo & Brand Mark

**Logo Specifications:**
- Logo file formats available (SVG, PNG)
- Logo variations (full, icon only, monochrome)
- Logo minimum size
- Logo clear space requirements
- Logo on light background specifications
- Logo on dark background specifications

---

## 📦 SECTION 7: DELIVERABLES REQUEST

**What We Need From You:**

1. **Design Token Export:**
   - Can you provide a JSON/CSS/SCSS file with all design tokens?
   - Format: DaisyUI-compatible or CSS custom properties

2. **Asset Package:**
   - Icon set (SVG files or icon font)
   - Logo files (all variations)
   - Any custom illustration assets
   - Sample images showing photography style

3. **Documentation:**
   - Any existing DSM documentation you can share
   - Component usage examples
   - Brand guidelines document

4. **Code Snippets:**
   - Tailwind config customization (if DSM uses Tailwind)
   - CSS custom properties definitions
   - Any utility classes we should maintain

---

## ✅ NEXT STEPS

**After SHAY's Response:**
1. Sally (UX Designer) will synthesize the design system specifications
2. Create a DaisyUI theme configuration matching the DSM visual identity
3. Document the IdeaSpark Design System built on DaisyUI + Pasportcard DSM tokens
4. Provide implementation guidelines for developers

---

## 📝 NOTES FOR SHAY

- We're **not** asking you to rebuild components - DaisyUI handles that
- We **are** asking for the visual identity layer - colors, fonts, spacing, icons, etc.
- Think of this as "what do we need to make DaisyUI look and feel like Pasportcard DSM"
- If something isn't defined in DSM, that's okay - just let us know
- Provide as much detail as possible - we'll use this to create a comprehensive theme

---

**Thank you, SHAY! 🙏**
