# Mentor–Mentee Portal — ER Diagram

```mermaid
erDiagram
    USERS {
        int id PK
        varchar name
        varchar email UK
        varchar password_hash
        enum role
        varchar phone
        varchar department
        boolean is_active
        datetime created_at
        datetime updated_at
    }
    MENTORSHIPS {
        int id PK
        int mentor_id FK
        int student_id FK
        datetime assigned_at
        enum status
    }
    PROGRESS_REPORTS {
        int id PK
        int student_id FK
        int mentor_id FK
        text academic_performance
        text achievements
        text challenges
        text remarks
        datetime submitted_at
    }
    SESSIONS {
        int id PK
        int mentor_id FK
        int student_id FK
        datetime session_date
        varchar topic
        enum status
        text meeting_notes
        datetime created_at
        datetime updated_at
    }
    FEEDBACK {
        int id PK
        int mentor_id FK
        int student_id FK
        text message
        tinyint rating
        datetime created_at
    }
    USERS ||--o{ MENTORSHIPS : mentors
    USERS ||--o{ MENTORSHIPS : mentees
    USERS ||--o{ PROGRESS_REPORTS : submits
    USERS o|--o{ PROGRESS_REPORTS : reviews
    USERS ||--o{ SESSIONS : mentors
    USERS ||--o{ SESSIONS : attends
    USERS ||--o{ FEEDBACK : writes
    USERS ||--o{ FEEDBACK : receives
```

A student's current mentor is the `mentorships` row with `status = 'active'`. Completed rows are retained as assignment history. In `schema.sql`, a generated nullable `active_student_id` column and unique index enforce at most one active mentor per student at the database level. User deletion is soft deactivation (`users.is_active = 0`) so historical records remain available.
