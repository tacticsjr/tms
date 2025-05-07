
-- Users table
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'staff', 'student')),
  department VARCHAR(50),
  section VARCHAR(10),
  year VARCHAR(10),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for users table
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Staff table
CREATE TABLE public.staff (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  subject VARCHAR(255) NOT NULL,
  max_periods INTEGER DEFAULT 5,
  department VARCHAR(50) NOT NULL,
  section VARCHAR(10) NOT NULL,
  year VARCHAR(10) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for staff table
ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;

-- Subjects table
CREATE TABLE public.subjects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN ('Theory', 'Lab', 'Activity')),
  periods_per_week INTEGER NOT NULL,
  assigned_staff_id UUID REFERENCES staff(id),
  is_continuous BOOLEAN DEFAULT false,
  department VARCHAR(50) NOT NULL,
  section VARCHAR(10) NOT NULL,
  year VARCHAR(10) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for subjects table
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;

-- Timetables table
CREATE TABLE public.timetables (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  year VARCHAR(10) NOT NULL,
  department VARCHAR(50) NOT NULL,
  section VARCHAR(10) NOT NULL,
  status VARCHAR(50) NOT NULL CHECK (status IN ('draft', 'confirmed')),
  grid JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(year, department, section, status)
);

-- Enable RLS for timetables table
ALTER TABLE public.timetables ENABLE ROW LEVEL SECURITY;

-- Substitutions table
CREATE TABLE public.substitutions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date DATE NOT NULL,
  period INTEGER NOT NULL,
  absent_staff_id UUID NOT NULL REFERENCES staff(id),
  substitute_staff_id UUID NOT NULL REFERENCES staff(id),
  reason TEXT,
  department VARCHAR(50) NOT NULL,
  section VARCHAR(10) NOT NULL,
  year VARCHAR(10) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for substitutions table
ALTER TABLE public.substitutions ENABLE ROW LEVEL SECURITY;

-- Notifications table
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  section_id VARCHAR(50) NOT NULL,
  message TEXT NOT NULL,
  sent_by UUID NOT NULL REFERENCES users(id),
  schedule_time TIMESTAMPTZ NOT NULL,
  recipients TEXT[] NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  type VARCHAR(50) NOT NULL CHECK (type IN ('general', 'alert', 'timetable')),
  department VARCHAR(50) NOT NULL,
  section VARCHAR(10) NOT NULL,
  year VARCHAR(10) NOT NULL
);

-- Enable RLS for notifications table
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Notifications read status table
CREATE TABLE public.notifications_read (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  notification_id UUID NOT NULL REFERENCES notifications(id),
  user_id UUID NOT NULL REFERENCES users(id),
  read_at TIMESTAMPTZ NOT NULL,
  UNIQUE(notification_id, user_id)
);

-- Enable RLS for notifications_read table
ALTER TABLE public.notifications_read ENABLE ROW LEVEL SECURITY;

-- RLS policies for users
CREATE POLICY "Users can read their own data" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Admins can read all users" ON users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- RLS policies for staff
CREATE POLICY "Anyone can read staff" ON staff
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage staff" ON staff
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- RLS policies for subjects
CREATE POLICY "Anyone can read subjects" ON subjects
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage subjects" ON subjects
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- RLS policies for timetables
CREATE POLICY "Anyone can read timetables" ON timetables
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage timetables" ON timetables
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- RLS policies for substitutions
CREATE POLICY "Anyone can read substitutions" ON substitutions
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage substitutions" ON substitutions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- RLS policies for notifications
CREATE POLICY "Users can read notifications for their section" ON notifications
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND (
        department = notifications.department 
        AND section = notifications.section 
        AND year = notifications.year
      )
    )
  );

CREATE POLICY "Admins can manage notifications" ON notifications
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- RLS policies for notifications_read
CREATE POLICY "Users can read their own notification status" ON notifications_read
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update their own notification status" ON notifications_read
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Create indexes for better query performance
CREATE INDEX idx_staff_dept_section_year ON staff(department, section, year);
CREATE INDEX idx_subjects_dept_section_year ON subjects(department, section, year);
CREATE INDEX idx_timetables_dept_section_year ON timetables(department, section, year, status);
CREATE INDEX idx_substitutions_dept_section_year ON substitutions(department, section, year);
CREATE INDEX idx_notifications_dept_section_year ON notifications(department, section, year);
