
export const EXPENSE_CATEGORIES = [
  'Food & Drinks',
  'Transport',
  'Shopping',
  'Bills & Utilities',
  'Groceries',
  'Health',
  'Education',
  'Entertainment',
  'Travel',
  'Personal Care',
  'Housing',
  'Other',
] as const;

export type ExpenseCategory =
  (typeof EXPENSE_CATEGORIES)[number];

export const CATEGORY_COLORS = [
  '#CFF7D3',
  '#FCE0C5',
  '#F8D0D3',
  '#BFE7EA',
  '#FBF5C7',
  '#DFDFF7',
  '#FFE5B4',
  '#E7DDF5',
  '#D6E9F9',
  '#F5DDEB',
  '#E4E0D7',
  '#DADCE5',
];
