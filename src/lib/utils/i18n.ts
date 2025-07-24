/**
 * Notso AI - A web dashboard for visualizing chatbot conversation analytics
 * Copyright (C) 2025  Kaj Kowalski
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

/**
 * Internationalization utilities for converting ISO codes to localized display names
 * Uses the browser's built-in Intl.DisplayNames API for efficient localization
 */

// Cache instances to avoid recreating them
const regionCache: Record<string, Intl.DisplayNames> = {};
const langCache: Record<string, Intl.DisplayNames> = {};

/**
 * Convert an ISO country code to a localized country name
 * @param code - ISO 3166-1 alpha-2 country code (e.g., 'US', 'FR', 'JP')
 * @param locale - BCP 47 language tag (defaults to 'en')
 * @returns Localized country name or original code if not found
 * @example
 * countryName('US') // 'United States'
 * countryName('FR', 'fr') // 'France'
 * countryName('JP', 'ja') // '日本'
 */
export function countryName(code: string, locale = "en"): string {
  if (!code) return code;

  const l = locale.split("-")[0]; // 'en-US' -> 'en'

  // Create and cache DisplayNames instance for this locale
  regionCache[l] ||= new Intl.DisplayNames([l], { type: "region" });

  // Convert to uppercase for country codes and return localized name
  return regionCache[l].of(code.toUpperCase()) ?? code;
}

/**
 * Convert an ISO language code to a localized language name
 * @param code - ISO 639-1/2/3 language code (e.g., 'en', 'es', 'zh')
 * @param locale - BCP 47 language tag (defaults to 'en')
 * @returns Localized language name or original code if not found
 * @example
 * languageName('en') // 'English'
 * languageName('es', 'es') // 'español'
 * languageName('zh', 'zh') // '中文'
 */
export function languageName(code: string, locale = "en"): string {
  if (!code) return code;

  const l = locale.split("-")[0];

  // Create and cache DisplayNames instance for this locale
  langCache[l] ||= new Intl.DisplayNames([l], { type: "language" });

  // Convert to lowercase for language codes and return localized name
  return langCache[l].of(code.toLowerCase()) ?? code;
}

/**
 * Convert multiple country codes to localized names
 * @param codes - Array of ISO country codes
 * @param locale - BCP 47 language tag
 * @returns Array of localized country names
 */
export function countryNames(codes: string[], locale = "en"): string[] {
  return codes.map((code) => countryName(code, locale));
}

/**
 * Convert multiple language codes to localized names
 * @param codes - Array of ISO language codes
 * @param locale - BCP 47 language tag
 * @returns Array of localized language names
 */
export function languageNames(codes: string[], locale = "en"): string[] {
  return codes.map((code) => languageName(code, locale));
}

/**
 * Get the user's preferred locale from the browser
 * @returns The user's preferred locale or 'en' as fallback
 */
export function getUserLocale(): string {
  if (typeof window !== "undefined" && window.navigator) {
    return window.navigator.language || "en";
  }
  return "en";
}
