import { useQuery } from '@tanstack/react-query';
import { Product, apiRequest } from '@/lib/api';

export interface ProductsResponse {
  products: Product[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

interface UseProductsParams {
  page?: number;
  limit?: number;
  category?: string;
  q?: string;
  minPrice?: number;
  maxPrice?: number;
}

export const useProducts = (params: UseProductsParams = {}) => {
  const queryParams = new URLSearchParams();
  
  if (params.page) queryParams.append('page', params.page.toString());
  if (params.limit) queryParams.append('limit', params.limit.toString());
  if (params.category) queryParams.append('category', params.category);
  if (params.q) queryParams.append('q', params.q);
  if (params.minPrice) queryParams.append('minPrice', params.minPrice.toString());
  if (params.maxPrice) queryParams.append('maxPrice', params.maxPrice.toString());

  const queryString = queryParams.toString();
  const url = `/api/products${queryString ? `?${queryString}` : ''}`;

  return useQuery<ProductsResponse>({
    queryKey: ['products', params],
    queryFn: () => apiRequest<ProductsResponse>(url),
  });
};

export const useProduct = (id: string) => {
  return useQuery<Product>({
    queryKey: ['product', id],
    queryFn: () => apiRequest<Product>(`/api/products/${id}`),
    enabled: !!id,
  });
};