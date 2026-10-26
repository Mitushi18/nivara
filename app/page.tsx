"use client";

import React from "react";
import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#f7f8f4] text-[#172019]">
      {/* Navigation */}
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6">
        <div className="text-2xl font-bold tracking-tight">
          Nivara<span className="text-[#5d8a68]">.</span>
        </div>

        <div className="hidden items-center gap-8 text-sm md:flex">
          <a href="#features" className="hover:text-[#5d8a68]">
            Features
          </a>
          <a href="#how-it-works" className="hover:text-[#5d8a68]">
            How it works
          </a>
          <a href="#security" className="hover:text-[#5d8a68]">
            Security
          </a>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="rounded-full px-4 py-2 text-sm font-medium hover:bg-white"
          >
            Log in
          </Link>
          <Link
            href="/login"
            className="rounded-full bg-[#172019] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#2a382d]"
          >
            Get started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="mx-auto max-w-7xl px-6 pb-20 pt-16 md:pb-28 md:pt-24">
        <div className="grid items-center gap-14 md:grid-cols-2">
          <div>
            <div className="mb-6 inline-flex rounded-full bg-[#e5eee5] px-4 py-2 text-sm font-medium text-[#45664d]">
              Your wealth, in one place
            </div>

            <h1 className="max-w-3xl text-5xl font-semibold leading-[1.05] tracking-tight md:text-7xl">
              Know your money.
              <br />
              <span className="text-[#5d8a68]">Grow your wealth.</span>
            </h1>

            <p className="mt-7 max-w-xl text-lg leading-8 text-gray-600">
              Nivara gives you a clear picture of your net worth, assets,
              liabilities and financial progress — all in one simple dashboard.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/login"
                className="inline-block rounded-full bg-[#172019] px-7 py-4 text-center font-medium text-white shadow-sm hover:bg-[#2a382d]"
              >
                Start tracking for free
              </Link>

              <a
                href="#how-it-works"
                className="inline-block rounded-full border border-gray-300 bg-white px-7 py-4 text-center font-medium hover:bg-gray-50"
              >
                See how it works
              </a>
            </div>

            <p className="mt-5 text-sm text-gray-500">
              No credit card required.
            </p>
          </div>

          {/* Dashboard Preview */}
          <div className="relative">
            <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-2xl shadow-gray-200/60">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Net Worth</p>
                  <p className="mt-1 text-3xl font-semibold">₹42,85,000</p>
                </div>

                <div className="rounded-full bg-[#e5eee5] px-3 py-1.5 text-sm font-medium text-[#45664d]">
                  +12.4%
                </div>
              </div>

              {/* Fake chart */}
              <div className="flex h-48 items-end gap-3 rounded-2xl bg-[#f7f8f4] p-5">
                {[35, 48, 42, 60, 57, 72, 68, 85, 78, 96].map(
                  (height, index) => (
                    <div
                      key={index}
                      className="flex-1 rounded-t-md bg-[#7fa488]"
                      style={{ height: `${height}%` }}
                    />
                  )
                )}
              </div>

              <div className="mt-5 grid grid-cols-2 gap-4">
                <div className="rounded-2xl bg-[#f7f8f4] p-4">
                  <p className="text-xs text-gray-500">Assets</p>
                  <p className="mt-1 text-lg font-semibold">₹56.2L</p>
                </div>

                <div className="rounded-2xl bg-[#f7f8f4] p-4">
                  <p className="text-xs text-gray-500">Liabilities</p>
                  <p className="mt-1 text-lg font-semibold">₹13.35L</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="border-t border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-20 md:py-28">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-widest text-[#5d8a68]">
              Everything in one place
            </p>

            <h2 className="mt-3 text-4xl font-semibold tracking-tight md:text-5xl">
              A simple operating system for your wealth.
            </h2>
          </div>

          <div className="mt-14 grid gap-5 md:grid-cols-3">
            <FeatureCard
              title="Net Worth"
              description="See what you truly own after accounting for everything you owe."
              icon="₹"
            />

            <FeatureCard
              title="Assets"
              description="Track bank accounts, investments, property, gold and other assets."
              icon="↗"
            />

            <FeatureCard
              title="Insights"
              description="Understand how your wealth changes over time and where it is going."
              icon="◌"
            />
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="bg-[#172019] text-white">
        <div className="mx-auto max-w-7xl px-6 py-20 md:py-28">
          <p className="text-sm font-semibold uppercase tracking-widest text-[#a7c5ad]">
            How Nivara works
          </p>

          <h2 className="mt-3 max-w-2xl text-4xl font-semibold tracking-tight md:text-5xl">
            Start with your complete financial picture.
          </h2>

          <div className="mt-14 grid gap-8 md:grid-cols-3">
            <Step number="01" title="Add your accounts">
              Add your bank accounts, investments, property and other assets.
            </Step>

            <Step number="02" title="Add what you owe">
              Record loans, credit cards and other liabilities.
            </Step>

            <Step number="03" title="Track your progress">
              Nivara calculates your net worth and helps you understand your
              financial journey.
            </Step>
          </div>
        </div>
      </section>

      {/* Security */}
      <section id="security" className="bg-[#f7f8f4]">
        <div className="mx-auto max-w-4xl px-6 py-20 text-center md:py-28">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#e5eee5] text-2xl">
            🔒
          </div>

          <h2 className="mt-6 text-4xl font-semibold tracking-tight">
            Your financial data belongs to you.
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-gray-600">
            Nivara will be designed with privacy and security at its core.
            We will never ask you to share sensitive credentials such as your
            bank password, UPI PIN or investment account password.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-6 py-20 md:py-28">
          <div className="rounded-3xl bg-[#dfeade] px-8 py-14 text-center md:px-16">
            <h2 className="text-4xl font-semibold tracking-tight md:text-5xl">
              Your wealth deserves a dashboard.
            </h2>

            <p className="mx-auto mt-5 max-w-xl text-gray-600">
              Start building a clearer picture of your financial future with
              Nivara.
            </p>

            <Link
              href="/login"
              className="mt-8 inline-block rounded-full bg-[#172019] px-7 py-4 font-medium text-white hover:bg-[#2a382d]"
            >
              Create your free account
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-6 py-8 text-sm text-gray-500 md:flex-row md:items-center md:justify-between">
          <p>© 2026 Nivara. All rights reserved.</p>
          <p>Personal wealth, made simple.</p>
        </div>
      </footer>
    </main>
  );
}

function FeatureCard({
  title,
  description,
  icon,
}: {
  title: string;
  description: string;
  icon: string;
}) {
  return (
    <div className="rounded-3xl border border-gray-200 bg-[#f7f8f4] p-7">
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#dfeade] text-lg font-semibold text-[#45664d]">
        {icon}
      </div>

      <h3 className="mt-6 text-xl font-semibold">{title}</h3>

      <p className="mt-3 leading-7 text-gray-600">{description}</p>
    </div>
  );
}

function Step({
  number,
  title,
  children,
}: {
  number: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border-t border-white/20 pt-6">
      <p className="text-sm text-[#a7c5ad]">{number}</p>

      <h3 className="mt-5 text-2xl font-semibold">{title}</h3>

      <p className="mt-3 leading-7 text-white/65">{children}</p>
    </div>
  );
}