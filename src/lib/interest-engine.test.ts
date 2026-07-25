import { describe, it, expect } from 'vitest';
import {
  getDaysDifference,
  computePeriodInterest,
  calculateBalanceState,
  calculateRepaymentSplit,
} from './interest-engine';

describe('Interest Engine — Unit Tests', () => {
  it('calculates 30/360 fixed-month day differences between ISO date strings', () => {
    expect(getDaysDifference('2023-01-01', '2023-01-10')).toBe(9);
    expect(getDaysDifference('2023-01-01', '2023-01-01')).toBe(0);
    expect(getDaysDifference('2023-01-10', '2023-01-01')).toBe(0);
    expect(getDaysDifference('2023-01-01', '2023-02-10')).toBe(39); // 30 + 9 = 39 days
    expect(getDaysDifference('2023-01-01', '2023-04-11')).toBe(100); // 3*30 + 10 = 100 days
    expect(getDaysDifference('2026-04-24', '2026-07-25')).toBe(91); // 3*30 + 1 = 91 days
  });

  it('computes 30/360 simple interest correctly for static period', () => {
    // ₹10,000 @ 1.5%/month for 40 days -> 10000 * (1.5/100/30) * 40 = 200
    expect(computePeriodInterest(10000, 1.5, 40)).toBe(200);

    // ₹10,000 @ 1.5%/month for 100 days -> 10000 * (1.5/100/30) * 100 = 500
    expect(computePeriodInterest(10000, 1.5, 100)).toBe(500);

    // ₹50,000 @ 2.0%/month for 30 days -> 50000 * (2/100/30) * 30 = 1000
    expect(computePeriodInterest(50000, 2.0, 30)).toBe(1000);
  });

  it('calculates full balance state with no repayments', () => {
    const result = calculateBalanceState(
      '2023-01-01',
      10000,
      1.5,
      [],
      [],
      '2023-02-10' // 39 days later in 30-day month convention
    );

    expect(result.currentPrincipal).toBe(10000);
    expect(result.totalAccruedInterest).toBe(195);
    expect(result.outstandingInterest).toBe(195);
    expect(result.segments.length).toBe(1);
    expect(result.segments[0].days).toBe(39);
  });

  it('handles repayments with principal-first reduction logic (default)', () => {
    const split = calculateRepaymentSplit(5000, 200, 10000, true);

    expect(split.principalPaid).toBe(5000);
    expect(split.interestPaid).toBe(0);
    expect(split.newPrincipal).toBe(5000);
    expect(split.newInterest).toBe(200);
    expect(split.totalRemaining).toBe(5200);
  });

  it('handles repayments with interest-first application logic', () => {
    const split = calculateRepaymentSplit(5000, 200, 10000, false);

    expect(split.interestPaid).toBe(200);
    expect(split.principalPaid).toBe(4800);
    expect(split.newPrincipal).toBe(5200);
    expect(split.newInterest).toBe(0);
    expect(split.totalRemaining).toBe(5200);
  });

  it('handles rate changes mid-period', () => {
    // 20 days @ 1.5%, then 19 days @ 2.0% (39 days total)
    const rateHistory = [
      { rate: 1.5, effectiveFrom: '2023-01-01' },
      { rate: 2.0, effectiveFrom: '2023-01-21' },
    ];

    const result = calculateBalanceState(
      '2023-01-01',
      10000,
      1.5,
      [],
      rateHistory,
      '2023-02-10' // 39 days total: 20 days @ 1.5%, 19 days @ 2.0%
    );

    // Seg 1: 10000 * (1.5/100/30) * 20 = 100
    // Seg 2: 10000 * (2.0/100/30) * 19 = 126.67
    // Total = 226.67
    expect(result.segments.length).toBe(2);
    expect(result.totalAccruedInterest).toBe(226.67);
  });
});
