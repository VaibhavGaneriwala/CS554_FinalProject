import {Client} from "minio";
import dotenv from "dotenv";

dotenv.config();

const minioClient = new Client({
    endPoint: process.env.MINIO_ENDPOINT || 'localhost',
    port: parseInt(process.env.MINIO_PORT || '9000'),
    useSSL: process.env.MINIO_USE_SSL === 'true',
    accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
    secretKey: process.env.MINIO_SECRET_KEY || 'minioadmin',
});

const bucketName = process.env.MINIO_BUCKET_NAME || 'cs554-finalproject';

export const initMinIO = async () => {
    try {
        const bucketExists = await minioClient.bucketExists(bucketName);
        if (!bucketExists){
            await minioClient.makeBucket(bucketName, process.env.MINIO_REGION || 'us-east-1');
            console.log(`Bucket ${bucketName} created`);
        } else {
            console.log(`Bucket ${bucketName} already exists`);
        }
    } catch (error) {
        console.error("Error initializing MinIO:", error);
        process.exit(1);
    }
};

export const minioUtils = {
    async uploadFile(fileName: string, fileBuffer: Buffer, contentType: string): Promise<string> {
        try {
            await minioClient.putObject(bucketName, fileName, fileBuffer, fileBuffer.length, {'Content-Type': contentType});
            return fileName;
        } catch (error) {
            console.error("Error uploading file to MinIO:", error);
            throw error;
        }
    },
    async getFileUrl(fileName: string): Promise<string> {
        try {
            const url = await minioClient.presignedGetObject(bucketName, fileName, 24 * 60 * 60 * 7);
            return url;
        } catch (error) {
            console.error("Error getting file URL from MinIO:", error);
            throw error;
        }
    },
    async deleteFile(fileName: string): Promise<void> {
        try {
            await minioClient.removeObject(bucketName, fileName);
            console.log(`File ${fileName} deleted from MinIO`);
        } catch (error) {
            console.error("Error deleting file from MinIO:", error);
            throw error;
        }
    },
    async generatefileName(originalName: string, userId: string): string {
        const timestamp = Date.now();
        const extension = originalName.split('.').pop();
        return `${userId}-${timestamp}.${extension}`;
    },
};

export default minioClient;