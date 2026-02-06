/**
 * Japanese Market Formatters
 *
 * Provides Japanese-specific formatting for:
 * - Dates (yyyy年MM月dd日)
 * - Times (HH時mm分)
 * - Currency (¥X,XXX)
 * - Numbers (Japanese grouping)
 */

import { format as dateFnsFormat } from "date-fns";
import { ja as jaLocale } from "date-fns/locale";
import type { Locale } from "./config";

/**
 * Format date according to locale
 * Japanese: 2026年1月6日
 * English: January 6, 2026
 */
export function formatDate(date: Date, locale: Locale = "ja"): string {
  if (locale === "ja") {
    return dateFnsFormat(date, "yyyy年MM月dd日", { locale: jaLocale });
  }
  return dateFnsFormat(date, "MMMM d, yyyy");
}

/**
 * Format time according to locale
 * Japanese: 09時45分
 * English: 9:45 AM
 */
export function formatTime(date: Date, locale: Locale = "ja"): string {
  if (locale === "ja") {
    return dateFnsFormat(date, "HH時mm分", { locale: jaLocale });
  }
  return dateFnsFormat(date, "h:mm a");
}

/**
 * Format date and time together
 * Japanese: 2026年1月6日 09時45分
 * English: January 6, 2026 at 9:45 AM
 */
export function formatDateTime(date: Date, locale: Locale = "ja"): string {
  if (locale === "ja") {
    return dateFnsFormat(date, "yyyy年MM月dd日 HH時mm分", { locale: jaLocale });
  }
  return dateFnsFormat(date, "MMMM d, yyyy 'at' h:mm a");
}

/**
 * Format currency according to locale
 * Japanese: ¥4,990
 * English: $49.90
 */
export function formatCurrency(amount: number, locale: Locale = "ja"): string {
  if (locale === "ja") {
    return `¥${amount.toLocaleString("ja-JP")}`;
  }
  // Convert yen to dollars (rough estimate: 150 yen = $1)
  const dollars = amount / 150;
  return `$${dollars.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/**
 * Format number with locale-specific grouping
 * Japanese: 1,234,567
 * English: 1,234,567
 */
export function formatNumber(value: number, locale: Locale = "ja"): string {
  if (locale === "ja") {
    return value.toLocaleString("ja-JP");
  }
  return value.toLocaleString("en-US");
}

/**
 * Format XP/score with kanji suffix for Japanese
 * Japanese: 1,234 XP
 * English: 1,234 XP
 */
export function formatXP(xp: number, locale: Locale = "ja"): string {
  const formatted = formatNumber(xp, locale);
  return `${formatted} XP`;
}

/**
 * Format percentage
 * Japanese: 75%
 * English: 75%
 */
export function formatPercentage(value: number, locale: Locale = "ja"): string {
  return `${Math.round(value)}%`;
}
