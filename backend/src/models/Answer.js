const db = require('../config/db');

const answerSelect = `
  fa.id,
  fa.university_id AS "universityId",
  fa.question_id AS "questionId",
  fa.parent_answer_id AS "parentAnswerId",
  fa.author_id AS "authorId",
  u.full_name AS "authorName",
  fa.body,
  COALESCE(vote_stats.vote_score, 0)::int AS "voteScore",
  fa.created_at AS "createdAt",
  fa.updated_at AS "updatedAt"
`;

function answerJoins() {
  return `
    JOIN users u
      ON u.id = fa.author_id
     AND u.university_id = fa.university_id
    LEFT JOIN LATERAL (
      SELECT COALESCE(SUM(fav.value), 0) AS vote_score
      FROM forum_answer_votes fav
      WHERE fav.answer_id = fa.id
        AND fav.university_id = fa.university_id
    ) vote_stats ON true
  `;
}

async function listByQuestion(questionId) {
  const result = await db.query(
    `
      SELECT ${answerSelect}
      FROM forum_answers fa
      ${answerJoins()}
      WHERE fa.question_id = $1
        AND fa.moderation_status = 'active'
      ORDER BY "voteScore" DESC, fa.created_at ASC
    `,
    [questionId]
  );

  return result.rows;
}

async function findById(id) {
  const result = await db.query(
    `
      SELECT ${answerSelect}
      FROM forum_answers fa
      ${answerJoins()}
      WHERE fa.id = $1
        AND fa.moderation_status = 'active'
      LIMIT 1
    `,
    [id]
  );

  return result.rows[0] || null;
}

async function create({
  universityId,
  questionId,
  parentAnswerId,
  authorId,
  body
}) {
  const result = await db.query(
    `
      INSERT INTO forum_answers (
        university_id,
        question_id,
        parent_answer_id,
        author_id,
        body
      )
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id
    `,
    [
      universityId,
      questionId,
      parentAnswerId || null,
      authorId,
      body
    ]
  );

  return findById(result.rows[0].id);
}

async function vote({ answerId, userId, universityId, value }) {
  const answer = await findById(answerId);

  if (!answer || answer.universityId !== universityId) {
    return null;
  }

  if (value === 0) {
    await db.query(
      `
        DELETE FROM forum_answer_votes
        WHERE answer_id = $1
          AND user_id = $2
          AND university_id = $3
      `,
      [answerId, userId, universityId]
    );
  } else {
    await db.query(
      `
        INSERT INTO forum_answer_votes (
          answer_id,
          user_id,
          university_id,
          value
        )
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (answer_id, user_id)
        DO UPDATE SET
          value = EXCLUDED.value,
          created_at = now()
      `,
      [answerId, userId, universityId, value]
    );
  }

  return findById(answerId);
}

module.exports = {
  create,
  findById,
  listByQuestion,
  vote
};
