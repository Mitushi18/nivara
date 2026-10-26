"use client";

import { FormEvent, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function EditLiabilityPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const supabase = createClient();

  const [name, setName] = useState("");
  const [category, setCategory] = useState("Home Loan");
  const [value, setValue] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const loadLiability = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      const { data, error } = await supabase
        .from("liabilities")
        .select("*")
        .eq("id", id)
        .eq("user_id", user.id)
        .single();

      if (error) {
        setErrorMessage(error.message);
        setLoading(false);
        return;
      }

      setName(data.name || "");
      setCategory(data.category || "Home Loan");
      setValue(String(data.value ?? ""));

      setLoading(false);
    };

    loadLiability();
  }, [id, router]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setErrorMessage("");

    if (!name.trim()) {
      setErrorMessage("Please enter a liability name.");
      return;
    }

    const numericValue = Number(value);

    if (
      value === "" ||
      Number.isNaN(numericValue) ||
      numericValue < 0
    ) {
      setErrorMessage("Please enter a valid amount.");
      return;
    }

    setSaving(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/login");
      return;
    }

    const { error } = await supabase
      .from("liabilities")
      .update({
        name: name.trim(),
        category,
        value: numericValue,
        currency: "INR",
      })
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      setErrorMessage(error.message);
      setSaving(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f7f8f5] px-6 py-10">
        <div className="mx-auto max-w-xl">
          <p className="text-gray-600">
            Loading liability...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f7f8f5] px-6 py-10">
      <div className="mx-auto max-w-xl">

        <Link
          href="/dashboard"
          className="text-sm font-medium text-[#5d8a68] hover:underline"
        >
          ← Back to Dashboard
        </Link>

        <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-7 shadow-sm">

          <h1 className="text-2xl font-bold text-[#26352b]">
            Edit Liability
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Update your loan or other liability information.
          </p>

          {errorMessage && (
            <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-5">

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Liability Name
              </label>

              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Home Loan"
                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-[#5d8a68]"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Category
              </label>

              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none focus:border-[#5d8a68]"
              >
                <option value="Home Loan">Home Loan</option>
                <option value="Car Loan">Car Loan</option>
                <option value="Personal Loan">Personal Loan</option>
                <option value="Credit Card">Credit Card</option>
                <option value="Education Loan">Education Loan</option>
                <option value="Business Loan">Business Loan</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Outstanding Amount (₹)
              </label>

              <input
                type="number"
                min="0"
                step="0.01"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="e.g. 500000"
                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-[#5d8a68]"
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full rounded-xl bg-[#5d8a68] px-5 py-3 font-semibold text-white hover:bg-[#4f7759] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>

          </form>
        </div>
      </div>
    </main>
  );
}