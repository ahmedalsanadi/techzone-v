# Dynamic Theme System Guide

This guide explains how to use the dynamic theming system that adapts to the primary and secondary colors from the API.

## Overview

The application uses a dynamic theming system where colors are fetched from the backend API (`/store/config`) and applied globally via CSS variables. The theme colors (`primary_color` and `secondary_color`) are set dynamically and can be used throughout the application.

## How It Works

1. **StoreProvider** (`src/components/providers/StoreProvider.tsx`) fetches the store configuration from the API
2. CSS variables are set on the document root (`:root`)
3. Tailwind CSS utilities are generated from these CSS variables
4. Components use Tailwind classes that reference these variables

## Available Theme Colors

### Primary Color (`--theme-primary`)
The main brand color from the API. Used for:
- Primary buttons
- Links and active states
- Borders and focus rings
- Icons and accents
- Backgrounds

### Secondary Color (`--theme-secondary`)
The secondary brand color from the API. Used for:
- Brand name display (footer, navbar)
- Accent elements
- Swiper pagination bullets

## CSS Variables

The following CSS variables are automatically generated and available:

```css
/* Base Theme Colors */
--theme-primary: #B44734 (or from API)
--theme-secondary: #FFB800 (or from API)

/* Primary Color Variants */
--theme-primary-hover: (4% darker than primary)
--theme-primary-light: rgba(primary, 0.1)
--theme-primary-lighter: rgba(primary, 0.05)
--theme-primary-border: rgba(primary, 0.3)
--theme-primary-tint: (white blended with 10% primary)
--theme-primary-rgb: (RGB values for opacity modifiers)

/* Icon Filter */
--icon-filter: (CSS filter to color icons with primary color)
```

## Tailwind Classes

### Text Colors
```tsx
// Primary text color
<p className="text-theme-primary">Primary colored text</p>

// Secondary text color
<p className="text-theme-secondary">Secondary colored text</p>
```

### Background Colors
```tsx
// Solid primary background
<div className="bg-theme-primary">Primary background</div>

// Primary with opacity
<div className="bg-theme-primary/10">10% opacity primary</div>
<div className="bg-theme-primary/5">5% opacity primary</div>
<div className="bg-theme-primary/20">20% opacity primary</div>

// Tinted background (white + 10% primary blend)
<div className="bg-theme-primary-tint">Tinted background</div>

// Light backgrounds
<div className="bg-theme-primary-light">Light primary background</div>
<div className="bg-theme-primary-lighter">Lighter primary background</div>
```

### Border Colors
```tsx
// Primary border
<div className="border-theme-primary">Primary border</div>

// Border with opacity
<div className="border-theme-primary/30">30% opacity border</div>

// Border variant
<div className="border-theme-primary-border">Border variant</div>
```

### Hover States
```tsx
// Button hover (uses brightness filter for conventional hover)
<button className="bg-theme-primary hover:brightness-[0.95]">
  Hover me
</button>

// Text hover
<a className="text-gray-700 hover:text-theme-primary">Link</a>

// Border hover
<div className="border-gray-300 hover:border-theme-primary-border">
  Hover border
</div>
```

### Focus States
```tsx
// Input focus ring
<input className="focus:border-theme-primary-border focus:ring-4 focus:ring-theme-primary/5" />

// Button focus
<button className="focus:ring-theme-primary focus:ring-offset-2">
  Focusable button
</button>
```

### Shadows
```tsx
// Primary shadow
<div className="shadow-lg shadow-theme-primary/20">Shadowed element</div>
<div className="shadow-xl shadow-theme-primary/30">Stronger shadow</div>
```

### Icon Filtering
```tsx
// Apply primary color to black/white icons
<img src="/icon.svg" className="icon-theme-primary" />
```

## Common Patterns

### Primary Button
```tsx
<button className="bg-theme-primary hover:brightness-[0.95] text-white font-bold py-3 px-6 rounded-xl shadow-lg shadow-theme-primary/20 transition-all">
  Click me
</button>
```

### Secondary Button (Outline)
```tsx
<button className="bg-theme-primary/10 hover:bg-theme-primary hover:text-white text-theme-primary border border-theme-primary font-bold py-3 px-6 rounded-xl transition-all">
  Secondary Button
</button>
```

### Active State
```tsx
<div className={cn(
  "px-4 py-2 rounded-lg",
  isActive 
    ? "bg-theme-primary/5 text-theme-primary border-theme-primary"
    : "bg-gray-50 text-gray-700 border-gray-200"
)}>
  Active Item
</div>
```

### Input Focus
```tsx
<input 
  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-theme-primary-border focus:ring-4 focus:ring-theme-primary/5 outline-none transition-all"
  type="text"
/>
```

### Link Hover
```tsx
<a className="text-gray-700 hover:text-theme-primary transition-colors">
  Hover link
</a>
```

### Card with Theme Border
```tsx
<div className="p-6 border-2 border-theme-primary rounded-xl hover:border-theme-primary-border transition-colors">
  Card content
</div>
```

## Button Component Usage

When using the `Button` component with theme colors:

```tsx
import { Button } from '@/components/ui/Button';

// The Button component automatically handles hover states for bg-theme-primary
<Button className="bg-theme-primary text-white">
  Theme Button
</Button>

// Custom hover is respected if provided
<Button className="bg-theme-primary hover:brightness-[0.95] text-white">
  Custom Hover
</Button>
```

