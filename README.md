Backend Ledger

A REST API for a simulated wallet built with Node.js, Express, MongoDB and Redis. Each user opens a wallet at ₹0. The API supports session-based access with a JWT cookie, transaction history, receipt lookup and optional email notifications.

What the system provides

Account registration and wallet creation in one MongoDB transaction.

Password hashing with bcrypt, a one-day login cookie and logout through token revocation in Redis.

Transfer by receiver email, with a per-user idempotency key for recovering a payment receipt after a lost response.

Whole-rupee amounts and a two-entry journal for transfers, demo deposits and demo withdrawals.

Paginated history from MongoDB. Counterparty details include name and email.

Optional welcome and transfer emails delivered by a separate BullMQ worker.

Payment status in version 2.0.0. The supplied money service passes two postings to Mongoose with Ledger.create(postings, { session }). The locked Mongoose version requires ordered: true for that call. New money movements that reach this write abort before commit. The payment lifecycle and sample balances below describe the intended behavior after this correction.

Components

Component

Entry point or address

Responsibility

Express API

server.js, localhost:3000

HTTP routes, authentication, validation and wallet operations

MongoDB replica set

MONGO_URL

Users, balances, receipts, ledger postings and outbox events

Redis

REDIS_URL

Sliding-window rate limits, revoked sessions and BullMQ jobs

Email worker

worker.js

Dispatch outbox events, consume jobs and send mail through Gmail OAuth2

Tech stack

Node.js 22, Express 5 and Mongoose 9 power the API. Docker Compose supplies MongoDB 7 and Redis 7. The project uses ioredis and BullMQ for Redis operations, Nodemailer for SMTP, Helmet for HTTP headers and Winston for structured logging.

Architecture

flowchart TD
    Client["Postman or browser"] --> API["Express routes and middleware"]
    API --> Controller["HTTP controllers"]
    API --> Redis[("Redis")]
    Controller --> Service["Money service"]
    Controller --> DB[("MongoDB replica set")]
    Service --> DB
    DB -->|Pending outbox events| Dispatcher["Outbox dispatcher"]
    Dispatcher --> Queue["BullMQ queue in Redis"]
    Queue --> Worker["Email consumer"]
    Worker --> SMTP["Gmail SMTP"]

The dispatcher and email consumer run in the worker process. The API can record a notification alongside the payment, so sending mail happens outside the database transaction.

Data model

