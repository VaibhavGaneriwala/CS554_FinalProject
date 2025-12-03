import api from './api';
import { Progress, ProgressFormData, ApiResponse, Pagination } from '../types';

export const progressService = {
    createProgress: async (data: ProgressFormData): Promise<ApiResponse<Progress>> => {
        const formData = new FormData();
        formData.append('type', data.type);
        if (data.date) formData.append('date', data.date);
        if (data.weight) formData.append('weight', data.weight.toString());
        if (data.exercise) formData.append('exercise', data.exercise);
        if (data.prValue) formData.append('prValue', data.prValue.toString());
        if (data.measurement) formData.append('measurement', JSON.stringify(data.measurement));
        if (data.notes) formData.append('notes', data.notes);
        if (data.photos && data.photos.length > 0) {
            data.photos.forEach((photo) => {
                formData.append('photos', photo);
            });
        }
        const response = await api.post<ApiResponse<Progress>>('/progress', formData, {headers: {'Content-Type': 'multipart/form-data',},});
        return response.data;
    },
    getProgress: async (userId?: string, type?: string, startDate?: string, endDate?: string, page = 1, limit = 20) => {
        const params: any = { page, limit };
        if (userId) params.userId = userId;
        if (type) params.type = type;
        if (startDate) params.startDate = startDate;
        if (endDate) params.endDate = endDate;
        const response = await api.get<ApiResponse<{progressEntries: Progress[]; pagination: Pagination;}>>('/progress', { params });
        return response.data;
    },
    getProgressById: async (progressId: string): Promise<ApiResponse<Progress>> => {
        const response = await api.get<ApiResponse<Progress>>(`/progress/${progressId}`);
        return response.data;
    },
    deleteProgress: async (progressId: string): Promise<ApiResponse> => {
        const response = await api.delete<ApiResponse>(`/progress/${progressId}`);
        return response.data;
    },
};