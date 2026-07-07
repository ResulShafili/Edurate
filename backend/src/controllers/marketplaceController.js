const MarketItem = require('../models/MarketItem');

const allowedConditions = new Set(['new', 'like_new', 'good', 'fair', 'poor']);
const allowedCategories = new Set(['books', 'technology', 'clothing', 'other']);
const allowedContactMethods = new Set(['whatsapp', 'email']);

function cleanText(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function toPriceCents(value) {
  if (value === null || value === undefined || value === '') {
    return 0;
  }

  const numericValue = Number(value);

  if (!Number.isFinite(numericValue) || numericValue < 0) {
    return null;
  }

  return Math.round(numericValue * 100);
}

function normalizeWhatsApp(value) {
  const trimmed = cleanText(value);
  const digits = trimmed.replace(/\D/g, '');

  if (!digits) {
    return '';
  }

  return trimmed.startsWith('+') ? `+${digits}` : digits;
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isValidWhatsApp(value) {
  const digits = value.replace(/\D/g, '');
  return digits.length >= 7 && digits.length <= 15;
}

async function listMarketplaceItems(req, res, next) {
  try {
    const category = req.query.category ? String(req.query.category) : 'all';

    if (category !== 'all' && !allowedCategories.has(category)) {
      return res.status(400).json({
        message: 'category must be books, technology, clothing, other, or all'
      });
    }

    const items = await MarketItem.list({
      universityId: req.query.universityId ? String(req.query.universityId) : null,
      category,
      search: cleanText(req.query.search),
      limit: req.query.limit
    });

    return res.status(200).json({ items });
  } catch (error) {
    return next(error);
  }
}

async function createMarketplaceItem(req, res, next) {
  try {
    const title = cleanText(req.body.title);
    const description = cleanText(req.body.description);
    const categorySlug = cleanText(req.body.categorySlug || req.body.category);
    const categoryName = cleanText(req.body.categoryName);
    const condition = cleanText(req.body.condition || 'good');
    const campusLocation = cleanText(req.body.campusLocation);
    const imageUrl = cleanText(req.body.imageUrl);
    const swapNote = cleanText(req.body.swapNote);
    const contactMethod = cleanText(req.body.contactMethod || 'whatsapp').toLowerCase();
    const rawContactValue = cleanText(req.body.contactValue || req.body.contact);
    const priceCents = toPriceCents(req.body.price);
    const errors = [];

    let contactValue = rawContactValue;

    if (title.length < 3 || title.length > 140) {
      errors.push('title must be between 3 and 140 characters');
    }

    if (description.length < 8 || description.length > 1200) {
      errors.push('description must be between 8 and 1200 characters');
    }

    if (!allowedCategories.has(categorySlug)) {
      errors.push('categorySlug must be books, technology, clothing, or other');
    }

    if (!allowedConditions.has(condition)) {
      errors.push('condition must be new, like_new, good, fair, or poor');
    }

    if (priceCents === null) {
      errors.push('price must be a positive number or empty for swap');
    }

    if (swapNote.length > 240) {
      errors.push('swapNote must be 240 characters or fewer');
    }

    if (imageUrl && !/^https?:\/\//i.test(imageUrl)) {
      errors.push('imageUrl must be a valid http or https URL');
    }

    if (!allowedContactMethods.has(contactMethod)) {
      errors.push('contactMethod must be whatsapp or email');
    } else if (!rawContactValue) {
      errors.push('contactValue is required');
    } else if (contactMethod === 'email' && !isValidEmail(rawContactValue)) {
      errors.push('contactValue must be a valid email address');
    } else if (contactMethod === 'whatsapp') {
      contactValue = normalizeWhatsApp(rawContactValue);

      if (!isValidWhatsApp(contactValue)) {
        errors.push('contactValue must be a valid WhatsApp number');
      }
    }

    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }

    const item = await MarketItem.create({
      universityId: req.user.universityId,
      sellerId: req.user.id,
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
    });

    return res.status(201).json({
      message: 'Marketplace item created successfully',
      item
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  createMarketplaceItem,
  listMarketplaceItems
};
