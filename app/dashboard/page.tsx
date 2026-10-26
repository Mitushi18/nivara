"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
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

type Snapshot = {
  created_at: string;
  net_worth: number;
  total_assets: number;
  total_liabilities: number;
};

export default function DashboardPage() {
  const router = useRouter();
  const supabase = createClient();

  const [assets, setAssets] = useState<Asset[]>([]);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [liabilities, setLiabilities] = useState<Liability[]>([]);
  const [snapshots, setSnapshots] = useState<Snapshot[]>([]);

  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const loadDashboard = async () => {
    setLoading(true);
    setErrorMessage("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/login");
      return;
    }

    const [
      assetsResult,
      bankAccountsResult,
      liabilitiesResult,
    ] = await Promise.all([
      supabase
        .from("assets")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false }),

      supabase
        .from("bank_accounts")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false }),

      supabase
        .from("liabilities")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false }),
    ]);

    if (assetsResult.error) {
      setErrorMessage(assetsResult.error.message);
      setLoading(false);
      return;
    }

    if (bankAccountsResult.error) {
      setErrorMessage(bankAccountsResult.error.message);
      setLoading(false);
      return;
    }

    if (liabilitiesResult.error) {
      setErrorMessage(liabilitiesResult.error.message);
      setLoading(false);
      return;
    }

    const loadedAssets = (assetsResult.data || []) as Asset[];
    const loadedBankAccounts = (bankAccountsResult.data ||
      []) as BankAccount[];
    const loadedLiabilities = (liabilitiesResult.data ||
      []) as Liability[];

    setAssets(loadedAssets);
    setBankAccounts(loadedBankAccounts);
    setLiabilities(loadedLiabilities);

    const totalAssets =
      loadedAssets.reduce(
        (total, asset) => total + Number(asset.value || 0),
        0
      ) +
      loadedBankAccounts.reduce(
        (total, account) => total + Number(account.balance || 0),
        0
      );

    const totalLiabilities = loadedLiabilities.reduce(
      (total, liability) => total + Number(liability.value || 0),
      0
    );

    const netWorth = totalAssets - totalLiabilities;

    const today = new Date();

    const startOfDay = new Date(today);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999);

    const { data: existingSnapshot } = await supabase
      .from("net_worth_snapshots")
      .select("id")
      .eq("user_id", user.id)
      .gte("created_at", startOfDay.toISOString())
      .lte("created_at", endOfDay.toISOString())
      .limit(1);

    if (!existingSnapshot || existingSnapshot.length === 0) {
      await supabase.from("net_worth_snapshots").insert({
        user_id: user.id,
        net_worth: netWorth,
        total_assets: totalAssets,
        total_liabilities: totalLiabilities,
      });
    }

    const { data: snapshotData, error: snapshotError } =
      await supabase
        .from("net_worth_snapshots")
        .select(
          "created_at, net_worth, total_assets, total_liabilities"
        )
        .eq("user_id", user.id)
        .order("created_at", { ascending: true });

    if (snapshotError) {
      setErrorMessage(snapshotError.message);
      setLoading(false);
      return;
    }

    setSnapshots((snapshotData || []) as Snapshot[]);
    setLoading(false);
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const handleDeleteAsset = async (id: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this asset?"
    );

    if (!confirmed) return;

    const { error } = await supabase
      .from("assets")
      .delete()
      .eq("id", id);

    if (error) {
      alert(error.message);
      return;
    }

    loadDashboard();
  };

  const handleDeleteBankAccount = async (id: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this bank account?"
    );

    if (!confirmed) return;

    const { error } = await supabase
      .from("bank_accounts")
      .delete()
      .eq("id", id);

    if (error) {
      alert(error.message);
      return;
    }

    loadDashboard();
  };

  const handleDeleteLiability = async (id: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this liability?"
    );

    if (!confirmed) return;

    const { error } = await supabase
      .from("liabilities")
      .delete()
      .eq("id", id);

    if (error) {
      alert(error.message);
      return;
    }

    loadDashboard();
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(value);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f7f8f5] px-5 py-8">
        <div className="mx-auto max-w-7xl">
          <p className="text-gray-600">Loading your wealth dashboard...</p>
        </div>
      </main>
    );
  }

  const totalAssets =
    assets.reduce(
      (total, asset) => total + Number(asset.value || 0),
      0
    ) +
    bankAccounts.reduce(
      (total, account) => total + Number(account.balance || 0),
      0
    );

  const totalLiabilities = liabilities.reduce(
    (total, liability) => total + Number(liability.value || 0),
    0
  );

  const netWorth = totalAssets - totalLiabilities;

  const chartData = snapshots.map((snapshot) => ({
    date: new Date(snapshot.created_at).toLocaleDateString(
      "en-IN",
      {
        day: "numeric",
        month: "short",
      }
    ),
    netWorth: Number(snapshot.net_worth || 0),
  }));

  return (
    <main className="min-h-screen bg-[#f7f8f5]">

      {/* NAVIGATION */}

      <nav className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">

          <Link
            href="/dashboard"
            className="text-2xl font-bold tracking-tight text-[#26352b]"
          >
            Nivara
          </Link>

          <div className="hidden items-center gap-6 md:flex">
            <Link
              href="/dashboard"
              className="text-sm font-semibold text-[#5d8a68]"
            >
              Dashboard
            </Link>

            <Link
              href="/assets"
              className="text-sm text-gray-600 hover:text-[#26352b]"
            >
              Assets
            </Link>

            <Link
              href="/bank-accounts"
              className="text-sm text-gray-600 hover:text-[#26352b]"
            >
              Bank Accounts
            </Link>

            <Link
              href="/liabilities"
              className="text-sm text-gray-600 hover:text-[#26352b]"
            >
              Liabilities
            </Link>

            <Link
              href="/insights"
              className="text-sm text-gray-600 hover:text-[#26352b]"
            >
              Insights
            </Link>
          </div>
          <Link
  href="/settings"
  className="text-sm text-gray-600 hover:text-[#26352b]"
>
  Settings
</Link>

          <button
            onClick={handleLogout}
            className="rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
          >
            Logout
          </button>

        </div>
      </nav>

      <div className="mx-auto max-w-7xl px-5 py-8">

        {/* HEADER */}

        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">

          <div>
            <p className="text-sm font-medium text-[#5d8a68]">
              Your financial overview
            </p>

            <h1 className="mt-1 text-3xl font-bold text-[#26352b]">
              Wealth Dashboard
            </h1>

            <p className="mt-2 text-gray-600">
              Track everything you own, owe and build.
            </p>
          </div>

          <Link
            href="/insights"
            className="rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-[#26352b] shadow-sm hover:bg-gray-50"
          >
            View Insights →
          </Link>

        </div>

        {errorMessage && (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {errorMessage}
          </div>
        )}

        {/* NET WORTH */}

        <section className="mt-8 rounded-3xl bg-[#315c3b] p-7 text-white shadow-sm">

          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">

            <div>
              <p className="text-sm text-white/70">
                Current Net Worth
              </p>

              <h2 className="mt-2 text-4xl font-bold tracking-tight">
                {formatCurrency(netWorth)}
              </h2>

              <p className="mt-3 text-sm text-white/70">
                Updated from your recorded assets and liabilities
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:flex">

              <Link
                href="/assets"
                className="rounded-xl bg-white/10 px-4 py-3 text-center text-sm font-semibold hover:bg-white/20"
              >
                + Add Asset
              </Link>

              <Link
                href="/bank-accounts"
                className="rounded-xl bg-white/10 px-4 py-3 text-center text-sm font-semibold hover:bg-white/20"
              >
                + Bank Account
              </Link>

              <Link
                href="/liabilities"
                className="rounded-xl bg-white/10 px-4 py-3 text-center text-sm font-semibold hover:bg-white/20"
              >
                + Liability
              </Link>

            </div>

          </div>

        </section>

        {/* SUMMARY CARDS */}

        <section className="mt-6 grid gap-5 md:grid-cols-3">

          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">
              Total Assets
            </p>

            <p className="mt-2 text-2xl font-bold text-[#26352b]">
              {formatCurrency(totalAssets)}
            </p>

            <p className="mt-2 text-xs text-gray-500">
              {assets.length + bankAccounts.length} recorded items
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">
              Total Liabilities
            </p>

            <p className="mt-2 text-2xl font-bold text-[#26352b]">
              {formatCurrency(totalLiabilities)}
            </p>

            <p className="mt-2 text-xs text-gray-500">
              {liabilities.length} recorded liabilities
            </p>
          </div>

          <div className="rounded-2xl border border-[#dce8de] bg-[#eef5ef] p-6 shadow-sm">
            <p className="text-sm text-gray-600">
              Financial Position
            </p>

            <p className="mt-2 text-2xl font-bold text-[#315c3b]">
              {totalAssets > 0
                ? `${Math.max(
                    0,
                    ((totalAssets - totalLiabilities) /
                      totalAssets) *
                      100
                  ).toFixed(1)}%`
                : "0%"}
            </p>

            <p className="mt-2 text-xs text-gray-600">
              Net worth as a percentage of assets
            </p>
          </div>

        </section>

        {/* WEALTH HISTORY */}

        <section className="mt-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">

          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-[#26352b]">
                Wealth History
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Your recorded net-worth progress over time.
              </p>
            </div>

            <Link
              href="/insights"
              className="text-sm font-medium text-[#5d8a68] hover:underline"
            >
              Full insights
            </Link>
          </div>

          <div className="mt-6 h-72">

            {chartData.length < 2 ? (
              <div className="flex h-full items-center justify-center rounded-xl bg-[#f7f8f5] text-center">
                <div>
                  <p className="font-medium text-gray-700">
                    Your wealth history will appear here
                  </p>

                  <p className="mt-1 text-sm text-gray-500">
                    Keep using Nivara to build your financial history.
                  </p>
                </div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />

                  <XAxis dataKey="date" />

                  <YAxis />

                  <Tooltip
                    formatter={(value) =>
                      formatCurrency(Number(value))
                    }
                  />

                  <Line
                    type="monotone"
                    dataKey="netWorth"
                    stroke="#5d8a68"
                    strokeWidth={3}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}

          </div>

        </section>

        {/* QUICK ACTIONS */}

        <section className="mt-6">

          <h2 className="text-xl font-bold text-[#26352b]">
            Quick Actions
          </h2>

          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

            <Link
              href="/assets"
              className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <p className="text-lg font-bold text-[#26352b]">
                Add Asset
              </p>

              <p className="mt-2 text-sm text-gray-500">
                Add investments, property, gold or other assets.
              </p>
            </Link>

            <Link
              href="/bank-accounts"
              className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <p className="text-lg font-bold text-[#26352b]">
                Add Bank Account
              </p>

              <p className="mt-2 text-sm text-gray-500">
                Record your bank balances securely.
              </p>
            </Link>

            <Link
              href="/liabilities"
              className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <p className="text-lg font-bold text-[#26352b]">
                Add Liability
              </p>

              <p className="mt-2 text-sm text-gray-500">
                Track loans, credit cards and other debt.
              </p>
            </Link>

            <Link
              href="/insights"
              className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <p className="text-lg font-bold text-[#26352b]">
                View Insights
              </p>

              <p className="mt-2 text-sm text-gray-500">
                Understand your wealth allocation and trends.
              </p>
            </Link>

          </div>

        </section>

        {/* ASSETS */}

        <section className="mt-10">

          <div className="flex items-center justify-between">

            <div>
              <h2 className="text-xl font-bold text-[#26352b]">
                Assets
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Things you own.
              </p>
            </div>

            <Link
              href="/assets"
              className="text-sm font-medium text-[#5d8a68] hover:underline"
            >
              + Add Asset
            </Link>

          </div>

          <div className="mt-4 space-y-3">

            {assets.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-8 text-center">
                <p className="font-medium text-gray-700">
                  No assets added yet.
                </p>

                <Link
                  href="/assets"
                  className="mt-2 inline-block text-sm font-medium text-[#5d8a68] hover:underline"
                >
                  Add your first asset →
                </Link>
              </div>
            ) : (
              assets.map((asset) => (
                <div
                  key={asset.id}
                  className="flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="font-semibold text-[#26352b]">
                      {asset.name}
                    </p>

                    <p className="mt-1 text-sm text-gray-500">
                      {asset.category}
                    </p>
                  </div>

                  <div className="flex items-center justify-between gap-5 sm:justify-end">

                    <p className="font-semibold text-[#26352b]">
                      {formatCurrency(Number(asset.value))}
                    </p>

                    <Link
                      href={`/assets/edit/${asset.id}`}
                      className="text-xs font-medium text-[#5d8a68] hover:underline"
                    >
                      Edit
                    </Link>

                    <button
                      onClick={() => handleDeleteAsset(asset.id)}
                      className="text-xs font-medium text-red-600 hover:underline"
                    >
                      Delete
                    </button>

                  </div>
                </div>
              ))
            )}

          </div>

        </section>

        {/* BANK ACCOUNTS */}

        <section className="mt-10">

          <div className="flex items-center justify-between">

            <div>
              <h2 className="text-xl font-bold text-[#26352b]">
                Bank Accounts
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Your manually recorded bank balances.
              </p>
            </div>

            <Link
              href="/bank-accounts"
              className="text-sm font-medium text-[#5d8a68] hover:underline"
            >
              + Add Account
            </Link>

          </div>

          <div className="mt-4 space-y-3">

            {bankAccounts.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-8 text-center">
                <p className="font-medium text-gray-700">
                  No bank accounts added yet.
                </p>

                <Link
                  href="/bank-accounts"
                  className="mt-2 inline-block text-sm font-medium text-[#5d8a68] hover:underline"
                >
                  Add a bank account →
                </Link>
              </div>
            ) : (
              bankAccounts.map((account) => (
                <div
                  key={account.id}
                  className="flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="font-semibold text-[#26352b]">
                      {account.bank_name}
                    </p>

                    <p className="mt-1 text-sm text-gray-500">
                      {account.account_name} · {account.account_type}
                    </p>
                  </div>

                  <div className="flex items-center justify-between gap-5 sm:justify-end">

                    <p className="font-semibold text-[#26352b]">
                      {formatCurrency(Number(account.balance))}
                    </p>

                    <Link
                      href={`/bank-accounts/edit/${account.id}`}
                      className="text-xs font-medium text-[#5d8a68] hover:underline"
                    >
                      Edit
                    </Link>

                    <button
                      onClick={() =>
                        handleDeleteBankAccount(account.id)
                      }
                      className="text-xs font-medium text-red-600 hover:underline"
                    >
                      Delete
                    </button>

                  </div>
                </div>
              ))
            )}

          </div>

        </section>

        {/* LIABILITIES */}

        <section className="mt-10 pb-10">

          <div className="flex items-center justify-between">

            <div>
              <h2 className="text-xl font-bold text-[#26352b]">
                Liabilities
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Money you currently owe.
              </p>
            </div>

            <Link
              href="/liabilities"
              className="text-sm font-medium text-[#5d8a68] hover:underline"
            >
              + Add Liability
            </Link>

          </div>

          <div className="mt-4 space-y-3">

            {liabilities.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-8 text-center">
                <p className="font-medium text-gray-700">
                  No liabilities added yet.
                </p>

                <Link
                  href="/liabilities"
                  className="mt-2 inline-block text-sm font-medium text-[#5d8a68] hover:underline"
                >
                  Add a liability →
                </Link>
              </div>
            ) : (
              liabilities.map((liability) => (
                <div
                  key={liability.id}
                  className="flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="font-semibold text-[#26352b]">
                      {liability.name}
                    </p>

                    <p className="mt-1 text-sm text-gray-500">
                      {liability.category}
                    </p>
                  </div>

                  <div className="flex items-center justify-between gap-5 sm:justify-end">

                    <p className="font-semibold text-[#26352b]">
                      {formatCurrency(Number(liability.value))}
                    </p>

                    <Link
                      href={`/liabilities/edit/${liability.id}`}
                      className="text-xs font-medium text-[#5d8a68] hover:underline"
                    >
                      Edit
                    </Link>

                    <button
                      onClick={() =>
                        handleDeleteLiability(liability.id)
                      }
                      className="text-xs font-medium text-red-600 hover:underline"
                    >
                      Delete
                    </button>

                  </div>
                </div>
              ))
            )}

          </div>

        </section>

      </div>
    </main>
  );
}