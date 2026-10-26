"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function BankAccountsPage() {
  const router = useRouter();

  const [bankName, setBankName] = useState("");
  const [accountName, setAccountName] = useState("");
  const [accountType, setAccountType] = useState("Savings");
  const [balance, setBalance] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setLoading(true);
    setError("");

    const numericBalance = Number(balance);

    if (!bankName.trim()) {
      setError("Please enter your bank name.");
      setLoading(false);
      return;
    }

    if (!accountName.trim()) {
      setError("Please enter an account name.");
      setLoading(false);
      return;
    }

    if (
      !balance ||
      Number.isNaN(numericBalance) ||
      numericBalance < 0
    ) {
      setError("Please enter a valid balance.");
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

    const { error } = await supabase.from("bank_accounts").insert({
      user_id: user.id,
      bank_name: bankName.trim(),
      account_name: accountName.trim(),
      account_type: accountType,
      balance: numericBalance,
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
          <p className="text-sm font-semibold uppercase tracking-widest text-[#5d8a68]">
            Banking
          </p>

          <h1 className="mt-3 text-3xl font-semibold tracking-tight">
            Add a bank account
          </h1>

          <p className="mt-3 text-sm leading-6 text-gray-500">
            Add your bank account and current balance to track it as
            part of your net worth.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            {/* Bank Name */}
            <div>
              <label
                htmlFor="bankName"
                className="mb-2 block text-sm font-medium"
              >
                Bank name
              </label>

              <input
                id="bankName"
                type="text"
                required
                value={bankName}
                onChange={(event) => setBankName(event.target.value)}
                placeholder="e.g. HDFC Bank"
                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-[#5d8a68] focus:ring-2 focus:ring-[#5d8a68]/20"
              />
            </div>

            {/* Account Name */}
            <div>
              <label
                htmlFor="accountName"
                className="mb-2 block text-sm font-medium"
              >
                Account name
              </label>

              <input
                id="accountName"
                type="text"
                required
                value={accountName}
                onChange={(event) => setAccountName(event.target.value)}
                placeholder="e.g. Main Savings Account"
                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-[#5d8a68] focus:ring-2 focus:ring-[#5d8a68]/20"
              />

              <p className="mt-2 text-xs text-gray-500">
                Give this account a name so you can identify it later.
              </p>
            </div>

            {/* Account Type */}
            <div>
              <label
                htmlFor="accountType"
                className="mb-2 block text-sm font-medium"
              >
                Account type
              </label>

              <select
                id="accountType"
                value={accountType}
                onChange={(event) => setAccountType(event.target.value)}
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none transition focus:border-[#5d8a68] focus:ring-2 focus:ring-[#5d8a68]/20"
              >
                <option value="Savings">Savings</option>
                <option value="Current">Current</option>
                <option value="Salary">Salary</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Balance */}
            <div>
              <label
                htmlFor="balance"
                className="mb-2 block text-sm font-medium"
              >
                Current balance (₹)
              </label>

              <input
                id="balance"
                type="number"
                min="0"
                step="0.01"
                required
                value={balance}
                onChange={(event) => setBalance(event.target.value)}
                placeholder="e.g. 75000"
                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-[#5d8a68] focus:ring-2 focus:ring-[#5d8a68]/20"
              />

              <p className="mt-2 text-xs text-gray-500">
                Enter the current balance of this account.
              </p>
            </div>

            {/* Error */}
            {error && (
              <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            {/* Save */}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-[#172019] px-5 py-3.5 font-medium text-white transition hover:bg-[#2a382d] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Saving..." : "Save bank account"}
            </button>
          </form>

          {/* Security Information */}
          <div className="mt-8 rounded-2xl bg-[#f7f8f4] p-5">
            <h2 className="text-sm font-semibold text-gray-900">
              Your information stays separate
            </h2>

            <p className="mt-2 text-sm leading-6 text-gray-500">
              This version of Nivara uses manual tracking. Never enter
              your bank password, UPI PIN, OTP, debit card PIN, or other
              banking credentials here.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}