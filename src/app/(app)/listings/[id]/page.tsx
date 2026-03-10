import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import ListingForm from "../ListingForm";

export default async function ListingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: listing, error } = await supabase
    .from("listing")
    .select(
      `
      id,
      series_id,
      issuenumber,
      listing,
      created_at,
      updated_at,
      listed_date,
      series (
        id,
        seriesname,
        starting_year,
        publisher (publishername)
      )
    `
    )
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (error || !listing) notFound();

  const { data: series } = await supabase
    .from("series")
    .select("id, seriesname, starting_year, publisher(publishername)")
    .order("seriesname");

  const s = listing.series as unknown as Record<string, unknown> | null;
  const p = s?.publisher as unknown as Record<string, unknown> | null;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <Link
          href="/listings"
          className="text-sm text-amber-600 hover:underline"
        >
          ← Back to Listings
        </Link>
      </div>
      <h1 className="mb-2 text-2xl font-bold text-stone-900">
        {s?.seriesname ?? "Unknown"} #{listing.issuenumber}
      </h1>
      {p?.publishername && (
        <p className="mb-6 text-stone-500">{p.publishername as string}</p>
      )}
      <ListingForm
        series={series ?? []}
        listing={{
          id: listing.id,
          series_id: listing.series_id,
          issuenumber: listing.issuenumber,
          listing: listing.listing,
          listed_date: listing.listed_date,
        }}
        mode="edit"
      />
      <p className="mt-4 text-sm text-stone-500">
        Created: {new Date(listing.created_at).toLocaleString()}
        {listing.updated_at !== listing.created_at &&
          ` · Updated: ${new Date(listing.updated_at).toLocaleString()}`}
      </p>
    </div>
  );
}
