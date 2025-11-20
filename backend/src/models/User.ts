import mongoose, {Schema} from "mongoose";
import bcrypt from "bcrypt";
import {IUser} from "../types";

const UserSchema = new Schema<IUser>(
    {
        name: {
            type: String,
            required: [true, "Name is required"],
            trim: true,
            minlength: [2, "Name must be at least 2 characters long"],
            maxlength: [50, "Name cannot exceed 50 characters"],
        },
        email: {
            type: String,
            required: [true, "Email is required"],
            trim: true,
            unique: true,
            lowercase: true,
            match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
        },
        password: {
            type: String,
            required: [true, "Password is required"],
            minlength: [8, "Password must be at least 8 characters long"],
            select: false,
        },
        age: {
            type: Number,
            min: [16, "Age must be at least 18"],
            max: [120, "Age cannot exceed 120"],
        },
        height: {
            type: Number,
            min: [50, "Height must be at least 50cm"],
            max: [300, "Height cannot exceed 300cm"],
        },
        weight: {
            type: Number,
            min: [20, "Weight must be at least 20kg"],
            max: [500, "Weight cannot exceed 500kg"],
        },
        profilePicture: {
            type: String,
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

UserSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    try {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
      next();
    } catch (error: any) {
      next(error);
    }
});

UserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
    try {
      return await bcrypt.compare(candidatePassword, this.password);
    } catch (error) {
      return false;
    }
};

UserSchema.index({ email: 1 });

const User = mongoose.model<IUser>('User', UserSchema);
export default User;