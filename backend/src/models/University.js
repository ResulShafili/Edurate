const db = require('../config/db');

async function findById(id) {
  const result = await db.query(
    `
      SELECT
        id,
        name,
        slug,
        email_domains AS "emailDomains"
      FROM universities
      WHERE id = $1
      LIMIT 1
    `,
    [id]
  );

  return result.rows[0] || null;
}

module.exports = {
  findById
};
