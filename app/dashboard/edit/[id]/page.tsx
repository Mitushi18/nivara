"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Asset = {
  id: string;
  name: string;
  category: string;
  value: number;
  currency: string;
};

type BankAccount = {
  id: string;
  bank_name: string;
  account_name: string;
  account_type: string;
  balance: number;
  currency: string;
};

type Liability = {
  id: string;
  name: string;
  category: string;
  value: number;
  currency: string;
};

export default function DashboardPage() {
  const router = useRouter();

  const [assets, setAssets] = useState<Asset[]>([]);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [liabilities, setLiabilities] = useState<Liability[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadFinancialData();
  }, []);

  async function loadFinancialData() {
    const supabase = createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/login");
      return;
    }

    const [assetsResult, bankResult, liabilitiesResult] =
      await Promise.all([
        supabase
          .from("assets")
          .select("*")
          .eq("user_id", user.id),

        supabase
          .from("bank_accounts")
          .select("*")
          .eq("user_id", user.id),

        supabase
          .from("liabilities")
          .select("*")
          .eq("user_id", user.id),
      ]);

    if (assetsResult.error) {
      setError(assetsResult.error.message);
      setLoading(false);
      return;
    }

    if (bankResult.error) {
      setError(bankResult.error.message);
      setLoading(false);
      return;
    }

    if (liabilitiesResult.error) {
      setError(liabilitiesResult.error.message);
      setLoading(false);
      return;
    }

    const loadedAssets = assetsResult.data || [];
    const loadedBankAccounts = bankResult.data || [];
    const loadedLiabilities = liabilitiesResult.data || [];

    setAssets(loadedAssets);
    setBankAccounts(loadedBankAccounts);
    setLiabilities(loadedLiabilities);

    const totalAssets =
      loadedAssets.reduce(
        (total, asset) => total + Number(asset.value || 0),
        0
      ) +
      loadedBankAccounts.reduce(
        (total, account) =>
          total + Number(account.balance || 0),
        0
      );

    const totalLiabilities = loadedLiabilities.reduce(
      (total, liability) =>
        total + Number(liability.value || 0),
      0
    );

    const netWorth = totalAssets - totalLiabilities;

    /*
      Save one snapshot for today.

      We first check whether a snapshot already exists
      for this user today. This prevents the dashboard
      from creating dozens of identical snapshots every
      time the page is refreshed.
    */

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const { data: existingSnapshot } = await supabase
      .from("net_worth_snapshots")
      .select("id")
      .eq("user_id", user.id)
      .gte("created_at", startOfDay.toISOString())
      .lte("created_at", endOfDay.toISOString())
      .limit(1)
      .maybeSingle();

    if (!existingSnapshot) {
      await supabase
        .from("net_worth_snapshots")
        .insert({
          user_id: user.id,
          net_worth: netWorth,
          total_assets: totalAssets,
          total_liabilities: totalLiabilities,
        });
    }

    setLoading(false);
  }

  async function handleLogout() {
    const supabase = createClient();

    await supabase.auth.signOut();

    router.push("/login");
    router.refresh();
  }

  async function deleteAsset(id: string) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this asset?"
    );

    if (!confirmed) return;

    const supabase = createClient();

    const { error } = await supabase
      .from("assets")
      .delete()
      .eq("id", id);

    if (error) {
      setError(error.message);
      return;
    }

    setAssets((current) =>
      current.filter((asset) => asset.id !== id)
    );
  }

  async function deleteBankAccount(id: string) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this bank account?"
    );

    if (!confirmed) return;

    const supabase = createClient();

    const { error } = await supabase
      .from("bank_accounts")
      .delete()
      .eq("id", id);

    if (error) {
      setError(error.message);
      return;
    }

    setBankAccounts((current) =>
      current.filter((account) => account.id !== id)
    );
  }

  async function deleteLiability(id: string) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this liability?"
    );

    if (!confirmed) return;

    const supabase = createClient();

    const { error } = await supabase
      .from("liabilities")
      .delete()
      .eq("id", id);

    if (error) {
      setError(error.message);
      return;
    }

    setLiabilities((current) =>
      current.filter((liability) => liability.id !== id)
    );
  }

  const totalAssets =
    assets.reduce(
      (total, asset) => total + Number(asset.value || 0),
      0
    ) +
    bankAccounts.reduce(
      (total, account) =>
        total + Number(account.balance || 0),
      0
    );

  const totalLiabilities = liabilities.reduce(
    (total, liability) =>
      total + Number(liability.value || 0),
    0
  );

  const netWorth = totalAssets - totalLiabilities;

  function formatMoney(value: number) {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(value);
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f7f8f4]">
        <p className="text-gray-500">
          Loading your finances...
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f7f8f4]">

      {/* NAVIGATION */}
      <nav className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">

          <Link
            href="/"
            className="text-2xl font-bold tracking-tight"
          >
            Nivara<span className="text-[#5d8a68]">.</span>
          </Link>

          <div className="flex items-center gap-3">

            <Link
              href="/assets"
              className="rounded-xl px-4 py-2 text-sm font-medium hover:bg-gray-100"
            >
              Assets
            </Link>

            <Link
              href="/bank-accounts"
              className="rounded-xl px-4 py-2 text-sm font-medium hover:bg-gray-100"
            >
              Bank Accounts
            </Link>

            <Link
              href="/liabilities"
              className="rounded-xl px-4 py-2 text-sm font-medium hover:bg-gray-100"
            >
              Liabilities
            </Link>

            <button
              onClick={handleLogout}
              className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50"
            >
              Log out
            </button>

          </div>
        </div>
      </nav>

      {/* MAIN */}
      <section className="mx-auto max-w-7xl px-6 py-10">

        {/* HEADER */}
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-widest text-[#5d8a68]">
            Your wealth
          </p>

          <h1 className="mt-2 text-4xl font-semibold tracking-tight text-[#172019]">
            Financial Dashboard
          </h1>

          <p className="mt-2 text-gray-500">
            A simple view of everything you own and owe.
          </p>
        </div>

        {/* ERROR */}
        {error && (
          <div className="mb-6 rounded-2xl bg-red-50 px-5 py-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* NET WORTH */}
        <div className="rounded-3xl bg-[#172019] p-8 text-white shadow-lg">

          <p className="text-sm uppercase tracking-widest text-gray-300">
            Net Worth
          </p>

          <h2 className="mt-3 text-4xl font-semibold">
            {formatMoney(netWorth)}
          </h2>

          <div className="mt-8 grid gap-6 sm:grid-cols-2">

            <div>
              <p className="text-sm text-gray-400">
                Total Assets
              </p>

              <p className="mt-1 text-2xl font-semibold text-[#b9d5bf]">
                {formatMoney(totalAssets)}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-400">
                Total Liabilities
              </p>

              <p className="mt-1 text-2xl font-semibold text-red-300">
                {formatMoney(totalLiabilities)}
              </p>
            </div>

          </div>
        </div>

        {/* QUICK ACTIONS */}
        <div className="mt-8 grid gap-4 md:grid-cols-3">

          <Link
            href="/assets"
            className="block rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
          >
            <div className="text-3xl text-[#5d8a68]">
              +
            </div>

            <h3 className="mt-3 text-lg font-semibold">
              Add Asset
            </h3>

            <p className="mt-2 text-sm leading-6 text-gray-500">
              Add investments, cash, property, gold and other assets.
            </p>

            <span className="mt-4 inline-block text-sm font-semibold text-[#5d8a68]">
              Open →
            </span>
          </Link>

          <Link
            href="/bank-accounts"
            className="block rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
          >
            <div className="text-3xl text-[#5d8a68]">
              +
            </div>

            <h3 className="mt-3 text-lg font-semibold">
              Add Bank Account
            </h3>

            <p className="mt-2 text-sm leading-6 text-gray-500">
              Track your savings, current and salary accounts.
            </p>

            <span className="mt-4 inline-block text-sm font-semibold text-[#5d8a68]">
              Open →
            </span>
          </Link>

          <Link
            href="/liabilities"
            className="block rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
          >
            <div className="text-3xl text-red-600">
              +
            </div>

            <h3 className="mt-3 text-lg font-semibold">
              Add Liability
            </h3>

            <p className="mt-2 text-sm leading-6 text-gray-500">
              Track loans, credit cards and other debt.
            </p>

            <span className="mt-4 inline-block text-sm font-semibold text-red-600">
              Open →
            </span>
          </Link>

        </div>

        {/* ASSETS */}
        <section className="mt-10">

          <div className="mb-4 flex items-center justify-between">

            <div>
              <p className="text-sm font-semibold uppercase tracking-widest text-[#5d8a68]">
                Wealth
              </p>

              <h2 className="mt-1 text-2xl font-semibold">
                Assets
              </h2>
            </div>

            <Link
              href="/assets"
              className="rounded-xl bg-[#172019] px-4 py-2 text-sm font-medium text-white hover:bg-[#2a382d]"
            >
              + Add Asset
            </Link>

          </div>

          {assets.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-8 text-center">

              <p className="font-medium">
                No assets added yet.
              </p>

              <p className="mt-1 text-sm text-gray-500">
                Add your investments, cash or other assets.
              </p>

              <Link
                href="/assets"
                className="mt-4 inline-block rounded-xl bg-[#172019] px-5 py-2.5 text-sm font-medium text-white"
              >
                Add your first asset
              </Link>

            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">

              {assets.map((asset) => (
                <div
                  key={asset.id}
                  className="flex items-center justify-between rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
                >

                  <div>
                    <p className="font-semibold">
                      {asset.name}
                    </p>

                    <p className="mt-1 text-sm text-gray-500">
                      {asset.category}
                    </p>
                  </div>

                  <div className="text-right">

                    <p className="font-semibold">
                      {formatMoney(Number(asset.value))}
                    </p>

                    <div className="mt-2 flex justify-end gap-3">

                      <Link
                        href={`/assets/edit/${asset.id}`}
                        className="text-xs font-medium text-[#5d8a68] hover:underline"
                      >
                        Edit
                      </Link>

                      <button
                        onClick={() => deleteAsset(asset.id)}
                        className="text-xs text-red-600 hover:underline"
                      >
                        Delete
                      </button>

                    </div>

                  </div>

                </div>
              ))}

            </div>
          )}

        </section>

        {/* BANK ACCOUNTS */}
        <section className="mt-10">

          <div className="mb-4 flex items-center justify-between">

            <div>
              <p className="text-sm font-semibold uppercase tracking-widest text-[#5d8a68]">
                Banking
              </p>

              <h2 className="mt-1 text-2xl font-semibold">
                Bank Accounts
              </h2>
            </div>

            <Link
              href="/bank-accounts"
              className="rounded-xl bg-[#172019] px-4 py-2 text-sm font-medium text-white hover:bg-[#2a382d]"
            >
              + Add Bank
            </Link>

          </div>

          {bankAccounts.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-8 text-center">

              <p className="font-medium">
                No bank accounts added yet.
              </p>

              <p className="mt-1 text-sm text-gray-500">
                Add your savings or current accounts.
              </p>

              <Link
                href="/bank-accounts"
                className="mt-4 inline-block rounded-xl bg-[#172019] px-5 py-2.5 text-sm font-medium text-white"
              >
                Add your first bank account
              </Link>

            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">

              {bankAccounts.map((account) => (
                <div
                  key={account.id}
                  className="flex items-center justify-between rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
                >

                  <div>
                    <p className="font-semibold">
                      {account.account_name}
                    </p>

                    <p className="mt-1 text-sm text-gray-500">
                      {account.bank_name} · {account.account_type}
                    </p>
                  </div>

                  <div className="text-right">

                    <p className="font-semibold">
                      {formatMoney(Number(account.balance))}
                    </p>

                    <div className="mt-2 flex justify-end gap-3">

                      <span className="text-xs text-gray-400">
                        Edit coming next
                      </span>

                      <button
                        onClick={() =>
                          deleteBankAccount(account.id)
                        }
                        className="text-xs text-red-600 hover:underline"
                      >
                        Delete
                      </button>

                    </div>

                  </div>

                </div>
              ))}

            </div>
          )}

        </section>

        {/* LIABILITIES */}
        <section className="mt-10">

          <div className="mb-4 flex items-center justify-between">

            <div>
              <p className="text-sm font-semibold uppercase tracking-widest text-red-600">
                Debt
              </p>

              <h2 className="mt-1 text-2xl font-semibold">
                Liabilities
              </h2>
            </div>

            <Link
              href="/liabilities"
              className="rounded-xl bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
            >
              + Add Liability
            </Link>

          </div>

          {liabilities.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-8 text-center">

              <p className="font-medium">
                No liabilities added yet.
              </p>

              <p className="mt-1 text-sm text-gray-500">
                Add your loans or outstanding debt.
              </p>

              <Link
                href="/liabilities"
                className="mt-4 inline-block rounded-xl bg-red-600 px-5 py-2.5 text-sm font-medium text-white"
              >
                Add your first liability
              </Link>

            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">

              {liabilities.map((liability) => (
                <div
                  key={liability.id}
                  className="flex items-center justify-between rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
                >

                  <div>
                    <p className="font-semibold">
                      {liability.name}
                    </p>

                    <p className="mt-1 text-sm text-gray-500">
                      {liability.category}
                    </p>
                  </div>

                  <div className="text-right">

                    <p className="font-semibold text-red-600">
                      {formatMoney(Number(liability.value))}
                    </p>

                    <div className="mt-2 flex justify-end gap-3">

                      <span className="text-xs text-gray-400">
                        Edit coming next
                      </span>

                      <button
                        onClick={() =>
                          deleteLiability(liability.id)
                        }
                        className="text-xs text-red-600 hover:underline"
                      >
                        Delete
                      </button>

                    </div>

                  </div>

                </div>
              ))}

            </div>
          )}

        </section>

        {/* NET WORTH FORMULA */}
        <section className="mt-10 mb-10">

          <div className="rounded-3xl border border-gray-200 bg-white p-6">

            <p className="text-sm font-semibold">
              How Nivara calculates your net worth
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">

              <span className="rounded-lg bg-green-50 px-3 py-2 text-green-700">
                Assets: {formatMoney(totalAssets)}
              </span>

              <span className="text-gray-400">
                −
              </span>

              <span className="rounded-lg bg-red-50 px-3 py-2 text-red-700">
                Liabilities: {formatMoney(totalLiabilities)}
              </span>

              <span className="text-gray-400">
                =
              </span>

              <span className="rounded-lg bg-gray-100 px-3 py-2 font-semibold">
                Net Worth: {formatMoney(netWorth)}
              </span>

            </div>

          </div>

        </section>

      </section>
    </main>
  );
}