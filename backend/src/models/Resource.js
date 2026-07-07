const db = require('../config/db');

const resourceSelect = `
  pn.id,
  pn.university_id AS "universityId",
  pn.uploader_id AS "uploaderId",
  pn.course_id AS "courseId",
  c.code AS "courseCode",
  c.title AS "courseTitle",
  pn.title,
  pn.description,
  pn.file_name AS "fileName",
  pn.file_type AS "fileType",
  pn.file_url AS "fileUrl",
  pn.storage_key AS "storageKey",
  pn.file_size_bytes::int AS "fileSizeBytes",
  pn.page_count AS "pageCount",
  pn.is_anonymous AS "isAnonymous",
  CASE
    WHEN pn.is_anonymous THEN 'Anonim tələbə'
    ELSE COALESCE(u.full_name, 'Tələbə')
  END AS "uploaderName",
  pn.created_at AS "createdAt",
  pn.updated_at AS "updatedAt"
`;

function resourceJoins() {
  return `
    JOIN courses c
      ON c.id = pn.course_id
     AND c.university_id = pn.university_id
    JOIN users u
      ON u.id = pn.uploader_id
     AND u.university_id = pn.university_id
  `;
}

async function list({ courseId, universityId, fileType, search, limit = 40 } = {}) {
  const values = [];
  const filters = [`pn.moderation_status = 'active'`];

  if (courseId) {
    values.push(courseId);
    filters.push(`pn.course_id = $${values.length}`);
  }

  if (universityId) {
    values.push(universityId);
    filters.push(`pn.university_id = $${values.length}`);
  }

  if (fileType && fileType !== 'all') {
    values.push(fileType);
    filters.push(`pn.file_type = $${values.length}`);
  }

  if (search) {
    values.push(`%${search}%`);
    filters.push(`
      (
        pn.title ILIKE $${values.length}
        OR pn.description ILIKE $${values.length}
        OR pn.file_name ILIKE $${values.length}
        OR c.code ILIKE $${values.length}
        OR c.title ILIKE $${values.length}
      )
    `);
  }

  values.push(Math.min(Number(limit) || 40, 100));
  const limitParam = `$${values.length}`;

  const result = await db.query(
    `
      SELECT ${resourceSelect}
      FROM pdf_notes pn
      ${resourceJoins()}
      WHERE ${filters.join(' AND ')}
      ORDER BY pn.created_at DESC
      LIMIT ${limitParam}
    `,
    values
  );

  return result.rows;
}

async function create({
  universityId,
  uploaderId,
  courseId,
  title,
  description,
  fileName,
  fileType,
  fileUrl,
  storageKey,
  fileSizeBytes,
  isAnonymous
}) {
  const result = await db.query(
    `
      INSERT INTO pdf_notes (
        university_id,
        uploader_id,
        course_id,
        title,
        description,
        file_name,
        file_type,
        file_url,
        storage_key,
        file_size_bytes,
        is_anonymous
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING id
    `,
    [
      universityId,
      uploaderId,
      courseId,
      title,
      description || null,
      fileName,
      fileType,
      fileUrl,
      storageKey,
      fileSizeBytes,
      isAnonymous
    ]
  );

  const resources = await list({
    courseId,
    universityId,
    limit: 100
  });

  return resources.find((resource) => resource.id === result.rows[0].id) || null;
}

module.exports = {
  create,
  list
};
