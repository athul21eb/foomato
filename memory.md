# Memory — Seller & Utils Services Implementation

Last updated: 2026-10-14T01:38:00+05:30

## What was built

- **Frontend Seller Features & RTK Query (`frontend/src`)**:
  - Registered [sellerApiSlice.ts](file:///home/athul/2026_grinding/foomato/frontend/src/slices/seller/sellerApiSlice.ts) in Redux store (`sellerApi`), providing queries and mutations for:
    - `getMySeller`: `GET http://localhost:5001/seller/get-seller`
    - `createSeller`: `POST http://localhost:5001/seller/new`
    - `updateSellerStatus`: `PUT http://localhost:5001/seller/status`
    - `updateSeller`: `PUT http://localhost:5001/seller/edit`
    - `uploadImage`: `POST http://localhost:5002/api/upload` (direct Cloudinary upload via Utils service)
  - Components:
    - [seller-guard.tsx](file:///home/athul/2026_grinding/foomato/frontend/src/features/seller/components/seller-guard.tsx): Protects seller routes, restricting to authenticated users with `role === 'seller'`.
    - [seller-status-toggle.tsx](file:///home/athul/2026_grinding/foomato/frontend/src/features/seller/components/seller-status-toggle.tsx): Interactive switch to toggle store open/close state with instant UI feedback and toast.
    - [seller-profile-view.tsx](file:///home/athul/2026_grinding/foomato/frontend/src/features/seller/components/seller-profile-view.tsx): Reusable component supporting both `'owner'` and `'public'` modes. Displays hero banner, verified badges, rating, address, phone, and owner controls.
    - [seller-edit-modal.tsx](file:///home/athul/2026_grinding/foomato/frontend/src/features/seller/components/seller-edit-modal.tsx): Modal allowing sellers to update name, description, phone, address, and upload new banner photos to Cloudinary.
  - Pages & Routing:
    - [seller-dashboard-page.tsx](file:///home/athul/2026_grinding/foomato/frontend/src/pages/seller/seller-dashboard-page.tsx): Main `/seller` route. When seller is not yet created, displays a clear CTA guiding them to `/seller/new`. If created, shows `SellerProfileView`, live status toggle, and kitchen stats.
    - [add-seller-page.tsx](file:///home/athul/2026_grinding/foomato/frontend/src/pages/seller/add-seller-page.tsx): Dedicated `/seller/new` onboarding page with image upload to Cloudinary (Utils: 5002) and registration via Seller service (5001).
    - [navbar.tsx](file:///home/athul/2026_grinding/foomato/frontend/src/components/common/navbar.tsx): Added "My Store" link in header for seller role.

- **Utils Microservice (`services/utils`)**:
  - Initialized NestJS 11 microservice running on **Port 5002**.
  - Infrastructure: [cloudinary.service.ts](file:///home/athul/2026_grinding/foomato/services/utils/src/lib/cloudinary/cloudinary.service.ts), [cloudinary.module.ts](file:///home/athul/2026_grinding/foomato/services/utils/src/lib/cloudinary/cloudinary.module.ts)
  - Features: [upload.controller.ts](file:///home/athul/2026_grinding/foomato/services/utils/src/module/upload/upload.controller.ts), [upload.service.ts](file:///home/athul/2026_grinding/foomato/services/utils/src/module/upload/upload.service.ts)

- **Seller Microservice (`services/seller`) Cleanup**:
  - Removed `datauri` dependency. Cleaned [seller.controller.ts](file:///home/athul/2026_grinding/foomato/services/seller/src/module/seller/seller.controller.ts) and [seller.service.ts](file:///home/athul/2026_grinding/foomato/services/seller/src/module/seller/seller.service.ts).

- **Frontend Seller Dashboard & Navigation Overhaul (`frontend/src`)**:
  - Removed "Store Dashboard" redundant navigation button from [navbar.tsx](file:///home/athul/2026_grinding/foomato/frontend/src/components/common/navbar.tsx).
  - Transformed [seller-dashboard-page.tsx](file:///home/athul/2026_grinding/foomato/frontend/src/pages/seller/seller-dashboard-page.tsx) into a responsive Left-Tabs / Right-Children layout:
    - **Left sidebar**: Restaurant identity summary, vertical tab navigation (`Store Profile`, `Menu Items`, `Live Orders`), and Kitchen Performance summary.
    - **Right pane**: Dynamic view displaying active tab content with smooth transitions.
    - **Mobile view**: Horizontal scrollable tab pills for smaller viewports.
  - Created [seller-menu-tab.tsx](file:///home/athul/2026_grinding/foomato/frontend/src/features/seller/components/seller-menu-tab.tsx):
    - Full menu dish catalog with category filters, live search, veg/non-veg tags, in-stock / out-of-stock toggling, and dish deletion.
    - "Add New Menu Item" modal dialog with inputs for dish title, category, price, veg toggle, description, and dish image.
  - Created [seller-orders-tab.tsx](file:///home/athul/2026_grinding/foomato/frontend/src/features/seller/components/seller-orders-tab.tsx):
    - Live order status workflow with filters: *All Orders*, *Incoming / Action Required*, *In Kitchen*, *Ready for Rider*, and *Fulfilled*.
    - Interactive order cards with customer address, dish breakdown, itemized notes, payment badges, and one-click status transitions.
  - Fixed Google Maps integration in [location-modal.tsx](file:///home/athul/2026_grinding/foomato/frontend/src/components/ui/location-modal.tsx) using singleton script loader [google-maps-loader.ts](file:///home/athul/2026_grinding/foomato/frontend/src/lib/google-maps-loader.ts), migrating to `AdvancedMarkerElement` and fixing postal code / location search.
  - Added `scrollbar-gutter: stable;` to [index.css](file:///home/athul/2026_grinding/foomato/frontend/src/index.css) to eliminate layout shifting on modal/toggle open.

- **Seller Profile & Dashboard Refinements**:
  - **No Unnecessary Server Calls**: [seller-edit-modal.tsx](file:///home/athul/2026_grinding/foomato/frontend/src/features/seller/components/seller-edit-modal.tsx) checks whether any fields (`name`, `description`, `phone`, `formattedAddress`, `image`, `coordinates`) were actually changed; if identical, informs user with a toast and exits early without querying Cloudinary or the backend.
  - **Compact Toast Design**: Resized sonner toast notifications in [toast-context.tsx](file:///home/athul/2026_grinding/foomato/frontend/src/context/toast-context.tsx) and [index.css](file:///home/athul/2026_grinding/foomato/frontend/src/index.css) to ~half size (220px max-width, compact padding, 11.5px typography).
  - **Fixed Left Sidebar & Centered Right Scroll**: In [seller-dashboard-page.tsx](file:///home/athul/2026_grinding/foomato/frontend/src/pages/seller/seller-dashboard-page.tsx), locked the left sidebar permanently with fixed width (`w-64 lg:w-72 shrink-0`), making only the right side container scrollable (`md:overflow-y-auto`) and centering its content (`max-w-4xl mx-auto`), eliminating all layout jumping on tab switches.
  - **Premium Mobile Navigation Layout**: Redesigned mobile view (`< md`) in [seller-dashboard-page.tsx](file:///home/athul/2026_grinding/foomato/frontend/src/pages/seller/seller-dashboard-page.tsx) with a compact restaurant identity strip (photo, verified badge, open/closed status, and direct Edit button) and a balanced 3-column segmented switcher (`Profile`, `Menu`, `Orders`) that fits seamlessly across all phone viewports without horizontal scrolling.
  - **Categories Removed**: Cleaned out categories from [seller-menu-tab.tsx](file:///home/athul/2026_grinding/foomato/frontend/src/features/seller/components/seller-menu-tab.tsx) — removed category filter pills, form selector, and card chips.
  - **Delete Dish Confirmation Modal**: Replaced immediate deletion with a custom confirmation dialog in [seller-menu-tab.tsx](file:///home/athul/2026_grinding/foomato/frontend/src/features/seller/components/seller-menu-tab.tsx).
  - **Pagination**: Implemented pagination on both [seller-menu-tab.tsx](file:///home/athul/2026_grinding/foomato/frontend/src/features/seller/components/seller-menu-tab.tsx) and [seller-orders-tab.tsx](file:///home/athul/2026_grinding/foomato/frontend/src/features/seller/components/seller-orders-tab.tsx).
  - **Sleek Custom Scrollbar**: Added `.custom-scrollbar` utility in [index.css](file:///home/athul/2026_grinding/foomato/frontend/src/index.css) (slim 6px width, transparent track, rounded thumb, subtle hover color) applied to the right container in [seller-dashboard-page.tsx](file:///home/athul/2026_grinding/foomato/frontend/src/pages/seller/seller-dashboard-page.tsx).
  - **Dish Photo Upload & Form Validation**: Updated "Add Menu Item" in [seller-menu-tab.tsx](file:///home/athul/2026_grinding/foomato/frontend/src/features/seller/components/seller-menu-tab.tsx) with a dashed drag-and-drop file upload zone, image preview with hover replacement, 5MB file validation, direct Cloudinary upload via Utils service, and inline field error indicators identical to the restaurant creation form.
  - **Zero-Scroll 2-Column Menu Modal**: Redesigned the "Add New Menu Item" modal in [seller-menu-tab.tsx](file:///home/athul/2026_grinding/foomato/frontend/src/features/seller/components/seller-menu-tab.tsx) with a responsive 2-column layout (`md:grid-cols-2`, `md:max-w-3xl lg:max-w-4xl`). Separated the photo dropzone and veg/non-veg toggle on the left with dish details on the right, keeping height compact (~380px–420px) to completely eliminate vertical scrollbars on mid+ screens while remaining fully scroll-safe on small viewports.
  - **Full React Hook Form + Zod Standardization Across All Forms**:
    - [seller-edit-modal.tsx](file:///home/athul/2026_grinding/foomato/frontend/src/features/seller/components/seller-edit-modal.tsx): Powered by `useForm<UpdateSellerFormValues>({ resolver: zodResolver(updateSellerSchema) })`.
    - [seller-menu-tab.tsx](file:///home/athul/2026_grinding/foomato/frontend/src/features/seller/components/seller-menu-tab.tsx): Powered by `useForm<MenuItemFormValues>({ resolver: zodResolver(menuItemSchema) })`. Converted `watch` to `useWatch` and replaced `Date.now()` with `crypto.randomUUID()` for React Compiler purity.
    - [add-seller-page.tsx](file:///home/athul/2026_grinding/foomato/frontend/src/pages/seller/add-seller-page.tsx): Migrated to `useForm<CreateSellerFormValues>({ resolver: zodResolver(createSellerSchema) })`. Converted `watch` to `useWatch` to eliminate React Compiler `incompatible-library` warnings.
    - [account-page.tsx](file:///home/athul/2026_grinding/foomato/frontend/src/pages/customer/account-page.tsx): Migrated "Add Delivery Location" address form from manual `useState` to `useForm<DeliveryAddressFormValues>` with `deliveryAddressSchema`, supporting automatic fill via `LocationModal` through `setValue`.
    - [customer.schema.ts](file:///home/athul/2026_grinding/foomato/frontend/src/features/customer/schemas/customer.schema.ts): Created Zod schema `deliveryAddressSchema` for customer delivery addresses.
    - [seller.schema.ts](file:///home/athul/2026_grinding/foomato/frontend/src/features/seller/schemas/seller.schema.ts): Single source of truth for `createSellerSchema`, `updateSellerSchema`, and `menuItemSchema`.
  - **Duplicate Toast Fix**: Resolved double toast notification in [seller-menu-tab.tsx](file:///home/athul/2026_grinding/foomato/frontend/src/features/seller/components/seller-menu-tab.tsx) caused by side effects executing inside React 18/19 StrictMode functional state updaters. Moved toast triggers outside `setItems` and added Sonner toast ID deduplication (`id: 'item-stock-${id}'`).
  - **Phone Validation & Type Coercion**: Resolved the `"Expected string, received number"` error in [seller-edit-modal.tsx](file:///home/athul/2026_grinding/foomato/frontend/src/features/seller/components/seller-edit-modal.tsx) by updating [seller.schema.ts](file:///home/athul/2026_grinding/foomato/frontend/src/features/seller/schemas/seller.schema.ts) with `z.coerce.string()`, safely coercing numeric MongoDB phone values into strings for React Hook Form + Zod validation.

- **Toast Position & Close Button Polish (`frontend/src`)**:
  - Configured Sonner toast notifications in [toast-context.tsx](file:///home/athul/2026_grinding/foomato/frontend/src/context/toast-context.tsx) to appear at `top-center`.
  - Fixed the toast close button `[x]` in [index.css](file:///home/athul/2026_grinding/foomato/frontend/src/index.css) with `left: auto !important; right: 6px !important; top: 6px !important;`, overriding Sonner's default LTR start position so it pins cleanly to the top-right corner with 24px right padding on the toast.

- **Footer Removal for Seller and Rider Portals (`frontend/src`)**:
  - Removed `SellerFooter` and `RiderFooter` from [footer.tsx](file:///home/athul/2026_grinding/foomato/frontend/src/components/common/footer.tsx).
  - Updated `Footer` component to return `null` when the authenticated user's role is `'seller'` or `'rider'`, or when navigating within `/seller` or `/rider` routes, providing an uninterrupted full-height workspace for management and operations portals while keeping the standard `CustomerFooter` for consumer routes.

## Decisions made

- **Direct Frontend-to-Utils Upload**:
  - The frontend uploads the banner file directly to `Utils Service` (`POST :5002/api/upload`) and uses the resulting Cloudinary URL in the payload to `Seller Service` (`POST :5001/new`), completely eliminating double-hop base64 overhead.
- **Component Reusability**:
  - `SellerProfileView` accepts `mode: 'owner' | 'public'`, enabling reuse across both the Seller Dashboard and future customer-facing seller details page.
- **Sidebar-driven Seller Hub & Full-Height Portals**:
  - Fixed-width permanent sidebar paired with centered, independently-scrolled right viewport ensures rock-solid stability and zero jumping when switching tabs. Footers are completely omitted for operational roles (seller/rider) to maximize viewport space.

## Current state

- `frontend`: `pnpm run build` (`tsc -b && vite build`) and `pnpm lint` pass with 0 errors.
- `services/seller`: `pnpm build` and `pnpm lint` pass with 0 errors.
- `services/utils`: `pnpm build` and `pnpm lint` pass with 0 errors.
- `services/auth`: `pnpm build` passes with 0 errors.

## Next session starts with

- Connect `SellerMenuTab` with backend seller menu item endpoints when created in `services/seller`.
- Order management backend microservice and real-time WebSocket order events.


