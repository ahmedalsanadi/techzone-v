# Authentication Utilities

This directory contains authentication-related utilities, constants, and helpers.

## Structure

- `constants.ts` - Protected routes, API endpoints, storage keys, cookie names
- `storage.ts` - SessionStorage helpers for auth flow state persistence
- `cookies.ts` - Cookie management utilities for authentication
- `utils.ts` - Authentication utility functions (validation, formatting, etc.)
- `index.ts` - Centralized exports

## Usage

```typescript
import { 
    PROTECTED_ROUTES, 
    authStorage, 
    authCookies, 
    formatMaskedPhone 
} from '@/lib/auth';
```
