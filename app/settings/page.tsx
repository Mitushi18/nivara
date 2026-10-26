"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function SettingsPage() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      setEmail(user.email || "");
      setLoading(false);
    };

    loadUser();
  }, []);

  const handleLogout = async () => {
    setLoggingOut(true);

    await supabase.auth.signOut();

    router.push("/login");
    router.refresh();
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f7f8f5] px-6 py-10">
        <div className="mx-auto max-w-4xl">
          <p className="text-gray-600">Loading settings...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f7f8f5] px-6 py-10">
      <div className="mx-auto max-w-4xl">

        <Link
          href="/dashboard"
          className="text-sm font-medium text-[#5d8a68] hover:underline"
        >
          ← Back to Dashboard
        </Link>

        <div className="mt-6">
          <h1 className="text-3xl font-bold text-[#26352b]">
            Settings
          </h1>

          <p className="mt-2 text-gray-600">
            Manage your Nivara account and preferences.
          </p>
        </div>

        {/* ACCOUNT */}

        <section className="mt-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">

          <h2 className="text-xl font-bold text-[#26352b]">
            Account
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Your Nivara account information.
          </p>

          <div className="mt-6 rounded-xl bg-[#f7f8f5] p-5">

            <p className="text-sm text-gray-500">
              Email address
            </p>

            <p className="mt-2 font-medium text-[#26352b]">
              {email}
            </p>

          </div>

        </section>

        {/* SECURITY */}

        <section className="mt-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">

          <h2 className="text-xl font-bold text-[#26352b]">
            Security
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Keep your Nivara account secure.
          </p>

          <div className="mt-6 rounded-xl border border-gray-200 p-5">

            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">

              <div>
                <p className="font-semibold text-[#26352b]">
                  Account authentication
                </p>

                <p className="mt-1 text-sm text-gray-500">
                  Your account is protected by Supabase authentication.
                </p>
              </div>

              <span className="w-fit rounded-full bg-[#eef5ef] px-3 py-1 text-xs font-semibold text-[#315c3b]">
                Protected
              </span>

            </div>

          </div>

        </section>

        {/* PRIVACY */}

        <section className="mt-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">

          <h2 className="text-xl font-bold text-[#26352b]">
            Privacy
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Important information about your financial data.
          </p>

          <div className="mt-6 rounded-xl bg-[#f7f8f5] p-5">

            <p className="font-semibold text-[#26352b]">
              Your financial information
            </p>

            <p className="mt-2 text-sm leading-6 text-gray-600">
              Nivara currently stores the financial information that you
              choose to enter, such as assets, bank balances and
              liabilities. Your data is associated with your account so
              that other users cannot access it through Nivara.
            </p>

            <p className="mt-3 text-sm leading-6 text-gray-600">
              Never enter bank passwords, UPI PINs, OTPs, debit-card PINs
              or other banking credentials into Nivara.
            </p>

          </div>

        </section>

        {/* FUTURE PLAN */}

        <section className="mt-6 rounded-2xl border border-[#dce8de] bg-[#eef5ef] p-6">

          <p className="text-sm font-semibold text-[#5d8a68]">
            COMING SOON
          </p>

          <h2 className="mt-2 text-xl font-bold text-[#26352b]">
            Nivara Plans
          </h2>

          <p className="mt-2 text-sm leading-6 text-gray-600">
            Paid Nivara plans will eventually provide additional
            features such as advanced insights, richer wealth analytics
            and other premium tools.
          </p>

        </section>

        {/* LOGOUT */}

        <section className="mt-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">

          <h2 className="text-xl font-bold text-[#26352b]">
            Account Actions
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Manage your current session.
          </p>

          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="mt-6 rounded-xl border border-red-200 px-5 py-3 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loggingOut ? "Logging out..." : "Log out"}
          </button>

        </section>

        <p className="mt-8 pb-4 text-center text-xs text-gray-400">
          Nivara · Personal Wealth Operating System
        </p>

      </div>
    </main>
  );
}