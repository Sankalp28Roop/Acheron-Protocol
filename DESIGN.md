# CloakComms — Design System Specification

> **Source**: Ingested from Stitch MCP project `11751031936917549566` (design theme: *Molecular Precision*).  
> This file is the canonical design token reference for all UI components and Tailwind configuration.

---

## 1. Creative North Star: "The Cipher Lens"

CloakComms treats the interface as a **cryptographic instrument** — a surveillance-proof terminal where every interaction feels deliberate and clandestine. The aesthetic draws from:

- **Glassmorphism** — frosted credential cards floating over deep void backgrounds
- **Asymmetric layouts** — credentials and timers offset from center to convey dynamic tension
- **Bioluminescent glow** — cyan/teal energy pulses signal live activity and active connections
- **Negative space** — breathing room around every credential enforces "one at a time" focus

---

## 2. Color Tokens

### Base Palette

| Token Name | Hex Value | CSS Variable | Usage |
|---|---|---|---|
| `background` | `#0b1326` | `--color-background` | Page canvas, deepest void |
| `surface` | `#0b1326` | `--color-surface` | Base surfaces |
| `surface-container-lowest` | `#060e20` | `--color-surface-lowest` | Recessed panels |
| `surface-container-low` | `#131b2e` | `--color-surface-low` | Section backgrounds |
| `surface-container` | `#171f33` | `--color-surface` | Default cards |
| `surface-container-high` | `#222a3d` | `--color-surface-high` | Floating modals, elevated cards |
| `surface-container-highest` | `#2d3449` | `--color-surface-highest` | Interactive elements, card headers |
| `surface-bright` | `#31394d` | `--color-surface-bright` | Hover states |

### Brand Colors

| Token Name | Hex Value | CSS Variable | Usage |
|---|---|---|---|
| `primary` | `#2ddbde` | `--color-primary` | CTAs, active indicators, timers |
| `primary-container` | `#005354` | `--color-primary-container` | Button gradient end |
| `primary-fixed` | `#5af8fb` | `--color-primary-fixed` | Glow pulses |
| `secondary` | `#a3c9ff` | `--color-secondary` | Supporting info, labels |
| `secondary-container` | `#004a86` | `--color-secondary-container` | Secondary button fill |
| `tertiary` | `#ffb77d` | `--color-tertiary` | Expiry warnings, danger actions |
| `tertiary-container` | `#723c00` | `--color-tertiary-container` | Warning backgrounds |

### Text Colors

| Token Name | Hex Value | CSS Variable | Usage |
|---|---|---|---|
| `on-background` | `#dae2fd` | `--color-on-background` | Primary body text |
| `on-surface` | `#dae2fd` | `--color-on-surface` | Card text |
| `on-surface-variant` | `#c2c6d1` | `--color-on-surface-variant` | Captions, metadata |
| `on-primary` | `#003738` | `--color-on-primary` | Text on primary buttons |
| `on-secondary` | `#00315c` | `--color-on-secondary` | Text on secondary buttons |
| `on-tertiary` | `#4d2600` | `--color-on-tertiary` | Text on warning elements |

### State Colors

| Token Name | Hex Value | CSS Variable | Usage |
|---|---|---|---|
| `outline` | `#8c919b` | `--color-outline` | Default borders |
| `outline-variant` | `#424750` | `--color-outline-variant` | Ghost borders (15% opacity) |
| `error` | `#ffb4ab` | `--color-error` | Error text |
| `error-container` | `#93000a` | `--color-error-container` | Error backgrounds |
| `inverse-primary` | `#00696b` | `--color-inverse-primary` | Light-mode primary fallback |

---

## 3. Typography

### Font Families

| Role | Font | Google Fonts Import | Usage |
|---|---|---|---|
| **Display / Headline** | Space Grotesk | `Space+Grotesk:wght@400;500;600;700` | h1–h3, credential values, timers |
| **Body / Label** | Manrope | `Manrope:wght@400;500;600` | Body copy, metadata, badges |

