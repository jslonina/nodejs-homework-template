const multer = require("multer");
const path = require("path");
const fs = require("fs");

const tmpDir = path.join(process.cwd(), "tmp");

if (!fs.existsSync(tmpDir)) {
  try {
    fs.mkdirSync(tmpDir);
  } catch (error) {
    console.error("Error creating tmp directory:", error);
  }
}

const uploadStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, tmpDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage: uploadStorage });

module.exports = upload;