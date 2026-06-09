"use client";

import { useState } from "react";
import { Input, Label, Segmented, Select, Textarea } from "@/components/ui/field";
import { RestaurantAutocomplete } from "@/components/restaurant-autocomplete";
import type {
  Flexibility,
  Platform,
  Priority,
  ReservationRequest,
  SeatingPreference,
} from "@/lib/types";

export interface RequestFormValue {
  restaurant_name: string;
  platform: Platform;
  city: string;
  party_size: number;
  date_start: string;
  date_end: string;
  time_start: string;
  time_end: string;
  flexibility_level: Flexibility;
  seating_preference: SeatingPreference;
  priority: Priority;
  notes: string;
}

const todayIso = () => new Date().toISOString().slice(0, 10);

export function makeInitialValue(
  prefill: Partial<ReservationRequest> | null,
  defaults: { city: string; party_size: number },
): RequestFormValue {
  return {
    restaurant_name: prefill?.restaurant_name ?? "",
    platform: prefill?.platform ?? "resy",
    city: prefill?.city ?? defaults.city,
    party_size: prefill?.party_size ?? defaults.party_size,
    date_start: prefill?.date_start ?? todayIso(),
    date_end: prefill?.date_end ?? prefill?.date_start ?? todayIso(),
    time_start: prefill?.time_start ?? "19:00",
    time_end: prefill?.time_end ?? "21:00",
    flexibility_level: prefill?.flexibility_level ?? "flexible",
    seating_preference: prefill?.seating_preference ?? "any",
    priority: prefill?.priority ?? "normal",
    notes: prefill?.notes ?? "",
  };
}

/** The shared request form used by both the add modal and the editor. */
export function RequestForm({
  value,
  onChange,
}: {
  value: RequestFormValue;
  onChange: (patch: Partial<RequestFormValue>) => void;
}) {
  const [rangeMode, setRangeMode] = useState(value.date_start !== value.date_end);

  return (
    <div className="space-y-5">
      <div>
        <Label htmlFor="restaurant">Restaurant</Label>
        <RestaurantAutocomplete
          id="restaurant"
          value={value.restaurant_name}
          onChange={(v) => onChange({ restaurant_name: v })}
          onSelect={(entry) =>
            onChange({ restaurant_name: entry.name, platform: entry.platform, city: entry.city })
          }
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Platform</Label>
          <Segmented
            value={value.platform}
            onChange={(platform) => onChange({ platform })}
            options={[
              { value: "resy", label: "Resy" },
              { value: "opentable", label: "OpenTable" },
            ]}
          />
        </div>
        <div>
          <Label htmlFor="party">Party size</Label>
          <Select
            id="party"
            value={String(value.party_size)}
            onChange={(e) => onChange({ party_size: Number(e.target.value) })}
          >
            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
              <option key={n} value={n}>
                {n} {n === 1 ? "guest" : "guests"}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="city">City</Label>
        <Input id="city" value={value.city} onChange={(e) => onChange({ city: e.target.value })} placeholder="New York" />
      </div>

      {/* Dates */}
      <div>
        <Label hint={rangeMode ? "Searching a range" : "Single night"}>Date</Label>
        <div className="mb-2">
          <Segmented
            value={rangeMode ? "range" : "single"}
            onChange={(v) => {
              const range = v === "range";
              setRangeMode(range);
              if (!range) onChange({ date_end: value.date_start });
            }}
            options={[
              { value: "single", label: "Single night" },
              { value: "range", label: "Date range" },
            ]}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Input
            type="date"
            value={value.date_start}
            onChange={(e) =>
              onChange(
                rangeMode
                  ? { date_start: e.target.value }
                  : { date_start: e.target.value, date_end: e.target.value },
              )
            }
          />
          {rangeMode && (
            <Input
              type="date"
              value={value.date_end}
              min={value.date_start}
              onChange={(e) => onChange({ date_end: e.target.value })}
            />
          )}
        </div>
      </div>

      {/* Time window */}
      <div>
        <Label>Time window</Label>
        <div className="grid grid-cols-2 gap-4">
          <Input type="time" value={value.time_start} onChange={(e) => onChange({ time_start: e.target.value })} />
          <Input type="time" value={value.time_end} onChange={(e) => onChange({ time_end: e.target.value })} />
        </div>
      </div>

      <div>
        <Label>Flexibility</Label>
        <Segmented
          value={value.flexibility_level}
          onChange={(flexibility_level) => onChange({ flexibility_level })}
          options={[
            { value: "strict", label: "Strict" },
            { value: "flexible", label: "Flexible" },
            { value: "very_flexible", label: "Very flexible" },
          ]}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="seating">Seating</Label>
          <Select
            id="seating"
            value={value.seating_preference}
            onChange={(e) => onChange({ seating_preference: e.target.value as SeatingPreference })}
          >
            <option value="any">Any</option>
            <option value="indoor">Indoor</option>
            <option value="outdoor">Outdoor</option>
            <option value="bar">Bar</option>
            <option value="counter">Counter</option>
          </Select>
        </div>
        <div>
          <Label>Priority</Label>
          <Segmented
            value={value.priority}
            onChange={(priority) => onChange({ priority })}
            options={[
              { value: "normal", label: "Normal" },
              { value: "high", label: "High" },
            ]}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="notes" hint="Optional">Notes</Label>
        <Textarea
          id="notes"
          value={value.notes}
          onChange={(e) => onChange({ notes: e.target.value })}
          placeholder="Anything we should know — occasion, seating wishes…"
        />
      </div>
    </div>
  );
}
