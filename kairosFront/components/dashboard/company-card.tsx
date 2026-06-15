"use client";

import type { ComponentType } from "react";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Bookmark,
  Building2,
  Calendar,
  Check,
  Eye,
  Globe2,
  Mail,
  MapPin,
  MessageSquareText,
  SearchCheck,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { OfferedService } from "@/lib/account-api";
import { getOrFetchAccount } from "@/lib/account-session";
import {
  createKairosOutreachSuggestion,
  saveKairosWatchlistItem,
} from "@/lib/business-api";
import {
  buildRecommendationContext,
  buildServiceRecommendationLabel,
} from "@/lib/business-display";
import { copyToClipboard } from "@/lib/mock-actions";
import { type Company } from "@/lib/types";
import { TimingBadge } from "./timing-badge";

interface CompanyCardProps {
  company: Company;
  initiallySaved?: boolean;
  offeredService: OfferedService;
  onSaved?: (businessId: string) => void;
}

export function CompanyCard({
  company,
  initiallySaved = false,
  offeredService,
  onSaved,
}: CompanyCardProps) {
  const [saved, setSaved] = useState(initiallySaved);
  const [isSaving, setIsSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const recommendation = buildRecommendationContext(company);
  const serviceRecommendation = buildServiceRecommendationLabel(
    company,
    offeredService,
  );
  const formattedDate = formatRegisteredDate(company.registeredDate);

  useEffect(() => {
    setSaved(initiallySaved);
  }, [initiallySaved]);

  const handleCopyOutreach = async () => {
    try {
      const suggestion = await createKairosOutreachSuggestion(
        company,
        offeredService,
      );
      await copyToClipboard(suggestion.message);
      setCopied(true);
      setSaveError(null);
      window.setTimeout(() => setCopied(false), 1800);
    } catch (error) {
      setSaveError(formatCompanyCardError(error));
    }
  };

  const handleSaveToWatchlist = async () => {
    const account = await getOrFetchAccount();

    if (account === null) {
      setSaveError("Sign in again to save this company.");
      return;
    }

    setIsSaving(true);

    try {
      await saveKairosWatchlistItem(
        account.id,
        company.id,
      );
      setSaved(true);
      onSaved?.(company.id);
      setSaveError(null);
    } catch (error) {
      setSaveError(formatCompanyCardError(error));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <article className="surface-card rounded-lg border border-border p-4 transition-colors hover:border-primary/30">
      <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-center">
        <div className="min-w-0">
          <CompanyCardHeader company={company} />
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <TimingBadge stage={company.timingStage} size="sm" />
            <OpportunityBadges filters={company.opportunityFilters} />
            <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
              {serviceRecommendation}
            </span>
            <span className="text-xs text-muted-foreground">
              Registered {formattedDate}
            </span>
          </div>
          <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">
            {recommendation.actionLabel}: {recommendation.whyNow}
          </p>
          <OpportunitySnapshot company={company} />
          {saveError && (
            <p className="mt-3 text-sm text-destructive">{saveError}</p>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 lg:justify-end">
          <TimingScore value={company.timingScore} />
          <CompanyCardActions
            copied={copied}
            isSaving={isSaving}
            onCopyOutreach={handleCopyOutreach}
            onSave={handleSaveToWatchlist}
            saved={saved}
            companyId={company.id}
          />
        </div>
      </div>
    </article>
  );
}

function OpportunityBadges({ filters }: { filters: readonly string[] }) {
  return (
    <>
      {filters.slice(0, 3).map((filter) => (
        <span
          key={filter}
          className="rounded-full border border-border bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground"
        >
          {formatOpportunityFilter(filter)}
        </span>
      ))}
    </>
  );
}

function OpportunitySnapshot({ company }: { company: Company }) {
  const opportunity = company.opportunity;

  return (
    <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
      <OpportunityFact
        icon={Globe2}
        label="Needs website?"
        value={opportunity.websiteStatus}
      />
      <OpportunityFact
        icon={SearchCheck}
        label="Digital presence?"
        value={opportunity.digitalPresenceStatus}
      />
      <OpportunityFact
        icon={Mail}
        label="Contactable?"
        value={opportunity.contactDetected ? "Contact detected" : "No contact yet"}
      />
      <OpportunityFact
        icon={MessageSquareText}
        label="Why now?"
        value={opportunity.opportunityReason}
      />
    </div>
  );
}

function OpportunityFact({
  icon: Icon,
  label,
  value,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-muted/35 p-3">
      <div className="mb-2 flex items-center gap-2 text-xs font-medium text-muted-foreground">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </div>
      <p className="line-clamp-2 text-sm font-medium text-foreground">{value}</p>
    </div>
  );
}

function CompanyCardHeader({ company }: { company: Company }) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-sm font-semibold text-primary">
        {company.name.charAt(0)}
      </div>
      <div className="min-w-0 flex-1">
        <Link
          href={`/dashboard/company?id=${encodeURIComponent(company.id)}`}
          className="line-clamp-1 text-base font-semibold text-foreground transition-colors hover:text-primary"
        >
          {company.name}
        </Link>
        <CompanyCardMetadata company={company} />
      </div>
    </div>
  );
}

function CompanyCardMetadata({ company }: { company: Company }) {
  return (
    <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
      <span className="inline-flex items-center gap-1">
        <MapPin className="h-3.5 w-3.5" />
        {company.location.city}, {company.location.state}
      </span>
      <span className="inline-flex items-center gap-1">
        <Building2 className="h-3.5 w-3.5" />
        {company.industry}
      </span>
      <span className="inline-flex items-center gap-1">
        <Calendar className="h-3.5 w-3.5" />
        {company.ageInDays} days old
      </span>
    </div>
  );
}

function TimingScore({ value }: { value: number }) {
  return (
    <div className="min-w-20 lg:text-right">
      <p className="text-2xl font-bold leading-none text-foreground">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">Timing Score</p>
    </div>
  );
}

function CompanyCardActions({
  copied,
  companyId,
  isSaving,
  onCopyOutreach,
  onSave,
  saved,
}: {
  copied: boolean;
  companyId: string;
  isSaving: boolean;
  onCopyOutreach: () => void;
  onSave: () => void;
  saved: boolean;
}) {
  return (
    <div className="flex items-center gap-2">
      <Button
        variant={saved ? "default" : "outline"}
        size="sm"
        className="h-10 gap-2"
        title={saved ? "Saved to Watchlist" : "Save to Watchlist"}
        aria-label={saved ? "Saved to Watchlist" : "Save to Watchlist"}
        onClick={onSave}
        disabled={isSaving || saved}
      >
        {saved ? (
          <Check className="h-4 w-4" />
        ) : (
          <Bookmark className="h-4 w-4" />
        )}
        <span className="hidden sm:inline">
          {isSaving ? "Saving..." : saved ? "Saved" : "Save"}
        </span>
      </Button>
      <Button
        variant="outline"
        size="sm"
        className="h-10 gap-2"
        asChild
        title="View Details"
      >
        <Link href={`/dashboard/company?id=${encodeURIComponent(companyId)}`}>
          <Eye className="h-4 w-4" />
          <span className="hidden sm:inline">Details</span>
        </Link>
      </Button>
      <Button
        variant="outline"
        size="sm"
        className="h-10 gap-2"
        onClick={onCopyOutreach}
        title={copied ? "Copied" : "Copy Outreach"}
        aria-label={
          copied ? "Copied outreach message" : "Copy outreach message"
        }
      >
        {copied ? <Check className="h-4 w-4" /> : <Mail className="h-4 w-4" />}
        <span className="hidden sm:inline">{copied ? "Copied" : "Copy"}</span>
      </Button>
    </div>
  );
}

function formatRegisteredDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatOpportunityFilter(filter: string): string {
  const labels: Record<string, string> = {
    "contact-detected": "Contact detected",
    "high-confidence": "High confidence",
    "local-business": "Local business",
    "new-entity-under-30-days": "New entity under 30 days",
    "no-website-detected": "No website detected",
  };

  return labels[filter] ?? filter;
}

function formatCompanyCardError(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return "Unable to save company: received unknown error; expected Kairos API response";
}
