# Foomato

## Done

### BackEnd

- [x] do user modules
- [x] login route - ( jwt, mongoose, google auth )
- [x] seller service (port 5001, clean repository pattern, AuthGuard & SellerGuard)
- [x] seller endpoints: POST /new (with uploadFile / data URI to buffer), GET /get-seller, PUT /status, PUT /edit

#### utils service

- [x] cloudinary service setup (port 5002, Global CloudinaryModule)
- [x] route for cloudinary upload buffer to response image url (POST /upload, POST /api/upload)
- [x] API versioning /api/v1 (NestJS URI versioning with /api prefix on auth, seller, and utils microservices)

#### Seller Service — Items (Menu & Food Items Management)

- [x] menuItem Domain entity
- [x] add getNearBy restuarant for public user with lat, lng, radius, and search queries (GET /api/v1/seller/nearby & GET /api/v1/seller/:id)
- [x] cart entity and its CRUD operations in seller service (POST /api/v1/cart, GET /api/v1/cart, PATCH /api/v1/cart/items/:itemId/increment, PATCH /api/v1/cart/items/:itemId/decrement, DELETE /api/v1/cart/items/:itemId, DELETE /api/v1/cart)
- [x] address module in seller service (POST /api/v1/address/new, GET /api/v1/address/all, DELETE /api/v1/address/:id with 2dsphere location index)

### Frontend

- [x] login via google
- [x] toast, router and error pages
- [x] background theme and toggle button
- [x] role selection (customer, rider, seller)
- [x] Redux Toolkit & RTK Query setup
- [x] new seller route (/seller and /seller/new with SellerGuard)
- [x] when seller is not created -> go to add seller page
- [x] component seller profile: update and toggle status page (reusable for seller details page for showing to users)
- [x] minimal open/close toggle switch without over graphics
- [x] inline form validations on submit for text inputs and banner image file
- [x] role-specific navbars & footers (seller, rider, customer)
- [x] confirmation modal on logout
- [x] branded loading screen system & seamless glitch-free logout transition

#### Seller Portal — Menu Management

- [x] Menu items list view on Seller Dashboard
- [x] show the nearby seller to public users
- [x] show the seller detials page to public users with menuitem with add tocart button
- [x] cart icon and cart page with menuitems and cartManagemnt (with clear cart confirmation modal and restaurant status guard)
- [x] fetch nearby restaurants by geo coordinates (lat, lng) with TanStack Query
- [x] show the restaurants fetched (RestaurantCard grid) and restaurant details page (/restaurant/:id with public menu catalog)

#### Location & Maps

- [x] Location chosen from Google Maps API (Google Places Autocomplete + Interactive Draggable Map pin in LocationModal)
- [x] Location change modal integration in Seller Profile Edit mode

---

## Todo

### BackEnd

- [ ] Order service and checkout integration

### Frontend

- [ ] Checkout flow integration with address selection
