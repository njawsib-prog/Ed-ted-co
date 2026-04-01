-- ============================================================
-- EdTech Platform - Seed Data for Testing
-- ============================================================
-- Covers all 27 tables with realistic dummy data
--
-- All seed records use fixed UUIDs so the file is idempotent
-- (safe to run multiple times - uses ON CONFLICT DO NOTHING).
--
-- Passwords for all seeded users: admin123
-- (bcrypt hash: $2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYIBTkQWUSa)
--
-- Prerequisites: run migrations 001, 002, 003 first.
-- Usage: paste into Supabase SQL Editor, or run via psql:
--   psql $DATABASE_URL -f seed.sql
-- ============================================================

BEGIN;

-- ============================================================
-- BRANCHES
-- ============================================================
INSERT INTO branches (id, name, location, contact, email, is_active, settings) VALUES
  (
    '00000001-0000-0000-0000-000000000001',
    'Mumbai Main Branch',
    'Andheri West, Mumbai, Maharashtra 400053',
    '+91-22-1234-5678',
    'mumbai@edtech.com',
    true,
    '{"timezone": "Asia/Kolkata", "currency": "INR"}'
  ),
  (
    '00000001-0000-0000-0000-000000000002',
    'Delhi Branch',
    'Connaught Place, New Delhi 110001',
    '+91-11-8765-4321',
    'delhi@edtech.com',
    true,
    '{"timezone": "Asia/Kolkata", "currency": "INR"}'
  )
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- USERS
-- ============================================================
-- Branch Admin 1 – Mumbai | password: admin123
-- Branch Admin 2 – Delhi  | password: admin123
-- Students 1–5            | password: admin123
INSERT INTO users (id, email, password_hash, role, branch_id, is_active) VALUES
  (
    '00000002-0000-0000-0000-000000000001',
    'admin.mumbai@edtech.com',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYIBTkQWUSa',
    'branch_admin',
    '00000001-0000-0000-0000-000000000001',
    true
  ),
  (
    '00000002-0000-0000-0000-000000000002',
    'admin.delhi@edtech.com',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYIBTkQWUSa',
    'branch_admin',
    '00000001-0000-0000-0000-000000000002',
    true
  ),
  (
    '00000002-0000-0000-0000-000000000011',
    'rahul.sharma@gmail.com',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYIBTkQWUSa',
    'student',
    '00000001-0000-0000-0000-000000000001',
    true
  ),
  (
    '00000002-0000-0000-0000-000000000012',
    'priya.patel@gmail.com',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYIBTkQWUSa',
    'student',
    '00000001-0000-0000-0000-000000000001',
    true
  ),
  (
    '00000002-0000-0000-0000-000000000013',
    'amit.kumar@gmail.com',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYIBTkQWUSa',
    'student',
    '00000001-0000-0000-0000-000000000001',
    true
  ),
  (
    '00000002-0000-0000-0000-000000000014',
    'sneha.joshi@gmail.com',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYIBTkQWUSa',
    'student',
    '00000001-0000-0000-0000-000000000002',
    true
  ),
  (
    '00000002-0000-0000-0000-000000000015',
    'vikram.singh@gmail.com',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYIBTkQWUSa',
    'student',
    '00000001-0000-0000-0000-000000000002',
    true
  )
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- ADMINS
-- ============================================================
INSERT INTO admins (id, user_id, branch_id, name, phone, permissions) VALUES
  (
    '00000003-0000-0000-0000-000000000001',
    '00000002-0000-0000-0000-000000000001',
    '00000001-0000-0000-0000-000000000001',
    'Rajesh Kumar',
    '+91-9876543210',
    '{"manage_students": true, "manage_tests": true, "manage_payments": true, "manage_attendance": true}'
  ),
  (
    '00000003-0000-0000-0000-000000000002',
    '00000002-0000-0000-0000-000000000002',
    '00000001-0000-0000-0000-000000000002',
    'Pooja Mehta',
    '+91-9876543211',
    '{"manage_students": true, "manage_tests": true, "manage_payments": true, "manage_attendance": true}'
  )
ON CONFLICT (id) DO NOTHING;

-- Link admins to their branches
UPDATE branches
SET admin_user_id = '00000002-0000-0000-0000-000000000001'
WHERE id = '00000001-0000-0000-0000-000000000001'
  AND admin_user_id IS NULL;

UPDATE branches
SET admin_user_id = '00000002-0000-0000-0000-000000000002'
WHERE id = '00000001-0000-0000-0000-000000000002'
  AND admin_user_id IS NULL;

-- ============================================================
-- COURSES  (fixed UUIDs; migration 001 inserts with random UUIDs)
-- ============================================================
INSERT INTO courses (id, title, description, duration_months, fee, is_active) VALUES
  (
    '00000004-0000-0000-0000-000000000001',
    'Full Stack Development',
    'Complete web development covering React, Node.js, and PostgreSQL',
    12,
    50000.00,
    true
  ),
  (
    '00000004-0000-0000-0000-000000000002',
    'Data Science & AI',
    'Python, ML, Deep Learning, and data visualisation',
    6,
    35000.00,
    true
  ),
  (
    '00000004-0000-0000-0000-000000000003',
    'Digital Marketing',
    'SEO, SEM, Social Media Marketing, Email Marketing, Analytics',
    3,
    15000.00,
    true
  )
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- MODULES
-- ============================================================
INSERT INTO modules (id, course_id, title, description, order_index) VALUES
  -- Full Stack Development
  ('00000006-0000-0000-0000-000000000001', '00000004-0000-0000-0000-000000000001', 'Frontend Fundamentals',  'HTML, CSS, JavaScript basics',                       1),
  ('00000006-0000-0000-0000-000000000002', '00000004-0000-0000-0000-000000000001', 'React Development',      'React, Redux, Hooks, Context API',                   2),
  ('00000006-0000-0000-0000-000000000003', '00000004-0000-0000-0000-000000000001', 'Backend with Node.js',   'Express.js, REST APIs, JWT Authentication',           3),
  -- Data Science & AI
  ('00000006-0000-0000-0000-000000000004', '00000004-0000-0000-0000-000000000002', 'Python for Data Science','NumPy, Pandas, Matplotlib',                           1),
  ('00000006-0000-0000-0000-000000000005', '00000004-0000-0000-0000-000000000002', 'Machine Learning',       'Supervised/Unsupervised Learning, Scikit-learn',      2),
  -- Digital Marketing
  ('00000006-0000-0000-0000-000000000006', '00000004-0000-0000-0000-000000000003', 'SEO & SEM',              'Search Engine Optimisation and Marketing',            1),
  ('00000006-0000-0000-0000-000000000007', '00000004-0000-0000-0000-000000000003', 'Social Media Marketing', 'Facebook, Instagram, LinkedIn Ads',                   2)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- SUBJECTS
