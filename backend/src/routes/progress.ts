import express, {Request, Response} from 'express';
import {body, param} from 'express-validator';
import {Progress} from '../models/index';
import {authenticate} from '../middleware/auth';
import {handleValidationErrors, isValidObjectId} from '../utils/validation';
import {cacheUtils} from '../config/redis';
import multer from 'multer';
import { minioUtils } from '../config/minio';

const router = express.Router();

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {fileSize: 5 * 1024 * 1024},
    fileFilter: (_req, file, cb) => {
        const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        if (allowedMimes.includes(file.mimetype)){
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only JPEG, JPG, PNG, and WEBP are allowed.'));
        }
    },
});

const progressValidation = [
    body('type').isIn(['weight', 'pr', 'measurement', 'photo']).withMessage('Invalid progress type'),
    body('date').optional().isISO8601().withMessage('Invalid date format'),
    body('weight').if(body('type').equals('weight')).isFloat({min: 0, max: 500}).withMessage('Invalid weight value'),
    body('exercise').if(body('type').equals('pr')).trim().notEmpty().withMessage('Exercise name is required'),
    body('prValue').if(body('type').equals('pr')).isFloat({min: 0, max: 1000}).withMessage('Invalid PR value')
];

router.post('/', authenticate, upload.array('photos', 5), progressValidation, handleValidationErrors, async (req: Request, res: Response): Promise<void> => {
    try {
        const {type, date, weight, exercise, prValue, measurement, notes} = req.body;
        const userId = req.user?.userId;
        const files = req.files as Express.Multer.File[];
        const measurementData = measurement && typeof measurement === 'string' ? JSON.parse(measurement) : measurement;
        const photoUrls: string[] = [];
        if (files && files.length > 0){
            for (const file of files){
                const fileName = minioUtils.generatefileName(file.originalname, userId!);
                await minioUtils.uploadFile(fileName, file.buffer, file.mimetype);
                const fileUrl = `${req.protocol}://${req.get('host')}/api/files/${encodeURIComponent(fileName)}`;
                photoUrls.push(fileUrl);
            }
        }
        const progress = await Progress.create({userId, type, date: date || new Date(), ...(weight && {weight}), ...(exercise && {exercise}), ...(prValue && {prValue}), ...(measurement && {measurement: measurementData}), photos: photoUrls, notes});
        await cacheUtils.del(`progress:user:${userId}`);
        res.status(201).json({success: true, message: 'Progress created successfully', data: progress});
    } catch (error) {
        res.status(500).json({success: false, message: 'Error creating progress', error: error instanceof Error ? error.message : 'Unknown error'});
    }
});

router.get('/', authenticate, async (req: Request, res: Response): Promise<void> => {
    try {
        const {userId, type, startDate, endDate, page = 1, limit = 20} = req.query;
        const pageNum = parseInt(page as string);
        const limitNum = parseInt(limit as string);
        const skip = (pageNum - 1) * limitNum;
        const query: any = {};
        if (userId){
            query.userId = userId;
        }
        else {
            query.userId = req.user?.userId;
        }
        if (type) query.type = type;
        if (startDate || endDate) {
            query.date = {};
            if (typeof startDate === 'string') query.date.$gte = new Date(startDate);
            if (typeof endDate === 'string') query.date.$lte = new Date(endDate);
        }
        const cacheKey = `progress:${JSON.stringify(query)}:page:${pageNum}`;
        const cachedData = await cacheUtils.get(cacheKey);
        if (cachedData){
            res.status(200).json({success: true, message: 'Progress fetched successfully', data: cachedData, total: cachedData.length, page: pageNum, limit: limitNum});
            return;
        }
        const progressEntries = await Progress.find(query).sort({date: -1}).skip(skip).limit(limitNum);
        const total = await Progress.countDocuments(query);
        const responseData = {progressEntries, pagination: {currentPage: pageNum, totalPages: Math.ceil(total/limitNum), totalEntries: total, hasMore: skip + progressEntries.length < total}};
        await cacheUtils.set(cacheKey, responseData, 300);
        res.status(200).json({success: true, data: responseData});
    } catch (error) {
        res.status(500).json({success: false, message: 'Error getting progress', error: error instanceof Error ? error.message : 'Unknown error'});
    }
});

router.get('/:progressId', authenticate, param('progressId').custom((value) => {
    if (!isValidObjectId(value)) throw new Error('Invalid progress ID');
    return true;
}), handleValidationErrors, async (req: Request, res: Response): Promise<void> => {
    try {
        const {progressId} = req.params;
        const progress = await Progress.findById(progressId);
        if (!progress){
            res.status(404).json({success: false, message: 'Progress not found'});
            return;
        }
        res.status(200).json({success: true, data: progress});
    } catch (error) {
        res.status(500).json({success: false, message: 'Error getting progress', error: error instanceof Error ? error.message : 'Unknown error'});
    }
});

router.put('/:progressId', authenticate, param('progressId').custom((value => {
    if (!isValidObjectId(value)) throw new Error('Invalid progress ID');
    return true;
})), progressValidation, handleValidationErrors, async (req: Request, res: Response): Promise<void> => {
    try {
        const {progressId} = req.params;
        const userId = req.user?.userId;
        const progress = await Progress.findById(progressId);
        if (!progress){
            res.status(404).json({success: false, message: 'Progress not found'});
            return;
        }
        if (progress.userId !== userId){
            res.status(403).json({success: false, message: 'Unauthorized to update this progress'});
            return;
        }
        const updatedProgress = await Progress.findByIdAndUpdate(progressId, req.body, {new: true, runValidators: true});
        await cacheUtils.del(`progress:user:${userId}`);
        res.status(200).json({success: true, message: 'Progress updated successfully', data: updatedProgress});
    } catch (error) {
        res.status(500).json({success: false, message: 'Error updating progress', error: error instanceof Error ? error.message : 'Unknown error'});
    }
});

router.delete('/:progressId', authenticate, param('progressId').custom((value => {
    if (!isValidObjectId(value)) throw new Error('Invalid progress ID');
    return true;
})), handleValidationErrors, async (req: Request, res: Response): Promise<void> => {
    try {
        const {progressId} = req.params;
        const userId = req.user?.userId;
        const progress = await Progress.findById(progressId);
        if (!progress){
            res.status(404).json({success: false, message: 'Progress not found'});
            return;
        }
        if (progress.userId !== userId){
            res.status(403).json({success: false, message: 'Unauthorized to delete this progress'});
            return;
        }
        if (progress.photos && progress.photos.length > 0){
            for (const photoUrl of progress.photos){
                const fileName  = photoUrl.split('/').pop()!;
                if (fileName) await minioUtils.deleteFile(fileName);
            }
        }
        await Progress.findByIdAndDelete(progressId);
        await cacheUtils.del(`progress:user:${userId}`);
        res.status(200).json({success: true, message: 'Progress deleted successfully'});
    } catch (error) {
        res.status(500).json({success: false, message: 'Error deleting progress', error: error instanceof Error ? error.message : 'Unknown error'});
    }
});

export default router;