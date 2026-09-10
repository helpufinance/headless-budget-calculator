import { describe, expect, it, vi } from 'vitest'
import {
  calculateBudget,
  createBudgetItem,
  get503020Breakdown,
  toAnnualAmount,
  toMonthlyAmount,
  validateBudgetInput,
} from '../src/calculator'
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '../src'
import type { BudgetInput, BudgetItem } from '../src/types'
describe('toMonthlyAmount', () => {
  it('should convert weekly to monthly', () => {
    expect(toMonthlyAmount(100, 'weekly')).toBeCloseTo(433.33, 1)
  })
  it('should convert biweekly to monthly', () => {
    expect(toMonthlyAmount(1000, 'biweekly')).toBeCloseTo(2166.67, 0)
  })
  it('should return same amount for monthly', () => {
    expect(toMonthlyAmount(500, 'monthly')).toBe(500)
  })
  it('should convert quarterly to monthly', () => {
    expect(toMonthlyAmount(600, 'quarterly')).toBeCloseTo(200, 1)
  })
  it('should convert annually to monthly', () => {
    expect(toMonthlyAmount(12000, 'annually')).toBe(1000)
  })
  it('should spread one-time over 12 months', () => {
    expect(toMonthlyAmount(1200, 'one-time')).toBe(100)
  })
})
describe('toAnnualAmount', () => {
  it('should convert weekly to annual', () => {
    expect(toAnnualAmount(100, 'weekly')).toBe(5200)
  })
  it('should convert monthly to annual', () => {
    expect(toAnnualAmount(500, 'monthly')).toBe(6000)
  })
  it('should return same amount for annually', () => {
    expect(toAnnualAmount(5000, 'annually')).toBe(5000)
  })
  it('should convert biweekly, quarterly, and one-time amounts', () => {
    expect(toAnnualAmount(100, 'biweekly')).toBe(2600)
    expect(toAnnualAmount(1200, 'quarterly')).toBe(4800)
    expect(toAnnualAmount(1200, 'one-time')).toBe(1200)
  })
  it('should use the default conversion for unknown frequencies', () => {
    expect(toMonthlyAmount(500, 'unknown' as never)).toBe(500)
    expect(toAnnualAmount(500, 'unknown' as never)).toBe(6000)
  })
})
describe('validateBudgetInput', () => {
  it('should return error for empty items', () => {
    const error = validateBudgetInput({ items: [] })
    expect(error).not.toBeNull()
    expect(error?.code).toBe('NO_ITEMS')
  })
  it('should return error for no income items', () => {
    const items: BudgetItem[] = [
      createBudgetItem({ name: 'Rent', amount: 1000, type: 'expense', category: 'housing' }),
    ]
    const error = validateBudgetInput({ items })
    expect(error).not.toBeNull()
    expect(error?.code).toBe('NO_INCOME')
  })
  it('should return error for negative amounts', () => {
    const items: BudgetItem[] = [
      createBudgetItem({ name: 'Salary', amount: -500, type: 'income', category: 'salary' }),
    ]
    const error = validateBudgetInput({ items })
    expect(error).not.toBeNull()
    expect(error?.code).toBe('INVALID_AMOUNT')
  })
  it('should return null for valid input', () => {
    const items: BudgetItem[] = [
      createBudgetItem({ name: 'Salary', amount: 5000, type: 'income', category: 'salary' }),
      createBudgetItem({ name: 'Rent', amount: 1500, type: 'expense', category: 'housing' }),
    ]
    const error = validateBudgetInput({ items })
    expect(error).toBeNull()
  })
})
describe('calculateBudget', () => {
  const baseBudget: BudgetInput = {
    items: [
      createBudgetItem({ name: 'Salary', amount: 5000, type: 'income', category: 'salary' }),
      createBudgetItem({
        name: 'Rent',
        amount: 1500,
        type: 'expense',
        category: 'housing',
        isEssential: true,
      }),
      createBudgetItem({
        name: 'Groceries',
        amount: 400,
        type: 'expense',
        category: 'food',
        isEssential: true,
      }),
      createBudgetItem({
        name: 'Entertainment',
        amount: 200,
        type: 'expense',
        category: 'entertainment',
        isEssential: false,
      }),
      createBudgetItem({
        name: 'Utilities',
        amount: 150,
        type: 'expense',
        category: 'utilities',
        isEssential: true,
      }),
    ],
    savingsGoalPercent: 20,
    emergencyFundMonths: 6,
  }
  it('should calculate totals correctly', () => {
    const result = calculateBudget(baseBudget)
    expect(result.success).toBe(true)
    if (!result.success) return
    expect(result.data.totalMonthlyIncome).toBe(5000)
    expect(result.data.totalMonthlyExpenses).toBe(2250)
    expect(result.data.monthlySurplus).toBe(2750)
  })
  it('should calculate annual projections', () => {
    const result = calculateBudget(baseBudget)
    expect(result.success).toBe(true)
    if (!result.success) return
    expect(result.data.annualIncome).toBe(60000)
    expect(result.data.annualExpenses).toBe(27000)
  })
  it('should calculate savings rate', () => {
    const result = calculateBudget(baseBudget)
    expect(result.success).toBe(true)
    if (!result.success) return
    expect(result.data.savingsRate).toBe(55)
  })
  it('should separate essential vs discretionary expenses', () => {
    const result = calculateBudget(baseBudget)
    expect(result.success).toBe(true)
    if (!result.success) return
    expect(result.data.essentialExpenses).toBe(2050)
    expect(result.data.discretionaryExpenses).toBe(200)
  })
  it('should generate expense breakdown by category', () => {
    const result = calculateBudget(baseBudget)
    expect(result.success).toBe(true)
    if (!result.success) return
    expect(result.data.expenseBreakdown.length).toBeGreaterThan(0)
    const housingBreakdown = result.data.expenseBreakdown.find((b) => b.category === 'housing')
    expect(housingBreakdown).toBeDefined()
    expect(housingBreakdown?.amount).toBe(1500)
  })
  it('should calculate emergency fund target', () => {
    const result = calculateBudget(baseBudget)
    expect(result.success).toBe(true)
    if (!result.success) return
    expect(result.data.emergencyFundTarget).toBe(13500)
  })
  it('should determine budget health status', () => {
    const result = calculateBudget(baseBudget)
    expect(result.success).toBe(true)
    if (!result.success) return
    expect(['excellent', 'good', 'fair', 'poor', 'critical']).toContain(result.data.healthStatus)
    expect(result.data.healthScore).toBeGreaterThanOrEqual(0)
    expect(result.data.healthScore).toBeLessThanOrEqual(100)
  })
  it('should provide recommendations', () => {
    const result = calculateBudget(baseBudget)
    expect(result.success).toBe(true)
    if (!result.success) return
    expect(result.data.recommendations.length).toBeGreaterThan(0)
  })
  it('should handle different frequencies correctly', () => {
    const input: BudgetInput = {
      items: [
        createBudgetItem({
          name: 'Weekly Job',
          amount: 500,
          type: 'income',
          category: 'salary',
          frequency: 'weekly',
        }),
        createBudgetItem({
          name: 'Rent',
          amount: 1000,
          type: 'expense',
          category: 'housing',
          frequency: 'monthly',
        }),
      ],
    }
    const result = calculateBudget(input)
    expect(result.success).toBe(true)
    if (!result.success) return
    expect(result.data.totalMonthlyIncome).toBeCloseTo(2166.67, 0)
    expect(result.data.totalMonthlyExpenses).toBe(1000)
  })
  it('should return error for invalid input', () => {
    const result = calculateBudget({ items: [] })
    expect(result.success).toBe(false)
  })
  it('should cover health score bands and recommendation paths', () => {
    const makeBudget = (expenseAmount: number, isEssential = true): BudgetInput => ({
      items: [
        createBudgetItem({ name: 'Income', amount: 100, type: 'income', category: 'salary' }),
        createBudgetItem({
          name: 'Expense',
          amount: expenseAmount,
          type: 'expense',
          category: 'housing',
          isEssential,
        }),
      ],
    })
    for (const expenseAmount of [0, 80, 85, 90, 95, 110]) {
      const result = calculateBudget(makeBudget(expenseAmount))
      expect(result.success).toBe(true)
    }
    for (const expenseAmount of [50, 60, 70, 80]) {
      const result = calculateBudget(makeBudget(expenseAmount))
      expect(result.success).toBe(true)
    }
    const balanced = calculateBudget({
      items: [
        createBudgetItem({ name: 'Income', amount: 100, type: 'income', category: 'salary' }),
        createBudgetItem({
          name: 'Essential',
          amount: 70,
          type: 'expense',
          category: 'housing',
          isEssential: true,
        }),
        createBudgetItem({
          name: 'Discretionary',
          amount: 10,
          type: 'expense',
          category: 'entertainment',
          isEssential: false,
        }),
      ],
      savingsGoalPercent: 20,
    })
    expect(balanced.success).toBe(true)
    if (balanced.success) expect(balanced.data.recommendations).toHaveLength(1)
    const zeroBudget = calculateBudget({
      items: [
        createBudgetItem({ name: 'Income', amount: 0, type: 'income', category: 'salary' }),
        createBudgetItem({ name: 'Expense', amount: 0, type: 'expense', category: 'food' }),
      ],
    })
    expect(zeroBudget.success).toBe(true)
  })
})
describe('createBudgetItem', () => {
  it('should create item with defaults', () => {
    const item = createBudgetItem({
      name: 'Test',
      amount: 100,
      type: 'expense',
      category: 'food',
    })
    expect(item.name).toBe('Test')
    expect(item.amount).toBe(100)
    expect(item.frequency).toBe('monthly')
    expect(item.id).toBeTruthy()
    expect(item.isEssential).toBe(true)
  })
  it('should mark non-essential categories', () => {
    const item = createBudgetItem({
      name: 'Netflix',
      amount: 15,
      type: 'expense',
      category: 'entertainment',
    })
    expect(item.isEssential).toBe(false)
  })
  it('should create a fallback id when randomUUID is unavailable', () => {
    vi.stubGlobal('crypto', {})
    const item = createBudgetItem({
      name: 'Fallback',
      amount: 10,
      type: 'income',
      category: 'salary',
    })
    expect(item.id).toMatch(/^\d+-[a-z0-9]+$/)
    vi.unstubAllGlobals()
  })
})

describe('public exports', () => {
  it('exports category configurations', () => {
    expect(EXPENSE_CATEGORIES.housing.label).toBe('Housing')
    expect(INCOME_CATEGORIES.salary.label).toBe('Salary / Wages')
  })
})
describe('get503020Breakdown', () => {
  it('should calculate 50/30/20 correctly', () => {
    const result = get503020Breakdown(5000)
    expect(result.needs).toBe(2500)
    expect(result.wants).toBe(1500)
    expect(result.savings).toBe(1000)
  })
})
