import { Document } from "mongoose";

export interface IUser extends Document {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  age?: number;
  height?: number;
  weight?: number;
  goalWeight?: number;
  profilePicture?: string;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

export interface IExercise {
  name: string;
  sets: number;
  reps: number;
  weight: number;
  notes?: string;
}

export interface IWorkout extends Document {
  _id: string;
  userId: string;
  title: string;
  split: string;
  exercises: IExercise[];
  date: Date;
  duration?: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface INutritionInfo {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  sugar?: number;
}

export interface IMeal extends Document {
  _id: string;
  userId: string;
  name: string;
  description?: string;
  nutrition: INutritionInfo;
  mealType: "breakfast" | "lunch" | "dinner" | "snack";
  photos?: string[];
  date: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IProgress extends Document {
  _id: string;
  userId: string;
  type: "weight" | "pr" | "measurement" | "photo";
  date: Date;
  weight?: number;
  exercise?: string;
  prValue?: number;
  measurement?: {
    chest?: number;
    waist?: number;
    hips?: number;
    arms?: number;
    legs?: number;
  };
  photos?: string[];
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IReply {
  _id: string;
  userId: string;
  text: string;
  createdAt: Date;
}

export interface IComment {
  _id: string;
  userId: string;
  text: string;
  createdAt: Date;
  replies: IReply[];
}

export interface IPost extends Document {
  _id: string;
  userId: string;
  type: "workout" | "meal" | "progress";
  content: string;
  workoutId?: string;
  mealId?: string;
  progressId?: string;
  likes: string[];
  comments: IComment[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserPublic {
  _id: string;
  firstName: string;
  lastName: string;
}

export interface IJWTPayload {
  userId: string;
  email: string;
}

export interface IApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export interface IAuthRequest extends Express.Request {
  user?: {
    userId: string;
    email: string;
  };
}
