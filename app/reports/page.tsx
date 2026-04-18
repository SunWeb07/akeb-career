import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import AppLayout from "@/components/AppLayout";

export default async function ReportsPage() {
  const profile = await requireRole(["admin"]);

  const [students, sessions] = await Promise.all([
    prisma.student.findMany({ select: { council: true, concluded: true, created_at: true } }),
    prisma.session.findMany({ select: { career_journey_stage: true, status: true, created_at: true } }),
  ]);

  const concluded = students.filter((s) => s.concluded).length;
  const thisMonth = sessions.filter((s) => {
    const d = new Date(); d.setDate(1);
    return new Date(s.created_at) >= d;
  }).length;
  const lastMonth = sessions.filter((s) => {
    const start = new Date(); start.setMonth(start.getMonth() - 1); start.setDate(1);
    const end = new Date(); end.setDate(1);
    const d = new Date(s.created_at);
    return d >= start && d < end;
  }).length;

  const avgPerStudent = students.length > 0 ? (sessions.length / students.length).toFixed(1) : "0";

  // By council
  const councilMap: Record<string, { students: number; sessions: number; concluded: number }> = {};
  students.forEach((s) => {
    const c = s.council ?? "Unknown";
    if (!councilMap[c]) councilMap[c] = { students: 0, sessions: 0, concluded: 0 };
    councilMap[c].students++;
    if (s.concluded) councilMap[c].concluded++;
  });

  // Journey stage
  const stageMap: Record<string, { students: number; sessions: number }> = {};
  sessions.forEach((s) => {
    const stage = s.career_journey_stage ?? "Exploration";
    if (!stageMap[stage]) stageMap[stage] = { students: 0, sessions: 0 };
    stageMap[stage].sessions++;
  });

  const councilRows = Object.entries(councilMap).sort((a, b) => b[1].students - a[1].students);
  const stageRows = ["Exploration", "Clarification", "Decision", "Planning", "Action"].map((s) => ({
    stage: s, ...( stageMap[s] ?? { students: 0, sessions: 0 })
  }));

  return (
    <AppLayout userName={profile.full_name} role={profile.role}>
      <div className="border-b px-8 py-6" style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
        <h1 className="text-xl font-bold" style={{ color: "var(--text)" }}>Reports &amp; Analytics</h1>
        <p className="mt-0.5 text-sm" style={{ color: "var(--text3)" }}>Live data from all counselling activity</p>
      </div>

      <div className="p-8">
        {/* Stats */}
        <div className="mb-5 grid grid-cols-2 gap-3.5 sm:grid-cols-4">
          {[
            { label: "Total Students", value: students.length, sub: "Across all councils", color: "var(--accent)" },
            { label: "Sessions This Month", value: thisMonth, sub: `↑ ${thisMonth - lastMonth} vs last month`, color: "var(--accent2)" },
            { label: "Avg Sessions / Student", value: avgPerStudent, sub: "Target: 2.5", color: "var(--accent)" },
            { label: "Concluded Students", value: concluded, sub: `${students.length > 0 ? Math.round((concluded / students.length) * 100) : 0}% of total`, color: "var(--success)" },
          ].map(({ label, value, sub, color }) => (
            <div key={label} className="rounded-[10px] border p-4" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
              <div className="text-[11px] font-semibold uppercase tracking-[0.5px]" style={{ color: "var(--text3)" }}>{label}</div>
              <div className="mt-1 text-3xl font-bold leading-none tracking-tight" style={{ color }}>{value}</div>
              <div className="mt-1 text-xs" style={{ color: "var(--text3)" }}>{sub}</div>
            </div>
          ))}
        </div>

        <div className="mb-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
          {/* By Council */}
          <div className="rounded-[10px] border" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
            <div className="border-b px-5 py-4" style={{ borderColor: "var(--border)" }}>
              <h2 className="text-sm font-bold" style={{ color: "var(--text)" }}>By Council</h2>
            </div>
            <table className="w-full text-[13px]">
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border)" }}>
                  {["Council", "Students", "Concluded"].map((h) => (
                    <th key={h} className="px-4 py-2.5 text-left text-[11px] font-bold uppercase tracking-[0.5px]" style={{ color: "var(--text3)" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {councilRows.length === 0 ? (
                  <tr><td colSpan={3} className="px-4 py-6 text-center text-sm" style={{ color: "var(--text3)" }}>No council data yet.</td></tr>
                ) : councilRows.map(([council, data]) => (
                  <tr key={council} style={{ borderBottom: "1px solid var(--border)" }}
                   className="hover:bg-[var(--surface2)] transition"        >
                    <td className="px-4 py-3" style={{ color: "var(--text2)" }}>{council}</td>
                    <td className="px-4 py-3 font-semibold" style={{ color: "var(--text)" }}>{data.students}</td>
                    <td className="px-4 py-3">
                      <span className="rounded-full px-2 py-0.5 text-[11px] font-semibold" style={{ background: "var(--success-light)", color: "var(--success)" }}>{data.concluded}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Journey Stage */}
          <div className="rounded-[10px] border" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
            <div className="border-b px-5 py-4" style={{ borderColor: "var(--border)" }}>
              <h2 className="text-sm font-bold" style={{ color: "var(--text)" }}>Career Journey Distribution</h2>
            </div>
            <table className="w-full text-[13px]">
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border)" }}>
                  {["Stage", "Sessions"].map((h) => (
                    <th key={h} className="px-4 py-2.5 text-left text-[11px] font-bold uppercase tracking-[0.5px]" style={{ color: "var(--text3)" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {stageRows.map(({ stage, sessions: s }) => (
                  <tr key={stage} style={{ borderBottom: "1px solid var(--border)" }}
                  className="hover:bg-[var(--surface2)] transition" >
                    <td className="px-4 py-3" style={{ color: "var(--text2)" }}>{stage}</td>
                    <td className="px-4 py-3 font-semibold" style={{ color: "var(--text)" }}>{s}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Export */}
        <div className="rounded-[10px] border p-5" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
          <h2 className="mb-3 text-sm font-bold" style={{ color: "var(--text)" }}>Export Data</h2>
          <div className="flex flex-wrap gap-2.5">
            {[
              { label: "📊 Export to Excel", href: "/api/export/excel" },
              { label: "📄 Export PDF Summary", href: "/api/export/pdf" },
            ].map(({ label, href }) => (
              <a key={label} href={href}
                className="rounded-md border px-4 py-2 text-sm font-semibold transition-opacity hover:opacity-80"
                style={{ borderColor: "var(--border2)", color: "var(--text2)", background: "var(--surface)" }}
              >
                {label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
