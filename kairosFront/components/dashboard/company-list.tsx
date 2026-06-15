"use client";

import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { CompanyCard } from "./company-card";
import { CompanyFilters, type FilterState } from "./company-filters";
import { getTimingStageLabel, type TimingStage } from "@/lib/types";
import {
  discoverKairosBusinesses,
  listKairosBusinessPage,
  recalculateKairosTimingStages,
  toCompany,
} from "@/lib/business-api";
import { getOrFetchAccount } from "@/lib/account-session";
import {
  Building2,
  ChevronLeft,
  ChevronRight,
  Database,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { readKairosMarketTargetSession } from "@/lib/market-target-session";
import { OfferedService } from "@/lib/account-api";
import { usStateOptions } from "@/lib/us-state-options";

interface CompanyListProps {
  groupByStage?: boolean;
}

const pageSize = 24;

export function CompanyList({ groupByStage = true }: CompanyListProps) {
  const [companies, setCompanies] = useState<ReturnType<typeof toCompany>[]>(
    [],
  );
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDiscovering, setIsDiscovering] = useState(false);
  const [isRecalculating, setIsRecalculating] = useState(false);
  const [pageOffset, setPageOffset] = useState(0);
  const [totalCompanies, setTotalCompanies] = useState(0);
  const [offeredService, setOfferedService] = useState<OfferedService>(
    "website-design-development",
  );
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    state: "all",
    city: "",
    industry: "all",
    timingStage: "all",
    minScore: "",
    opportunityFilters: [],
  });
  const deferredFilters = useDeferredValue(filters);

  useEffect(() => {
    setPageOffset(0);
  }, [filters]);

  useEffect(() => {
    void loadBusinesses(deferredFilters, pageOffset);
  }, [deferredFilters, pageOffset]);

  const groupedCompanies = useMemo(() => {
    if (!groupByStage) {
      return null;
    }

    const groups: Record<TimingStage, typeof companies> = {
      "best-window": [],
      "warming-up": [],
      "too-early": [],
      "cooling-down": [],
      "old-lead": [],
    };

    companies.forEach((company) => {
      groups[company.timingStage].push(company);
    });

    return groups;
  }, [companies, groupByStage]);

  const stageOrder: TimingStage[] = [
    "best-window",
    "warming-up",
    "too-early",
    "cooling-down",
    "old-lead",
  ];
  const pageStart = totalCompanies === 0 ? 0 : pageOffset + 1;
  const pageEnd = Math.min(pageOffset + companies.length, totalCompanies);
  const hasPreviousPage = pageOffset > 0;
  const hasNextPage = pageOffset + companies.length < totalCompanies;

  async function loadBusinesses(
    activeFilters: FilterState,
    offset: number,
  ): Promise<void> {
    setIsLoading(true);
    setLoadError(null);

    try {
      const marketTarget = readKairosMarketTargetSession();
      const selectedService =
        marketTarget?.offeredService ?? "website-design-development";
      const page = await listKairosBusinessPage({
        city: activeFilters.city,
        industry: activeFilters.industry,
        limit: pageSize,
        minScore: activeFilters.minScore,
        offset,
        search: activeFilters.search,
        offeredService: selectedService,
        state: activeFilters.state === "all" ? undefined : activeFilters.state,
        timingStage: activeFilters.timingStage as TimingStage | "all",
      });
      setOfferedService(selectedService);
      setCompanies(page.items.map(toCompany));
      setTotalCompanies(page.total);
    } catch (error) {
      setLoadError(formatCompanyListError(error));
      setCompanies([]);
      setTotalCompanies(0);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleRecalculate(): Promise<void> {
    setIsRecalculating(true);

    try {
      await recalculateKairosTimingStages(resolveRecalculationState(filters));
      await loadBusinesses(deferredFilters, pageOffset);
    } catch (error) {
      setLoadError(formatCompanyListError(error));
    } finally {
      setIsRecalculating(false);
    }
  }

  async function handleDiscoverBusinesses(): Promise<void> {
    setIsDiscovering(true);
    setLoadError(null);

    try {
      await dispatchDiscoveryRequests(filters);
      await loadBusinesses(deferredFilters, pageOffset);
    } catch (error) {
      setLoadError(formatCompanyListError(error));
    } finally {
      setIsDiscovering(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <CompanyFilters onFilterChange={setFilters} />
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            className="h-10 gap-2"
            onClick={handleDiscoverBusinesses}
            disabled={isDiscovering}
          >
            <Database className="h-4 w-4" />
            {isDiscovering ? "Sync queued..." : "Sync state data"}
          </Button>
          <Button
            variant="outline"
            className="h-10 gap-2"
            onClick={handleRecalculate}
            disabled={isRecalculating}
          >
            <RefreshCw className="h-4 w-4" />
            {isRecalculating ? "Queued..." : "Recalculate timing"}
          </Button>
        </div>
      </div>

      {loadError && (
        <div className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {loadError}
        </div>
      )}

      <PaginationBar
        hasNextPage={hasNextPage}
        hasPreviousPage={hasPreviousPage}
        isLoading={isLoading}
        onNextPage={() => setPageOffset((current) => current + pageSize)}
        onPreviousPage={() =>
          setPageOffset((current) => Math.max(0, current - pageSize))
        }
        pageEnd={pageEnd}
        pageStart={pageStart}
        totalCompanies={totalCompanies}
      />

      {isLoading ? (
        <div className="surface-card rounded-lg p-12 text-center text-muted-foreground">
          Loading businesses...
        </div>
      ) : companies.length === 0 ? (
        <div className="surface-card rounded-lg p-12 text-center">
          <div className="mb-4 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <Building2 className="h-8 w-8 text-muted-foreground" />
            </div>
          </div>
          <h3 className="mb-2 text-lg font-semibold text-foreground">
            No companies found for this market yet.
          </h3>
          <p className="mx-auto max-w-md text-muted-foreground">
            Try expanding your city filter or check back after the next data
            refresh.
          </p>
        </div>
      ) : groupByStage && groupedCompanies ? (
        <div className="space-y-8">
          {stageOrder.map((stage) => {
            const stageCompanies = groupedCompanies[stage];

            if (stageCompanies.length === 0) {
              return null;
            }

            return (
              <div key={stage}>
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <h2 className="text-lg font-semibold text-foreground">
                      {getTimingStageLabel(stage)}
                    </h2>
                    <span className="text-sm text-muted-foreground">
                      {stageCompanies.length}{" "}
                      {stageCompanies.length === 1 ? "company" : "companies"}
                    </span>
                  </div>
                  <span className="text-xs font-medium uppercase tracking-normal text-muted-foreground">
                    Current page
                  </span>
                </div>
                <div className="space-y-3">
                  {stageCompanies.map((company) => (
                    <CompanyCard
                      key={company.id}
                      company={company}
                      offeredService={offeredService}
                    />
                  ))}
                </div>
              </div>
            );
          })}
          <PaginationBar
            hasNextPage={hasNextPage}
            hasPreviousPage={hasPreviousPage}
            isLoading={isLoading}
            onNextPage={() => setPageOffset((current) => current + pageSize)}
            onPreviousPage={() =>
              setPageOffset((current) => Math.max(0, current - pageSize))
            }
            pageEnd={pageEnd}
            pageStart={pageStart}
            totalCompanies={totalCompanies}
          />
        </div>
      ) : (
        <div className="space-y-3">
          {companies.map((company) => (
            <CompanyCard
              key={company.id}
              company={company}
              offeredService={offeredService}
            />
          ))}
          <PaginationBar
            hasNextPage={hasNextPage}
            hasPreviousPage={hasPreviousPage}
            isLoading={isLoading}
            onNextPage={() => setPageOffset((current) => current + pageSize)}
            onPreviousPage={() =>
              setPageOffset((current) => Math.max(0, current - pageSize))
            }
            pageEnd={pageEnd}
            pageStart={pageStart}
            totalCompanies={totalCompanies}
          />
        </div>
      )}
    </div>
  );
}

function PaginationBar({
  hasNextPage,
  hasPreviousPage,
  isLoading,
  onNextPage,
  onPreviousPage,
  pageEnd,
  pageStart,
  totalCompanies,
}: {
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  isLoading: boolean;
  onNextPage: () => void;
  onPreviousPage: () => void;
  pageEnd: number;
  pageStart: number;
  totalCompanies: number;
}) {
  return (
    <nav
      aria-label="Business result pages"
      className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-card px-4 py-3"
    >
      <div>
        <p className="text-sm font-medium text-foreground">
          Showing {pageStart}-{pageEnd} of {totalCompanies} companies
        </p>
        <p className="text-xs text-muted-foreground">
          24 per page, sorted by timing and service fit
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          className="h-9 gap-2"
          onClick={onPreviousPage}
          disabled={!hasPreviousPage || isLoading}
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="h-9 gap-2"
          onClick={onNextPage}
          disabled={!hasNextPage || isLoading}
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </nav>
  );
}

function resolveRecalculationState(filters: FilterState): string | undefined {
  if (filters.state !== "all") {
    return filters.state;
  }

  return readKairosMarketTargetSession()?.state;
}

async function dispatchDiscoveryRequests(filters: FilterState): Promise<void> {
  const states = resolveDiscoveryStates(filters);
  const industry = resolveDiscoveryIndustry(filters);

  await Promise.all(
    states.map((state) => discoverKairosBusinesses({ industry, state })),
  );
}

function resolveDiscoveryStates(filters: FilterState): readonly string[] {
  if (filters.state !== "all") {
    return [filters.state];
  }

  return usStateOptions.map((state) => state.abbreviation);
}

function resolveDiscoveryIndustry(filters: FilterState): string {
  if (filters.industry !== "all") {
    return filters.industry;
  }

  return readKairosMarketTargetSession()?.industry ?? "all";
}

function formatCompanyListError(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return "Unable to load businesses: received unknown error; expected Kairos API response";
}