-- ============================================================
INSERT INTO subjects (id, module_id, title, description, order_index) VALUES
  -- Frontend Fundamentals
  ('00000007-0000-0000-0000-000000000001', '00000006-0000-0000-0000-000000000001', 'HTML5 & Semantic Web',     'Semantic HTML, forms, accessibility',              1),
  ('00000007-0000-0000-0000-000000000002', '00000006-0000-0000-0000-000000000001', 'CSS3 & Flexbox/Grid',      'Responsive design, animations',                    2),
  ('00000007-0000-0000-0000-000000000003', '00000006-0000-0000-0000-000000000001', 'JavaScript ES6+',          'Promises, async/await, modules, closures',          3),
  -- React Development
  ('00000007-0000-0000-0000-000000000004', '00000006-0000-0000-0000-000000000002', 'React Core Concepts',      'Components, props, state, lifecycle',               1),
  ('00000007-0000-0000-0000-000000000005', '00000006-0000-0000-0000-000000000002', 'State Management',         'Redux Toolkit, thunks, selectors',                  2),
  -- Python for Data Science
  ('00000007-0000-0000-0000-000000000006', '00000006-0000-0000-0000-000000000004', 'NumPy & Pandas',           'Data manipulation and analysis',                    1),
  ('00000007-0000-0000-0000-000000000007', '00000006-0000-0000-0000-000000000004', 'Data Visualisation',       'Matplotlib, Seaborn, Plotly',                       2)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- BATCHES
