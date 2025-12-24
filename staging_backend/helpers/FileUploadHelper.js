const path = require('path');
const fs = require('fs');
const slugify = require('slugify');

function cleanImage(filename) {
  return filename.replace(/[^a-zA-Z0-9-_\.]/g, '');
}

/**
 * Uploads a single file and returns relative storage path.
 * You can loop this in controller for multiple files.
 */
function fileUploadOnServer(file, imageFolder = 'images') {
  const nameWithExtension = file.originalname;
  const name = path.parse(nameWithExtension).name;
  const customName = slugify(name, { lower: true });
  const extension = path.extname(nameWithExtension);
  const filename = `${Date.now()}-${customName}${extension}`;
  const cleanedFilename = cleanImage(filename);

  const directory = path.join(__dirname, '..', 'public', 'storage', imageFolder);
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, { recursive: true });
  }

  const filepath = path.join(directory, cleanedFilename);
  fs.renameSync(file.path, filepath);

  return `storage/${imageFolder}/${cleanedFilename}`;
}

module.exports = {
  fileUploadOnServer,
};
