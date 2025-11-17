-- Script para crear las tablas faltantes en la base de datos academia_final
-- Ejecuta este script en MySQL si faltan algunas tablas

USE academia_final;

-- ===========================================================
-- TABLA DE CICLOS (si no existe)
-- ===========================================================
CREATE TABLE IF NOT EXISTS cycles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  duration_months TINYINT,
  status ENUM('open','in_progress','closed') DEFAULT 'open',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ===========================================================
-- CURSOS Y PAQUETES OFERTADOS POR CICLO (si no existen)
-- ===========================================================
CREATE TABLE IF NOT EXISTS course_offerings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  course_id INT NOT NULL,
  cycle_id INT NOT NULL,
  group_label VARCHAR(50),
  teacher_id INT,
  price_override DECIMAL(10,2) DEFAULT NULL,
  capacity INT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
  FOREIGN KEY (cycle_id) REFERENCES cycles(id) ON DELETE CASCADE,
  FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS package_offerings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  package_id INT NOT NULL,
  cycle_id INT NOT NULL,
  group_label VARCHAR(50),
  price_override DECIMAL(10,2) DEFAULT NULL,
  capacity INT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (package_id) REFERENCES packages(id) ON DELETE CASCADE,
  FOREIGN KEY (cycle_id) REFERENCES cycles(id) ON DELETE CASCADE
);

-- ===========================================================
-- PLANES DE PAGO Y CUOTAS (si no existen)
-- ===========================================================
CREATE TABLE IF NOT EXISTS payment_plans (
  id INT AUTO_INCREMENT PRIMARY KEY,
  enrollment_id INT NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  installments INT DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (enrollment_id) REFERENCES enrollments(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS installments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  payment_plan_id INT NOT NULL,
  installment_number TINYINT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  due_date DATE NOT NULL,
  paid_at DATETIME NULL,
  status ENUM('pending','paid','overdue') DEFAULT 'pending',
  voucher_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (payment_plan_id) REFERENCES payment_plans(id) ON DELETE CASCADE
);

-- ===========================================================
-- TABLA ANALÍTICA (si no existe)
-- ===========================================================
CREATE TABLE IF NOT EXISTS analytics_summary (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  cycle_id INT NOT NULL,
  attendance_pct DECIMAL(5,2) DEFAULT 0,
  total_paid DECIMAL(10,2) DEFAULT 0,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(id),
  FOREIGN KEY (cycle_id) REFERENCES cycles(id),
  UNIQUE KEY unique_student_cycle (student_id, cycle_id)
);

-- ===========================================================
-- ACTUALIZAR TABLA SCHEDULES (si existe pero tiene estructura incorrecta)
-- ===========================================================
-- Verificar si schedules tiene course_offering_id
-- Si no, necesitarás actualizar la estructura

-- ===========================================================
-- ACTUALIZAR TABLA ENROLLMENTS (si existe pero le faltan campos)
-- ===========================================================
-- Verificar si enrollments tiene los campos necesarios:
-- - course_offering_id
-- - package_offering_id
-- - enrollment_type
-- - status
-- - accepted_by_admin_id
-- - accepted_at

-- ===========================================================
-- ACTUALIZAR TABLA NOTIFICATIONS_LOG (si existe pero le falta student_id)
-- ===========================================================
-- Verificar si notifications_log tiene student_id
-- Si no, agregarlo:
-- ALTER TABLE notifications_log ADD COLUMN student_id INT NOT NULL AFTER id;
-- ALTER TABLE notifications_log ADD FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE;

-- ===========================================================
-- ÍNDICES CLAVE (si no existen)
-- ===========================================================
CREATE INDEX IF NOT EXISTS idx_enroll_student ON enrollments(student_id);
CREATE INDEX IF NOT EXISTS idx_offering_cycle ON course_offerings(cycle_id);
CREATE INDEX IF NOT EXISTS idx_installment_due ON installments(due_date);
CREATE INDEX IF NOT EXISTS idx_attendance_student_date ON attendance(student_id, date);

-- ===========================================================
-- VERIFICAR Y ELIMINAR TABLA PAYMENTS SI EXISTE (no está en el diseño)
-- ===========================================================
-- Si existe una tabla "payments" que no debería estar:
-- DROP TABLE IF EXISTS payments;

