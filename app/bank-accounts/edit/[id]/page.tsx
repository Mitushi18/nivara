"use client";

import { FormEvent, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function EditBankAccountPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const supabase = createClient();

  const [bankName, setBankName] = useState("");
  const [accountName, setAccountName] = useState("");
  const [accountType, setAccountType] = useState("Savings");
  const [balance, setBalance] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const loadAccount = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      const { data, error } = await supabase
        .from("bank_accounts")
        .select("*")
        .eq("id", id)
        .eq("user_id", user.id)
        .single();

      if (error) {
        setErrorMessage(error.message);
        setLoading(false);
        return;
      }

      setBankName(data.bank_name || "");
      setAccountName(data.account_name || "");
      setAccountType(data.account_type || "Savings");
      setBalance(String(data.balance ?? ""));

      setLoading(false);
    };

    loadAccount();
  }, [id, router]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setErrorMessage("");

    if (!bankName.trim()) {
      setErrorMessage("Please enter the bank name.");
      return;
    }

    if (!accountName.trim()) {
      setErrorMessage("Please enter an account name.");
      return;
    }

    const numericBalance = Number(balance);

    if (balance === "" || Number.isNaN(numericBalance) || numericBalance < 0) {
      setErrorMessage("Please enter a valid balance.");
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
      .from("bank_accounts")
      .update({
        bank_name: bankName.trim(),
        account_name: accountName.trim(),
        account_type: accountType,
        balance: numericBalance,
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
          <p className="text-gray-600">Loading bank account...</p>
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
            Edit Bank Account
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Update your bank account information and current balance.
          </p>

          {errorMessage && (
            <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-5">

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Bank Name
              </label>

              <input
                type="text"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                placeholder="e.g. HDFC Bank"
                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-[#5d8a68]"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Account Name
              </label>

              <input
                type="text"
                value={accountName}
                onChange={(e) => setAccountName(e.target.value)}
                placeholder="e.g. Main Savings"
                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-[#5d8a68]"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Account Type
              </label>

              <select
                value={accountType}
                onChange={(e) => setAccountType(e.target.value)}
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none focus:border-[#5d8a68]"
              >
                <option value="Savings">Savings</option>
                <option value="Current">Current</option>
                <option value="Salary">Salary</option>
                <option value="NRE">NRE</option>
                <option value="NRO">NRO</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Current Balance (₹)
              </label>

              <input
                type="number"
                min="0"
                step="0.01"
                value={balance}
                onChange={(e) => setBalance(e.target.value)}
                placeholder="e.g. 50000"
                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-[#5d8a68]"
              />
            </div>

            <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-800">
              Never enter your bank password, UPI PIN, OTP, debit-card PIN,
              or internet-banking credentials into Nivara.
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