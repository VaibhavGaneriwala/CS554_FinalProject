import { Client } from "minio";
import dotenv from "dotenv";

dotenv.config();

const minioClient = new Client({
  endPoint: process.env.MINIO_ENDPOINT || "minio",
  port: parseInt(process.env.MINIO_PORT || "9000", 10),
  useSSL: process.env.MINIO_USE_SSL === "true",
  accessKey: process.env.MINIO_ACCESS_KEY || "minioadmin",
  secretKey: process.env.MINIO_SECRET_KEY || "minioadmin",
});

export const minioBucketName = process.env.MINIO_BUCKET_NAME || "cs554-finalproject";

export const initMinIO = async () => {
  const bucketExists = await minioClient.bucketExists(minioBucketName);
  if (!bucketExists) {
    await minioClient.makeBucket(
      minioBucketName,
      process.env.MINIO_REGION || "us-east-1"
    );
  }
};

const PUBLIC_MINIO_BASE_URL =
  process.env.MINIO_PUBLIC_BASE_URL || "http://localhost:9000";

export const minioUtils = {
  async uploadFile(
    fileName: string,
    fileBuffer: Buffer,
    contentType: string
  ): Promise<string> {
    await minioClient.putObject(
      minioBucketName,
      fileName,
      fileBuffer,
      fileBuffer.length,
      { "Content-Type": contentType }
    );
    return fileName;
  },

  async getFileUrl(fileName: string): Promise<string> {
    const presigned = await minioClient.presignedGetObject(
      minioBucketName,
      fileName,
      24 * 60 * 60 * 7
    );

    return presigned.replace(/^https?:\/\/[^/]+/i, PUBLIC_MINIO_BASE_URL);
  },

  async deleteFile(fileName: string): Promise<void> {
    await minioClient.removeObject(minioBucketName, fileName);
  },

  generatefileName(originalName: string, userId: string): string {
    const timestamp = Date.now();
    const extension = originalName.split(".").pop();
    return `${userId}-${timestamp}.${extension}`;
  },
};

export default minioClient;
