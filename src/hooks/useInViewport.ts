/**
 * Notso AI - A web dashboard for visualizing chatbot conversation analytics
 * Copyright (C) 2025  Kaj Kowalski
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { useEffect, useRef, useState } from "react";

interface UseInViewportOptions {
  threshold?: number;
  rootMargin?: string;
  triggerOnce?: boolean;
}

/**
 * Hook to detect when an element is in the viewport
 * Used for lazy loading charts only when they're visible
 */
export function useInViewport<T extends HTMLElement = HTMLElement>(
  options: UseInViewportOptions = {}
): [React.RefObject<T | null>, boolean] {
  const { threshold = 0, rootMargin = "50px", triggerOnce = true } = options;

  const elementRef = useRef<T>(null);
  const [isInViewport, setIsInViewport] = useState(false);
  const hasTriggeredRef = useRef(false);

  useEffect(() => {
    const element = elementRef.current;
    if (!element || (triggerOnce && hasTriggeredRef.current)) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        const inView = entry.isIntersecting;

        if (inView && triggerOnce) {
          hasTriggeredRef.current = true;
          setIsInViewport(true);
          observer.disconnect();
        } else if (!triggerOnce) {
          setIsInViewport(inView);
        }
      },
      {
        threshold,
        rootMargin
      }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [threshold, rootMargin, triggerOnce]);

  return [elementRef, isInViewport];
}
