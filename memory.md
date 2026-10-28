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
    - Live order status workflow with filters: _All Orders_, _Incoming / Action Required_, _In Kitchen_, _Ready for Rider_, and _Fulfilled_.
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

- **Payment Module & gRPC Inter-Service Communication (`services/utils` & `services/seller`)**:
  - **Shared Protobuf Schema (`proto/order.proto`)**:
    - Created contract defining `OrderService.GetOrderForPayment` RPC with `GetOrderForPaymentRequest` and `GetOrderForPaymentResponse`.
    - Integrated proto copying in `nest-cli.json` across `services/seller` and `services/utils`.
  - **Hybrid Microservice Setup in Seller (`services/seller`)**:
    - Implemented `@GrpcMethod('OrderService', 'GetOrderForPayment')` in `OrderController` delegating to `orderService.fetchOrderForPayment(id)` (replacing the previous HTTP REST endpoint and removing `InternalKeyGuard`).
    - Added resilient `RabbitmqModule` and `RabbitmqService` in `services/seller/src/lib/rabbitmq/`.
    - Implemented `PaymentSuccessConsumer` listening to `PAYMENT_QUEUE` to automatically update order `paymentStatus: 'paid'` and clear expiration TTL upon payment success.
  - **Payment Infrastructure & Feature Module in Utils (`services/utils`)**:
    - Created `StripeModule` and `StripeService` under `services/utils/src/lib/stripe/` using the official Stripe SDK.
    - Implemented `PaymentModule` with gRPC client injection (`ORDER_GRPC_PACKAGE`), connecting to Seller on `localhost:50051`.
    - Created DTOs with `class-validator`: `CreateRazorpayOrderDto`, `VerifyRazorpayDto`, `PayWithStripeDto`, `VerifyStripeDto`.
    - Implemented `PaymentController` with `/api/v1/payment/*` endpoints:
      - `POST /api/v1/payment/razorpay/order`: Synchronously pre-checks order via gRPC, creates Razorpay order, returns order ID and public key.
      - `POST /api/v1/payment/razorpay/verify`: Verifies HMAC SHA-256 signature and publishes `PAYMENT_SUCCESS` event to RabbitMQ.
      - `POST /api/v1/payment/stripe/pay`: Synchronously pre-checks order via gRPC, generates Stripe Checkout session with frontend redirect URLs.
      - `POST /api/v1/payment/stripe/verify`: Verifies Stripe checkout session status and publishes `PAYMENT_SUCCESS` event to RabbitMQ.
    - **Industrial gRPC Microservice Contract Architecture**:
      - Standardized on Google Protobuf + idiomatic NestJS contract design: Protobuf definitions use standard `snake_case` (`string order_id = 1;`), while TypeScript microservice code uses strict `camelCase` DTOs/interfaces (`orderId: string`).
      - In `services/seller`: Defined `GetOrderForPaymentDto` (`dto/get-order-for-payment.dto.ts`) with `class-validator` decorators and `GetOrderForPaymentResponse` (`interfaces/order-grpc.interface.ts`). Implemented strict `@GrpcMethod('OrderService', 'GetOrderForPayment')` throwing standard `RpcException`.
      - In `services/utils`: Defined `GetOrderForPaymentRequest` and `GetOrderForPaymentResponse` with `OrderGrpcService` interface (`interfaces/order-grpc.interface.ts`). Simplified `fetchOrderViaGrpc` to strictly typed unary calls with zero defensive dual-casing hacks.
      - Removed custom loader options to leverage NestJS's default, robust `@grpc/proto-loader` `camelCase` wire mapping.

