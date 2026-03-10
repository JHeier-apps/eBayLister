import Link from "next/link";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-stone-100 to-stone-200 px-4">
      <main className="max-w-2xl text-center">
        <h1 className="mb-4 text-4xl font-bold tracking-tight text-stone-900 sm:text-5xl">
          Bulk eBay Comic Lister
        </h1>
        <p className="mb-8 text-lg text-stone-600">
          Add comic book data and create CSV exports for easy eBay import.
          Manage your listings with series, publishers, and search.
        </p>
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
          <Link
            href="/login"
            className="rounded-lg bg-amber-600 px-6 py-3 font-medium text-white hover:bg-amber-700 transition-colors"
          >
            Sign in
          </Link>
          <Link
            href="/signup"
            className="rounded-lg border-2 border-amber-600 px-6 py-3 font-medium text-amber-600 hover:bg-amber-50 transition-colors"
          >
            Create account
          </Link>
        </div>
      </main>
    </div>
  );
}
