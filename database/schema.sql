CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS citext;

CREATE TYPE user_role AS ENUM ('student', 'moderator', 'admin');
CREATE TYPE content_status AS ENUM ('active', 'pending', 'hidden', 'deleted');
CREATE TYPE academic_term AS ENUM ('spring', 'summer', 'fall', 'winter');
CREATE TYPE question_status AS ENUM ('open', 'resolved', 'closed');
CREATE TYPE resource_file_type AS ENUM ('pdf', 'image');
CREATE TYPE report_status AS ENUM ('open', 'reviewed', 'dismissed', 'actioned');
CREATE TYPE swap_item_condition AS ENUM ('new', 'like_new', 'good', 'fair', 'poor');
CREATE TYPE swap_item_status AS ENUM ('available', 'reserved', 'sold', 'removed');

CREATE TABLE universities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  country TEXT NOT NULL DEFAULT 'Azerbaijan',
  city TEXT,
  email_domains TEXT[] NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (cardinality(email_domains) > 0)
);

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  university_id UUID NOT NULL REFERENCES universities(id) ON DELETE RESTRICT,
  email CITEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  full_name TEXT NOT NULL,
  username CITEXT UNIQUE,
  avatar_url TEXT,
  role user_role NOT NULL DEFAULT 'student',
  is_email_verified BOOLEAN NOT NULL DEFAULT false,
  email_verified_at TIMESTAMPTZ,
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (id, university_id),
  CHECK (position('@' IN email::TEXT) > 1),
  CHECK (NOT is_email_verified OR email_verified_at IS NOT NULL)
);

CREATE TABLE email_verification_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE password_reset_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  refresh_token_hash TEXT NOT NULL UNIQUE,
  user_agent TEXT,
  ip_address INET,
  expires_at TIMESTAMPTZ NOT NULL,
  revoked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  university_id UUID NOT NULL REFERENCES universities(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  code TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (university_id, name),
  UNIQUE (id, university_id)
);

CREATE TABLE courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  university_id UUID NOT NULL REFERENCES universities(id) ON DELETE CASCADE,
  department_id UUID NOT NULL,
  code TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (university_id, code),
  UNIQUE (id, university_id),
  FOREIGN KEY (department_id, university_id)
    REFERENCES departments(id, university_id) ON DELETE RESTRICT
);

CREATE TABLE teachers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  university_id UUID NOT NULL REFERENCES universities(id) ON DELETE CASCADE,
  department_id UUID NOT NULL,
  full_name TEXT NOT NULL,
  title TEXT,
  email CITEXT,
  bio TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (id, university_id),
  FOREIGN KEY (department_id, university_id)
    REFERENCES departments(id, university_id) ON DELETE RESTRICT
);

CREATE TABLE teacher_courses (
  university_id UUID NOT NULL REFERENCES universities(id) ON DELETE CASCADE,
  teacher_id UUID NOT NULL,
  course_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (teacher_id, course_id),
  UNIQUE (teacher_id, course_id, university_id),
  FOREIGN KEY (teacher_id, university_id)
    REFERENCES teachers(id, university_id) ON DELETE CASCADE,
  FOREIGN KEY (course_id, university_id)
    REFERENCES courses(id, university_id) ON DELETE CASCADE
);

CREATE TABLE teacher_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  university_id UUID NOT NULL,
  reviewer_id UUID NOT NULL,
  teacher_id UUID NOT NULL,
  course_id UUID NOT NULL,
  semester academic_term NOT NULL,
  academic_year INT NOT NULL,
  rating_overall SMALLINT NOT NULL CHECK (rating_overall BETWEEN 1 AND 5),
  rating_teaching SMALLINT CHECK (rating_teaching BETWEEN 1 AND 5),
  rating_difficulty SMALLINT CHECK (rating_difficulty BETWEEN 1 AND 5),
  rating_grading_fairness SMALLINT CHECK (rating_grading_fairness BETWEEN 1 AND 5),
  would_take_again BOOLEAN,
  comment TEXT,
  is_anonymous BOOLEAN NOT NULL DEFAULT true,
  moderation_status content_status NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (reviewer_id, teacher_id, course_id, semester, academic_year),
  UNIQUE (id, university_id),
  FOREIGN KEY (reviewer_id, university_id)
    REFERENCES users(id, university_id) ON DELETE CASCADE,
  FOREIGN KEY (teacher_id, course_id, university_id)
    REFERENCES teacher_courses(teacher_id, course_id, university_id) ON DELETE RESTRICT
);

CREATE TABLE teacher_review_votes (
  review_id UUID NOT NULL,
  user_id UUID NOT NULL,
  university_id UUID NOT NULL,
  value SMALLINT NOT NULL CHECK (value IN (-1, 1)),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (review_id, user_id),
  FOREIGN KEY (review_id, university_id)
    REFERENCES teacher_reviews(id, university_id) ON DELETE CASCADE,
  FOREIGN KEY (user_id, university_id)
    REFERENCES users(id, university_id) ON DELETE CASCADE
);

