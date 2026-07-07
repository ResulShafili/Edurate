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

## First seed example

Before creating users, insert at least one university because user emails are checked against the university email domains.

```sql
INSERT INTO universities (name, slug, city, email_domains)
VALUES ('Holberton School', 'holberton', 'Baku', ARRAY['holbertonschool.com']);
```
