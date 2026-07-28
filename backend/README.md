# Mojilo Backend - Custom T-Shirt Printing E-Commerce

Mojilo is an enterprise-grade backend API built for custom apparel printing and merchandising platforms. It features custom design layering, inventory logistics, and integrated payment processors.

## Tech Stack
- **Runtime**: Node.js (ES Modules)
- **Framework**: Express.js
- **Database**: MongoDB (Mongoose ODM)
- **Gateway**: Razorpay
- **Storage**: Cloudinary (Image uploads)
- **Emailing**: Nodemailer (SMTP)
- **Real-Time**: Socket.IO
- **Security**: Helmet, CORS, Express-Rate-Limit, express-mongo-sanitize

---

## Folder Explanation

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

---

## Installation Guide

### 1. Prerequisites
- Node.js (v18+)
- MongoDB (Local or Atlas)

### 2. Installation
Clone the repository and install dependencies in the `backend` folder:
```bash
cd backend
npm install
```

### 3. Environment Variables
Copy `.env.example` to `.env` and fill in your credentials:
```bash
cp .env.example .env
```

### 4. Running the Application
To run the server in development mode:
```bash
npm run dev
```

The API will be available at `http://localhost:5000/api`.

---

## Seeding Sample Admin & Settings
To populate database configurations and create a default admin user, run:
```bash
npm run seed:admin
```