CREATE TABLE teacher_review_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  university_id UUID NOT NULL,
  review_id UUID NOT NULL,
  reporter_id UUID NOT NULL,
  reason TEXT NOT NULL,
  status report_status NOT NULL DEFAULT 'open',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (review_id, reporter_id),
  FOREIGN KEY (review_id, university_id)
    REFERENCES teacher_reviews(id, university_id) ON DELETE CASCADE,
  FOREIGN KEY (reporter_id, university_id)
    REFERENCES users(id, university_id) ON DELETE CASCADE
);

CREATE TABLE forum_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  university_id UUID NOT NULL REFERENCES universities(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (university_id, slug),
  UNIQUE (id, university_id)
);

CREATE TABLE tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  university_id UUID NOT NULL REFERENCES universities(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (university_id, slug),
  UNIQUE (id, university_id)
);

CREATE TABLE forum_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  university_id UUID NOT NULL,
  author_id UUID NOT NULL,
  category_id UUID NOT NULL,
  course_id UUID,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  status question_status NOT NULL DEFAULT 'open',
  moderation_status content_status NOT NULL DEFAULT 'active',
  accepted_answer_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (id, university_id),
  FOREIGN KEY (author_id, university_id)
    REFERENCES users(id, university_id) ON DELETE CASCADE,
  FOREIGN KEY (category_id, university_id)
    REFERENCES forum_categories(id, university_id) ON DELETE RESTRICT,
  FOREIGN KEY (course_id, university_id)
    REFERENCES courses(id, university_id) ON DELETE RESTRICT
);

CREATE TABLE forum_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  university_id UUID NOT NULL,
  question_id UUID NOT NULL,
  parent_answer_id UUID,
  author_id UUID NOT NULL,
  body TEXT NOT NULL,
  moderation_status content_status NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (id, university_id),
  UNIQUE (id, question_id),
  FOREIGN KEY (question_id, university_id)
    REFERENCES forum_questions(id, university_id) ON DELETE CASCADE,
  FOREIGN KEY (author_id, university_id)
    REFERENCES users(id, university_id) ON DELETE CASCADE,
  FOREIGN KEY (parent_answer_id, question_id)
    REFERENCES forum_answers(id, question_id) ON DELETE CASCADE
);

ALTER TABLE forum_questions
  ADD CONSTRAINT fk_questions_accepted_answer
  FOREIGN KEY (accepted_answer_id, id)
  REFERENCES forum_answers(id, question_id)
  ON DELETE RESTRICT;

CREATE TABLE forum_question_tags (
  question_id UUID NOT NULL,
  tag_id UUID NOT NULL,
  university_id UUID NOT NULL,
  PRIMARY KEY (question_id, tag_id),
  FOREIGN KEY (question_id, university_id)
    REFERENCES forum_questions(id, university_id) ON DELETE CASCADE,
  FOREIGN KEY (tag_id, university_id)
    REFERENCES tags(id, university_id) ON DELETE CASCADE
);

CREATE TABLE forum_question_votes (
  question_id UUID NOT NULL,
  user_id UUID NOT NULL,
  university_id UUID NOT NULL,
  value SMALLINT NOT NULL CHECK (value IN (-1, 1)),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (question_id, user_id),
  FOREIGN KEY (question_id, university_id)
    REFERENCES forum_questions(id, university_id) ON DELETE CASCADE,
  FOREIGN KEY (user_id, university_id)
    REFERENCES users(id, university_id) ON DELETE CASCADE
);

CREATE TABLE forum_answer_votes (
  answer_id UUID NOT NULL,
  user_id UUID NOT NULL,
  university_id UUID NOT NULL,
  value SMALLINT NOT NULL CHECK (value IN (-1, 1)),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (answer_id, user_id),
  FOREIGN KEY (answer_id, university_id)
    REFERENCES forum_answers(id, university_id) ON DELETE CASCADE,
  FOREIGN KEY (user_id, university_id)
    REFERENCES users(id, university_id) ON DELETE CASCADE
);

CREATE TABLE pdf_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  university_id UUID NOT NULL,
  uploader_id UUID NOT NULL,
  course_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  file_name TEXT NOT NULL,
  file_type resource_file_type NOT NULL DEFAULT 'pdf',
  file_url TEXT NOT NULL,
  storage_key TEXT UNIQUE,
  file_size_bytes BIGINT NOT NULL CHECK (file_size_bytes > 0),
  page_count INT CHECK (page_count IS NULL OR page_count > 0),
  is_anonymous BOOLEAN NOT NULL DEFAULT true,
  moderation_status content_status NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (id, university_id),
  FOREIGN KEY (uploader_id, university_id)
    REFERENCES users(id, university_id) ON DELETE CASCADE,
  FOREIGN KEY (course_id, university_id)
    REFERENCES courses(id, university_id) ON DELETE RESTRICT
);

