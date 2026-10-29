import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export function Stars({ value, className, size = 16 }: { value: number; className?: string; size?: number }) {
  return (
    <div className={cn("flex items-center gap-0.5", className)} aria-label={`${value} / 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} style={{ width: size, height: size }} className={i <= Math.round(value) ? "fill-star text-star" : "text-border"} />
      ))}
    </div>
  );
}
