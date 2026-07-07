const fs = require('fs');
const path = require('path');

const multer = require('multer');

const uploadsDirectory = path.join(__dirname, '..', '..', 'uploads');
const resourceUploadsDirectory = path.join(uploadsDirectory, 'resources');

fs.mkdirSync(resourceUploadsDirectory, { recursive: true });

const allowedMimeTypes = new Map([
  ['application/pdf', 'pdf'],
  ['image/jpeg', 'image'],
  ['image/png', 'image'],
  ['image/webp', 'image']
]);

const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, resourceUploadsDirectory);
  },
  filename: (req, file, callback) => {
    const extension = path.extname(file.originalname).toLowerCase();
    const safeBaseName = path
      .basename(file.originalname, extension)
      .replace(/[^a-z0-9-_]+/gi, '-')
      .replace(/^-+|-+$/g, '')
      .toLowerCase()
      .slice(0, 48) || 'resource';
    const uniquePart = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;

    callback(null, `${safeBaseName}-${uniquePart}${extension}`);
  }
});

const uploadResource = multer({
  storage,
  limits: {
    fileSize: 15 * 1024 * 1024
  },
  fileFilter: (req, file, callback) => {
    if (!allowedMimeTypes.has(file.mimetype)) {
      return callback(new Error('Only PDF, PNG, JPG, and WEBP files are allowed'));
    }

    return callback(null, true);
  }
});

function getResourceFileType(mimetype) {
  return allowedMimeTypes.get(mimetype) || null;
}

module.exports = {
  getResourceFileType,
  resourceUploadsDirectory,
  uploadResource,
  uploadsDirectory
};
