"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

type Publisher = { id: string; publishername: string };
type SeriesItem = {
  id: string;
  seriesname: string;
  starting_year: number | null;
  publisher: { publishername: string } | null;
};

export default function SeriesList({
  publishers: initialPublishers,
  series: initialSeries,
}: {
  publishers: Publisher[];
  series: SeriesItem[];
}) {
  const router = useRouter();
  const [publishers, setPublishers] = useState(initialPublishers);
  const [series, setSeries] = useState(initialSeries);
  const [newPublisher, setNewPublisher] = useState("");
  const [newSeriesName, setNewSeriesName] = useState("");
  const [newSeriesPublisher, setNewSeriesPublisher] = useState(initialPublishers[0]?.id ?? "");
  const [newSeriesYear, setNewSeriesYear] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function addPublisher(e: React.FormEvent) {
    e.preventDefault();
    if (!newPublisher.trim()) return;
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { data, error: err } = await supabase
      .from("publisher")
      .insert({ publishername: newPublisher.trim() })
      .select()
      .single();
    if (err) {
      setError(err.message);
      setLoading(false);
      return;
    }
    setPublishers((p) => [...p, data]);
    setNewPublisher("");
    setLoading(false);
    router.refresh();
  }

  async function addSeries(e: React.FormEvent) {
    e.preventDefault();
    if (!newSeriesName.trim() || !newSeriesPublisher) return;
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { data, error: err } = await supabase
      .from("series")
      .insert({
        seriesname: newSeriesName.trim(),
        publisher_id: newSeriesPublisher,
        starting_year: newSeriesYear ? Number(newSeriesYear) : null,
      })
      .select("id, seriesname, starting_year, publisher(publishername)")
      .single();
    if (err) {
      setError(err.message);
      setLoading(false);
      return;
    }
    setSeries((s) => [...s, data as SeriesItem]);
    setNewSeriesName("");
    setNewSeriesYear("");
    setLoading(false);
    router.refresh();
  }

  return (
    <div className="space-y-8">
      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="rounded-xl border border-stone-200 bg-white p-6">
        <h3 className="mb-4 font-medium text-stone-800">Add Publisher</h3>
        <form onSubmit={addPublisher} className="flex gap-2">
          <input
            type="text"
            value={newPublisher}
            onChange={(e) => setNewPublisher(e.target.value)}
            placeholder="Publisher name"
            className="flex-1 rounded-lg border border-stone-300 px-4 py-2 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
          />
          <button
            type="submit"
            disabled={loading || !newPublisher.trim()}
            className="rounded-lg bg-amber-600 px-4 py-2 font-medium text-white hover:bg-amber-700 disabled:opacity-50"
          >
            Add
          </button>
        </form>
      </div>

      <div className="rounded-xl border border-stone-200 bg-white p-6">
        <h3 className="mb-4 font-medium text-stone-800">Add Series</h3>
        <form onSubmit={addSeries} className="space-y-4">
          <div className="flex flex-col gap-4 sm:flex-row">
            <input
              type="text"
              value={newSeriesName}
              onChange={(e) => setNewSeriesName(e.target.value)}
              placeholder="Series name"
              required
              className="flex-1 rounded-lg border border-stone-300 px-4 py-2 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
            <select
              value={newSeriesPublisher}
              onChange={(e) => setNewSeriesPublisher(e.target.value)}
              required
              className="rounded-lg border border-stone-300 px-4 py-2 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
            >
              <option value="">Select publisher...</option>
              {publishers.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.publishername}
                </option>
              ))}
            </select>
            <input
              type="number"
              value={newSeriesYear}
              onChange={(e) => setNewSeriesYear(e.target.value)}
              placeholder="Year"
              min={1900}
              max={2100}
              className="w-24 rounded-lg border border-stone-300 px-4 py-2 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !newSeriesName.trim()}
            className="rounded-lg bg-amber-600 px-4 py-2 font-medium text-white hover:bg-amber-700 disabled:opacity-50"
          >
            Add Series
          </button>
        </form>
      </div>

      <div className="rounded-xl border border-stone-200 bg-white">
        <h3 className="border-b border-stone-100 p-4 font-medium text-stone-800">
          All Publishers
        </h3>
        <ul className="divide-y divide-stone-100">
          {publishers.length === 0 ? (
            <li className="p-4 text-stone-500">No publishers yet.</li>
          ) : (
            publishers.map((p) => (
              <li key={p.id} className="px-4 py-3">
                {p.publishername}
              </li>
            ))
          )}
        </ul>
      </div>

      <div className="rounded-xl border border-stone-200 bg-white">
        <h3 className="border-b border-stone-100 p-4 font-medium text-stone-800">
          All Series
        </h3>
        <ul className="divide-y divide-stone-100">
          {series.length === 0 ? (
            <li className="p-4 text-stone-500">No series yet. Add a publisher first, then add series.</li>
          ) : (
            series.map((s) => (
              <li key={s.id} className="flex justify-between px-4 py-3">
                <span>
                  {s.seriesname}
                  {s.starting_year && ` (${s.starting_year})`}
                  {s.publisher?.publishername && (
                    <span className="ml-2 text-stone-500">
                      — {s.publisher.publishername}
                    </span>
                  )}
                </span>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}
