import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import AppLayout from "@/components/AppLayout";
import Link from "next/link";
import { Prisma } from "@prisma/client";

type Student = {
  id: string;
  full_name: string;
  akeb_id?: string | null;
  school_grade?: string | null;
  school_name?: string | null;
};

type Request = {
  id: string;
  student_id: string;
  type: string;
  created_at: string | Date;
  student: Student;
};

// ✅ Proper Prisma type for sessions
type SessionWithStudent = Prisma.SessionGetPayload<{
  include: { student: true };
}>;

type TaskWithStudent = Prisma.TaskGetPayload<{
  include: { student: true };
}>;

export default async function CounsellorPage() {
  const profile = await requireRole(["counsellor", "admin"]);

  const [sessions, requests, tasks]: [
    SessionWithStudent[],
    Request[],
    TaskWithStudent[]
  ] = await Promise.all([
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
    Exploration:   { bg: "var(--accent-light)", text: "var(--accent)" },
    Clarification: { bg: "var(--warn-light)", text: "var(--warn)" },
    Decision:      { bg: "var(--success-light)", text: "var(--success)" },
    Planning:      { bg: "#f3e8ff", text: "#6b21a8" },
    Action:        { bg: "var(--danger-light)", text: "var(--danger)" },
    Concluded:     { bg: "var(--surface2)", text: "var(--text3)" },
  };

  return (
    <AppLayout userName={profile.full_name} role={profile.role}>
      {/* Header */}
      <div className="border-b px-8 py-6" style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold" style={{ color: "var(--text)" }}>
              Sessions Dashboard
            </h1>
            <p className="mt-0.5 text-sm" style={{ color: "var(--text3)" }}>
              Manage pending requests, record sessions, and track tasks.
            </p>
          </div>
          <Link
            href="/counsellor/record"
            className="rounded-md px-4 py-2 text-sm font-semibold text-white"
            style={{ background: "var(--accent)" }}
          >
            + Record Session
          </Link>
        </div>
      </div>

      <div className="p-8">
        {/* Stats */}
        <div className="mb-6 grid grid-cols-3 gap-4">
          {[
            { label: "Pending Requests", value: requests.length, bg: "var(--warn-light)", text: "var(--warn)" },
            { label: "Total Sessions", value: sessions.length, bg: "var(--accent-light)", text: "var(--accent)" },
            { label: "Open Tasks", value: tasks.length, bg: "var(--danger-light)", text: "var(--danger)" },
          ].map(({ label, value, bg, text }) => (
            <div key={label} className="rounded-[10px] border p-5" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
              <p className="mb-1 rounded-full px-2 py-0.5 text-xs font-semibold" style={{ background: bg, color: text }}>
                {label}
              </p>
              <p className="text-3xl font-bold" style={{ color: "var(--text)" }}>
                {value}
              </p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
          {/* Requests */}
          <div className="space-y-5 lg:col-span-3">
            <div className="rounded-[10px] border" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
              <div className="flex items-center justify-between border-b px-5 py-4">
                <h2 className="text-sm font-bold">Pending Session Requests</h2>
                <span className="text-xs">{requests.length}</span>
              </div>

              {requests.map((r) => {
                const initials = r.student.full_name
                  .split(" ")
                  .map((w) => w[0])
                  .join("")
                  .toUpperCase()
                  .slice(0, 2);

                return (
                  <div key={r.id} className="flex items-center gap-4 px-5 py-4">
                    <div className="h-10 w-10 flex items-center justify-center rounded-full text-white bg-blue-500">
                      {initials}
                    </div>

                    <div className="flex-1">
                      <p>{r.student.full_name}</p>
                      <p className="text-xs">
                        {r.student.akeb_id} · {r.student.school_grade ?? "—"} · {r.student.school_name ?? "—"}
                      </p>
                    </div>

                    <Link href={`/counsellor/record?student_id=${r.student_id}&request_id=${r.id}`}>
                      Start Session →
                    </Link>
                  </div>
                );
              })}
            </div>

            {/* Sessions */}
            <table className="w-full text-sm">
              <tbody>
                {sessions.map((s) => {
                  const stage = s.career_journey_stage;
                  const sc = stage ? stageColors[stage] : null;

                  return (
                    <tr key={s.id}>
                      <td>{s.student.full_name}</td>
                      <td>{s.status}</td>
                      <td>{stage ?? "—"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Tasks */}
          <div>
            {tasks.map((t) => (
              <div key={t.id}>
                <p>{t.title}</p>
                <p>{t.student.full_name}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
