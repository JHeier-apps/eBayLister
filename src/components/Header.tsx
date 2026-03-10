"use client";

import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function Header() {
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <header className="border-b border-stone-200 bg-white">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Link href="/listings" className="text-lg font-semibold text-stone-900">
          Bulk eBay Comic Lister
        </Link>
        <nav className="flex items-center gap-6">
          <Link
            href="/listings"
            className="text-sm font-medium text-stone-600 hover:text-stone-900"
          >
            Listings
          </Link>
          <Link
            href="/listings/new"
            className="text-sm font-medium text-stone-600 hover:text-stone-900"
          >
            Add Listing
          </Link>
          <Link
            href="/series"
            className="text-sm font-medium text-stone-600 hover:text-stone-900"
          >
            Series
          </Link>
          <button
            onClick={handleLogout}
            className="text-sm font-medium text-stone-600 hover:text-stone-900"
          >
            Log out
          </button>
        </nav>
      </div>
    </header>
  );
}
