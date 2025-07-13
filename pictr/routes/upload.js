const express = require('express');
const multer = require('multer');
const path = require('path');
const router = express.Router();
const fs = require('fs');

// 업로드될 디렉토리 경로를 명확하게 정의합니다.
const uploadDir = path.join(__dirname, '../public/uploads');

// 서버가 시작될 때, 해당 디렉토리가 없으면 자동으로 생성합니다.
// 이는 초기 설정 오류를 방지합니다.
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // --- 가장 안정적으로 확장자를 보존하는 파일명 생성 로직 ---

    // 1. path.extname()으로 원본 파일의 확장자를 추출합니다. (예: '.png', '.jpg')
    const extension = path.extname(file.originalname);

    // 2. 확장자를 제외한 순수한 파일명을 추출합니다.
    const basename = path.basename(file.originalname, extension);

    // 3. '파일명-타임스탬프.확장자' 형태로 고유한 이름을 만듭니다.
    const uniqueName = `${basename.replace(/ /g, '_')}-${Date.now()}${extension}`;
    
    cb(null, uniqueName);
  }
});

const upload = multer({ storage });

// 이미지 업로드 API
// POST /api/upload-image
router.post('/upload-image', upload.single('file'), (req, res) => {
  // multer가 파일을 처리한 후 req.file 객체를 확인합니다.
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  // 성공적으로 업로드 되면, 클라이언트가 접근할 수 있는 URL을 반환합니다.
  // (예: /uploads/my-photo-1678886400000.jpg)
  const imageUrl = `/uploads/${req.file.filename}`;
  res.json({ imageUrl });
});


// 이미지 삭제 API
// POST /api/delete-image
router.post('/delete-image', (req, res) => {
    const { imageUrl } = req.body; // 예: "/uploads/my-photo-1678886400000.jpg"

    if (!imageUrl) {
        return res.status(400).json({ message: 'imageUrl is required' });
    }

    try {
        const filename = path.basename(imageUrl); // URL에서 파일명만 안전하게 추출
        const imagePath = path.join(uploadDir, filename);

        // 파일이 실제로 존재하는지 확인 후 삭제
        if (fs.existsSync(imagePath)) {
            fs.unlinkSync(imagePath);
            res.json({ message: '파일 삭제 성공' });
        } else {
            res.status(404).json({ message: '삭제할 파일을 찾을 수 없습니다.' });
        }
    } catch (err) {
        console.error('파일 삭제 중 오류 발생:', err);
        res.status(500).json({ message: '파일 삭제 중 서버 오류가 발생했습니다.' });
    }
});


module.exports = router;