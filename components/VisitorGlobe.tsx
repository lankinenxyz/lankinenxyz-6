"use client";

import createGlobe, { type Marker } from "cobe";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";

type VisitorIntensity = "low" | "medium" | "high";

type AnalyticsCountry = {
  code: string;
  name: string;
  lat: number;
  lng: number;
  intensity: VisitorIntensity;
};

type AnalyticsResponse = {
  countries: AnalyticsCountry[];
  configured: boolean;
  updatedAt: string | null;
  error?: string;
};

const markerSize = {
  low: 0.035,
  medium: 0.055,
  high: 0.075,
} satisfies Record<VisitorIntensity, number>;

export default function VisitorGlobe() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const prefersReducedMotion = useSyncExternalStore(
    subscribeToReducedMotion,
    getReducedMotionSnapshot,
    () => false,
  );
  const [data, setData] = useState<AnalyticsResponse>({
    countries: [],
    configured: false,
    updatedAt: null,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let ignore = false;

    async function loadCountries() {
      try {
        const response = await fetch("/api/analytics/countries");
        const payload = (await response.json()) as AnalyticsResponse;

        if (!ignore) {
          setData(payload);
        }
      } catch {
        if (!ignore) {
          setData({
            countries: [],
            configured: false,
            updatedAt: null,
            error: "analytics_unavailable",
          });
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }

    loadCountries();

    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) {
      return;
    }

    let phi = -0.45;
    let animationFrame = 0;
    const markers: Marker[] = data.countries.map((country) => ({
      location: [country.lat, country.lng],
      size: markerSize[country.intensity],
    }));
    const globe = createGlobe(canvas, {
      devicePixelRatio: Math.min(window.devicePixelRatio || 1, 2),
      width: 960,
      height: 960,
      phi,
      theta: 0.18,
      dark: 1,
      diffuse: 0.95,
      scale: 1,
      mapSamples: 12000,
      mapBrightness: 10,
      baseColor: [0.08, 0.1, 0.09],
      markerColor: [0.72, 1, 0.42],
      glowColor: [0.04, 0.05, 0.04],
      markerElevation: 0.025,
      offset: [0, 0],
      markers,
    });

    function animate() {
      if (!prefersReducedMotion) {
        phi += 0.0025;
      }

      globe.update({ phi, markers });
      animationFrame = requestAnimationFrame(animate);
    }

    animate();

    return () => {
      cancelAnimationFrame(animationFrame);
      globe.destroy();
    };
  }, [data.countries, prefersReducedMotion]);

  return (
    <section>
      <div className="flex flex-col items-center gap-4">
        <div className="relative mx-auto aspect-square w-full max-w-[min(28rem,52vh)] overflow-hidden rounded-full bg-[radial-gradient(circle_at_35%_25%,rgba(151,181,114,0.22),transparent_28%),linear-gradient(145deg,#070907,#101510)] shadow-2xl shadow-black/80">
          <canvas
            ref={canvasRef}
            aria-hidden="true"
            className="h-full w-full opacity-90"
            width={960}
            height={960}
          />
          <div className="pointer-events-none absolute inset-0 rounded-full bg-[radial-gradient(circle_at_31%_20%,rgba(255,255,255,0.13),transparent_20%),radial-gradient(circle_at_55%_84%,rgba(124,167,75,0.16),transparent_38%)]" />
        </div>

        <div className="flex flex-col gap-3 text-center">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.24em] text-lime-200/70">
              Visitors Last 30 days
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function subscribeToReducedMotion(callback: () => void) {
  if (typeof window === "undefined") {
    return () => {};
  }

  const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

  mediaQuery.addEventListener("change", callback);
  return () => mediaQuery.removeEventListener("change", callback);
}

function getReducedMotionSnapshot() {
  if (typeof window === "undefined") {
    return false;
  }

  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
