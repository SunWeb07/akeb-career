"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";

interface SidebarProps {
  userName: string;
  role: string;
}

const roleBadge: Record<string, { label: string; style: string }> = {
  admin:       { label: "Admin",            style: "bg-[#e6f1fb] text-[#1a4f8a]" },
  counsellor:  { label: "Career Counsellor",style: "bg-[#faeeda] text-[#854f0b]" },
  institution: { label: "Institution",      style: "bg-[#f1efff] text-[#534ab7]" },
  student:     { label: "Student",          style: "bg-[#f1efff] text-[#534ab7]" },
};

type NavItem = { label: string; href: string; icon: string };
type NavSection = { section: string; items: NavItem[] };

const navByRole: Record<string, NavSection[]> = {
  admin: [
    {
      section: "Overview",
      items: [
        { label: "Dashboard",          href: "/dashboard",  icon: "📊" },
        { label: "All Students",       href: "/students",   icon: "🎓" },
        { label: "All Sessions",       href: "/counsellor", icon: "📋" },
      ],
    },
    {
      section: "Management",
      items: [
        { label: "Mindler Assessments",href: "/mindler",    icon: "🧠" },
        { label: "Reports & Analytics",href: "/reports",    icon: "📈" },
        { label: "Data Migration",     href: "/migration",  icon: "📂" },
      ],
    },
  ],
  counsellor: [
    {
      section: "Sessions",
      items: [
        { label: "Dashboard",          href: "/dashboard",  icon: "📊" },
        { label: "Pending Sessions",   href: "/counsellor", icon: "⏳" },
        { label: "My Students",        href: "/students",   icon: "🎓" },
      ],
    },
  ],
  institution: [
    {
      section: "Overview",
      items: [
        { label: "My Institution",     href: "/institution",     icon: "🏢" },
        { label: "My Students",        href: "/students",        icon: "🎓" },
      ],
    },
    {
      section: "Requests",
      items: [
        { label: "New Request",        href: "/institution/requests/new", icon: "➕" },
        { label: "My Requests",        href: "/institution/requests",     icon: "📋" },
      ],
    },
  ],
  student: [
    {
      section: "My Journey",
      items: [
        { label: "My Dashboard",       href: "/student",                 icon: "🏠" },
        { label: "My Sessions",        href: "/student/sessions",        icon: "📋" },
        { label: "My Tasks",           href: "/student/tasks",           icon: "✅" },
        { label: "Request Session",    href: "/student/request-session", icon: "📞" },
      ],
    },
  ],
};

export default function Sidebar({ userName, role }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const sections = navByRole[role] ?? navByRole.admin;
  const badge = roleBadge[role] ?? roleBadge.admin;

  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  }

  return (
    <aside
      className="flex w-60 shrink-0 flex-col border-r"
      style={{ background: "var(--surface)", borderColor: "var(--border)" }}
    >
      {/* Header */}
      <div className="border-b px-4 py-5" style={{ borderColor: "var(--border)" }}>
        <div className="text-[17px] font-bold tracking-tight" style={{ color: "var(--accent)" }}>
          AKEB Career Portal
        </div>
        <div className="mt-0.5 text-[11px]" style={{ color: "var(--text3)" }}>
          Career Counselling System
        </div>
        <span
          className={`mt-2.5 inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold ${badge.style}`}
        >
          {badge.label}
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-2">
        {sections.map(({ section, items }) => (
          <div key={section}>
            <div
              className="px-3 pb-1 pt-4 text-[10px] font-bold uppercase tracking-[0.8px]"
              style={{ color: "var(--text3)" }}
            >
              {section}
            </div>
            {items.map(({ label, href, icon }) => {
              const active = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  className={`mx-2 my-0.5 flex items-center gap-2.5 rounded-md px-3 py-2 text-[13.5px] transition-colors ${
                    active
                      ? "font-semibold"
                      : "hover:text-[--text]"
                  }`}
                  style={
                    active
                      ? { background: "var(--accent-light)", color: "var(--accent)" }
                      : { color: "var(--text2)" }
                  }
                  onMouseEnter={(e) => {
                    if (!active) (e.currentTarget as HTMLElement).style.background = "var(--surface2)";
                  }}
                  onMouseLeave={(e) => {
                    if (!active) (e.currentTarget as HTMLElement).style.background = "";
                  }}
                >
                  <span className="w-4 text-center text-[15px]">{icon}</span>
                  {label}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t p-3" style={{ borderColor: "var(--border)" }}>
        <div className="flex items-center gap-2.5">
          <div
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold"
            style={{ background: "var(--accent-light)", color: "var(--accent)" }}
          >
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-medium" style={{ color: "var(--text)" }}>
              {userName}
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="shrink-0 rounded-md border px-2 py-1 text-xs transition-colors hover:opacity-80"
            style={{ borderColor: "var(--border2)", color: "var(--text3)" }}
          >
            Sign out
          </button>
        </div>
      </div>
    </aside>
  );
}
