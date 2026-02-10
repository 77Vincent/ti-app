import Link from "next/link";

export default function Home() {
  return (
    <main className="mx-auto max-w-2xl space-y-4 p-6">
      <h1 className="text-3xl font-semibold">Instant learning by testing</h1>
      <p className="text-base-content/70">
        Home page for the app. Start a test flow from the dedicated start route.
      </p>
      <Link className="btn btn-primary btn-sm" href="/test/start">
        Start Test
      </Link>
    </main>
  );
}