CREATE TABLE pdf_note_tags (
  note_id UUID NOT NULL,
  tag_id UUID NOT NULL,
  university_id UUID NOT NULL,
  PRIMARY KEY (note_id, tag_id),
  FOREIGN KEY (note_id, university_id)
    REFERENCES pdf_notes(id, university_id) ON DELETE CASCADE,
  FOREIGN KEY (tag_id, university_id)
    REFERENCES tags(id, university_id) ON DELETE CASCADE
);

CREATE TABLE pdf_note_ratings (
  note_id UUID NOT NULL,
  user_id UUID NOT NULL,
  university_id UUID NOT NULL,
  rating SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (note_id, user_id),
  FOREIGN KEY (note_id, university_id)
    REFERENCES pdf_notes(id, university_id) ON DELETE CASCADE,
  FOREIGN KEY (user_id, university_id)
    REFERENCES users(id, university_id) ON DELETE CASCADE
);

CREATE TABLE pdf_note_downloads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  note_id UUID NOT NULL,
  user_id UUID NOT NULL,
  university_id UUID NOT NULL,
  downloaded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  FOREIGN KEY (note_id, university_id)
    REFERENCES pdf_notes(id, university_id) ON DELETE CASCADE,
  FOREIGN KEY (user_id, university_id)
    REFERENCES users(id, university_id) ON DELETE CASCADE
);

CREATE TABLE pdf_note_bookmarks (
  note_id UUID NOT NULL,
  user_id UUID NOT NULL,
  university_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (note_id, user_id),
  FOREIGN KEY (note_id, university_id)
    REFERENCES pdf_notes(id, university_id) ON DELETE CASCADE,
  FOREIGN KEY (user_id, university_id)
    REFERENCES users(id, university_id) ON DELETE CASCADE
);

CREATE TABLE swap_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  university_id UUID NOT NULL REFERENCES universities(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (university_id, slug),
  UNIQUE (id, university_id)
);

CREATE TABLE swap_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  university_id UUID NOT NULL,
  seller_id UUID NOT NULL,
  category_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  price_cents INT NOT NULL DEFAULT 0 CHECK (price_cents >= 0),
  currency CHAR(3) NOT NULL DEFAULT 'AZN',
  condition swap_item_condition NOT NULL,
  status swap_item_status NOT NULL DEFAULT 'available',
  campus_location TEXT,
  swap_note TEXT,
  contact_method TEXT NOT NULL CHECK (contact_method IN ('whatsapp', 'email')),
  contact_value TEXT NOT NULL CHECK (btrim(contact_value) <> ''),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (id, university_id),
  FOREIGN KEY (seller_id, university_id)
    REFERENCES users(id, university_id) ON DELETE CASCADE,
  FOREIGN KEY (category_id, university_id)
    REFERENCES swap_categories(id, university_id) ON DELETE RESTRICT
);

CREATE TABLE swap_item_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID NOT NULL REFERENCES swap_items(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (item_id, sort_order)
);

CREATE INDEX idx_teacher_reviews_teacher ON teacher_reviews(teacher_id, course_id, created_at DESC);
CREATE INDEX idx_forum_questions_feed ON forum_questions(university_id, category_id, created_at DESC);
CREATE INDEX idx_forum_answers_question ON forum_answers(question_id, created_at);
CREATE INDEX idx_forum_answers_parent ON forum_answers(question_id, parent_answer_id, created_at);
CREATE INDEX idx_pdf_notes_course ON pdf_notes(course_id, created_at DESC);
CREATE INDEX idx_swap_items_market ON swap_items(university_id, category_id, status, created_at DESC);

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION email_matches_university_domains(email_address CITEXT, domains TEXT[])
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1
    FROM unnest(domains) AS d(domain)
    WHERE lower(split_part(email_address::TEXT, '@', 2)) = lower(trim(d.domain))
       OR lower(split_part(email_address::TEXT, '@', 2)) LIKE '%.' || lower(trim(d.domain))
  );
$$ LANGUAGE sql IMMUTABLE;

CREATE OR REPLACE FUNCTION enforce_user_university_email_domain()
RETURNS TRIGGER AS $$
DECLARE
  allowed_domains TEXT[];
BEGIN
  SELECT email_domains INTO allowed_domains
  FROM universities
  WHERE id = NEW.university_id;

  IF allowed_domains IS NULL THEN
    RAISE EXCEPTION 'University not found';
  END IF;

  IF NOT email_matches_university_domains(NEW.email, allowed_domains) THEN
    RAISE EXCEPTION 'Email domain is not allowed for this university';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_university_email
BEFORE INSERT OR UPDATE OF email, university_id ON users
FOR EACH ROW EXECUTE FUNCTION enforce_user_university_email_domain();

DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOREACH tbl IN ARRAY ARRAY[
    'universities', 'users', 'departments', 'courses', 'teachers',
    'teacher_reviews', 'forum_categories', 'tags', 'forum_questions',
    'forum_answers', 'pdf_notes', 'swap_categories', 'swap_items'
  ]
  LOOP
    EXECUTE format(
      'CREATE TRIGGER trg_%I_set_updated_at BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION set_updated_at()',
      tbl, tbl
    );
  END LOOP;
END $$;
