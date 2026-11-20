CREATE DATABASE IF NOT EXISTS mentor_mentee_portal
  CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
USE mentor_mentee_portal;

CREATE TABLE IF NOT EXISTS users (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(160) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('admin','mentor','student') NOT NULL DEFAULT 'student',
  phone VARCHAR(20) NULL,
  department VARCHAR(100) NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id), UNIQUE KEY uq_users_email (email),
  KEY idx_users_role_active (role, is_active)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS mentorships (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  mentor_id INT UNSIGNED NOT NULL,
  student_id INT UNSIGNED NOT NULL,
  assigned_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  status ENUM('active','completed') NOT NULL DEFAULT 'active',
  active_student_id INT UNSIGNED GENERATED ALWAYS AS (CASE WHEN status = 'active' THEN student_id ELSE NULL END) STORED,
  PRIMARY KEY (id), UNIQUE KEY uq_one_active_mentor_per_student (active_student_id),
  KEY idx_mentorship_mentor_status (mentor_id, status),
  KEY idx_mentorship_student_status (student_id, status),
  CONSTRAINT fk_mentorship_mentor FOREIGN KEY (mentor_id) REFERENCES users(id) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_mentorship_student FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS progress_reports (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  student_id INT UNSIGNED NOT NULL,
  mentor_id INT UNSIGNED NULL,
  academic_performance TEXT NOT NULL,
  achievements TEXT NULL,
  challenges TEXT NULL,
  remarks TEXT NULL,
  submitted_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id), KEY idx_progress_student_submitted (student_id, submitted_at),
  CONSTRAINT fk_progress_student FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_progress_mentor FOREIGN KEY (mentor_id) REFERENCES users(id) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS sessions (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  mentor_id INT UNSIGNED NOT NULL,
  student_id INT UNSIGNED NOT NULL,
  session_date DATETIME NOT NULL,
  topic VARCHAR(180) NOT NULL,
  status ENUM('scheduled','completed','cancelled') NOT NULL DEFAULT 'scheduled',
  meeting_notes TEXT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id), KEY idx_sessions_mentor_date (mentor_id, session_date), KEY idx_sessions_student_date (student_id, session_date),
  CONSTRAINT fk_sessions_mentor FOREIGN KEY (mentor_id) REFERENCES users(id) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_sessions_student FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS feedback (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  mentor_id INT UNSIGNED NOT NULL,
  student_id INT UNSIGNED NOT NULL,
  message TEXT NOT NULL,
  rating TINYINT UNSIGNED NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id), KEY idx_feedback_student_created (student_id, created_at), KEY idx_feedback_mentor_created (mentor_id, created_at),
  CONSTRAINT chk_feedback_rating CHECK (rating BETWEEN 1 AND 5),
  CONSTRAINT fk_feedback_mentor FOREIGN KEY (mentor_id) REFERENCES users(id) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_feedback_student FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB;
