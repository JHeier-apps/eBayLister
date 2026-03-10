"use client";

import { useRouter, useSearchParams } from "next/navigation";

export default function NotListedOnlyCheckbox({ checked }: { checked: boolean }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const params = new URLSearchParams(searchParams.toString());
    if (e.target.checked) {
      params.delete("not_listed_only");
    } else {
      params.set("not_listed_only", "0");
    }
    router.push(`/listings?${params.toString()}`);
  }

  return (
    <label className="flex cursor-pointer items-center gap-2">
      <input
        type="checkbox"
        checked={checked}
        onChange={handleChange}
        className="h-4 w-4 rounded border-stone-300 text-amber-600 focus:ring-amber-500"
      />
      <span className="text-sm text-stone-700">Not Listed Only</span>
    </label>
  );
}
