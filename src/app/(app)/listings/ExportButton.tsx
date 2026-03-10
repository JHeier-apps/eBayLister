"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function ExportButton() {
  const [loading, setLoading] = useState(false);

  async function handleExport() {
    setLoading(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data: listings, error } = await supabase
      .from("listing")
      .select(
        `
        id,
        issuenumber,
        listing,
        listed_date,
        series (
          seriesname,
          starting_year,
          publisher (publishername)
        )
      `
      )
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error || !listings) {
      setLoading(false);
      return;
    }

    const headers = ["Series", "Issue", "Publisher", "Year", "Listing", "Listed Date"];
    const rows = listings.map((l: Record<string, unknown>) => {
      const s = l.series as Record<string, unknown> | null;
      const p = s?.publisher as Record<string, unknown> | null;
      return [
        s?.seriesname ?? "",
        l.issuenumber ?? "",
        p?.publishername ?? "",
        s?.starting_year ?? "",
        l.listing ?? "",
        l.listed_date ? new Date(l.listed_date as string).toLocaleDateString() : "",
      ];
    });

    const csv = [headers.join(","), ...rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ebay-comic-listings-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    setLoading(false);
  }

  return (
    <button
      onClick={handleExport}
      disabled={loading}
      className="rounded-lg border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 hover:bg-stone-100 disabled:opacity-50"
    >
      {loading ? "Exporting..." : "Export CSV"}
    </button>
  );
}
