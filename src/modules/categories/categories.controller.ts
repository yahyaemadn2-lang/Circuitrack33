import { createCategorySchema, updateCategorySchema } from './categories.schema';
import * as categoryService from './categories.service';

export async function listCategories() {
  try {
    const categories = await categoryService.getAllCategories();
    return { success: true, data: categories };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

export async function getCategory(id: string) {
  try {
    const category = await categoryService.getCategoryById(id);
    if (!category) {
      return { success: false, error: 'Category not found' };
    }
    return { success: true, data: category };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

export async function createCategory(body: unknown) {
  try {
    const parsed = createCategorySchema.parse(body);
    const category = await categoryService.createCategory(parsed);
    return { success: true, data: category };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

export async function updateCategory(id: string, body: unknown) {
  try {
    const parsed = updateCategorySchema.parse(body);
    const category = await categoryService.updateCategory(id, parsed);
    return { success: true, data: category };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

export async function deleteCategory(id: string) {
  try {
    await categoryService.deleteCategory(id);
    return { success: true, message: 'Category deleted successfully' };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}
