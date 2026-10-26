"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleSignup(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setLoading(true);
    setMessage("");
    setError("");

    const supabase = createClient();

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
        },
      },
    });

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    setMessage(
      "Account created. Check your email to confirm your Nivara account."
    );
  }

  return (
    <main className="min-h-screen bg-[#f7f8f4]">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6">
        <Link
          href="/"
          className="text-2xl font-bold tracking-tight"
        >
          Nivara<span className="text-[#5d8a68]">.</span>
        </Link>

        <Link
          href="/login"
          className="text-sm font-medium hover:text-[#5d8a68]"
        >
          Already have an account? Log in
        </Link>
      </nav>

      <section className="flex min-h-[calc(100vh-90px)] items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-xl">
            <div className="mb-8">
              <p className="text-sm font-semibold uppercase tracking-widest text-[#5d8a68]">
                Welcome to Nivara
              </p>

              <h1 className="mt-3 text-3xl font-semibold tracking-tight">
                Create your account
              </h1>

              <p className="mt-3 text-sm leading-6 text-gray-500">
                Start tracking your net worth and building a clearer picture
                of your wealth.
              </p>
            </div>

            <form onSubmit={handleSignup} className="space-y-5">
              <div>
                <label
                  htmlFor="name"
                  className="mb-2 block text-sm font-medium"
                >
                  Full name
                </label>

                <input
                  id="name"
                  type="text"
                  required
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Your name"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-[#5d8a68]"
                />
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-medium"
                >
                  Email address
                </label>

                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@example.com"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-[#5d8a68]"
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="mb-2 block text-sm font-medium"
                >
                  Password
                </label>

                <input
                  id="password"
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Create a password"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-[#5d8a68]"
                />

                <p className="mt-2 text-xs text-gray-500">
                  Use at least 6 characters.
                </p>
              </div>

              {error && (
                <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              {message && (
                <div className="rounded-xl bg-[#e5eee5] px-4 py-3 text-sm text-[#45664d]">
                  {message}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-[#172019] px-5 py-3.5 font-medium text-white transition hover:bg-[#2a382d] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Creating account..." : "Create account"}
              </button>
            </form>

            <p className="mt-6 text-center text-xs leading-5 text-gray-500">
              By creating an account, you agree to Nivara's Terms of Service
              and Privacy Policy.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}