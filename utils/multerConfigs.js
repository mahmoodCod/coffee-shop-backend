const multer = require("multer");

// استفاده از memory storage برای آپلود به MinIO
exports.multerStorage = () => {
  const storage = multer.memoryStorage();

  const upload = multer({
    storage: storage,
    limits: { fileSize: 512_000_000 }, // 512MB
  });

  return upload;
};
