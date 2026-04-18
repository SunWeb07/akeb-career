"use client";

import { createClient } from "@/lib/supabase";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";

interface NavBarProps {
  userName: string;
  role: string;
}

const roleStyles: Record<string, string> = {
  admin: "bg-rose-100 text-rose-700",
  counsellor: "bg-emerald-100 text-emerald-700",
  institution: "bg-violet-100 text-violet-700",
  student: "bg-sky-100 text-sky-700",
};

const roleLinks: Record<string, { label: string; href: string }[]> = {
  admin: [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Counsellor", href: "/counsellor" },
    { label: "Institution", href: "/institution" },
  ],
  counsellor: [
    { label: "Dashboard", href: "/dashboard" },
    { label: "My Sessions", href: "/counsellor" },
  ],
  institution: [
    { label: "Dashboard", href: "/dashboard" },
    { label: "My Institution", href: "/institution" },
  ],
};

export default function NavBar({ userName, role }: NavBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const links = roleLinks[role] ?? [{ label: "Dashboard", href: "/dashboard" }];

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  }

  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <header className="sticky top-0 z-10 border-b border-gray-200 bg-white shadow-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        {/* Brand + nav links */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <span className="rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-black tracking-widest text-white">
              AKEB
            </span>
            <span className="hidden text-sm text-gray-400 sm:block">Career Counselling</span>
          </div>

          <nav className="hidden items-center gap-1 sm:flex">
            {links.map(({ label, href }) => {
              const active = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                    active
                      ? "bg-indigo-50 text-indigo-700"
                      : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                  }`}
                >
                  {label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User section */}
        <div className="flex items-center gap-3">
          <span
            className={`hidden rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize sm:inline-block ${
              roleStyles[role] ?? "bg-gray-100 text-gray-600"
            }`}
          >
            {role}
          </span>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700">
              {initials}
            </div>
            <span className="hidden text-sm font-medium text-gray-700 sm:block">{userName}</span>
          </div>
          <button
            onClick={handleLogout}
            className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-500 transition-colors hover:bg-gray-50 hover:text-gray-900"
          >
            Sign out
          </button>
        </div>
      </div>
    </header>
  );
}