-- ============================================================
INSERT INTO batches (id, branch_id, course_id, name, description, start_date, end_date, schedule, capacity, is_active) VALUES
  (
    '00000008-0000-0000-0000-000000000001',
    '00000001-0000-0000-0000-000000000001',
    '00000004-0000-0000-0000-000000000001',
    'FS-MUM-2024-A',
    'Full Stack January 2024 Batch – Mumbai',
    '2024-01-15', '2025-01-14',
    '{"days": ["Monday", "Wednesday", "Friday"], "time": "10:00 AM - 12:00 PM"}',
    30, true
  ),
  (
    '00000008-0000-0000-0000-000000000002',
    '00000001-0000-0000-0000-000000000001',
    '00000004-0000-0000-0000-000000000002',
    'DS-MUM-2024-A',
    'Data Science February 2024 Batch – Mumbai',
    '2024-02-01', '2024-07-31',
    '{"days": ["Tuesday", "Thursday", "Saturday"], "time": "02:00 PM - 04:00 PM"}',
    25, true
  ),
  (
    '00000008-0000-0000-0000-000000000003',
    '00000001-0000-0000-0000-000000000002',
    '00000004-0000-0000-0000-000000000001',
    'FS-DEL-2024-A',
    'Full Stack January 2024 Batch – Delhi',
    '2024-01-20', '2025-01-19',
    '{"days": ["Monday", "Wednesday", "Friday"], "time": "11:00 AM - 01:00 PM"}',
    20, true
  ),
  (
    '00000008-0000-0000-0000-000000000004',
    '00000001-0000-0000-0000-000000000002',
    '00000004-0000-0000-0000-000000000003',
    'DM-DEL-2024-A',
    'Digital Marketing March 2024 Batch – Delhi',
    '2024-03-01', '2024-05-31',
    '{"days": ["Tuesday", "Thursday"], "time": "04:00 PM - 06:00 PM"}',
    15, true
  )
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- STUDENTS
-- ============================================================
INSERT INTO students (id, user_id, branch_id, course_id, student_code, name, email, phone, address, date_of_birth, gender, status, defaulter_flag, enrollment_date) VALUES
  (
    '00000005-0000-0000-0000-000000000001',
    '00000002-0000-0000-0000-000000000011',
    '00000001-0000-0000-0000-000000000001',
    '00000004-0000-0000-0000-000000000001',
    'STU-MUM-001', 'Rahul Sharma',   'rahul.sharma@gmail.com', '+91-9876543001',
    '123 MG Road, Andheri, Mumbai 400001',
    '2000-05-15', 'male',   'active',    false, '2024-01-15'
  ),
  (
    '00000005-0000-0000-0000-000000000002',
    '00000002-0000-0000-0000-000000000012',
    '00000001-0000-0000-0000-000000000001',
    '00000004-0000-0000-0000-000000000001',
    'STU-MUM-002', 'Priya Patel',    'priya.patel@gmail.com',  '+91-9876543002',
    '456 Linking Road, Bandra, Mumbai 400050',
    '2001-08-22', 'female', 'active',    false, '2024-01-15'
  ),
  (
    '00000005-0000-0000-0000-000000000003',
    '00000002-0000-0000-0000-000000000013',
    '00000001-0000-0000-0000-000000000001',
    '00000004-0000-0000-0000-000000000002',
    'STU-MUM-003', 'Amit Kumar',     'amit.kumar@gmail.com',   '+91-9876543003',
    '789 Juhu Beach Road, Mumbai 400049',
    '1999-12-10', 'male',   'active',    false, '2024-02-01'
  ),
  (
    '00000005-0000-0000-0000-000000000004',
    '00000002-0000-0000-0000-000000000014',
    '00000001-0000-0000-0000-000000000002',
    '00000004-0000-0000-0000-000000000001',
    'STU-DEL-001', 'Sneha Joshi',    'sneha.joshi@gmail.com',  '+91-9876543004',
    '12 Connaught Place, New Delhi 110001',
    '2002-03-18', 'female', 'active',    false, '2024-01-20'
  ),
  -- Vikram is inactive with defaulter_flag=true: enrolled but never paid (see rejected payment
  -- REC-DEL-2024-002). Useful for testing defaulter lists and payment-rejection flows.
  (
    '00000005-0000-0000-0000-000000000005',
    '00000002-0000-0000-0000-000000000015',
    '00000001-0000-0000-0000-000000000002',
    '00000004-0000-0000-0000-000000000003',
    'STU-DEL-002', 'Vikram Singh',   'vikram.singh@gmail.com', '+91-9876543005',
    '34 Nehru Place, New Delhi 110019',
    '2000-07-25', 'male',   'inactive',  true,  '2024-03-01'
  )
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- BATCH_STUDENTS
-- ============================================================
INSERT INTO batch_students (id, batch_id, student_id) VALUES
  ('00000009-0000-0000-0000-000000000001', '00000008-0000-0000-0000-000000000001', '00000005-0000-0000-0000-000000000001'),
  ('00000009-0000-0000-0000-000000000002', '00000008-0000-0000-0000-000000000001', '00000005-0000-0000-0000-000000000002'),
  ('00000009-0000-0000-0000-000000000003', '00000008-0000-0000-0000-000000000002', '00000005-0000-0000-0000-000000000003'),
  ('00000009-0000-0000-0000-000000000004', '00000008-0000-0000-0000-000000000003', '00000005-0000-0000-0000-000000000004'),
  ('00000009-0000-0000-0000-000000000005', '00000008-0000-0000-0000-000000000004', '00000005-0000-0000-0000-000000000005')
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- TIMETABLES
-- ============================================================
-- day_of_week: 0=Sunday, 1=Monday, 2=Tuesday, 3=Wednesday, 4=Thursday, 5=Friday, 6=Saturday
INSERT INTO timetables (id, branch_id, course_id, day_of_week, time_start, time_end, subject, teacher, room) VALUES
  -- Mumbai – Full Stack
  ('0000000a-0000-0000-0000-000000000001', '00000001-0000-0000-0000-000000000001', '00000004-0000-0000-0000-000000000001', 1, '10:00', '12:00', 'HTML & CSS',       'Prof. Anand Verma',  'Lab 1'),
  ('0000000a-0000-0000-0000-000000000002', '00000001-0000-0000-0000-000000000001', '00000004-0000-0000-0000-000000000001', 3, '10:00', '12:00', 'JavaScript',       'Prof. Anand Verma',  'Lab 1'),
  ('0000000a-0000-0000-0000-000000000003', '00000001-0000-0000-0000-000000000001', '00000004-0000-0000-0000-000000000001', 5, '10:00', '12:00', 'React.js',         'Prof. Meera Iyer',   'Lab 2'),
  -- Mumbai – Data Science
  ('0000000a-0000-0000-0000-000000000004', '00000001-0000-0000-0000-000000000001', '00000004-0000-0000-0000-000000000002', 2, '14:00', '16:00', 'Python Basics',    'Dr. Suresh Nair',    'Lab 3'),
  ('0000000a-0000-0000-0000-000000000005', '00000001-0000-0000-0000-000000000001', '00000004-0000-0000-0000-000000000002', 4, '14:00', '16:00', 'Machine Learning', 'Dr. Suresh Nair',    'Lab 3'),
  -- Delhi – Full Stack
  ('0000000a-0000-0000-0000-000000000006', '00000001-0000-0000-0000-000000000002', '00000004-0000-0000-0000-000000000001', 1, '11:00', '13:00', 'HTML & CSS',       'Prof. Kavita Sharma','Room A'),
  -- Delhi – Digital Marketing
  ('0000000a-0000-0000-0000-000000000007', '00000001-0000-0000-0000-000000000002', '00000004-0000-0000-0000-000000000003', 2, '16:00', '18:00', 'SEO Fundamentals', 'Prof. Rajan Malhotra','Room B')
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- STUDENT_DOCUMENTS
-- ============================================================
INSERT INTO student_documents (id, student_id, branch_id, doc_type, doc_name, file_url, uploaded_by) VALUES
  ('0000000b-0000-0000-0000-000000000001', '00000005-0000-0000-0000-000000000001', '00000001-0000-0000-0000-000000000001', 'aadhaar',       'Aadhaar Card – Rahul Sharma',  'https://storage.example.com/docs/rahul_aadhaar.pdf',   '00000003-0000-0000-0000-000000000001'),
  ('0000000b-0000-0000-0000-000000000002', '00000005-0000-0000-0000-000000000001', '00000001-0000-0000-0000-000000000001', '10th_marksheet','10th Marksheet – Rahul Sharma', 'https://storage.example.com/docs/rahul_10th.pdf',      '00000003-0000-0000-0000-000000000001'),
  ('0000000b-0000-0000-0000-000000000003', '00000005-0000-0000-0000-000000000002', '00000001-0000-0000-0000-000000000001', 'aadhaar',       'Aadhaar Card – Priya Patel',   'https://storage.example.com/docs/priya_aadhaar.pdf',   '00000003-0000-0000-0000-000000000001'),
  ('0000000b-0000-0000-0000-000000000004', '00000005-0000-0000-0000-000000000004', '00000001-0000-0000-0000-000000000002', 'aadhaar',       'Aadhaar Card – Sneha Joshi',   'https://storage.example.com/docs/sneha_aadhaar.pdf',   '00000003-0000-0000-0000-000000000002')
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- ATTENDANCE
-- ============================================================
INSERT INTO attendance (id, student_id, branch_id, date, status, marked_via, marked_by) VALUES
  -- Rahul (Mumbai Full Stack)
  ('0000000c-0000-0000-0000-000000000001', '00000005-0000-0000-0000-000000000001', '00000001-0000-0000-0000-000000000001', '2024-01-15', 'present', 'manual',     '00000003-0000-0000-0000-000000000001'),
  ('0000000c-0000-0000-0000-000000000002', '00000005-0000-0000-0000-000000000001', '00000001-0000-0000-0000-000000000001', '2024-01-17', 'present', 'qr',         '00000003-0000-0000-0000-000000000001'),
  ('0000000c-0000-0000-0000-000000000003', '00000005-0000-0000-0000-000000000001', '00000001-0000-0000-0000-000000000001', '2024-01-19', 'absent',  'manual',     '00000003-0000-0000-0000-000000000001'),
  ('0000000c-0000-0000-0000-000000000004', '00000005-0000-0000-0000-000000000001', '00000001-0000-0000-0000-000000000001', '2024-01-22', 'present', 'manual',     '00000003-0000-0000-0000-000000000001'),
  ('0000000c-0000-0000-0000-000000000005', '00000005-0000-0000-0000-000000000001', '00000001-0000-0000-0000-000000000001', '2024-01-24', 'late',    'manual',     '00000003-0000-0000-0000-000000000001'),
  -- Priya (Mumbai Full Stack)
  ('0000000c-0000-0000-0000-000000000006', '00000005-0000-0000-0000-000000000002', '00000001-0000-0000-0000-000000000001', '2024-01-15', 'present', 'manual',     '00000003-0000-0000-0000-000000000001'),
  ('0000000c-0000-0000-0000-000000000007', '00000005-0000-0000-0000-000000000002', '00000001-0000-0000-0000-000000000001', '2024-01-17', 'present', 'qr',         '00000003-0000-0000-0000-000000000001'),
  ('0000000c-0000-0000-0000-000000000008', '00000005-0000-0000-0000-000000000002', '00000001-0000-0000-0000-000000000001', '2024-01-19', 'present', 'manual',     '00000003-0000-0000-0000-000000000001'),
  -- Amit (Mumbai Data Science)
  ('0000000c-0000-0000-0000-000000000009', '00000005-0000-0000-0000-000000000003', '00000001-0000-0000-0000-000000000001', '2024-02-01', 'present', 'manual',     '00000003-0000-0000-0000-000000000001'),
  ('0000000c-0000-0000-0000-000000000010', '00000005-0000-0000-0000-000000000003', '00000001-0000-0000-0000-000000000001', '2024-02-06', 'excused', 'manual',     '00000003-0000-0000-0000-000000000001'),
  -- Sneha (Delhi Full Stack)
  ('0000000c-0000-0000-0000-000000000011', '00000005-0000-0000-0000-000000000004', '00000001-0000-0000-0000-000000000002', '2024-01-20', 'present', 'manual',     '00000003-0000-0000-0000-000000000002'),
  ('0000000c-0000-0000-0000-000000000012', '00000005-0000-0000-0000-000000000004', '00000001-0000-0000-0000-000000000002', '2024-01-22', 'present', 'qr',         '00000003-0000-0000-0000-000000000002')
