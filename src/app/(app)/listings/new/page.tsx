import { createClient } from "@/lib/supabase/server";
import ListingForm from "../ListingForm";

export default async function NewListingPage() {
  const supabase = await createClient();
  const { data: series } = await supabase
    .from("series")
    .select("id, seriesname, starting_year, publisher(publishername)")
    .order("seriesname");

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-stone-900">Add Listing</h1>
      <ListingForm series={series ?? []} />
    </div>
  );
}
