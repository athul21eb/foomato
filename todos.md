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

---

## Todo

### BackEnd

#### Seller Service — Items (Menu & Food Items Management)
- [ ] Item Domain entity

### Frontend

#### Seller Portal — Menu Management

- [ ] Menu items list view on Seller Dashboard


#### Location & Maps
- [ ] Location chosen from Google Maps API
