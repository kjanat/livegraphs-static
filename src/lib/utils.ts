import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combines and merges class names, resolving Tailwind CSS class conflicts.
 *
 * Accepts any number of class values, combines them into a single string, and merges Tailwind CSS classes to ensure correct precedence.
 *
 * @returns The merged class string.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
