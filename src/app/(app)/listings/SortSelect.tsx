"use client";

import { useRouter, useSearchParams } from "next/navigation";

type SortOption = "newest" | "oldest" | "name" | "name_desc";

export default function SortSelect({ value }: { value?: SortOption }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const params = new URLSearchParams(searchParams.toString());
    const newValue = e.target.value as SortOption;
    if (newValue === "newest") {
      params.delete("sort");
    } else {
      params.set("sort", newValue);
    }
    router.push(`/listings?${params.toString()}`);
  }

  const sort = (value ?? searchParams.get("sort") ?? "newest") as SortOption;

  return (
    <div className="flex items-center gap-2">
      <label htmlFor="sort" className="text-sm text-stone-600">
        Sort by:
      </label>
      <select
        id="sort"
        value={sort}
        onChange={handleChange}
        className="rounded-lg border border-stone-300 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
      >
        <option value="newest">Newest</option>
        <option value="oldest">Oldest</option>
        <option value="name">A to Z</option>
        <option value="name_desc">Z to A</option>
      </select>
    </div>
  );
}
