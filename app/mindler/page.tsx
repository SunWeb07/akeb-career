import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import AppLayout from "@/components/AppLayout";

export default async function MindlerPage() {
  const profile = await requireRole(["admin", "counsellor"]);

  const [pending, done] = await Promise.all([
    prisma.mindlerAssessment.findMany({
      where: { status: "pending" },
      include: { student: true },
      orderBy: { created_at: "desc" },
    }),
    prisma.mindlerAssessment.findMany({
      where: { status: "done" },
      include: { student: true },
      orderBy: { updated_at: "desc" },
      take: 20,
    }),
  ]);

  const notRequired = await prisma.student.count({
    where: { mindler_assessment: null },
  });

  return (
    <AppLayout userName={profile.full_name} role={profile.role}>
      <div className="border-b px-8 py-6" style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
        <h1 className="text-xl font-bold" style={{ color: "var(--text)" }}>Mindler Assessments</h1>
        <p className="mt-0.5 text-sm" style={{ color: "var(--text3)" }}>Track career assessment status for all students</p>
      </div>

      <div className="p-8">
        {/* Stats */}
        <div className="mb-5 grid grid-cols-3 gap-3.5">
          {[
            { label: "Total Assessed", value: done.length, color: "var(--success)" },
            { label: "Pending Assessment", value: pending.length, color: "var(--warn)" },
            { label: "No Assessment Required", value: notRequired, color: "var(--accent)" },
          ].map(({ label, value, color }) => (
            <div key={label} className="rounded-[10px] border p-4" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
              <div className="text-[11px] font-semibold uppercase tracking-[0.5px]" style={{ color: "var(--text3)" }}>{label}</div>
              <div className="mt-1 text-3xl font-bold leading-none tracking-tight" style={{ color }}>{value}</div>
            </div>
          ))}
        </div>

        {/* Pending */}
        <div className="mb-5 rounded-[10px] border" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
          <div className="border-b px-5 py-4" style={{ borderColor: "var(--border)" }}>
            <h2 className="text-sm font-bold" style={{ color: "var(--text)" }}>🧠 Students Awaiting Assessment ({pending.length})</h2>
          </div>
          {pending.length === 0 ? (
            <p className="px-5 py-10 text-center text-sm" style={{ color: "var(--text3)" }}>All assessments completed — no students pending.</p>
          ) : (
            <table className="w-full text-[13px]">
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border)" }}>
                  {["Student", "AKEB ID", "School", "Requested", "Action"].map((h) => (
                    <th key={h} className="px-4 py-2.5 text-left text-[11px] font-bold uppercase tracking-[0.5px]" style={{ color: "var(--text3)" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pending.map((m) => (
                  <tr key={m.id} style={{ borderBottom: "1px solid var(--border)" }}
                   className="hover:bg-[var(--surface2)] transition" >
                    <td className="px-4 py-3 font-semibold" style={{ color: "var(--text)" }}>{m.student.full_name}</td>
                    <td className="px-4 py-3 font-mono text-xs" style={{ color: "var(--text3)" }}>{m.student.akeb_id}</td>
                    <td className="px-4 py-3" style={{ color: "var(--text2)" }}>{m.student.school_name ?? "—"}</td>
                    <td className="px-4 py-3 text-xs" style={{ color: "var(--text3)" }}>{new Date(m.created_at).toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      <form action={`/api/mindler/${m.id}/complete`} method="POST">
                        <button type="submit"
                          className="rounded-md px-3 py-1.5 text-xs font-semibold text-white transition-opacity hover:opacity-90"
                          style={{ background: "var(--accent)" }}
                        >
                          Mark Done + Assign Credentials
                        </button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Completed */}
        {done.length > 0 && (
          <div className="rounded-[10px] border" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
            <div className="border-b px-5 py-4" style={{ borderColor: "var(--border)" }}>
              <h2 className="text-sm font-bold" style={{ color: "var(--text)" }}>✅ Completed Assessments ({done.length})</h2>
            </div>
            <table className="w-full text-[13px]">
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border)" }}>
                  {["Student", "AKEB ID", "Mindler ID", "Result Summary", "Completed"].map((h) => (
                    <th key={h} className="px-4 py-2.5 text-left text-[11px] font-bold uppercase tracking-[0.5px]" style={{ color: "var(--text3)" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {done.map((m) => (
                  <tr key={m.id} style={{ borderBottom: "1px solid var(--border)" }}
                   className="hover:bg-[var(--surface2)] transition" >
                    <td className="px-4 py-3 font-semibold" style={{ color: "var(--text)" }}>{m.student.full_name}</td>
                    <td className="px-4 py-3 font-mono text-xs" style={{ color: "var(--text3)" }}>{m.student.akeb_id}</td>
                    <td className="px-4 py-3 font-mono text-xs" style={{ color: "var(--text2)" }}>{m.mindler_id ?? "—"}</td>
                    <td className="px-4 py-3 text-xs" style={{ color: "var(--text2)" }}>{m.result_summary ?? "—"}</td>
                    <td className="px-4 py-3 text-xs" style={{ color: "var(--text3)" }}>{new Date(m.updated_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
