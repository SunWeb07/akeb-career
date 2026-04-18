import { prisma } from "@/lib/prisma";
import { requireRole, getUser } from "@/lib/auth";
import AppLayout from "@/components/AppLayout";
import Link from "next/link";

export default async function StudentDashboardPage() {
  const profile = await requireRole(["student", "admin"]);
  const user = await getUser();

  // If admin previewing, just show first student. Otherwise match by email.
  const studentRecord = profile.role === "admin"
    ? await prisma.student.findFirst({ 
        include: { 
          sessions: { include: { tasks: true }, orderBy: { session_date: "asc" } }, 
          tasks: { where: { status: { not: "done" } } },
          mindler_assessment: true,
        } 
      })
    : await prisma.student.findFirst({
        where: { email: user?.email },
        include: {
          sessions: { include: { tasks: true }, orderBy: { session_date: "asc" } },
          tasks: { where: { status: { not: "done" } } },
          mindler_assessment: true,
        },
      });

  const stageColors: Record<string, string> = {
    Exploration: "bg-[#e6f1fb] text-[#1a4f8a]",
    Clarification: "bg-[#faeeda] text-[#854f0b]",
    Decision: "bg-[#e1f5ee] text-[#0f6e56]",
    Planning: "bg-[#f1efff] text-[#534ab7]",
  };

  const taskStatusColor: Record<string, string> = {
    pending:     "bg-[#faeeda] text-[#854f0b]",
    in_progress: "bg-[#e6f1fb] text-[#1a4f8a]",
    done:        "bg-[#eaf3de] text-[#3b6d11]",
  };

  if (!studentRecord) {
    return (
      <AppLayout userName={profile.full_name} role={profile.role}>
        <div className="flex min-h-screen items-center justify-center" style={{ background: "var(--bg)" }}>
          <div className="text-center">
            <p className="text-lg font-medium" style={{ color: "var(--text2)" }}>No student record linked to your account.</p>
            <p className="mt-1 text-sm" style={{ color: "var(--text3)" }}>Contact your school's career guidance coordinator to register for career counselling.</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  const initials = studentRecord.full_name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  const latestSession = studentRecord.sessions[studentRecord.sessions.length - 1];
  const nextSession = studentRecord.sessions.find((s) => s.status === "scheduled" && s.session_date && new Date(s.session_date) > new Date());

  return (
    <AppLayout userName={profile.full_name} role={profile.role}>
      <div className="border-b px-8 py-6" style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
        <h1 className="text-xl font-bold" style={{ color: "var(--text)" }}>My Career Journey</h1>
        <p className="mt-0.5 text-sm" style={{ color: "var(--text3)" }}>Welcome back, {studentRecord.full_name}</p>
      </div>

      <div className="p-8">
        {/* Quick Actions */}
        <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Link
            href="/student/sessions"
            className="flex items-center gap-3 rounded-lg border p-4 transition-all hover:shadow-md"
            style={{ background: "var(--surface)", borderColor: "var(--border)" }}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ background: "var(--accent-light)" }}>
              <span className="text-xl">📋</span>
            </div>
            <div>
              <div className="text-sm font-semibold" style={{ color: "var(--text)" }}>My Sessions</div>
              <div className="text-xs" style={{ color: "var(--text3)" }}>{studentRecord.sessions.length} recorded</div>
            </div>
          </Link>

          <Link
            href="/student/tasks"
            className="flex items-center gap-3 rounded-lg border p-4 transition-all hover:shadow-md"
            style={{ background: "var(--surface)", borderColor: "var(--border)" }}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ background: "var(--warn-light)" }}>
              <span className="text-xl">✅</span>
            </div>
            <div>
              <div className="text-sm font-semibold" style={{ color: "var(--text)" }}>My Tasks</div>
              <div className="text-xs" style={{ color: "var(--text3)" }}>{studentRecord.tasks.length} pending</div>
            </div>
          </Link>

          <Link
            href="/student/request-session"
            className="flex items-center gap-3 rounded-lg border p-4 transition-all hover:shadow-md"
            style={{ background: "var(--surface)", borderColor: "var(--border)" }}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ background: "var(--success-light)" }}>
              <span className="text-xl">📞</span>
            </div>
            <div>
              <div className="text-sm font-semibold" style={{ color: "var(--text)" }}>Request Session</div>
              <div className="text-xs" style={{ color: "var(--text3)" }}>Book follow-up</div>
            </div>
          </Link>
        </div>

        <div className="mb-5 grid grid-cols-1 gap-4 lg:grid-cols-2">
          {/* Profile card */}
          <div className="rounded-[10px] border p-5" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
            <h2 className="mb-4 text-sm font-bold" style={{ color: "var(--text)" }}>My Profile</h2>
            <div className="mb-4 flex items-start gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full text-base font-bold" style={{ background: "var(--accent-light)", color: "var(--accent)" }}>
                {initials}
              </div>
              <div>
                <div className="text-base font-bold" style={{ color: "var(--text)" }}>{studentRecord.full_name}</div>
                <div className="text-xs" style={{ color: "var(--text3)" }}>{studentRecord.akeb_id}</div>
                <div className="text-xs" style={{ color: "var(--text3)" }}>{studentRecord.school_grade} · {studentRecord.school_name}</div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <div style={{ color: "var(--text3)" }}>Total Sessions</div>
                <div className="mt-0.5 font-bold text-sm" style={{ color: "var(--text)" }}>{studentRecord.sessions.length}</div>
              </div>
              <div>
                <div style={{ color: "var(--text3)" }}>Career Interest</div>
                <div className="mt-0.5 font-bold text-sm" style={{ color: "var(--text)" }}>{latestSession?.career_choice ?? "—"}</div>
              </div>
              <div>
                <div style={{ color: "var(--text3)" }}>Journey Stage</div>
                <div className="mt-0.5">
                  {latestSession?.career_journey_stage ? (
                    <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${stageColors[latestSession.career_journey_stage] ?? "bg-gray-100 text-gray-500"}`}>
                      {latestSession.career_journey_stage}
                    </span>
                  ) : <span style={{ color: "var(--text3)" }}>—</span>}
                </div>
              </div>
              <div>
                <div style={{ color: "var(--text3)" }}>Status</div>
                <div className="mt-0.5">
                  <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${studentRecord.concluded ? "bg-[#eaf3de] text-[#3b6d11]" : "bg-[#e1f5ee] text-[#0f6e56]"}`}>
                    {studentRecord.concluded ? "Concluded ✓" : "In Progress"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Next steps */}
          <div className="rounded-[10px] border p-5" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
            <h2 className="mb-4 text-sm font-bold" style={{ color: "var(--text)" }}>⏭️ Next Steps</h2>
            <div className="space-y-2.5">
              {nextSession ? (
                <div className="flex items-start gap-3 rounded-md border p-3" style={{ borderColor: "var(--border)" }}>
                  <span className="text-xl">📅</span>
                  <div>
                    <div className="text-sm font-semibold" style={{ color: "var(--text)" }}>Follow-up Session Scheduled</div>
                    <div className="text-xs" style={{ color: "var(--text3)" }}>
                      {new Date(nextSession.session_date!).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-3 rounded-md p-3" style={{ background: "var(--surface2)" }}>
                  <span className="text-xl">📅</span>
                  <div className="text-sm" style={{ color: "var(--text3)" }}>No upcoming sessions scheduled.</div>
                </div>
              )}
              {studentRecord.tasks.length > 0 && (
                <div className="flex items-start gap-3 rounded-md p-3" style={{ background: "var(--warn-light)" }}>
                  <span className="text-xl">📝</span>
                  <div>
                    <div className="text-sm font-semibold" style={{ color: "var(--warn)" }}>{studentRecord.tasks.length} Tasks Pending</div>
                    <div className="text-xs" style={{ color: "var(--text3)" }}>Complete before your next session</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mindler Assessment Section */}
        <div className="mb-5 rounded-[10px] border p-5" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-bold" style={{ color: "var(--text)" }}>🧠 Career Assessment (Mindler)</h2>
            {studentRecord.mindler_assessment && (
              <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                studentRecord.mindler_assessment.status === "done" 
                  ? "bg-[#eaf3de] text-[#3b6d11]" 
                  : "bg-[#faeeda] text-[#854f0b]"
              }`}>
                {studentRecord.mindler_assessment.status === "done" ? "Completed ✓" : "Pending"}
              </span>
            )}
          </div>
          
          {studentRecord.mindler_assessment ? (
            <div>
              {studentRecord.mindler_assessment.status === "done" ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-md border p-3" style={{ borderColor: "var(--border)" }}>
                      <div className="text-xs" style={{ color: "var(--text3)" }}>Mindler ID</div>
                      <div className="mt-1 text-sm font-semibold" style={{ color: "var(--text)" }}>
                        {studentRecord.mindler_assessment.mindler_id ?? "—"}
                      </div>
                    </div>
                    <div className="rounded-md border p-3" style={{ borderColor: "var(--border)" }}>
                      <div className="text-xs" style={{ color: "var(--text3)" }}>Password</div>
                      <div className="mt-1 text-sm font-semibold font-mono" style={{ color: "var(--text)" }}>
                        {studentRecord.mindler_assessment.mindler_password ?? "—"}
                      </div>
                    </div>
                  </div>
                  {studentRecord.mindler_assessment.result_summary && (
                    <div className="rounded-md p-4" style={{ background: "var(--surface2)" }}>
                      <div className="mb-2 text-xs font-semibold" style={{ color: "var(--text3)" }}>Assessment Summary</div>
                      <div className="text-sm leading-relaxed" style={{ color: "var(--text2)" }}>
                        {studentRecord.mindler_assessment.result_summary}
                      </div>
                    </div>
                  )}
                  <div className="text-xs italic" style={{ color: "var(--text3)" }}>
                    Completed on {new Date(studentRecord.mindler_assessment.updated_at).toLocaleDateString("en-US", { dateStyle: "medium" })}
                  </div>
                </div>
              ) : (
                <div className="rounded-md p-4" style={{ background: "var(--warn-light)" }}>
                  <div className="text-sm font-semibold" style={{ color: "var(--warn)" }}>Assessment Pending</div>
                  <div className="mt-1 text-xs" style={{ color: "var(--text3)" }}>
                    Your career assessment is scheduled. Your counsellor will share the login details with you soon.
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="rounded-md border-2 border-dashed p-6 text-center" style={{ borderColor: "var(--border)" }}>
              <span className="text-3xl">📝</span>
              <div className="mt-2 text-sm font-medium" style={{ color: "var(--text2)" }}>No Assessment Scheduled Yet</div>
              <div className="mt-1 text-xs" style={{ color: "var(--text3)" }}>
                Career assessments help identify your strengths and interests. Contact your counsellor if you'd like to take one.
              </div>
            </div>
          )}
        </div>

        {/* Request Clarification / Register Section */}
        <div className="mb-5 grid grid-cols-1 gap-4 lg:grid-cols-2">
          {studentRecord.sessions.length > 0 ? (
            <div className="rounded-[10px] border p-5" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
              <h3 className="mb-3 text-sm font-bold" style={{ color: "var(--text)" }}>💬 Request Follow-up Session</h3>
              <p className="mb-4 text-xs" style={{ color: "var(--text3)" }}>
                Have questions about your career path or need clarification on your counselling sessions?
              </p>
              <Link 
                href="/student/request-session"
                className="block w-full rounded-md px-4 py-2.5 text-center text-sm font-semibold text-white transition-opacity hover:opacity-90"
                style={{ background: "var(--accent)" }}
              >
                📞 Request Follow-up Session
              </Link>
            </div>
          ) : (
            <div className="rounded-[10px] border p-5" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
              <h3 className="mb-3 text-sm font-bold" style={{ color: "var(--text)" }}>🚀 Ready to Start?</h3>
              <p className="mb-4 text-xs" style={{ color: "var(--text3)" }}>
                Begin your personalized career exploration journey with our expert counsellors.
              </p>
              <Link 
                href="/student/request-session"
                className="block w-full rounded-md px-4 py-2.5 text-center text-sm font-semibold text-white transition-opacity hover:opacity-90"
                style={{ background: "var(--accent)" }}
              >
                ✍️ Register for Counselling
              </Link>
            </div>
          )}
          
          <div className="rounded-[10px] border p-5" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
            <h3 className="mb-3 text-sm font-bold" style={{ color: "var(--text)" }}>📝 Share Progress Update</h3>
            <p className="mb-4 text-xs" style={{ color: "var(--text3)" }}>
              Completed tasks or want to share updates with your counsellor?
            </p>
            <Link
              href="/student/tasks"
              className="block w-full rounded-md border px-4 py-2.5 text-center text-sm font-semibold transition-all hover:shadow-md"
              style={{ borderColor: "var(--accent)", color: "var(--accent)" }}
            >
              View My Tasks →
            </Link>
          </div>
        </div>

        {/* Session Timeline */}
        <div className="mb-5 rounded-[10px] border p-5" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-sm font-bold" style={{ color: "var(--text)" }}>📋 My Session History & Counsellor Notes</h2>
            <span className="rounded-full px-2 py-0.5 text-xs font-semibold" style={{ background: "var(--surface2)", color: "var(--text3)" }}>
              {studentRecord.sessions.length} sessions
            </span>
          </div>
          {studentRecord.sessions.length === 0 ? (
            <div className="rounded-md border-2 border-dashed p-8 text-center" style={{ borderColor: "var(--border)" }}>
              <span className="text-4xl">📅</span>
              <p className="mt-3 text-sm font-medium" style={{ color: "var(--text2)" }}>No sessions recorded yet</p>
              <p className="mt-1 text-xs" style={{ color: "var(--text3)" }}>Your counselling sessions will appear here once scheduled.</p>
            </div>
          ) : (
            <div className="relative pl-6" style={{ borderLeft: "2px solid var(--border)" }}>
              {studentRecord.sessions.map((s, i) => {
                const isUpcoming = s.status === "scheduled" && s.session_date && new Date(s.session_date) > new Date();
                const isCompleted = s.status === "completed";
                const sessionTasks = s.tasks ?? [];
                return (
                  <div key={s.id} className="relative pb-8 last:pb-0">
                    <div className="absolute -left-[29px] h-4 w-4 rounded-full border-3"
                      style={{ 
                        background: isUpcoming ? "var(--warn)" : isCompleted ? "var(--success)" : "var(--accent)", 
                        borderColor: "var(--surface)",
                        borderWidth: "3px"
                      }}
                    />
                    
                    {/* Session Header */}
                    <div className="mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold" style={{ color: "var(--text3)" }}>
                          Session {i + 1}
                        </span>
                        <span className="text-xs" style={{ color: "var(--text3)" }}>•</span>
                        <span className="text-xs" style={{ color: "var(--text3)" }}>
                          {s.session_date ? new Date(s.session_date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) : "Date TBC"}
                        </span>
                        {isUpcoming && (
                          <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold" style={{ background: "var(--warn-light)", color: "var(--warn)" }}>
                            Upcoming
                          </span>
                        )}
                      </div>
                      <div className="mt-1 text-sm font-bold" style={{ color: "var(--text)" }}>
                        {s.career_journey_stage ?? "Career Counselling Session"}
                      </div>
                      {s.career_choice && (
                        <div className="mt-1 text-xs" style={{ color: "var(--text2)" }}>
                          <span style={{ color: "var(--text3)" }}>Career Interest:</span> <span className="font-semibold">{s.career_choice}</span>
                        </div>
                      )}
                    </div>

                    {/* Counsellor Notes */}
                    {s.observations && (
                      <div className="mb-3 rounded-md border p-3" style={{ borderColor: "var(--border)", background: "var(--surface2)" }}>
                        <div className="mb-1.5 flex items-center gap-2">
                          <span className="text-xs font-semibold" style={{ color: "var(--text2)" }}>📝 Counsellor Notes</span>
                        </div>
                        <div className="text-xs leading-relaxed" style={{ color: "var(--text2)" }}>
                          {s.observations}
                        </div>
                      </div>
                    )}

                    {/* Session Details */}
                    {s.session_details && (
                      <div className="mb-3 rounded-md border p-3" style={{ borderColor: "var(--border)" }}>
                        <div className="mb-1.5 text-xs font-semibold" style={{ color: "var(--text2)" }}>📌 Session Details</div>
                        <div className="text-xs leading-relaxed" style={{ color: "var(--text2)" }}>
                          {s.session_details}
                        </div>
                      </div>
                    )}

                    {isUpcoming && (
                      <div className="mb-3 rounded-md p-3" style={{ background: "var(--accent-light)" }}>
                        <div className="text-xs italic" style={{ color: "var(--accent)" }}>
                          ⏳ Upcoming session — notes and details will appear here after your session with the counsellor.
                        </div>
                      </div>
                    )}

                    {/* Tasks from this session */}
                    {sessionTasks.length > 0 && (
                      <div className="mt-3">
                        <div className="mb-2 text-xs font-semibold" style={{ color: "var(--text2)" }}>✅ Action Items:</div>
                        <div className="flex flex-wrap gap-2">
                          {sessionTasks.map((t) => (
                            <div key={t.id} className="rounded-md border px-3 py-1.5 text-xs"
                              style={{ 
                                background: t.status === "done" ? "var(--success-light)" : "var(--surface2)", 
                                borderColor: t.status === "done" ? "var(--success)" : "var(--border)",
                                color: "var(--text2)"
                              }}
                            >
                              <span className="mr-1">{t.status === "done" ? "✅" : "⏳"}</span>
                              {t.title}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Follow-up indicator */}
                    {s.followup_required && !s.concluded && (
                      <div className="mt-3 flex items-center gap-2 text-xs" style={{ color: "var(--text3)" }}>
                        <span>🔄</span>
                        <span>Follow-up session recommended</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Pending Tasks */}
        {studentRecord.tasks.length > 0 && (
          <div className="rounded-[10px] border p-5" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
            <h2 className="mb-4 text-sm font-bold" style={{ color: "var(--text)" }}>✅ My Pending Tasks</h2>
            <div className="space-y-2.5">
              {studentRecord.tasks.map((t) => (
                <div key={t.id} className="flex items-center gap-3 rounded-md border p-3" style={{ borderColor: "var(--border)" }}>
                  <input type="checkbox" className="h-4 w-4 rounded" style={{ accentColor: "var(--accent)" }} />
                  <div className="flex-1">
                    <div className="text-sm font-semibold" style={{ color: "var(--text)" }}>{t.title}</div>
                    <div className="text-xs" style={{ color: "var(--text3)" }}>Type: {t.type}</div>
                  </div>
                  <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold capitalize ${taskStatusColor[t.status] ?? "bg-gray-100 text-gray-500"}`}>
                    {t.status.replace("_", " ")}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