**Note**: The Button component automatically:
- Removes conflicting hover states from variants when `bg-theme-primary` is used
- Adds `hover:brightness-[0.95]` if no custom hover is provided
- Ensures theme hover states take precedence

## Rules & Best Practices

### ✅ DO

1. **Use theme classes for brand colors**
   ```tsx
   ✅ <div className="bg-theme-primary">...</div>
   ✅ <button className="text-theme-primary">...</button>
   ```

2. **Use opacity modifiers for tints**
   ```tsx
   ✅ <div className="bg-theme-primary/10">...</div>
   ✅ <div className="border-theme-primary/30">...</div>
   ```

3. **Use brightness filter for button hovers**
   ```tsx
   ✅ <button className="bg-theme-primary hover:brightness-[0.95]">...</button>
   ```

4. **Use theme-primary-tint for Footer backgrounds**
   ```tsx
   ✅ <footer className="bg-theme-primary-tint">...</footer>
   ```

5. **Use icon-theme-primary for dynamic icon coloring**
   ```tsx
   ✅ <img src="/icon.svg" className="icon-theme-primary" />
   ```

### ❌ DON'T

1. **Don't hardcode theme colors**
   ```tsx
   ❌ <div className="bg-[#B44734]">...</div>
   ❌ <div style={{ color: '#B44734' }}>...</div>
   ```

2. **Don't use libero-red (legacy)**
   ```tsx
   ❌ <div className="bg-libero-red">...</div>
   ❌ <div className="text-libero-red">...</div>
   ```

3. **Don't use darkenColor for hover (too dark)**
   ```tsx
   ❌ <button className="hover:bg-theme-primary-hover">...</button>
   // Use brightness filter instead
   ✅ <button className="hover:brightness-[0.95]">...</button>
   ```

4. **Don't use red for conventional elements**
   ```tsx
   // Close buttons, error states, etc. should stay red
   ✅ <button className="text-red-500">Close</button>
   ✅ <div className="text-red-600">Error message</div>
   ```

## Special Cases

### Footer Background
The footer top section uses a special tinted background:
```tsx
<div className="bg-theme-primary-tint">
  {/* White background with 10% primary color overlay */}
</div>
```

### NavItem Icons
Navigation icons use a CSS filter to match the primary color:
```tsx
<img src="/nav-icon.svg" className="icon-theme-primary" />
```

### Swiper Pagination
Swiper pagination bullets use the secondary color:
```css
/* Automatically applied via globals.css */
.hero-swiper [class*='swiper-pagination-bullet-active'] {
    background: var(--theme-secondary, #ffb800) !important;
}
```

## File Locations

- **Theme Provider**: `src/components/providers/StoreProvider.tsx`
- **CSS Variables**: `src/app/globals.css`
- **Storage Keys**: `src/lib/auth/constants.ts`
- **Button Component**: `src/components/ui/Button.tsx`

## Examples

### Creating a New Component

```tsx
'use client';

import { cn } from '@/lib/utils';

interface MyComponentProps {
  isActive?: boolean;
}

export default function MyComponent({ isActive }: MyComponentProps) {
  return (
    <div
      className={cn(
        'p-4 rounded-lg border-2 transition-all',
        isActive
          ? 'bg-theme-primary/5 border-theme-primary text-theme-primary'
          : 'bg-white border-gray-200 text-gray-700 hover:border-theme-primary-border'
      )}
    >
      <h3 className="text-lg font-bold text-theme-primary mb-2">
        Title
      </h3>
      <p className="text-gray-600">Content</p>
      <button className="mt-4 bg-theme-primary hover:brightness-[0.95] text-white px-4 py-2 rounded-lg shadow-lg shadow-theme-primary/20">
        Action
      </button>
    </div>
  );
}
```

### Creating a New Page

```tsx
'use client';

export default function MyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-black text-theme-primary mb-8">
          Page Title
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-xl border border-theme-primary/20 hover:border-theme-primary transition-colors">
            <h2 className="text-xl font-bold text-theme-primary mb-4">
              Card Title
            </h2>
            <p className="text-gray-600 mb-4">Card content</p>
            <button className="w-full bg-theme-primary hover:brightness-[0.95] text-white font-bold py-3 rounded-lg shadow-lg shadow-theme-primary/20">
              Button
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
```

## Testing Theme Colors

To test with different theme colors, update the API response or modify `StoreProvider.tsx` temporarily:

```tsx
// Example: Blue theme
updateVar('--theme-primary', '#0088FF');
updateVar('--theme-secondary', '#FFB800');
```

All components using theme classes will automatically adapt to the new colors.

## Migration Checklist

When creating new components or pages:

- [ ] Use `text-theme-primary` instead of hardcoded red
- [ ] Use `bg-theme-primary` instead of hardcoded backgrounds
- [ ] Use `border-theme-primary` for theme-related borders
- [ ] Use `hover:brightness-[0.95]` for button hovers
- [ ] Use `focus:ring-theme-primary` for focus states
- [ ] Use `shadow-theme-primary/20` for shadows
- [ ] Keep conventional red for close buttons, errors, etc.
- [ ] Test with different primary colors (blue, green, etc.)

## Support

If you need to add new theme utilities or modify the theming system:

1. Update CSS variables in `src/app/globals.css`
2. Update `StoreProvider.tsx` to calculate new variants
3. Add Tailwind mappings in `@theme inline` block
4. Update this guide with new patterns

---

**Remember**: Always use theme classes for brand colors. Never hardcode colors that should reflect the theme!