ON CONFLICT (student_id, date) DO NOTHING;

-- ============================================================
-- TESTS
-- ============================================================
INSERT INTO tests (id, branch_id, course_id, title, description, time_limit_mins, total_marks, passing_marks, type, scheduled_at, is_active, instructions) VALUES
  (
    '0000000d-0000-0000-0000-000000000001',
    '00000001-0000-0000-0000-000000000001',
    '00000004-0000-0000-0000-000000000001',
    'JavaScript Fundamentals Quiz',
    'Test your understanding of ES6+ concepts',
    30, 50, 20, 'quiz',
    '2024-02-01 10:00:00+05:30',
    true,
    'Answer all 5 questions. Each question carries 10 marks. No negative marking.'
  ),
  (
    '0000000d-0000-0000-0000-000000000002',
    '00000001-0000-0000-0000-000000000001',
    '00000004-0000-0000-0000-000000000001',
    'React Components Exam',
    'Comprehensive exam on React.js fundamentals',
    60, 100, 40, 'exam',
    '2024-03-15 14:00:00+05:30',
    true,
    'Answer all questions. Each question carries 10 marks. Negative marking: -2 for wrong answers.'
  ),
  (
    '0000000d-0000-0000-0000-000000000003',
    '00000001-0000-0000-0000-000000000001',
    '00000004-0000-0000-0000-000000000002',
    'Python Basics Practice',
    'Practice test for Python fundamentals',
    45, 50, 20, 'practice',
    NULL,
    true,
    'Practice at your own pace.'
  ),
  (
    '0000000d-0000-0000-0000-000000000004',
    '00000001-0000-0000-0000-000000000002',
    '00000004-0000-0000-0000-000000000001',
    'HTML & CSS Assessment',
    'Assess your HTML and CSS knowledge',
    30, 50, 20, 'quiz',
    '2024-02-10 11:00:00+05:30',
    true,
    'Answer all 5 questions. Each correct answer = 10 marks.'
  )
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- QUESTIONS  (MCQ – options are 0-indexed)
-- ============================================================
INSERT INTO questions (id, test_id, question_text, options, correct_option, explanation, marks, negative_marks, order_index) VALUES
  -- JavaScript Fundamentals Quiz (test 1)
  (
    '0000000e-0000-0000-0000-000000000001',
    '0000000d-0000-0000-0000-000000000001',
    'Which keyword declares a block-scoped variable in ES6?',
    '[{"text": "var"}, {"text": "let"}, {"text": "const"}, {"text": "def"}]',
    1,
    '"let" declares a block-scoped, reassignable variable. "var" is function-scoped.',
    10, 0, 1
  ),
  (
    '0000000e-0000-0000-0000-000000000002',
    '0000000d-0000-0000-0000-000000000001',
    'What does the spread operator (...) do in JavaScript?',
    '[{"text": "Declares a rest parameter"}, {"text": "Expands an iterable into individual elements"}, {"text": "Creates a new array"}, {"text": "Loops through an array"}]',
    1,
    'The spread operator expands an iterable into individual elements.',
    10, 0, 2
  ),
  (
    '0000000e-0000-0000-0000-000000000003',
    '0000000d-0000-0000-0000-000000000001',
    'What is the output of: console.log(typeof null)?',
    '[{"text": "null"}, {"text": "undefined"}, {"text": "object"}, {"text": "boolean"}]',
    2,
    'typeof null returns "object" — a known JavaScript quirk.',
    10, 0, 3
  ),
  (
    '0000000e-0000-0000-0000-000000000004',
    '0000000d-0000-0000-0000-000000000001',
    'Which method converts a JSON string into a JavaScript object?',
    '[{"text": "JSON.stringify()"}, {"text": "JSON.parse()"}, {"text": "JSON.convert()"}, {"text": "JSON.objectify()"}]',
    1,
    'JSON.parse() converts a JSON string into a JS object.',
    10, 0, 4
  ),
  (
    '0000000e-0000-0000-0000-000000000005',
    '0000000d-0000-0000-0000-000000000001',
    'What is a Promise in JavaScript?',
    '[{"text": "A synchronous operation"}, {"text": "An object representing the eventual completion of an async operation"}, {"text": "A function that returns null"}, {"text": "A type of loop"}]',
    1,
    'A Promise represents the eventual completion or failure of an asynchronous operation.',
    10, 0, 5
  ),
  -- React Components Exam (test 2)
  (
    '0000000e-0000-0000-0000-000000000006',
    '0000000d-0000-0000-0000-000000000002',
    'Which hook handles side effects in React functional components?',
    '[{"text": "useState"}, {"text": "useContext"}, {"text": "useEffect"}, {"text": "useReducer"}]',
    2,
    'useEffect is used for data fetching, subscriptions, and other side effects.',
    10, 2, 1
  ),
  (
    '0000000e-0000-0000-0000-000000000007',
    '0000000d-0000-0000-0000-000000000002',
    'What is the virtual DOM in React?',
    '[{"text": "A lightweight in-memory copy of the real DOM"}, {"text": "A new HTML standard"}, {"text": "A React database"}, {"text": "A CSS framework"}]',
    0,
    'React keeps a virtual DOM in memory and syncs it with the real DOM efficiently.',
    10, 2, 2
  ),
  (
    '0000000e-0000-0000-0000-000000000008',
    '0000000d-0000-0000-0000-000000000002',
    'Which lifecycle method is called after a component mounts?',
    '[{"text": "componentWillMount"}, {"text": "componentDidMount"}, {"text": "componentWillUpdate"}, {"text": "shouldComponentUpdate"}]',
    1,
    'componentDidMount() fires after the component is inserted into the DOM.',
    10, 2, 3
  ),
  -- Python Basics Practice (test 3)
  (
    '0000000e-0000-0000-0000-000000000009',
    '0000000d-0000-0000-0000-000000000003',
    'Which Python library is primarily used for data manipulation?',
    '[{"text": "NumPy"}, {"text": "Pandas"}, {"text": "Matplotlib"}, {"text": "Scikit-learn"}]',
    1,
    'Pandas provides DataFrame and Series for data manipulation.',
    10, 0, 1
  ),
  (
    '0000000e-0000-0000-0000-000000000010',
    '0000000d-0000-0000-0000-000000000003',
    'What is the output of: len([1, 2, 3, 4, 5])?',
    '[{"text": "4"}, {"text": "5"}, {"text": "6"}, {"text": "0"}]',
    1,
    'len() returns the count of items; the list has 5 elements.',
    10, 0, 2
  ),
  -- HTML & CSS Assessment (test 4)
  (
    '0000000e-0000-0000-0000-000000000011',
    '0000000d-0000-0000-0000-000000000004',
    'What does HTML stand for?',
    '[{"text": "HyperText Markup Language"}, {"text": "Hyperlinks and Text Markup Language"}, {"text": "Home Tool Markup Language"}, {"text": "Hyper Transfer Markup Language"}]',
    0,
    'HTML = HyperText Markup Language, the standard language for web pages.',
    10, 0, 1
  ),
  (
    '0000000e-0000-0000-0000-000000000012',
    '0000000d-0000-0000-0000-000000000004',
    'Which CSS property changes the text colour?',
    '[{"text": "font-color"}, {"text": "text-color"}, {"text": "color"}, {"text": "foreground-color"}]',
    2,
    'The CSS "color" property sets the foreground/text colour.',
    10, 0, 2
  )
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- TEST_ASSIGNMENTS
-- ============================================================
INSERT INTO test_assignments (id, test_id, student_id, assigned_at, is_completed, start_time, end_time) VALUES
  -- JS Quiz
  ('0000000f-0000-0000-0000-000000000001', '0000000d-0000-0000-0000-000000000001', '00000005-0000-0000-0000-000000000001', '2024-01-30 09:00:00+05:30', true,  '2024-02-01 10:00:00+05:30', '2024-02-01 10:25:00+05:30'),
  ('0000000f-0000-0000-0000-000000000002', '0000000d-0000-0000-0000-000000000001', '00000005-0000-0000-0000-000000000002', '2024-01-30 09:00:00+05:30', true,  '2024-02-01 10:02:00+05:30', '2024-02-01 10:28:00+05:30'),
  ('0000000f-0000-0000-0000-000000000003', '0000000d-0000-0000-0000-000000000001', '00000005-0000-0000-0000-000000000003', '2024-01-30 09:00:00+05:30', false, NULL, NULL),
  -- React Exam
  ('0000000f-0000-0000-0000-000000000004', '0000000d-0000-0000-0000-000000000002', '00000005-0000-0000-0000-000000000001', '2024-03-10 09:00:00+05:30', true,  '2024-03-15 14:00:00+05:30', '2024-03-15 14:55:00+05:30'),
  ('0000000f-0000-0000-0000-000000000005', '0000000d-0000-0000-0000-000000000002', '00000005-0000-0000-0000-000000000002', '2024-03-10 09:00:00+05:30', false, NULL, NULL),
  -- Python Practice
  ('0000000f-0000-0000-0000-000000000006', '0000000d-0000-0000-0000-000000000003', '00000005-0000-0000-0000-000000000003', '2024-02-05 09:00:00+05:30', true,  '2024-02-10 15:00:00+05:30', '2024-02-10 15:40:00+05:30'),
  -- Delhi HTML Quiz
  ('0000000f-0000-0000-0000-000000000007', '0000000d-0000-0000-0000-000000000004', '00000005-0000-0000-0000-000000000004', '2024-02-08 09:00:00+05:30', true,  '2024-02-10 11:00:00+05:30', '2024-02-10 11:22:00+05:30')
