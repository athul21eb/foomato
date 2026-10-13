# foomatoo frontend and backend microservices



## Role

You are a senior NestJS developer. Always apply NestJS-first
patterns and architecture decisions, not generic Node.js approaches.

## Code standards

---frontend

refer this for redux toolkit
https://github.com/athul21eb/E-COMMERCE-PROJECT-FRONTEND.

frontend/src/
├── app/                        # App initialization, Providers & Router
│   ├── router.tsx              # React Router setup & route definitions
│   └── providers.tsx           # Global Providers (Auth, Theme, Toast, QueryClient)
│
├── assets/                     # Static media (logos, svgs, illustrations)
│
├── components/                 # Global, reusable UI components (dumb/presentational)
│   ├── ui/                     # Primitives (Button, Input, Card, Modal, Spinner)
│   ├── feedback/               # Toast, Alert, Skeleton
│   └── common/                 # Header, Footer, ThemeToggle
│
├── context/                    # App-wide global state
│   ├── auth-context.tsx        # User session, JWT tokens, logout
│   └── theme-context.tsx       # Dark / Light mode state
│
├── features/                   # 🚀 Core Business Domains (Vertical Slices)
│   ├── auth/                   # Authentication feature
│   │   ├── api/                # API calls (googleLogin, updateRole, refreshToken)
│   │   ├── components/         # Feature-specific UI (GoogleLoginBtn, RoleSelectModal)
│   │   ├── hooks/              # Custom hooks (useAuth, useRole)
│   │   └── types/              # Feature types (AuthUser, Role, AuthResponse)
│   │
│   ├── restaurant/             # (Future: Restaurant listing, menus)
│   │   ├── api/
│   │   ├── components/
│   │   └── types/
│   │
│   └── orders/                 # (Future: Cart, checkout, tracking)
│
├── layouts/                    # Layout shells wrapping pages
│   ├── root-layout.tsx         # Navbar + ThemeToggle + <Outlet /> + Footer
│   └── auth-layout.tsx         # Centered card layout for login/onboarding
│
├── pages/                      # Page components (Route targets only - lean & clean)
│   ├── home-page.tsx
│   ├── login-page.tsx
│   ├── select-role-page.tsx
│   ├── not-found-page.tsx      # 404 Error page
│   └── error-page.tsx          # General fallback / ErrorBoundary page
│
├── lib/                        # Third-party client instances & utilities
│   ├── api-client.ts           # Axios / fetch instance with JWT interceptors
│   └── utils.ts                # Tailwind merge (clsx / twMerge) & helpers
│
└── types/                      # Global cross-cutting TypeScript definitions
    └── api.ts                  # Standard ApiResponse<T> interface



---Backend

src/
└── cats/
    ├── domain/
    │   └── cat.entity.ts          👈 the plain domain type lives here
    │
    ├── interfaces/
    │   └── cats.repository.interface.ts
    │
    ├── repositories/
    │   ├── mongoose/
    │   │   ├── cat.schema.ts       👈 Mongoose-specific schema/Document
    │   │   └── mongoose-cats.repository.ts
    │   └── prisma/
    │       └── prisma-cats.repository.ts
    │
    ├── dto/
    │   ├── create-cat.dto.ts
    │   └── update-cat.dto.ts
    │
    ├── cats.controller.ts
    ├── cats.service.ts
    └── cats.module.ts
 - use pnpm
- Never instantiate services directly (no `new PrismaClient()`,
  no `new SomeService()`) — always use constructor injection
- Every infrastructure integration gets its own module and service:
  src/lib/database/prisma.module.ts + prisma.service.ts
  src/lib/mail/mail.module.ts + mail.service.ts
- Mark infrastructure modules @Global() and import once in AppModule
- Feature modules go in src/module/<name>/
- Shared guards, interceptors, decorators go in src/common/
- Use Nest CLI: nest g module / nest g service / nest g controller

## Skills

Do not load any skill by default. Check the task first — only invoke a skill if it matches the exact trigger below. Never invoke a skill just because it exists.

- `/architect` — before building something non-trivial with no plan yet
- `/review` — when a feature is done and needs a production check
- `/recover` — when something is broken and the fix isn't obvious
- `/remember` — at the start of a new session to restore context,
  and at the end to save progress

## Session continuity

REQUIRED — do not skip, do not wait to be asked:

- **First action of every session:** run `/remember restore` before doing anything else.
- **Last action of every session:** run `/remember save` before closing.
