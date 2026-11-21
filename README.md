# Mentor–Mentee Student Portal

A full-stack college mentorship portal implemented with a relational MySQL database. Admins manage users and mentor assignments; mentors work with their assigned students; students submit academic progress and review sessions and mentor feedback.

## Stack

- **Database:** MySQL 8
- **API:** Node.js, Express, Sequelize, mysql2
- **Client:** React 18, Vite, React Router DOM, Axios
- **Security:** bcryptjs password hashing, short-lived JWT access tokens, HTTP-only refresh cookie, role-based and assignment-level authorization
- **UI:** Plain CSS, CSS variables, Fraunces headings, DM Sans interface, lucide-react icons

## Prerequisites

Install Node.js 20+ and MySQL 8. Ensure the MySQL service is running and that your database account can create a database and tables.

## Setup

### 1. Create the database schema

From the project root, run:

```bash
mysql -u root -p < schema.sql
```

In Windows PowerShell, use `Get-Content .\schema.sql | mysql -u root -p`. To copy an environment file in PowerShell, use `Copy-Item .env.example .env`.

This creates the `mentor_mentee_portal` database and all five application tables, constraints, and indexes. The schema includes a generated-column unique index that enforces one active mentor per student.

### 2. Configure and start the API

```bash
cd server
cp .env.example .env
```

Edit `server/.env` and set `DB_USER`, `DB_PASSWORD`, and long random values for `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET`. Keep `CLIENT_URL=http://localhost:5173` for the default Vite address.

```bash
npm install
npm run seed
npm run dev
```

The API runs at `http://localhost:5000`. Check `http://localhost:5000/api/health` for its health response. `npm run seed` is safe to rerun: it creates the demo accounts and sample records only when they do not already exist.

### 3. Configure and start the React client

Open a second terminal:

```bash
cd client
cp .env.example .env
npm install
npm run dev
```

Open `http://localhost:5173`. The client reads its API origin from `VITE_API_URL` (default: `http://localhost:5000/api`).

### 4. Demo logins

| Role | Email | Password |
|---|---|---|
| Admin | `admin@portal.edu` | `Admin@123` |
| Mentor 1 | `mentor1@portal.edu` | `Mentor@123` |
| Mentor 2 | `mentor2@portal.edu` | `Mentor@123` |
| Mentor 3 | `mentor3@portal.edu` | `Mentor@123` |
| Student 1–10 | `student1@portal.edu` … `student10@portal.edu` | `Student@123` |

The seed creates three mentors, ten students, active assignments, progress reports, future and completed sessions, and feedback. Demo passwords are for local evaluation only; change them before any real deployment.

## Main API routes

All routes are under `/api`.

| Resource | Routes |
|---|---|
| Auth | `POST /auth/register`, `POST /auth/login`, `POST /auth/refresh`, `POST /auth/logout` |
| Users | `GET /users`, `GET /users/:id`, `POST /users`, `PUT /users/:id`, `DELETE /users/:id` (soft deactivate) |
| Mentorships | `GET /mentorships`, `GET /mentorships/:id`, `POST /mentorships`, `PUT /mentorships/:id`, `DELETE /mentorships/:id` |
| Progress | `GET /progress`, `GET /progress/:id`, `POST /progress`, `PUT /progress/:id`, `DELETE /progress/:id` |
| Sessions | `GET /sessions`, `GET /sessions/:id`, `POST /sessions`, `PUT /sessions/:id`, `DELETE /sessions/:id` |
| Feedback | `GET /feedback`, `GET /feedback/:id`, `POST /feedback`, `PUT /feedback/:id`, `DELETE /feedback/:id` |
| Dashboard | `GET /dashboard` |

The Postman collection at `postman_collection.json` includes all routes, request headers, sample bodies, and example response payloads. Import it into Postman and set `baseUrl` to `http://localhost:5000/api`. The login request stores the access token in the collection variable automatically.

## Why MySQL + Sequelize instead of MongoDB + Mongoose?

This portal models strongly related records: a student has a mentor assignment history, progress reports, sessions, and feedback. MySQL provides foreign keys, transactions, indexes, and relational integrity for these relationships. A database-level unique index enforces the one-active-mentor rule, while SQL `GROUP BY` queries power the dashboard summaries. Sequelize provides JavaScript models, associations, validation, and transaction support over MySQL. This makes the relational rules explicit instead of recreating them with application-level document references.

## Notes on access and security

- Registration always creates a `student` account; users cannot self-register as admin or mentor.
- The student's ID for progress submission is derived from the verified access token, never trusted from request input.
- Mentors can view students and records only while an active mentorship assignment exists.
- Students can view and change only their own profile and records; mentors can review assigned students' progress reports and write feedback or meeting notes.
- User deletion is a soft deactivation. Historical mentorship and academic records remain in the database.
- The access token is held in React memory. A short-lived access token is renewed through an HTTP-only refresh cookie after a page reload.
- CORS accepts only the configured `CLIENT_URL` origin.

## Project map

```text
mentor-mentee-portal/
├── schema.sql
├── server/
│   ├── scripts/seed.js
│   └── src/{config,controllers,middleware,models,routes,utils}/
├── client/
│   └── src/{assets,components,context,hooks,pages,routes,services}/
├── docs/
│   ├── ER_diagram.md
│   └── viva_cheatsheet.md
└── postman_collection.json
```
