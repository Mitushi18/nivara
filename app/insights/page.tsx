"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
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

export default function InsightsPage() {
  const supabase = createClient();

  const [assets, setAssets] = useState<Asset[]>([]);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [liabilities, setLiabilities] = useState<Liability[]>([]);
  const [snapshots, setSnapshots] = useState<Snapshot[]>([]);

  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const loadData = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        window.location.href = "/login";
        return;
      }

      const [
        assetsResult,
        bankAccountsResult,
        liabilitiesResult,
        snapshotsResult,
      ] = await Promise.all([
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

        supabase
          .from("net_worth_snapshots")
          .select("created_at, net_worth, total_assets, total_liabilities")
          .eq("user_id", user.id)
          .order("created_at", { ascending: true }),
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

      if (snapshotsResult.error) {
        setErrorMessage(snapshotsResult.error.message);
        setLoading(false);
        return;
      }

      setAssets((assetsResult.data || []) as Asset[]);
      setBankAccounts((bankAccountsResult.data || []) as BankAccount[]);
      setLiabilities((liabilitiesResult.data || []) as Liability[]);
      setSnapshots((snapshotsResult.data || []) as Snapshot[]);

      setLoading(false);
    };

    loadData();
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f7f8f5] px-6 py-10">
        <div className="mx-auto max-w-6xl">
          <p className="text-gray-600">Loading your insights...</p>
        </div>
      </main>
    );
  }

  const totalAssetValue =
    assets.reduce(
      (total, asset) => total + Number(asset.value || 0),
      0
    ) +
    bankAccounts.reduce(
      (total, account) => total + Number(account.balance || 0),
      0
    );

  const totalLiabilityValue = liabilities.reduce(
    (total, liability) => total + Number(liability.value || 0),
    0
  );

  const netWorth = totalAssetValue - totalLiabilityValue;

  const debtToAssets =
    totalAssetValue > 0
      ? (totalLiabilityValue / totalAssetValue) * 100
      : 0;

  const firstSnapshot = snapshots[0];
  const latestSnapshot = snapshots[snapshots.length - 1];

  const netWorthChange =
    firstSnapshot && latestSnapshot
      ? latestSnapshot.net_worth - firstSnapshot.net_worth
      : 0;

  const netWorthChangePercentage =
    firstSnapshot && firstSnapshot.net_worth !== 0
      ? (netWorthChange / Math.abs(firstSnapshot.net_worth)) * 100
      : 0;

  const allocationMap: Record<string, number> = {};

  assets.forEach((asset) => {
    allocationMap[asset.category] =
      (allocationMap[asset.category] || 0) +
      Number(asset.value || 0);
  });

  if (bankAccounts.length > 0) {
    allocationMap["Bank Accounts"] =
      (allocationMap["Bank Accounts"] || 0) +
      bankAccounts.reduce(
        (total, account) => total + Number(account.balance || 0),
        0
      );
  }

  const allocationData = Object.entries(allocationMap)
    .filter(([, value]) => value > 0)
    .map(([name, value]) => ({
      name,
      value,
    }));

  const largestAssetCategory =
    allocationData.length > 0
      ? allocationData.reduce((largest, current) =>
          current.value > largest.value ? current : largest
        )
      : null;

  const largestAssetPercentage =
    largestAssetCategory && totalAssetValue > 0
      ? (largestAssetCategory.value / totalAssetValue) * 100
      : 0;

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(value);

  return (
    <main className="min-h-screen bg-[#f7f8f5] px-6 py-10">
      <div className="mx-auto max-w-6xl">

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Link
              href="/dashboard"
              className="text-sm font-medium text-[#5d8a68] hover:underline"
            >
              ← Back to Dashboard
            </Link>

            <h1 className="mt-4 text-3xl font-bold text-[#26352b]">
              Financial Insights
            </h1>

            <p className="mt-2 text-gray-600">
              Understand how your wealth is structured and changing.
            </p>
          </div>
        </div>

        {errorMessage && (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {errorMessage}
          </div>
        )}

        {/* Main summary */}

        <section className="mt-8 grid gap-5 md:grid-cols-3">

          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">
              Total Assets
            </p>

            <p className="mt-3 text-2xl font-bold text-[#26352b]">
              {formatCurrency(totalAssetValue)}
            </p>

            <p className="mt-2 text-sm text-gray-500">
              Everything you own
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">
              Total Liabilities
            </p>

            <p className="mt-3 text-2xl font-bold text-[#26352b]">
              {formatCurrency(totalLiabilityValue)}
            </p>

            <p className="mt-2 text-sm text-gray-500">
              Everything you owe
            </p>
          </div>

          <div className="rounded-2xl border border-[#dce8de] bg-[#eef5ef] p-6 shadow-sm">
            <p className="text-sm text-gray-600">
              Net Worth
            </p>

            <p className="mt-3 text-2xl font-bold text-[#315c3b]">
              {formatCurrency(netWorth)}
            </p>

            <p className="mt-2 text-sm text-gray-600">
              Assets minus liabilities
            </p>
          </div>

        </section>

        {/* Financial health */}

        <section className="mt-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">

          <h2 className="text-xl font-bold text-[#26352b]">
            Financial Health
          </h2>

          <div className="mt-6 grid gap-5 md:grid-cols-2">

            <div className="rounded-xl bg-[#f7f8f5] p-5">
              <p className="text-sm text-gray-500">
                Debt-to-Assets Ratio
              </p>

              <p className="mt-2 text-2xl font-bold text-[#26352b]">
                {debtToAssets.toFixed(1)}%
              </p>

              <p className="mt-2 text-sm text-gray-600">
                {debtToAssets === 0
                  ? "You currently have no recorded liabilities."
                  : debtToAssets < 30
                  ? "Your recorded debt is relatively low compared with your assets."
                  : debtToAssets < 60
                  ? "A meaningful portion of your assets is financed by debt."
                  : "Your liabilities represent a large portion of your assets."}
              </p>
            </div>

            <div className="rounded-xl bg-[#f7f8f5] p-5">
              <p className="text-sm text-gray-500">
                Largest Asset Category
              </p>

              {largestAssetCategory ? (
                <>
                  <p className="mt-2 text-2xl font-bold text-[#26352b]">
                    {largestAssetCategory.name}
                  </p>

                  <p className="mt-2 text-sm text-gray-600">
                    {largestAssetPercentage.toFixed(1)}% of your recorded
                    assets are in this category.
                  </p>
                </>
              ) : (
                <>
                  <p className="mt-2 text-2xl font-bold text-[#26352b]">
                    No data yet
                  </p>

                  <p className="mt-2 text-sm text-gray-600">
                    Add assets or bank accounts to see your allocation.
                  </p>
                </>
              )}
            </div>

          </div>
        </section>

        {/* Asset allocation */}

        <section className="mt-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">

          <h2 className="text-xl font-bold text-[#26352b]">
            Asset Allocation
          </h2>

          <p className="mt-2 text-sm text-gray-500">
            See where your recorded wealth is concentrated.
          </p>

          {allocationData.length === 0 ? (
            <div className="mt-6 rounded-xl bg-[#f7f8f5] p-8 text-center">
              <p className="font-medium text-gray-700">
                No asset data available yet.
              </p>

              <Link
                href="/assets"
                className="mt-3 inline-block text-sm font-medium text-[#5d8a68] hover:underline"
              >
                Add your first asset →
              </Link>
            </div>
          ) : (
            <div className="mt-6 grid gap-8 md:grid-cols-2">

              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={allocationData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label
                    >
                      {allocationData.map((entry, index) => (
                        <Cell key={`cell-${index}`} />
                      ))}
                    </Pie>

                    <Tooltip
                      formatter={(value) =>
                        formatCurrency(Number(value))
                      }
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-3">
                {allocationData.map((item) => {
                  const percentage =
                    totalAssetValue > 0
                      ? (item.value / totalAssetValue) * 100
                      : 0;

                  return (
                    <div
                      key={item.name}
                      className="flex items-center justify-between rounded-xl bg-[#f7f8f5] p-4"
                    >
                      <div>
                        <p className="font-medium text-[#26352b]">
                          {item.name}
                        </p>

                        <p className="text-xs text-gray-500">
                          {percentage.toFixed(1)}% of assets
                        </p>
                      </div>

                      <p className="font-semibold text-[#26352b]">
                        {formatCurrency(item.value)}
                      </p>
                    </div>
                  );
                })}
              </div>

            </div>
          )}
        </section>

        {/* Wealth history */}

        <section className="mt-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">

          <h2 className="text-xl font-bold text-[#26352b]">
            Wealth Progress
          </h2>

          <p className="mt-2 text-sm text-gray-500">
            Your recorded net-worth progress.
          </p>

          <div className="mt-6 grid gap-5 md:grid-cols-2">

            <div className="rounded-xl bg-[#f7f8f5] p-5">
              <p className="text-sm text-gray-500">
                Recorded Snapshots
              </p>

              <p className="mt-2 text-2xl font-bold text-[#26352b]">
                {snapshots.length}
              </p>

              <p className="mt-2 text-sm text-gray-600">
                More snapshots will make your wealth trend more useful.
              </p>
            </div>

            <div className="rounded-xl bg-[#f7f8f5] p-5">
              <p className="text-sm text-gray-500">
                Change Since First Snapshot
              </p>

              <p className="mt-2 text-2xl font-bold text-[#26352b]">
                {formatCurrency(netWorthChange)}
              </p>

              {firstSnapshot && latestSnapshot && (
                <p className="mt-2 text-sm text-gray-600">
                  {netWorthChangePercentage >= 0 ? "+" : ""}
                  {netWorthChangePercentage.toFixed(1)}%
                </p>
              )}
            </div>

          </div>
        </section>

        {/* Insights */}

        <section className="mt-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">

          <h2 className="text-xl font-bold text-[#26352b]">
            Nivara Insights
          </h2>

          <div className="mt-5 space-y-4">

            {totalAssetValue === 0 && (
              <div className="rounded-xl border border-gray-200 bg-[#f7f8f5] p-4">
                <p className="font-semibold text-[#26352b]">
                  Start building your wealth picture
                </p>

                <p className="mt-1 text-sm text-gray-600">
                  Add your assets and bank accounts so Nivara can start
                  analysing your finances.
                </p>
              </div>
            )}

            {totalAssetValue > 0 && debtToAssets === 0 && (
              <div className="rounded-xl border border-gray-200 bg-[#f7f8f5] p-4">
                <p className="font-semibold text-[#26352b]">
                  No recorded debt
                </p>

                <p className="mt-1 text-sm text-gray-600">
                  You currently have no liabilities recorded in Nivara.
                </p>
              </div>
            )}

            {debtToAssets >= 60 && (
              <div className="rounded-xl border border-gray-200 bg-[#f7f8f5] p-4">
                <p className="font-semibold text-[#26352b]">
                  Debt deserves attention
                </p>

                <p className="mt-1 text-sm text-gray-600">
                  Your recorded liabilities are a large portion of your
                  recorded assets. Consider reviewing your debt structure.
                </p>
              </div>
            )}

            {largestAssetCategory && largestAssetPercentage >= 50 && (
              <div className="rounded-xl border border-gray-200 bg-[#f7f8f5] p-4">
                <p className="font-semibold text-[#26352b]">
                  Your wealth is concentrated
                </p>

                <p className="mt-1 text-sm text-gray-600">
                  More than half of your recorded assets are in{" "}
                  {largestAssetCategory.name}. Understanding concentration
                  can help you evaluate diversification.
                </p>
              </div>
            )}

            {snapshots.length < 2 && (
              <div className="rounded-xl border border-gray-200 bg-[#f7f8f5] p-4">
                <p className="font-semibold text-[#26352b]">
                  Keep tracking
                </p>

                <p className="mt-1 text-sm text-gray-600">
                  Nivara will become more useful as it builds a longer
                  history of your net worth.
                </p>
              </div>
            )}

            {snapshots.length >= 2 && netWorthChange > 0 && (
              <div className="rounded-xl border border-gray-200 bg-[#f7f8f5] p-4">
                <p className="font-semibold text-[#26352b]">
                  Your recorded net worth has increased
                </p>

                <p className="mt-1 text-sm text-gray-600">
                  Since your first recorded snapshot, your net worth has
                  increased by {formatCurrency(netWorthChange)}.
                </p>
              </div>
            )}

            {snapshots.length >= 2 && netWorthChange < 0 && (
              <div className="rounded-xl border border-gray-200 bg-[#f7f8f5] p-4">
                <p className="font-semibold text-[#26352b]">
                  Your recorded net worth has decreased
                </p>

                <p className="mt-1 text-sm text-gray-600">
                  Since your first recorded snapshot, your net worth has
                  decreased by {formatCurrency(Math.abs(netWorthChange))}.
                </p>
              </div>
            )}

          </div>
        </section>

      </div>
    </main>
  );
}