const multer = require('multer');
const upload = multer({ dest: 'temp_uploads/' });

function fileUploader() {
  return upload.any(); // Always returns req.files[]
}

module.exports = fileUploader;
