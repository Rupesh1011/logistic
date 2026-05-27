import { ReactNode } from "react";
import { useRevealOnScroll } from "@/lib/motion";
import { cn } from "@/lib/utils";

type RevealCardProps = {
  children: ReactNode;
  className?: string;
  as?: "div" | "section" | "article";
};

/**
 * Wraps children with the `reveal-on-scroll` utility so they fade-and-rise into
 * view the first time they intersect the viewport. Honors prefers-reduced-motion
 * via the global CSS rule.
 */
export function RevealCard({ children, className, as: Tag = "div" }: RevealCardProps) {
  const ref = useRevealOnScroll<HTMLElement>();
  return (
    <Tag ref={ref as React.Ref<never>} className={cn("reveal-on-scroll", className)}>
      {children}
    </Tag>
  );
}
