-- EdTech Platform - Webhook Logs Table
-- Add support for webhook delivery tracking

-- ============================================
-- WEBHOOK_LOGS TABLE (Webhook delivery tracking)
-- ============================================
CREATE TABLE IF NOT EXISTS webhook_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  webhook_id UUID REFERENCES webhooks(id) ON DELETE CASCADE,
  event VARCHAR(100) NOT NULL,
  status VARCHAR(50) NOT NULL CHECK (status IN ('pending', 'delivered', 'failed')),
  status_code INTEGER,
  payload JSONB,
  response_body TEXT,
  error TEXT,
  delivered_at TIMESTAMP WITH TIME ZONE,
  attempted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- Indexes for webhook logs
-- ============================================
CREATE INDEX IF NOT EXISTS idx_webhook_logs_webhook_id ON webhook_logs(webhook_id);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_event ON webhook_logs(event);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_status ON webhook_logs(status);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_attempted_at ON webhook_logs(attempted_at);

-- ============================================
-- NOTIFICATION_LOGS TABLE (Notification campaign tracking)
-- ============================================
CREATE TABLE IF NOT EXISTS notification_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  branch_id UUID REFERENCES branches(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  recipient_count INTEGER NOT NULL,
  status VARCHAR(50) NOT NULL CHECK (status IN ('scheduled', 'sent', 'failed')),
  scheduled_at TIMESTAMP WITH TIME ZONE,
  sent_at TIMESTAMP WITH TIME ZONE,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- Indexes for notification logs
-- ============================================
CREATE INDEX IF NOT EXISTS idx_notification_logs_branch_id ON notification_logs(branch_id);
CREATE INDEX IF NOT EXISTS idx_notification_logs_status ON notification_logs(status);
CREATE INDEX IF NOT EXISTS idx_notification_logs_created_at ON notification_logs(created_at);

-- ============================================
-- Add notification_logs.created_by foreign key
-- ============================================
ALTER TABLE notification_logs
  ADD CONSTRAINT fk_notification_logs_created_by
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL;

-- ============================================
-- Update tests table to include scheduledStart/scheduledEnd in settings
-- ============================================
-- Tests table already has settings JSONB, no migration needed

-- ============================================
-- Update results table to include autoSubmitted flag
-- ============================================
ALTER TABLE results ADD COLUMN IF NOT EXISTS auto_submitted BOOLEAN DEFAULT false;

-- ============================================
-- Add index on auto_submitted
-- ============================================
CREATE INDEX IF NOT EXISTS idx_results_auto_submitted ON results(auto_submitted);

-- ============================================
-- Update notifications table to support user-based notifications
-- ============================================
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id) ON DELETE CASCADE;

-- ============================================
-- Add index on user_id in notifications
-- ============================================
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);

-- ============================================
-- Add is_read field to notifications
-- ============================================
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS is_read BOOLEAN DEFAULT false;

-- ============================================
-- Add index on is_read in notifications
-- ============================================
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);

-- ============================================
-- Update results table to include batch_id
-- ============================================
ALTER TABLE results ADD COLUMN IF NOT EXISTS batch_id UUID REFERENCES batches(id) ON DELETE SET NULL;

-- ============================================
-- Add index on batch_id in results
-- ============================================
CREATE INDEX IF NOT EXISTS idx_results_batch_id ON results(batch_id);

-- ============================================
-- Update questions table to support multiple question types
-- ============================================
ALTER TABLE questions ADD COLUMN IF NOT EXISTS type VARCHAR(50) DEFAULT 'mcq'
  CHECK (type IN ('mcq', 'single_choice', 'multiple_choice', 'true_false'));

ALTER TABLE questions ALTER COLUMN correct_option TYPE JSONB USING correct_option::text::jsonb;

-- ============================================
-- Add index on type in questions
-- ============================================
CREATE INDEX IF NOT EXISTS idx_questions_type ON questions(type);

-- ============================================
-- Update results table to include percentage and status
-- ============================================
ALTER TABLE results ADD COLUMN IF NOT EXISTS percentage DECIMAL(5, 2);
ALTER TABLE results ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'pending'
  CHECK (status IN ('pending', 'passed', 'failed'));

-- ============================================
-- Add indexes on percentage and status in results
-- ============================================
CREATE INDEX IF NOT EXISTS idx_results_percentage ON results(percentage);
CREATE INDEX IF NOT EXISTS idx_results_status ON results(status);

-- ============================================
-- Update test_assignments table to track attempts
-- ============================================
ALTER TABLE test_assignments ADD COLUMN IF NOT EXISTS attempts INTEGER DEFAULT 0;
ALTER TABLE test_assignments ADD COLUMN IF NOT EXISTS max_attempts INTEGER;
ALTER TABLE test_assignments ADD COLUMN IF NOT EXISTS last_attempted_at TIMESTAMP WITH TIME ZONE;

-- ============================================
-- Add index on attempts in test_assignments
-- ============================================
CREATE INDEX IF NOT EXISTS idx_test_assignments_attempts ON test_assignments(attempts);

-- ============================================
-- Add result_answers table for detailed answer tracking
-- ============================================
CREATE TABLE IF NOT EXISTS result_answers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  result_id UUID REFERENCES results(id) ON DELETE CASCADE,
  question_id UUID REFERENCES questions(id) ON DELETE CASCADE,
  selected_option JSONB,
  is_correct BOOLEAN,
  marks_obtained DECIMAL(5, 2),
  time_spent INTEGER DEFAULT 0
);

-- ============================================
-- Indexes for result_answers
-- ============================================
CREATE INDEX IF NOT EXISTS idx_result_answers_result_id ON result_answers(result_id);
CREATE INDEX IF NOT EXISTS idx_result_answers_question_id ON result_answers(question_id);
