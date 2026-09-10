import type {
  BudgetAnalysis,
  BudgetCalculationError,
  BudgetCalculationResult,
  BudgetFrequency,
  BudgetHealthStatus,
  BudgetInput,
  BudgetItem,
  CategoryBreakdown,
} from './types'
export function toMonthlyAmount(amount: number, frequency: BudgetFrequency): number {
  switch (frequency) {
    case 'weekly':
      return amount * (52 / 12)
    case 'biweekly':
      return amount * (26 / 12)
    case 'monthly':
      return amount
    case 'quarterly':
      return amount / 3
    case 'annually':
      return amount / 12
    case 'one-time':
      return amount / 12
    default:
      return amount
  }
}
export function toAnnualAmount(amount: number, frequency: BudgetFrequency): number {
  switch (frequency) {
    case 'weekly':
      return amount * 52
    case 'biweekly':
      return amount * 26
    case 'monthly':
      return amount * 12
    case 'quarterly':
      return amount * 4
    case 'annually':
      return amount
    case 'one-time':
      return amount
    default:
      return amount * 12
  }
}
export function validateBudgetInput(input: BudgetInput): BudgetCalculationError | null {
  if (!input.items || input.items.length === 0) {
    return {
      code: 'NO_ITEMS',
      message: 'At least one budget item is required',
    }
  }
  const hasIncome = input.items.some((item) => item.type === 'income')
  if (!hasIncome) {
    return {
      code: 'NO_INCOME',
      message: 'At least one income source is required',
    }
  }
  for (const item of input.items) {
    if (typeof item.amount !== 'number' || isNaN(item.amount) || item.amount < 0) {
      return {
        code: 'INVALID_AMOUNT',
        message: `Invalid amount for "${item.name}": must be a non-negative number`,
        field: item.id,
      }
    }
  }
  return null
}
function calculateBreakdowns(
  items: BudgetItem[],
  type: 'income' | 'expense',
  total: number,
): CategoryBreakdown[] {
  const categoryMap = new Map<
    string,
    {
      amount: number
      count: number
    }
  >()
  for (const item of items) {
    if (item.type !== type) continue
    const monthlyAmount = toMonthlyAmount(item.amount, item.frequency)
    const existing = categoryMap.get(item.category) || { amount: 0, count: 0 }
    categoryMap.set(item.category, {
      amount: existing.amount + monthlyAmount,
      count: existing.count + 1,
    })
  }
  return Array.from(categoryMap.entries())
    .map(([category, data]) => ({
      category,
      amount: parseFloat(data.amount.toFixed(2)),
      percentage: total > 0 ? parseFloat(((data.amount / total) * 100).toFixed(1)) : 0,
      itemCount: data.count,
    }))
    .sort((a, b) => b.amount - a.amount)
}
function determineBudgetHealth(
  savingsRate: number,
  essentialRatio: number,
  monthlySurplus: number,
): {
  status: BudgetHealthStatus
  score: number
} {
  let score = 50
  if (savingsRate >= 20) score += 30
  else if (savingsRate >= 15) score += 25
  else if (savingsRate >= 10) score += 15
  else if (savingsRate >= 5) score += 5
  else if (savingsRate < 0) score -= 20
  if (essentialRatio <= 50) score += 20
  else if (essentialRatio <= 60) score += 10
  else if (essentialRatio <= 70) score += 0
  else if (essentialRatio <= 80) score -= 10
  else score -= 20
  if (monthlySurplus > 0) score += 5
  else score -= 15
  score = Math.max(0, Math.min(100, score))
  let status: BudgetHealthStatus
  if (score >= 80) status = 'excellent'
  else if (score >= 65) status = 'good'
  else if (score >= 45) status = 'fair'
  else if (score >= 25) status = 'poor'
  else status = 'critical'
  return { status, score }
}
function generateRecommendations(
  savingsRate: number,
  essentialRatio: number,
  monthlySurplus: number,
  _totalIncome: number,
  savingsGoalPercent: number,
  savingsGoalMet: boolean,
): string[] {
  const recommendations: string[] = []
  if (monthlySurplus < 0) {
    recommendations.push(
      'Your expenses exceed your income. Review discretionary spending for areas to cut back.',
    )
  }
  if (savingsRate < 10) {
    recommendations.push(
      'Aim to save at least 10-20% of your income. Start small and gradually increase.',
    )
  }
  if (essentialRatio > 70) {
    recommendations.push(
      'Essential expenses are consuming over 70% of your income. Look for ways to reduce fixed costs like housing or transportation.',
    )
  }
  if (!savingsGoalMet && savingsGoalPercent > 0) {
    recommendations.push(
      `You're not meeting your ${savingsGoalPercent}% savings goal. Consider reducing discretionary spending.`,
    )
  }
  if (savingsRate >= 20 && essentialRatio <= 50) {
    recommendations.push(
      'Great financial health! Consider investing your surplus or building an emergency fund.',
    )
  }
  if (monthlySurplus > 0 && savingsRate < 20) {
    recommendations.push(
      'You have a surplus — consider automating transfers to a savings or investment account.',
    )
  }
  if (recommendations.length === 0) {
    recommendations.push(
      'Your budget looks balanced. Keep monitoring and adjusting as your financial situation changes.',
    )
  }
  return recommendations
}
export function calculateBudget(input: BudgetInput): BudgetCalculationResult {
  const validationError = validateBudgetInput(input)
  if (validationError) {
    return { success: false, error: validationError }
  }
  const { items, savingsGoalPercent = 20, emergencyFundMonths = 6 } = input
  let totalMonthlyIncome = 0
  let totalMonthlyExpenses = 0
  let essentialExpenses = 0
  let discretionaryExpenses = 0
  for (const item of items) {
    const monthlyAmount = toMonthlyAmount(item.amount, item.frequency)
    if (item.type === 'income') {
      totalMonthlyIncome += monthlyAmount
    } else {
      totalMonthlyExpenses += monthlyAmount
      if (item.isEssential) {
        essentialExpenses += monthlyAmount
      } else {
        discretionaryExpenses += monthlyAmount
      }
    }
  }
  const monthlySurplus = totalMonthlyIncome - totalMonthlyExpenses
  const annualIncome = totalMonthlyIncome * 12
  const annualExpenses = totalMonthlyExpenses * 12
  const annualSurplus = monthlySurplus * 12
  const savingsRate = totalMonthlyIncome > 0 ? (monthlySurplus / totalMonthlyIncome) * 100 : 0
  const targetSavingsAmount = (totalMonthlyIncome * savingsGoalPercent) / 100
  const savingsGoalMet = monthlySurplus >= targetSavingsAmount
  const essentialRatio = totalMonthlyIncome > 0 ? (essentialExpenses / totalMonthlyIncome) * 100 : 0
  const emergencyFundTarget = totalMonthlyExpenses * emergencyFundMonths
  const monthsToEmergencyFund =
    monthlySurplus > 0 ? Math.ceil(emergencyFundTarget / monthlySurplus) : null
  const expenseBreakdown = calculateBreakdowns(items, 'expense', totalMonthlyExpenses)
  const incomeBreakdown = calculateBreakdowns(items, 'income', totalMonthlyIncome)
  const { status: healthStatus, score: healthScore } = determineBudgetHealth(
    savingsRate,
    essentialRatio,
    monthlySurplus,
  )
  const recommendations = generateRecommendations(
    savingsRate,
    essentialRatio,
    monthlySurplus,
    totalMonthlyIncome,
    savingsGoalPercent,
    savingsGoalMet,
  )
  const analysis: BudgetAnalysis = {
    totalMonthlyIncome: parseFloat(totalMonthlyIncome.toFixed(2)),
    totalMonthlyExpenses: parseFloat(totalMonthlyExpenses.toFixed(2)),
    monthlySurplus: parseFloat(monthlySurplus.toFixed(2)),
    annualIncome: parseFloat(annualIncome.toFixed(2)),
    annualExpenses: parseFloat(annualExpenses.toFixed(2)),
    annualSurplus: parseFloat(annualSurplus.toFixed(2)),
    savingsRate: parseFloat(savingsRate.toFixed(1)),
    savingsGoalMet,
    targetSavingsAmount: parseFloat(targetSavingsAmount.toFixed(2)),
    essentialExpenses: parseFloat(essentialExpenses.toFixed(2)),
    discretionaryExpenses: parseFloat(discretionaryExpenses.toFixed(2)),
    essentialRatio: parseFloat(essentialRatio.toFixed(1)),
    expenseBreakdown,
    incomeBreakdown,
    healthStatus,
    healthScore,
    emergencyFundTarget: parseFloat(emergencyFundTarget.toFixed(2)),
    monthsToEmergencyFund,
    recommendations,
  }
  return { success: true, data: analysis }
}
export function createBudgetItem(
  overrides: Partial<BudgetItem> & Pick<BudgetItem, 'name' | 'amount' | 'type' | 'category'>,
): BudgetItem {
  return {
    id: crypto.randomUUID
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    frequency: 'monthly',
    isEssential:
      overrides.type === 'expense'
        ? [
            'housing',
            'food',
            'utilities',
            'healthcare',
            'insurance',
            'transportation',
            'debt',
          ].includes(overrides.category)
        : false,
    ...overrides,
  }
}
export function get503020Breakdown(monthlyIncome: number): {
  needs: number
  wants: number
  savings: number
} {
  return {
    needs: parseFloat((monthlyIncome * 0.5).toFixed(2)),
    wants: parseFloat((monthlyIncome * 0.3).toFixed(2)),
    savings: parseFloat((monthlyIncome * 0.2).toFixed(2)),
  }
}
