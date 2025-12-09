import api from "@/cores/api";
import { GetSchema } from "@/types/base";
import { Category, CategoryCreate, CategoryUpdate } from "@/types/category";

export const categoryAPI = {
  getCategories: (filters: GetSchema) =>
    api.post<{
      total: number;
      page: number;
      max_page: number;
      row: number;
      data: Category[];
    }>("/category/get-categories", filters),

  getCategoryById: (categoryId: string) =>
    api.get<{ status: string; data: Category }>(
      `/category/get-category/${categoryId}`
    ),

  createCategory: (data: CategoryCreate) =>
    api.post<{ status: string; message: string; data: Category }>(
      "/category/create-category",
      data
    ),

  updateCategory: (categoryId: string, data: CategoryUpdate) =>
    api.put<{ status: string; data: Category }>(
      `/category/update-category/${categoryId}`,
      data
    ),

  deleteCategory: (categoryId: string) =>
    api.delete<{ status: string; message: string }>(
      `/category/delete-category/${categoryId}`
    ),
};
