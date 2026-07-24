# LendWise — Personal Loan & Interest Tracker

A private ledger for tracking informal loans and computing daily simple interest automatically.

## What It Does

- Track money lent to and borrowed from friends/contacts
- Automatic daily interest computation (monthly rate ÷ 30 × days elapsed)
- Transparent "Explain the Math" view — every number is traceable
- Interest-first repayment application — partial payments clear interest before principal
- Full audit trail — immutable transaction history
- Backdated entry support — onboard existing loans with correct historical interest

## Tech Stack

- **Frontend:** React 19 + TypeScript + Vite + TailwindCSS v4
- **Backend:** Supabase (PostgreSQL + Auth + RLS)
- **Design:** Murrey (deep wine) + Alabaster palette, Inter + JetBrains Mono typography

## Getting Started

```bash
# Install dependencies
npm install

# Copy env file and add your Supabase credentials
cp .env.example .env

# Start dev server
npm run dev

# Run tests
npm test
```

## Interest Calculation

Uses a 30/360-style daily convention:

```
daily_interest = principal × (monthly_rate / 100 / 30)
```

Interest accrues from the day after a loan is recorded. Rate changes apply forward only — historical interest is preserved.

## License

Private project.
