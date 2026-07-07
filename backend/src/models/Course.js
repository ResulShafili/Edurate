const db = require('../config/db');

async function findById(id) {
  const result = await db.query(
    `
      SELECT
        c.id,
        c.university_id AS "universityId",
        c.department_id AS "departmentId",
        c.code,
        c.title,
        c.description,
        d.name AS "departmentName"
      FROM courses c
      JOIN departments d
        ON d.id = c.department_id
       AND d.university_id = c.university_id
      WHERE c.id = $1
      LIMIT 1
    `,
    [id]
  );

  return result.rows[0] || null;
}

async function list({ universityId, limit = 50 } = {}) {
  const values = [];
  const filters = [];

  if (universityId) {
    values.push(universityId);
    filters.push(`c.university_id = $${values.length}`);
  }

  values.push(Math.min(Number(limit) || 50, 100));
  const limitParam = `$${values.length}`;
  const whereClause = filters.length > 0 ? `WHERE ${filters.join(' AND ')}` : '';

  const result = await db.query(
    `
      SELECT
        c.id,
        c.university_id AS "universityId",
        c.code,
        c.title,
        d.name AS "departmentName"
      FROM courses c
      JOIN departments d
        ON d.id = c.department_id
       AND d.university_id = c.university_id
      ${whereClause}
      ORDER BY c.code ASC, c.title ASC
      LIMIT ${limitParam}
    `,
    values
  );

  return result.rows;
}

async function listByProfessor(professorId) {
  const result = await db.query(
    `
      SELECT
        c.id,
        c.code,
        c.title,
        c.description,
        d.name AS "departmentName"
      FROM teacher_courses tc
      JOIN courses c
        ON c.id = tc.course_id
       AND c.university_id = tc.university_id
      JOIN departments d
        ON d.id = c.department_id
       AND d.university_id = c.university_id
      WHERE tc.teacher_id = $1
      ORDER BY c.code ASC, c.title ASC
    `,
    [professorId]
  );

  return result.rows;
}

async function professorTeachesCourse({ professorId, courseId, universityId }) {
  const result = await db.query(
    `
      SELECT 1
      FROM teacher_courses
      WHERE teacher_id = $1
        AND course_id = $2
        AND university_id = $3
      LIMIT 1
    `,
    [professorId, courseId, universityId]
  );

  return result.rowCount > 0;
}

module.exports = {
  findById,
  list,
  listByProfessor,
  professorTeachesCourse
};
