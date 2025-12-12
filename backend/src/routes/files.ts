import express, { Request, Response } from 'express';
import minioClient, { minioBucketName } from '../config/minio';

const router = express.Router();

router.get('/:objectName', async (req: Request, res: Response): Promise<void> => {
  try {
    const rawName = req.params.objectName;
    const objectName = decodeURIComponent(rawName);
    if (!objectName || objectName.includes('..') || objectName.includes('/') || objectName.includes('\\')) {
      res.status(400).json({ success: false, message: 'Invalid file name' });
      return;
    }

    let contentType: string | undefined;
    try {
      const stat = await minioClient.statObject(minioBucketName, objectName);
      contentType = stat.metaData?.['content-type'] || stat.metaData?.['Content-Type'];
    } catch {
      res.status(404).json({ success: false, message: 'File not found' });
      return;
    }

    const stream = await minioClient.getObject(minioBucketName, objectName);

    if (contentType) res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=3600');
    stream.on('error', () => {
      if (!res.headersSent) {
        res.status(404).json({ success: false, message: 'File not found' });
      }
    });
    stream.pipe(res);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching file',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;


