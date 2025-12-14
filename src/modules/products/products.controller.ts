import { createProductSchema, updateProductSchema } from './products.schema';
import * as productService from './products.service';

export async function listProducts() {
  try {
    const products = await productService.getAllProducts();
    return { success: true, data: products };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

export async function getProduct(id: string) {
  try {
    const product = await productService.getProductById(id);
    if (!product) {
      return { success: false, error: 'Product not found' };
    }
    return { success: true, data: product };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

export async function createProduct(body: unknown) {
  try {
    const parsed = createProductSchema.parse(body);
    const product = await productService.createProduct(parsed);
    return { success: true, data: product };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

export async function updateProduct(id: string, body: unknown) {
  try {
    const parsed = updateProductSchema.parse(body);
    const product = await productService.updateProduct(id, parsed);
    return { success: true, data: product };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

export async function deleteProduct(id: string) {
  try {
    await productService.deleteProduct(id);
    return { success: true, message: 'Product deleted successfully' };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}
