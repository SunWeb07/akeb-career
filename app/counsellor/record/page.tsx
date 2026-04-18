import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import AppLayout from "@/components/AppLayout";
import SessionForm from "@/components/SessionForm";

interface Props {
  searchParams: Promise<{ student_id?: string; request_id?: string }>;
}

export default async function RecordSessionPage({ searchParams }: Props) {
  const profile = await requireRole(["counsellor", "admin"]);
  const { student_id, request_id } = await searchParams;

  const [students, preselectedStudent] = await Promise.all([
    prisma.student.findMany({ orderBy: { full_name: "asc" }, select: { id: true, full_name: true, akeb_id: true, school_grade: true, school_name: true } }),
    student_id
      ? prisma.student.findUnique({ where: { id: student_id }, select: { id: true, full_name: true, akeb_id: true, school_grade: true, school_name: true } })
      : Promise.resolve(null),
  ]);

  return (
    <AppLayout userName={profile.full_name} role={profile.role}>
      <div className="border-b px-8 py-6" style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
        <h1 className="text-xl font-bold" style={{ color: "var(--text)" }}>Record Session</h1>
        {preselectedStudent && (
          <p className="mt-0.5 text-sm" style={{ color: "var(--text3)" }}>
            Recording session for <strong style={{ color: "var(--text2)" }}>{preselectedStudent.full_name}</strong> — {preselectedStudent.akeb_id}
          </p>
        )}
      </div>

      <div className="mx-auto max-w-3xl p-8">
        <SessionForm
          counsellorId={profile.id}
          students={students}
          preselectedStudentId={student_id ?? ""}
          requestId={request_id ?? ""}
        />
      </div>
    </AppLayout>
  );
}
