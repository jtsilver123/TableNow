"use client";

import { SearchIcon } from "@/components/icons";
import { Select } from "@/components/ui/field";
import { cn } from "@/lib/cn";
import { PLATFORM_LABEL, REQUEST_STATUS_META, STATUS_FILTER_ORDER } from "@/lib/status";
import type { Platform, RequestStatus } from "@/lib/types";

export interface QueueFilterState {
  search: string;
  platform: Platform | "all";
  status: RequestStatus | "all";
  party: number | "all";
  sort: "recent" | "next_check" | "name";
}

export function QueueFilters({
  state,
  onChange,
  counts,
}: {
  state: QueueFilterState;
  onChange: (patch: Partial<QueueFilterState>) => void;
  counts: Partial<Record<RequestStatus | "all", number>>;
}) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
          <input
            value={state.search}
            onChange={(e) => onChange({ search: e.target.value })}
            placeholder="Search restaurants"
            className="input-base pl-9"
          />
        </div>
        <div className="grid grid-cols-3 gap-2 sm:flex sm:gap-3">
          <Select
            aria-label="Platform"
            value={state.platform}
            onChange={(e) => onChange({ platform: e.target.value as Platform | "all" })}
            className="w-full sm:w-36"
          >
            <option value="all">All platforms</option>
            <option value="resy">{PLATFORM_LABEL.resy}</option>
            <option value="opentable">{PLATFORM_LABEL.opentable}</option>
          </Select>
          <Select
            aria-label="Party size"
            value={String(state.party)}
            onChange={(e) =>
              onChange({ party: e.target.value === "all" ? "all" : Number(e.target.value) })
            }
            className="w-full sm:w-28"
          >
            <option value="all">Any size</option>
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <option key={n} value={n}>
                {n} {n === 1 ? "guest" : "guests"}
              </option>
            ))}
          </Select>
          <Select
            aria-label="Sort"
            value={state.sort}
            onChange={(e) => onChange({ sort: e.target.value as QueueFilterState["sort"] })}
            className="w-full sm:w-36"
          >
            <option value="recent">Most recent</option>
            <option value="next_check">Next check</option>
            <option value="name">Name</option>
          </Select>
        </div>
      </div>

      {/* Status chips */}
      <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
        <Chip
          active={state.status === "all"}
          onClick={() => onChange({ status: "all" })}
          label="All"
          count={counts.all}
        />
        {STATUS_FILTER_ORDER.map((s) => (
          <Chip
            key={s}
            active={state.status === s}
            onClick={() => onChange({ status: s })}
            label={REQUEST_STATUS_META[s].label}
            count={counts[s]}
          />
        ))}
      </div>
    </div>
  );
}

function Chip({
  active,
  onClick,
  label,
  count,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  count?: number;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "inline-flex flex-none items-center gap-1.5 rounded-full border px-3 py-1.5 text-[13px] font-medium transition focus-ring",
        active
          ? "border-sage-300 bg-sage-100 text-sage-700"
          : "border-line bg-ivory-50 text-ink-500 hover:border-ink-300 hover:text-ink-800",
      )}
    >
      {label}
      {count !== undefined && count > 0 && (
        <span className={cn("text-[11px]", active ? "text-sage-600" : "text-ink-400")}>{count}</span>
      )}
    </button>
  );
}
