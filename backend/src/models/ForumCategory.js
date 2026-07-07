const db = require('../config/db');

async function findById({ categoryId, universityId }) {
  const result = await db.query(
    `
      SELECT
        id,
        university_id AS "universityId",
        name,
        slug,
        description
      FROM forum_categories
      WHERE id = $1
        AND university_id = $2
      LIMIT 1
    `,
    [categoryId, universityId]
  );

  return result.rows[0] || null;
}

async function findOrCreateDefault(universityId) {
  const result = await db.query(
    `
      INSERT INTO forum_categories (
        university_id,
        name,
        slug,
        description
      )
      VALUES ($1, 'Fənn sualları', 'course-questions', 'Fənlər üzrə tələbə sual-cavabları')
      ON CONFLICT (university_id, slug)
      DO UPDATE SET
        name = EXCLUDED.name,
        description = EXCLUDED.description
      RETURNING
        id,
        university_id AS "universityId",
        name,
        slug,
        description
    `,
    [universityId]
  );

  return result.rows[0];
}

module.exports = {
  findById,
  findOrCreateDefault
};
