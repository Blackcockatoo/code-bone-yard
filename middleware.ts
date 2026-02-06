/**
 * Next.js Middleware for Locale Detection and Routing
 *
 * Features:
 * - Automatic locale detection from browser
 * - Cookie-based locale persistence
 * - Japanese fallback for unknown locales
 */

import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
  // Match all pathnames except for
  // - API routes (_next, api)
  // - Static files (with extensions like .ico, .png, etc.)
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
