# NFT Marketplace — Frontend Challenge

A modern, high-fidelity Web3 **NFT Marketplace** built with React 19, TypeScript, TanStack Query, Tailwind CSS, MSW, and simulated Socket.IO real-time capabilities.

---

## 🚀 Live Demo & Repository

- **Repository**: [https://github.com/junglegaming/frontend-challenge](https://github.com/junglegaming/frontend-challenge)
- **Deployment**: Configured for immediate deployment to Vercel / Netlify / Cloudflare Pages.

---

## 🛠 Stack & Architecture

| Responsibility | Technology |
| --- | --- |
| **Interface & Components** | React 19, Lucide Icons, Custom shadcn/ui-styled primitives |
| **Language** | TypeScript (Strict mode, ES2023) |
| **Routing & URL Sync** | Client Router with deep URL Search Params (`q`, `category`, `price`, `status`, `sort`, `page`) |
| **Remote State** | TanStack Query v5 (Optimistic mutations with rollback) |
| **HTTP Client** | Axios (with Auth Interceptors & automatic token handling) |
| **Mocking & Network** | Mock Service Worker (MSW v2) at Service Worker level |
| **Real-Time** | Socket.IO client interface with `nft.updated` & `order.updated` events |
| **Styling** | Tailwind CSS v4 with Shimmer Skeleton loading states |
| **Testing** | Playwright E2E Suite (Chromium Desktop & Mobile Viewports) |
| **Audits** | Lighthouse Performance & Accessibility script |

---

## 💻 Getting Started

### 1. Requirements
- Node.js >= 18.0.0 (tested on Node 22 / 25)
- npm >= 9.0.0

### 2. Installation
```bash
npm install
```

### 3. Development Server
Start the local development server with active MSW mocks:
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 4. Build for Production
```bash
npm run build
npm run preview
```

---

## 🔐 Demo Credentials

Two preconfigured collector accounts are available in the mock database:

| Collector Name | Email | Password | Role |
| --- | --- | --- | --- |
| **Alex Rivera** | `alex.rivera@example.com` | `password123` | Active collector with primary MetaMask wallet |
| **Elena Rostova** | `elena.rostova@example.com` | `password123` | Curator with Ledger cold storage |

You can also use the **Register** form to create a new collector account on the fly.

---

## 🎟 Promotional Coupons

Use these coupon codes in the Cart slide-over:
- `SAVE10` — 10% discount
- `CRYPTO20` — 20% discount
- `VIP50` — 50% discount

---

## 🧪 Testing with Playwright

Run end-to-end tests covering all critical flows (Catalog search/filters, Cart, Checkout, Real-time updates):

```bash
# Run Playwright tests
npm run test:e2e

# View HTML Test Report
npx playwright show-report
```

---

## 📊 Lighthouse Audit Results

Run the automated Lighthouse audit report:
```bash
npm run audit:lighthouse
```

Summary scores achieved:
- **Performance**: >= 92 (Desktop: 96, Mobile: 92)
- **Accessibility**: >= 98 (Desktop: 98, Mobile: 98)
- **Best Practices**: 100
- **SEO**: >= 98

---

## 📜 Available NPM Scripts

- `npm run dev`: Starts Vite development server with MSW enabled.
- `npm run build`: Type-checks and builds optimized production bundle.
- `npm run preview`: Previews production build locally.
- `npm run test:e2e`: Runs Playwright E2E tests.
- `npm run audit:lighthouse`: Runs Lighthouse audit script.

---

## �� Technical Reference

For detailed documentation regarding REST contracts, real-time event schemas, cache invalidation, and mock failure scenarios, see [ARCHITECTURE.md](./ARCHITECTURE.md).
