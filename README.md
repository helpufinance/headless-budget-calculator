<p align="center">
  <a href="https://github.com/helpufinance/helpu.finance">
    <img src="https://raw.githubusercontent.com/helpufinance/.github/refs/heads/main/profile/assets/helpu_finance.png" alt="HelpU Finance" width="260">
  </a>
</p>

# Headless Budget Calculator

A headless, framework-agnostic budget calculator with income and expense categorization, savings goals, and budget analysis.

## What is HelpU Finance?

HelpU Finance is a free, privacy-first platform with financial tools and educational resources. No tracking, no data collection.

We believe that financial literacy should be accessible to everyone.

## Installation

```bash
npm install @helpu/headless-budget-calculator
```

## Usage

```ts
import { calculateBudget, createBudgetItem } from '@helpu/headless-budget-calculator'

const result = calculateBudget({
  currency: 'USD',
  items: [
    createBudgetItem({
      name: 'Salary',
      amount: 5000,
      type: 'income',
      category: 'salary',
    }),
    createBudgetItem({
      name: 'Rent',
      amount: 1500,
      type: 'expense',
      category: 'housing',
      isEssential: true,
    }),
  ],
})

if (result.success) {
  console.log(result.data.monthlySurplus)
  console.log(result.data.recommendations)
} else {
  console.error(result.error.message)
}
```

Amounts are normalized using each item’s `frequency`. The result includes monthly and annual totals, savings rate, category breakdowns, budget health, and recommendations.

## Testing

Install the repository dependencies and run the test suite with:

```bash
npm test
```

## Contributing

Contributions are welcome. Please read the [contribution guidelines](https://docs.omisai.com/contribution-guidelines) before opening a pull request.

## Sponsor

Support HelpU Finance through [GitHub Sponsors](https://github.com/sponsors/helpufinance).

## License

This project is available for permitted non-commercial use under the **PolyForm Noncommercial License 1.0.0**.

Personal learning, education, research, experimentation, and other uses permitted by the PolyForm Noncommercial License are welcome.

**Commercial use requires a separate license from Omisai Technologies.**

Commercial licensing helps fund the HelpU Finance mission of creating freely accessible financial tools, educational resources, and technology.

For commercial licensing, see [`COMMERCIAL-LICENSING.md`](./COMMERCIAL-LICENSING.md).

Copyright (c) 2026 Omisai Technologies.

HelpU Finance is a project and brand of Omisai Technologies.
