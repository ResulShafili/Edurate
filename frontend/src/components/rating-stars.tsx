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
        <span className="text-xs font-medium text-gray-500">{label}</span>
        <span className="rounded-2xl bg-slate-50 px-3 py-1 text-xs font-semibold text-gray-900">
          {value}/5
        </span>
      </div>
      <div className="grid grid-cols-5 gap-2" role="radiogroup" aria-label={label}>
        {[1, 2, 3, 4, 5].map((rating) => (
          <button
            aria-checked={value === rating}
            aria-label={`${label}: ${rating}`}
            className="flex min-h-[44px] items-center justify-center rounded-2xl border border-slate-200 bg-white text-orange-600 transition-all duration-300 md:hover:-translate-y-0.5 md:hover:shadow-md"
            key={rating}
            name={name}
            role="radio"
            type="button"
            onClick={() => onChange(rating)}
          >
            <Star
              className={`size-4 ${
                rating <= value ? "fill-orange-500 text-orange-500" : "text-gray-300"
              }`}
            />
          </button>
        ))}
      </div>
    </div>
  );
}
