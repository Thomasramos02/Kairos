"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Bookmark,
  Calendar,
  Check,
  Copy,
  ExternalLink,
  Facebook,
  FileText,
  Instagram,
  Linkedin,
  MapPin,
  Music2,
  Twitter,
} from "lucide-react";

import { TimingBadge } from "@/components/dashboard/timing-badge";
import { CompanyIndustryEnrichment } from "@/components/dashboard/company-industry-enrichment";
import {
  CompanyContactOptions,
  ContactMethodList,
} from "@/components/dashboard/company-contact-options";
import { Button } from "@/components/ui/button";
import { OfferedService } from "@/lib/account-api";
import {
  createKairosOutreachSuggestion,
  getKairosBusiness,
  listKairosTimingHistory,
  saveKairosWatchlistItem,
  TimingStageHistoryEntry,
  toCompany,
} from "@/lib/business-api";
import { getOrFetchAccount } from "@/lib/account-session";
import {
  buildCompanyScoreMetrics,
  buildRecommendationContext,
  buildServiceRecommendationLabel,
  formatDigitalSignalName,
} from "@/lib/business-display";
import { readKairosMarketTargetSession } from "@/lib/market-target-session";
import { copyToClipboard } from "@/lib/mock-actions";
import {
  Company,
  getTimingStageDescription,
  getTimingStageLabel,
} from "@/lib/types";

export default function CompanyDetailPage() {
  return (
    <Suspense fallback={<DetailState message="Loading company detail..." />}>
      <CompanyDetailContent />
    </Suspense>
  );
}

function CompanyDetailContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  const [company, setCompany] = useState<Company | null>(null);
  const [history, setHistory] = useState<readonly TimingStageHistoryEntry[]>(
    [],
  );
  const [loadError, setLoadError] = useState<string | null>(null);
  const [outreachError, setOutreachError] = useState<string | null>(null);
  const [outreachMessage, setOutreachMessage] = useState<string | null>(null);
  const [isOutreachLoading, setIsOutreachLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);
  useEffect(() => {
    if (!id) {
      setLoadError("Company id is missing.");
      return;
    }

    void loadCompanyDetail(id);
  }, [id]);
  useEffect(() => {
    if (company === null) return;

    void loadSuggestedOutreach(company);
  }, [company?.id]);

  const loadCompanyDetail = async (businessId: string) => {
    try {
      const [business, stageHistory] = await Promise.all([
        getKairosBusiness(businessId, {
          offeredService: resolveConfiguredOfferedService(),
        }),
        listKairosTimingHistory(businessId),
      ]);
      setCompany(toCompany(business));
      setHistory(stageHistory);
    } catch (error) {
      setLoadError(formatCompanyDetailError(error));
    }
  };

  const handleCopyMessage = async () => {
    if (company === null) return;

    try {
      const message = outreachMessage ?? (await loadOutreachMessage(company));
      await copyToClipboard(message);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      setOutreachError(formatCompanyDetailError(error));
    }
  };

  const handleSave = async () => {
    const account = await getOrFetchAccount();

    if (account === null || company === null) {
      setLoadError("Sign in again to save this company.");
      return;
    }

    try {
      await saveKairosWatchlistItem(
        account.id,
        company.id,
      );
      setSaved(true);
    } catch (error) {
      setLoadError(formatCompanyDetailError(error));
    }
  };

  const loadOutreachMessage = async (
    selectedCompany: Company,
  ): Promise<string> => {
    const suggestion = await createKairosOutreachSuggestion(
      selectedCompany,
      resolveConfiguredOfferedService(),
    );
    setOutreachMessage(suggestion.message);
    return suggestion.message;
  };

  const loadSuggestedOutreach = async (
    selectedCompany: Company,
  ): Promise<void> => {
    setIsOutreachLoading(true);
    setOutreachError(null);

    try {
      await loadOutreachMessage(selectedCompany);
    } catch (error) {
      setOutreachError(formatCompanyDetailError(error));
    } finally {
      setIsOutreachLoading(false);
    }
  };

  if (loadError) {
    return <DetailState message={loadError} />;
  }

  if (company === null) {
    return <DetailState message="Loading company detail..." />;
  }

  const recommendation = buildRecommendationContext(company);
  const offeredService = resolveConfiguredOfferedService();
  const serviceRecommendation = buildServiceRecommendationLabel(
    company,
    offeredService,
  );

  return (
    <div className="space-y-8">
      <Button
        variant="ghost"
        size="sm"
        asChild
        className="text-muted-foreground"
      >
        <Link href="/dashboard/businesses">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to businesses
        </Link>
      </Button>

      <section className="surface-card rounded-lg p-6">
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-start">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {company.name}
            </h1>
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-2 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {company.location.city}, {company.location.state}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {company.ageInDays} days old
              </span>
              <span className="flex items-center gap-1">
                <FileText className="h-4 w-4" />
                {company.source}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <TimingBadge stage={company.timingStage} />
            <div className="text-right">
              <p className="text-3xl font-bold">{company.timingScore}</p>
              <p className="text-xs text-muted-foreground">Timing Score</p>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
        <div className="space-y-6">
          <Section title="Why this is relevant">
            <div className="space-y-4">
              <p className="text-sm text-foreground">{recommendation.whyNow}</p>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <ContextMetric
                  label="Primary signal"
                  value={recommendation.primarySignalLabel}
                />
                <ContextMetric
                  label="Recommended Action"
                  value={recommendation.actionLabel}
                />
                <ContextMetric
                  label="Service fit"
                  value={serviceRecommendation}
                />
                <ContextMetric
                  label="Confidence"
                  value={recommendation.confidenceLabel}
                />
              </div>
              <p className="text-sm text-muted-foreground">
                {recommendation.noPredictionNotice} It only explains why this
                moment may be more relevant for your selected service.
              </p>
            </div>
          </Section>

          <Section title="Timing analysis">
            <p className="text-sm text-muted-foreground">
              {company.reason ?? getTimingStageDescription(company.timingStage)}
            </p>
            <p className="mt-3 text-sm text-muted-foreground">
              Score is service-aware and uses age, digital signals, confidence,
              and the selected service. It does not predict purchase intent.
            </p>
          </Section>

          <Section title="Timing Score Breakdown">
            {buildCompanyScoreMetrics(company).map((metric) => (
              <InfoRow
                key={metric.label}
                label={metric.label}
                value={`${metric.value} - ${metric.description}`}
              />
            ))}
          </Section>

          <Section title="Contact options">
            <CompanyContactOptions company={company} />
          </Section>

          <Section title="Digital signals">
            {company.digitalSignals && company.digitalSignals.length > 0 ? (
              <div className="grid gap-3">
                {company.digitalSignals.map((signal) => (
                  <div
                    key={signal.signalName}
                    className="rounded-lg border border-border p-3"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-medium text-foreground">
                        {formatDigitalSignalName(signal.signalName)}
                      </p>
                      <span className="text-sm text-muted-foreground">
                        {signal.confidenceScore}% confidence
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Source: {signal.sourceName}. Impact:{" "}
                      {signal.serviceImpact}.
                    </p>
                    <SignalMetadata metadata={signal.metadata} />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No digital signals recorded yet.
              </p>
            )}
          </Section>

          <Section title="Timing stage history">
            {history.length > 0 ? (
              <div className="space-y-3">
                {history.map((entry) => (
                  <div
                    key={entry.id}
                    className="rounded-lg border border-border p-3"
                  >
                    <p className="text-sm font-medium">
                      {entry.previousStage
                        ? getTimingStageLabel(entry.previousStage)
                        : "Initial"}{" "}
                      to {getTimingStageLabel(entry.nextStage)}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Score {entry.timingScore}. {entry.reason}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {new Date(entry.changedAt).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No stage changes recorded yet.
              </p>
            )}
          </Section>

          <Section title="Suggested Outreach">
            <OutreachMessagePanel
              error={outreachError}
              isLoading={isOutreachLoading}
              message={outreachMessage}
            />
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              disabled={isOutreachLoading}
              onClick={handleCopyMessage}
            >
              {copied ? (
                <Check className="h-4 w-4" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
              {copied ? "Copied outreach" : "Copy outreach"}
            </Button>
          </Section>
        </div>

        <aside className="space-y-4">
          <Section title="Actions">
            <div className="space-y-3">
              <Button
                className="w-full justify-start gap-2"
                onClick={handleSave}
              >
                {saved ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Bookmark className="h-4 w-4" />
                )}
                {saved ? "Saved to Watchlist" : "Save to Watchlist"}
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start gap-2"
                disabled={isOutreachLoading}
                onClick={handleCopyMessage}
              >
                {copied ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
                {copied ? "Copied outreach" : "Copy outreach"}
              </Button>
            </div>
          </Section>

          <Section title="Company information">
            <CompanyIndustryEnrichment
              companyId={company.id}
              sourceDocumentNumber={company.sourceDocumentNumber}
              state={company.location.state}
            />
            <InfoRow
              label="Registered Date"
              value={company.registeredDate.toLocaleDateString()}
            />
            <InfoRow label="Age" value={`${company.ageInDays} days`} />
            <InfoRow label="State" value={company.location.state} />
            <InfoRow label="City" value={company.location.city} />
            <InfoRow label="Industry" value={company.industry} />
            <InfoRow
              label="Registry ID"
              value={company.sourceDocumentNumber ?? "Not available"}
            />
            <InfoRow label="Source" value={company.source} />
            <InfoRow
              label="Stage"
              value={getTimingStageLabel(company.timingStage)}
            />
            <InfoRow
              label="Signals"
              value={String(company.digitalSignals?.length ?? 0)}
            />
          </Section>
        </aside>
      </div>
    </div>
  );
}

function SignalMetadata({
  metadata,
}: {
  metadata: NonNullable<Company["digitalSignals"]>[number]["metadata"];
}) {
  const hasTechnologies = (metadata.technologies?.length ?? 0) > 0;
  const hasSocialProfiles = (metadata.socialProfiles?.length ?? 0) > 0;
  const hasContactMethods = (metadata.contactMethods?.length ?? 0) > 0;

  if (
    !hasTechnologies &&
    !hasSocialProfiles &&
    !hasContactMethods &&
    metadata.websiteUrl === undefined
  ) {
    return null;
  }

  return (
    <div className="mt-3 space-y-2">
      {metadata.websiteUrl && (
        <a
          href={metadata.websiteUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 text-xs font-medium text-primary"
        >
          <ExternalLink className="h-3.5 w-3.5" />
          Website source
        </a>
      )}
      {hasContactMethods && (
        <ContactMethodList contacts={metadata.contactMethods ?? []} />
      )}
      {hasTechnologies && (
        <TechnologyList technologies={metadata.technologies ?? []} />
      )}
      {hasSocialProfiles && (
        <SocialProfileList profiles={metadata.socialProfiles ?? []} />
      )}
    </div>
  );
}

function TechnologyList({ technologies }: { technologies: readonly string[] }) {
  return (
    <div className="flex flex-wrap gap-2">
      {technologies.map((technology) => (
        <span
          key={technology}
          className="rounded-full border border-border px-2 py-0.5 text-xs text-muted-foreground"
        >
          {technology}
        </span>
      ))}
    </div>
  );
}

function SocialProfileList({
  profiles,
}: {
  profiles: NonNullable<
    NonNullable<Company["digitalSignals"]>[number]["metadata"]["socialProfiles"]
  >;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {profiles.map((profile) => (
        <a
          key={`${profile.network}-${profile.url}`}
          href={profile.url}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 rounded-full border border-border px-2 py-0.5 text-xs font-medium text-muted-foreground hover:text-primary"
        >
          <SocialIcon network={profile.network} />
          {profile.network}
        </a>
      ))}
    </div>
  );
}

function SocialIcon({ network }: { network: string }) {
  if (network === "instagram") return <Instagram className="h-3.5 w-3.5" />;
  if (network === "facebook") return <Facebook className="h-3.5 w-3.5" />;
  if (network === "linkedin") return <Linkedin className="h-3.5 w-3.5" />;
  if (network === "tiktok") return <Music2 className="h-3.5 w-3.5" />;
  return <Twitter className="h-3.5 w-3.5" />;
}

function ContextMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-lg border border-border bg-background/50 px-4 py-3 shadow-sm transition-all hover:shadow-md hover:border-primary/30">
      <p className="text-xs font-medium uppercase text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 text-sm font-semibold text-foreground break-words">
        {value}
      </p>
    </div>
  );
}

function resolveConfiguredOfferedService(): OfferedService {
  return (
    readKairosMarketTargetSession()?.offeredService ??
    "website-design-development"
  );
}

function OutreachMessagePanel({
  error,
  isLoading,
  message,
}: {
  error: string | null;
  isLoading: boolean;
  message: string | null;
}) {
  if (error !== null) {
    return (
      <div className="mb-4 rounded-lg bg-destructive/10 p-4 text-sm text-destructive">
        {error}
      </div>
    );
  }

  return (
    <div className="mb-4 rounded-lg bg-muted/50 p-4 font-mono text-sm whitespace-pre-wrap">
      {isLoading
        ? "Generating suggested outreach..."
        : (message ?? "Suggested outreach is unavailable.")}
    </div>
  );
}

function Section({
  children,
  title,
}: {
  children: React.ReactNode;
  title: string;
}) {
  return (
    <section className="surface-card rounded-lg p-6">
      <h2 className="mb-4 text-lg font-semibold text-foreground">{title}</h2>
      {children}
    </section>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between border-b border-border py-2 last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-right text-sm font-medium">{value}</span>
    </div>
  );
}

function DetailState({ message }: { message: string }) {
  return (
    <div className="surface-card rounded-lg p-12 text-center text-muted-foreground">
      {message}
    </div>
  );
}

function formatCompanyDetailError(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return "Unable to load company detail: received unknown error; expected Kairos API response";
}
