import {Client} from "minio";
import dotenv from "dotenv";

dotenv.config();

const minioClient = new Client({
    endPoint: process.env.MINIO_ENDPOINT || '',
    port: parseInt(process.env.MINIO_PORT || '9000'),
    useSSL: process.env.MINIO_USE_SSL === 'true',
    accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
    secretKey: process.env.MINIO_SECRET_KEY || 'minioadmin',
});

const bucketName = process.env.MINIO_BUCKET_NAME || 'cs554-finalproject';

export const initMinIO = async () => {
    const bucketExists = await minioClient.bucketExists(bucketName);
    if (!bucketExists){
        await minioClient.makeBucket(bucketName, process.env.MINIO_REGION || 'us-east-1');
    }
};

export const minioUtils = {
    async uploadFile(fileName: string, fileBuffer: Buffer, contentType: string): Promise<string> {
        await minioClient.putObject(bucketName, fileName, fileBuffer, fileBuffer.length, {'Content-Type': contentType});
        return fileName;
    },
    async getFileUrl(fileName: string): Promise<string> {
        return await minioClient.presignedGetObject(bucketName, fileName, 24 * 60 * 60 * 7);
    },
    async deleteFile(fileName: string): Promise<void> {
        await minioClient.removeObject(bucketName, fileName);
    },
    generatefileName(originalName: string, userId: string): string {
        const timestamp = Date.now();
        const extension = originalName.split('.').pop();
        return `${userId}-${timestamp}.${extension}`;
    },
};

export default minioClient;