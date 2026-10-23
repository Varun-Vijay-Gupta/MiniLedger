# MiniLedger

A simple full-stack app for tracking money you have lent to friends.

- Frontend: React (Vite)
- Backend: Node.js, Express
- Database: PostgreSQL
- Auth: phone number + mock OTP (printed in the server log) and JWT

## Features

- Log in with a 10-digit Indian mobile number and a 6-digit OTP
- Add a loan (friend’s name, amount in ₹, due date, optional receipt photo)
- See pending, repaid, and overdue loans
- Mark a loan as repaid
- Dashboard totals: total lent, total repaid, outstanding, overdue

OTP is not sent by SMS. The API prints it in the **server terminal**.

## Project layout

```
client/   React UI
server/   Express API, PostgreSQL, tests
```

## Prerequisites

- Node.js 18+
- PostgreSQL 14+ (or Docker)

## Database setup

### Option A: Docker

```bash
docker compose up -d
```

This starts PostgreSQL on port `5432` with:

- database: `miniledger`
- user: `postgres`
- password: `postgres`

### Option B: Local PostgreSQL

```sql
CREATE DATABASE miniledger;
```

Tables are created automatically when the API starts.

## Environment variables

Copy the example file and edit if needed:

```bash
copy server\.env.example server\.env
```

| Variable | Description | Example |
| --- | --- | --- |
| `PORT` | API port | `5000` |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://postgres:postgres@localhost:5432/miniledger` |
| `JWT_SECRET` | Secret used to sign login tokens | a long random string |
| `JWT_EXPIRES_IN` | Token lifetime | `7d` |
| `CLIENT_ORIGIN` | Frontend origin for CORS | `http://localhost:5173` |

## Run the app

Install and start the API:

```bash
cd server
npm install
npm run dev
```

Install and start the UI (second terminal):

```bash
cd client
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

1. Enter a phone number such as `9876543210`.
2. Click **Send OTP**.
3. Copy the 6-digit code from the **server** terminal (`[MiniLedger] OTP for …`).
4. Log in, add a loan, check the summary cards, then mark a loan repaid.

## Tests

```bash
cd server
npm test
```

## API

Base URL in development: `http://localhost:5000`.

The Vite dev server also proxies `/api` and `/uploads` to the API.

### Auth

**POST `/api/auth/request-otp`**

```json
{ "phone": "9876543210" }
```

**POST `/api/auth/verify-otp`**

```json
{ "phone": "9876543210", "otp": "123456" }
```

Response includes `token` and `user`. Send the token as `Authorization: Bearer <token>` on later requests.

**GET `/api/auth/me`** (auth required)

### Loans

**GET `/api/loans`** (auth required)

Returns `{ "loans": [...] }` with a computed `status`: `pending`, `overdue`, or `repaid`.

**POST `/api/loans`** (auth required)

JSON:

```json
{
  "friendName": "Asha",
  "amount": 500,
  "dueDate": "2026-12-01"
}
```

Or `multipart/form-data` with the same fields plus optional `receipt` (JPG, PNG, or WEBP, max 2 MB).

**PATCH `/api/loans/:id/repay`** (auth required)

### Summary

**GET `/api/summary`** (auth required)

```json
{
  "totalLent": 1500,
  "totalRepaid": 500,
  "outstanding": 1000,
  "overdue": 200
}
```

### Health

**GET `/api/health`**

## Demo recording and GitHub

This repository is local until you push it. A screen recording is not included in the source files; record login, adding a loan, the dashboard, and marking a loan repaid after you run the app.
