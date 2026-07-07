const db = require('../config/db');

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
  listByProfessor,
  professorTeachesCourse
};
