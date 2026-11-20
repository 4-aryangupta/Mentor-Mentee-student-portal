# Viva Cheat Sheet — Mentor–Mentee Student Portal

### 1. What is JWT authentication?
JWT (JSON Web Token) is a signed token containing claims such as the user's ID and role. The API verifies its signature and expiry before allowing protected requests. This project uses a short-lived access token and an HTTP-only refresh cookie.

### 2. Why keep the refresh token in an HTTP-only cookie?
JavaScript cannot read an HTTP-only cookie, which reduces exposure to token theft through client-side script injection. The access token stays in React memory and is refreshed after a page reload.

### 3. What is middleware in Express?
Middleware is a function that runs during the request-response cycle. It can inspect a request, attach the authenticated user, validate input, enforce roles, or pass errors to a central handler.

### 4. What is RBAC?
Role-Based Access Control grants permissions according to a user's role. The portal has admin, mentor, and student roles. Role checks are combined with record ownership and active-assignment checks.

### 5. How are Sequelize associations used here?
Sequelize associations define model relationships. A user has many mentorship records as mentor or student; mentorship belongs to both users. Reports, sessions, and feedback also reference their student and mentor users.

### 6. Why use MySQL and Sequelize instead of MongoDB and Mongoose?
The portal has structured, relational data with foreign keys, one-active-mentor rules, joins, and aggregate reporting. MySQL provides relational constraints and transactions; Sequelize maps relational tables to JavaScript models and provides validation and query APIs.

### 7. What is an index and why do we need it?
An index is an auxiliary data structure that helps MySQL locate matching rows without scanning an entire table. The project indexes mentorship mentor/status, report student/submission date, and session mentor/date because those columns are common filters and sort keys.

### 8. What is SQL GROUP BY aggregation?
`GROUP BY` groups rows with the same key so aggregate functions such as `COUNT()` can calculate summaries per group. The dashboard uses it for sessions by status, reports by month, and active students per mentor.

### 9. How does the portal prevent two active mentors for one student?
The reassignment operation runs in a transaction: it completes the old active assignment and creates the new one. The MySQL schema also uses a generated column that is non-NULL only for active assignments, with a unique index on that value.

### 10. Why is deleting a user implemented as soft deactivation?
Mentorship and academic history must remain auditable. The API sets `is_active` to false rather than physically deleting the user, and the authentication middleware blocks deactivated accounts.
