# Architecture & Technical Documentation

This document describes the architectural decisions, design patterns, cache policies, real-time synchronization, and mock simulation implemented in the **NFT Marketplace**.

---

## 1. Architectural Overview & Stack

The application is structured following clean separation of concerns across presentation, state management, HTTP communication, mocking, and real-time event distribution.

- **UI & Components**: React 19 + TypeScript + Tailwind CSS (v4) with custom shadcn-aligned primitives (`Button`, `Input`, `Modal`, `Skeleton`, `ToastContainer`).
- **Client Routing & Navigation**: URL state synchronization combining pathname/hash routing with full URL search query synchronization (`q`, `category`, `minPrice`, `maxPrice`, `status`, `sort`, `page`). Survives browser reloads, back/forward history navigation, and direct deep links.
- **Remote State**: TanStack Query v5 with optimistic mutation updates and rollback mechanics.
- **HTTP Transport**: Axios instance with Bearer token injection and automatic 401 session expiration intercepts.
- **Network Mocking**: Mock Service Worker (MSW v2) intercepting HTTP requests at the Service Worker level.
- **Real-time Engine**: Socket.IO client interface with bi-directional event dispatching (`nft.updated`, `order.updated`), connection lifecycle management, and version-aware idempotency.
- **E2E & Testing**: Playwright multi-viewport testing suite (`Desktop Chrome` 1440px and `Pixel 5` 390px mobile).

---

## 2. Directory Structure

```
src/
├── components/          # UI components & Views
│   ├── ui/              # Base primitives (Button, Input, Skeleton, Modal, Toast)
│   ├── AuthView.tsx     # Login & Register forms with validation
│   ├── CartModal.tsx    # Slide-over cart with coupon & price sync
│   ├── CatalogFilters.tsx # Multi-attribute filter bar (search, category, price, sort)
│   ├── CheckoutView.tsx # Multi-step checkout with wallet connection simulation
│   ├── Footer.tsx       # Semantic dark web3 footer
│   ├── Header.tsx       # Responsive top navigation with cart badge & auth menu
│   ├── HeroSection.tsx  # Hero showcase with live featured drops
│   ├── NFTCard.tsx      # Interactive card with optimistic favorites toggle
│   ├── NFTDetailView.tsx # Full detail page with direct buy and stock display
│   ├── OrderConfirmationView.tsx # Transaction receipt snapshot
│   └── ProfileWalletsView.tsx # User settings, avatar preview & wallet management
├── context/             # Global contexts (AuthContext, ToastContext)
├── hooks/               # TanStack Query custom hooks & real-time sync listeners
├── lib/                 # Utilities, Axios instance, queryClient configuration
├── mocks/               # MSW Service Worker handlers, in-memory DB & MockSocket
├── types/               # Strict TypeScript domain interfaces
├── App.tsx              # Application shell & route coordinator
└── main.tsx             # Entrypoint initializing MSW and query providers
```

---

## 3. Real-Time Synchronization & Versioning

### Handled Real-Time Events

1. **`nft.updated`**:
   - Emitted when an NFT's price or available edition inventory changes.
   - Handled in `useRealtimeSync.ts`:
     - Compares payload version to ensure monotonic updates (ignores stale versions).
     - Updates the TanStack Query cache for both `['nfts']` lists and `['nft', id]`.
     - Displays an accessible visual toast alert when an item currently in the cart undergoes a price or availability change.
2. **`order.updated`**:
   - Emitted when a pending order transitions to `confirmed` or `rejected`.
   - Reconciles order state in query cache and notifies the user with order receipt details.

### Reconnection & Resiliency

- Upon socket reconnect, active queries are revalidated against the REST mock endpoints.
- Unsubscribes event listeners on component unmount to prevent memory leaks and duplicate handler invocations.

---

## 4. Cache Policy & Optimistic Updates

- **Default Stale Time**: 30 seconds for non-critical query lists; immediate background invalidation on mutation.
- **Optimistic Favorites**: When toggling favorites on `NFTCard` or `NFTDetailView`, the cache is immediately mutated to provide instant UI feedback ($<16\text{ms}$). In case of network rejection or 500 error, `onError` automatically rolls back the cache to the previous snapshot (`previousFavs`).
- **Cart Calculations & Precisions**:
  - All ETH values are stored and transferred as 4-decimal strings (e.g. `'1.8500'`).
  - Mathematical calculations use precision arithmetic before formatting.

---

## 5. Mock Scenarios & Failures

The MSW layer includes configurable test scenarios accessible programmatically and via tests:

| Scenario             | Trigger / Endpoint                                    | Expected Behavior                                     |
| -------------------- | ----------------------------------------------------- | ----------------------------------------------------- |
| **Normal / Success** | Default                                               | Instant/smooth responses with 100ms realistic latency |
| **Simulated 500**    | `mockDb.scenario.simulatedError = '500'`              | Returns HTTP 500 error; UI displays retry button      |
| **Network Failure**  | `mockDb.scenario.simulatedError = 'network'`          | Triggers network offline error handling               |
| **Session Expired**  | `mockDb.scenario.simulatedError = 'session_expired'`  | Invalides token, logs out user gracefully             |
| **Payment Declined** | `mockDb.scenario.simulatedError = 'payment_declined'` | Checkout halts, returns reason, retains cart          |
| **Coupon Expired**   | Any invalid code                                      | Rejects coupon apply, retains original cart totals    |
| **Reset Scenario**   | `POST /api/scenario/reset`                            | Resets all mock data to clean initial fixtures        |

---

## 6. Accessibility & Responsive Design

- **Viewport Coverage**: Fully tested across 390px (Mobile), 768px (Tablet), and 1440px (Desktop).
- **Keyboard Navigation**: Form inputs, buttons, and navigation links have visible focus rings (`focus:ring-2 ring-purple-500`).
- **Screen Reader Support**: ARIA attributes (`aria-label`, `aria-live`, `role="status"`, `role="dialog"`) on modals, cart badges, and alert toasts.
- **Shimmer Skeletons**: CSS-animated shimmer effect matches component bounding boxes to eliminate Layout Shifts (CLS $< 0.005$). Reduced motion query (`prefers-reduced-motion`) halts animation.
