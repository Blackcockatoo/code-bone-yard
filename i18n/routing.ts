/**
 * Next-intl Routing Configuration
 *
 * Locale prefix strategy: 'as-needed'
 * - Japanese (default): /
 * - English: /en
 */

import { defineRouting } from "next-intl/routing";
import { locales, defaultLocale } from "./config";

export const routing = defineRouting({
  // All supported locales
  locales,

  // Default locale (Japanese)
  defaultLocale,

  // Only add locale prefix for non-default locales
  // Japanese: / (no prefix)
  // English: /en (with prefix)
  localePrefix: "as-needed",

  // Pathname definitions
  pathnames: {
    "/": "/",
    "/pet": "/pet",
  },
});

export type Pathnames = keyof typeof routing.pathnames;
export type Locale = (typeof locales)[number];
