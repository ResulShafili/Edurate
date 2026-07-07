function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase();
}

function getEmailDomain(email) {
  const normalized = normalizeEmail(email);
  const atIndex = normalized.lastIndexOf('@');

  if (atIndex <= 0 || atIndex === normalized.length - 1) {
    return null;
  }

  return normalized.slice(atIndex + 1);
}

function isValidEmailFormat(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || '').trim());
}

function domainMatchesAllowedDomain(domain, allowedDomain) {
  const normalizedAllowedDomain = String(allowedDomain || '')
    .trim()
    .toLowerCase()
    .replace(/^@/, '');

  if (!domain || !normalizedAllowedDomain) {
    return false;
  }

  return domain === normalizedAllowedDomain || domain.endsWith(`.${normalizedAllowedDomain}`);
}

function isUniversityEmail(email, allowedDomains) {
  const domain = getEmailDomain(email);

  if (!domain || !Array.isArray(allowedDomains) || allowedDomains.length === 0) {
    return false;
  }

  return allowedDomains.some((allowedDomain) => (
    domainMatchesAllowedDomain(domain, allowedDomain)
  ));
}

module.exports = {
  getEmailDomain,
  isUniversityEmail,
  isValidEmailFormat,
  normalizeEmail
};
