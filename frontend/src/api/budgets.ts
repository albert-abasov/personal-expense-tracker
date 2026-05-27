import client from './client'
import { MonthlyBudget, UpsertBudgetRequest, BudgetSummary } from '@/types/budget'

export async function getAllBudgets(): Promise<MonthlyBudget[]> {
  const response = await client.get<MonthlyBudget[]>('/api/v1/budgets')

  if (response.status !== 200) {
    throw new Error(response.data?.error || 'Failed to fetch budgets')
  }

  return response.data
}

export async function getBudget(year: number, month: number): Promise<MonthlyBudget> {
  const response = await client.get<MonthlyBudget>(`/api/v1/budgets/${year}/${month}`)

  if (response.status !== 200) {
    throw new Error(response.data?.error || 'Failed to fetch budget')
  }

  return response.data
}

export async function upsertBudget(
  year: number,
  month: number,
  request: UpsertBudgetRequest
): Promise<MonthlyBudget> {
  const response = await client.put<MonthlyBudget>(
    `/api/v1/budgets/${year}/${month}`,
    request
  )

  if (response.status !== 200) {
    throw new Error(response.data?.error || 'Failed to upsert budget')
  }

  return response.data
}

export async function deleteBudget(year: number, month: number): Promise<void> {
  const response = await client.delete(`/api/v1/budgets/${year}/${month}`)

  if (response.status !== 204) {
    throw new Error(response.data?.error || 'Failed to delete budget')
  }
}

export async function getBudgetSummary(year: number, month: number): Promise<BudgetSummary> {
  const response = await client.get<BudgetSummary>(`/api/v1/budgets/${year}/${month}/summary`)

  if (response.status !== 200) {
    throw new Error(response.data?.error || 'Failed to fetch budget summary')
  }

  return response.data
}
