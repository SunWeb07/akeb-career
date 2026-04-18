import { prisma } from "@/lib/prisma";
import { requireAuth, getUserProfile } from "@/lib/auth";
import AppLayout from "@/components/AppLayout";
import Link from "next/link";

export default async function StudentsPage({
  searchParams,
}: {
  searchParams: Promise<{ council?: string; status?: string; q?: string }>;
}) {
  await requireAuth();
  const profile = await getUserProfile();
  const params = await searchParams;
  const { council, status, q } = params;

  const students = await prisma.student.findMany({
    include: {
      sessions: { orderBy: { created_at: "desc" }, take: 1 },
      mindler_assessment: { select: { status: true } },
    },
    orderBy: { created_at: "desc" },
  });

  const councils = [...new Set(students.map((s) => s.council).filter(Boolean))];

  const filtered = students.filter((s) => {
    if (council && s.council !== council) return false;
    if (status === "concluded" && !s.concluded) return false;
    if (status === "active" && s.concluded) return false;
    if (status === "pending" && s.sessions.length > 0) return false;
    if (q) {
      const search = q.toLowerCase();
      return (
        s.full_name.toLowerCase().includes(search) ||
        s.akeb_id.toLowerCase().includes(search) ||
        (s.school_name?.toLowerCase().includes(search) ?? false)
      );
    }
    return true;
  });

  const statusBadge = (s: typeof students[0]) => {
    if (s.concluded) return { label: "Concluded ✓", style: "bg-[#eaf3de] text-[#3b6d11]" };
    if (s.sessions.length === 0) {
      if (s.mindler_assessment?.status === "pending")
        return { label: "Awaiting Assessment", style: "bg-[#f1efff] text-[#534ab7]" };
      return { label: "New", style: "bg-[#e6f1fb] text-[#1a4f8a]" };
    }
    return { label: "In Progress", style: "bg-[#e1f5ee] text-[#0f6e56]" };
  };

  return (
    <AppLayout userName={profile?.full_name ?? "User"} role={profile?.role ?? "admin"}>
      {/* Header */}
      <div className="border-b px-8 py-6" style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold" style={{ color: "var(--text)" }}>All Students</h1>
            <p className="mt-0.5 text-sm" style={{ color: "var(--text3)" }}>{filtered.length} students shown</p>
          </div>
          <Link
            href="/institution/requests/new"
            className="rounded-md px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            style={{ background: "var(--accent)" }}
          >
            + New Request
          </Link>
        </div>
      </div>

      <div className="p-8">
        <div className="rounded-[10px] border" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
          {/* Filters */}
          <div className="flex flex-wrap gap-2.5 border-b px-5 py-4" style={{ borderColor: "var(--border)" }}>
            <form method="GET" className="flex flex-wrap gap-2.5 flex-1">
              <input
                name="q"
                defaultValue={q}
                placeholder="Search by name, AKEB ID, school…"
                className="flex-1 min-w-[200px] rounded-md border px-3 py-1.5 text-sm focus:outline-none"
                style={{ borderColor: "var(--border2)", background: "var(--surface)", color: "var(--text)" }}
              />
              <select
                name="council"
                defaultValue={council ?? ""}
                className="rounded-md border px-2.5 py-1.5 text-sm"
                style={{ borderColor: "var(--border2)", background: "var(--surface)", color: "var(--text2)" }}
              >
                <option value="">All Councils</option>
                {councils.map((c) => <option key={c!} value={c!}>{c}</option>)}
              </select>
              <select
                name="status"
                defaultValue={status ?? ""}
                className="rounded-md border px-2.5 py-1.5 text-sm"
                style={{ borderColor: "var(--border2)", background: "var(--surface)", color: "var(--text2)" }}
              >
                <option value="">All Statuses</option>
                <option value="active">In Progress</option>
                <option value="concluded">Concluded</option>
                <option value="pending">No Sessions Yet</option>
              </select>
              <button
                type="submit"
                className="rounded-md px-3 py-1.5 text-sm font-semibold text-white"
                style={{ background: "var(--accent)" }}
              >
                Filter
              </button>
            </form>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border)" }}>
                  {["Student", "AKEB ID", "Grade", "Council", "Sessions", "Career Interest", "Status", ""].map((h) => (
                    <th key={h} className="px-4 py-2.5 text-left text-[11px] font-bold uppercase tracking-[0.5px]" style={{ color: "var(--text3)" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((s) => {
                  const badge = statusBadge(s);
                  return (
                    <tr key={s.id} style={{ borderBottom: "1px solid var(--border)" }}
                    className="hover:bg-[var(--surface2)] transition" >
                      <td className="px-4 py-3">
                        <div className="font-semibold" style={{ color: "var(--text)" }}>{s.full_name}</div>
                        {s.school_name && <div className="text-xs" style={{ color: "var(--text3)" }}>{s.school_name}</div>}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs" style={{ color: "var(--text3)" }}>{s.akeb_id}</td>
                      <td className="px-4 py-3" style={{ color: "var(--text2)" }}>{s.school_grade ?? "—"}</td>
                      <td className="px-4 py-3" style={{ color: "var(--text2)" }}>{s.council ?? "—"}</td>
                      <td className="px-4 py-3 text-center font-semibold" style={{ color: "var(--text)" }}>{s.sessions.length}</td>
                      <td className="px-4 py-3" style={{ color: "var(--text2)" }}>
                        {s.sessions[0]?.career_choice ?? "—"}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${badge.style}`}>{badge.label}</span>
                      </td>
                      <td className="px-4 py-3">
                        <button className="rounded border px-2.5 py-1 text-xs font-semibold transition-colors hover:opacity-80" style={{ borderColor: "var(--border2)", color: "var(--text2)" }}>
                          View
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr><td colSpan={8} className="px-4 py-12 text-center text-sm" style={{ color: "var(--text3)" }}>No students found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
