/**
 * Quarterly Interest Utilities for LendWise
 *
 * Provides helpers to determine when quarterly (90-day) interest collection
 * is available, and how many days remain until the next collection window.
 */

import { DbTransaction } from '../types';
import { getDaysDifference } from './interest-engine';

/**
 * Finds the date of the most recent interest collection (repayment with interest_applied > 0).
 * Falls back to the initial loan date if no interest has ever been collected.
 */
export function getLastInterestCollectionDate(
  transactions: DbTransaction[],
  initialLoanDate: string
): string {
  // Look for the most recent repayment that applied interest
  const interestRepayments = transactions
    .filter(t => t.type === 'repayment' && t.interest_applied !== null && t.interest_applied > 0)
    .sort((a, b) => b.date.localeCompare(a.date)); // most recent first

  if (interestRepayments.length > 0) {
    return interestRepayments[0].date;
  }

  return initialLoanDate;
}

/**
 * Returns the number of days since the last interest collection.
 */
export function getDaysSinceLastCollection(
  transactions: DbTransaction[],
  initialLoanDate: string,
  asOfDate?: string
): number {
  const lastDate = getLastInterestCollectionDate(transactions, initialLoanDate);
  const today = asOfDate || new Date().toISOString().split('T')[0];
  return getDaysDifference(lastDate, today);
}

/**
 * Returns true if 90+ days have elapsed since the last interest collection.
 */
export function isQuarterlyCollectionAvailable(daysSinceLastCollection: number): boolean {
  return daysSinceLastCollection >= 90;
}

/**
 * Returns the number of days remaining until the next quarterly collection window.
 * Returns 0 if collection is already available.
 */
export function getDaysUntilNextCollection(daysSinceLastCollection: number): number {
  return Math.max(0, 90 - daysSinceLastCollection);
}

/**
 * Describes the quarterly collection status for display purposes.
 */
export interface QuarterlyStatus {
  daysSinceLastCollection: number;
  daysUntilAvailable: number;
  isAvailable: boolean;
  lastCollectionDate: string;
}

/**
 * Computes the full quarterly status for a balance.
 */
export function getQuarterlyStatus(
  transactions: DbTransaction[],
  initialLoanDate: string,
  asOfDate?: string
): QuarterlyStatus {
  const lastCollectionDate = getLastInterestCollectionDate(transactions, initialLoanDate);
  const daysSince = getDaysSinceLastCollection(transactions, initialLoanDate, asOfDate);
  const daysUntil = getDaysUntilNextCollection(daysSince);

  return {
    daysSinceLastCollection: daysSince,
    daysUntilAvailable: daysUntil,
    isAvailable: isQuarterlyCollectionAvailable(daysSince),
    lastCollectionDate,
  };
}
