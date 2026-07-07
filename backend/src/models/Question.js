const db = require('../config/db');

const questionSelect = `
  q.id,
  q.university_id AS "universityId",
  q.author_id AS "authorId",
  q.category_id AS "categoryId",
  fc.name AS "categoryName",
  fc.slug AS "categorySlug",
  q.course_id AS "courseId",
  c.code AS "courseCode",
  c.title AS "courseTitle",
  q.title,
  q.body,
  q.status,
  q.accepted_answer_id AS "acceptedAnswerId",
  u.full_name AS "authorName",
  COALESCE(answer_stats.answer_count, 0)::int AS "answerCount",
  COALESCE(vote_stats.vote_score, 0)::int AS "voteScore",
  GREATEST(q.updated_at, COALESCE(answer_stats.last_answer_at, q.updated_at)) AS "lastActivityAt",
  q.created_at AS "createdAt",
  q.updated_at AS "updatedAt"
`;

function questionJoins() {
  return `
    JOIN users u
      ON u.id = q.author_id
     AND u.university_id = q.university_id
    JOIN forum_categories fc
      ON fc.id = q.category_id
     AND fc.university_id = q.university_id
    LEFT JOIN courses c
      ON c.id = q.course_id
     AND c.university_id = q.university_id
    LEFT JOIN LATERAL (
      SELECT
        COUNT(*) AS answer_count,
        MAX(fa.created_at) AS last_answer_at
      FROM forum_answers fa
      WHERE fa.question_id = q.id
        AND fa.university_id = q.university_id
        AND fa.moderation_status = 'active'
    ) answer_stats ON true
    LEFT JOIN LATERAL (
      SELECT COALESCE(SUM(fqv.value), 0) AS vote_score
      FROM forum_question_votes fqv
      WHERE fqv.question_id = q.id
        AND fqv.university_id = q.university_id
    ) vote_stats ON true
  `;
}

async function list({ courseId, universityId, search, limit = 40 } = {}) {
  const values = [];
  const filters = [`q.moderation_status = 'active'`];

  if (courseId) {
    values.push(courseId);
    filters.push(`q.course_id = $${values.length}`);
  }

  if (universityId) {
    values.push(universityId);
    filters.push(`q.university_id = $${values.length}`);
  }

  if (search) {
    values.push(`%${search}%`);
    filters.push(`
      (
        q.title ILIKE $${values.length}
        OR q.body ILIKE $${values.length}
        OR c.code ILIKE $${values.length}
        OR c.title ILIKE $${values.length}
      )
    `);
  }

  values.push(Math.min(Number(limit) || 40, 100));
  const limitParam = `$${values.length}`;

  const result = await db.query(
    `
      SELECT ${questionSelect}
      FROM forum_questions q
      ${questionJoins()}
      WHERE ${filters.join(' AND ')}
      ORDER BY "lastActivityAt" DESC, "answerCount" DESC, q.created_at DESC
      LIMIT ${limitParam}
    `,
    values
  );

  return result.rows;
}

async function findById(id) {
  const result = await db.query(
    `
      SELECT ${questionSelect}
      FROM forum_questions q
      ${questionJoins()}
      WHERE q.id = $1
        AND q.moderation_status = 'active'
      LIMIT 1
    `,
    [id]
  );

  return result.rows[0] || null;
}

async function create({
  universityId,
  authorId,
  categoryId,
  courseId,
  title,
  body
}) {
  const result = await db.query(
    `
      INSERT INTO forum_questions (
        university_id,
        author_id,
        category_id,
        course_id,
        title,
        body
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id
    `,
    [
      universityId,
      authorId,
      categoryId,
      courseId,
      title,
      body
    ]
  );

  return findById(result.rows[0].id);
}

module.exports = {
  create,
  findById,
  list
};
