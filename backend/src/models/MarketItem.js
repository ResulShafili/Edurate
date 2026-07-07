const db = require('../config/db');

const defaultCategoryNames = {
  books: 'Kitablar',
  technology: 'Texnologiya',
  clothing: 'Geyim',
  other: 'Digər'
};

const defaultImageByCategory = {
  books: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=900&q=80',
  technology: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=900&q=80',
  clothing: 'https://images.unsplash.com/photo-1523381294911-8d3cead13475?auto=format&fit=crop&w=900&q=80',
  other: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=900&q=80'
};

const marketItemSelect = `
  si.id,
  si.university_id AS "universityId",
  si.seller_id AS "sellerId",
  u.full_name AS "sellerName",
  si.category_id AS "categoryId",
  sc.name AS "categoryName",
  sc.slug AS "categorySlug",
  si.title,
  si.description,
  si.price_cents AS "priceCents",
  si.currency,
  si.swap_note AS "swapNote",
  si.condition,
  si.status,
  si.campus_location AS "campusLocation",
  si.contact_method AS "contactMethod",
  si.contact_value AS "contactValue",
  COALESCE(image_list.image_url, 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=900&q=80') AS "imageUrl",
  si.created_at AS "createdAt",
  si.updated_at AS "updatedAt"
`;

function marketItemJoins() {
  return `
    JOIN users u
      ON u.id = si.seller_id
     AND u.university_id = si.university_id
    JOIN swap_categories sc
      ON sc.id = si.category_id
     AND sc.university_id = si.university_id
    LEFT JOIN LATERAL (
      SELECT sii.image_url
      FROM swap_item_images sii
      WHERE sii.item_id = si.id
      ORDER BY sii.sort_order ASC, sii.created_at ASC
      LIMIT 1
    ) image_list ON true
  `;
}

function normalizeSlug(value) {
  const slug = String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  return slug || 'other';
}

async function list({ universityId, category, search, limit = 40 } = {}) {
  const values = [];
  const filters = [`si.status = 'available'`];

  if (universityId) {
    values.push(universityId);
    filters.push(`si.university_id = $${values.length}`);
  }

  if (category && category !== 'all') {
    values.push(normalizeSlug(category));
    filters.push(`sc.slug = $${values.length}`);
  }

  if (search) {
    values.push(`%${search}%`);
    filters.push(`
      (
        si.title ILIKE $${values.length}
        OR si.description ILIKE $${values.length}
        OR sc.name ILIKE $${values.length}
        OR si.campus_location ILIKE $${values.length}
      )
    `);
  }

  values.push(Math.min(Number(limit) || 40, 100));
  const limitParam = `$${values.length}`;

  const result = await db.query(
    `
      SELECT ${marketItemSelect}
      FROM swap_items si
      ${marketItemJoins()}
      WHERE ${filters.join(' AND ')}
      ORDER BY si.created_at DESC
      LIMIT ${limitParam}
    `,
    values
  );

  return result.rows;
}

async function findById(id) {
  const result = await db.query(
    `
      SELECT ${marketItemSelect}
      FROM swap_items si
      ${marketItemJoins()}
      WHERE si.id = $1
      LIMIT 1
    `,
    [id]
  );

  return result.rows[0] || null;
}

async function findOrCreateCategory({ universityId, categorySlug, categoryName }) {
  const slug = normalizeSlug(categorySlug || categoryName);
  const name = categoryName || defaultCategoryNames[slug] || 'Digər';
  const result = await db.query(
    `
      INSERT INTO swap_categories (
        university_id,
        name,
        slug
      )
      VALUES ($1, $2, $3)
      ON CONFLICT (university_id, slug)
      DO UPDATE SET
        name = EXCLUDED.name
      RETURNING
        id,
        name,
        slug
    `,
    [universityId, name, slug]
  );

  return result.rows[0];
}

async function create({
  universityId,
  sellerId,
  categorySlug,
  categoryName,
  title,
  description,
  priceCents,
  swapNote,
  condition,
  campusLocation,
  contactMethod,
  contactValue,
  imageUrl
}) {
  const category = await findOrCreateCategory({
    universityId,
    categorySlug,
    categoryName
  });

  const item = await db.query(
    `
      INSERT INTO swap_items (
        university_id,
        seller_id,
        category_id,
        title,
        description,
        price_cents,
        swap_note,
        condition,
        campus_location,
        contact_method,
        contact_value
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING id
    `,
    [
      universityId,
      sellerId,
      category.id,
      title,
      description,
      priceCents,
      swapNote || null,
      condition,
      campusLocation || null,
      contactMethod,
      contactValue
    ]
  );

  const finalImageUrl =
    imageUrl ||
    defaultImageByCategory[category.slug] ||
    defaultImageByCategory.other;

  await db.query(
    `
      INSERT INTO swap_item_images (
        item_id,
        image_url,
        sort_order
      )
      VALUES ($1, $2, 0)
    `,
    [item.rows[0].id, finalImageUrl]
  );

  return findById(item.rows[0].id);
}

module.exports = {
  create,
  defaultCategoryNames,
  list
};
