"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

type Listing = Record<string, unknown>;

export default function ListingsClient({
  listings: initialListings,
  q,
}: {
  listings: Listing[];
  q?: string;
}) {
  const router = useRouter();
  const [listings, setListings] = useState(initialListings);
  const [selected, setSelected] = useState<Set<string>>(
    () => new Set(initialListings.map((l) => l.id as string))
  );
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const selectAllRef = useRef<HTMLInputElement>(null);

  const allChecked = listings.length > 0 && selected.size === listings.length;
  const someChecked = selected.size > 0 && !allChecked;

  if (selectAllRef.current) {
    selectAllRef.current.indeterminate = someChecked;
  }

  function toggleAll() {
    if (allChecked || someChecked) {
      setSelected(new Set());
    } else {
      setSelected(new Set(listings.map((l) => l.id as string)));
    }
  }

  function toggleOne(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function handleDelete() {
    if (!deleteId) return;
    setDeleting(true);
    const supabase = createClient();
    const { error } = await supabase.from("listing").delete().eq("id", deleteId);
    if (!error) {
      setListings((prev) => prev.filter((l) => l.id !== deleteId));
      setSelected((prev) => {
        const next = new Set(prev);
        next.delete(deleteId);
        return next;
      });
    }
    setDeleteId(null);
    setDeleting(false);
    router.refresh();
  }

  function handleExport() {
    const toExport =
      selected.size > 0 ? listings.filter((l) => selected.has(l.id as string)) : listings;
    const headers = ["Comic Series", "Issue", "Publisher", "Year", "Listing", "Listed Date"];
    const rows = toExport.map((l) => {
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
    const csv = [
      headers.join(","),
      ...rows.map((r) =>
        r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")
      ),
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ebay-comic-listings-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  if (listings.length === 0) {
    return (
      <div className="rounded-xl border border-stone-200 bg-white p-12 text-center text-stone-500">
        {q ? (
          <>No listings match your search. Try a different keyword.</>
        ) : (
          <>
            <p className="mb-4">You don&apos;t have any listings yet.</p>
            <Link href="/listings/new" className="text-amber-600 hover:underline">
              Add your first listing
            </Link>
          </>
        )}
      </div>
    );
  }

  return (
    <>
      <h4 className="mb-2 ml-4 text-blue-600">
        {selected.size} selected out of {listings.length} Listing(s)
      </h4>

      {/* Delete confirmation modal */}
      {deleteId && (() => {
        const target = listings.find((l) => l.id === deleteId);
        const s = target?.series as Record<string, unknown> | null;
        const listingName = `${(s?.seriesname as string) ?? "Unknown"} #${target?.issuenumber as string}`;
        return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="mx-4 w-full max-w-sm rounded-xl bg-white p-6 shadow-lg">
            <h2 className="mb-2 text-lg font-semibold text-stone-900">Delete Listing?</h2>
            <p className="mb-1 text-sm font-medium text-stone-800">{listingName}</p>
            <p className="mb-6 text-sm text-stone-600">This action cannot be undone.</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="rounded-lg border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 hover:bg-stone-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
        );
      })()}

      <div className="overflow-hidden rounded-xl border border-stone-200 bg-white">
        {/* Select-all header */}
        <div className="flex items-center gap-3 border-b border-stone-200 bg-stone-50 px-4 py-2 sm:px-6">
          <input
            ref={selectAllRef}
            type="checkbox"
            checked={allChecked}
            onChange={toggleAll}
            className="h-4 w-4 rounded border-stone-300 accent-amber-600"
          />
          <span className="text-xs text-stone-500">Select all</span>
          <input
            type="checkbox"
            checked={selected.size === 0}
            onChange={() => setSelected(new Set())}
            className="h-4 w-4 rounded border-stone-300 accent-amber-600"
          />
          <span className="text-xs text-stone-500">Select none</span>
          <button
            onClick={handleExport}
            className="ml-auto rounded-lg border border-stone-300 px-3 py-1 text-xs font-medium text-stone-700 hover:bg-stone-100"
          >
            {selected.size > 0 ? `Export Selected (${selected.size})` : "Export CSV"}
          </button>
        </div>

        <ul className="divide-y divide-stone-100">
          {listings.map((l) => {
            const id = l.id as string;
            const series = l.series as Record<string, unknown> | null;
            const publisher = series?.publisher as Record<string, unknown> | null;
            return (
              <li key={id} className="flex items-center gap-3 px-4 py-4 hover:bg-stone-50 sm:px-6">
                <input
                  type="checkbox"
                  checked={selected.has(id)}
                  onChange={() => toggleOne(id)}
                  className="h-4 w-4 rounded border-stone-300 accent-amber-600"
                />
                <div className="flex flex-1 flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <span className="font-medium text-stone-900">
                      {(series?.seriesname as string) ?? "Unknown"} #{l.issuenumber as string}
                    </span>
                    {!!publisher?.publishername && (
                      <span className="ml-2 text-sm text-stone-500">
                        ({publisher.publishername as string})
                      </span>
                    )}
                  </div>
                  <span className="text-sm text-stone-500">
                    {l.listed_date
                      ? new Date(l.listed_date as string).toLocaleDateString()
                      : "Not listed"}
                  </span>
                </div>
                <div className="ml-2 flex items-center gap-3">
                  <Link
                    href={`/listings/${id}`}
                    className="text-sm font-medium text-amber-600 hover:underline"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => setDeleteId(id)}
                    className="text-sm font-medium text-red-600 hover:underline"
                  >
                    Delete
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </>
  );
}
