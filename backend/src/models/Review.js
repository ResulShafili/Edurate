const db = require('../config/db');

async function listByProfessor(professorId) {
  const result = await db.query(
    `
      SELECT
        tr.id,
        tr.teacher_id AS "professorId",
        tr.course_id AS "courseId",
        c.code AS "courseCode",
        c.title AS "courseTitle",
        tr.rating_overall AS "ratingOverall",
        tr.rating_teaching AS "ratingTeaching",
        tr.rating_course_balance AS "ratingCourseBalance",
        (6 - tr.rating_course_balance) AS "ratingDifficulty",
        tr.rating_grading_fairness AS "ratingObjectivity",
        tr.would_take_again AS "wouldTakeAgain",
        tr.is_anonymous AS "isAnonymous",
        tr.semester,
        tr.academic_year AS "academicYear",
        CASE
          WHEN tr.is_anonymous THEN 'Anonim tələbə'
          ELSE COALESCE(u.full_name, 'Tələbə')
        END AS "reviewerName",
        tr.created_at AS "createdAt"
      FROM teacher_reviews tr
      JOIN courses c
        ON c.id = tr.course_id
       AND c.university_id = tr.university_id
      LEFT JOIN users u
        ON u.id = tr.reviewer_id
       AND u.university_id = tr.university_id
      WHERE tr.teacher_id = $1
        AND tr.moderation_status = 'active'
      ORDER BY tr.created_at DESC
    `,
    [professorId]
  );

  return result.rows;
}

async function create({
  universityId,
  reviewerId,
  professorId,
  courseId,
  semester,
  academicYear,
  ratingOverall,
  ratingTeaching,
  ratingCourseBalance,
  ratingObjectivity,
  wouldTakeAgain,
  isAnonymous
}) {
  const result = await db.query(
    `
      INSERT INTO teacher_reviews (
        university_id,
        reviewer_id,
        teacher_id,
        course_id,
        semester,
        academic_year,
        rating_overall,
        rating_teaching,
        rating_course_balance,
        rating_grading_fairness,
        would_take_again,
        is_anonymous
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING
        id,
        teacher_id AS "professorId",
        course_id AS "courseId",
        rating_overall AS "ratingOverall",
        rating_teaching AS "ratingTeaching",
        rating_course_balance AS "ratingCourseBalance",
        (6 - rating_course_balance) AS "ratingDifficulty",
        rating_grading_fairness AS "ratingObjectivity",
        would_take_again AS "wouldTakeAgain",
        is_anonymous AS "isAnonymous",
        semester,
        academic_year AS "academicYear",
        created_at AS "createdAt"
    `,
    [
      universityId,
      reviewerId,
      professorId,
      courseId,
      semester,
      academicYear,
      ratingOverall,
      ratingTeaching,
      ratingCourseBalance,
      ratingObjectivity,
      wouldTakeAgain,
      isAnonymous
    ]
  );

  return result.rows[0];
}

module.exports = {
  create,
  listByProfessor
};
