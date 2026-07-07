const db = require('../config/db');

const publicUserFields = `
  id,
  university_id AS "universityId",
  email,
  full_name AS "fullName",
  username,
  avatar_url AS "avatarUrl",
  role,
  is_email_verified AS "isEmailVerified",
  email_verified_at AS "emailVerifiedAt",
  created_at AS "createdAt",
  updated_at AS "updatedAt"
`;

const privateUserFields = `
  ${publicUserFields},
  password_hash AS "passwordHash"
`;

function toPublicUser(user) {
  if (!user) {
    return null;
  }

  const { passwordHash, ...publicUser } = user;
  return publicUser;
}

async function create({ universityId, email, passwordHash, fullName, username }) {
  const result = await db.query(
    `
      INSERT INTO users (
        university_id,
        email,
        password_hash,
        full_name,
        username
      )
      VALUES ($1, $2, $3, $4, $5)
      RETURNING ${publicUserFields}
    `,
    [
      universityId,
      email,
      passwordHash,
      fullName,
      username || null
    ]
  );

  return result.rows[0];
}

async function findByEmail(email) {
  const result = await db.query(
    `
      SELECT ${privateUserFields}
      FROM users
      WHERE email = $1
      LIMIT 1
    `,
    [email]
  );

  return result.rows[0] || null;
}

async function findById(id) {
  const result = await db.query(
    `
      SELECT ${publicUserFields}
      FROM users
      WHERE id = $1
      LIMIT 1
    `,
    [id]
  );

  return result.rows[0] || null;
}

module.exports = {
  create,
  findByEmail,
  findById,
  toPublicUser
};
