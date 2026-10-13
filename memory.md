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

## Decisions made

- **Direct Frontend-to-Utils Upload**:
  - The frontend uploads the banner file directly to `Utils Service` (`POST :5002/api/upload`) and uses the resulting Cloudinary URL in the payload to `Seller Service` (`POST :5001/new`), completely eliminating double-hop base64 overhead.
- **Component Reusability**:
  - `SellerProfileView` accepts `mode: 'owner' | 'public'`, enabling reuse across both the Seller Dashboard and future customer-facing restaurant details page.

## Current state

- `frontend`: `pnpm build` passes with 0 errors.
- `services/seller`: `pnpm build` and `pnpm lint` pass with 0 errors.
- `services/utils`: `pnpm build` and `pnpm lint` pass with 0 errors.
- `services/auth`: `pnpm build` passes with 0 errors.

## Next session starts with

- Optional Google Maps API integration for location picker.
- Rider microservice and menu item features.
