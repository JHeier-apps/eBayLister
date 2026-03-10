import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import SearchForm from "./SearchForm";
import SortSelect from "./SortSelect";
import NotListedOnlyCheckbox from "./NotListedOnlyCheckbox";
import ListingsClient from "./ListingsClient";


export default async function ListingsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; sort?: string; not_listed_only?: string }>;
}) {
  const { q, sort, not_listed_only } = await searchParams;
  const notListedOnly = not_listed_only !== "0";
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  let query = supabase
    .from("listing")
    .select(
      `
      id,
      issuenumber,
      listing,
      created_at,
      listed_date,
      series (
        id,
        seriesname,
        starting_year,
        publisher (
          id,
          publishername
        )
      )
    `
    )
    .eq("user_id", user.id);

  if (notListedOnly) {
    query = query.is("listed_date", null);
  }

  if (sort === "oldest") {
    query = query.order("created_at", { ascending: true });
  } else {
    query = query.order("created_at", { ascending: false });
  }

  const { data: rawListings, error } = await query;

  const rawSorted =
    rawListings && (sort === "name" || sort === "name_desc")
      ? [...rawListings].sort((a: Record<string, unknown>, b: Record<string, unknown>) => {
          const aSeries = a.series as Record<string, unknown> | null;
          const bSeries = b.series as Record<string, unknown> | null;
          const aName = `${aSeries?.seriesname ?? ""} #${a.issuenumber ?? ""}`;
          const bName = `${bSeries?.seriesname ?? ""} #${b.issuenumber ?? ""}`;
          const cmp = aName.localeCompare(bName);
          return sort === "name_desc" ? -cmp : cmp;
        })
      : rawListings;

  const listings = q?.trim()
    ? rawSorted?.filter((l: Record<string, unknown>) => {
        const series = l.series as Record<string, unknown> | null;
        const publisher = series?.publisher as Record<string, unknown> | null;
        const haystack = [series?.seriesname, publisher?.publishername, l.issuenumber, l.listing]
          .filter(Boolean).join(" ").toLowerCase();
        return q.trim().toLowerCase().split(/\s+/).every(word => haystack.includes(word));
      })
    : rawSorted;

  if (error) {
    return (
      <div className="rounded-lg bg-red-50 p-4 text-red-700">
        Error loading listings: {error.message}
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-stone-900">My Listings</h1>
        <div className="flex flex-wrap items-center gap-4">
          <NotListedOnlyCheckbox checked={notListedOnly} />
          <SortSelect value={(sort === "name" || sort === "name_desc" || sort === "oldest") ? sort : "newest"} />
          <SearchForm defaultValue={q ?? ""} />
          <Link
            href="/listings/new"
            className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700"
          >
            Add Listing
          </Link>
        </div>
      </div>

      <ListingsClient listings={listings ?? []} q={q} />
    </div>
  );
}
