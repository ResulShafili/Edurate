const db = require('../config/db');

const professorSelect = `
  t.id,
  t.full_name AS "fullName",
  t.title,
  t.bio,
  d.name AS "departmentName",
  u.name AS "universityName",
  COALESCE(stats.review_count, 0)::int AS "reviewCount",
  ROUND(COALESCE(stats.avg_overall, 0)::numeric, 1)::float AS "averageRating",
  ROUND(COALESCE(stats.avg_teaching, 0)::numeric, 1)::float AS "averageTeaching",
  ROUND(COALESCE(stats.avg_difficulty, 0)::numeric, 1)::float AS "averageDifficulty",
  ROUND(COALESCE(stats.avg_grading_fairness, 0)::numeric, 1)::float AS "averageObjectivity",
  COALESCE(course_list.courses, '[]'::jsonb) AS courses
`;

function professorJoins() {
  return `
    JOIN departments d
      ON d.id = t.department_id
     AND d.university_id = t.university_id
    JOIN universities u
      ON u.id = t.university_id
    LEFT JOIN LATERAL (
      SELECT jsonb_agg(
        jsonb_build_object(
          'id', c.id,
          'code', c.code,
          'title', c.title
        )
        ORDER BY c.code ASC, c.title ASC
      ) AS courses
      FROM teacher_courses tc
      JOIN courses c
        ON c.id = tc.course_id
       AND c.university_id = tc.university_id
      WHERE tc.teacher_id = t.id
        AND tc.university_id = t.university_id
    ) course_list ON true
    LEFT JOIN LATERAL (
      SELECT
        COUNT(*) AS review_count,
        AVG(rating_overall) AS avg_overall,
        AVG(rating_teaching) AS avg_teaching,
        AVG(rating_difficulty) AS avg_difficulty,
        AVG(rating_grading_fairness) AS avg_grading_fairness
      FROM teacher_reviews tr
      WHERE tr.teacher_id = t.id
        AND tr.university_id = t.university_id
        AND tr.moderation_status = 'active'
    ) stats ON true
  `;
}

async function list({ search, universityId, limit = 30 }) {
  const values = [];
  const filters = [];

  if (universityId) {
    values.push(universityId);
    filters.push(`t.university_id = $${values.length}`);
  }

  if (search) {
    values.push(`%${search}%`);
    filters.push(`
      (
        t.full_name ILIKE $${values.length}
        OR d.name ILIKE $${values.length}
        OR EXISTS (
          SELECT 1
          FROM teacher_courses tc_search
          JOIN courses c_search
            ON c_search.id = tc_search.course_id
           AND c_search.university_id = tc_search.university_id
          WHERE tc_search.teacher_id = t.id
            AND tc_search.university_id = t.university_id
            AND (
              c_search.code ILIKE $${values.length}
              OR c_search.title ILIKE $${values.length}
            )
        )
      )
    `);
  }

  values.push(Math.min(Number(limit) || 30, 60));
  const limitParam = `$${values.length}`;
  const whereClause = filters.length > 0 ? `WHERE ${filters.join(' AND ')}` : '';

  const result = await db.query(
    `
      SELECT ${professorSelect}
      FROM teachers t
      ${professorJoins()}
      ${whereClause}
      ORDER BY "averageRating" DESC, "reviewCount" DESC, t.full_name ASC
      LIMIT ${limitParam}
    `,
    values
  );

  return result.rows;
}

async function findById(id) {
  const result = await db.query(
    `
      SELECT ${professorSelect}
      FROM teachers t
      ${professorJoins()}
      WHERE t.id = $1
      LIMIT 1
    `,
    [id]
  );

  return result.rows[0] || null;
}

module.exports = {
  findById,
  list
};
