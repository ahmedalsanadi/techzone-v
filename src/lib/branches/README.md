# 🏪 Branch Selection System

This document provides a comprehensive overview of the branch selection flow, technical architecture, and implementation details used in the application.

## 🎯 System Overview

The Branch Selection System is a core part of the user experience. It ensures that every user is connected to a specific physical branch of the restaurant, which affects:

- **Product availability & pricing** (future scope).
- **Service availability** (Delivery, Pickup, Dine-in).
- **Contact Information**: Showing branch-specific support channels.
- **Order Fulfillment**: Determining which branch will prepare the order.

---

## 🔄 The lifecycle of a Selection

### 1. Initial Visit (Mandatory Selection)

When a user visits the site for the first time:

- The `BranchModalInitializer` checks `hasSelectedOnce` and `selectedBranchId` in the Zustand store.
- If both are missing, the `BranchSelectionModal` is automatically forced open.
- The backdrop is NOT clickable to close the modal until a selection is made, ensuring we always have a branch context.

### 2. Selection Process (Two-Step Verification)

To prevent accidental changes and provide a rich preview:

- **Preview (Temp Selection)**: Clicking a branch in the list highlights it and centers the map using `flyTo`. At this stage, the branch is "temporarily selected".
- **Confirmation**: The user must click the "Confirm" button to finalize the choice. This updates the global store and allows the modal to close.

### 3. Manual Re-selection

Users can change their branch at any time by clicking the branch name in the `SubHeader` (layout). This opens the same modal but allows closing it without changes if a branch was already selected.

---

## 📂 File Map & Responsibilities

### 🏗️ Data & Logic Layer

- `src/store/useBranchStore.ts`: **Zustand Store**. Manages persisted ID/Name and session-only full Branch object.
- `src/hooks/useBranchSelection.ts`: **Main Hook**. Orchestrates the UI state, fetching, keyboard navigation, and confirmation logic.
- `src/services/branch-service.ts`: **API Layer**. Handles `/store/branches` requests with schema validation.
- `src/lib/branches/utils.ts`: **Business Logic**. Logic for `is_open`, formatting hours, and localized status.
- `src/lib/branches/map-utils.ts`: **Geo Logic**. Coordinate generation (mocking), centering math, and distance helpers.

### 🧩 UI Layer (Modular Modal)

- `src/components/modals/BranchSelectionModal/index.tsx`: **Root Container**. Handles layout and mobile responsiveness.
- `src/components/modals/BranchSelectionModal/BranchList.tsx`: **List Orchestrator**. Manages the scrollable list and keyboard focus.
- `src/components/modals/BranchSelectionModal/BranchListItem.tsx`: **Pure UI Item**. Individual cards with premium design (glassmorphism/gradients).
- `src/components/modals/BranchSelectionModal/BranchMapContainer.tsx`: **Map Wrapper**. Bridges TanStack Query data to the Leaflet map.
- `src/components/modals/BranchMap.tsx`: **Leaflet Engine**. Interactive map with custom markers and anti-jitter `flyTo` transitions.

---

## 💾 State Management & Caching

### Zustand Store (`useBranchStore`)

| Attribute | persisted? | Purpose |
| :-- | :-- | :-- |
| `selectedBranchId` | **Yes** | The primary key for the chosen branch. |
| `selectedBranchName` | **Yes** | Stored for immediate UI display (no flicker on reload). |
| `hasSelectedOnce` | **Yes** | Flag to prevent the auto-modal from annoying returning users. |
| `selectedBranch` | **No** | Full branch object (metadata, services) for complex logic in memory. |
| `isModalOpen` | **No** | Global control for modal visibility. |

### TanStack Query (Caching & Prefetching)

- **Prefetching**: `BranchModalInitializer` starts fetching the branch list in the background as soon as the app mounts.
- **Syncing**: Even if we have a persisted ID, we fetch the full object on mount to ensure the name, status, and services are up-to-date (using `syncBranchData`).
- **Cache Duration**: Branches are cached for 1 hour (`revalidate: 3600`) at the service level and 5 minutes in the client state.

---

## 🛠️ Key Technical Features

### 🕒 Working Hours Logic

Branch status is not just a boolean from the server. The `calculateBranchIsOpen` utility:

1. Parses the current client time.
2. Checks the current day in the `working_hours` object.
3. Supports **Midnight Spans** (e.g., 10 PM - 2 AM).
4. Returns a reactive status used in both the list and the Contact page.

### 🗺️ Map Stability & Performance

- **Anti-Shake**: A `useRef` based coordinate tracker in `BranchMap.tsx` prevents the map from "vibrating" when receiving micro-updates to coordinates.
- **Modular Re-renders**: The map and list are wrapped in `React.memo`, ensuring that selecting a branch doesn't cause a heavy re-render of the entire Leaflet engine.
- **Mocking**: If a branch lacks GPS coordinates, `generateMockCoordinates` uses the ID to place it at a consistent, unique location around the city center.

### 📱 Mobile Excellence

The system detects small screens and switches to:

- A vertical stack instead of side-by-side.
- Ultra-compact branch cards (`p-2` to `p-3`).
- Scaled-down icons and fonts to prevent overlapping buttons.
- Sticky "Confirm" button for easy thumb access.

---

## 🔗 How it integrates

### **1. Contact Page (`/contact`)**

- Uses `searchParams` for `branch_id`.
- If `branch_id` is present, it fetches branch-specific social/support channels.
- If the branch doesn't exist, it gracefully fails and shows global store data via `BranchErrorHandler`.

### **2. Checkout (`/checkout`)**

- The `OrderTypeCard` displays the `selectedBranchName` directly from the store.
- Validates if a branch is selected before allowing "Pickup" or "Car Pickup" order types.

### **3. Layout & Navigation**

- `SubHeader` provides a permanent entry point to view or change the current branch.
- Displays the branch name with a building icon for visual recognition.
