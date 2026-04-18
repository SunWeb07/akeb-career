import { prisma } from "@/lib/prisma";
import { requireAuth, getUserProfile } from "@/lib/auth";
import AppLayout from "@/components/AppLayout";
import Link from "next/link";

export default async function DashboardPage() {
  await requireAuth();
  const profile = await getUserProfile();
  const role = profile?.role ?? "unknown";

  const [students, sessions, requests, tasks, assessments] = await Promise.all([
    prisma.student.findMany({ orderBy: { created_at: "desc" } }),
    prisma.session.findMany({
      include: { student: true },
      orderBy: { created_at: "desc" },
      take: 10,
    }),
    prisma.sessionRequest.findMany({
      where: { status: "pending" },
      include: { student: true },
      orderBy: { created_at: "desc" },
      take: 5,
    }),
    prisma.task.findMany({ where: { status: "pending" }, orderBy: { created_at: "asc" } }),
    prisma.mindlerAssessment.findMany({ where: { status: "pending" } }),
  ]);

  const concluded     = students.filter((s) => s.concluded).length;
  const pendingSess   = sessions.filter((s) => s.status === "scheduled").length;
  const completedSess = sessions.filter((s) => s.status === "completed").length;
  const clarityRate   = students.length > 0 ? Math.round((concluded / students.length) * 100) : 0;

  // Career journey stage breakdown
  const stageOrder = ["Exploration", "Clarification", "Decision", "Planning", "Concluded"];
  const stageCounts: Record<string, number> = {};
  sessions.forEach((s) => {
    const stage = s.concluded ? "Concluded" : (s.career_journey_stage ?? "Exploration");
    stageCounts[stage] = (stageCounts[stage] ?? 0) + 1;
  });

  // Career choice breakdown (top 5)
  const careerCounts: Record<string, number> = {};
  sessions.forEach((s) => {
    if (s.career_choice) careerCounts[s.career_choice] = (careerCounts[s.career_choice] ?? 0) + 1;
  });
  const topCareers = Object.entries(careerCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);

  const sessStatusColor: Record<string, string> = {
    scheduled: "bg-[#faeeda] text-[#854f0b]",
    completed:  "bg-[#eaf3de] text-[#3b6d11]",
    cancelled:  "bg-gray-100 text-gray-500",
  };

  const stats = [
    { label: "Total Students", value: students.length, sub: `â†‘ ${students.filter(s => { const d = new Date(); d.setDate(d.getDate()-30); return s.created_at > d; }).length} this month`, color: "var(--accent)" },
    { label: "Sessions Done",  value: completedSess,   sub: `${tasks.length} open tasks`,          color: "var(--accent2)" },
    { label: "Pending Sessions",value: pendingSess,    sub: `${assessments.length} awaiting assessment`, color: "var(--warn)" },
    { label: "Career Clarity", value: `${clarityRate}%`, sub: "Concluded students",                color: "var(--success)" },
  ];

  return (
    <AppLayout userName={profile?.full_name ?? "User"} role={role}>
      {/* Page header */}
      <div className="border-b px-8 py-6" style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold" style={{ color: "var(--text)" }}>Dashboard</h1>
            <p className="mt-0.5 text-sm" style={{ color: "var(--text3)" }}>
              Career Counselling Overview â€” {new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })}
            </p>
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
        {/* Stats */}
        <div className="mb-5 grid grid-cols-2 gap-3.5 sm:grid-cols-4">
          {stats.map(({ label, value, sub, color }) => (
            <div key={label} className="rounded-[10px] border p-4" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
              <div className="text-[11px] font-semibold uppercase tracking-[0.5px]" style={{ color: "var(--text3)" }}>{label}</div>
              <div className="mt-1 text-3xl font-bold leading-none tracking-tight" style={{ color }}>{value}</div>
              <div className="mt-1 text-xs" style={{ color: "var(--text3)" }}>{sub}</div>
            </div>
          ))}
        </div>

        <div className="mb-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
          {/* Pending Actions */}
          <div className="rounded-[10px] border p-5" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
            <h2 className="mb-3.5 text-sm font-bold" style={{ color: "var(--text)" }}>â³ Pending Actions</h2>
            <div className="space-y-2.5">
              {assessments.length > 0 && (
                <div className="flex items-center justify-between rounded-md p-2.5" style={{ background: "var(--warn-light)" }}>
                  <div>
                    <div className="text-sm font-semibold" style={{ color: "var(--warn)" }}>{assessments.length} students awaiting Mindler Assessment</div>
                    <div className="text-xs" style={{ color: "var(--text3)" }}>Assessment needed before session booking</div>
                  </div>
                  <Link href="/mindler" className="rounded border px-2 py-1 text-xs font-semibold" style={{ borderColor: "var(--border2)", color: "var(--text2)" }}>View</Link>
                </div>
              )}
              {requests.length > 0 && (
                <div className="flex items-center justify-between rounded-md p-2.5" style={{ background: "var(--accent-light)" }}>
                  <div>
                    <div className="text-sm font-semibold" style={{ color: "var(--accent)" }}>{requests.length} sessions pending counsellor assignment</div>
                    <div className="text-xs" style={{ color: "var(--text3)" }}>Booked, awaiting counsellor</div>
                  </div>
                  <Link href="/counsellor" className="rounded border px-2 py-1 text-xs font-semibold" style={{ borderColor: "var(--border2)", color: "var(--text2)" }}>Assign</Link>
                </div>
              )}
              {tasks.length > 0 && (
                <div className="flex items-center justify-between rounded-md p-2.5" style={{ background: "var(--success-light)" }}>
                  <div>
                    <div className="text-sm font-semibold" style={{ color: "var(--success)" }}>{tasks.length} open tasks across all students</div>
                    <div className="text-xs" style={{ color: "var(--text3)" }}>Assigned to counsellors and students</div>
                  </div>
                </div>
              )}
              {assessments.length === 0 && requests.length === 0 && tasks.length === 0 && (
                <p className="py-4 text-center text-sm" style={{ color: "var(--text3)" }}>All caught up â€” no pending actions.</p>
              )}
            </div>
          </div>

          {/* Career Journey / choice breakdown */}
          <div className="rounded-[10px] border p-5" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
            <h2 className="mb-3.5 text-sm font-bold" style={{ color: "var(--text)" }}>ðŸ—ºï¸ Career Choice Breakdown</h2>
            {topCareers.length === 0 ? (
              <p className="py-4 text-center text-sm" style={{ color: "var(--text3)" }}>No career choices recorded yet.</p>
            ) : (
              <div className="space-y-2.5">
                {topCareers.map(([career, count]) => (
                  <div key={career}>
                    <div className="mb-1 flex justify-between text-xs">
                      <span style={{ color: "var(--text2)" }}>{career}</span>
                      <span className="font-semibold" style={{ color: "var(--text)" }}>{count} students</span>
                    </div>
                    <div className="h-1.5 rounded-full" style={{ background: "var(--border)" }}>
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${Math.min((count / students.length) * 100 * 2, 100)}%`, background: "var(--accent)" }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="rounded-[10px] border" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
          <div className="border-b px-5 py-4" style={{ borderColor: "var(--border)" }}>
            <h2 className="text-sm font-bold" style={{ color: "var(--text)" }}>ðŸ• Recent Activity</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border)" }}>
                  {["Student", "AKEB ID", "Stage", "Counsellor", "Date", "Status"].map((h) => (
                    <th key={h} className="px-4 py-2.5 text-left text-[11px] font-bold uppercase tracking-[0.5px]" style={{ color: "var(--text3)" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sessions.slice(0, 8).map((s) => (
                  <tr key={s.id} className="transition-colors hover:bg-[var(--surface2)]" style={{ borderBottom: "1px solid var(--border)" }}
                  >
                    <td className="px-4 py-2.5 font-semibold" style={{ color: "var(--text)" }}>{s.student.full_name}</td>
                    <td className="px-4 py-2.5 font-mono text-xs" style={{ color: "var(--text3)" }}>{s.student.akeb_id}</td>
                    <td className="px-4 py-2.5">
                      {s.career_journey_stage && (
                        <span className="rounded-full px-2 py-0.5 text-[11px] font-semibold" style={{ background: "var(--accent-light)", color: "var(--accent)" }}>
                          {s.career_journey_stage}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-2.5" style={{ color: "var(--text2)" }}>{s.counsellor_id ? "Assigned" : "â€”"}</td>
                    <td className="px-4 py-2.5 text-xs" style={{ color: "var(--text3)" }}>
                      {s.session_date ? new Date(s.session_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : new Date(s.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-2.5">
                      <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold capitalize ${sessStatusColor[s.status] ?? "bg-gray-100 text-gray-500"}`}>
                        {s.concluded ? "Concluded âœ“" : s.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {sessions.length === 0 && (
                  <tr><td colSpan={6} className="px-4 py-10 text-center text-sm" style={{ color: "var(--text3)" }}>No sessions recorded yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}


// Inline SVG icons for stat cards
function IconUsers() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
    </svg>
  );
}
function IconCalendar() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
    </svg>
  );
}
function IconInbox() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 13.5h3.86a2.25 2.25 0 012.012 1.244l.256.512a2.25 2.25 0 002.013 1.244h3.218a2.25 2.25 0 002.013-1.244l.256-.512a2.25 2.25 0 012.013-1.244h3.859m-19.5.338V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18v-4.162c0-.224-.034-.447-.1-.661L19.24 5.338a2.25 2.25 0 00-2.15-1.588H6.911a2.25 2.25 0 00-2.15 1.588L2.35 13.177a2.25 2.25 0 00-.1.661z" />
    </svg>
  );
}
function IconClipboard() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
    </svg>
  );
}