### Type Scale

| Level | Font | Size | Weight | Line Height | Usage |
|---|---|---|---|---|---|
| Display | Space Grotesk | 3rem (48px) | 700 | 1.1 | Hero title, "CloakComms" |
| Headline | Space Grotesk | 1.75rem (28px) | 600 | 1.2 | Section headers |
| Title | Manrope | 1.125rem (18px) | 600 | 1.4 | Card titles, modal headers |
| Body | Manrope | 0.9375rem (15px) | 400 | 1.6 | Descriptions, inbox text |
| Label | Manrope | 0.75rem (12px) | 500 | 1.4 | Badges, metadata, captions |
| Mono | Space Grotesk | 0.875rem (14px) | 500 | 1.5 | Email addresses, phone numbers, tokens |

---

## 4. Spacing Scale

Based on a `4px` base unit with a `×3` multiplier applied at the `xl` end.

| Token | Value | Usage |
|---|---|---|
| `space-1` | 4px | Micro-gaps |
| `space-2` | 8px | Icon padding |
| `space-3` | 12px | Component inner padding |
| `space-4` | 16px | Card padding |
| `space-6` | 24px | Section gaps |
| `space-8` | 32px | Panel separation |
| `space-12` | 48px | Major section spacing |
| `space-16` | 64px | Page-level breathing room |

---

## 5. Glassmorphism Rules

### Credential Card Glass Effect
```css
background: rgba(19, 27, 46, 0.6);   /* surface-container-low at 60% */
backdrop-filter: blur(20px);
-webkit-backdrop-filter: blur(20px);
border: 1px solid rgba(66, 71, 80, 0.15); /* outline-variant at 15% */
```

### Hover Ghost Border Transition
```css
/* Default: outline-variant at 15% */
border-color: rgba(66, 71, 80, 0.15);
/* Hover: outline-variant at 40% */
border-color: rgba(66, 71, 80, 0.4);
transition: border-color 200ms ease;
```

### Modal Overlay
```css
background: rgba(11, 19, 38, 0.85);   /* background at 85% */
backdrop-filter: blur(8px);
```

---

## 6. Gradients

### Primary CTA Gradient (Hero Buttons, Active Headers)
```css
background: linear-gradient(135deg, #2ddbde 0%, #005354 100%);
```

### Glow Effect (Active Credential Ring)
```css
box-shadow: 0 0 40px rgba(45, 219, 222, 0.08), /* ambient */
            0 0 12px rgba(45, 219, 222, 0.2);   /* inner glow */
```

### Expiry Warning Gradient
```css
background: linear-gradient(135deg, #ffb77d 0%, #723c00 100%);
```

### Background Depth Gradient (Page)
```css
background: radial-gradient(ellipse at 20% 20%, rgba(45, 219, 222, 0.04) 0%, transparent 60%),
            radial-gradient(ellipse at 80% 80%, rgba(163, 201, 255, 0.03) 0%, transparent 60%),
            #0b1326;
```

---

## 7. Elevation & Depth

| Layer | Background | Depth Level |
|---|---|---|
| Page canvas | `#0b1326` | 0 |
| Section backgrounds | `#131b2e` | 1 |
| Default cards | `#171f33` | 2 |
| Floating/elevated cards | `#222a3d` | 3 |
| Interactive / header strips | `#2d3449` | 4 |
| Active highlights | `#31394d` | 5 |

**Ambient shadow for floating elements:**
```css
box-shadow: 0 0 60px rgba(45, 219, 222, 0.08);
```

---

## 8. Border Radius

| Token | Value | Usage |
|---|---|---|
| `radius-sm` | 4px | Badges, tags |
| `radius-md` | 8px | Buttons, inputs |
| `radius-lg` | 12px | Cards |
| `radius-xl` | 16px | Modals, panels |
| `radius-full` | 9999px | Pills, avatars |

---

## 9. Component Specs

