const { minioClient, BUCKET_NAME, MINIO_BASE_URL } = require('../configs/minio');
const path = require('path');

/**
 * تشخیص Content-Type بر اساس extension
 */
const getContentType = (fileName) => {
    const ext = path.extname(fileName).toLowerCase();
    const contentTypes = {
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png',
        '.gif': 'image/gif',
        '.webp': 'image/webp',
        '.svg': 'image/svg+xml',
    };
    return contentTypes[ext] || 'application/octet-stream';
};

/**
 * آپلود فایل به MinIO
 * @param {Buffer} fileBuffer - محتوای فایل به صورت Buffer
 * @param {String} fileName - نام فایل
 * @param {String} folder - پوشه مقصد (مثل 'products', 'articles', 'categories')
 * @param {String} mimeType - نوع MIME فایل (اختیاری)
 * @returns {Promise<String>} - URL کامل فایل آپلود شده
 */
const uploadToMinio = async (fileBuffer, fileName, folder = 'images', mimeType = null) => {
    try {
        const objectName = `${folder}/${fileName}`;
        const contentType = mimeType || getContentType(fileName);
        
        await minioClient.putObject(
            BUCKET_NAME,
            objectName,
            fileBuffer,
            fileBuffer.length,
            {
                'Content-Type': contentType
            }
        );

        // ساخت URL کامل
        const fileUrl = `${MINIO_BASE_URL}/${BUCKET_NAME}/${objectName}`;
        return fileUrl;
    } catch (error) {
        console.error('خطا در آپلود به MinIO:', error);
        throw new Error(`خطا در آپلود فایل: ${error.message}`);
    }
};

/**
 * حذف فایل از MinIO
 * @param {String} fileUrl - URL کامل فایل
 * @returns {Promise<void>}
 */
const deleteFromMinio = async (fileUrl) => {
    try {
        // استخراج object name از URL
        const urlParts = fileUrl.split(`/${BUCKET_NAME}/`);
        if (urlParts.length < 2) {
            throw new Error('URL نامعتبر است');
        }
        const objectName = urlParts[1];
        
        await minioClient.removeObject(BUCKET_NAME, objectName);
    } catch (error) {
        console.error('خطا در حذف از MinIO:', error);
        throw new Error(`خطا در حذف فایل: ${error.message}`);
    }
};

/**
 * تولید نام یکتا برای فایل
 * @param {String} originalName - نام اصلی فایل
 * @returns {String} - نام یکتای فایل
 */
const generateUniqueFileName = (originalName) => {
    const ext = path.extname(originalName);
    const nameWithoutExt = path.basename(originalName, ext);
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 8);
    return `${nameWithoutExt}-${timestamp}-${randomStr}${ext}`;
};

module.exports = {
    uploadToMinio,
    deleteFromMinio,
    generateUniqueFileName
};

