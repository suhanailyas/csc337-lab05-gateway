<img width="1366" height="768" alt="image" src="https://github.com/user-attachments/assets/b2c01d67-e3a0-4bff-8480-bc853e323d89" />
<img width="1091" height="645" alt="image" src="https://github.com/user-attachments/assets/4c74d796-f731-4670-9189-1219106662b3" />
<img width="1366" height="768" alt="image" src="https://github.com/user-attachments/assets/0a0f3f79-e00e-45a2-a030-29f28489bd94" />
# Enterprise Multi-Tenant Security Gateway

CSC337 Advanced Web Technologies, Lab Assignment 05.
A secure Node.js API with hybrid authentication (local bcrypt + GitHub OAuth 2.0), JWT access and refresh token rotation, role-based access control, and OWASP hardening.

## Live Links

- **Live app:** https://csc337-lab05-gateway.onrender.com
- **API base URL:** https://csc337-lab05-gateway.onrender.com/api/v1
- **Repository:** https://github.com/suhanailyas/csc337-lab05-gateway

> Hosted on Render's free tier. The first request after inactivity can take 30 to 60 seconds.

## Tech Stack

Node.js, Express 4, MongoDB Atlas (Mongoose), Passport.js (GitHub OAuth 2.0), JSON Web Tokens, bcryptjs, Helmet, CORS, express-rate-limit, express-mongo-sanitize, xss-clean.

## Features

- [x] Local register and login with **bcrypt** (12 salt rounds). No plain-text passwords.
- [x] **Rate limiting:** max 5 failed login attempts per 15 minutes per IP (HTTP 429).
- [x] **GitHub OAuth 2.0** login with automatic profile sync.
- [x] **Access token:** JWT, 15 minutes, sent via `Authorization: Bearer`.
- [x] **Refresh token:** 7 days, stored in an `httpOnly`, `Secure`, `SameSite=Strict` cookie.
- [x] **Refresh token rotation** with reuse detection (reusing an old token revokes all sessions).
- [x] **Token revocation** on logout (refresh tokens are stored hashed with SHA-256).
- [x] **RBAC** with SuperAdmin, Manager and Employee roles via `checkRole([...])` middleware.
- [x] **Helmet** security headers.
- [x] **Strict CORS** (single allowed origin).
- [x] **Input sanitization** against NoSQL injection and XSS, plus a 10kb body limit.

## API Endpoints

| Method | Endpoint | Access |
|---|---|---|
| POST | `/api/v1/auth/register` | Public (role is always Employee) |
| POST | `/api/v1/auth/login` | Public (rate limited) |
| POST | `/api/v1/auth/refresh` | Valid refresh cookie |
| POST | `/api/v1/auth/logout` | Revokes refresh token |
| GET | `/api/v1/auth/github` | Starts GitHub OAuth login |
| GET | `/api/v1/employee/profile` | SuperAdmin, Manager, Employee |
| POST | `/api/v1/payroll/approve` | SuperAdmin, Manager |
| DELETE | `/api/v1/users/:id` | SuperAdmin only |

## Test Credentials

| Role | Email | Password |
|---|---|---|
| SuperAdmin | superadmin@test.com | Admin@12345 |
| Manager | manager@test.com | Manager@12345 |
| Employee | employee@test.com | Employee@12345 |

## Local Setup

```bash
git clone https://github.com/suhanailyas/csc337-lab05-gateway.git
cd csc337-lab05-gateway
npm install
```

Create a `.env` file with these variable names:

```
PORT=3000
MONGO_URI=
JWT_ACCESS_SECRET=
JWT_REFRESH_SECRET=
BASE_URL=http://localhost:3000
CLIENT_URL=http://localhost:3000
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
```

```bash
npm run seed   # creates the three test accounts
npm start
```

## Quick Test (RBAC)

1. `POST /api/v1/auth/login` as Employee, copy the `accessToken`.
2. `POST /api/v1/payroll/approve` with `Authorization: Bearer <token>` returns **403**.
3. Repeat with the Manager token and it returns **200**.
4. `DELETE /api/v1/users/:id` with the Manager token returns **403**; only SuperAdmin succeeds.
