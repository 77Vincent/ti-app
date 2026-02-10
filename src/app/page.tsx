import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col items-center gap-4">
      <h1 className="text-4xl font-medium">Learning by testing</h1>

      <Link className="btn btn-primary btn-sm" href="/test">
        Test Now
      </Link>
    </div>

  );
}
