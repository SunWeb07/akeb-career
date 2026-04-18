import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import AppLayout from "@/components/AppLayout";
import Link from "next/link";

export default async function FmpPage() {
  const profile = await requireRole(["institution", "admin"]);

  // For institution role: filter requests to students linked to this institution
  let institutionStudentIds: string[] | undefined;
  if (profile.role === "institution" && profile.institution_id) {
    const linked = await prisma.studentInstitution.findMany({
      where: { institution_id: profile.institution_id },
      select: { student_id: true },
    });
    institutionStudentIds = linked.map((l) => l.student_id);
  }

  const requests = await prisma.sessionRequest.findMany({
    where: profile.role === "admin" ? {} : { student_id: { in: institutionStudentIds ?? [] } },
    include: { student: true },
    orderBy: { created_at: "desc" },
    take: 20,
  });

  const statusBadge: Record<string, string> = {
    pending:     "bg-[#faeeda] text-[#854f0b]",
    in_progress: "bg-[#e6f1fb] text-[#1a4f8a]",
    resolved:    "bg-[#eaf3de] text-[#3b6d11]",
  };

  const typeBadge: Record<string, string> = {
    new:      "bg-[#e6f1fb] text-[#1a4f8a]",
    followup: "bg-[#faeeda] text-[#854f0b]",
  };

  return (
    <AppLayout userName={profile.full_name} role={profile.role}>
      {/* Header */}
      <div className="border-b px-8 py-6" style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold" style={{ color: "var(--text)" }}>My Requests</h1>
            <p className="mt-0.5 text-sm" style={{ color: "var(--text3)" }}>Requests you've raised for students</p>
          </div>
          <Link
            href="/institution/requests/new"
            className="rounded-md px-4 py-2 text-sm font-semibold text-white"
            style={{ background: "var(--accent)" }}
          >
            ➕ New Request
          </Link>
        </div>
      </div>

      <div className="p-8">
        {/* Stats */}
        <div className="mb-5 grid grid-cols-3 gap-3.5">
          {[
            { label: "Total Requests", value: requests.length, color: "var(--accent)" },
            { label: "Pending", value: requests.filter((r) => r.status === "pending").length, color: "var(--warn)" },
            { label: "Resolved", value: requests.filter((r) => r.status === "resolved").length, color: "var(--success)" },
          ].map(({ label, value, color }) => (
            <div key={label} className="rounded-[10px] border p-4" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
              <div className="text-[11px] font-semibold uppercase tracking-[0.5px]" style={{ color: "var(--text3)" }}>{label}</div>
              <div className="mt-1 text-3xl font-bold leading-none tracking-tight" style={{ color }}>{value}</div>
            </div>
          ))}
        </div>

        <div className="rounded-[10px] border" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border)" }}>
                  {["Student", "AKEB ID", "Type", "Assessment", "Date", "Status"].map((h) => (
                    <th key={h} className="px-4 py-2.5 text-left text-[11px] font-bold uppercase tracking-[0.5px]" style={{ color: "var(--text3)" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {requests.map((r) => (
                  <tr key={r.id} style={{ borderBottom: "1px solid var(--border)" }}
                  className="hover:bg-[var(--surface2)] transition" >
                    <td className="px-4 py-3 font-semibold" style={{ color: "var(--text)" }}>{r.student.full_name}</td>
                    <td className="px-4 py-3 font-mono text-xs" style={{ color: "var(--text3)" }}>{r.student.akeb_id}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold capitalize ${typeBadge[r.type] ?? "bg-gray-100 text-gray-500"}`}>{r.type}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold capitalize ${r.assessment_status === "done" ? "bg-[#eaf3de] text-[#3b6d11]" : "bg-[#faeeda] text-[#854f0b]"}`}>
                        {r.assessment_status === "done" ? "Done ✓" : r.assessment_status === "not_required" ? "Not Required" : "Pending"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs" style={{ color: "var(--text3)" }}>{new Date(r.created_at).toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold capitalize ${statusBadge[r.status] ?? "bg-gray-100 text-gray-500"}`}>{r.status.replace("_", " ")}</span>
                    </td>
                  </tr>
                ))}
                {requests.length === 0 && (
                  <tr><td colSpan={6} className="px-4 py-12 text-center text-sm" style={{ color: "var(--text3)" }}>No requests raised yet. <Link href="/institution/requests/new" style={{ color: "var(--accent)" }}>Raise your first request →</Link></td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
