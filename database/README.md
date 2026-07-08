# EduRate Database

This folder contains the initial PostgreSQL schema for EduRate.

## Setup

Create a local database:

```bash
createdb edurate
```

Run the schema:

```bash
psql -d edurate -f database/schema.sql
```

Run migrations for existing local databases:

```bash
psql -d edurate -f database/migrations/002_add_teacher_review_anonymity.sql
psql -d edurate -f database/migrations/003_add_forum_answer_threads.sql
psql -d edurate -f database/migrations/004_add_resource_file_metadata.sql
psql -d edurate -f database/migrations/005_marketplace_contact_only.sql
```

## First seed example

Before creating users, insert at least one university because user emails are checked against the university email domains.

```sql
INSERT INTO universities (name, slug, city, email_domains)
VALUES ('Qarabağ Universiteti', 'qarabag-universiteti', 'Khankendi', ARRAY['karabakh.edu.az']);
```