### Primary Button
```
fill: gradient(#2ddbde → #005354, 135°)
text: #003738 (on-primary)
border: none
radius: 8px (radius-md)
padding: 12px 24px
font: Manrope 600 15px
hover: brightness(1.1) + box-shadow glow
```

### Secondary (Glass) Button
```
fill: surface-container-low at 60% + blur(20px)
text: #2ddbde (primary)
border: 1px solid rgba(66,71,80,0.15) → 0.4 on hover
radius: 8px
```

### Credential Card
```
glass effect (see §5)
header strip: surface-container-highest (#2d3449)
body: surface-container-low (#131b2e) at 60%
no divider lines (use background shift only)
hover: border-color 15% → 40%
corner radius: 12px
```

### TTL Countdown Ring
```
SVG circle stroke animation
active: stroke #2ddbde with glow filter
warning (<20% remaining): stroke #ffb77d
expired: stroke #93000a (error-container)
animation: stroke-dashoffset linear countdown
```

### Input Fields (Periodic Style)
```
background: transparent
border-bottom: 1px solid rgba(66,71,80,0.4) (outline-variant)
border-top/left/right: none
on-focus: border-bottom-color #2ddbde + 0 0 8px rgba(45,219,222,0.3) glow
font: Manrope 400 15px
text: #dae2fd (on-surface)
```

### Badges
```
EMAIL type: background #004a86, text #a3c9ff
SMS type:   background #005354, text #2ddbde
EXPIRED:    background #93000a, text #ffb4ab
ACTIVE:     background #2d3449, text #2ddbde with left-border glow
```

### Hex-Grid Background Texture
```css
/* SVG hexagon pattern overlay at z-index: -1 */
opacity: 0.05;  /* outline-variant at 5% */
color: #424750;
```

---

## 10. Animation Tokens

| Token | Value | Usage |
|---|---|---|
| `transition-fast` | 150ms ease | Button hover |
| `transition-base` | 200ms ease | Card hover, border changes |
| `transition-slow` | 350ms ease | Modal appear |
| `transition-spring` | 400ms cubic-bezier(0.34,1.56,0.64,1) | Credential card mount |
| `pulse-glow` | `@keyframes pulse-glow 2s ease-in-out infinite` | Active credential indicator |

```css
@keyframes pulse-glow {
  0%, 100% { box-shadow: 0 0 8px rgba(45, 219, 222, 0.2); }
  50%       { box-shadow: 0 0 20px rgba(45, 219, 222, 0.5); }
}

@keyframes countdown-ring {
  from { stroke-dashoffset: 0; }
  to   { stroke-dashoffset: var(--ring-circumference); }
}

@keyframes message-slide-in {
  from { opacity: 0; transform: translateY(-8px); }
  to   { opacity: 1; transform: translateY(0); }
}

@keyframes float-particle {
  0%, 100% { transform: translateY(0px) translateX(0px); }
  33%  { transform: translateY(-12px) translateX(6px); }
  66%  { transform: translateY(4px) translateX(-8px); }
}
```

---

## 11. Do's and Don'ts

### Do:
- ✅ Use glassmorphism on credential cards (backdrop-blur + semi-transparent fill)
- ✅ Use the primary gradient for all main CTAs
- ✅ Use `tertiary` (#ffb77d) for expiry warnings and countdown pulses
- ✅ Keep generous padding (space-8+) around credential cards
- ✅ Animate TTL countdown rings with SVG stroke-dashoffset
- ✅ Apply `pulse-glow` keyframe to active credential indicators
- ✅ Use Space Grotesk for all addresses, tokens, and numeric data

### Don't:
- ❌ Use 100% opacity borders — breaks the glass aesthetic
- ❌ Use solid background fills on cards (always semi-transparent)
- ❌ Use drop shadows with black — always use `#2ddbde` tinted ambient shadows
- ❌ Place more than 6 credentials in view without pagination
- ❌ Use browser-default fonts anywhere in the UI
