import Image from "next/image";

export default function Loading() {
  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center"
      role="status"
      aria-label="Loading"
    >
      <Image
        src="/logo-loading.svg"
        alt="Loading"
        width={56}
        height={56}
        className="h-14 w-14"
        unoptimized
      />
    </div>
  );
}
