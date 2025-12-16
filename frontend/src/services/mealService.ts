import api from './api';
import { Meal, MealFormData, ApiResponse, Pagination, FoodItem } from '../types';

export const mealService = {
    createMeal: async (data: MealFormData): Promise<ApiResponse<Meal>> => {
    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("mealType", data.mealType);
    formData.append("nutrition[calories]", data.nutrition.calories.toString());
    formData.append("nutrition[protein]", data.nutrition.protein.toString());
    formData.append("nutrition[carbs]", data.nutrition.carbs.toString());
    formData.append("nutrition[fat]", data.nutrition.fat.toString());

    if (data.photos && data.photos.length > 0) {
        data.photos.forEach((file) => formData.append("photos", file));
    }

    const response = await api.post<ApiResponse<Meal>>("/meals", formData);

    return response.data;
},

    getMeals: async (
        userId?: string,
        mealType?: string,
        startDate?: string,
        endDate?: string,
        page = 1,
        limit = 20
    ) => {
        const params: any = { page, limit };
        if (userId) params.userId = userId;
        if (mealType) params.mealType = mealType;
        if (startDate) params.startDate = startDate;
        if (endDate) params.endDate = endDate;

        const response = await api.get<ApiResponse<{ meals: Meal[]; pagination: Pagination }>>(
            "/meals",
            { params }
        );
        return response.data;
    },

    getMealById: async (mealId: string): Promise<ApiResponse<Meal>> => {
        const response = await api.get<ApiResponse<Meal>>(`/meals/${mealId}`);
        return response.data;
    },

    updateMeal: async (mealId: string, data: Partial<MealFormData>): Promise<ApiResponse<Meal>> => {
        if (data.photos && data.photos.length > 0) {
            const formData = new FormData();
            if (data.name !== undefined) formData.append("name", data.name);
            if (data.mealType !== undefined) formData.append("mealType", data.mealType);
            if (data.description !== undefined) formData.append("description", data.description);
            if (data.date !== undefined) formData.append("date", data.date);

            if (data.nutrition) {
                formData.append("nutrition[calories]", data.nutrition.calories.toString());
                formData.append("nutrition[protein]", data.nutrition.protein.toString());
                formData.append("nutrition[carbs]", data.nutrition.carbs.toString());
                formData.append("nutrition[fat]", data.nutrition.fat.toString());
            }

            data.photos.forEach((file) => formData.append("photos", file));

            const response = await api.put<ApiResponse<Meal>>(`/meals/${mealId}`, formData);
            return response.data;
        }
        const { photos, ...jsonData } = data as any;
        const response = await api.put<ApiResponse<Meal>>(`/meals/${mealId}`, jsonData);
        return response.data;
    },

    deleteMeal: async (mealId: string): Promise<ApiResponse> => {
        const response = await api.delete<ApiResponse>(`/meals/${mealId}`);
        return response.data;
    },

    searchFood: async (query: string): Promise<ApiResponse<FoodItem[]>> => {
        const response = await api.get<ApiResponse<FoodItem[]>>(`/meals/search-food`, {
            params: { q: query }
        });
        return response.data;
    },
};
