import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import SeriesList from "./SeriesList";

export default async function SeriesPage() {
  const supabase = await createClient();
  const { data: publishers } = await supabase
    .from("publisher")
    .select("id, publishername")
    .order("publishername");

  const { data: series } = await supabase
    .from("series")
    .select("id, seriesname, starting_year, publisher(publishername)")
    .order("seriesname");

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-stone-900">Series & Publishers</h1>
      <div className="space-y-8">
        <section>
          <h2 className="mb-4 text-lg font-semibold text-stone-800">Publishers</h2>
          <SeriesList
            publishers={publishers ?? []}
            series={series ?? []}
          />
        </section>
      </div>
    </div>
  );
}
