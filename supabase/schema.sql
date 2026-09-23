-- Cấu hình Extension cho Vector Search (AI Embeddings)
create extension if not exists vector;

-- ==========================================
-- 1. TABLES
-- ==========================================

-- Bảng Profiles (Liên kết với Supabase Auth)
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null,
  full_name text not null,
  avatar_url text,
  bio text,
  university text,
  major text,
  year integer,
  reputation integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Trigger: Tự động tạo profile khi user đăng ký
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username, full_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Bảng Categories
create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  icon text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Bảng Questions
create table public.questions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  content text not null,
  category_id uuid references public.categories(id) on delete set null,
  views integer default 0,
  status text default 'published' check (status in ('published', 'draft', 'closed', 'deleted')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Bảng Answers
create table public.answers (
  id uuid primary key default gen_random_uuid(),
  question_id uuid references public.questions(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  content text not null,
  is_accepted boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Bảng Comments (Thuộc về Question hoặc Answer)
create table public.comments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  question_id uuid references public.questions(id) on delete cascade,
  answer_id uuid references public.answers(id) on delete cascade,
  content text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  check (
    (question_id is not null and answer_id is null) or 
    (question_id is null and answer_id is not null)
  )
);

-- Bảng Tags
create table public.tags (
  id uuid primary key default gen_random_uuid(),
  name text unique not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Bảng Question_Tags (N-N)
create table public.question_tags (
  question_id uuid references public.questions(id) on delete cascade,
  tag_id uuid references public.tags(id) on delete cascade,
  primary key (question_id, tag_id)
);

-- Bảng Votes
create table public.votes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  question_id uuid references public.questions(id) on delete cascade,
  answer_id uuid references public.answers(id) on delete cascade,
  vote_type text not null check (vote_type in ('upvote', 'downvote')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  check (
    (question_id is not null and answer_id is null) or 
    (question_id is null and answer_id is not null)
  ),
  unique (user_id, question_id),
  unique (user_id, answer_id)
);

-- Bảng Bookmarks
create table public.bookmarks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  question_id uuid references public.questions(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, question_id)
);

-- Bảng Notifications
create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  type text not null,
  title text not null,
  message text not null,
  related_question_id uuid references public.questions(id) on delete cascade,
  related_answer_id uuid references public.answers(id) on delete cascade,
  is_read boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Bảng AI_Conversations
create table public.ai_conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Bảng AI_Messages
create table public.ai_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid references public.ai_conversations(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  role text not null check (role in ('user', 'assistant', 'system')),
  content text not null,
  source_type text default 'none' check (source_type in ('question', 'answer', 'document', 'user_content', 'none')),
  source_id uuid,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Bảng Documents cho Vector Search RAG
create table public.documents (
  id uuid primary key default gen_random_uuid(),
  source_type text not null check (source_type in ('question', 'answer', 'comment', 'document', 'official')),
  source_id uuid not null,
  content text not null,
  metadata jsonb,
  embedding vector(1536), -- Vector 1536 chiều cho OpenAI text-embedding-3-small
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ==========================================
-- 2. ROW LEVEL SECURITY (RLS)
-- ==========================================

alter table public.profiles enable row level security;
alter table public.questions enable row level security;
alter table public.answers enable row level security;
alter table public.comments enable row level security;
alter table public.categories enable row level security;
alter table public.tags enable row level security;
alter table public.question_tags enable row level security;
alter table public.votes enable row level security;
alter table public.bookmarks enable row level security;
alter table public.notifications enable row level security;
alter table public.ai_conversations enable row level security;
alter table public.ai_messages enable row level security;
alter table public.documents enable row level security;

-- Profiles: Ai cũng xem được, nhưng chỉ chủ sở hữu được sửa
create policy "Public profiles are viewable by everyone." on public.profiles for select using (true);
create policy "Users can insert their own profile." on public.profiles for insert with check (auth.uid() = id);
create policy "Users can update own profile." on public.profiles for update using (auth.uid() = id);

-- Questions: Public xem được published, user tự quản lý câu hỏi của mình
create policy "Questions are viewable by everyone." on public.questions for select using (status = 'published');
create policy "Users can view their own drafted/closed questions." on public.questions for select using (auth.uid() = user_id);
create policy "Users can insert questions." on public.questions for insert with check (auth.uid() = user_id);
create policy "Users can update own questions." on public.questions for update using (auth.uid() = user_id);
create policy "Users can delete own questions." on public.questions for delete using (auth.uid() = user_id);

-- Answers
create policy "Answers are viewable by everyone." on public.answers for select using (true);
create policy "Users can insert answers." on public.answers for insert with check (auth.uid() = user_id);
create policy "Users can update own answers." on public.answers for update using (auth.uid() = user_id);
create policy "Users can delete own answers." on public.answers for delete using (auth.uid() = user_id);

-- Comments
create policy "Comments are viewable by everyone." on public.comments for select using (true);
create policy "Users can insert comments." on public.comments for insert with check (auth.uid() = user_id);
create policy "Users can update own comments." on public.comments for update using (auth.uid() = user_id);
create policy "Users can delete own comments." on public.comments for delete using (auth.uid() = user_id);

-- Categories & Tags
create policy "Categories are viewable by everyone." on public.categories for select using (true);
create policy "Tags are viewable by everyone." on public.tags for select using (true);
create policy "Question tags are viewable by everyone." on public.question_tags for select using (true);
create policy "Users can insert tags." on public.tags for insert with check (auth.uid() is not null);
create policy "Users can insert question tags." on public.question_tags for insert with check (auth.uid() is not null);

-- Votes
create policy "Votes are viewable by everyone." on public.votes for select using (true);
create policy "Users can insert votes." on public.votes for insert with check (auth.uid() = user_id);
create policy "Users can update own votes." on public.votes for update using (auth.uid() = user_id);
create policy "Users can delete own votes." on public.votes for delete using (auth.uid() = user_id);

-- Bookmarks
create policy "Users can view own bookmarks." on public.bookmarks for select using (auth.uid() = user_id);
create policy "Users can insert bookmarks." on public.bookmarks for insert with check (auth.uid() = user_id);
create policy "Users can delete own bookmarks." on public.bookmarks for delete using (auth.uid() = user_id);

-- Notifications
create policy "Users can view own notifications." on public.notifications for select using (auth.uid() = user_id);
create policy "Users can update own notifications." on public.notifications for update using (auth.uid() = user_id);

-- AI Conversations & Messages
create policy "Users can view own conversations." on public.ai_conversations for select using (auth.uid() = user_id);
create policy "Users can insert conversations." on public.ai_conversations for insert with check (auth.uid() = user_id);
create policy "Users can update own conversations." on public.ai_conversations for update using (auth.uid() = user_id);

create policy "Users can view own messages." on public.ai_messages for select using (auth.uid() = user_id);
create policy "Users can insert messages." on public.ai_messages for insert with check (auth.uid() = user_id);

-- Documents
create policy "Documents are viewable by authenticated users." on public.documents for select using (auth.uid() is not null);
create policy "Service can insert documents." on public.documents for insert with check (true); -- Requires further lock down in production
create policy "Service can update documents." on public.documents for update using (true);
create policy "Service can delete documents." on public.documents for delete using (true);

-- ==========================================
-- 3. SEED DATA (Mẫu cơ bản)
-- ==========================================
insert into public.categories (name, description, icon) values
  ('Programming', 'Lập trình cơ bản và nâng cao', 'Code'),
  ('Database', 'Cơ sở dữ liệu, SQL, NoSQL', 'Database'),
  ('Networking', 'Mạng máy tính, OSI, TCP/IP', 'Network'),
  ('Mathematics', 'Toán học, Đại số tuyến tính, Xác suất thống kê', 'Calculator'),
  ('FPT University', 'Thông tin, học tập tại Đại học FPT', 'GraduationCap')
on conflict do nothing;
