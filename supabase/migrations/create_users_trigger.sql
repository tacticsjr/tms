
-- This trigger will automatically create a user profile in the public.users table
-- when a new user signs up through Supabase Auth

-- First, create the users table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  name TEXT,
  email TEXT,
  role TEXT DEFAULT 'student',
  department TEXT,
  section TEXT,
  year TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Create policy for users to select their own data
CREATE POLICY "Users can view own data" ON public.users
  FOR SELECT USING (auth.uid() = id);

-- Create policy for users to update their own data
CREATE POLICY "Users can update own data" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- Create policy for users to insert their own data
CREATE POLICY "Users can insert own data" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Create policy for admins to view all data
CREATE POLICY "Admins can view all data" ON public.users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Create policy for admins to update all data
CREATE POLICY "Admins can update all data" ON public.users
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Create a function that will be triggered when a new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user_signup()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (
    id,
    name,
    email,
    role,
    department,
    section,
    year
  ) VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'name',
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'student'),
    NEW.raw_user_meta_data->>'department',
    NEW.raw_user_meta_data->>'section',
    NEW.raw_user_meta_data->>'year'
  )
  ON CONFLICT (id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a trigger to call the function when a new user is created
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_signup();

-- Create a function to handle user updates
CREATE OR REPLACE FUNCTION public.handle_user_metadata_update()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.users
  SET
    name = NEW.raw_user_meta_data->>'name',
    role = COALESCE(NEW.raw_user_meta_data->>'role', public.users.role),
    department = COALESCE(NEW.raw_user_meta_data->>'department', public.users.department),
    section = COALESCE(NEW.raw_user_meta_data->>'section', public.users.section),
    year = COALESCE(NEW.raw_user_meta_data->>'year', public.users.year),
    updated_at = now()
  WHERE id = NEW.id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a trigger to call the function when a user is updated
DROP TRIGGER IF EXISTS on_auth_user_updated ON auth.users;
CREATE TRIGGER on_auth_user_updated
  AFTER UPDATE ON auth.users
  FOR EACH ROW
  WHEN (OLD.raw_user_meta_data IS DISTINCT FROM NEW.raw_user_meta_data)
  EXECUTE FUNCTION public.handle_user_metadata_update();

-- Create an initial admin user if it doesn't exist
-- Note: This is just for reference, you would need to create this user through the Supabase auth interface
-- INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, role)
-- VALUES (
--   gen_random_uuid(),
--   'admin@velammal.edu',
--   crypt('admin123', gen_salt('bf')),
--   now(),
--   'authenticated'
-- )
-- ON CONFLICT (email) DO NOTHING;
