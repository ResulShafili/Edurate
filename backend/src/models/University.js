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

async function findByEmailDomain(domain) {
  const result = await db.query(
    `
      SELECT
        id,
        name,
        slug,
        email_domains AS "emailDomains"
      FROM universities
      WHERE EXISTS (
        SELECT 1
        FROM unnest(email_domains) AS allowed_domain
        WHERE lower($1) = lower(trim(allowed_domain))
          OR lower($1) LIKE '%.' || lower(trim(allowed_domain))
      )
      LIMIT 1
    `,
    [String(domain || '').trim().toLowerCase()]
  );

  return result.rows[0] || null;
}

module.exports = {
  findByEmailDomain,
  findById
};