ON CONFLICT (test_id, student_id) DO NOTHING;

-- ============================================================
-- RESULTS
-- ============================================================
INSERT INTO results (id, test_id, student_id, score, total, accuracy, time_taken_secs, answers, rank, submitted_at) VALUES
  -- JS Quiz – Rahul: 40/50 (4 correct, 1 wrong)
  (
    '00000010-0000-0000-0000-000000000001',
    '0000000d-0000-0000-0000-000000000001',
    '00000005-0000-0000-0000-000000000001',
    40, 50, 80.00, 1500,
    '{
      "0000000e-0000-0000-0000-000000000001": {"selected": 1, "is_correct": true},
      "0000000e-0000-0000-0000-000000000002": {"selected": 1, "is_correct": true},
      "0000000e-0000-0000-0000-000000000003": {"selected": 2, "is_correct": true},
      "0000000e-0000-0000-0000-000000000004": {"selected": 0, "is_correct": false},
      "0000000e-0000-0000-0000-000000000005": {"selected": 1, "is_correct": true}
    }',
    1, '2024-02-01 10:25:00+05:30'
  ),
  -- JS Quiz – Priya: 30/50 (3 correct, 2 wrong)
  (
    '00000010-0000-0000-0000-000000000002',
    '0000000d-0000-0000-0000-000000000001',
    '00000005-0000-0000-0000-000000000002',
    30, 50, 60.00, 1560,
    '{
      "0000000e-0000-0000-0000-000000000001": {"selected": 1, "is_correct": true},
      "0000000e-0000-0000-0000-000000000002": {"selected": 0, "is_correct": false},
      "0000000e-0000-0000-0000-000000000003": {"selected": 2, "is_correct": true},
      "0000000e-0000-0000-0000-000000000004": {"selected": 1, "is_correct": true},
      "0000000e-0000-0000-0000-000000000005": {"selected": 2, "is_correct": false}
    }',
    2, '2024-02-01 10:28:00+05:30'
  ),
  -- React Exam – Rahul: 70/100 (partial – 3 questions answered)
  (
    '00000010-0000-0000-0000-000000000003',
    '0000000d-0000-0000-0000-000000000002',
    '00000005-0000-0000-0000-000000000001',
    70, 100, 70.00, 3300,
    '{
      "0000000e-0000-0000-0000-000000000006": {"selected": 2, "is_correct": true},
      "0000000e-0000-0000-0000-000000000007": {"selected": 0, "is_correct": true},
      "0000000e-0000-0000-0000-000000000008": {"selected": 1, "is_correct": true}
    }',
    1, '2024-03-15 14:55:00+05:30'
  ),
  -- Python Practice – Amit: 10/50 (1 correct, 1 wrong)
  (
    '00000010-0000-0000-0000-000000000004',
    '0000000d-0000-0000-0000-000000000003',
    '00000005-0000-0000-0000-000000000003',
    10, 50, 20.00, 2400,
    '{
      "0000000e-0000-0000-0000-000000000009": {"selected": 1, "is_correct": true},
      "0000000e-0000-0000-0000-000000000010": {"selected": 0, "is_correct": false}
    }',
    1, '2024-02-10 15:40:00+05:30'
  ),
  -- Delhi HTML Quiz – Sneha: 10/50 (1 correct, 1 wrong)
  (
    '00000010-0000-0000-0000-000000000005',
    '0000000d-0000-0000-0000-000000000004',
    '00000005-0000-0000-0000-000000000004',
    10, 50, 20.00, 1320,
    '{
      "0000000e-0000-0000-0000-000000000011": {"selected": 0, "is_correct": true},
      "0000000e-0000-0000-0000-000000000012": {"selected": 1, "is_correct": false}
    }',
    1, '2024-02-10 11:22:00+05:30'
  )
