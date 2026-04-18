import { prisma } from "@/lib/prisma";
import { requireRole, getUser } from "@/lib/auth";
import AppLayout from "@/components/AppLayout";
import Link from "next/link";

export default async function StudentSessionsPage() {
  const profile = await requireRole(["student", "admin"]);
  const user = await getUser();

  const studentRecord = profile.role === "admin"
    ? await prisma.student.findFirst({ 
        include: { 
          sessions: { 
            include: { tasks: true }, 
            orderBy: { session_date: "desc" } 
          } 
        } 
      })
    : await prisma.student.findFirst({
        where: { email: user?.email },
        include: {
          sessions: { 
            include: { tasks: true }, 
            orderBy: { session_date: "desc" } 
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

  const stageColors: Record<string, string> = {
    Exploration: "bg-[#e6f1fb] text-[#1a4f8a]",
    Clarification: "bg-[#faeeda] text-[#854f0b]",
    Decision: "bg-[#e1f5ee] text-[#0f6e56]",
    Planning: "bg-[#f1efff] text-[#534ab7]",
    Action: "bg-[#fce7f3] text-[#9f1239]",
  };

  return (
    <AppLayout userName={profile.full_name} role={profile.role}>
      <div className="border-b px-8 py-6" style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold" style={{ color: "var(--text)" }}>My Sessions</h1>
            <p className="mt-0.5 text-sm" style={{ color: "var(--text3)" }}>
              {studentRecord.sessions.length} {studentRecord.sessions.length === 1 ? "session" : "sessions"} recorded
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
        {studentRecord.sessions.length === 0 ? (
          <div className="rounded-xl border-2 border-dashed p-12 text-center" style={{ borderColor: "var(--border)" }}>
            <span className="text-5xl">📅</span>
            <h2 className="mt-4 text-lg font-semibold" style={{ color: "var(--text)" }}>No Sessions Yet</h2>
            <p className="mt-2 text-sm" style={{ color: "var(--text3)" }}>
              Your counselling sessions will appear here once they are scheduled or completed.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {studentRecord.sessions.map((session, index) => {
              const isUpcoming = session.status === "scheduled" && session.session_date && new Date(session.session_date) > new Date();
              const isCompleted = session.status === "completed";
              
              return (
                <div 
                  key={session.id}
                  className="rounded-xl border p-6 shadow-sm transition-shadow hover:shadow-md"
                  style={{ background: "var(--surface)", borderColor: "var(--border)" }}
                >
                  {/* Session Header */}
                  <div className="mb-4 flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-bold" style={{ color: "var(--text)" }}>
                          Session {studentRecord.sessions.length - index}
                        </h3>
                        {isUpcoming && (
                          <span className="rounded-full px-3 py-1 text-xs font-semibold" 
                            style={{ background: "var(--warn-light)", color: "var(--warn)" }}>
                            Upcoming
                          </span>
                        )}
                        {isCompleted && (
                          <span className="rounded-full px-3 py-1 text-xs font-semibold" 
                            style={{ background: "var(--success-light)", color: "var(--success)" }}>
                            Completed ✓
                          </span>
                        )}
                      </div>
                      <div className="mt-1 flex items-center gap-2 text-sm" style={{ color: "var(--text3)" }}>
                        <span>📅</span>
                        <span>
                          {session.session_date 
                            ? new Date(session.session_date).toLocaleDateString("en-US", { 
                                weekday: "long", 
                                year: "numeric", 
                                month: "long", 
                                day: "numeric" 
                              })
                            : "Date to be confirmed"
                          }
                        </span>
                      </div>
                    </div>
                    {session.career_journey_stage && (
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${stageColors[session.career_journey_stage] ?? "bg-gray-100 text-gray-500"}`}>
                        {session.career_journey_stage}
                      </span>
                    )}
                  </div>

                  {/* Career Interest */}
                  {session.career_choice && (
                    <div className="mb-4 rounded-lg p-4" style={{ background: "var(--surface2)" }}>
                      <div className="mb-1 text-xs font-semibold" style={{ color: "var(--text3)" }}>Career Interest Discussed</div>
                      <div className="text-sm font-semibold" style={{ color: "var(--text)" }}>{session.career_choice}</div>
                    </div>
                  )}

                  {/* Counsellor Notes */}
                  {session.observations && (
                    <div className="mb-4">
                      <div className="mb-2 flex items-center gap-2">
                        <span className="text-sm font-bold" style={{ color: "var(--text)" }}>📝 Counsellor Notes</span>
                      </div>
                      <div className="rounded-lg border p-4" style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
                        <p className="text-sm leading-relaxed" style={{ color: "var(--text2)" }}>
                          {session.observations}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Session Details */}
                  {session.session_details && (
                    <div className="mb-4">
                      <div className="mb-2 text-sm font-bold" style={{ color: "var(--text)" }}>📌 Session Details</div>
                      <div className="rounded-lg border p-4" style={{ borderColor: "var(--border)" }}>
                        <p className="text-sm leading-relaxed" style={{ color: "var(--text2)" }}>
                          {session.session_details}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Tasks */}
                  {session.tasks && session.tasks.length > 0 && (
                    <div className="mt-4">
                      <div className="mb-3 text-sm font-bold" style={{ color: "var(--text)" }}>✅ Tasks from This Session</div>
                      <div className="space-y-2">
                        {session.tasks.map((task) => (
                          <div 
                            key={task.id}
                            className="flex items-center gap-3 rounded-lg border p-3"
                            style={{ borderColor: "var(--border)" }}
                          >
                            <span className="text-xl">
                              {task.status === "done" ? "✅" : task.status === "in_progress" ? "⏳" : "⭕"}
                            </span>
                            <div className="flex-1">
                              <div className="text-sm font-medium" style={{ color: "var(--text)" }}>{task.title}</div>
                              <div className="text-xs" style={{ color: "var(--text3)" }}>Type: {task.type}</div>
                            </div>
                            <span className={`rounded-full px-2 py-1 text-xs font-semibold capitalize ${
                              task.status === "done" 
                                ? "bg-[#eaf3de] text-[#3b6d11]" 
                                : task.status === "in_progress"
                                ? "bg-[#e6f1fb] text-[#1a4f8a]"
                                : "bg-[#faeeda] text-[#854f0b]"
                            }`}>
                              {task.status.replace("_", " ")}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Upcoming session notice */}
                  {isUpcoming && (
                    <div className="mt-4 rounded-lg p-4" style={{ background: "var(--accent-light)" }}>
                      <p className="text-sm" style={{ color: "var(--accent)" }}>
                        ⏳ Your session is coming up! Notes and details will be added by your counsellor after the session.
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
