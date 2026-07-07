"use client";

import { Star } from "lucide-react";

export function RatingStars({
  label,
  name,
  value,
  onChange,
}: {
  label: string;
  name: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-medium text-muted">{label}</span>
        <span className="rounded-md bg-[#f6f4ef] px-2 py-1 text-xs font-semibold text-foreground">
          {value}/5
        </span>
      </div>
      <div className="flex items-center gap-1" role="radiogroup" aria-label={label}>
        {[1, 2, 3, 4, 5].map((rating) => (
          <button
            aria-checked={value === rating}
            aria-label={`${label}: ${rating}`}
            className="flex size-9 items-center justify-center rounded-lg border border-line bg-white text-clay transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
            key={rating}
            name={name}
            role="radio"
            type="button"
            onClick={() => onChange(rating)}
          >
            <Star
              className={`size-4 ${
                rating <= value ? "fill-clay text-clay" : "text-[#c8c1b7]"
              }`}
            />
          </button>
        ))}
      </div>
    </div>
  );
}
