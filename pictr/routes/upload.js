// routes/upload.js
const express = require('express');
const multer = require('multer');
const path = require('path');
const router = express.Router();
const fs = require('fs');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../public/uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '_' + file.originalname;
    cb(null, uniqueName);
  }
});

const upload = multer({ storage });

router.post('/upload-image', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const imageUrl = `/uploads/${req.file.filename}`;
  res.json({ imageUrl });
});

router.post('/delete-image', (req, res) => {
  const { imageUrl } = req.body;

  if (!imageUrl) {
    return res.status(400).json({ message: 'imageUrl is required' });
  }

  const imagePath = path.join(__dirname, '..', 'public', imageUrl.replace('/uploads/', 'uploads/'));

  fs.unlink(imagePath, (err) => {
    if (err) {
      console.error('파일 삭제 실패:', err);
      return res.status(500).json({ message: '파일 삭제 실패' });
    }
    res.json({ message: '파일 삭제 성공' });
  });
});

module.exports = router;
