/**
 * i18n Configuration for Japanese Release Demo
 *
 * Default language: Japanese (日本語)
 * Secondary language: English
 */

export const locales = ["ja", "en"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "ja";

export const localeNames: Record<Locale, string> = {
  ja: "日本語",
  en: "English",
};

export const localeEmojis: Record<Locale, string> = {
  ja: "🇯🇵",
  en: "🇺🇸",
};
