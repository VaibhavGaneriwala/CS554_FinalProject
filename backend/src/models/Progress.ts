import mongoose, {Schema} from 'mongoose';
import {IProgress} from '../types';

const MeasurementSchema = new Schema(
    {
        chest: {type: Number, min: 0},
        waist: {type: Number, min: 0},
        hips: {type: Number, min: 0},
        arms: {type: Number, min: 0},
        legs: {type: Number, min: 0},
    },
    {_id: false}
);

const ProgressSchema = new Schema<IProgress>(
    {
        userId: {
            type: String,
            required: [true, 'User ID is required'],
            ref: 'User',
            index: true,
        },
        type: {
            type: String,
            required: [true, 'Progress type is required'],
            enum: {values: ['weight', 'pr', 'measurement', 'photo'], message: '{VALUE} is not a valid progress type'},
        },
        date: {
            type: Date,
            required: [true, 'Date is required'],
            default: Date.now,
        },
        weight: {
            type: Number,
            min: [0, 'Weight must be at least 0'],
            max: [500, 'Weight cannot exceed 500kg'],
            required: function (this: IProgress){return this.type === 'weight';},
        },
        exercise: {
            type: String,
            trim: true,
            required: function (this: IProgress){return this.type === 'pr';},
        },
        prValue: {
            type: Number,
            min: [0, 'PR value must be at least 0'],
            max: [100, 'PR value cannot exceed 100'],
            required: function (this: IProgress){return this.type === 'pr';},
        },
        measurement: {
            type: MeasurementSchema,
            required: function (this: IProgress){return this.type === 'measurement';},
        },
        photos: {
            type: [String],
            default: [],
            validate: {
                validator: function (this: IProgress, photos: string[]){
                    if (this.type === 'photo') return photos.length > 0;
                    return true;
                },
                message: 'Photo type progress must have at least one photo',
            },
        },
        notes: {
            type: String,
            trim: true,
            maxlength: [1000, 'Notes cannot exceed 1000 characters'],
        },
    },
    {timestamps: true,}
);

ProgressSchema.index({UserId: 1, date: -1});
ProgressSchema.index({type: 1});

const Progress = mongoose.model<IProgress>('Progress', ProgressSchema);
export default Progress;