- **Industrial Logging & Distributed Tracing Architecture (`services/*` & `frontend`)**:
  - **Security & Hygiene**: Eliminated token leak in `auth.controller.ts` (`console.log(result.accessToken...)`). Removed noisy `console.error` calls in frontend Redux RTK Query slices.
  - **Async Context Propagation (`request-context.ts`)**: Built `RequestContext` using Node's `AsyncLocalStorage` across `services/auth`, `services/seller`, and `services/utils` (`src/common/context/request-context.ts`).
  - **Global Request Tracing (`LoggingInterceptor`)**: Implemented in `src/common/interceptors/logging.interceptor.ts`. Wraps requests in `RequestContext.run({ correlationId })`, attaches `x-correlation-id` to response headers, and logs duration, status code, method, path, and IP.
  - **Enterprise Logger (`AppLoggerService`)**: Implemented in `src/common/logger/app-logger.service.ts` extending NestJS `ConsoleLogger`. Automatically extracts `correlationId` from `RequestContext` to prefix logs in development (`[a1b2c3d4] [Context] ...`) and emits structured NDJSON in production (`NODE_ENV === 'production'`). Attached globally in each service's `main.ts` via `app.useLogger(logger)`.
  - **Domain Business Logs**: Instrumented key lifecycle events with entity IDs across `OrderService`, `OrderController`, `SellerService`, `MenuItemService`, `AuthController`, `AuthService`, `PaymentController`, `PaymentService`, and `UploadService`.