ON CONFLICT (test_id, student_id) DO NOTHING;

-- ============================================================
-- STUDY_MATERIALS
-- ============================================================
INSERT INTO study_materials (id, branch_id, course_id, module_id, type, title, description, file_url, youtube_url, order_index, is_active) VALUES
  (
    '00000011-0000-0000-0000-000000000001',
    '00000001-0000-0000-0000-000000000001', '00000004-0000-0000-0000-000000000001', '00000006-0000-0000-0000-000000000001',
    'pdf', 'HTML5 Complete Reference Guide', 'Comprehensive guide covering all HTML5 elements',
    'https://storage.example.com/materials/html5-guide.pdf', NULL, 1, true
  ),
  (
    '00000011-0000-0000-0000-000000000002',
    '00000001-0000-0000-0000-000000000001', '00000004-0000-0000-0000-000000000001', '00000006-0000-0000-0000-000000000001',
    'video', 'CSS Flexbox Tutorial', 'Step-by-step video tutorial on CSS Flexbox and Grid',
    NULL, 'https://www.youtube.com/watch?v=fYq5PXgSsbE', 2, true
  ),
  (
    '00000011-0000-0000-0000-000000000003',
    '00000001-0000-0000-0000-000000000001', '00000004-0000-0000-0000-000000000001', '00000006-0000-0000-0000-000000000002',
    'link', 'React Official Documentation', 'Official React documentation and tutorials',
    'https://react.dev', NULL, 1, true
  ),
  (
    '00000011-0000-0000-0000-000000000004',
    '00000001-0000-0000-0000-000000000001', '00000004-0000-0000-0000-000000000002', '00000006-0000-0000-0000-000000000004',
    'pdf', 'Pandas Cheat Sheet', 'Quick reference for Pandas data manipulation',
    'https://storage.example.com/materials/pandas-cheatsheet.pdf', NULL, 1, true
  ),
  (
    '00000011-0000-0000-0000-000000000005',
    '00000001-0000-0000-0000-000000000002', '00000004-0000-0000-0000-000000000001', '00000006-0000-0000-0000-000000000001',
    'document', 'HTML Assignment – Week 1', 'First week HTML assignment for Delhi branch',
    'https://storage.example.com/materials/html-assignment-w1.docx', NULL, 1, true
  )
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- PAYMENTS
-- ============================================================
INSERT INTO payments (id, student_id, branch_id, amount, mode, status, receipt_number, transaction_id, note, verified_by, verified_at, payment_date) VALUES
  (
    '00000012-0000-0000-0000-000000000001',
    '00000005-0000-0000-0000-000000000001', '00000001-0000-0000-0000-000000000001',
    25000.00, 'upi', 'verified', 'REC-MUM-2024-001', 'UPI20240115001',
    'First instalment – Full Stack Development',
    '00000003-0000-0000-0000-000000000001', '2024-01-15 11:00:00+05:30', '2024-01-15'
  ),
  (
    '00000012-0000-0000-0000-000000000002',
    '00000005-0000-0000-0000-000000000001', '00000001-0000-0000-0000-000000000001',
    25000.00, 'bank_transfer', 'pending', 'REC-MUM-2024-002', 'NEFT20240601001',
    'Second instalment – Full Stack Development',
    NULL, NULL, '2024-06-01'
  ),
  (
    '00000012-0000-0000-0000-000000000003',
    '00000005-0000-0000-0000-000000000002', '00000001-0000-0000-0000-000000000001',
    50000.00, 'cash', 'verified', 'REC-MUM-2024-003', NULL,
    'Full payment – Full Stack Development',
    '00000003-0000-0000-0000-000000000001', '2024-01-16 10:00:00+05:30', '2024-01-16'
  ),
  (
    '00000012-0000-0000-0000-000000000004',
    '00000005-0000-0000-0000-000000000003', '00000001-0000-0000-0000-000000000001',
    35000.00, 'upi', 'verified', 'REC-MUM-2024-004', 'UPI20240201002',
    'Full payment – Data Science & AI',
    '00000003-0000-0000-0000-000000000001', '2024-02-01 09:30:00+05:30', '2024-02-01'
  ),
  (
    '00000012-0000-0000-0000-000000000005',
    '00000005-0000-0000-0000-000000000004', '00000001-0000-0000-0000-000000000002',
    25000.00, 'cheque', 'verified', 'REC-DEL-2024-001', 'CHQ123456',
    'First instalment – Full Stack Development (Delhi)',
    '00000003-0000-0000-0000-000000000002', '2024-01-22 12:00:00+05:30', '2024-01-20'
  ),
  (
    '00000012-0000-0000-0000-000000000006',
    '00000005-0000-0000-0000-000000000005', '00000001-0000-0000-0000-000000000002',
    15000.00, 'upi', 'rejected', 'REC-DEL-2024-002', 'UPI20240301003',
    'Payment rejected – transaction failed',
    NULL, NULL, '2024-03-01'
  )
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- NOTIFICATIONS
-- ============================================================
INSERT INTO notifications (id, branch_id, target_type, target_id, title, message, scheduled_at, sent_at) VALUES
  (
    '00000013-0000-0000-0000-000000000001',
    '00000001-0000-0000-0000-000000000001',
    'all', NULL,
    'Welcome to EdTech Platform!',
    'Dear students, welcome to our EdTech learning platform. Please complete your profile and start exploring your courses.',
    NULL, '2024-01-15 09:00:00+05:30'
  ),
  (
    '00000013-0000-0000-0000-000000000002',
    '00000001-0000-0000-0000-000000000001',
    'course', '00000004-0000-0000-0000-000000000001',
    'JavaScript Quiz – February 1st',
    'A JavaScript Fundamentals Quiz has been scheduled for February 1st at 10:00 AM. Please be prepared.',
    '2024-01-28 09:00:00+05:30', '2024-01-28 09:00:00+05:30'
  ),
  -- Draft notification: no scheduled_at and no sent_at → useful for testing unsent/draft state
  (
    '00000013-0000-0000-0000-000000000003',
    '00000001-0000-0000-0000-000000000001',
    'batch', '00000008-0000-0000-0000-000000000001',
    'Friday Class Rescheduled',
    'The Friday class for FS-MUM-2024-A has been rescheduled to Saturday 11 AM due to a public holiday.',
    NULL, NULL
  ),
  (
    '00000013-0000-0000-0000-000000000004',
    '00000001-0000-0000-0000-000000000001',
    'student', '00000005-0000-0000-0000-000000000001',
    'Payment Reminder',
    'Dear Rahul, your second instalment of ₹25,000 is due on June 1st. Please make the payment to avoid late fees.',
    '2024-05-25 10:00:00+05:30', '2024-05-25 10:00:00+05:30'
  ),
  (
    '00000013-0000-0000-0000-000000000005',
    '00000001-0000-0000-0000-000000000002',
    'all', NULL,
    'Holiday Notice – Republic Day',
    'The Delhi branch will be closed on January 26th (Republic Day). Classes resume on January 27th.',
    NULL, '2024-01-24 17:00:00+05:30'
  )
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- NOTIFICATION_READS
-- ============================================================
INSERT INTO notification_reads (id, notification_id, student_id, read_at) VALUES
  ('00000014-0000-0000-0000-000000000001', '00000013-0000-0000-0000-000000000001', '00000005-0000-0000-0000-000000000001', '2024-01-15 10:30:00+05:30'),
  ('00000014-0000-0000-0000-000000000002', '00000013-0000-0000-0000-000000000001', '00000005-0000-0000-0000-000000000002', '2024-01-15 11:00:00+05:30'),
  ('00000014-0000-0000-0000-000000000003', '00000013-0000-0000-0000-000000000002', '00000005-0000-0000-0000-000000000001', '2024-01-28 09:30:00+05:30'),
  ('00000014-0000-0000-0000-000000000004', '00000013-0000-0000-0000-000000000004', '00000005-0000-0000-0000-000000000001', '2024-05-25 11:00:00+05:30'),
  ('00000014-0000-0000-0000-000000000005', '00000013-0000-0000-0000-000000000005', '00000005-0000-0000-0000-000000000004', '2024-01-24 18:00:00+05:30')
