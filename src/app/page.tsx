"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

const contactFormSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters."),
  email: z.string().email("Enter a valid email address."),
  message: z
    .string()
    .min(10, "Message must be at least 10 characters.")
    .max(500, "Message must be 500 characters or less."),
});

type ContactFormValues = z.infer<typeof contactFormSchema>;

export default function Home() {
  const [submittedData, setSubmittedData] = useState<ContactFormValues | null>(
    null,
  );

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      fullName: "",
      email: "",
      message: "",
    },
  });

  const onSubmit = async (values: ContactFormValues) => {
    setSubmittedData(values);
    reset();
  };

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-2xl flex-col gap-8 px-6 py-16">
      <header className="space-y-2">
        <h1 className="text-4xl font-semibold tracking-tight">Contact Form</h1>
        <p className="text-sm text-neutral-600">
          Example form using react-hook-form with zod schema validation.
        </p>
      </header>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-5 rounded-xl border border-neutral-200 p-6"
        noValidate
      >
        <div className="space-y-1">
          <label htmlFor="fullName" className="text-sm font-medium">
            Full Name
          </label>
          <input
            id="fullName"
            type="text"
            {...register("fullName")}
            className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-500"
            placeholder="Jane Doe"
          />
          {errors.fullName ? (
            <p className="text-sm text-red-600">{errors.fullName.message}</p>
          ) : null}
        </div>

        <div className="space-y-1">
          <label htmlFor="email" className="text-sm font-medium">
            Email
          </label>
          <input
            id="email"
            type="email"
            {...register("email")}
            className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-500"
            placeholder="jane@example.com"
          />
          {errors.email ? (
            <p className="text-sm text-red-600">{errors.email.message}</p>
          ) : null}
        </div>

        <div className="space-y-1">
          <label htmlFor="message" className="text-sm font-medium">
            Message
          </label>
          <textarea
            id="message"
            rows={5}
            {...register("message")}
            className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-500"
            placeholder="Tell us what you need..."
          />
          {errors.message ? (
            <p className="text-sm text-red-600">{errors.message.message}</p>
          ) : null}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex h-10 items-center justify-center rounded-md bg-black px-4 text-sm font-medium text-white disabled:opacity-60"
        >
          {isSubmitting ? "Submitting..." : "Submit"}
        </button>
      </form>

      {submittedData ? (
        <section className="space-y-2 rounded-xl border border-neutral-200 p-6">
          <h2 className="text-lg font-semibold">Submitted Data</h2>
          <pre className="overflow-x-auto text-sm text-neutral-700">
            {JSON.stringify(submittedData, null, 2)}
          </pre>
        </section>
      ) : null}
    </main>
  );
}
