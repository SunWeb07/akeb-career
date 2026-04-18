import { requireRole } from "@/lib/auth";
import AppLayout from "@/components/AppLayout";

export default async function MigrationPage() {
  const profile = await requireRole(["admin"]);

  return (
    <AppLayout userName={profile.full_name} role={profile.role}>
      
      {/* Header */}
      <div
        className="border-b px-8 py-6"
        style={{ borderColor: "var(--border)", background: "var(--surface)" }}
      >
        <h1 className="text-xl font-bold" style={{ color: "var(--text)" }}>
          Data Migration
        </h1>
        <p className="mt-0.5 text-sm" style={{ color: "var(--text3)" }}>
          Import entire Excel file (all sheets) in one click
        </p>
      </div>

      <div className="p-8">

        {/* Info Box */}
        <div
          className="mb-5 rounded-md p-3.5 text-sm"
          style={{ background: "var(--accent-light)", color: "var(--accent)" }}
        >
          ℹ️ <strong>One-time migration tool</strong> — Upload your Excel file containing all sheets:
          <ul className="mt-2 list-disc pl-5 text-xs">
            <li>Student Details</li>
            <li>Session Details</li>
            <li>Mindler Assessment</li>
            <li>Master Data</li>
          </ul>
        </div>

        {/* 🚀 SINGLE IMPORT BOX */}
        <div
          className="rounded-[12px] border p-6"
          style={{ background: "var(--surface)", borderColor: "var(--border)" }}
        >
          <h2 className="mb-2 text-lg font-bold" style={{ color: "var(--text)" }}>
            🚀 Import Full Excel Data
          </h2>

          <p className="mb-4 text-sm" style={{ color: "var(--text3)" }}>
            Upload your complete Excel file. The system will automatically:
          </p>

          <ul className="mb-5 list-disc pl-5 text-sm" style={{ color: "var(--text2)" }}>
            <li>Import students</li>
            <li>Map sessions to students</li>
            <li>Insert Mindler assessments</li>
            <li>Update council & centre data</li>
          </ul>

          <form
            action="/api/migration/all"
            method="POST"
            encType="multipart/form-data"
            className="flex flex-col gap-3 sm:flex-row sm:items-center"
          >
            <input
              type="file"
              name="file"
              accept=".xlsx,.csv"
              required
              className="text-sm"
              style={{ color: "var(--text2)" }}
            />

            <button
              type="submit"
              className="rounded-md px-5 py-2 text-sm font-semibold text-white transition hover:opacity-90"
              style={{ background: "var(--accent)" }}
            >
              🚀 Import All Data
            </button>
          </form>
        </div>

        {/* Column Mapping Reference */}
        <div
          className="mt-6 rounded-[10px] border"
          style={{ background: "var(--surface)", borderColor: "var(--border)" }}
        >
          <div
            className="border-b px-5 py-4"
            style={{ borderColor: "var(--border)" }}
          >
            <h2 className="text-sm font-bold" style={{ color: "var(--text)" }}>
              ℹ️ Column Mapping Reference
            </h2>
          </div>

          <table className="w-full text-[13px]">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)" }}>
                {["Excel Sheet", "Key Column", "Maps To"].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-2.5 text-left text-[11px] font-bold uppercase"
                    style={{ color: "var(--text3)" }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {[
                {
                  sheet: "Student Details",
                  col: "AKEB ID",
                  map: "students.akeb_id",
                },
                {
                  sheet: "Session Details",
                  col: "AKEB ID",
                  map: "sessions.student_id",
                },
                {
                  sheet: "Mindler Assessment",
                  col: "Main_ID",
                  map: "mindler.student_id",
                },
                {
                  sheet: "Master Data",
                  col: "AKEB ID",
                  map: "students.council / centre",
                },
              ].map((row, i) => (
                <tr
                  key={i}
                  className="hover:bg-[var(--surface2)] transition"
                  style={{ borderBottom: "1px solid var(--border)" }}
                >
                  <td className="px-4 py-3">{row.sheet}</td>
                  <td className="px-4 py-3 font-mono text-xs">{row.col}</td>
                  <td className="px-4 py-3 font-mono text-xs text-[var(--accent)]">
                    {row.map}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AppLayout>
  );
}