- **Responsive Order Success & Celebration Experience (`frontend/src`)**:
  - Redesigned [order-success-page.tsx](file:///home/athul/2026_grinding/foomato/frontend/src/pages/customer/order-success-page.tsx) with a responsive layout across mobile (< 640px), tablet (640px - 1023px), and desktop (1024px+).
  - Built [confetti-canvas.tsx](file:///home/athul/2026_grinding/foomato/frontend/src/features/checkout/components/confetti-canvas.tsx): Lightweight, zero-dependency HTML5 celebratory confetti burst running at 60fps that cleans itself up after 3.8s.
  - Features:
    - **Celebration Hero**: Multi-ring emerald success emblem, glowing ambient backdrop, and 1-click Order ID copy button with toast feedback.
    - **Estimated Delivery & Kitchen**: Arrival time counter (30-45 mins), kitchen name with store link.
    - **Delivery Route & Security**: Source to drop-off address card, phone contact, and 100% contactless sealed delivery guarantee.
    - **Sticky Receipt & Invoice**: Itemized dishes list with quantity pills, financial breakdown (Subtotal, Delivery Fee with FREE badge, Platform Fee, Total Paid with payment gateway indicator), and clean browser print support (`window.print()`).
    - **Responsive Actions**: Mobile full-width touch buttons and desktop side-by-side layout linking to `/account` and `/`.

- **Cart Preservation & Payment Failure Resilience (`services/seller` & `frontend`)**:
  - **Cart Preservation on `createOrder`**: Removed premature `cartService.clearCart(userId)` from `OrderService.createOrder`. The cart is only cleared in `updatePaymentStatus(id, 'paid')` when payment is verified, preventing cart loss on failed/cancelled checkout attempts.
  - **Payment Failure Page ([payment-failed-page.tsx](file:///home/athul/2026_grinding/foomato/frontend/src/pages/customer/payment-failed-page.tsx))**: Reassuring, responsive page providing reason callouts, reference ID, active cart item counters, "Retry Payment" (`/checkout`), and "Review Cart" (`/cart`).
  - **Gateway Failure Handling**:
    - Registered `rzp.on('payment.failed', ...)` in [checkout-page.tsx](file:///home/athul/2026_grinding/foomato/frontend/src/pages/customer/checkout-page.tsx) to capture Razorpay decline reasons and navigate to `/payment-failed`.
    - Removed premature `clearLocalCart()` before Stripe redirect.
    - Updated Stripe `cancelUrl` in `services/utils` to redirect to `/payment-failed?orderId=...&reason=...`.

- **Realtime Microservice (`services/realtime`)**:
  - NestJS 11 hybrid microservice running on **Port 5004** (HTTP/WS Socket.IO) and **Port 50054** (gRPC `proto/realtime.proto`).
  - Strict JWT handshake validation in [realtime.gateway.ts](file:///home/athul/2026_grinding/foomato/services/realtime/src/module/realtime/realtime.gateway.ts) auto-joining `user:${userId}`, `seller:${sellerId}`.
  - Exposes gRPC methods: `EmitToRoom`, `EmitToUser`, `EmitToSeller` via [realtime.controller.ts](file:///home/athul/2026_grinding/foomato/services/realtime/src/module/realtime/realtime.controller.ts).
  - Global `AppLoggerService`, `LoggingInterceptor`, `RequestContext`, and typed catch blocks.

- **Seller Microservice Orders & Kitchen FSM (`services/seller`)**:
  - Global [realtime-emitter.service.ts](file:///home/athul/2026_grinding/foomato/services/seller/src/lib/realtime-grpc/realtime-emitter.service.ts) integrated via gRPC client pointing to `localhost:50054`.
  - [payment-success.consumer.ts](file:///home/athul/2026_grinding/foomato/services/seller/src/module/order/consumers/payment-success.consumer.ts) emits `order:new` to `sellerId` on payment fulfillment.
  - Added `reason` field to [order.entity.ts](file:///home/athul/2026_grinding/foomato/services/seller/src/module/order/domain/order.entity.ts) and [order.schema.ts](file:///home/athul/2026_grinding/foomato/services/seller/src/module/order/repositories/mongoose/order.schema.ts).
  - [order.service.ts](file:///home/athul/2026_grinding/foomato/services/seller/src/module/order/order.service.ts) and [order.controller.ts](file:///home/athul/2026_grinding/foomato/services/seller/src/module/order/order.controller.ts) expose:
    - `GET /api/v1/order/seller` with `page`, `limit`, and `status` pagination.
    - `PATCH /api/v1/order/:id/status` with Kitchen FSM transitions (`CONFIRMED`, `PREPARING`, `READY_FOR_PICKUP`, `OUT_FOR_DELIVERY`, `DELIVERED`, `CANCELLED`) and decline reasons. Emits customer updates via `emitToUser`.

- **Frontend Seller Orders & Audio Notification (`frontend/src`)**:
  - Installed `socket.io-client` with `VITE_REALTIME_WS_URL=http://localhost:5004`.
  - Added `useGetSellerOrdersQuery` and `useUpdateOrderStatusMutation` with `SellerOrders` cache tags to [orderApiSlice.ts](file:///home/athul/2026_grinding/foomato/frontend/src/slices/order/orderApiSlice.ts).
  - Implemented [use-seller-socket.ts](file:///home/athul/2026_grinding/foomato/frontend/src/features/seller/hooks/use-seller-socket.ts):
    - Connects to Socket.IO gateway with Bearer JWT auth.
    - Listens to `order:new`, invalidates RTK Query `SellerOrders` tag for instant refresh, toasts alert.
    - Plays audio chime from `/notifications/seller.mp3` with mute/unmute state persisted in `localStorage`.
  - Upgraded [seller-orders-tab.tsx](file:///home/athul/2026_grinding/foomato/frontend/src/features/seller/components/seller-orders-tab.tsx):
    - Redesigned status navigation into an elevated, segmented control bar with clean fit allocation and responsive scrolling.
    - Added real-time order counts directly inside each tab (`All Orders (1)`, `Incoming Orders (0)`, `Accepted (1)`, `In Kitchen (0)`, `Ready for Pickup (0)`, `Completed (0)`, `Cancelled (0)`).
    - Renamed "Incoming Tickets" -> "Incoming Orders" and "Accepted Ticket" -> "Accepted Order" throughout the dashboard.
    - Integrated `motion/react` and `AnimatePresence` for smooth spring list layout animations, entry/exit transitions, and micro-hover cards.
    - Added pulsing amber alert indicator on "Incoming Orders" tab when orders are waiting to be accepted.
    - Bell icon notification toggle (Sound On/Muted) with instant audio pre-warming and test chime.
    - Kitchen FSM action buttons (Accept Order, Start Preparing, Ready for Rider, Handover, Decline modal with reason input).

- **Order Ready Dispatch & Realtime Rider Matching (`services/seller` & `services/rider`)**:
  - **Seller Service (`services/seller`) Event Publishing**:
    - Refactored [order.service.ts](file:///home/athul/2026_grinding/foomato/services/seller/src/module/order/order.service.ts) to publish `ORDER_READY_FOR_RIDER` events to RabbitMQ `ORDER_READY_QUEUE` on `OrderStatus.READY_FOR_RIDER` transitions.
    - Employs constructor injection (`RabbitmqService`, `ConfigService`), `this.configService.getOrThrow`, and distributed tracing (`RequestContext.getCorrelationId()`).
    - Enriched event payload includes: `orderId`, `orderNumber`, `restaurantId`, `restaurantName`, `location` (pickup coordinates/address), `dropoffLocation` (customer coordinates/address), `riderAmount`, and `totalAmount`.
  - **Rider Service (`services/rider`) Consumer & Infrastructure**:
    - Created durable, retry-resilient [rabbitmq.service.ts](file:///home/athul/2026_grinding/foomato/services/rider/src/lib/rabbitmq/rabbitmq.service.ts) and `@Global()` [rabbitmq.module.ts](file:///home/athul/2026_grinding/foomato/services/rider/src/lib/rabbitmq/rabbitmq.module.ts).
    - Created high-performance binary gRPC client [realtime-emitter.service.ts](file:///home/athul/2026_grinding/foomato/services/rider/src/lib/realtime-grpc/realtime-emitter.service.ts) and `@Global()` [realtime.module.ts](file:///home/athul/2026_grinding/foomato/services/rider/src/lib/realtime-grpc/realtime.module.ts) using `proto/realtime.proto` (Port 50054).
    - Extended [rider.repository.interface.ts](file:///home/athul/2026_grinding/foomato/services/rider/src/module/rider/interfaces/rider.repository.interface.ts) and [mongoose-rider.repository.ts](file:///home/athul/2026_grinding/foomato/services/rider/src/module/rider/repositories/mongoose/mongoose-rider.repository.ts) with `findNearbyAvailable(coordinates, maxDistanceMeters = 5000)` using MongoDB `2dsphere` geospatial `$near` queries.
    - Implemented [order-ready.consumer.ts](file:///home/athul/2026_grinding/foomato/services/rider/src/module/rider/consumers/order-ready.consumer.ts) listening on `ORDER_READY_QUEUE`:
      - Dispatches `order:available` notifications via gRPC to all nearby verified & available riders (`user:${rider.userId}`).
      - Replaced legacy HTTP `axios` calls with non-blocking gRPC streaming over port 50054.
      - Full industrial logging with correlation ID propagation.
  - **Realtime Service Gateway Hardening (`services/realtime`)**:
    - Sealed [realtime.gateway.ts](file:///home/athul/2026_grinding/foomato/services/realtime/src/module/realtime/realtime.gateway.ts) against unauthorized room access, ensuring only users with `role === 'seller'` can bind to `seller:*` and `restaurant:*` rooms.
    - Disallowed joining private identity rooms via generic `join:room`.

## Decisions made

- **Direct Frontend-to-Utils Upload**:
  - The frontend uploads the banner file directly to `Utils Service` (`POST :5002/api/upload`) and uses the resulting Cloudinary URL in the payload to `Seller Service` (`POST :5001/new`), completely eliminating double-hop base64 overhead.
- **Component Reusability**:
  - `SellerProfileView` accepts `mode: 'owner' | 'public'`, enabling reuse across both the Seller Dashboard and future customer-facing seller details page.
- **Animation Standard (Strict Architecture Rule)**:
  - Never use raw `motion.div` directly in pages or feature components.
  - All motion behaviors must be derived and exported as semantic wrapper components from [`frontend/src/lib/animations.tsx`](file:///home/athul/2026_grinding/foomato/frontend/src/lib/animations.tsx) (e.g. `AnimatedOrderList`, `AnimatedOrderCard`, `FadeInUp`, `ScaleIn`, `StaggerContainer`).
- **Sidebar-driven Seller Hub & Full-Height Portals**:
  - Fixed-width permanent sidebar paired with centered, independently-scrolled right viewport ensures rock-solid stability and zero jumping when switching tabs. Footers are completely omitted for operational roles (seller/rider) to maximize viewport space.
- **Human-Facing Order Number Standardization (`orderNumber` vs `orderId`)**:
  - `orderId` (MongoDB `_id`) is strictly internal (DB foreign keys, indexes, gRPC, and REST path parameters).
  - `orderNumber` (e.g. `FOO-4982739182`) is the sole human-facing identifier displayed across Seller, Customer, and Rider UIs, notification toasts, and receipts.
  - `payment-success.consumer.ts` emits `orderNumber`, `totalAmount`, and `itemsCount` over gRPC to the realtime microservice on payment completion.
  - `mongoose-order.repository.ts` guarantees `orderNumber` presence, defaulting legacy records to a formatted ID string.
  - Frontend `use-seller-socket.ts` and `seller-orders-tab.tsx` display `orderNumber` directly with zero raw MongoDB ID exposure.
- **gRPC for Internal Synchronous Pre-checks & Realtime Emissions**:
  - Synchronous order amount queries between `Utils` and `Seller` use gRPC over HTTP/2 with binary Protobuf serialization on port 50051.
  - Inter-service push emissions from `Seller` and `Rider` to `Realtime` microservice use gRPC binary streaming on port 50054 (`proto/realtime.proto`), with dedicated RPCs: `EmitToRoom`, `EmitToUser`, `EmitToSeller`, and `EmitToRider`.
- **RabbitMQ for Asynchronous Payment Fulfillment & Rider Dispatch**:
  - Payment success verification publishes durable events to RabbitMQ `PAYMENT_QUEUE`.
  - Order packing completion (`ready_for_rider`) publishes durable events to RabbitMQ `ORDER_READY_QUEUE` for decentralized courier matching.
- **Fail-Fast Configuration with `getOrThrow`**:
  - Standardized on `this.configService.getOrThrow<Type>('VAR_NAME')` across all services to guarantee that missing environment variables cause immediate startup failure instead of subtle runtime bugs. Documented in `AGENTS.md`.
- **Industrial Logging & Zero-Secret Policy**:
  - Standardized in `AGENTS.md`: Every controller/service/consumer must use `new Logger(ClassName.name)`. Catch blocks type `catch (error: unknown)` with `instanceof Error` narrowing. Correlation IDs are managed via `AsyncLocalStorage` and never leak credentials or tokens.
- **Single Canonical Route Architecture**:
  - Eliminated all route aliases and array paths across all microservices (`auth`, `seller`, `utils`, `realtime`, `rider`). Standardized on single, unambiguous RESTful routes. Codified in `AGENTS.md`.

## Current state

- `frontend`: `pnpm run build` (`tsc -b && vite build`) passes with 0 errors.
- `services/seller`: `pnpm build` passes with 0 errors (HTTP :5001, gRPC :50051, Realtime gRPC Client :50054, RabbitMQ publisher & consumer, AppLoggerService active).
- `services/rider`: `pnpm build` passes with 0 errors (HTTP :5003, Realtime gRPC Client :50054, RabbitMQ consumer `OrderReadyConsumer`, geospatial `$near` queries, AppLoggerService active).
- `services/realtime`: `pnpm build` passes with 0 errors (HTTP/WS :5004, gRPC Server :50054, Socket.IO Gateway active, protected rooms).
- `services/utils`: `pnpm build` passes with 0 errors (HTTP :5002, gRPC client, Razorpay + Stripe + RabbitMQ publisher, AppLoggerService active).
- `services/auth`: `pnpm build` passes with 0 errors (HTTP :5000, AppLoggerService active, zero token leaks).

## Next session starts with

- Customer live order tracking screen and Rider portal live order acceptance matching the new `order:available` socket event.
