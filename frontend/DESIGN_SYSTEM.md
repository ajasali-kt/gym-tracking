# Gym Tracking Application - Design Language System (DLS)

## 1. Purpose
This document defines the Design Language System (DLS) for the Gym Tracking application.
It provides a shared visual, interaction, and UX foundation to ensure consistency, speed, and scalability across the product.

This DLS is implementation-focused and aligned with a React + Vite frontend architecture.

## 2. Design Principles
1. Clarity over decoration
UI must be readable and usable during workouts and under fatigue.

2. Speed-first UX
Logging and navigation must feel instant and interruption-free.

3. Consistency over creativity
Identical actions should look and behave the same everywhere.

4. Progress drives motivation
Data presentation should feel rewarding, not clinical.

## 3. Color System

### 3.1 Core Colors
```css
:root {
  --color-primary: #2563EB;   /* Primary actions, links */
  --color-success: #16A34A;   /* Completed sets, PRs */
  --color-warning: #F59E0B;   /* Rest timers, partial states */
  --color-danger:  #DC2626;   /* Destructive actions */

  --gray-900: #0F172A;        /* Primary text */
  --gray-700: #334155;        /* Secondary text */
  --gray-500: #64748B;        /* Muted text */
  --gray-300: #CBD5E1;        /* Borders */
  --gray-100: #F1F5F9;        /* Backgrounds */
  --white: #FFFFFF;
}
```

### 3.2 Usage Rules
- Primary is used for CTAs and active navigation.
- Success is used only for completion and achievements.
- Danger is reserved for destructive or irreversible actions.
- Color must not be the sole indicator of state (pair with icon or text).

## 4. Typography

### 4.1 Font Stack
```css
font-family: Inter, system-ui, -apple-system, sans-serif;
```

### 4.2 Type Scale
| Role | Size | Weight | Usage |
| --- | --- | --- | --- |
| H1 | 28px | 700 | Page titles |
| H2 | 22px | 600 | Section headers |
| H3 | 18px | 600 | Card headers |
| Body | 14-16px | 400 | Main content |
| Small | 12px | 400 | Meta info, timestamps |

Rules:
- Maximum of two font weights per component.
- Avoid center-aligned body text.
- Numeric stats should use tabular spacing if available.

## 5. Spacing and Layout

### 5.1 Spacing Scale (8pt System)
```css
--space-1: 4px;
--space-2: 8px;
--space-3: 12px;
--space-4: 16px;
--space-5: 24px;
--space-6: 32px;
```

### 5.2 Layout Rules
- Page padding: 24px
- Card padding: 16px
- Section spacing: 32px
- Mobile-first layout approach

## 6. Component Language

### 6.1 Buttons
Variants:
- Primary
- Secondary
- Danger
- Ghost (icon-only)

Rules:
- Only one primary button per screen.
- Disabled buttons should communicate why.
- Minimum height: 44px.

### 6.2 Inputs and Forms
Rules:
- Labels must always be visible.
- Numeric inputs should use steppers.
- Autosave must show subtle confirmation (for example, `Saved`).

### 6.3 Cards
Cards are the primary layout container.

Types:
- Workout Card
- Exercise Card
- Stat Card
- Admin Panel Card

Rules:
- Flat by default.
- Shadows only on hover or active.
- One primary action per card.

### 6.4 Tables and Lists
Used for plans, history, and admin views.

Rules:
- Desktop: column-based layout.
- Mobile: stacked rows.
- Actions aligned to the right.
- Maximum of three actions per row.

## 7. State Language

### 7.1 Loading States
- Prefer skeleton loaders for content.
- Use spinners only for blocking operations.

### 7.2 Empty States
Every empty state must include:
- Icon
- Short explanation
- Clear next action

Example:
- No workouts logged yet
- Start your first workout

### 7.3 Error States
Tone:
- Calm
- Non-blaming
- Actionable

Example:
- Couldn't save this set. Retrying...

## 8. Workout Logging UX Rules
Workout logging is the core interaction surface.

- Optimistic UI: UI updates immediately; backend sync happens silently.
- Autosave feedback: Show subtle confirmation; never block the user.
- Rest timers: Non-blocking and color-coded.
- Touch targets: Minimum 44px height; optimized for one-hand use.

## 9. Navigation Language

### 9.1 Primary Navigation
- Dashboard
- Plans
- Log
- Progress
- More (History, Share)

Rules:
- Maximum of five top-level items.
- Admin sections must be visually separated.

## 10. Design Tokens (Reference)
```ts
export const theme = {
  colors: {
    primary: "#2563EB",
    success: "#16A34A",
    danger: "#DC2626"
  },
  spacing: [4, 8, 12, 16, 24, 32],
  radius: {
    sm: 4,
    md: 8,
    lg: 12
  }
};
```

## 11. Alignment With Architecture
- Shared UI primitives live in a common components layer.
- Feature modules compose existing components.
- Admin and public views reuse the same components with density changes.
- Share pages use read-only component variants.

## 12. Extension Guidelines
- All new UI components must follow this DLS.
- Visual changes require updating this document.
- Avoid feature-specific styling overrides.

## 13. Ready-to-Commit Checklist
- Token values are used instead of hardcoded style values.
- States (loading, empty, error) are present for each primary view.
- All interactive elements meet 44px minimum touch target.
- Navigation remains at five top-level destinations or fewer.
- New components reuse shared primitives before custom styling.
- Any visual rule change includes a matching DLS update.

## 14. Mobile Design Language (Dedicated)

This section defines mobile-first behavior separately to avoid desktop assumptions leaking into key flows.

### 14.1 Breakpoints and Density
- Base styles target mobile first (`< 640px`).
- `sm` and above may increase density, but mobile defaults must remain fully usable.
- Horizontal scroll is not allowed for primary content.

### 14.2 Spacing and Hit Areas
- Page padding on mobile: 16px.
- Card padding on mobile: 12-16px.
- Vertical rhythm should prioritize scanability over compactness.
- All tappable controls use at least 44px height and comfortable side padding.

### 14.3 Typography on Mobile
- Body text minimum: 14px.
- Meta text can go to 12px only when contrast is high.
- Long labels and exercise names must wrap instead of truncating critical context.

### 14.4 Layout Adaptation Rules
- Desktop multi-column layouts must collapse to a single column on mobile.
- Dense horizontal metric rows must stack into clear vertical groups on mobile.
- Chips/tags should wrap to new lines rather than shrink below readability.

### 14.5 Workout Timeline Mobile Pattern
- Timeline cards use compact headers with stacked title/meta on mobile.
- Exercise sections keep one clear heading row and wrap secondary tags below if needed.
- Set rows must be mobile-stacked:
  - First row: set label.
  - Second row: reps and weight.
  - Third row: volume/meta.
- Preserve the same information hierarchy as desktop while avoiding side-to-side scanning.

### 14.6 Validation Checklist (Mobile)
- No clipped text on 320px width.
- No horizontal overflow in timeline, history, or share pages.
- Primary actions remain thumb-reachable and readable one-handed.
- Timeline set data can be read without zooming.
