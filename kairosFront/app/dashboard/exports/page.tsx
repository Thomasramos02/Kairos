"use client";

import { useState } from "react";
import { Check, Download, FileSpreadsheet } from "lucide-react";

import { Button } from "@/components/ui/button";
import { exportKairosWatchlistCsv } from "@/lib/business-api";
import { getOrFetchAccount } from "@/lib/account-session";

const exportFields = [
  { id: "id", label: "Business ID", checked: true },
  { id: "source_document_number", label: "Registry ID", checked: true },
  { id: "company_name", label: "Company name", checked: true },
  { id: "registered_at", label: "Registered date", checked: true },
  { id: "age_days", label: "Age days", checked: true },
  { id: "state", label: "State", checked: true },
  { id: "city", label: "City", checked: true },
  { id: "industry", label: "Industry", checked: true },
  { id: "timing_stage", label: "Timing stage", checked: true },
  { id: "timing_score", label: "Timing score", checked: true },
  { id: "website_status", label: "Website status", checked: true },
  { id: "digital_presence_status", label: "Digital presence", checked: true },
  { id: "contact_detected", label: "Contact detected", checked: true },
  { id: "opportunity_filters", label: "Opportunity filters", checked: true },
  { id: "source", label: "Source", checked: true },
  {
    id: "recommendation_strength",
    label: "Recommendation strength",
    checked: true,
  },
  { id: "reason", label: "Timing reasoning", checked: true },
  { id: "signals_count", label: "Signals count", checked: true },
];

export default function ExportsPage() {
  const [exportError, setExportError] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [exported, setExported] = useState(false);

  const handleExport = async () => {
    const account = await getOrFetchAccount();

    if (account === null) {
      setExportError("Sign in again to export watchlist businesses.");
      return;
    }

    setIsExporting(true);
    setExportError(null);

    try {
      const response = await exportKairosWatchlistCsv(account.id);
      downloadCsv(response.fileName, response.csv, response.contentType);
      setExported(true);
      window.setTimeout(() => setExported(false), 2000);
    } catch (error) {
      setExportError(formatExportError(error));
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Exports</h1>
        <p className="mt-1 text-muted-foreground">
          Export your saved watchlist businesses as CSV for review or CRM
          import.
        </p>
      </div>

      {exportError && (
        <div className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {exportError}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
        <section className="surface-card rounded-lg p-6">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Download className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">
                Export Watchlist Leads
              </h2>
              <p className="text-sm text-muted-foreground">
                Export includes all required MVP fields, including source and
                timing score.
              </p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {exportFields.map((field) => (
              <div
                key={field.id}
                className="rounded-lg border border-border bg-muted/30 px-3 py-2"
              >
                <p className="text-sm font-medium text-foreground">
                  {field.label}
                </p>
                <p className="text-xs text-muted-foreground">{field.id}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 flex justify-end border-t border-border pt-4">
            <Button
              className="gap-2"
              onClick={handleExport}
              disabled={isExporting}
            >
              {exported ? (
                <Check className="h-4 w-4" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              {isExporting
                ? "Exporting..."
                : exported
                  ? "Exported"
                  : "Export CSV"}
            </Button>
          </div>
        </section>

        <aside className="surface-card rounded-lg p-6">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
            <FileSpreadsheet className="h-6 w-6 text-primary" />
          </div>
          <h2 className="text-lg font-semibold text-foreground">CSV scope</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            This export contains only businesses saved in your watchlist.
          </p>
        </aside>
      </div>
    </div>
  );
}

function downloadCsv(fileName: string, csv: string, contentType: string): void {
  const blob = new Blob([csv], { type: `${contentType};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function formatExportError(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return "Unable to export businesses: received unknown error; expected Kairos API response";
}
