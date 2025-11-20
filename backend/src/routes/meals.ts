import express, {Request, Response} from 'express';
import {body, param} from 'express-validator';
import {Meal} from '../models/index';
import {authenticate} from '../middleware/auth';
import {handleValidationErrors, isValidObjectId} from '../utils/validation';
import {cacheUtils} from '../config/redis';
import multer from 'multer';
import {minioUtils} from '../config/minio';

const router = express.Router();

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {fileSize: 5 * 1024 * 1024},
    fileFilter: (req, file, cb) => {
        const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        if (allowedMimes.includes(file.mimetype)){
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only JPEG, JPG, PNG, and WEBP are allowed.'));
        }
    },
});

const mealValidation = [
    body('name').trim().isLength({min: 3, max: 100}).notEmpty().withMessage('Name is required'),
    body('mealType').isIn(['breakfast', 'lunch', 'dinner', 'snack']).withMessage('Invalid meal type'),
    body('nutrition.calories').isFloat({min: 0, max: 10000}).withMessage('Calories must be between 0 and 10000'),
    body('nutrition.protein').isFloat({min: 0, max: 1000}).withMessage('Protein must be between 0 and 1000g'),
    body('nutrition.carbs').isFloat({min: 0, max: 1000}).withMessage('Carbs must be between 0 and 1000g'),
    body('nutrition.fat').isFloat({min: 0, max: 1000}).withMessage('Fat must be between 0 and 1000g'),
    body('date').optional().isISO8601().withMessage('Invalid date format'),
];

router.post('/', authenticate, upload.array('photos', 5), mealValidation, handleValidationErrors, async (req: Request, res: Response): Promise<void> => {
    try {
        const {name, description, nutrition, mealType, date} = req.body;
        const userId = req.user?.userId;
        const files = req.files as Express.Multer.File[];
        const nutritionData = typeof nutrition === 'string' ? JSON.parse(nutrition) : nutrition;
        const photoUrls: string[] = [];
        if (files && files.length > 0){
            for (const file of files){
                const fileName = minioUtils.generatefileName(file.originalname, userId!);
                await minioUtils.uploadFile(fileName, file.buffer, file.mimetype);
                const fileUrl = await minioUtils.getFileUrl(fileName);
                photoUrls.push(fileUrl);
            }
        }
        const meal = await Meal.create({userId, name, description, nutrition: nutritionData, mealType, photos: photoUrls, date: date || new Date()});
        await cacheUtils.del(`meals:user:${userId}`);
        res.status(201).json({success: true, message: 'Meal created successfully', data: meal});
    } catch (error) {
        res.status(500).json({success: false, message: 'Error creating meal', error: error instanceof Error ? error.message : 'Unknown error'});
    }
});

router.get('/', authenticate, async (req: Request, res: Response): Promise<void> => {
    try {
        const {userId, mealType, startDate, endDate, page = 1, limit = 20} = req.query;
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
        if (mealType){
            query.mealType = mealType;
        }
        if (startDate || endDate){
            query.date = {};
            if (startDate) query.date.$gte = new Date(startDate as string);
            if (endDate) query.date.$lte = new Date(endDate as string);
        }
        const cacheKey = `meals:${JSON.stringify(query)}:page:${pageNum}`;
        const cachedData = await cacheUtils.get(cacheKey);
        if (cachedData){
            res.status(200).json({success: true, data: cachedData, cached: true});
            return;
        }
        const meals = await Meal.find(query).sort({date: -1}).skip(skip).limit(limitNum);
        const total = await Meal.countDocuments(query);
        const responseData = {meals, pagination: {currentPage: pageNum, totalPages: Math.ceil(total / limitNum), totalMeals: total, hasMore: skip + limitNum < total}};
        await cacheUtils.set(cacheKey, responseData, 300);
        res.status(200).json({success: true, data: responseData});
    } catch (error) {
        res.status(500).json({success: false, message: 'Error fetching meals', error: error instanceof Error ? error.message : 'Unknown error'});
    }
});

router.get('/:mealId', authenticate, param('mealId').custom((value) => {
    if (!isValidObjectId(value)) throw new Error('Invalid meal ID');
    return true;
}), handleValidationErrors, async (req: Request, res: Response): Promise<void> => {
    try {
        const {mealId} = req.params;
        const meal = await Meal.findById(mealId);
        if (!meal){
            res.status(404).json({success: false, message: 'Meal not found'});
            return;
        }
        res.status(200).json({success: true, data: meal});
    } catch (error) {
        res.status(500).json({success: false, message: 'Error fetching meal', error: error instanceof Error ? error.message : 'Unknown error'});
    }
});

router.put('/:mealId', authenticate, param('mealId').custom((value) => {
    if (!isValidObjectId(value)) throw new Error('Invalid meal ID');
    return true;
}), mealValidation, handleValidationErrors, async (req: Request, res: Response): Promise<void> => {
    try {
        const {mealId} = req.params;
        const userId = req.user?.userId;
        const meal = await Meal.findById(mealId);
        if (!meal){
            res.status(404).json({success: false, message: 'Meal not found'});
            return;
        }
        if (meal.userId !== userId){
            res.status(403).json({success: false, message: 'Unauthorized to update this meal'});
            return;
        }
        const updatedMeal = await Meal.findByIdAndUpdate(mealId, req.body, {new: true, runValidators: true});
        await cacheUtils.del(`meals:user:${userId}`);
        res.status(200).json({success: true, message: 'Meal updated successfully', data: updatedMeal});
    } catch (error) {
        res.status(500).json({success: false, message: 'Error updating meal', error: error instanceof Error ? error.message : 'Unknown error'});
    }
});

router.delete('/:mealId', authenticate, param('mealId').custom((value) => {
    if (!isValidObjectId(value)) throw new Error('Invalid meal ID');
    return true;
}), handleValidationErrors, async (req: Request, res: Response): Promise<void> => {
    try {
        const {mealId} = req.params;
        const userId = req.user?.userId;
        const meal = await Meal.findById(mealId);
        if (!meal){
            res.status(404).json({success: false, message: 'Meal not found'});
            return;
        }
        if (meal.userId !== userId){
            res.status(403).json({success: false, message: 'Unauthorized to delete this meal'});
            return;
        }
        if (meal.photos && meal.photos.length > 0){
            for (const photoUrl of meal.photos){
                const fileName = photoUrl.split('/').pop();
                if (fileName) await minioUtils.deleteFile(fileName);
            }
        }
        await Meal.findByIdAndDelete(mealId);
        await cacheUtils.del(`meals:user:${userId}`);
        res.status(200).json({success: true, message: 'Meal deleted successfully'});
    }
    catch (error) {
        res.status(500).json({success: false, message: 'Error deleting meal', error: error instanceof Error ? error.message : 'Unknown error'});
    }
});

export default router;