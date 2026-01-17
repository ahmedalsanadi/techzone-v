# Branch Types

This directory contains all TypeScript type definitions related to branches.

## Structure

- `branch.types.ts` - Main branch interface and related types (address, services, settings, support channels)
- `working-hours.types.ts` - Working hours related types
- `index.ts` - Re-exports all types for easy importing

## Usage

```typescript
import type { Branch, BranchWorkingHours } from '@/types/branches';
```
