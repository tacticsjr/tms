
# Velammal AI Scheduler

An AI-powered intelligent timetable scheduler for educational institutions with real-time updates using Supabase.

## Setup Instructions

### Supabase Setup

1. Create a Supabase project at [https://supabase.com/](https://supabase.com/)
2. In your project dashboard, go to SQL editor and run the contents of `schema.sql` to create the database schema
3. Get your project URL and anon key from the API settings page
4. Update the `supabaseUrl` and `supabaseAnonKey` in `src/lib/supabase.ts` with your values

### Enable Authentication

1. In your Supabase dashboard, go to Authentication > Settings
2. Configure your redirect URLs (for development, add `http://localhost:5173/auth/callback`)
3. Configure email templates if needed
4. Create a test admin user:

```sql
-- Create a user in auth.users (this is managed by Supabase)
INSERT INTO auth.users (
  instance_id,
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_user_meta_data
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  uuid_generate_v4(),
  'admin@velammal.edu',
  -- This is a hashed password for 'admin123', but in production use Supabase Auth UI/API
  crypt('admin123', gen_salt('bf')),
  now(),
  '{"name":"Admin User", "role":"admin"}'
);

-- Create the corresponding user profile
INSERT INTO public.users (
  id,
  email,
  name,
  role,
  department,
  created_at
) 
SELECT id, email, 'Admin User', 'admin', 'ALL', now()
FROM auth.users 
WHERE email = 'admin@velammal.edu';
```

### Development

1. Install dependencies:

```
npm install
```

2. Start the development server:

```
npm run dev
```

3. Visit `http://localhost:5173` in your browser

## Features

- Real-time timetable updates
- Staff management with availability tracking
- Subject scheduling with constraints
- Automatic timetable generation
- Substitution management
- Notifications system
- Role-based access control (admin, staff, student)

## Technology Stack

- Frontend: React with TypeScript
- UI: Tailwind CSS with ShadcnUI components
- Backend: Supabase (PostgreSQL + Row Level Security)
- Authentication: Supabase Auth
- Real-time: Supabase Realtime
