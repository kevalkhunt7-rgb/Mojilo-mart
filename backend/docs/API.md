# Mojilo Backend API Endpoints

This document outlines the main API endpoints for the Mojilo backend application.

## 1. Authentication (`/api/auth`)

| Endpoint | Method | Auth Required | Description |
| :--- | :--- | :--- | :--- |
| `/register` | POST | None | Creates user profile, sends verification email OTP. |
| `/login` | POST | None | Sign-in credentials, sets HTTP-only refresh token cookie. |
| `/verify-email` | POST | None | Verifies OTP code to activate account. |
| `/refresh` | POST | None | Rotates access token via refresh token. |
| `/forgot-password`| POST | None | Generates reset code OTP to email. |
| `/reset-password` | POST | None | Overwrites user password with new credentials. |
| `/logout` | POST | None | Revokes refresh tokens. |

## 2. Product Catalog (`/api/products` & `/api/variants` & `/api/categories`)

| Endpoint | Method | Auth Required | Description |
| :--- | :--- | :--- | :--- |
| `/api/products` | GET | None | Query product listing (keyword, price range, limits). |
| `/api/products/:slug`| GET | None | Retrieve product details by slug. |
| `/api/variants/product/:id`| GET | None | Get size/color variants for a product. |
| `/api/categories` | GET | None | Fetch top-level categories. |
| `/api/products` | POST | Admin | Add new catalog product. |

## 3. Customizer Designs (`/api/designs`)

| Endpoint | Method | Auth Required | Description |
| :--- | :--- | :--- | :--- |
| `/print-areas/:productId` | GET | None | Retrieve printable coordinates zones for garment. |
| `/save` | POST | Customer | Save canvas template design and layers. |
| `/:id` | GET | None | Retrieve saved custom design. |

## 4. Shopping Cart (`/api/cart`)

| Endpoint | Method | Auth Required | Description |
| :--- | :--- | :--- | :--- |
| `/` | GET | Optional | Fetch cart. Pass `x-session-id` header if guest. |
| `/` | POST | Optional | Add item to cart. Links customizations. |
| `/:itemId` | PATCH | Optional | Adjust item quantities. |
| `/:itemId` | DELETE | Optional | Remove item. |
| `/merge` | POST | Customer | Merge guest session items into user account. |

## 5. Checkout & Payments (`/api/orders` & `/api/payments`)

| Endpoint | Method | Auth Required | Description |
| :--- | :--- | :--- | :--- |
| `/api/orders` | POST | Customer | Place order (Online Payment). |
| `/api/orders/:id`| GET | Customer | Fetch order timeline details and invoice ID. |
| `/api/payments/create-order`| POST | Customer | Create Razorpay checkout order ID. |
| `/api/payments/verify-signature`| POST| Customer | Validate Razorpay signature hashes. |

## 6. System Settings (`/api/settings`)

| Endpoint | Method | Auth Required | Description |
| :--- | :--- | :--- | :--- |
| `/` | GET | None | Fetch store Settings configuration (tax rate, free shipping, logo). |
| `/calculate-print-price`| GET | None | Calculate custom print pricing details based on width & height parameters. |
| `/` | PATCH | Admin | Update system-wide settings configurations. |
