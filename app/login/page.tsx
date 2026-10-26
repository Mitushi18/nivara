"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setLoading(true);
    setError("");

    const supabase = createClient();

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
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
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6">
        <Link
          href="/"
          className="text-2xl font-bold tracking-tight"
        >
          Nivara<span className="text-[#5d8a68]">.</span>
        </Link>

        <Link
          href="/signup"
          className="text-sm font-medium hover:text-[#5d8a68]"
        >
          Create an account
        </Link>
      </nav>

      <section className="flex min-h-[calc(100vh-90px)] items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-xl">
            <div className="mb-8">
              <p className="text-sm font-semibold uppercase tracking-widest text-[#5d8a68]">
                Welcome back
              </p>

              <h1 className="mt-3 text-3xl font-semibold tracking-tight">
                Log in to Nivara
              </h1>

              <p className="mt-3 text-sm leading-6 text-gray-500">
                Continue tracking your wealth and financial progress.
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
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
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Your password"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-[#5d8a68]"
                />
              </div>

              {error && (
                <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-[#172019] px-5 py-3.5 font-medium text-white transition hover:bg-[#2a382d] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Logging in..." : "Log in"}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-gray-500">
              Don't have an account?{" "}
              <Link
                href="/signup"
                className="font-medium text-[#45664d] hover:underline"
              >
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}