export const metadata = {
  title: "Privacy Policy | It",
};

export default function PrivacyPolicyPage() {
  return (
    <section className="mx-auto w-full max-w-3xl space-y-4">
      <h1 className="text-2xl font-semibold">Privacy Policy</h1>
      <p className="text-default-600">
        We store only the data required to provide the testing experience, such
        as account identity, preferences, and test progress.
      </p>
      <p className="text-default-600">
        We do not sell personal data. Access to data is restricted to authorized
        operations required to run the product.
      </p>
      <p className="text-default-600">
        If you have a privacy request, contact the product operator and include
        enough account detail for verification.
      </p>
    </section>
  );
}
