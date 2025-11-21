import express, { Request, Response } from 'express';
import { body, param } from 'express-validator';
import { Post, Workout, Meal, Progress } from '../models/index';
import { authenticate } from '../middleware/auth';
import { handleValidationErrors, isValidObjectId } from '../utils/validation';
import {cacheUtils} from '../config/redis';

const router = express.Router();

const postValidation = [
    body('type').isIn(['workout', 'meal', 'progress']).withMessage('Invalid post type'),
    body('content').trim().isLength({min: 1, max: 1000}).withMessage('Content must be between 1 and 1000 characters'),
    body('workoutId').optional().custom((value) => {
        if (value && !isValidObjectId(value)) throw new Error('Invalid workout ID');
        return true;
    }),
    body('mealId').optional().custom((value) => {
        if (value && !isValidObjectId(value)) throw new Error('Invalid meal ID');
        return true;
    }),
    body('progressId').optional().custom((value) => {
        if (value && !isValidObjectId(value)) throw new Error('Invalid progress ID');
        return true;
    }),
];

router.post('/', authenticate, postValidation, handleValidationErrors, async (req: Request, res: Response): Promise<void>  => {
    try {
        const {type, content, workoutId, mealId, progressId} = req.body;
        const userId = req.user?.userId;
        if (type === 'workout' && workoutId){
            const workout = await Workout.findById(workoutId);
            if (!workout || workout.userId !== userId) {
                res.status(404).json({success: false, message: 'Workout not found or unauthorized'});
                return;
            }
        }
        if (type === 'meal' && mealId){
            const meal = await Meal.findById(mealId);
            if (!meal || meal.userId !== userId) {
                res.status(404).json({success: false, message: 'Meal not found or unauthorized'});
                return;
            }
        }
        if (type === 'progress' && progressId){
            const progress = await Progress.findById(progressId);
            if (!progress || progress.userId !== userId) {
                res.status(404).json({success: false, message: 'Progress not found or unauthorized'});
                return;
            }
        }
        const post = await Post.create({userId, type, content, workoutId, mealId, progressId});
        await cacheUtils.del('posts:feed');
        res.status(201).json({success: true, message: 'Post created successfully', data: post});
    } catch (error) {
        res.status(500).json({success: false, message: 'Internal server error', error: error instanceof Error ? error.message : 'Unknown error'});
    }
});

router.get('/', authenticate, async (req: Request, res: Response): Promise<void> => {
    try {
        const {userId, type, page = 1, limit = 20} = req.query;
        const pageNum = parseInt(page as string);
        const limitNum = parseInt(limit as string);
        const skip = (pageNum - 1) * limitNum;
        const query: any = {};
        if (userId) query.userId = userId;
        if (type) query.type = type;

        const cacheKey = `posts:${JSON.stringify(query)}:page:${pageNum}`;
        const cachedData = await cacheUtils.get(cacheKey);
        if (cachedData){
            res.status(200).json({success: true, data: cachedData, cached: true});
            return;
        }
        const posts = await Post.find(query).populate('workoutId').populate('mealId').populate('progressId').sort({createdAt: -1}).skip(skip).limit(limitNum);
        const total = await Post.countDocuments(query);
        const responseData = {posts, pagination: {currentPage: pageNum, totalPages: Math.ceil(total / limitNum), totalPosts: total, hasMore: skip + posts.length < total}};
        await cacheUtils.set(cacheKey, responseData, 120);
        res.status(200).json({success: true, data: responseData});
    } catch (error) {
        res.status(500).json({success: false, message: 'Internal server error', error: error instanceof Error ? error.message : 'Unknown error'});
    }
});

router.get('/:postId', authenticate, param('postId').custom((value) => {
    if (!isValidObjectId(value)) throw new Error('Invalid post ID');
    return true;
}), handleValidationErrors, async (req: Request, res: Response): Promise<void> => {
    try {
        const {postId} = req.params;
        const post = await Post.findById(postId).populate('workoutId').populate('mealId').populate('progressId');
        if (!post) {
            res.status(404).json({success: false, message: 'Post not found'});
            return;
        }
        res.status(200).json({success: true, data: post});
    } catch (error) {
        res.status(500).json({success: false, message: 'Internal server error', error: error instanceof Error ? error.message : 'Unknown error'});
    }
});

router.post('/:postId/like', authenticate, param('postId').custom((value) => {
    if (!isValidObjectId(value)) throw new Error('Invalid post ID');
    return true;
}), handleValidationErrors, async (req: Request, res: Response): Promise<void> => {
    try {
        const {postId} = req.params;
        const userId = req.user?.userId;
        const post = await Post.findById(postId);
        if (!post){
            res.status(404).json({success: false, message: 'Post not found'});
            return;
        }
        const likeIndex = post.likes.indexOf(userId!);
        if (likeIndex > -1){
            post.likes.splice(likeIndex, 1);
            await post.save();
            res.status(200).json({success: true, message: 'Post unliked', data: {liked: false, likesCount: post.likes.length}});
        }
        else {
            post.likes.push(userId!);
            await post.save();
            res.status(200).json({success: true, message: 'Post liked', data: {liked: true, likesCount: post.likes.length}});
        }
        await cacheUtils.del(`posts:feed`);
    } catch (error) {
        res.status(500).json({success: false, message: 'Internal server error', error: error instanceof Error ? error.message : 'Unknown error'});
    }
});

router.post('/:postId/comment', authenticate, param('postId').custom((value) => {
    if (!isValidObjectId(value)) throw new Error('Invalid post ID');
    return true;
}), body('text').trim().isLength({min: 1, max: 1000}).withMessage('Comment must be between 1 and 1000 characters'), handleValidationErrors, async (req: Request, res: Response): Promise<void> => {
    try {
        const {postId} = req.params;
        const {text} = req.body;
        const userId = req.user?.userId;
        const post = await Post.findById(postId);
        if (!post){
            res.status(404).json({success: false, message: 'Post not found'});
            return;
        }
        post.comments.push({userId: userId!, text, createdAt: new Date()});
        await post.save();
        await cacheUtils.del(`posts:feed`);
        res.status(201).json({success: true, message: 'Comment added', data: post.comments[post.comments.length - 1]});
    } catch (error) {
        res.status(500).json({success: false, message: 'Internal server error', error: error instanceof Error ? error.message : 'Unknown error'});
    }
});

router.delete('/:postId', authenticate, param('postId').custom((value) => {
    if (!isValidObjectId(value)) throw new Error('Invalid post ID');
    return true;
}), handleValidationErrors, async (req: Request, res: Response): Promise<void> => {
    try {
        const {postId} = req.params;
        const userId = req.user?.userId;
        const post = await Post.findById(postId);
        if (!post){
            res.status(404).json({success: false, message: 'Post not found'});
            return;
        }
        if (post.userId !== userId){
            res.status(403).json({success: false, message: 'Unauthorized to delete this post'});
            return;
        }
        await Post.findByIdAndDelete(postId);
        await cacheUtils.del(`posts:feed`);
        res.status(200).json({success: true, message: 'Post deleted'});
    } catch (error) {
        res.status(500).json({success: false, message: 'Internal server error', error: error instanceof Error ? error.message : 'Unknown error'});
    }
});

export default router;