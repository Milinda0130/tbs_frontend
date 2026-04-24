---
name: Campus Inventory Design System
colors:
  surface: '#f9f9ff'
  surface-dim: '#cedbf2'
  surface-bright: '#f9f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f0f3ff'
  surface-container: '#e7eeff'
  surface-container-high: '#dee9ff'
  surface-container-highest: '#d7e3fb'
  on-surface: '#101c2d'
  on-surface-variant: '#434654'
  inverse-surface: '#253143'
  inverse-on-surface: '#ebf1ff'
  outline: '#737685'
  outline-variant: '#c3c6d6'
  surface-tint: '#0c56d0'
  primary: '#003d9b'
  on-primary: '#ffffff'
  primary-container: '#0052cc'
  on-primary-container: '#c4d2ff'
  inverse-primary: '#b2c5ff'
  secondary: '#4e6072'
  on-secondary: '#ffffff'
  secondary-container: '#d1e5fa'
  on-secondary-container: '#546678'
  tertiary: '#7b2600'
  on-tertiary: '#ffffff'
  tertiary-container: '#a33500'
  on-tertiary-container: '#ffc6b2'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dae2ff'
  primary-fixed-dim: '#b2c5ff'
  on-primary-fixed: '#001848'
  on-primary-fixed-variant: '#0040a2'
  secondary-fixed: '#d1e5fa'
  secondary-fixed-dim: '#b6c8dd'
  on-secondary-fixed: '#091d2d'
  on-secondary-fixed-variant: '#37495a'
  tertiary-fixed: '#ffdbcf'
  tertiary-fixed-dim: '#ffb59b'
  on-tertiary-fixed: '#380d00'
  on-tertiary-fixed-variant: '#812800'
  background: '#f9f9ff'
  on-background: '#101c2d'
  surface-variant: '#d7e3fb'
typography:
  headline-lg:
    fontFamily: Public Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Public Sans
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Public Sans
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Public Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Public Sans
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-bold:
    fontFamily: Public Sans
    fontSize: 12px
    fontWeight: '700'
    lineHeight: 16px
    letterSpacing: 0.05em
  label-md:
    fontFamily: Public Sans
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  base: 4px
  xs: 8px
  sm: 16px
  md: 24px
  lg: 32px
  xl: 48px
  container-max: 1440px
  gutter: 24px
---

## Brand & Style
The design system is engineered for high-utility academic and administrative environments. The brand personality is rooted in reliability, institutional clarity, and operational efficiency. It targets campus administrators, department heads, and logistics staff who require a tool that minimizes cognitive load while managing complex data sets.

The visual style follows a **Modern Corporate Minimalism** approach. It prioritizes functional density and structural hierarchy over decorative elements. By utilizing a restrained color palette and a systematic grid, the interface evokes a sense of order and institutional trust, ensuring that the primary focus remains on asset tracking and resource management.

## Colors
The color strategy for this design system is built upon a foundation of administrative authority and high legibility. 

- **Primary Blue:** A solid, high-contrast blue used for primary actions, active states, and key navigational markers. It provides a clear visual signal for interactable elements.
- **Background:** A consistent light gray (#F5F5F5) serves as the canvas, reducing screen glare during long periods of use and providing enough contrast for white card components to "pop."
- **Neutrals:** A scale of cool grays is used for secondary text, borders, and disabled states, ensuring that the interface feels cohesive and professional.
- **Semantic Colors:** Standardized red for alerts/low stock, amber for pending/maintenance, and green for available/received status updates.

## Typography
This design system utilizes **Public Sans**, an open-source typeface designed for government and institutional use. Its neutral, clean letterforms ensure maximum readability across various screen densities.

The typography system emphasizes a strong hierarchy:
- **Headings:** Bold weights are applied to all headlines to anchor sections and provide immediate context.
- **Labels:** Small, all-caps bold labels are used for metadata and form headers to distinguish them from user-generated content.
- **Numeric Data:** For inventory counts and SKU numbers, tabular lining figures should be used to ensure vertical alignment in tables.

## Layout & Spacing
The layout philosophy is based on a **Fixed-Width Modular Grid**. On desktop, content is contained within a 1440px center-aligned container using a 12-column grid. This ensures that data-heavy dashboards do not become unreadable on ultra-wide monitors.

A strict 8px spatial system (with a 4px half-step for tight components) governs all margins and padding. White space is used intentionally to group related items within cards, while larger gaps (32px+) are used to separate distinct functional areas like "Asset Overview" and "Recent Activity."

## Elevation & Depth
In this design system, depth is achieved through **Tonal Layering** and **Low-Contrast Ambient Shadows**. 

The light gray background (#F5F5F5) serves as the lowest level. Card components are pure white (#FFFFFF), creating a natural "lift" through color contrast. To further define these cards, a single, soft shadow is applied (0px 2px 4px rgba(0,0,0,0.05)). 

Interactive elements like buttons or active dropdowns do not use heavy shadows; instead, they rely on solid color fills and 1px borders to denote state changes. This maintains the clean, professional aesthetic required for an inventory system.

## Shapes
The shape language is "Soft" (Level 1), utilizing a 4px base radius for standard components like buttons and input fields. This subtle rounding provides a modern feel without sacrificing the precise, geometric look of a professional tool.

Larger containers, such as inventory cards, use a 8px (rounded-lg) radius to create a distinct visual boundary against the background. Circular shapes are reserved exclusively for status indicators (dots) and user avatars.

## Components
Consistent component styling is vital for the efficiency of the design system:

- **Cards:** The primary layout vehicle. Every card must have a white background, 8px corner radius, and a subtle 1px border (#E1E4E8) instead of a heavy shadow.
- **Buttons:** Primary buttons use the Solid Blue hex with white text. Secondary buttons use a transparent background with a 1px gray border.
- **Input Fields:** Use a 1px border that thickens and turns Primary Blue on focus. Labels must always be visible above the field in the `label-bold` style.
- **Inventory Chips:** Small, rounded-pill indicators used for stock status (e.g., "In Stock", "Out of Stock"). They use low-saturation background colors with high-saturation text for readability.
- **Data Tables:** Clean, borderless rows with 1px horizontal dividers. The header row should have a light gray background to distinguish it from the data.
- **Search Bars:** Prominent at the top of inventory lists, featuring a subtle magnifying glass icon and a clear placeholder indicating the searchable parameters (e.g., "Search by SKU, Building, or Category").