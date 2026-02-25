export const metadata = {
  title: "Terms of Use | It",
};

export default function TermsOfUsePage() {
  return (
    <section className="mx-auto w-full max-w-3xl space-y-4">
      <h1 className="text-2xl font-semibold">Terms of Use</h1>
      <p className="text-default-600">
        By using this application, you agree to use it lawfully and
        responsibly. Do not attempt to disrupt service, abuse system resources,
        or access data you are not authorized to access.
      </p>
      <p className="text-default-600">
        The service is provided as-is and may change over time. We may suspend
        access when needed to protect system integrity or comply with legal
        requirements.
      </p>
    </section>
  );
}
