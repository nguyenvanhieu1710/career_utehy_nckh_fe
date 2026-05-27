"use client";

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { behaviorAPI } from "@/services/behavior";

/**
 * Mount-once tracker that:
 *  - registers the local session with the backend on first load
 *  - fires a page_view event whenever Next.js navigates to a new route
 *  - reports the user's "page dwell time" when they leave a page
 */
export function useBehaviorTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const pageStartRef = useRef<number>(performance.now());
  const lastPathRef = useRef<string>("");

  // One-time session start
  useEffect(() => {
    if (typeof window === "undefined") return;
    const utm = {
      utm_source: searchParams?.get("utm_source") || undefined,
      utm_medium: searchParams?.get("utm_medium") || undefined,
      utm_campaign: searchParams?.get("utm_campaign") || undefined,
    };
    behaviorAPI.startSession(window.location.pathname, utm);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // page_view + dwell time tracking
  useEffect(() => {
    if (typeof window === "undefined") return;
    const key = `${pathname || ""}?${searchParams?.toString() || ""}`;
    if (key === lastPathRef.current) return;

    // Flush dwell-time for previous page
    if (lastPathRef.current) {
      const dwell = performance.now() - pageStartRef.current;
      behaviorAPI.trackEvent({
        event_category: "engagement",
        event_action: "page_leave",
        event_label: lastPathRef.current,
        duration_ms: Math.round(dwell),
      });
    }

    lastPathRef.current = key;
    pageStartRef.current = performance.now();

    behaviorAPI.trackPageView({
      event_label: pathname || undefined,
    });
  }, [pathname, searchParams]);

  // Fire a final "page_leave" event on tab/window close
  useEffect(() => {
    if (typeof window === "undefined") return;
    const handler = () => {
      const dwell = performance.now() - pageStartRef.current;
      try {
        navigator.sendBeacon &&
          navigator.sendBeacon(
            "/api/v1/behavior/track/event",
            new Blob(
              [
                JSON.stringify({
                  session_id: behaviorAPI.ensureSessionId(),
                  event_category: "engagement",
                  event_action: "page_leave",
                  event_label: window.location.pathname,
                  duration_ms: Math.round(dwell),
                  page_url: window.location.href,
                  page_path: window.location.pathname,
                  page_title: document.title,
                }),
              ],
              { type: "application/json" },
            ),
          );
      } catch {
        // ignore — best effort
      }
    };
    window.addEventListener("pagehide", handler);
    window.addEventListener("beforeunload", handler);
    return () => {
      window.removeEventListener("pagehide", handler);
      window.removeEventListener("beforeunload", handler);
    };
  }, []);
}

export default useBehaviorTracker;
