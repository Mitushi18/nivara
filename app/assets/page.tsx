"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function AddAssetPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [category, setCategory] = useState("Cash");
  const [value, setValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setLoading(true);
    setError("");

    const numericValue = Number(value);

    if (!name.trim()) {
      setError("Please enter an asset name.");
      setLoading(false);
      return;
    }

    if (!value || Number.isNaN(numericValue) || numericValue < 0) {
      setError("Please enter a valid asset value.");
      setLoading(false);
      return;
    }

    const supabase = createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/login");
      return;
    }

    const { error } = await supabase.from("assets").insert({
      user_id: user.id,
      name: name.trim(),
      category,
      value: numericValue,
      currency: "INR",
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <main className="min-h-screen bg-[#f7f8f4]">
      {/* Navigation */}
      <nav className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <Link
            href="/"
            className="text-2xl font-bold tracking-tight"
          >
            Nivara<span className="text-[#5d8a68]">.</span>
          </Link>

          <Link
            href="/dashboard"
            className="text-sm font-medium hover:text-[#5d8a68]"
          >
            ← Dashboard
          </Link>
        </div>
      </nav>

      {/* Main Content */}
      <section className="mx-auto max-w-2xl px-6 py-12">
        <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-lg">
          {/* Heading */}
          <p className="text-sm font-semibold uppercase tracking-widest text-[#5d8a68]">
            Wealth
          </p>

          <h1 className="mt-3 text-3xl font-semibold tracking-tight">
            Add an asset
          </h1>

          <p className="mt-3 text-sm leading-6 text-gray-500">
            Add cash, investments, gold, property, business assets or
            anything else that contributes to your wealth.
          </p>

          {/* Form */}
          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            {/* Asset Name */}
            <div>
              <label
                htmlFor="name"
                className="mb-2 block text-sm font-medium"
              >
                Asset name
              </label>

              <input
                id="name"
                type="text"
                required
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="e.g. Emergency Cash"
                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-[#5d8a68] focus:ring-2 focus:ring-[#5d8a68]/20"
              />
            </div>

            {/* Category */}
            <div>
              <label
                htmlFor="category"
                className="mb-2 block text-sm font-medium"
              >
                Category
              </label>

              <select
                id="category"
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none transition focus:border-[#5d8a68] focus:ring-2 focus:ring-[#5d8a68]/20"
              >
                <option value="Cash">Cash</option>
                <option value="Stocks">Stocks</option>
                <option value="Mutual Funds">Mutual Funds</option>
                <option value="Gold">Gold</option>
                <option value="Property">Property</option>
                <option value="Business">Business</option>
                <option value="Fixed Deposit">Fixed Deposit</option>
                <option value="Bonds">Bonds</option>
                <option value="Crypto">Crypto</option>
                <option value="Vehicle">Vehicle</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Value */}
            <div>
              <label
                htmlFor="value"
                className="mb-2 block text-sm font-medium"
              >
                Current value (₹)
              </label>

              <input
                id="value"
                type="number"
                min="0"
                step="0.01"
                required
                value={value}
                onChange={(event) => setValue(event.target.value)}
                placeholder="e.g. 50000"
                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-[#5d8a68] focus:ring-2 focus:ring-[#5d8a68]/20"
              />

              <p className="mt-2 text-xs text-gray-500">
                Enter the current approximate value of this asset.
              </p>
            </div>

            {/* Error */}
            {error && (
              <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            {/* Save Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-[#172019] px-5 py-3.5 font-medium text-white transition hover:bg-[#2a382d] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Saving..." : "Save asset"}
            </button>
          </form>

          {/* Information */}
          <div className="mt-8 rounded-2xl bg-[#f7f8f4] p-5">
            <h2 className="text-sm font-semibold text-gray-900">
              How Nivara calculates your wealth
            </h2>

            <p className="mt-2 text-sm leading-6 text-gray-500">
              Your assets are added to your bank accounts and other
              financial holdings. Your liabilities are then subtracted
              to calculate your net worth.
            </p>

            <div className="mt-4 rounded-xl bg-white p-4 text-sm">
              <span className="font-medium">Net Worth</span>
              <span className="mx-2 text-gray-400">=</span>
              <span className="text-[#5d8a68]">Total Assets</span>
              <span className="mx-2 text-gray-400">−</span>
              <span className="text-red-600">Total Liabilities</span>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}