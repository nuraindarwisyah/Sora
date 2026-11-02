
import {
  useQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';

import {
  getExpenses,
  createExpense,
  updateExpense,
  deleteExpense,
  type CreateExpenseData,
  type UpdateExpenseData,
} from '../services/expenseService';

export const useExpenses = () => {
  return useQuery({
    queryKey: ['expenses'],
    queryFn: getExpenses,
  });
};

export const useCreateExpense = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (expense: CreateExpenseData) => createExpense(expense),
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['expenses']});
    },
  });
};

export const useUpdateExpense = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      expense,
    }: {
      id: number;
      expense: UpdateExpenseData;
    }) => updateExpense(id, expense),
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['expenses']});
    },
  });
};

export const useDeleteExpense = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteExpense(id),
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['expenses']});
    },
  });
};
