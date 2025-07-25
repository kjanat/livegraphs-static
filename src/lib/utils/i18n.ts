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
 * Returns the localized display name for an ISO 3166-1 alpha-2 country code.
 *
 * If the code is not recognized or is falsy, returns the original code.
 *
 * @param code - The ISO 3166-1 alpha-2 country code (e.g., 'US', 'FR', 'JP')
 * @param locale - Optional BCP 47 language tag for localization (defaults to 'en')
 * @returns The localized country name, or the original code if not found
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
 * Returns the localized name for a given ISO language code.
 *
 * Converts an ISO 639 language code to its display name in the specified locale. If the code is not recognized, returns the original code.
 *
 * @param code - The ISO 639 language code to localize (e.g., 'en', 'es', 'zh')
 * @param locale - The BCP 47 locale to use for localization (defaults to 'en')
 * @returns The localized language name, or the original code if not found
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
 * Converts an array of ISO country codes to their localized country names.
 *
 * @param codes - Array of ISO 3166-1 alpha-2 country codes to localize
 * @param locale - Optional BCP 47 language tag specifying the desired locale (defaults to "en")
 * @returns Array of localized country names corresponding to the input codes
 */
export function countryNames(codes: string[], locale = "en"): string[] {
  return codes.map((code) => countryName(code, locale));
}

/**
 * Converts an array of ISO language codes to their localized language names.
 *
 * @param codes - The ISO language codes to convert
 * @param locale - Optional BCP 47 locale to use for localization (defaults to "en")
 * @returns An array of localized language names corresponding to the input codes
 */
export function languageNames(codes: string[], locale = "en"): string[] {
  return codes.map((code) => languageName(code, locale));
}

/**
 * Retrieves the user's preferred locale from the browser environment.
 *
 * @returns The user's preferred locale, or "en" if unavailable.
 */
export function getUserLocale(): string {
  if (typeof window !== "undefined" && window.navigator) {
    return window.navigator.language || "en";
  }
  return "en";
}
