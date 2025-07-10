// server.js 또는 index.js
const express = require('express');
const app = express();
const path = require('path');
const uploadRoute = require('./routes/upload');

// CORS, bodyParser 설정 (필요한 경우)
const cors = require('cors');
app.use(cors());
app.use(express.json());

// 이미지 업로드 API 라우터
app.use('/api', uploadRoute);

// 정적 이미지 파일 제공 (/uploads/ 경로로 접근)
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// 서버 시작
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
