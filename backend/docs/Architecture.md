# Mojilo Backend Architecture

This document describes the software design and architectural patterns applied in the Mojilo Custom T-Shirt Printing platform.

## 1. Directory Structure

```
backend/
├── config/         # Server and SDK configurations (Razorpay, Cloudinary, DB, SMTP)
├── controllers/    # Request handling (parameters unpacking, JSON responses formatting)
├── docs/           # Architecture and API endpoints documentation
├── jobs/           # Scheduled tasks, alerts, and cleanups
├── middlewares/    # Security, upload limits, sanitization, role blocks, errors
├── models/         # Mongoose schema definitions (validation, indexing, hooks)
├── repositories/   # Data Access Layer (raw Mongo query abstractions)
├── routes/         # Router declarations linking paths to controllers
├── services/       # Core Business Logic (transactions coordination)
├── socket/         # Socket.IO notifications events
├── utils/          # Universal helpers (price calculations, token generations, logger)
├── validators/     # Input schema checks using express-validator
├── app.js          # Express app configurations
└── server.js       # HTTP server bootstrapper
```

## 2. Request Lifecycle Pipeline

```
HTTP Request
     │
     ▼
  Routing
     │
     ▼
 Validators (express-validator body/query/param assertions)
     │
     ▼
Controller (Unpacks req context, returns standardized ApiResponse)
     │
     ▼
  Service (Executes core business rules, coordinates transactional logic)
     │
     ▼
Repository (Database query abstracts)
     │
     ▼
 Mongoose Models (Validates constraints, runs pre/post save hooks)
```

## 3. Core Modules

### 3.1 Design Customization System
- Configures printable areas (`PrintArea.js`) per product model.
- Deconstructs customization canvases into isolated, editable layers (`TextLayer.js`, `ImageLayer.js`) for optimized editing histories.

### 3.2 Inventory Stock Checks
- Decrements stock across warehouses upon order confirmation.
- Generates low-stock notifications for admins.

### 3.3 Payments and Verification
- Interfaces with Razorpay to execute secure signatures checks and process refunds.
