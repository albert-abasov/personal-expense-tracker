import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import * as budgetApi from '@/api/budgets'
import { UpsertBudgetRequest } from '@/types/budget'

const BUDGETS_KEY = ['budgets']

export function useAllBudgets() {
  return useQuery({
    queryKey: BUDGETS_KEY,
    queryFn: budgetApi.getAllBudgets,
    staleTime: 60_000,
  })
}

export function useBudgetSummary(year: number, month: number) {
  return useQuery({
    queryKey: ['budget', 'summary', year, month],
    queryFn: () => budgetApi.getBudgetSummary(year, month),
    staleTime: 60_000,
  })
}

export function useUpsertBudget() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ year, month, request }: { year: number; month: number; request: UpsertBudgetRequest }) =>
      budgetApi.upsertBudget(year, month, request),
    onSuccess: (_, { year, month }) => {
      queryClient.invalidateQueries({ queryKey: BUDGETS_KEY })
      queryClient.invalidateQueries({ queryKey: ['budget', 'summary', year, month] })
    },
  })
}

export function useDeleteBudget() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ year, month }: { year: number; month: number }) =>
      budgetApi.deleteBudget(year, month),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BUDGETS_KEY })
    },
  })
}
