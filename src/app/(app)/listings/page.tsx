import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import SearchForm from "./SearchForm";
import ExportButton from "./ExportButton";

export default async function ListingsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
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
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (q && q.trim()) {
    const term = `%${q.trim()}%`;
    query = query.or(`issuenumber.ilike.${term},listing.ilike.${term}`);
  }

  const { data: listings, error } = await query;

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
        <div className="flex flex-wrap gap-2">
          <SearchForm defaultValue={q ?? ""} />
          <ExportButton />
          <Link
            href="/listings/new"
            className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700"
          >
            Add Listing
          </Link>
        </div>
      </div>

      {!listings || listings.length === 0 ? (
        <div className="rounded-xl border border-stone-200 bg-white p-12 text-center text-stone-500">
          {q ? (
            <>No listings match your search. Try a different keyword.</>
          ) : (
            <>
              <p className="mb-4">You don&apos;t have any listings yet.</p>
              <Link
                href="/listings/new"
                className="text-amber-600 hover:underline"
              >
                Add your first listing
              </Link>
            </>
          )}
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-stone-200 bg-white">
          <ul className="divide-y divide-stone-100">
            {listings.map((l: Record<string, unknown>) => {
              const series = l.series as Record<string, unknown> | null;
              const publisher = series?.publisher as Record<string, unknown> | null;
              return (
                <li key={l.id as string}>
                  <Link
                    href={`/listings/${l.id}`}
                    className="block px-4 py-4 hover:bg-stone-50 sm:px-6"
                  >
                    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <span className="font-medium text-stone-900">
                          {series?.seriesname ?? "Unknown"} #{l.issuenumber as string}
                        </span>
                        {publisher?.publishername && (
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
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
