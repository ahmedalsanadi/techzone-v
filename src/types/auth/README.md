# Authentication Types

This directory contains all authentication-related TypeScript types.

## Structure

- `customer.types.ts` - Customer and CustomerProfile interfaces
- `auth.types.ts` - Authentication flow types (AuthStep, AuthResponse, SendOtpResponse, etc.)
- `index.ts` - Centralized exports for all auth types

## Usage

```typescript
import type { Customer, CustomerProfile, AuthResponse, AuthStep } from '@/types/auth';
```
