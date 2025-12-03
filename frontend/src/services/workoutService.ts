import api from './api';
import { Workout, WorkoutFormData, ApiResponse, Pagination } from '../types';

export const workoutService = {
    createWorkout: async (data: WorkoutFormData): Promise<ApiResponse<Workout>> => {
        const response = await api.post<ApiResponse<Workout>>('/workouts', data);
        return response.data;
    },
    getWorkouts: async (userId?: string, split?: string, startDate?: string, endDate?: string, page = 1, limit = 20) => {
        const params: any = { page, limit };
        if (userId) params.userId = userId;
        if (split) params.split = split;
        if (startDate) params.startDate = startDate;
        if (endDate) params.endDate = endDate;
        const response = await api.get<ApiResponse<{workouts: Workout[]; pagination: Pagination;}>>('/workouts', { params });
        return response.data;
    },
    getWorkoutById: async (workoutId: string): Promise<ApiResponse<Workout>> => {
        const response = await api.get<ApiResponse<Workout>>(`/workouts/${workoutId}`);
        return response.data;
    },
    updateWorkout: async (workoutId: string, data: WorkoutFormData): Promise<ApiResponse<Workout>> => {
        const response = await api.put<ApiResponse<Workout>>(`/workouts/${workoutId}`, data);
        return response.data;
    },
    deleteWorkout: async (workoutId: string): Promise<ApiResponse> => {
        const response = await api.delete<ApiResponse>(`/workouts/${workoutId}`);
        return response.data;
    },
};