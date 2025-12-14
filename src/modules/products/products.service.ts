import { supabase } from '../../lib/supabaseClient';
import {
  CreateProductInput,
  UpdateProductInput,
  Product,
  ProductWithRelations,
  ProductFilters,
  ProductSortOptions,
  PaginationOptions,
} from './products.schema';

export interface ProductsListResult {
  products: ProductWithRelations[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export async function getProductsList(
  filters?: ProductFilters,
  sort?: ProductSortOptions,
  pagination?: PaginationOptions
): Promise<ProductsListResult> {
  const page = pagination?.page || 1;
  const limit = pagination?.limit || 12;
  const offset = (page - 1) * limit;

  let query = supabase
    .from('products')
    .select(
      `
      *,
      vendor:vendors!inner(id, display_name, status),
      category:categories(id, name, slug)
    `,
      { count: 'exact' }
    );

  if (filters?.search) {
    query = query.or(
      `name.ilike.%${filters.search}%,description.ilike.%${filters.search}%,slug.ilike.%${filters.search}%`
    );
  }

  if (filters?.categoryId) {
    query = query.eq('category_id', filters.categoryId);
  }

  if (filters?.vendorId) {
    query = query.eq('vendor_id', filters.vendorId);
  }

  if (filters?.condition) {
    query = query.eq('condition', filters.condition);
  }

  if (filters?.minPrice !== undefined) {
    query = query.gte('price', filters.minPrice);
  }

  if (filters?.maxPrice !== undefined) {
    query = query.lte('price', filters.maxPrice);
  }

  const sortBy = sort?.sortBy || 'created_at';
  const sortOrder = sort?.sortOrder || 'desc';
  query = query.order(sortBy, { ascending: sortOrder === 'asc' });

  query = query.range(offset, offset + limit - 1);

  const { data, error, count } = await query;

  if (error) {
    throw new Error(error.message);
  }

  const total = count || 0;
  const totalPages = Math.ceil(total / limit);

  return {
    products: (data as any[]) || [],
    total,
    page,
    limit,
    totalPages,
  };
}

export async function getProductById(id: string): Promise<ProductWithRelations | null> {
  const { data, error } = await supabase
    .from('products')
    .select(
      `
      *,
      vendor:vendors(id, display_name, status),
      category:categories(id, name, slug)
    `
    )
    .eq('id', id)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data as ProductWithRelations | null;
}

export async function getRelatedProducts(
  productId: string,
  limit: number = 8
): Promise<ProductWithRelations[]> {
  const product = await getProductById(productId);

  if (!product) {
    return [];
  }

  const { data, error } = await supabase
    .from('products')
    .select(
      `
      *,
      vendor:vendors(id, display_name, status),
      category:categories(id, name, slug)
    `
    )
    .eq('category_id', product.category_id)
    .neq('id', productId)
    .limit(limit);

  if (error) {
    throw new Error(error.message);
  }

  return (data as any[]) || [];
}

export async function getAllProducts() {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data as Product[];
}

export async function createProduct(input: CreateProductInput) {
  const { data, error } = await supabase
    .from('products')
    .insert(input)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as Product;
}

export async function updateProduct(id: string, input: UpdateProductInput) {
  const { data, error } = await supabase
    .from('products')
    .update(input)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as Product;
}

export async function deleteProduct(id: string) {
  const { error } = await supabase.from('products').delete().eq('id', id);

  if (error) {
    throw new Error(error.message);
  }

  return { success: true };
}
