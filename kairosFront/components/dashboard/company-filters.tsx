"use client";

import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { industries } from "@/lib/sample-data";
import { usStateOptions } from "@/lib/us-state-options";

export type OpportunityFilter =
  | "no-website-detected"
  | "new-entity-under-30-days"
  | "local-business"
  | "high-confidence"
  | "contact-detected";

interface FiltersProps {
  onFilterChange?: (filters: FilterState) => void;
}

export interface FilterState {
  search: string;
  state: string;
  city: string;
  industry: string;
  timingStage: string;
  minScore: string;
  opportunityFilters: readonly OpportunityFilter[];
}

const timingStages = [
  { value: "all", label: "All Stages" },
  { value: "too-early", label: "Too Early" },
  { value: "warming-up", label: "Warming Up" },
  { value: "best-window", label: "Best Outreach Window" },
  { value: "cooling-down", label: "Cooling Down" },
  { value: "old-lead", label: "Old Lead" },
];

const opportunityFilterOptions: readonly {
  readonly label: string;
  readonly value: OpportunityFilter;
}[] = [
  { label: "No website detected", value: "no-website-detected" },
  { label: "New entity under 30 days", value: "new-entity-under-30-days" },
  { label: "Local business", value: "local-business" },
  { label: "High confidence", value: "high-confidence" },
  { label: "Contact detected", value: "contact-detected" },
];

export function CompanyFilters({ onFilterChange }: FiltersProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    state: "all",
    city: "",
    industry: "all",
    timingStage: "all",
    minScore: "",
    opportunityFilters: [],
  });

  const updateFilter = (key: keyof FilterState, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange?.(newFilters);
  };

  const updateOpportunityFilter = (
    currentFilters: FilterState,
    value: OpportunityFilter,
  ) => {
    const newFilters = {
      ...currentFilters,
      opportunityFilters: toggleOpportunityFilter(currentFilters, value),
    };
    setFilters(newFilters);
    onFilterChange?.(newFilters);
  };

  const clearFilters = () => {
    const clearedFilters: FilterState = {
      search: "",
      state: "all",
      city: "",
      industry: "all",
      timingStage: "all",
      minScore: "",
      opportunityFilters: [],
    };
    setFilters(clearedFilters);
    onFilterChange?.(clearedFilters);
  };

  const hasActiveFilters =
    filters.search ||
    filters.state !== "all" ||
    filters.city ||
    filters.industry !== "all" ||
    filters.timingStage !== "all" ||
    filters.minScore ||
    filters.opportunityFilters.length > 0;

  return (
    <div className="surface-card rounded-lg p-4 space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search companies..."
            value={filters.search}
            onChange={(e) => updateFilter("search", e.target.value)}
            className="pl-9 h-10"
          />
        </div>

        <div className="flex gap-2">
          <Select
            value={filters.state}
            onValueChange={(v) => updateFilter("state", v)}
          >
            <SelectTrigger className="w-[140px] h-10">
              <SelectValue placeholder="State" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All States</SelectItem>
              {usStateOptions.map((state) => (
                <SelectItem key={state.abbreviation} value={state.abbreviation}>
                  {state.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filters.timingStage}
            onValueChange={(v) => updateFilter("timingStage", v)}
          >
            <SelectTrigger className="w-[180px] h-10">
              <SelectValue placeholder="Timing Stage" />
            </SelectTrigger>
            <SelectContent>
              {timingStages.map((stage) => (
                <SelectItem key={stage.value} value={stage.value}>
                  {stage.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="sm"
            className="h-10 gap-2"
            onClick={() => setShowAdvanced(!showAdvanced)}
          >
            <SlidersHorizontal className="h-4 w-4" />
            <span className="hidden sm:inline">Filters</span>
          </Button>
        </div>
      </div>

      <OpportunityFilterButtons
        selectedFilters={filters.opportunityFilters}
        onToggle={(value) => updateOpportunityFilter(filters, value)}
      />

      {showAdvanced && (
        <div className="pt-4 border-t border-border">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                City / Region
              </label>
              <Input
                type="text"
                placeholder="e.g. Miami"
                value={filters.city}
                onChange={(e) => updateFilter("city", e.target.value)}
                className="h-10"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Industry
              </label>
              <Select
                value={filters.industry}
                onValueChange={(v) => updateFilter("industry", v)}
              >
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="All industries" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Industries</SelectItem>
                  {industries.map((industry) => (
                    <SelectItem key={industry} value={industry}>
                      {industry}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Min. Timing Score
              </label>
              <Input
                type="number"
                placeholder="e.g. 70"
                min="0"
                max="100"
                value={filters.minScore}
                onChange={(e) => updateFilter("minScore", e.target.value)}
                className="h-10"
              />
            </div>
          </div>

          {hasActiveFilters && (
            <div className="mt-4 flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="text-muted-foreground"
              >
                <X className="h-4 w-4 mr-1" />
                Clear all filters
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function OpportunityFilterButtons({
  onToggle,
  selectedFilters,
}: {
  onToggle: (value: OpportunityFilter) => void;
  selectedFilters: readonly OpportunityFilter[];
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {opportunityFilterOptions.map((option) => (
        <Button
          key={option.value}
          type="button"
          variant={
            selectedFilters.includes(option.value) ? "default" : "outline"
          }
          size="sm"
          className="h-9"
          onClick={() => onToggle(option.value)}
        >
          {option.label}
        </Button>
      ))}
    </div>
  );
}

function toggleOpportunityFilter(
  filters: FilterState,
  value: OpportunityFilter,
): readonly OpportunityFilter[] {
  if (filters.opportunityFilters.includes(value)) {
    return filters.opportunityFilters.filter((filter) => filter !== value);
  }

  return [...filters.opportunityFilters, value];
}
