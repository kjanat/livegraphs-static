/**
 * Notso AI - Icon System
 * Copyright (C) 2025  Kaj Kowalski
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import type { SVGProps } from "react";

interface IconProps extends SVGProps<SVGSVGElement> {
  size?: number;
  className?: string;
  decorative?: boolean;
}

export function UploadIcon({ size = 20, className = "", decorative = false, ...props }: IconProps) {
  const titleId = decorative ? undefined : "upload-icon-title";

  return (
    <svg
      width={size}
      height={size}
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      role={decorative ? undefined : "img"}
      aria-labelledby={titleId}
      aria-hidden={decorative ? "true" : undefined}
      {...props}
    >
      {!decorative && <title id={titleId}>Upload</title>}
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  );
}

export function DownloadIcon({
  size = 20,
  className = "",
  decorative = false,
  ...props
}: IconProps) {
  const titleId = decorative ? undefined : "download-icon-title";

  return (
    <svg
      width={size}
      height={size}
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      role={decorative ? undefined : "img"}
      aria-labelledby={titleId}
      aria-hidden={decorative ? "true" : undefined}
      {...props}
    >
      {!decorative && <title id={titleId}>Download</title>}
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}

export function TrashIcon({ size = 20, className = "", decorative = false, ...props }: IconProps) {
  const titleId = decorative ? undefined : "trash-icon-title";

  return (
    <svg
      width={size}
      height={size}
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      role={decorative ? undefined : "img"}
      aria-labelledby={titleId}
      aria-hidden={decorative ? "true" : undefined}
      {...props}
    >
      {!decorative && <title id={titleId}>Trash</title>}
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  );
}

export function ChartIcon({ size = 20, className = "", decorative = false, ...props }: IconProps) {
  const titleId = decorative ? undefined : "chart-icon-title";

  return (
    <svg
      width={size}
      height={size}
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      role={decorative ? undefined : "img"}
      aria-labelledby={titleId}
      aria-hidden={decorative ? "true" : undefined}
      {...props}
    >
      {!decorative && <title id={titleId}>Chart</title>}
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  );
}

export function CalendarIcon({
  size = 20,
  className = "",
  decorative = false,
  ...props
}: IconProps) {
  const titleId = decorative ? undefined : "calendar-icon-title";

  return (
    <svg
      width={size}
      height={size}
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      role={decorative ? undefined : "img"}
      aria-labelledby={titleId}
      aria-hidden={decorative ? "true" : undefined}
      {...props}
    >
      {!decorative && <title id={titleId}>Calendar</title>}
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

export function FileIcon({ size = 20, className = "", decorative = false, ...props }: IconProps) {
  const titleId = decorative ? undefined : "file-icon-title";

  return (
    <svg
      width={size}
      height={size}
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      role={decorative ? undefined : "img"}
      aria-labelledby={titleId}
      aria-hidden={decorative ? "true" : undefined}
      {...props}
    >
      {!decorative && <title id={titleId}>File</title>}
      <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
      <polyline points="13 2 13 9 20 9" />
    </svg>
  );
}

export function ExpandIcon({ size = 20, className = "", decorative = false, ...props }: IconProps) {
  const titleId = decorative ? undefined : "expand-icon-title";

  return (
    <svg
      width={size}
      height={size}
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      role={decorative ? undefined : "img"}
      aria-labelledby={titleId}
      aria-hidden={decorative ? "true" : undefined}
      {...props}
    >
      {!decorative && <title id={titleId}>Expand</title>}
      <polyline points="15 3 21 3 21 9" />
      <polyline points="9 21 3 21 3 15" />
      <line x1="21" y1="3" x2="14" y2="10" />
      <line x1="3" y1="21" x2="10" y2="14" />
    </svg>
  );
}

export function SpinnerIcon({
  size = 20,
  className = "",
  decorative = false,
  ...props
}: IconProps) {
  const titleId = decorative ? undefined : "spinner-icon-title";

  return (
    <svg
      width={size}
      height={size}
      className={`animate-spin ${className}`}
      viewBox="0 0 24 24"
      fill="none"
      role={decorative ? undefined : "img"}
      aria-labelledby={titleId}
      aria-hidden={decorative ? "true" : undefined}
      {...props}
    >
      {!decorative && <title id={titleId}>Loading</title>}
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}

export function InfoIcon({ size = 20, className = "", decorative = false, ...props }: IconProps) {
  const titleId = decorative ? undefined : "info-icon-title";

  return (
    <svg
      width={size}
      height={size}
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      role={decorative ? undefined : "img"}
      aria-labelledby={titleId}
      aria-hidden={decorative ? "true" : undefined}
      {...props}
    >
      {!decorative && <title id={titleId}>Info</title>}
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  );
}

export function AlertTriangleIcon({
  size = 20,
  className = "",
  decorative = false,
  ...props
}: IconProps) {
  const titleId = decorative ? undefined : "alert-triangle-icon-title";

  return (
    <svg
      width={size}
      height={size}
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      role={decorative ? undefined : "img"}
      aria-labelledby={titleId}
      aria-hidden={decorative ? "true" : undefined}
      {...props}
    >
      {!decorative && <title id={titleId}>Alert Triangle</title>}
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}

export function CheckCircleIcon({
  size = 20,
  className = "",
  decorative = false,
  ...props
}: IconProps) {
  const titleId = decorative ? undefined : "check-circle-icon-title";

  return (
    <svg
      width={size}
      height={size}
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      role={decorative ? undefined : "img"}
      aria-labelledby={titleId}
      aria-hidden={decorative ? "true" : undefined}
      {...props}
    >
      {!decorative && <title id={titleId}>Check Circle</title>}
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}

export function TrendingUpIcon({
  size = 20,
  className = "",
  decorative = false,
  ...props
}: IconProps) {
  const titleId = decorative ? undefined : "trending-up-icon-title";

  return (
    <svg
      width={size}
      height={size}
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      role={decorative ? undefined : "img"}
      aria-labelledby={titleId}
      aria-hidden={decorative ? "true" : undefined}
      {...props}
    >
      {!decorative && <title id={titleId}>Trending Up</title>}
      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
      <polyline points="16 7 22 7 22 13" />
    </svg>
  );
}

export function TrendingDownIcon({
  size = 20,
  className = "",
  decorative = false,
  ...props
}: IconProps) {
  const titleId = decorative ? undefined : "trending-down-icon-title";

  return (
    <svg
      width={size}
      height={size}
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      role={decorative ? undefined : "img"}
      aria-labelledby={titleId}
      aria-hidden={decorative ? "true" : undefined}
      {...props}
    >
      {!decorative && <title id={titleId}>Trending Down</title>}
      <polyline points="22 17 13.5 8.5 8.5 13.5 2 7" />
      <polyline points="16 17 22 17 22 11" />
    </svg>
  );
}

export function ChevronDownIcon({
  size = 20,
  className = "",
  decorative = false,
  ...props
}: IconProps) {
  const titleId = decorative ? undefined : "chevron-down-icon-title";

  return (
    <svg
      width={size}
      height={size}
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      role={decorative ? undefined : "img"}
      aria-labelledby={titleId}
      aria-hidden={decorative ? "true" : undefined}
      {...props}
    >
      {!decorative && <title id={titleId}>Chevron Down</title>}
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

export function ChevronUpIcon({
  size = 20,
  className = "",
  decorative = false,
  ...props
}: IconProps) {
  const titleId = decorative ? undefined : "chevron-up-icon-title";

  return (
    <svg
      width={size}
      height={size}
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      role={decorative ? undefined : "img"}
      aria-labelledby={titleId}
      aria-hidden={decorative ? "true" : undefined}
      {...props}
    >
      {!decorative && <title id={titleId}>Chevron Up</title>}
      <polyline points="18 15 12 9 6 15" />
    </svg>
  );
}

export function AlertCircleIcon({
  size = 20,
  className = "",
  decorative = false,
  ...props
}: IconProps) {
  const titleId = decorative ? undefined : "alert-circle-icon-title";

  return (
    <svg
      width={size}
      height={size}
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      role={decorative ? undefined : "img"}
      aria-labelledby={titleId}
      aria-hidden={decorative ? "true" : undefined}
      {...props}
    >
      {!decorative && <title id={titleId}>Alert Circle</title>}
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}

export function BarChart3Icon({
  size = 20,
  className = "",
  decorative = false,
  ...props
}: IconProps) {
  const titleId = decorative ? undefined : "bar-chart-3-icon-title";

  return (
    <svg
      width={size}
      height={size}
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      role={decorative ? undefined : "img"}
      aria-labelledby={titleId}
      aria-hidden={decorative ? "true" : undefined}
      {...props}
    >
      {!decorative && <title id={titleId}>Bar Chart</title>}
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  );
}

export function MessageSquareIcon({
  size = 20,
  className = "",
  decorative = false,
  ...props
}: IconProps) {
  const titleId = decorative ? undefined : "message-square-icon-title";

  return (
    <svg
      width={size}
      height={size}
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      role={decorative ? undefined : "img"}
      aria-labelledby={titleId}
      aria-hidden={decorative ? "true" : undefined}
      {...props}
    >
      {!decorative && <title id={titleId}>Message Square</title>}
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

export function UsersIcon({ size = 20, className = "", decorative = false, ...props }: IconProps) {
  const titleId = decorative ? undefined : "users-icon-title";

  return (
    <svg
      width={size}
      height={size}
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      role={decorative ? undefined : "img"}
      aria-labelledby={titleId}
      aria-hidden={decorative ? "true" : undefined}
      {...props}
    >
      {!decorative && <title id={titleId}>Users</title>}
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

export function XIcon({ size = 20, className = "", decorative = false, ...props }: IconProps) {
  const titleId = decorative ? undefined : "x-icon-title";

  return (
    <svg
      width={size}
      height={size}
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      role={decorative ? undefined : "img"}
      aria-labelledby={titleId}
      aria-hidden={decorative ? "true" : undefined}
      {...props}
    >
      {!decorative && <title id={titleId}>Close</title>}
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}
