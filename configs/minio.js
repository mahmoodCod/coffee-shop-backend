const Minio = require('minio');
require('dotenv').config();

const ENABLE_MINIO = process.env.ENABLE_MINIO === 'true';

let minioClient = null;
let BUCKET_NAME = null;
let MINIO_BASE_URL = null;

if (ENABLE_MINIO) {
    minioClient = new Minio.Client({
        endPoint: process.env.MINIO_ENDPOINT || 'localhost',
        port: parseInt(process.env.MINIO_PORT) || 9000,
        useSSL: process.env.MINIO_USE_SSL === 'true',
        accessKey: process.env.MINIO_ACCESS_KEY,
        secretKey: process.env.MINIO_SECRET_KEY,
    });

    BUCKET_NAME = process.env.MINIO_BUCKET_NAME || 'coffee-shop';
    MINIO_BASE_URL = process.env.MINIO_BASE_URL ||
        `http://${process.env.MINIO_ENDPOINT || 'localhost'}:${process.env.MINIO_PORT || 9000}`;

    (async () => {
        try {
            const exists = await minioClient.bucketExists(BUCKET_NAME);
            if (!exists) {
                await minioClient.makeBucket(BUCKET_NAME, 'us-east-1');
                console.log(`Bucket ${BUCKET_NAME} ایجاد شد`);
            }
        } catch (err) {
            console.error('خطا در اتصال به MinIO:', err.message);
        }
    })();
} else {
    console.log('⛔ MinIO غیرفعال است');
}

module.exports = {
    minioClient,
    BUCKET_NAME,
    MINIO_BASE_URL,
    ENABLE_MINIO
};
