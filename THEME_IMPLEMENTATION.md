# Theme Implementation Guide

## Table of Contents

1. [Overview](#overview)
2. [Problem Statement](#problem-statement)
3. [Solution Architecture](#solution-architecture)
4. [File Structure](#file-structure)
5. [Implementation Details](#implementation-details)
6. [How It Works](#how-it-works)
7. [Usage Guide](#usage-guide)
8. [Refactoring Guide](#refactoring-guide)
9. [Troubleshooting](#troubleshooting)

---

## Overview

This document explains the **multi-tenant dynamic theme system** implemented in this Next.js 16 e-commerce application. The system allows each tenant (store) to have custom primary and secondary colors that are fetched from a Laravel backend API and applied dynamically without any Flash of Unstyled Content (FOUC).

### Key Features

- ✅ **Zero FOUC**: Theme colors appear on first paint
- ✅ **Server-Side Rendering**: CSS variables injected in HTML before React hydration
- ✅ **Multi-Tenant Support**: Each store can have unique branding colors
- ✅ **Optimized Performance**: Minimal client-side work, shared utilities
- ✅ **Type-Safe**: Full TypeScript support
- ✅ **Maintainable**: Centralized theme logic, no code duplication

---

## Problem Statement

### The Original Issue

**Before the implementation**, theme colors were applied client-side using `useLayoutEffect` in the `StoreProvider` component. This caused:

1. **Flash of Unstyled Content (FOUC)**: Users would see fallback colors (#B44734, #FFB800) briefly before the correct tenant theme loaded
2. **Hydration Delay**: Theme only applied after React hydrated and `useLayoutEffect` ran
3. **Poor User Experience**: Wrong colors appeared on first paint, creating a jarring experience

### Why This Happened

Even though `storeConfig` was fetched on the **server**, the CSS variable application happened on the **client**:

```
Timeline (Before):
1. HTML streams with default/fallback colors
2. CSS loads with fallback values
3. React hydrates
4. StoreProvider mounts
5. useLayoutEffect runs
6. Theme vars finally applied ❌ (TOO LATE!)
```

### The Solution Principle

> **Tenant theme must be applied BEFORE first paint**

Anything after hydration is already a loss. We needed to inject theme CSS variables directly into the HTML `<head>` during server-side rendering.

---

## Solution Architecture

### Two-Layer Approach

We implemented a **dual-layer theme application system**:

1. **Server-Side (Primary)**: `ThemeStyles` component injects CSS variables in HTML `<head>` before first paint
2. **Client-Side (Fallback)**: `StoreProvider` syncs theme variables for dynamic updates and edge cases

### Architecture Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    Server-Side (SSR)                        │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. Layout fetches storeConfig (server)                     │
│  2. ThemeStyles generates CSS variables                     │
│  3. CSS injected into <head> as inline <style>             │
│  4. HTML sent to browser with theme already applied         │
│                                                              │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    Browser (First Paint)                    │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ✅ HTML parsed with theme CSS variables                    │
│  ✅ Correct colors from first paint (NO FOUC!)               │
│                                                              │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    Client-Side (Hydration)                  │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  5. React hydrates                                          │
│  6. StoreProvider syncs (optimized - only if changed)       │
│  7. Theme stays consistent                                   │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## File Structure

### Core Theme Files

```
src/
├── lib/
│   └── theme-utils.ts              # Shared color calculation utilities
│
├── components/
│   └── providers/
│       ├── ThemeStyles.tsx         # Server component (CSS injection)
│       └── StoreProvider.tsx      # Client component (sync + context)
│
├── app/
│   ├── [locale]/
│   │   └── layout.tsx              # Root layout (injects ThemeStyles)
│   └── globals.css                 # CSS variable definitions & fallbacks
│
└── services/
    ├── store-config.ts             # Server-side config fetching
    └── types.ts                    # TypeScript types (StoreConfig, StoreTheme)
```

### File Responsibilities

| File | Purpose | Type | When It Runs |
|------|---------|------|--------------|
| `theme-utils.ts` | Pure color calculation functions | Shared utility | Server & Client |
| `ThemeStyles.tsx` | Generates and injects CSS variables | Server component | Server-side (SSR) |
| `StoreProvider.tsx` | Syncs theme + provides context | Client component | Client-side (hydration) |
| `layout.tsx` | Orchestrates theme injection | Server component | Server-side (SSR) |
| `globals.css` | Defines CSS variable structure | CSS | Build time |

---

## Implementation Details

### 1. `src/lib/theme-utils.ts` - Shared Color Utilities

**Purpose**: Pure functions for color calculations that work on both server and client.

**Why This File Exists**: 
- Prevents code duplication between server and client components
- Ensures consistent color calculations across the app
- Makes functions testable and reusable

#### Functions Explained

##### `hexToRgb(hex: string)`

**What**: Converts a hex color string to RGB values.

**Why**: 
- CSS variables need RGB values for opacity modifiers (e.g., `rgba(r, g, b, 0.1)`)
- Tailwind's opacity modifiers work better with RGB format
- Foundation for other color transformations

**How**:
```typescript
hexToRgb('#FF5200') 
// Returns: { r: 255, g: 82, b: 0 }
```

**Usage**: Used internally by other functions, rarely called directly.

---

##### `darkenColor(hex: string, amount: number)`

**What**: Darkens a color by a percentage (0-1).

**Why**: 
- Creates hover states that are subtly darker than the base color
- Provides consistent hover feedback across all theme colors
- Amount of 0.04 (4%) creates a conventional, subtle darkening

**How**:
```typescript
darkenColor('#FF5200', 0.04) 
// Returns: '#F34E00' (4% darker)
```

**Usage**: Generates `--primary-hover` and `--theme-primary-hover` CSS variables.

---

##### `colorWithOpacity(hex: string, opacity: number)`

**What**: Creates an rgba color string with specified opacity.

**Why**: 
- Creates light backgrounds, borders, and overlays
- Used for subtle UI elements (e.g., light backgrounds, borders)
- Opacity values: 0.1 (light), 0.05 (lighter), 0.3 (border)

**How**:
```typescript
colorWithOpacity('#FF5200', 0.1) 
// Returns: 'rgba(255, 82, 0, 0.1)'
```

**Usage**: Generates `--primary-light`, `--primary-lighter`, `--primary-border` variables.

---

##### `blendWithWhite(hex: string, percentage: number)`

**What**: Blends white with a color at a given percentage.

**Why**: 
- Creates tinted backgrounds (white + X% primary color)
- Used for footer backgrounds and subtle UI sections
- Percentage of 0.1 (10%) creates a very subtle tint

**How**:
```typescript
blendWithWhite('#FF5200', 0.1) 
// Returns: 'rgb(255, 91, 25)' (white + 10% primary)
```

**Formula**: `result = white * (1 - percentage) + color * percentage`

**Usage**: Generates `--theme-primary-tint` CSS variable.

---

##### `isValidColor(color: string)`

**What**: Validates if a string is a valid color (hex or rgb).

**Why**: 
- Prevents invalid colors from breaking the theme system
- Validates API responses before applying colors
- Supports both hex (`#FF5200`) and rgb (`rgb(255, 82, 0)`) formats

**How**:
```typescript
isValidColor('#FF5200')  // Returns: true
isValidColor('invalid')   // Returns: false
```

**Usage**: Used in `generateThemeVariables` to validate colors before processing.

---

##### `generateThemeVariables(primary, secondary)`

**What**: Generates all CSS variables from primary and secondary colors.

**Why**: 
- **Single source of truth** for all theme variable generation
- Used by both server (`ThemeStyles`) and client (`StoreProvider`)
- Ensures consistency across server and client rendering

**What It Generates**:

| Variable | Value | Purpose |
|----------|-------|---------|
| `--primary` | `#FF5200` | Base primary color |
| `--theme-primary` | `#FF5200` | Theme primary (alias) |
| `--theme-primary-rgb` | `255, 82, 0` | RGB values for opacity modifiers |
| `--primary-hover` | `#F34E00` | Darkened hover state |
| `--theme-primary-hover` | `#F34E00` | Theme hover (alias) |
| `--primary-light` | `rgba(255, 82, 0, 0.1)` | 10% opacity background |
| `--primary-lighter` | `rgba(255, 82, 0, 0.05)` | 5% opacity background |
| `--primary-border` | `rgba(255, 82, 0, 0.3)` | 30% opacity border |
| `--theme-primary-tint` | `rgb(255, 91, 25)` | White + 10% primary blend |
| `--secondary` | `#FFB800` | Base secondary color |
| `--theme-secondary` | `#FFB800` | Theme secondary (alias) |

**How**:
```typescript
generateThemeVariables('#FF5200', '#FFB800')
// Returns: {
//   'primary': '#FF5200',
//   'theme-primary': '#FF5200',
//   'theme-primary-rgb': '255, 82, 0',
//   ... (all other variables)
// }
```

**Usage**: 
- Called by `ThemeStyles` (server) to generate CSS
- Called by `StoreProvider` (client) to sync variables

---

### 2. `src/components/providers/ThemeStyles.tsx` - Server Component

**Purpose**: Server component that injects theme CSS variables into HTML `<head>` before first paint.

**Why This File Exists**: 
- **Eliminates FOUC**: CSS variables available immediately when HTML is parsed
- **Server-Side**: Runs during SSR, no client JavaScript needed
- **Critical Path**: Must be in `<head>` before any stylesheets

**Key Characteristics**:
- ⚠️ **SERVER COMPONENT** - No `'use client'` directive
- No DOM access (runs on server)
- Pure function - generates CSS string from config
- Returns `<style>` tag with inline CSS

#### Code Breakdown

```typescript
export function ThemeStyles({ config }: ThemeStylesProps) {
    // Early return if no config (graceful degradation)
    if (!config?.theme) {
        return null;
    }

    // Extract colors from config
    const { primary_color: primary, secondary_color: secondary } = config.theme;
    
    // Generate all CSS variables using shared utility
    const variables = generateThemeVariables(primary, secondary);

    // Build CSS string: :root { --primary: #FF5200; --secondary: #FFB800; ... }
    const css = `:root { ${Object.entries(variables)
        .map(([key, value]) => `--${key}: ${value};`)
        .join(' ')} }`;

    // Return inline style tag (injected into <head>)
    return (
        <style
            dangerouslySetInnerHTML={{ __html: css }}
            data-theme-styles="true"
        />
    );
}
```

**Why `dangerouslySetInnerHTML`?**
- Next.js doesn't have a built-in way to inject raw CSS strings
- This is safe because we control the input (from our API)
- The `data-theme-styles` attribute helps with debugging

**Generated CSS Example**:
```css
:root { 
  --primary: #FF5200; 
  --theme-primary: #FF5200; 
  --theme-primary-rgb: 255, 82, 0; 
  --primary-hover: #F34E00; 
  --theme-primary-hover: #F34E00; 
  --primary-light: rgba(255, 82, 0, 0.1); 
  --primary-lighter: rgba(255, 82, 0, 0.05); 
  --primary-border: rgba(255, 82, 0, 0.3); 
  --theme-primary-tint: rgb(255, 91, 25); 
  --secondary: #FFB800; 
  --theme-secondary: #FFB800; 
}
```

---

### 3. `src/app/[locale]/layout.tsx` - Root Layout

**Purpose**: Orchestrates theme injection by placing `ThemeStyles` in `<head>`.

**Why This Placement Matters**: 
- `<head>` content is parsed first by browsers
- CSS variables must be available before any stylesheets load
- Position matters: `ThemeStyles` must be **before** `globals.css` import

#### Critical Section

```typescript
<head>
    {/* Critical: Theme styles must be first to prevent FOUC */}
    <ThemeStyles config={storeConfig} />
    {storeConfig && (
        <>
            <link rel="icon" href={storeConfig.store.logo_url || '/favicon.ico'} />
            <meta name="theme-color" content={storeConfig.theme.primary_color || '#FF5200'} />
        </>
    )}
</head>
```

**Why `ThemeStyles` is First**:
1. Browser parses `<head>` top-to-bottom
2. CSS variables must exist before `globals.css` references them
3. Ensures theme colors override fallback values

**Data Flow**:
```
1. Layout fetches storeConfig (server)
2. storeConfig passed to ThemeStyles
3. ThemeStyles generates CSS
4. CSS injected into <head>
5. HTML sent to browser with theme applied ✅
```

---

### 4. `src/components/providers/StoreProvider.tsx` - Client Component

**Purpose**: 
1. Provides `StoreConfig` and `Category[]` via React Context
2. Syncs theme CSS variables on client (fallback for dynamic updates)
3. Hydrates cart store from localStorage

**Why This File Still Exists**: 
- **Context Provider**: Components need access to `config` and `categories`
- **Client-Side Sync**: Handles dynamic theme changes (if config updates)
- **Optimization**: Only updates if theme actually changed

#### Key Optimizations

##### 1. Change Detection

```typescript
const prevThemeRef = useRef<string | null>(null);

// Create unique key from theme colors
const themeKey = `${primary || ''}|${secondary || ''}`;

// Skip update if theme hasn't changed
if (prevThemeRef.current === themeKey) {
    return; // Early exit - no work needed!
}
prevThemeRef.current = themeKey;
```

**Why**: 
- Server already set variables correctly
- Avoids unnecessary DOM manipulation
- Only runs if theme actually changed

##### 2. Shared Utility Usage

```typescript
// Generate all theme variables using shared utility
const variables = generateThemeVariables(primary, secondary);

// Apply all CSS variables
Object.entries(variables).forEach(([key, value]) => {
    if (value && isValidColor(value)) {
        root.style.setProperty(`--${key}`, value);
    }
});
```

**Why**: 
- Uses same logic as server (consistency)
- No code duplication
- Single source of truth

##### 3. Cleanup Function

```typescript
return () => {
    Object.keys(variables).forEach((key) => {
        root.style.removeProperty(`--${key}`);
    });
};
```

**Why**: 
- Cleans up on unmount or theme change
- Prevents memory leaks
- Ensures clean state transitions

---

### 5. `src/app/globals.css` - CSS Variable Definitions

**Purpose**: Defines CSS variable structure and fallback values.

**Why Fallbacks Exist**: 
- Safety net if server-side injection fails
- Provides default colors during development
- Ensures app doesn't break if API fails

#### Fallback Structure

```css
:root {
    /* ... other variables ... */
    
    /* Dynamic Theme Colors - Fallback values */
    --theme-primary: var(--primary, #B44734);
    --theme-secondary: var(--secondary, #FFB800);
    --theme-primary-hover: var(--primary-hover, rgba(180, 71, 52, 0.9));
    /* ... */
}
```

**How It Works**:
1. Fallback values defined in `globals.css`
2. Server injects actual values via `ThemeStyles`
3. Server values override fallbacks
4. If server fails, fallbacks ensure app still works

**Why `var(--primary, #B44734)`?**
- Uses CSS variable with fallback
- `--primary` set by server/client
- `#B44734` is ultimate fallback if variable missing

---

## How It Works

### Complete Flow (Step-by-Step)

#### 1. Server-Side Rendering (SSR)

```
User Request → Next.js Server
    ↓
Layout Component Renders
    ↓
getServerStoreConfig() fetches from API
    ↓
storeConfig received: { theme: { primary_color: '#FF5200', ... } }
    ↓
ThemeStyles component renders
    ↓
generateThemeVariables('#FF5200', '#FFB800') called
    ↓
CSS string generated: ":root { --primary: #FF5200; ... }"
    ↓
<style> tag created with CSS
    ↓
HTML sent to browser with <style> in <head>
```

#### 2. Browser First Paint

```
Browser receives HTML
    ↓
Parses <head> section
    ↓
Finds <style> tag with CSS variables
    ↓
Applies CSS variables to :root
    ↓
✅ Correct theme colors available immediately
    ↓
No FOUC - colors correct from first paint!
```

#### 3. React Hydration

```
React JavaScript loads
    ↓
React hydrates components
    ↓
StoreProvider mounts
    ↓
useLayoutEffect runs
    ↓
Checks if theme changed (optimization)
    ↓
If changed: syncs CSS variables (rarely needed)
    ↓
Theme stays consistent ✅
```

---

## Usage Guide

### For Developers: Using Theme Colors

#### In Components (Tailwind Classes)

```tsx
// Primary color text
<p className="text-theme-primary">Primary text</p>

// Primary color background
<button className="bg-theme-primary text-white">Button</button>

// Primary with opacity
<div className="bg-theme-primary/10">Light background</div>

// Primary border
<div className="border-theme-primary-border">Bordered element</div>

// Tinted background (white + 10% primary)
<footer className="bg-theme-primary-tint">Footer</footer>
```

#### In CSS Files

```css
.my-component {
    color: var(--theme-primary);
    background: var(--theme-primary-tint);
    border: 1px solid var(--primary-border);
}
```

#### Accessing Theme in JavaScript

```tsx
import { useStore } from '@/components/providers/StoreProvider';

function MyComponent() {
    const { config } = useStore();
    const primaryColor = config.theme.primary_color;
    
    return <div style={{ color: primaryColor }}>...</div>;
}
```

---

## Refactoring Guide

### Adding a New Theme Variable

#### Step 1: Update `generateThemeVariables`

```typescript
// src/lib/theme-utils.ts

export function generateThemeVariables(primary, secondary) {
    const variables = {};
    
    if (primary && isValidColor(primary)) {
        // ... existing variables ...
        
        // NEW: Add your variable
        variables['theme-primary-dark'] = darkenColor(primary, 0.2);
    }
    
    return variables;
}
```

#### Step 2: Update `globals.css` (Optional Fallback)

```css
:root {
    /* ... existing ... */
    --theme-primary-dark: var(--primary-dark, #000000);
}
```

#### Step 3: Use in Components

```tsx
<div className="bg-theme-primary-dark">...</div>
```

### Changing Color Calculation Logic

**Example**: Change hover darkening from 4% to 8%

```typescript
// src/lib/theme-utils.ts

// OLD:
const primaryHover = darkenColor(primary, 0.04);

// NEW:
const primaryHover = darkenColor(primary, 0.08);
```

**That's it!** Both server and client will use the new logic automatically.

### Adding a New Color Variant

**Example**: Add a "very light" variant (2% opacity)

```typescript
// src/lib/theme-utils.ts

export function generateThemeVariables(primary, secondary) {
    // ... existing code ...
    
    if (primary && isValidColor(primary)) {
        // ... existing variables ...
        
        // NEW: Very light variant
        variables['primary-very-light'] = colorWithOpacity(primary, 0.02);
    }
    
    return variables;
}
```

### Removing a Theme Variable

1. Remove from `generateThemeVariables` in `theme-utils.ts`
2. Remove from `globals.css` fallbacks (if exists)
3. Search codebase for usages and update components

---

## Troubleshooting

### Issue: Colors Still Flash (FOUC)

**Possible Causes**:
1. `ThemeStyles` not in `<head>` or not first
2. `globals.css` loading before theme styles
3. Browser caching old HTML

**Solutions**:
- Verify `ThemeStyles` is first in `<head>` in `layout.tsx`
- Check browser DevTools → Network → HTML response (should have `<style>` tag)
- Hard refresh (Ctrl+Shift+R) to clear cache

### Issue: Wrong Colors on First Paint

**Possible Causes**:
1. API returning invalid colors
2. `isValidColor` rejecting valid colors
3. CSS variable name mismatch

**Solutions**:
- Check API response: `storeConfig.theme.primary_color`
- Verify color format: should be hex (`#FF5200`) or rgb
- Check browser DevTools → Elements → `:root` → CSS variables

### Issue: Theme Not Updating Dynamically

**Possible Causes**:
1. `StoreProvider` optimization skipping updates
2. `config` prop not changing reference
3. React not re-rendering

**Solutions**:
- Check `prevThemeRef` logic in `StoreProvider`
- Verify `config` object reference changes when theme changes
- Add console.log to `useLayoutEffect` to debug

### Issue: Server/Client Mismatch

**Possible Causes**:
1. Different logic in server vs client
2. Caching issues
3. Build-time vs runtime differences

**Solutions**:
- Ensure both use `generateThemeVariables` from `theme-utils.ts`
- Clear Next.js cache: `.next` folder
- Verify server and client use same utility functions

---

## Best Practices

### ✅ DO

1. **Always use shared utilities**: Use `generateThemeVariables` from `theme-utils.ts`
2. **Validate colors**: Always check `isValidColor` before applying
3. **Use Tailwind classes**: Prefer `text-theme-primary` over inline styles
4. **Test with different colors**: Verify theme works with various primary/secondary colors
5. **Keep fallbacks**: Maintain fallback values in `globals.css`

### ❌ DON'T

1. **Don't duplicate color logic**: Never copy color calculation functions
2. **Don't hardcode colors**: Use CSS variables, not `#FF5200` directly
3. **Don't modify DOM directly**: Use React/CSS variables, not `document.style`
4. **Don't skip validation**: Always validate colors from API
5. **Don't remove fallbacks**: Keep safety nets in `globals.css`

---

## Performance Considerations

### Server-Side (SSR)

- **CSS Size**: ~500-800 bytes per tenant (negligible)
- **No Extra Requests**: CSS is inline in HTML
- **Cache-Friendly**: Server-rendered, cached by Next.js
- **First Paint**: Theme colors available immediately

### Client-Side (Hydration)

- **Optimization**: Only updates if theme changed (useRef check)
- **Minimal Work**: Server already set variables correctly
- **No Re-renders**: Theme sync doesn't trigger component re-renders

### Overall Impact

- ✅ **Zero FOUC**: Correct colors from first paint
- ✅ **Fast**: No blocking requests or heavy calculations
- ✅ **Efficient**: Shared utilities prevent duplication
- ✅ **Scalable**: Works for unlimited tenants

---

## Summary

This theme implementation provides a **robust, performant, and maintainable** solution for multi-tenant theming:

1. **Server-Side Injection**: `ThemeStyles` eliminates FOUC by injecting CSS before first paint
2. **Shared Utilities**: `theme-utils.ts` ensures consistency and prevents duplication
3. **Client-Side Sync**: `StoreProvider` handles dynamic updates efficiently
4. **Type Safety**: Full TypeScript support throughout
5. **Easy Maintenance**: Centralized logic makes refactoring simple

The system is **production-ready** and handles edge cases gracefully while maintaining excellent performance.

---

## Additional Resources

- **THEME_GUIDE.md**: Usage guide for developers using theme classes
- **Next.js Docs**: [Server Components](https://nextjs.org/docs/app/building-your-application/rendering/server-components)
- **CSS Variables**: [MDN Documentation](https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties)

---

**Last Updated**: Implementation completed with server-side CSS injection for zero FOUC.