ON CONFLICT (notification_id, student_id) DO NOTHING;

-- ============================================================
-- COMPLAINTS
-- ============================================================
INSERT INTO complaints (id, student_id, branch_id, category, title, description, status, priority, assigned_to, attachment_url) VALUES
  (
    '00000015-0000-0000-0000-000000000001',
    '00000005-0000-0000-0000-000000000001', '00000001-0000-0000-0000-000000000001',
    'payment', 'Payment receipt not received',
    'I made a UPI payment of ₹25,000 on January 15th but have not received the official receipt. Transaction ID: UPI20240115001',
    'resolved', 'normal', '00000003-0000-0000-0000-000000000001', NULL
  ),
  (
    '00000015-0000-0000-0000-000000000002',
    '00000005-0000-0000-0000-000000000002', '00000001-0000-0000-0000-000000000001',
    'technical', 'Unable to access study material PDF',
    'The HTML5 Reference Guide PDF returns a 404 error when I try to download it.',
    'in_progress', 'high', '00000003-0000-0000-0000-000000000001', NULL
  ),
  (
    '00000015-0000-0000-0000-000000000003',
    '00000005-0000-0000-0000-000000000003', '00000001-0000-0000-0000-000000000001',
    'academic', 'Request for additional Python practice problems',
    'I would like more challenging Python exercises. The current ones are too easy for my level.',
    'pending', 'low', NULL, NULL
  ),
  (
    '00000015-0000-0000-0000-000000000004',
    '00000005-0000-0000-0000-000000000004', '00000001-0000-0000-0000-000000000002',
    'facility', 'Air conditioning not working in Room A',
    'The AC in Room A (Delhi branch) has not been working for a week and it is affecting concentration.',
    'closed', 'urgent', '00000003-0000-0000-0000-000000000002',
    'https://storage.example.com/complaints/ac-photo.jpg'
  )
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- COMPLAINT_REPLIES
-- ============================================================
INSERT INTO complaint_replies (id, complaint_id, sender_id, sender_role, message) VALUES
  (
    '00000016-0000-0000-0000-000000000001',
    '00000015-0000-0000-0000-000000000001',
    '00000002-0000-0000-0000-000000000001', 'branch_admin',
    'Hi Rahul, we apologise for the delay. Your receipt has been sent to your registered email. Please check your inbox and spam folder.'
  ),
  (
    '00000016-0000-0000-0000-000000000002',
    '00000015-0000-0000-0000-000000000001',
    '00000002-0000-0000-0000-000000000011', 'student',
    'Thank you! I received the receipt in my email. Issue resolved.'
  ),
  (
    '00000016-0000-0000-0000-000000000003',
    '00000015-0000-0000-0000-000000000002',
    '00000002-0000-0000-0000-000000000001', 'branch_admin',
    'We are investigating the file-server issue. The material will be back online within 24 hours.'
  ),
  (
    '00000016-0000-0000-0000-000000000004',
    '00000015-0000-0000-0000-000000000004',
    '00000002-0000-0000-0000-000000000002', 'branch_admin',
    'We have raised a maintenance request. The technician will visit tomorrow. Thank you for reporting this.'
  )
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- FEEDBACK
-- ============================================================
INSERT INTO feedback (id, student_id, branch_id, target_type, target_id, rating, comment) VALUES
  (
    '00000017-0000-0000-0000-000000000001',
    '00000005-0000-0000-0000-000000000001', '00000001-0000-0000-0000-000000000001',
    'test', '0000000d-0000-0000-0000-000000000001',
    4, 'Good quiz! Questions were relevant. Would appreciate a bit more time for complex questions.'
  ),
  (
    '00000017-0000-0000-0000-000000000002',
    '00000005-0000-0000-0000-000000000002', '00000001-0000-0000-0000-000000000001',
    'teacher', NULL,
    5, 'Prof. Anand explains concepts brilliantly with real-world examples. Highly recommended.'
  ),
  (
    '00000017-0000-0000-0000-000000000003',
    '00000005-0000-0000-0000-000000000003', '00000001-0000-0000-0000-000000000001',
    'material', '00000011-0000-0000-0000-000000000004',
    3, 'Pandas cheat sheet is helpful but needs more examples on groupby and merge operations.'
  ),
  (
    '00000017-0000-0000-0000-000000000004',
    '00000005-0000-0000-0000-000000000004', '00000001-0000-0000-0000-000000000002',
    'general', NULL,
    4, 'Great experience at the Delhi branch. Faculty is knowledgeable and supportive.'
  ),
  (
    '00000017-0000-0000-0000-000000000005',
    '00000005-0000-0000-0000-000000000001', '00000001-0000-0000-0000-000000000001',
    'test', '0000000d-0000-0000-0000-000000000002',
    5, 'The React exam was well-structured and covered all the key topics from class.'
  )
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- AUDIT_LOGS
-- ============================================================
INSERT INTO audit_logs (id, user_id, branch_id, action, entity, entity_id, old_values, new_values, ip_address, user_agent) VALUES
  (
    '00000018-0000-0000-0000-000000000001',
    '00000002-0000-0000-0000-000000000001', '00000001-0000-0000-0000-000000000001',
    'CREATE', 'students', '00000005-0000-0000-0000-000000000001',
    NULL,
    '{"name": "Rahul Sharma", "student_code": "STU-MUM-001", "course_id": "00000004-0000-0000-0000-000000000001"}',
    '192.168.1.10', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
  ),
  (
    '00000018-0000-0000-0000-000000000002',
    '00000002-0000-0000-0000-000000000001', '00000001-0000-0000-0000-000000000001',
    'CREATE', 'payments', '00000012-0000-0000-0000-000000000001',
    NULL,
    '{"amount": 25000, "mode": "upi", "status": "pending", "receipt_number": "REC-MUM-2024-001"}',
    '192.168.1.10', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
  ),
  (
    '00000018-0000-0000-0000-000000000003',
    '00000002-0000-0000-0000-000000000001', '00000001-0000-0000-0000-000000000001',
    'UPDATE', 'payments', '00000012-0000-0000-0000-000000000001',
    '{"status": "pending"}',
    '{"status": "verified", "verified_by": "00000003-0000-0000-0000-000000000001"}',
    '192.168.1.10', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
  ),
  (
    '00000018-0000-0000-0000-000000000004',
    '00000002-0000-0000-0000-000000000001', '00000001-0000-0000-0000-000000000001',
    'UPDATE', 'students', '00000005-0000-0000-0000-000000000005',
    '{"status": "active", "defaulter_flag": false}',
    '{"status": "inactive", "defaulter_flag": true}',
    '192.168.1.10', 'Chrome/121.0.0.0 Safari/537.36'
  ),
  (
    '00000018-0000-0000-0000-000000000005',
    '00000002-0000-0000-0000-000000000002', '00000001-0000-0000-0000-000000000002',
    'CREATE', 'attendance', '0000000c-0000-0000-0000-000000000011',
    NULL,
    '{"student_id": "00000005-0000-0000-0000-000000000004", "date": "2024-01-20", "status": "present"}',
    '10.0.0.5', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)'
  )
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- WEBHOOKS
-- ============================================================
INSERT INTO webhooks (id, branch_id, name, url, events, secret, is_active) VALUES
  (
    '00000019-0000-0000-0000-000000000001',
    '00000001-0000-0000-0000-000000000001',
    'Payment Gateway Webhook',
    'https://api.example.com/webhooks/payments',
    '["payment.verified", "payment.rejected"]',
    'whsec_mumbai_payments_2024',
    true
  ),
  (
    '00000019-0000-0000-0000-000000000002',
    '00000001-0000-0000-0000-000000000001',
    'Notification Webhook',
    'https://api.example.com/webhooks/notifications',
    '["notification.sent", "student.enrolled"]',
    'whsec_mumbai_notif_2024',
    true
  ),
  (
    '00000019-0000-0000-0000-000000000003',
    '00000001-0000-0000-0000-000000000002',
    'Delhi Branch Webhook',
    'https://api.example.com/webhooks/delhi',
    '["payment.verified", "attendance.marked"]',
    'whsec_delhi_2024',
    false
  )
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- SETTINGS  (one row per branch due to UNIQUE constraint on branch_id)
-- ============================================================
INSERT INTO settings (id, branch_id, key, value) VALUES
  (
    '0000001a-0000-0000-0000-000000000001',
    '00000001-0000-0000-0000-000000000001',
    'branch_config',
    '{"attendance_threshold": 75, "late_fee_percent": 5, "installment_allowed": true, "max_installments": 3, "notification_email": true, "notification_sms": false}'
  ),
  (
    '0000001a-0000-0000-0000-000000000002',
    '00000001-0000-0000-0000-000000000002',
    'branch_config',
    '{"attendance_threshold": 80, "late_fee_percent": 10, "installment_allowed": true, "max_installments": 2, "notification_email": true, "notification_sms": true}'
  )
