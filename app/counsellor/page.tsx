
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import AppLayout from "@/components/AppLayout";
import Link from "next/link";

type Student = {
  id: string;
  full_name: string;
  akeb_id?: string | null;
  school_grade?: string | null;
  school_name?: string | null;
  // add other fields as needed, matching the schema
};

type Request = {
  id: string;
  student_id: string;
  type: string;
  created_at: string | Date;
  student: Student;
};

export default async function CounsellorPage() {
  const profile = await requireRole(["counsellor", "admin"]);

  const [sessions, requests, tasks] = await Promise.all([
    prisma.session.findMany({
      where: profile.role === "admin" ? {} : { counsellor_id: profile.id },
      include: { student: true },
      orderBy: { created_at: "desc" },
      take: 20,
    }),
    prisma.sessionRequest.findMany({
      where: { status: "pending" },
      include: { student: true },
      orderBy: { created_at: "desc" },
      take: 20,
    }),
    prisma.task.findMany({
      where: { assigned_to: profile.id, status: { not: "done" } },
      include: { student: true },
      orderBy: { created_at: "asc" },
      take: 10,
    }),
  ]);

  const stageColors: Record<string, { bg: string; text: string }> = {
    Exploration:   { bg: "var(--accent-light)",   text: "var(--accent)" },
    Clarification: { bg: "var(--warn-light)",      text: "var(--warn)" },
    Decision:      { bg: "var(--success-light)",   text: "var(--success)" },
    Planning:      { bg: "#f3e8ff",                text: "#6b21a8" },
    Action:        { bg: "var(--danger-light)",    text: "var(--danger)" },
    Concluded:     { bg: "var(--surface2)",        text: "var(--text3)" },
  };

  return (
    <AppLayout userName={profile.full_name} role={profile.role}>
      {/* Page header */}
      <div className="border-b px-8 py-6" style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold" style={{ color: "var(--text)" }}>Sessions Dashboard</h1>
            <p className="mt-0.5 text-sm" style={{ color: "var(--text3)" }}>
              Manage pending requests, record sessions, and track tasks.
            </p>
          </div>
          <Link href="/counsellor/record"
            className="rounded-md px-4 py-2 text-sm font-semibold text-white"
            style={{ background: "var(--accent)" }}>
            + Record Session
          </Link>
        </div>
      </div>

      <div className="p-8">
        {/* Stats */}
        <div className="mb-6 grid grid-cols-3 gap-4">
          {[
            { label: "Pending Requests", value: requests.length, bg: "var(--warn-light)",    text: "var(--warn)" },
            { label: "Total Sessions",   value: sessions.length, bg: "var(--accent-light)",  text: "var(--accent)" },
            { label: "Open Tasks",       value: tasks.length,    bg: "var(--danger-light)",  text: "var(--danger)" },
          ].map(({ label, value, bg, text }) => (
            <div key={label} className="rounded-[10px] border p-5" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
              <p className="mb-1 rounded-full px-2 py-0.5 text-xs font-semibold" style={{ background: bg, color: text, display: "inline-block" }}>{label}</p>
              <p className="text-3xl font-bold" style={{ color: "var(--text)" }}>{value}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
          {/* Pending Requests â€” 3 cols */}
          <div className="space-y-5 lg:col-span-3">
            <div className="rounded-[10px] border" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
              <div className="flex items-center justify-between border-b px-5 py-4" style={{ borderColor: "var(--border)" }}>
                <h2 className="text-sm font-bold" style={{ color: "var(--text)" }}>Pending Session Requests</h2>
                <span className="rounded-full px-2 py-0.5 text-xs font-semibold" style={{ background: "var(--warn-light)", color: "var(--warn)" }}>{requests.length}</span>
              </div>
              {requests.length === 0 ? (
                <div className="py-10 text-center text-sm" style={{ color: "var(--text3)" }}>No pending requests</div>
              ) : (
                <div className="divide-y" style={{ borderColor: "var(--border)" }}>
                  {requests.map((r: Request) => {
                    const initials = r.student.full_name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
                    return (
                      <div key={r.id} className="flex items-center gap-4 px-5 py-4">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white" style={{ background: "var(--accent)" }}>
                          {initials}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold" style={{ color: "var(--text)" }}>{r.student.full_name}</p>
                          <p className="text-xs" style={{ color: "var(--text3)" }}>
                            {r.student.akeb_id} Â· {r.student.school_grade ?? "â€”"} Â· {r.student.school_name ?? "â€”"}
                          </p>
                          <div className="mt-1 flex flex-wrap gap-1.5">
                            <span className="rounded-full px-2 py-0.5 text-[11px] font-semibold capitalize"
                              style={{ background: r.type === "new" ? "var(--accent-light)" : "var(--success-light)", color: r.type === "new" ? "var(--accent)" : "var(--success)" }}>
                              {r.type === "new" ? "New Student" : "Follow-up"}
                            </span>
                            <span className="text-[11px]" style={{ color: "var(--text3)" }}>
                              {new Date(r.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                            </span>
                          </div>
                        </div>
                        <Link href={`/counsellor/record?student_id=${r.student_id}&request_id=${r.id}`}
                          className="shrink-0 rounded-md px-3 py-1.5 text-xs font-semibold text-white"
                          style={{ background: "var(--accent)" }}>
                          Start Session â†’
                        </Link>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Recent Sessions */}
            <div className="rounded-[10px] border" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
              <div className="flex items-center justify-between border-b px-5 py-4" style={{ borderColor: "var(--border)" }}>
                <h2 className="text-sm font-bold" style={{ color: "var(--text)" }}>Recent Sessions</h2>
              </div>
              {sessions.length === 0 ? (
                <div className="py-10 text-center text-sm" style={{ color: "var(--text3)" }}>No sessions recorded yet</div>
              ) : (
                <table className="w-full text-[13px]">
                  <thead>
                    <tr style={{ borderBottom: "1px solid var(--border)" }}>
                      {["Student", "Date", "Journey Stage", "Status"].map(h => (
                        <th key={h} className="px-4 py-2.5 text-left text-[11px] font-bold uppercase tracking-[0.5px]" style={{ color: "var(--text3)" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {sessions.map((s) => {
                      const stage = s.career_journey_stage;
                      const sc = stage ? stageColors[stage] : null;
                      return (
                        <tr key={s.id} style={{ borderBottom: "1px solid var(--border)" }}>
                          <td className="px-4 py-3">
                            <p className="font-medium" style={{ color: "var(--text)" }}>{s.student.full_name}</p>
                            <p className="text-[11px]" style={{ color: "var(--text3)" }}>{s.student.akeb_id}</p>
                          </td>
                          <td className="px-4 py-3" style={{ color: "var(--text2)" }}>
                            {s.session_date ? new Date(s.session_date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "2-digit" }) : "â€”"}
                          </td>
                          <td className="px-4 py-3">
                            {stage && sc ? (
                              <span className="rounded-full px-2 py-0.5 text-[11px] font-semibold" style={{ background: sc.bg, color: sc.text }}>{stage}</span>
                            ) : "â€”"}
                          </td>
                          <td className="px-4 py-3">
                            <span className="rounded-full px-2 py-0.5 text-[11px] font-semibold capitalize"
                              style={{
                                background: s.status === "completed" ? "var(--success-light)" : s.status === "scheduled" ? "var(--warn-light)" : "var(--surface2)",
                                color: s.status === "completed" ? "var(--success)" : s.status === "scheduled" ? "var(--warn)" : "var(--text3)",
                              }}>
                              {s.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* Right: Open Tasks â€” 2 cols */}
          <div className="lg:col-span-2">
            <div className="rounded-[10px] border" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
              <div className="flex items-center justify-between border-b px-5 py-4" style={{ borderColor: "var(--border)" }}>
                <h2 className="text-sm font-bold" style={{ color: "var(--text)" }}>My Open Tasks</h2>
                <span className="rounded-full px-2 py-0.5 text-xs font-semibold" style={{ background: "var(--danger-light)", color: "var(--danger)" }}>{tasks.length}</span>
              </div>
              {tasks.length === 0 ? (
                <div className="py-10 text-center text-sm" style={{ color: "var(--text3)" }}>No open tasks</div>
              ) : (
                <div className="divide-y" style={{ borderColor: "var(--border)" }}>
                  {tasks.map((t) => (
                    <div key={t.id} className="px-5 py-3.5">
                      <p className="text-sm font-medium" style={{ color: "var(--text)" }}>{t.title}</p>
                      <p className="mt-0.5 text-xs" style={{ color: "var(--text3)" }}>{t.student.full_name} Â· {t.type}</p>
                      <span className="mt-1.5 inline-block rounded-full px-2 py-0.5 text-[11px] font-semibold capitalize"
                        style={{
                          background: t.status === "done" ? "var(--success-light)" : t.status === "in_progress" ? "var(--accent-light)" : "var(--warn-light)",
                          color: t.status === "done" ? "var(--success)" : t.status === "in_progress" ? "var(--accent)" : "var(--warn)",
                        }}>
                        {t.status.replace("_", " ")}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
