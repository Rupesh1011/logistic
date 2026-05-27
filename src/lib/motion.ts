// Shared helpers for motion features. Honor prefers-reduced-motion.
import { useEffect, useRef, useState } from "react";

export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener?.("change", update);
    return () => mq.removeEventListener?.("change", update);
  }, []);
  return reduced;
}

// Reveal-on-scroll: adds a `data-revealed="true"` attribute the first time the
// element enters the viewport. Pair with the `.reveal-on-scroll` CSS utility.
export function useRevealOnScroll<T extends HTMLElement>(): React.RefObject<T | null> {
  const ref = useRef<T | null>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const obs = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            (entry.target as HTMLElement).dataset.revealed = "true";
            obs.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return ref;
}

// Subtle parallax driver. Translates the element vertically by (scroll * speed),
// clamped to `maxOffsetPx`, only while the element is in view, on >=768px screens,
// and only when the user has not requested reduced motion.
export function useParallax<T extends HTMLElement>(
  speed = 0.3,
  maxOffsetPx = 120,
): React.RefObject<T | null> {
  const ref = useRef<T | null>(null);
  const reduced = usePrefersReducedMotion();
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (reduced) return;
    if (window.innerWidth < 768) return;
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;

    let inView = false;
    let raf = 0;

    const onScroll = () => {
      if (!inView) return;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const rect = el.getBoundingClientRect();
        const center = rect.top + rect.height / 2 - window.innerHeight / 2;
        const offset = Math.max(-maxOffsetPx, Math.min(maxOffsetPx, -center * speed));
        el.style.transform = `translate3d(0, ${offset.toFixed(1)}px, 0)`;
      });
    };

    const obs = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          inView = entry.isIntersecting;
          if (inView) onScroll();
          else el.style.transform = "";
        }
      },
      { threshold: 0 },
    );
    obs.observe(el);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      obs.disconnect();
      el.style.transform = "";
    };
  }, [speed, maxOffsetPx, reduced]);
  return ref;
}
