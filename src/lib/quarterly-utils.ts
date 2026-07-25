/**
 * Quarterly Interest Utilities for LendWise
 *
 * Provides helpers to determine when quarterly (90-day) interest collection
 * is available, and how many days remain until the next collection window.
 */

import { DbTransaction } from '../types';
import { getDaysDifference } from './interest-engine';

/**
 * Finds the date of the most recent interest collection.
 * Uses interestPaidTill if explicitly set, otherwise checks transaction history for repayments,
 * and falls back to the initial loan date.
 */
export function getLastInterestCollectionDate(
  transactions: DbTransaction[],
  initialLoanDate: string,
  interestPaidTill?: string | null
): string {
  if (interestPaidTill) {
    return interestPaidTill;
  }

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
  asOfDate?: string,
  interestPaidTill?: string | null
): number {
  const lastDate = getLastInterestCollectionDate(transactions, initialLoanDate, interestPaidTill);
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
 * Calculates exactly 3 months (90 days) of interest for a given principal and monthly rate.
 * Formula: principal * (monthlyRate / 100) * 3
 */
export function computeQuarterlyInterestAmount(principal: number, monthlyRate: number): number {
  if (principal <= 0 || monthlyRate <= 0) return 0;
  const rawAmount = principal * (monthlyRate / 100) * 3;
  return Math.round(rawAmount * 100) / 100;
}

/**
 * Advances a date string ('YYYY-MM-DD') by 3 months (90 days in 30-day month convention).
 */
export function addQuarterToDate(dateStr: string): string {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;

  let year = d.getUTCFullYear();
  let month = d.getUTCMonth() + 3; // add 3 months
  let day = d.getUTCDate();

  if (month > 11) {
    year += Math.floor(month / 12);
    month = month % 12;
  }

  // Handle month end overflows
  const daysInTargetMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  if (day > daysInTargetMonth) {
    day = daysInTargetMonth;
  }

  const mm = String(month + 1).padStart(2, '0');
  const dd = String(day).padStart(2, '0');
  return `${year}-${mm}-${dd}`;
}

/**
 * Computes the full quarterly status for a balance.
 */
export function getQuarterlyStatus(
  transactions: DbTransaction[],
  initialLoanDate: string,
  asOfDate?: string,
  interestPaidTill?: string | null
): QuarterlyStatus {
  const lastCollectionDate = getLastInterestCollectionDate(transactions, initialLoanDate, interestPaidTill);
  const daysSince = getDaysSinceLastCollection(transactions, initialLoanDate, asOfDate, interestPaidTill);
  const daysUntil = getDaysUntilNextCollection(daysSince);

  return {
    daysSinceLastCollection: daysSince,
    daysUntilAvailable: daysUntil,
    isAvailable: isQuarterlyCollectionAvailable(daysSince),
    lastCollectionDate,
  };
}