erDiagram
    USER ||--o| ACCOUNT : owns
    USER ||--o{ TRANSACTION : initiates
    ACCOUNT o|--o{ TRANSACTION : sends
    ACCOUNT o|--o{ TRANSACTION : receives
    TRANSACTION ||--|{ LEDGER : records
    ACCOUNT o|--o{ LEDGER : affects

Model

Main fields and constraints

User

Name, normalized unique email and password hash

Account

Unique user reference, wallet balance and account status

Transaction

Initiating user, sender or receiver account, amount, operation, status, key and request fingerprint. The initiator and key form a unique pair.

Ledger

Transaction, posting index, debit or credit, amount, and wallet or clearing side. Each transaction and posting index form a unique pair.

Outbox

Unique event key, notification payload, dispatch status and lease expiry. The worker uses the lease to claim pending work.

Request lifecycles

Money transfer

The controller reads the JWT-authenticated sender, receiver email, integer amount and idempotency key.

Inside a MongoDB transaction, the service checks for an existing receipt. A matching fingerprint returns the earlier transaction ID. Changing the receiver, amount or operation with that key returns HTTP 422.

For a new payment, the service resolves the accounts and conditionally debits the sender only if active and sufficiently funded. It credits the receiver subject to the balance limit.

The service writes the receipt, paired postings and any enabled transfer email event in the same session. For a ₹200 transfer from Asha to Ravi, the journal records a ₹200 debit for Asha and a ₹200 credit for Ravi.

If the client loses its response, it can look up the receipt by key or retry the original payload with the same key.

Supply the key using the Idempotency-Key header or the idempotencyKey JSON field. When both are present they must match. Keys accept 8–100 letters, digits, dots, underscores, colons or hyphens.

Registration, logout and history

Registration creates the user and zero-balance wallet together. When email is enabled it also records a welcome event. Login sets an HttpOnly cookie with SameSite=Strict and a one-day lifetime. Logout stores a hash of the verified token in Redis for its remaining lifetime and clears the cookie.

History queries MongoDB for transactions involving the current wallet. Results are ordered by creation time and ID. The default page size is 10 and the maximum is 50. Redis applies a limit per IP of 10 auth requests or 100 transaction requests per 15-minute window in their respective route groups.

Journal entries and demo funding

Each movement builds two postings. Deposits and withdrawals use DEMO_CLEARING as the opposite side of the wallet entry. Wallet postings record the resulting balance. Model hooks reject common updates and deletes to existing ledger rows. Direct database access requires separate access controls.

HTTP API

Method

Path

Purpose

GET

/

Project information

GET

/health

Process liveness

GET

/ready

MongoDB and Redis readiness

POST

/api/auth/register

Create user and wallet

POST

/api/auth/login

Set the login cookie

POST

/api/auth/logout

Revoke the current session

GET

/api/users/profile

Read own profile and balance

POST

/api/transactions/deposit

Add demo funds

POST

/api/transactions/withdraw

Withdraw demo funds

POST

/api/transactions/transfer

Transfer to a receiver by email

GET

/api/transactions/history

Page through own transactions

GET

/api/transactions/by-key/:key

Recover own receipt

Register, login and the service information routes are public. Logout, profile and all transaction routes require the login cookie. Deposits and withdrawals also require ENABLE_DEMO_FUNDING=true.

Error responses

A rejected request includes a machine-readable code. For example, sending a text amount such as "200" produces:

{
  "success": false,
  "error": {
    "code": "INVALID_AMOUNT",
    "message": "amount must be a NUMBER (integer) between 1 and 1000000000"
  }
}

HTTP status

Example code

Meaning

401

INVALID_CREDENTIALS

Login credentials were rejected

403

DEMO_FUNDING_DISABLED

The local funding switch is off

404

TRANSACTION_NOT_FOUND

No committed receipt for this user and key

409

EMAIL_EXISTS

The email is already registered

422

IDEMPOTENCY_KEY_REUSED

The key belongs to a different request

429

RATE_LIMITED

The request window is full

503

TRANSACTION_OUTCOME_UNKNOWN

Check the receipt and retry with the original key

Local setup

Docker Compose

Use Docker Desktop or Docker Engine with Compose. Open a terminal in the folder containing package.json. For an existing database, read the migration guide first.

In PowerShell run Copy-Item .env.example .env. On macOS/Linux use cp .env.example .env.

Set a private JWT_SECRET in .env. With Node installed, generate one locally using node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))".

For the walkthrough set ENABLE_DEMO_FUNDING=true and leave EMAIL_ENABLED=false.

Run docker compose up --build -d, then docker compose ps. Open http://localhost:3000/ready and look for ready=true. For startup errors use docker compose logs --tail=80 api mongo-init.

Stop the services with docker compose down. The named volumes retain the demo data.

Compose starts MongoDB 7, initializes a single-member replica set, starts Redis 7, then starts the API and worker. Its internal database hostnames are mongo and redis. Keep PORT=3000 with the supplied port mapping.

Run Node locally

Install a current Node.js 22 LTS patch or newer compatible release, prepare .env as above, and provide a reachable MongoDB replica set and Redis. The replica set must advertise a hostname your Node process can resolve. From the project root run:

npm ci
npm run check
npm start

Use npm run dev for automatic restarts. Run npm run worker in a second terminal for email jobs. Use npm run indexes to list database indexes using the configured MongoDB connection.

Try it

Use http://localhost:3000 as the base URL and select Body → raw → JSON for POST requests. Keep the Postman cookie jar enabled.

Account walkthrough

Send POST /api/auth/register with {"name":"Asha","email":"asha@example.com","password":"demo-pass-123"}. Repeat for Ravi using ravi@example.com.

Send POST /api/auth/login with Asha’s email and password. Keep the returned cookie.

Send GET /api/users/profile. A new account should show a zero balance. Send GET /api/transactions/history?page=1&limit=10 to see its initial history.

Payment walkthrough after the posting correction

Step

Request

What to check

Fund Asha’s wallet

POST /api/transactions/deposit with {"amount":1000,"idempotencyKey":"deposit-demo-001"}

Asha’s balance reaches ₹1,000 with demo funding enabled.

Pay Ravi

POST /api/transactions/transfer with {"receiverEmail":"ravi@example.com","amount":200,"idempotencyKey":"transfer-demo-001"}

Save the transaction ID. Asha has ₹800 and Ravi has ₹200.

Retry

Repeat the transfer without changing the body.

The receipt ID stays the same. Check each balance using that user’s own login.

Recover the receipt

As Asha, send GET /api/transactions/by-key/transfer-demo-001.

The returned ID matches the transfer.

End the session

Send POST /api/auth/logout, then GET /api/users/profile.

The profile requires a fresh login.

The request examples include the registration bodies and cookie-aware commands.

Configuration reference

Variable

Local configuration

JWT_SECRET

Required private random signing key, at least 32 characters. Replace the example placeholder.

MONGO_URL

MongoDB replica-set URI. Compose overrides it for the API and worker.

REDIS_URL

Redis URI. Compose supplies its internal address.

NODE_ENV, PORT

Defaults are development and 3000.

APP_ORIGIN

Origin of the browser client allowed to submit requests.

ENABLE_DEMO_FUNDING

Defaults to false. Enable locally to practice deposits and withdrawals.

EMAIL_ENABLED

Defaults to false. Enable for email notifications.

EMAIL_USER, CLIENT_ID, CLIENT_SECRET, REFRESH_TOKEN

Gmail OAuth2 settings. Required only when email is enabled.

Repository layout

Backend-ledger/
  .dockerignore
  .env.example
  .gitignore
  Dockerfile
  README.md
  app.js
  controllers/
    auth.controller.js
    transaction.controller.js
    user.controller.js
  docker-compose.yml
  docs/
    API_EXAMPLES.md
    FILE_BY_FILE.md
    MIGRATION.md
    MONEY_SERVICE_DEEP_DIVE.md
  middlewares/
    auth.middleware.js
    errorHandler.js
    origin.middleware.js
    rateLimiter.js
  models/
    account.model.js
    ledger.model.js
    outbox.model.js
    transaction.model.js
    user.model.js
  package-lock.json
  package.json
  routes/
    auth.routes.js
    transaction.routes.js
    user.routes.js
  scripts/
    check-syntax.js
    inspect-indexes.js
  server.js
  services/
    money.service.js
    outboxDispatcher.js
  utils/
    config.js
    emailQueue.js
    emailTemplates.js
    error.js
    idempotency.js
    ledgerPostings.js
    logger.js
    mailer.js
    queueRedis.js
    redisClient.js
    validation.js
  worker.js

See the file reference and money service walkthrough for implementation details.

Current limitations and next steps

This is an educational wallet with simulated funding and integer-rupee amounts. It has no external settlement or payout integration. Local Compose uses unauthenticated database services bound to localhost. Notification retries can result in duplicate emails. Existing databases require deliberate migration.

The first verification step after correcting the ordered posting call is to repeat the same transfer and compare both wallets and the receipt ID. For an existing database, inspect the indexes and follow the migration guide before accepting new movements.
