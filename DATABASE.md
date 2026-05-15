# Supabase Database Schema

To make this MVP work, you need to run the following SQL in your Supabase SQL Editor.

## 1. App Profiles Table
Stores user metadata and roles. Linked to Supabase Auth.
We use `app_profiles` to avoid conflicts with other projects.

```sql
create table if not exists public.app_profiles (
  id uuid references auth.users on delete cascade primary key,
  first_name text,
  last_name text,
  email text,
  role text check (role in ('teacher', 'student')) default 'student',
  class_id uuid references public.app_classes(id), -- Added to link students to a class
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Set up Row Level Security (RLS)
alter table public.app_profiles enable row level security;

-- Drop existing policies if they exist (to allow re-running)
drop policy if exists "Public profiles are viewable by everyone." on app_profiles;
drop policy if exists "Users can insert their own profile." on app_profiles;
drop policy if exists "Users can update own profile." on app_profiles;

create policy "Public profiles are viewable by everyone."
  on app_profiles for select
  using ( true );

create policy "Users can insert their own profile."
  on app_profiles for insert
  with check ( auth.uid() = id );

create policy "Users can update own profile."
  on app_profiles for update
  using ( auth.uid() = id );

-- NEW: Trigger to automatically create a profile after signup
-- This ensures first_name and last_name are saved correctly.
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.app_profiles (id, first_name, last_name, email, role)
  values (
    new.id,
    new.raw_user_meta_data->>'first_name',
    new.raw_user_meta_data->>'last_name',
    new.email,
    coalesce(new.raw_user_meta_data->>'role', 'student')
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
```

## 2. App Classes Table
Courses created by teachers.

```sql
create table if not exists public.app_classes (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  description text,
  teacher_id uuid references auth.users not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.app_classes enable row level security;

drop policy if exists "Classes are viewable by everyone." on app_classes;
drop policy if exists "Teachers can create classes." on app_classes;

create policy "Classes are viewable by everyone."
  on app_classes for select
  using ( true );

create policy "Teachers can create classes."
  on app_classes for insert
  with check ( auth.uid() = teacher_id );
```

## 3. Attendance Sessions Table
Created when a teacher generates a QR code.

```sql
create table if not exists public.attendance_sessions (
  id uuid default gen_random_uuid() primary key,
  class_id uuid references public.app_classes on delete cascade not null,
  token text not null unique,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  expires_at timestamp with time zone not null
);

alter table public.attendance_sessions enable row level security;

drop policy if exists "Sessions are viewable by everyone." on attendance_sessions;
drop policy if exists "Teachers can create sessions." on attendance_sessions;

create policy "Sessions are viewable by everyone."
  on attendance_sessions for select
  using ( true );

create policy "Teachers can create sessions."
  on attendance_sessions for insert
  with check ( true ); -- Simplified for MVP demo
```

## 4. Attendance Records Table
Records of students scanning the QR.

```sql
create table if not exists public.attendance_records (
  id uuid default gen_random_uuid() primary key,
  session_id uuid references public.attendance_sessions on delete cascade not null,
  student_id uuid references auth.users not null,
  status text check (status in ('present', 'absent')) default 'present',
  marked_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(session_id, student_id)
);

alter table public.attendance_records enable row level security;

drop policy if exists "Attendance records are viewable by everyone." on attendance_records;
drop policy if exists "Students can mark their own attendance." on attendance_records;

create policy "Attendance records are viewable by everyone."
  on attendance_records for select
  using ( true );

create policy "Students can mark their own attendance."
  on attendance_records for insert
  with check ( auth.uid() = student_id );

-- 5. Class Students Table
-- List of students enrolled in a class (manual management)
create table if not exists public.app_class_students (
  id uuid default gen_random_uuid() primary key,
  class_id uuid references public.app_classes on delete cascade not null,
  student_name text not null,
  student_email text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(class_id, student_email) -- Prevent duplicate enrollments
);

alter table public.app_class_students enable row level security;

drop policy if exists "Class students are viewable by everyone." on app_class_students;
drop policy if exists "Teachers can manage class students." on app_class_students;

create policy "Class students are viewable by everyone."
  on app_class_students for select
  using ( true );

create policy "Teachers can manage class students."
  on app_class_students for all
  using ( true ); -- Simplified for MVP
```

## Setup Tip
After running the SQL, ensure you have your `.env.local` configured with:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
