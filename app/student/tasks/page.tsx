import { prisma } from "@/lib/prisma";
import { requireRole, getUser } from "@/lib/auth";
import AppLayout from "@/components/AppLayout";
import Link from "next/link";

export default async function StudentTasksPage() {
  const profile = await requireRole(["student", "admin"]);
  const user = await getUser();

  const studentRecord = profile.role === "admin"
    ? await prisma.student.findFirst({ 
        include: { 
          tasks: { 
            include: { session: true },
            orderBy: { created_at: "desc" } 
          } 
        } 
      })
    : await prisma.student.findFirst({
        where: { email: user?.email },
        include: {
          tasks: { 
            include: { session: true },
            orderBy: { created_at: "desc" } 
          },
        },
      });

  if (!studentRecord) {
    return (
      <AppLayout userName={profile.full_name} role={profile.role}>
        <div className="flex min-h-screen items-center justify-center" style={{ background: "var(--bg)" }}>
          <div className="text-center">
            <p className="text-lg font-medium" style={{ color: "var(--text2)" }}>No student record found.</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  const pendingTasks = studentRecord.tasks.filter(t => t.status === "pending");
  const inProgressTasks = studentRecord.tasks.filter(t => t.status === "in_progress");
  const doneTasks = studentRecord.tasks.filter(t => t.status === "done");

  const taskStatusColor: Record<string, string> = {
    pending: "bg-[#faeeda] text-[#854f0b]",
    in_progress: "bg-[#e6f1fb] text-[#1a4f8a]",
    done: "bg-[#eaf3de] text-[#3b6d11]",
  };

  return (
    <AppLayout userName={profile.full_name} role={profile.role}>
      <div className="border-b px-8 py-6" style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold" style={{ color: "var(--text)" }}>My Tasks</h1>
            <p className="mt-0.5 text-sm" style={{ color: "var(--text3)" }}>
              Track and complete your career exploration tasks
            </p>
          </div>
          <Link
            href="/student"
            className="rounded-md border px-4 py-2 text-sm font-semibold transition-colors hover:bg-gray-50"
            style={{ borderColor: "var(--border)", color: "var(--text2)" }}
          >
            ← Back to Dashboard
          </Link>
        </div>
      </div>

      <div className="p-8">
        {/* Stats */}
        <div className="mb-6 grid grid-cols-3 gap-4">
          <div className="rounded-lg border p-4" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
            <div className="text-xs font-semibold" style={{ color: "var(--text3)" }}>Pending</div>
            <div className="mt-1 text-2xl font-bold" style={{ color: "var(--warn)" }}>{pendingTasks.length}</div>
          </div>
          <div className="rounded-lg border p-4" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
            <div className="text-xs font-semibold" style={{ color: "var(--text3)" }}>In Progress</div>
            <div className="mt-1 text-2xl font-bold" style={{ color: "var(--accent)" }}>{inProgressTasks.length}</div>
          </div>
          <div className="rounded-lg border p-4" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
            <div className="text-xs font-semibold" style={{ color: "var(--text3)" }}>Completed</div>
            <div className="mt-1 text-2xl font-bold" style={{ color: "var(--success)" }}>{doneTasks.length}</div>
          </div>
        </div>

        {/* Tasks List */}
        {studentRecord.tasks.length === 0 ? (
          <div className="rounded-xl border-2 border-dashed p-12 text-center" style={{ borderColor: "var(--border)" }}>
            <span className="text-5xl">✅</span>
            <h2 className="mt-4 text-lg font-semibold" style={{ color: "var(--text)" }}>
              No Tasks Yet
            </h2>
            <p className="mt-2 text-sm" style={{ color: "var(--text3)" }}>
              Tasks assigned by your counsellor will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Pending & In Progress */}
            {(pendingTasks.length > 0 || inProgressTasks.length > 0) && (
              <div>
                <h2 className="mb-3 text-sm font-bold" style={{ color: "var(--text)" }}>🎯 Active Tasks</h2>
                <div className="space-y-3">
                  {[...pendingTasks, ...inProgressTasks].map((task) => (
                    <div
                      key={task.id}
                      className="rounded-xl border p-5 shadow-sm transition-shadow hover:shadow-md"
                      style={{ background: "var(--surface)", borderColor: "var(--border)" }}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">
                              {task.status === "in_progress" ? "⏳" : "⭕"}
                            </span>
                            <div>
                              <h3 className="text-base font-semibold" style={{ color: "var(--text)" }}>
                                {task.title}
                              </h3>
                              <div className="mt-1 flex items-center gap-3 text-xs" style={{ color: "var(--text3)" }}>
                                <span>Type: {task.type}</span>
                                <span>•</span>
                                <span>Assigned: {new Date(task.created_at).toLocaleDateString()}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${
                            taskStatusColor[task.status] ?? "bg-gray-100 text-gray-500"
                          }`}
                        >
                          {task.status.replace("_", " ")}
                        </span>
                      </div>

                      {/* Action hint */}
                      <div className="mt-4 flex items-center gap-2 rounded-lg p-3" style={{ background: "var(--surface2)" }}>
                        <span className="text-lg">💡</span>
                        <p className="text-xs" style={{ color: "var(--text3)" }}>
                          {task.status === "pending" 
                            ? "Ready to start? Contact your counsellor to discuss and begin this task."
                            : "Making progress? Share updates with your counsellor during your next session."
                          }
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Completed Tasks */}
            {doneTasks.length > 0 && (
              <div>
                <h2 className="mb-3 text-sm font-bold" style={{ color: "var(--text)" }}>✅ Completed Tasks</h2>
                <div className="space-y-3">
                  {doneTasks.map((task) => (
                    <div
                      key={task.id}
                      className="rounded-xl border p-4 opacity-75"
                      style={{ background: "var(--surface2)", borderColor: "var(--border)" }}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xl">✅</span>
                        <div className="flex-1">
                          <div className="text-sm font-semibold" style={{ color: "var(--text)" }}>{task.title}</div>
                          <div className="text-xs" style={{ color: "var(--text3)" }}>
                            Completed on {new Date(task.updated_at).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Help Card */}
        <div className="mt-8 rounded-xl border p-5" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
          <div className="flex items-start gap-3">
            <span className="text-2xl">💡</span>
            <div>
              <h3 className="mb-2 font-semibold" style={{ color: "var(--text)" }}>Tips for Completing Tasks</h3>
              <ul className="space-y-1 text-sm" style={{ color: "var(--text2)" }}>
                <li>• Review tasks assigned by your counsellor carefully</li>
                <li>• Discuss progress during your counselling sessions</li>
                <li>• Ask questions if you need clarification</li>
                <li>• Complete tasks before your next session for best results</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