ON CONFLICT (branch_id) DO NOTHING;

COMMIT;

-- ============================================================
-- SEED SUMMARY
-- ============================================================
-- branches            : 2  (Mumbai, Delhi)
-- users               : 7  (2 branch admins + 5 students) + 1 super admin from migration
-- admins              : 2
-- courses             : 3  (Full Stack, Data Science, Digital Marketing)
-- modules             : 7
-- subjects            : 7
-- batches             : 4
-- batch_students      : 5
-- timetables          : 7
-- students            : 5
-- student_documents   : 4
-- attendance          : 12
-- tests               : 4
-- questions           : 12
-- test_assignments    : 7
-- results             : 5
-- study_materials     : 5
-- payments            : 6
-- notifications       : 5
-- notification_reads  : 5
-- complaints          : 4
-- complaint_replies   : 4
-- feedback            : 5
-- audit_logs          : 5
-- webhooks            : 3
-- settings            : 2
-- ============================================================
-- Login credentials (all passwords: admin123)
-- Super Admin  : superadmin@edtech.com     (from migration 001)
-- Branch Admin : admin.mumbai@edtech.com
-- Branch Admin : admin.delhi@edtech.com
-- Student      : rahul.sharma@gmail.com    (STU-MUM-001, active, Full Stack)
-- Student      : priya.patel@gmail.com     (STU-MUM-002, active, Full Stack)
-- Student      : amit.kumar@gmail.com      (STU-MUM-003, active, Data Science)
-- Student      : sneha.joshi@gmail.com     (STU-DEL-001, active, Full Stack)
-- Student      : vikram.singh@gmail.com    (STU-DEL-002, inactive/defaulter, Digital Marketing)
-- ============================================================
