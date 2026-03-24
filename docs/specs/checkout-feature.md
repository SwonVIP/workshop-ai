# Checkout Feature Specification

## Table of Contents
- [Stage 1: Customer Insights](#stage-1-customer-insights)
- [Stage 2: Product Definition](#stage-2-product-definition)
- [Stage 3: Architecture & Delivery Slices](#stage-3-architecture--delivery-slices)

---

## Stage 1: Customer Insights

### Customer Jobs-to-Be-Done

**Functional Jobs:**
- Get weekly groceries ordered in under 5 minutes (speed is king for returning customers)
- Ensure nothing is forgotten before committing (20-60 item baskets)
- Choose delivery window that fits schedule (primary decision point in grocery)
- Set substitution preferences to avoid surprises (perishables/stock variability)
- Pay quickly with preferred method

**Emotional Jobs:**
- Feel confident about getting a good deal (price-sensitive, deal-aware shoppers)
- Feel in control of what arrives at their door (dietary restrictions, brand preferences)
- Avoid guilt of expensive cart (transparency prevents sticker shock)

### Key Pain Points
1. **Surprise costs at checkout** -- #1 abandonment driver (delivery fees, service charges, bag fees)
2. **Delivery slots unavailable** after building cart (time wasted = betrayal)
3. **Post-order "forgot item" regret** -- no edit window means second order or physical store trip
4. **Unwanted substitutions** -- receiving wrong alternatives erodes trust
5. **Too many steps on mobile** -- multitasking shoppers drop off from long forms
6. **Coupon friction** -- codes rejected without clear reasons, field triggers "coupon hunting" abandonment

### Behavioral Insights
- Customers say they want cheapest delivery but pick soonest slot
- Customers add items DURING checkout (not a sealed tunnel)
- Customers skip preference screens then complain about outcomes -> need smart defaults
- Cross-device behavior common (cart on mobile, finalize on desktop)
- Auto-applied coupons drive satisfaction disproportionate to discount value
- "Frequently bought together" works when contextually relevant (meal completion)
- Returning customers strongly prefer reusing past orders

### Prioritized Recommendations
- **P0 Must Have:** Transparent cost breakdown, delivery slot selection, editable order summary, guest checkout, WCAG 2.1 AA accessibility
- **P1 High Value:** Auto-applied coupons & loyalty, substitution preferences, smart suggestions (frequently bought together), post-order edit window
- **P2 Differentiators:** One-click reorder, persistent delivery instructions, tipping, eco-delivery, gifting

---

## Stage 2: Product Definition

### Problem Statement
Online grocery shoppers who have added items to their cart have no way to complete a purchase. The checkout page is a placeholder, resulting in 100% checkout abandonment. Checkout is the single highest-leverage feature -- every other feature exists to serve this moment.

### User Stories

#### Story 1: Order Summary Review (P0)
**As a** shopper with items in my cart,
**I want to** see a clear, editable summary of my order with a full cost breakdown at checkout,
**so that** I feel confident about what I am ordering and am not surprised by costs.

**Acceptance Criteria:**
- Checkout page displays all cart items with name, image thumbnail, quantity, unit price, and line subtotal
- Each item quantity is editable inline (increment/decrement) without leaving the checkout page
- Items can be removed from checkout directly
- Cost breakdown shows: Subtotal, Delivery Fee, Coupon Discount (if applied), and Order Total -- always visible
- If cart is empty, redirect to catalog with message
- Currency is CHF, formatted consistently (e.g., CHF 24.99)
- On mobile, order summary is collapsible (collapsed by default, showing total + item count as sticky bar)

#### Story 2: Delivery Details Form (P0)
**As a** shopper,
**I want to** enter my delivery address and select a delivery time slot,
**so that** my groceries arrive where and when I need them.

**Acceptance Criteria:**
- Form fields: First Name, Last Name, Email, Phone, Street Address, Apartment/Floor (optional), City, Postal Code
- All required fields show inline validation errors on blur and on submit attempt
- Postal code validates Swiss format (4 digits)
- Email validates standard email format
- Delivery slot selector shows available time windows grouped by day (Today, Tomorrow, Day+2) with 2-hour windows
- At least one slot must be selected before proceeding
- Slots fetched from backend via API
- Unavailable/full slots shown as disabled with "Full" label (not hidden)
- Delivery fee displayed next to each slot (Express CHF 9.90, Standard CHF 4.90, Free above CHF 99)
- Selected delivery fee reflected immediately in order summary
- Delivery instructions field (optional, textarea, max 200 chars)

#### Story 3: Coupon / Promo Code Application (P1)
**As a** shopper,
**I want to** apply a coupon code and see any auto-applied discounts,
**so that** I get the best deal and feel rewarded.

**Acceptance Criteria:**
- "Promo Code" input field with "Apply" button in order summary area
- Valid code: success feedback (checkmark + message), discount line in cost breakdown, total updates
- Invalid code: inline error "This code is not valid or has expired" -- input NOT cleared
- Already-applied code: message "This code is already applied"
- Applied coupon shows as removable chip/tag (click X to remove, total recalculates)
- Backend validates: percentage discount (WELCOME10 = 10%) and fixed amount (SAVE5 = CHF 5)
- Auto-applied: orders over CHF 99 get free delivery with celebratory message
- Only one manual promo code allowed (auto-applied doesn't count against limit)
- Seeded test codes: WELCOME10 (10% off), SAVE5 (CHF 5 off), EXPIRED1 (expired)

#### Story 4: Smart Suggestions -- "Complete Your Order" (P1)
**As a** shopper,
**I want to** see relevant product suggestions during checkout,
**so that** I don't forget complementary items.

**Acceptance Criteria:**
- "You might also need" section below/beside order summary
- Shows 3-4 products from same categories as cart items, excluding products already in cart
- Each suggestion: product image, name, price, one-click "Add" button
- Adding a suggestion updates cart and order summary in real time
- On mobile, horizontal scrollable row
- If no suggestions available, section hidden entirely
- Backend: GET /api/products/suggestions?sessionId=... returns products from same categories, limited to 4

#### Story 5: Mock Payment & Order Placement (P0)
**As a** shopper,
**I want to** enter my payment details and place my order,
**so that** I can complete my purchase.

**Acceptance Criteria:**
- Simulated credit card form: Card Number, Expiry (MM/YY), CVV, Cardholder Name
- Client-side validation: card number 16 digits, expiry in future, CVV 3 digits
- Card number auto-formats with spaces every 4 digits
- Payment is mocked -- backend accepts any valid-format card
- "Place Order" button disabled until all required fields valid and delivery slot selected
- On click: loading spinner, POST /api/orders call
- Backend creates Order with status CONFIRMED, links to cart items (snapshot of prices), stores delivery info, coupon, delivery slot, total
- On success: redirect to Order Confirmation page
- On failure: inline error banner, form NOT cleared, button re-enabled for retry

#### Story 6: Order Confirmation Page (P0)
**As a** shopper who just placed an order,
**I want to** see a confirmation with my order details,
**so that** I know my order was received.

**Acceptance Criteria:**
- Displays: "Order Confirmed!" with success icon (checkmark)
- Shows: Order number (e.g., #ORD-00042), estimated delivery window, delivery address, order total
- Condensed item list (name + qty + line total)
- If coupon applied, shows discount amount
- "Continue Shopping" button links to catalog
- Cart cleared after successful order placement
- Direct navigation to /checkout/confirmation without valid order context redirects to catalog
- Route: /checkout/confirmation/:orderId

### UX Direction

**Layout:** Single-page checkout (not multi-step wizard).
- **Desktop (lg+):** Two-column. Left (2/3): Delivery Details -> Coupon -> Payment. Right (1/3, sticky): Order Summary + Suggestions.
- **Mobile (< lg):** Single column, stacked. Sticky bottom bar: Order Total + "Place Order" button.

**Key States:**
- **Loading:** Skeleton placeholders for items and suggestions
- **Empty Cart:** Centered message + "Browse Products" link, no checkout form rendered
- **Validation Errors:** Inline below fields, red border, "Place Order" stays disabled
- **Submitting:** Button shows spinner + "Placing Order...", all fields read-only
- **Success:** Redirect to confirmation, cart badge resets to 0
- **Server Error:** Dismissible error banner, form remains filled, button re-enables

### Out of Scope
- User authentication / account creation (guest checkout only, session-based)
- Real payment gateway integration
- Substitution preferences
- Post-order edit window
- One-click reorder / order history
- Persistent delivery instructions (requires accounts)
- Tipping, eco-delivery, gifting
- Address autocomplete / Google Places
- Multiple payment methods
- Order status tracking / email notifications
- Inventory/stock validation at checkout
- Multiple coupon stacking
- Internationalization / multi-language

### Success Metrics
| Metric | Target |
|---|---|
| End-to-end flow works | Catalog -> cart -> checkout -> place order -> confirmation. No dead ends. |
| Cost transparency | Confirmation total matches checkout breakdown |
| Mobile usability | Fully usable on 375px viewport, CTA always visible |
| Coupon flow | WELCOME10 = 10% off, EXPIRED1 = error, auto-free-delivery on CHF 99+ |
| Smart suggestions | Load and one-click add updates cart in real time |
| Form validation | Empty required fields show errors, fixing enables button |
| Error resilience | Simulated backend error shows banner, allows retry |
| Accessibility | All fields labeled, keyboard tab navigable, focus managed on errors |

---

## Stage 3: Architecture & Delivery Slices

### Epic Overview
**Epic:** Checkout Flow
**Goal:** Enable end-to-end purchase from cart to order confirmation.
**Slices:** 8 incremental vertical slices, ~5h total.

### API Design

#### GET /api/delivery-slots
```json
Response 200:
[
  {
    "id": 1,
    "date": "2026-03-06",
    "dayLabel": "Today",
    "startTime": "14:00",
    "endTime": "16:00",
    "price": 7.90
  }
]
```

#### POST /api/coupons/validate
```json
Request:  { "code": "WELCOME10" }
Response 200:
{
  "code": "WELCOME10",
  "type": "PERCENTAGE",
  "value": 10.0,
  "description": "10% off your order"
}
Response 404: ErrorResponse when code invalid/expired
```

#### GET /api/products/suggestions?sessionId={uuid}
```
Response 200: ProductResponse[] (max 4 items, same shape as existing ProductResponse)
```

#### POST /api/orders
```json
Request:
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "phone": "+41791234567",
  "street": "Bahnhofstrasse 1",
  "apartment": "3A",
  "city": "Zurich",
  "postalCode": "8001",
  "deliveryInstructions": "",
  "deliverySlotId": 5,
  "couponCode": "WELCOME10",
  "cardNumber": "4242424242424242",
  "cardExpiry": "12/28",
  "cardCvv": "123",
  "cardName": "John Doe"
}

Response 201:
{
  "id": 1,
  "orderNumber": "ORD-20260306-0001",
  "status": "CONFIRMED",
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "phone": "+41791234567",
  "street": "Bahnhofstrasse 1",
  "apartment": "3A",
  "city": "Zurich",
  "postalCode": "8001",
  "deliveryInstructions": "",
  "deliverySlot": {
    "date": "2026-03-06",
    "dayLabel": "Today",
    "startTime": "14:00",
    "endTime": "16:00",
    "price": 7.90
  },
  "items": [
    {
      "productName": "Wireless Bluetooth Headphones",
      "imageUrl": "...",
      "quantity": 2,
      "unitPrice": 89.99,
      "subtotal": 179.98
    }
  ],
  "subtotal": 179.98,
  "deliveryFee": 7.90,
  "discount": 18.00,
  "couponCode": "WELCOME10",
  "total": 169.88,
  "createdAt": "2026-03-06T10:30:00Z"
}
```

#### GET /api/orders/{id}?sessionId={uuid}
Same response shape as POST /api/orders 201.

### Data Model

**delivery_slot**
| Column | Type | Constraints |
|---|---|---|
| id | BIGINT IDENTITY | PK |
| date | DATE | NOT NULL |
| start_time | TIME | NOT NULL |
| end_time | TIME | NOT NULL |
| price | DECIMAL(10,2) | NOT NULL |

**coupon**
| Column | Type | Constraints |
|---|---|---|
| id | BIGINT IDENTITY | PK |
| code | VARCHAR(50) | NOT NULL UNIQUE |
| type | VARCHAR(20) | NOT NULL (PERCENTAGE, FIXED_AMOUNT, FREE_DELIVERY) |
| value | DECIMAL(10,2) | NOT NULL |
| description | VARCHAR(200) | |
| active | BIT | NOT NULL DEFAULT 1 |
| min_order_amount | DECIMAL(10,2) | nullable |

**customer_order** (not `order` -- SQL Server reserved word)
| Column | Type | Constraints |
|---|---|---|
| id | BIGINT IDENTITY | PK |
| order_number | VARCHAR(20) | NOT NULL UNIQUE |
| session_id | VARCHAR(36) | NOT NULL |
| status | VARCHAR(20) | NOT NULL DEFAULT 'CONFIRMED' |
| first_name | VARCHAR(100) | NOT NULL |
| last_name | VARCHAR(100) | NOT NULL |
| email | VARCHAR(200) | NOT NULL |
| phone | VARCHAR(30) | NOT NULL |
| street | VARCHAR(200) | NOT NULL |
| apartment | VARCHAR(50) | nullable |
| city | VARCHAR(100) | NOT NULL |
| postal_code | VARCHAR(10) | NOT NULL |
| delivery_instructions | VARCHAR(500) | nullable |
| delivery_slot_id | BIGINT | NOT NULL FK -> delivery_slot |
| coupon_code | VARCHAR(50) | nullable |
| subtotal | DECIMAL(10,2) | NOT NULL |
| delivery_fee | DECIMAL(10,2) | NOT NULL |
| discount | DECIMAL(10,2) | NOT NULL DEFAULT 0 |
| total | DECIMAL(10,2) | NOT NULL |
| created_at | DATETIMEOFFSET | |

**order_item**
| Column | Type | Constraints |
|---|---|---|
| id | BIGINT IDENTITY | PK |
| order_id | BIGINT | NOT NULL FK -> customer_order |
| product_name | VARCHAR(200) | NOT NULL |
| image_url | VARCHAR(500) | nullable |
| quantity | INT | NOT NULL |
| unit_price | DECIMAL(10,2) | NOT NULL |
| subtotal | DECIMAL(10,2) | NOT NULL |

**Relationships:**
- OrderEntity 1:N OrderItemEntity (cascade ALL, orphanRemoval)
- OrderEntity N:1 DeliverySlotEntity (LAZY fetch)

### Frontend Components (New)
- `core/models/checkout.model.ts` -- interfaces
- `core/services/checkout.service.ts` -- delivery slots, coupon validation, order placement
- `core/services/suggestion.service.ts` -- product suggestions
- `features/checkout/checkout.component.ts` -- main checkout page (2-column layout)
- `features/checkout/delivery-form/delivery-form.component.ts` -- reactive form
- `features/checkout/delivery-slot-picker/delivery-slot-picker.component.ts` -- slot selection
- `features/checkout/coupon-input/coupon-input.component.ts` -- promo code input
- `features/checkout/payment-form/payment-form.component.ts` -- mock credit card
- `features/checkout/checkout-summary/checkout-summary.component.ts` -- order summary sidebar
- `features/checkout/suggestions/suggestions.component.ts` -- horizontal scroll suggestions
- `features/checkout/confirmation/confirmation.component.ts` -- order confirmation

### Backend Services (New)
- `entity/DeliverySlotEntity.java`, `entity/CouponEntity.java`, `entity/OrderEntity.java`, `entity/OrderItemEntity.java`
- `repository/DeliverySlotRepository.java`, `repository/CouponRepository.java`, `repository/OrderRepository.java`
- `controller/DeliverySlotController.java`, `controller/CouponController.java`, `controller/OrderController.java`
- `service/DeliverySlotService.java`, `service/CouponService.java`, `service/OrderService.java`
- `mapper/OrderMapper.java`
- `model/DeliverySlotResponse.java`, `model/CouponValidateRequest.java`, `model/CouponResponse.java`
- `model/CreateOrderRequest.java`, `model/OrderResponse.java`, `model/OrderItemResponse.java`
- Migration: `3__checkout_tables.sql`
- Suggestions endpoint added to existing `ProductController` / `ProductService`

### Delivery Slices

#### Slice 1: Delivery Slots Backend + DB Migration (S)
**Scope:**
- Flyway migration `3__checkout_tables.sql`: create all 4 tables + seed data
  - Delivery slots: 3 days, 2-hour windows 08:00-20:00, prices CHF 5.90/7.90/9.90
  - Coupons: WELCOME10 (percentage 10%), SAVE5 (fixed CHF 5), FREE_DELIVERY (free delivery, min CHF 99), EXPIRED1 (active=0)
- DeliverySlotEntity, DeliverySlotRepository, DeliverySlotService, DeliverySlotController, DeliverySlotResponse
- DeliverySlotControllerTest (WebMvcTest)

**Dependencies:** None
**Definition of Done:**
- GET /api/delivery-slots returns seeded slots
- Controller test passes
- Migration runs clean

#### Slice 2: Coupon Validation Backend (S)
**Scope:**
- CouponEntity, CouponRepository, CouponService, CouponController
- CouponValidateRequest, CouponResponse
- Error handling in GlobalExceptionHandler for invalid/expired codes
- CouponControllerTest (WebMvcTest)

**Dependencies:** Slice 1 (migration)
**Definition of Done:**
- POST /api/coupons/validate with "WELCOME10" returns 200 with type=PERCENTAGE, value=10
- POST /api/coupons/validate with "SAVE5" returns 200 with type=FIXED_AMOUNT, value=5
- POST /api/coupons/validate with unknown code returns 404
- POST /api/coupons/validate with "EXPIRED1" returns 404
- Controller tests pass

#### Slice 3: Checkout Page Layout + Delivery Form (L)
**Scope:**
- checkout.model.ts -- all interfaces
- checkout.service.ts -- getDeliverySlots(), validateCoupon(), placeOrder(), getOrder()
- checkout.component.ts -- 2-column layout (form left, summary right sticky). Mobile: stacked + sticky bottom bar.
- delivery-form.component.ts -- Reactive form: firstName, lastName, email, phone, street, apartment, city, postalCode, deliveryInstructions. Validation.
- delivery-slot-picker.component.ts -- Fetch slots, group by dayLabel, selectable cards with price.
- Update app.routes.ts

**Dependencies:** Slice 1 (delivery slots API)
**Definition of Done:**
- Checkout page renders 2-column desktop, stacked mobile
- Delivery form validates and shows errors
- Slot picker fetches/displays slots, allows selection
- Vitest unit tests for validation logic

#### Slice 4: Checkout Order Summary + Coupon Input (M)
**Scope:**
- checkout-summary.component.ts -- Cart items (name, thumbnail, qty editable, price, subtotal). Cost breakdown: Subtotal, Delivery Fee, Discount, Total. Collapsible on mobile.
- coupon-input.component.ts -- Input + Apply. Validate via API. Success/error feedback. Removable chip. Auto-apply FREE_DELIVERY when subtotal >= CHF 99.
- Wire quantity changes back to CartService.updateItem()

**Dependencies:** Slices 2, 3
**Definition of Done:**
- Summary shows correct calculations
- Coupon validates and displays feedback
- Free delivery auto-applied for orders >= CHF 99
- Vitest unit tests for cost calculation

#### Slice 5: Smart Suggestions Backend + Frontend (M)
**Scope:**
- Backend: GET /api/products/suggestions on ProductController. ProductService.getSuggestions(sessionId) -- find cart categories, query products in those categories excluding cart items, limit 4.
- ProductControllerTest for suggestions endpoint
- suggestion.service.ts, suggestions.component.ts -- horizontal scroll, "Add" button calls CartService.addItem()

**Dependencies:** Slice 3 (checkout layout)
**Definition of Done:**
- GET /api/products/suggestions returns up to 4 products from cart categories
- Empty array for empty cart
- Frontend renders horizontal scroll with add-to-cart
- Controller test passes

#### Slice 6: Mock Payment Form (S)
**Scope:**
- payment-form.component.ts -- Reactive form: cardNumber (16 digits, formatted), cardExpiry (MM/YY, future), cardCvv (3 digits), cardName (required). Client-side only.
- Wire into checkout.component. "Place Order" disabled until all forms valid.

**Dependencies:** Slice 3
**Definition of Done:**
- Payment form renders with validation
- "Place Order" enabled only when all forms valid
- Vitest unit tests for card validation

#### Slice 7: Order Placement Backend + Frontend Wiring (L)
**Scope:**
- OrderEntity, OrderItemEntity, OrderRepository, OrderService, OrderController, OrderMapper
- CreateOrderRequest (Jakarta validation), OrderResponse, OrderItemResponse
- OrderService.placeOrder(): validate slot, validate coupon, compute totals, create order + items, clear cart
- Order number: ORD-YYYYMMDD-{padded ID}
- GET /api/orders/{id} with session verification
- OrderControllerTest
- Frontend: wire "Place Order" to checkoutService.placeOrder(), navigate to confirmation on success

**Dependencies:** Slices 1-4, 6
**Definition of Done:**
- POST /api/orders creates order, returns 201
- Cart cleared after placement
- Invalid slot/coupon returns 400/404
- GET /api/orders/{id} returns order for matching session
- Frontend navigates to confirmation
- Controller tests pass

#### Slice 8: Order Confirmation Page (S)
**Scope:**
- confirmation.component.ts -- Route /checkout/confirmation/:orderId. Fetch order, display: order number, delivery window, address, total, item list, discount, "Continue Shopping" link.
- Update app.routes.ts with child route
- Cart badge resets (handled by backend clearing cart)

**Dependencies:** Slice 7
**Definition of Done:**
- Confirmation page renders all order details
- "Continue Shopping" navigates to catalog
- Cart badge shows 0
- Vitest unit test for component rendering
- Direct navigation without valid order redirects to catalog

### Technical Decisions
| Decision | Rationale |
|---|---|
| Table `customer_order` not `order` | SQL Server reserved keyword |
| Denormalized product data in order_item | Immutable order history even if products change |
| Static seeded delivery slots | Workshop scope, no admin UI needed |
| Coupon validation as separate endpoint | Real-time UI feedback before order placement |
| Session-based order ownership | Consistent with existing cart session pattern |
| Auto-applied free delivery as frontend concern | Simpler than backend promotion engine; backend still validates |
| Single Flyway migration for all tables | All part of same feature, no independent utility |
| Order number using DB ID | ORD-YYYYMMDD-{padded ID} is simple and unique |

### Risks & Mitigations
| Risk | Mitigation |
|---|---|
| Migration naming convention | Use `3__checkout_tables.sql` to match existing `1__`/`2__` pattern |
| Cart race condition during order placement | @Transactional on service method, re-read cart within transaction |
| Slice 3 complexity may exceed time | Apartment and delivery instructions can be deferred if needed |
| Spartan UI missing widgets | Fallback to native HTML details/summary or @angular/cdk |
