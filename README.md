<div align="center">

# 🏦 Scalable Ledger & Banking System

A production-ready, high-performance backend banking and ledger API engineered for data consistency, security, and concurrency.

</div>

---

## 🚀 Overview

The **Scalable Ledger & Banking System** is an enterprise-grade backend architecture built to handle secure user authentication, concurrent financial transactions with strict ACID compliance, custom Redis-backed rate limiting, and asynchronous task execution. Designed with clean separation of concerns and robust automated testing.

---

## 🛠️ Tech Stack

- **Runtime & Framework:** Node.js, Express.js
- **Database & ODM:** MongoDB, Mongoose (with ACID Transactions)
- **Caching & Rate Limiting:** Redis (`ioredis`), Sliding Window Algorithm
- **Containerization & Tooling:** Docker, Docker Compose
- **Testing & Quality:** Jest, Supertest
- **Logging & Queues:** Winston, BullMQ

---

## ⚙️ Architecture & Core Features

- **ACID Transactions:** Ensures absolute consistency during monetary transfers between accounts using MongoDB sessions and multi-document transactions.
- **Custom Sliding Window Rate Limiter:** Implemented from scratch via Redis sorted sets (`ZSET`) to throttle requests and prevent brute-force attacks.
- **Stateless Authentication & Security:** JWT-based cookies with secure HTTP-only flags, paired with Redis-powered token blacklisting for secure logouts.
- **Automated Integration Testing:** Comprehensive test suites using Jest and Supertest covering core routes, auth lifecycles, and concurrent transactions.
- **Asynchronous Background Processing:** BullMQ integration for offloading non-blocking tasks like email notifications using Redis queues.
- **Centralized Audit Logging:** Structured logging implemented via Winston across services.

---

## 📐 System Architecture & Workflows

### 1. High-Level Architecture
graph LR
    Client --> App[app.js: express.json, cookieParser]
    App --> AuthRoutes[auth.routes]
    App --> AccRoutes[account.routes]
    App --> TransRoutes[transaction.routes]
    AuthRoutes --> Val[validate.middleware, Zod]
    AccRoutes --> AuthMid[authMiddleware, JWT]
    TransRoutes --> SysAuthMid[authsystemUserMiddleware]
    AuthMid --> Val
    SysAuthMid --> Val
    Val --> Ctrl[controllers: auth, account, transaction]
    Ctrl -.-> Err[error.middleware]
    
    Ctrl --> Models[Mongoose models: user, account, transaction, ledger]
    Models --> DB[MongoDB]
    
    Ctrl --> Email[email.service, Nodemailer]
    Email --> Gmail[Gmail OAuth2]
