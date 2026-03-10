"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

type SeriesOption = {
  id: string;
  seriesname: string;
  starting_year: number | null;
  publisher: { publishername: string } | null;
};

export default function ListingForm({
  series,
  listing,
  mode = "create",
}: {
  series: SeriesOption[];
  listing?: {
    id: string;
    series_id: string;
    issuenumber: string;
    listing: string | null;
    listed_date: string | null;
  };
  mode?: "create" | "edit";
}) {
  const router = useRouter();
  const [seriesId, setSeriesId] = useState(listing?.series_id ?? "");
  const [issueNumber, setIssueNumber] = useState(listing?.issuenumber ?? "");
  const [listingText, setListingText] = useState(listing?.listing ?? "");
  const [listedDate, setListedDate] = useState(
    listing?.listed_date
      ? new Date(listing.listed_date).toISOString().slice(0, 10)
      : ""
  );
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const payload = {
      user_id: user.id,
      series_id: seriesId,
      issuenumber: issueNumber.trim(),
      listing: listingText.trim() || null,
      listed_date: listedDate ? new Date(listedDate).toISOString() : null,
      updated_at: new Date().toISOString(),
    };

    if (mode === "edit" && listing) {
      const { error: err } = await supabase
        .from("listing")
        .update(payload)
        .eq("id", listing.id);
      if (err) {
        setError(err.message);
        setLoading(false);
        return;
      }
    } else {
      const { error: err } = await supabase.from("listing").insert(payload);
      if (err) {
        setError(err.message);
        setLoading(false);
        return;
      }
    }

    router.push("/listings");
    router.refresh();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border border-stone-200 bg-white p-6"
    >
      {error && (
        <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}
      <div className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-stone-700">
            Series
          </label>
          <div className="flex gap-2">
            <select
              value={seriesId}
              onChange={(e) => setSeriesId(e.target.value)}
              required
              className="flex-1 rounded-lg border border-stone-300 px-4 py-2 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
            >
              <option value="">Select series...</option>
              {series.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.seriesname}
                  {s.starting_year ? ` (${s.starting_year})` : ""}
                  {s.publisher?.publishername ? ` - ${s.publisher.publishername}` : ""}
                </option>
              ))}
            </select>
            <Link
              href="/series"
              className="rounded-lg border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 hover:bg-stone-50"
            >
              Add / Edit
            </Link>
          </div>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-stone-700">
            Issue Number
          </label>
          <input
            type="text"
            value={issueNumber}
            onChange={(e) => setIssueNumber(e.target.value)}
            required
            className="w-full rounded-lg border border-stone-300 px-4 py-2 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-stone-700">
            Listing (description)
          </label>
          <textarea
            value={listingText}
            onChange={(e) => setListingText(e.target.value)}
            rows={4}
            className="w-full rounded-lg border border-stone-300 px-4 py-2 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-stone-700">
            Listed Date (optional)
          </label>
          <input
            type="date"
            value={listedDate}
            onChange={(e) => setListedDate(e.target.value)}
            className="w-full rounded-lg border border-stone-300 px-4 py-2 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
          />
        </div>
        <div className="flex gap-2 pt-2">
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-amber-600 px-4 py-2 font-medium text-white hover:bg-amber-700 disabled:opacity-50"
          >
            {loading ? "Saving..." : mode === "edit" ? "Update" : "Create"} Listing
          </button>
          <Link
            href="/listings"
            className="rounded-lg border border-stone-300 px-4 py-2 font-medium text-stone-700 hover:bg-stone-50"
          >
            Cancel
          </Link>
        </div>
      </div>
    </form>
  );
}
