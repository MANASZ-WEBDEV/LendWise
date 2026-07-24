import { describe, it, expect } from 'vitest';
import {
  getDaysDifference,
  computePeriodInterest,
  calculateBalanceState,
  calculateRepaymentSplit,
} from './interest-engine';

describe('Interest Engine — Unit Tests', () => {
  it('calculates exact day differences between ISO date strings', () => {
    expect(getDaysDifference('2023-01-01', '2023-01-10')).toBe(9);
    expect(getDaysDifference('2023-01-01', '2023-01-01')).toBe(0);
    expect(getDaysDifference('2023-01-10', '2023-01-01')).toBe(0);
    expect(getDaysDifference('2023-01-01', '2023-02-10')).toBe(40);
    expect(getDaysDifference('2023-01-01', '2023-04-11')).toBe(100);
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
      '2023-02-10' // 40 days later
    );

    expect(result.currentPrincipal).toBe(10000);
    expect(result.totalAccruedInterest).toBe(200);
    expect(result.outstandingInterest).toBe(200);
    expect(result.segments.length).toBe(1);
    expect(result.segments[0].days).toBe(40);
  });

  it('handles repayments with interest-first application logic', () => {
    const split = calculateRepaymentSplit(5000, 200, 10000);

    expect(split.interestPaid).toBe(200);
    expect(split.principalPaid).toBe(4800);
    expect(split.newPrincipal).toBe(5200);
    expect(split.newInterest).toBe(0);
    expect(split.totalRemaining).toBe(5200);
  });

  it('handles partial repayment less than outstanding interest', () => {
    const split = calculateRepaymentSplit(150, 200, 10000);

    expect(split.interestPaid).toBe(150);
    expect(split.principalPaid).toBe(0);
    expect(split.newPrincipal).toBe(10000);
    expect(split.newInterest).toBe(50);
    expect(split.totalRemaining).toBe(10050);
  });

  it('handles rate changes mid-period', () => {
    // 20 days @ 1.5%, then 20 days @ 2.0%
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
      '2023-02-10' // 40 days total: 20 days @ 1.5%, 20 days @ 2.0%
    );

    // Seg 1: 10000 * (1.5/100/30) * 20 = 100
    // Seg 2: 10000 * (2.0/100/30) * 20 = 133.33
    // Total = 233.33
    expect(result.segments.length).toBe(2);
    expect(result.totalAccruedInterest).toBe(233.33);
  });
});
