"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";

const COOLDOWN_SECONDS = 60;

export default function LoginPage() {
  const router = useRouter();
  const [isLocal, setIsLocal] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const local =
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1";
    setIsLocal(local);

    // Read error from query string after mount (avoids useSearchParams SSR mismatch)
    const params = new URLSearchParams(window.location.search);
    const e = params.get("error");
    const desc = params.get("error_description");
    if (e) {
      setError(
        desc
          ? decodeURIComponent(desc.replace(/\+/g, " "))
          : "Magic link expired or invalid. Please try again."
      );
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  function startCooldown() {
    setCooldown(COOLDOWN_SECONDS);
    timerRef.current = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!isLocal && cooldown > 0) return;
    setLoading(true);
    setError(null);

    const supabase = createClient();

    if (isLocal) {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setError(error.message);
      } else if (data.user?.email) {
        // Fetch role to redirect to the right home page
        const res = await fetch(`/api/profile-role?email=${encodeURIComponent(data.user.email)}`);
        const json = res.ok ? await res.json() : {};
        const home =
          json.role === "counsellor"  ? "/counsellor"  :
          json.role === "institution" ? "/institution" :
          json.role === "student"     ? "/student"     :
          "/dashboard";
        router.push(home);
        return;
      }
    } else {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: `${location.origin}/auth/callback` },
      });
      if (error) {
        if (error.status === 429) {
          setError("Too many requests — please wait a minute before trying again.");
          startCooldown();
        } else {
          setError(error.message);
        }
      } else {
        setSent(true);
        startCooldown();
      }
    }
    setLoading(false);
  }

  if (sent) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-900">
        <div className="w-full max-w-sm rounded-2xl bg-white p-8 text-center shadow-xl space-y-4">
          {/* Mail icon */}
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-blue-50">
            <svg className="h-7 w-7 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25H4.5a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0l-9.75 7.5-9.75-7.5" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-gray-900">Check your inbox</h1>
          <p className="text-sm text-gray-500">
            We sent a magic link to{" "}
            <span className="font-semibold text-gray-900">{email}</span>.
            Click it to sign in.
          </p>
          <div className="space-y-2">
            <button
              onClick={() => setSent(false)}
              className="block w-full text-sm text-blue-600 hover:underline"
            >
              Use a different email
            </button>
            {cooldown > 0 ? (
              <p className="text-xs text-gray-400">Resend available in {cooldown}s</p>
            ) : (
              <button
                onClick={() => handleLogin({ preventDefault: () => {} } as React.FormEvent)}
                className="block w-full text-xs text-gray-400 hover:text-gray-600 hover:underline"
              >
                Didn’t receive it? Resend
              </button>
            )}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-900">
      <div className="w-full max-w-sm">
        {/* Logo / brand */}
        <div className="mb-8 text-center">
          <span className="inline-block rounded-xl bg-blue-600 px-4 py-2 text-xl font-black tracking-widest text-white">
            AKEB
          </span>
          <p className="mt-3 text-sm text-slate-400">Career Counselling Platform</p>
        </div>

        <form
          onSubmit={handleLogin}
          className="rounded-2xl bg-white p-8 shadow-xl space-y-5"
        >
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Sign in</h1>
            <p className="mt-1 text-sm text-gray-500" suppressHydrationWarning>
              {isLocal ? "Local dev — password login." : "Enter your email to receive a magic link."}
            </p>
          </div>

          {error && (
            <div className="flex items-start gap-2 rounded-lg bg-red-50 border border-red-200 px-3 py-2">
              <svg className="mt-0.5 h-4 w-4 shrink-0 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
              </svg>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
              Email address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              placeholder="you@example.com"
              className="w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          {isLocal && (
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2.5 text-sm text-gray-900 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading || (!isLocal && cooldown > 0)}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <>
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                </svg>
                Signing in…
              </>
            ) : isLocal ? (
              "Sign in"
            ) : cooldown > 0 ? (
              `Resend available in ${cooldown}s`
            ) : (
              "Send magic link"
            )}
          </button>
        </form>

        <div className="mt-6 space-y-2 text-center">
          <p className="text-xs text-slate-500">
            New student?{" "}
            <a href="/student/register" className="font-semibold text-blue-400 hover:text-blue-300 transition-colors">
              Create an account
            </a>
          </p>
          <p className="text-xs text-slate-500">
            Only registered users can access this platform.
          </p>
        </div>
      </div>
    </main>
  );
}

