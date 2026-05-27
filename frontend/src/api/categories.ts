import client from './client'
import type { Category, CreateCategoryRequest, UpdateCategoryRequest } from '@/types/categories'

export async function getCategories(): Promise<Category[]> {
  const response = await client.get('/api/v1/categories')
  if (response.status !== 200) {
    throw new Error('Failed to fetch categories')
  }
  return response.data
}

export async function getCategory(id: string): Promise<Category> {
  const response = await client.get(`/api/v1/categories/${id}`)
  if (response.status !== 200) {
    throw new Error('Failed to fetch category')
  }
  return response.data
}

export async function createCategory(req: CreateCategoryRequest): Promise<Category> {
  const response = await client.post('/api/v1/categories', req)
  if (response.status !== 201) {
    throw new Error(response.data?.error || 'Failed to create category')
  }
  return response.data
}

export async function updateCategory(id: string, req: UpdateCategoryRequest): Promise<Category> {
  const response = await client.patch(`/api/v1/categories/${id}`, req)
  if (response.status !== 200) {
    throw new Error(response.data?.error || 'Failed to update category')
  }
  return response.data
}

export async function deleteCategory(id: string): Promise<void> {
  const response = await client.delete(`/api/v1/categories/${id}`)
  if (response.status !== 204) {
    throw new Error(response.data?.error || 'Failed to delete category')
  }
}
