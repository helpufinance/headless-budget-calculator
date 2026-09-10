export type BudgetCategoryType = 'income' | 'expense'
export type ExpenseCategory =
  | 'housing'
  | 'transportation'
  | 'food'
  | 'utilities'
  | 'healthcare'
  | 'insurance'
  | 'savings'
  | 'debt'
  | 'personal'
  | 'entertainment'
  | 'education'
  | 'clothing'
  | 'gifts'
  | 'subscriptions'
  | 'other'
export type IncomeCategory =
  | 'salary'
  | 'freelance'
  | 'investments'
  | 'rental'
  | 'business'
  | 'pension'
  | 'social-benefits'
  | 'gifts-received'
  | 'other'
export type BudgetFrequency =
  | 'monthly'
  | 'weekly'
  | 'biweekly'
  | 'quarterly'
  | 'annually'
  | 'one-time'
export interface BudgetItem {
  id: string
  name: string
  amount: number
  type: BudgetCategoryType
  category: ExpenseCategory | IncomeCategory
  frequency: BudgetFrequency
  isEssential: boolean
}
export interface BudgetInput {
  items: BudgetItem[]
  currency?: string
  savingsGoalPercent?: number
  emergencyFundMonths?: number
}
export interface CategoryBreakdown {
  category: string
  amount: number
  percentage: number
  itemCount: number
}
export type BudgetHealthStatus = 'excellent' | 'good' | 'fair' | 'poor' | 'critical'
export interface BudgetAnalysis {
  totalMonthlyIncome: number
  totalMonthlyExpenses: number
  monthlySurplus: number
  annualIncome: number
  annualExpenses: number
  annualSurplus: number
  savingsRate: number
  savingsGoalMet: boolean
  targetSavingsAmount: number
  essentialExpenses: number
  discretionaryExpenses: number
  essentialRatio: number
  expenseBreakdown: CategoryBreakdown[]
  incomeBreakdown: CategoryBreakdown[]
  healthStatus: BudgetHealthStatus
  healthScore: number
  emergencyFundTarget: number
  monthsToEmergencyFund: number | null
  recommendations: string[]
}
export interface BudgetCalculationError {
  code: 'NO_ITEMS' | 'NO_INCOME' | 'INVALID_AMOUNT' | 'INVALID_INPUT'
  message: string
  field?: string
}
export type BudgetCalculationResult =
  | {
      success: true
      data: BudgetAnalysis
    }
  | {
      success: false
      error: BudgetCalculationError
    }
export interface CategoryConfig {
  key: string
  label: string
  icon: string
  suggestedPercent?: number
}
export const EXPENSE_CATEGORIES: Record<ExpenseCategory, CategoryConfig> = {
  housing: { key: 'housing', label: 'Housing', icon: '🏠', suggestedPercent: 30 },
  transportation: {
    key: 'transportation',
    label: 'Transportation',
    icon: '🚗',
    suggestedPercent: 10,
  },
  food: { key: 'food', label: 'Food & Groceries', icon: '🛒', suggestedPercent: 12 },
  utilities: { key: 'utilities', label: 'Utilities', icon: '💡', suggestedPercent: 5 },
  healthcare: { key: 'healthcare', label: 'Healthcare', icon: '🏥', suggestedPercent: 5 },
  insurance: { key: 'insurance', label: 'Insurance', icon: '🛡️', suggestedPercent: 5 },
  savings: { key: 'savings', label: 'Savings & Investments', icon: '💰', suggestedPercent: 20 },
  debt: { key: 'debt', label: 'Debt Payments', icon: '💳', suggestedPercent: 5 },
  personal: { key: 'personal', label: 'Personal Care', icon: '🧴' },
  entertainment: { key: 'entertainment', label: 'Entertainment', icon: '🎬' },
  education: { key: 'education', label: 'Education', icon: '📚' },
  clothing: { key: 'clothing', label: 'Clothing', icon: '👕' },
  gifts: { key: 'gifts', label: 'Gifts & Donations', icon: '🎁' },
  subscriptions: { key: 'subscriptions', label: 'Subscriptions', icon: '📱' },
  other: { key: 'other', label: 'Other', icon: '📦' },
}
export const INCOME_CATEGORIES: Record<IncomeCategory, CategoryConfig> = {
  salary: { key: 'salary', label: 'Salary / Wages', icon: '💼' },
  freelance: { key: 'freelance', label: 'Freelance / Contract', icon: '💻' },
  investments: { key: 'investments', label: 'Investment Returns', icon: '📈' },
  rental: { key: 'rental', label: 'Rental Income', icon: '🏢' },
  business: { key: 'business', label: 'Business Income', icon: '🏪' },
  pension: { key: 'pension', label: 'Pension', icon: '🧓' },
  'social-benefits': { key: 'social-benefits', label: 'Social Benefits', icon: '🏛️' },
  'gifts-received': { key: 'gifts-received', label: 'Gifts Received', icon: '🎀' },
  other: { key: 'other', label: 'Other Income', icon: '💵' },
}
