"use client";

import { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/field";
import { PlatformLogo } from "@/components/ui/platform-logo";
import { SearchIcon } from "@/components/icons";
import { searchRestaurants, type RestaurantEntry } from "@/lib/restaurants";

/**
 * Live restaurant typeahead. Suggests known restaurants as the user types and
 * surfaces the platform/neighborhood so they can pick the right one. Free text
 * is always allowed — the list is a convenience, not a constraint.
 */
export function RestaurantAutocomplete({
  value,
  onChange,
  onSelect,
  placeholder = "e.g. Don Angie",
  autoFocus,
  id,
}: {
  value: string;
  onChange: (value: string) => void;
  onSelect?: (entry: RestaurantEntry) => void;
  placeholder?: string;
  autoFocus?: boolean;
  id?: string;
}) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const wrapRef = useRef<HTMLDivElement>(null);

  const results = open ? searchRestaurants(value) : [];
  const showList = open && results.length > 0;

  // Close when clicking outside.
  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  function choose(entry: RestaurantEntry) {
    onChange(entry.name);
    onSelect?.(entry);
    setOpen(false);
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (!showList) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      choose(results[active]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  return (
    <div ref={wrapRef} className="relative">
      <div className="relative">
        <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
        <Input
          id={id}
          value={value}
          autoFocus={autoFocus}
          placeholder={placeholder}
          autoComplete="off"
          className="pl-9"
          onChange={(e) => {
            onChange(e.target.value);
            setOpen(true);
            setActive(0);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
        />
      </div>

      {showList && (
        <ul className="absolute z-20 mt-1.5 max-h-64 w-full overflow-y-auto rounded-xl border border-line bg-ivory-50 py-1 shadow-float">
          {results.map((r, i) => (
            <li key={`${r.name}-${r.city}`}>
              <button
                type="button"
                onMouseEnter={() => setActive(i)}
                onClick={() => choose(r)}
                className={`flex w-full items-center justify-between gap-3 px-3.5 py-2.5 text-left transition ${
                  i === active ? "bg-sage-50" : ""
                }`}
              >
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium text-ink-900">{r.name}</span>
                  <span className="block truncate text-[12px] text-ink-400">
                    {r.neighborhood} · {r.city}
                  </span>
                </span>
                <PlatformLogo platform={r.platform} className="flex-none text-[12px]" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
