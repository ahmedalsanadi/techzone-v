# Branch Utilities

This directory contains all utility functions and constants related to branches.

## Structure

- `constants.ts` - Branch types, status values, map settings, storage version
- `utils.ts` - Branch status calculation, working hours formatting
- `map-utils.ts` - Map coordinate calculations and centering
- `index.ts` - Re-exports all utilities for easy importing

## Usage

```typescript
import { 
    BRANCH_TYPES, 
    calculateBranchIsOpen, 
    formatWorkingHoursDays,
    getMapCenter 
} from '@/lib/branches';
```
