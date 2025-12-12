import express, {Request, Response} from 'express';
import {body, param} from 'express-validator';
import {Workout} from '../models/index';
import {authenticate} from '../middleware/auth';
import {handleValidationErrors, isValidObjectId} from '../utils/validation';
import {cacheUtils} from '../config/redis';

const router = express.Router();

const clearWorkoutCache = async (userId: string): Promise<void> => {
    try {
        await cacheUtils.delPattern(`workouts:*`);
        await cacheUtils.del(`workouts:user:${userId}`);
    } catch (error) {
        console.error('Error clearing workout cache:', error);
        try {
            await cacheUtils.del(`workouts:user:${userId}`);
        } catch (e) {
            console.error('Error clearing workout cache:', e);
        }
    }
};

const workoutValidation = [
    body('title').trim().isLength({min: 3, max: 100}).withMessage('Title must be between 3 and 100 characters'),
    body('split').trim().isIn(['Push', 'Pull', 'Legs', 'Upper Body', 'Lower Body', 'Full Body', 'Chest', 'Back', 'Shoulders', 'Arms', 'Core', 'Cardio', 'Other']).withMessage('Invalid split type'),
    body('exercises').isArray({min: 1}).withMessage('Exercises must have at least one exercise'),
    body('exercises.*.name').trim().notEmpty().withMessage('Exercise name must be between 3 and 50 characters'),
    body('exercises.*.sets').isInt({min: 1, max: 10}).withMessage('Sets must be between 1 and 10'),
    body('exercises.*.reps').isInt({min: 1, max: 50}).withMessage('Reps must be between 1 and 50'),
    body('exercises.*.weight').isFloat({min: 0, max: 1000}).withMessage('Weight must be between 0 and 1000kg'),
    body('date').optional().isISO8601().withMessage('Invalid date format'),
    body('duration').optional().isInt({min: 0, max: 180}).withMessage('Duration must be between 0 and 180 minutes'),
];

router.post('/', authenticate, workoutValidation, handleValidationErrors, async (req: Request, res: Response): Promise<void> => {
    try {
        const {title, split, exercises, date, duration, notes} = req.body;
        const userId = req.user?.userId;
        if (!userId) {
            res.status(401).json({success: false, message: 'Unauthorized'});
            return;
        }
        const workout = await Workout.create({userId, title, split, exercises, date: date || new Date(), duration, notes});
        await clearWorkoutCache(userId);
        res.status(201).json({success: true, message: 'Workout created successfully', data: workout});
    } catch (error) {
        res.status(500).json({success: false, message: 'Error creating workout', error: error instanceof Error ? error.message : 'Unknown error'});
    }
});

router.get('/', authenticate, async (req: Request, res: Response): Promise<void> => {
    try {
        const {userId, split, startDate, endDate, page = 1, limit = 20} = req.query;
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
        if (split) query.split = split;
        if (startDate || endDate){
            query.date = {};
            if (startDate) query.date.$gte = new Date(startDate as string);
            if (endDate) query.date.$lte = new Date(endDate as string);
        }
        
        const workouts = await Workout.find(query).sort({date: -1}).skip(skip).limit(limitNum);
        const total = await Workout.countDocuments(query);
        const responseData = {workouts, total, pagination: {currentPage: pageNum, totalPages: Math.ceil(total / limitNum), totalWorkouts: total, hasMore: skip + workouts.length < total}};
        res.status(200).json({success: true, data: responseData});
    } catch (error) {
        res.status(500).json({success: false, message: 'Error fetching workouts', error: error instanceof Error ? error.message : 'Unknown error'});
    }
});

router.get(
    '/:workoutId', authenticate, param('workoutId').custom((value) => {
        if (!isValidObjectId(value)) throw new Error('Invalid workout ID');
        return true;
    }), handleValidationErrors, async (req: Request, res: Response): Promise<void> => {
        try {
            const {workoutId} = req.params;
            const workout = await Workout.findById(workoutId);
            if (!workout){
                res.status(404).json({success: false, message: 'Workout not found'});
                return;
            }
            res.status(200).json({success: true, data: workout});
        } catch (error) {
            res.status(500).json({success: false, message: 'Error fetching workout', error: error instanceof Error ? error.message : 'Unknown error'});
        }
    }
);

router.put(
    '/:workoutId', authenticate, param('workoutId').custom((value) => {
        if (!isValidObjectId(value)) throw new Error('Invalid workout ID');
        return true;
    }), workoutValidation, handleValidationErrors, async (req: Request, res: Response): Promise<void> => {
        try {
            const {workoutId} = req.params;
            const userId = req.user?.userId;
            const workout = await Workout.findById(workoutId);
            if (!workout){
                res.status(404).json({success: false, message: 'Workout not found'});
                return;
            }
            if (workout.userId !== userId){
                res.status(403).json({success: false, message: 'Unauthorized to update this workout'});
                return;
            }
            const updatedWorkout = await Workout.findByIdAndUpdate(workoutId, req.body, {new: true, runValidators: true});
            if (userId) {
                await clearWorkoutCache(userId);
            }
            res.status(200).json({success: true, message: 'Workout updated successfully', data: updatedWorkout});
        } catch (error) {
            res.status(500).json({success: false, message: 'Error updating workout', error: error instanceof Error ? error.message : 'Unknown error'});
        }
    }
);

router.delete(
    '/:workoutId', authenticate, param('workoutId').custom((value) => {
        if (!isValidObjectId(value)) throw new Error('Invalid workout ID');
        return true;
    }), handleValidationErrors, async (req: Request, res: Response): Promise<void> => {
        try {
            const {workoutId} = req.params;
            const userId = req.user?.userId;
            const workout = await Workout.findById(workoutId);
            if (!workout){
                res.status(404).json({success: false, message: 'Workout not found'});
                return;
            }
            if (workout.userId !== userId){
                res.status(403).json({success: false, message: 'Unauthorized to delete this workout'});
                return;
            }
            await Workout.findByIdAndDelete(workoutId);
            if (userId) {
                await clearWorkoutCache(userId);
            }
            res.status(200).json({success: true, message: 'Workout deleted successfully'});
        } catch (error) {
            res.status(500).json({success: false, message: 'Error deleting workout', error: error instanceof Error ? error.message : 'Unknown error'});
        }
    }
);

export default router;