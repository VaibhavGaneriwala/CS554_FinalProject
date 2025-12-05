import express, {Request, Response} from 'express';
import {body, param} from 'express-validator';
import {User} from '../models/index';
import {authenticate} from '../middleware/auth';
import {handleValidationErrors, isValidObjectId} from '../utils/validation';
import { cacheUtils } from '../config/redis';

const router = express.Router();

router.get('/', async (req: Request, res: Response): Promise<void> => {
    try {
        const { page = 1, limit = 20, search} = req.query;
        const pageNum = parseInt(page as string);
        const limitNum = parseInt(limit as string);
        const skip = (pageNum - 1) * limitNum;

        const query: any = {};
        if (search){
            query.$or = [
                { firstName: { $regex: search, $options: 'i' } },
                { lastName: { $regex: search, $options: 'i' } }
            ];
        }
        const cacheKey = `users:page:${pageNum}:limit:${limitNum}:search:${search || 'none'}`;
        const cachedData = await cacheUtils.get(cacheKey);

        if (cachedData){
            res.status(200).json({success: true, data: cachedData, cached: true});
            return;
        }
        const users = await User.find(query).skip(skip).limit(limitNum).sort({createdAt: -1});
        const total = await User.countDocuments(query);
        const responseData = {users, pagination: {currentPage: pageNum, totalPages: Math.ceil(total/limitNum), totalUsers: total, hasMore: skip + users.length < total}};
        await cacheUtils.set(cacheKey, responseData, 3600);
        res.status(200).json({success: true, data: responseData});
    } catch (error) {
        res.status(500).json({success: false, message: 'Error fetching users', error: error instanceof Error ? error.message : 'Unknown error'});
    }
});

router.get(
    '/:userId', param('userId').custom((value) => {
        if (!isValidObjectId(value)) throw new Error('Invalid user Id');
        return true;
    }), handleValidationErrors, async (req: Request, res: Response): Promise<void> => {
        try {
            const {userId} = req.params;
            const cacheKey = `user:${userId}`;
            const cachedUser = await cacheUtils.get(cacheKey);
            if (cachedUser){
                res.status(200).json({success: true, data: cachedUser, cached: true});
                return;
            }
            const user = await User.findById(userId).select('firstName lastName email age height weight profilePicture createdAt');
            if (!user){
                res.status(404).json({success: false, message: 'User not found'});
                return;
            }
            await cacheUtils.set(cacheKey, user, 600);
            res.status(200).json({success: true, data: user});
        } catch (error) {
            res.status(500).json({success: false, message: 'Error fetching user', error: error instanceof Error ? error.message : 'Unknown error'});
        }
    }
);

router.put(
    '/profile', authenticate, [
        body('firstName').optional().trim().isLength({min: 2, max: 50}).withMessage('First name must be between 2 and 50 characters'),
        body('lastName').optional().trim().isLength({min: 2, max: 50}).withMessage('Last name must be between 2 and 50 characters'),
        body('age').optional().isInt({min: 16, max: 120}).withMessage('Age must be between 16 and 120'),
        body('height').optional().isFloat({min: 24, max: 96}).withMessage('Height must be between 2 and 8 feet'),
        body('weight').optional().isFloat({min: 20, max: 500}).withMessage('Weight must be between 20 and 500kg'),
        body('profilePicture').optional().isURL().withMessage('Invalid profile picture URL'),
    ], handleValidationErrors, async (req: Request, res: Response): Promise<void> => {
        try {
            const {firstName, lastName, age, height, weight} = req.body;
            const userId = req.user?.userId;
            const user = await User.findByIdAndUpdate(userId, {...(firstName && {firstName}), ...(lastName && {lastName}), ...(age && {age}), ...(height && {height}), ...(weight && {weight}),}, {new: true, runValidators: true});
            if (!user){
                res.status(404).json({success: false, message: 'User not found'});
                return;
            }
            await cacheUtils.del(`user:${userId}`);
            res.status(200).json({success: true, message: 'Profile updated successfully', data: {id: user._id, firstName: user.firstName, lastName: user.lastName, email: user.email, age: user.age, height: user.height, weight: user.weight, profilePicture: user.profilePicture, createdAt: user.createdAt}});
        } catch (error) {
            res.status(500).json({success: false, message: 'Error updating profile', error: error instanceof Error ? error.message : 'Unknown error'});
        }
    }
);

export default router;