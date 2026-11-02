import api from './api';

export type Expense = {
  id: number;
  title: string;
  amount: number | string;
  category: string;
  date: string;
  description?: string | null;
  attachment?: string | null;
};

export type CreateExpenseData = {
  title: string;
  amount: number;
  category: string;
  date: string;
  description?: string;
  attachment?: string;
};

export type UpdateExpenseData = Partial<CreateExpenseData>;

/**
 * Handles both paginated API responses and direct arrays.
 */
const extractExpenseList = (responseData: any): Expense[] => {
  if (Array.isArray(responseData)) {
    return responseData;
  }

  if (Array.isArray(responseData?.data)) {
    return responseData.data;
  }

  return [];
};

/**
 * Get expenses belonging to the logged-in user.
 */
export const getExpenses = async (): Promise<Expense[]> => {
  const response = await api.get('/expenses');

  console.log('GET EXPENSES STATUS:', response.status);
  console.log('GET EXPENSES RESPONSE:', response.data);

  return extractExpenseList(response.data);
};

/**
 * Get one expense by its ID.
 */
export const getExpenseById = async (
  id: number,
): Promise<Expense> => {
  const response = await api.get(`/expenses/${id}`);

  console.log('EXPENSE DETAILS STATUS:', response.status);
  console.log(
    'EXPENSE DETAILS RESPONSE:',
    JSON.stringify(response.data, null, 2),
  );

  return response.data?.data ?? response.data;
};

/**
 * Create an expense.
 */
export const createExpense = async (
  expense: CreateExpenseData,
): Promise<Expense> => {
  const response = await api.post('/expenses', expense);

  console.log('CREATE EXPENSE STATUS:', response.status);
  console.log('CREATE EXPENSE RESPONSE:', response.data);

  return response.data?.data ?? response.data;
};

/**
 * Update an existing expense.
 */
export const updateExpense = async (
  id: number,
  expense: UpdateExpenseData,
): Promise<Expense> => {
  const response = await api.put(`/expenses/${id}`, expense);

  console.log('UPDATE EXPENSE STATUS:', response.status);
  console.log('UPDATE EXPENSE RESPONSE:', response.data);

  return response.data?.data ?? response.data;
};

/**
 * Delete one expense by its ID.
 */
export const deleteExpense = async (
  id: number,
): Promise<void> => {
  const response = await api.delete(`/expenses/${id}`);

  console.log('DELETE EXPENSE STATUS:', response.status);
};