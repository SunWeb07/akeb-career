import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import AppLayout from "@/components/AppLayout";
import StudentCard from "@/components/StudentCard";

export default async function InstitutionPage() {
  const profile = await requireRole(["institution", "admin"]);

  // Load institution for this profile
  const institution = profile.institution_id
    ? await prisma.institution.findUnique({
        where: { id: profile.institution_id },
        include: {
          students: {
            include: { student: true },
            orderBy: { student: { full_name: "asc" } },
          },
        },
      })
    : null;

  const students = institution?.students.map((si) => si.student) ?? [];

  // Sessions for all linked students
  const studentIds = students.map((s) => s.id);
  const [sessions, requests] = await Promise.all([
    studentIds.length > 0
      ? prisma.session.findMany({
          where: { student_id: { in: studentIds } },
          include: { student: true },
          orderBy: { session_date: "desc" },
          take: 10,
        })
      : [],
    studentIds.length > 0
      ? prisma.sessionRequest.findMany({
          where: { student_id: { in: studentIds }, status: "pending" },
          include: { student: true },
          orderBy: { created_at: "desc" },
          take: 10,
        })
      : [],
  ]);

  const sessionStatusColor: Record<string, string> = {
    scheduled: "bg-amber-100 text-amber-700",
    completed: "bg-emerald-100 text-emerald-700",
    cancelled: "bg-gray-100 text-gray-500",
  };

  return (
    <AppLayout userName={profile.full_name} role={profile.role}>
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Institution Overview</h1>
          {institution && (
            <p className="mt-1 text-sm text-gray-500">
              {institution.name}
              {institution.council ? ` · ${institution.council}` : ""}
              {institution.centre ? ` · ${institution.centre}` : ""}
            </p>
          )}
        </div>

        {!institution ? (
          <div className="space-y-8">
            {/* Main Empty State */}
            <div className="rounded-xl border-2 border-dashed border-gray-300 bg-gradient-to-br from-gray-50 to-blue-50 p-12 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-indigo-100">
                <span className="text-3xl">🏢</span>
              </div>
              <h2 className="mb-2 text-xl font-bold text-gray-900">Welcome to AKEB Career Portal</h2>
              <p className="mb-1 text-base font-medium text-gray-600">No institution linked to your account yet.</p>
              <p className="text-sm text-gray-500">Contact an admin to link your profile and unlock all features.</p>
            </div>

            {/* What You'll Get Access To */}
            <div>
              <h3 className="mb-4 text-lg font-semibold text-gray-900">What You'll Get Access To</h3>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100">
                    <span className="text-xl">👥</span>
                  </div>
                  <h4 className="mb-2 font-semibold text-gray-900">Student Management</h4>
                  <p className="text-sm text-gray-600">
                    View and manage all students linked to your institution. Track their counselling journey and progress.
                  </p>
                </div>

                <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100">
                    <span className="text-xl">📋</span>
                  </div>
                  <h4 className="mb-2 font-semibold text-gray-900">Session Requests</h4>
                  <p className="text-sm text-gray-600">
                    Raise counselling session requests for your students. Track pending, in-progress, and completed requests.
                  </p>
                </div>

                <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100">
                    <span className="text-xl">📊</span>
                  </div>
                  <h4 className="mb-2 font-semibold text-gray-900">Progress Tracking</h4>
                  <p className="text-sm text-gray-600">
                    Monitor session outcomes, career choices, and student development through detailed analytics.
                  </p>
                </div>

                <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">
                    <span className="text-xl">🧠</span>
                  </div>
                  <h4 className="mb-2 font-semibold text-gray-900">Mindler Assessments</h4>
                  <p className="text-sm text-gray-600">
                    Request career assessments for students and view their results to guide counselling sessions.
                  </p>
                </div>

                <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                    <span className="text-xl">📈</span>
                  </div>
                  <h4 className="mb-2 font-semibold text-gray-900">Reports & Insights</h4>
                  <p className="text-sm text-gray-600">
                    Generate comprehensive reports on student progress, session statistics, and career trends.
                  </p>
                </div>

                <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-pink-100">
                    <span className="text-xl">🔔</span>
                  </div>
                  <h4 className="mb-2 font-semibold text-gray-900">Real-time Updates</h4>
                  <p className="text-sm text-gray-600">
                    Receive notifications about session updates, completed assessments, and pending actions.
                  </p>
                </div>
              </div>
            </div>

            {/* Getting Started */}
            <div className="rounded-xl border border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 p-6">
              <h3 className="mb-4 text-lg font-semibold text-gray-900">🚀 Getting Started</h3>
              <div className="space-y-3">
                <div className="flex gap-3">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white">
                    1
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Contact Your Administrator</p>
                    <p className="text-sm text-gray-600">Reach out to your AKEB system administrator to request institution access.</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white">
                    2
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Provide Institution Details</p>
                    <p className="text-sm text-gray-600">Share your institution name, council, and centre information for verification.</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white">
                    3
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Get Activated</p>
                    <p className="text-sm text-gray-600">Once linked, you'll have full access to all features and can start raising session requests.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Support */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                <div className="mb-3 flex items-center gap-2">
                  <span className="text-xl">💬</span>
                  <h4 className="font-semibold text-gray-900">Need Help?</h4>
                </div>
                <p className="mb-3 text-sm text-gray-600">
                  If you have questions about the portal or need assistance getting started, contact our support team.
                </p>
                <button className="rounded-lg border border-indigo-600 px-4 py-2 text-sm font-semibold text-indigo-600 transition-colors hover:bg-indigo-50">
                  Contact Support
                </button>
              </div>

              <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                <div className="mb-3 flex items-center gap-2">
                  <span className="text-xl">📚</span>
                  <h4 className="font-semibold text-gray-900">About AKEB Career Portal</h4>
                </div>
                <p className="text-sm text-gray-600">
                  A comprehensive platform for managing student career counselling, tracking progress, and facilitating meaningful career guidance.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Stats */}
            <div className="mb-8 grid grid-cols-4 gap-4">
              {[
                { label: "Total Students", value: students.length, icon: "🎓", color: "text-indigo-600 bg-indigo-50" },
                { label: "Sessions Completed", value: sessions.filter(s => s.status === "completed").length, icon: "✅", color: "text-emerald-600 bg-emerald-50" },
                { label: "Pending Requests", value: requests.length, icon: "⏳", color: "text-amber-600 bg-amber-50" },
                { label: "Active Counselling", value: students.filter(s => !s.concluded).length, icon: "📊", color: "text-purple-600 bg-purple-50" },
              ].map(({ label, value, icon, color }) => (
                <div key={label} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <p className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${color}`}>
                      {label}
                    </p>
                    <span className="text-xl">{icon}</span>
                  </div>
                  <p className="mt-2 text-3xl font-bold text-gray-900">{value}</p>
                </div>
              ))}
            </div>

            {/* Quick Actions */}
            <div className="mb-8 rounded-xl border border-gray-200 bg-gradient-to-br from-indigo-50 to-blue-50 p-6">
              <h2 className="mb-4 text-lg font-semibold text-gray-900">Quick Actions</h2>
              <div className="grid grid-cols-3 gap-3">
                <a href="/institution/requests/new" className="flex items-center gap-3 rounded-lg border border-indigo-200 bg-white p-4 transition-all hover:shadow-md">
                  <span className="text-2xl">➕</span>
                  <div>
                    <div className="text-sm font-semibold text-gray-900">New Request</div>
                    <div className="text-xs text-gray-500">Raise a session request</div>
                  </div>
                </a>
                <a href="/institution/requests" className="flex items-center gap-3 rounded-lg border border-blue-200 bg-white p-4 transition-all hover:shadow-md">
                  <span className="text-2xl">📋</span>
                  <div>
                    <div className="text-sm font-semibold text-gray-900">My Requests</div>
                    <div className="text-xs text-gray-500">View all requests</div>
                  </div>
                </a>
                <a href="/students" className="flex items-center gap-3 rounded-lg border border-purple-200 bg-white p-4 transition-all hover:shadow-md">
                  <span className="text-2xl">👥</span>
                  <div>
                    <div className="text-sm font-semibold text-gray-900">View All Students</div>
                    <div className="text-xs text-gray-500">Full student directory</div>
                  </div>
                </a>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
              {/* Students list */}
              <div className="lg:col-span-2 space-y-8">
                <section>
                  <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-900">Students</h2>
                    <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">
                      {students.length} total
                    </span>
                  </div>
                  {students.length === 0 ? (
                    <div className="rounded-xl border-2 border-dashed border-gray-200 py-12 text-center">
                      <p className="text-sm text-gray-400">No students linked to this institution.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      {students.map((s) => (
                        <StudentCard key={s.id} student={s} />
                      ))}
                    </div>
                  )}
                </section>

                {/* Recent Sessions */}
                <section>
                  <h2 className="mb-4 text-lg font-semibold text-gray-900">Recent Sessions</h2>
                  {sessions.length === 0 ? (
                    <div className="rounded-xl border-2 border-dashed border-gray-200 py-12 text-center">
                      <p className="text-sm text-gray-400">No sessions recorded yet.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {sessions.map((s) => (
                        <div
                          key={s.id}
                          className="flex items-start justify-between rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
                        >
                          <div className="min-w-0">
                            <p className="font-medium text-gray-900">{s.student.full_name}</p>
                            {s.career_choice && (
                              <p className="mt-0.5 text-sm text-gray-500">
                                Career: {s.career_choice}
                              </p>
                            )}
                            {s.session_date && (
                              <p className="mt-0.5 text-xs text-gray-400">
                                {new Date(s.session_date).toLocaleDateString(undefined, {
                                  dateStyle: "medium",
                                })}
                              </p>
                            )}
                          </div>
                          <span
                            className={`ml-4 shrink-0 rounded-full px-2 py-0.5 text-xs font-medium capitalize ${
                              sessionStatusColor[s.status] ?? "bg-gray-100 text-gray-500"
                            }`}
                          >
                            {s.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              </div>

              {/* Right: institution info + pending requests */}
              <div className="space-y-8">
                {/* Institution details card */}
                <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                  <h3 className="mb-4 font-semibold text-gray-900">Institution Details</h3>
                  <dl className="space-y-3 text-sm">
                    <div>
                      <dt className="text-xs font-medium uppercase tracking-wide text-gray-400">Name</dt>
                      <dd className="mt-0.5 text-gray-900">{institution.name}</dd>
                    </div>
                    <div>
                      <dt className="text-xs font-medium uppercase tracking-wide text-gray-400">Type</dt>
                      <dd className="mt-0.5 capitalize text-gray-900">{institution.type}</dd>
                    </div>
                    {institution.council && (
                      <div>
                        <dt className="text-xs font-medium uppercase tracking-wide text-gray-400">Council</dt>
                        <dd className="mt-0.5 text-gray-900">{institution.council}</dd>
                      </div>
                    )}
                    {institution.centre && (
                      <div>
                        <dt className="text-xs font-medium uppercase tracking-wide text-gray-400">Centre</dt>
                        <dd className="mt-0.5 text-gray-900">{institution.centre}</dd>
                      </div>
                    )}
                  </dl>
                </div>

                {/* Pending requests */}
                <section>
                  <h2 className="mb-4 text-lg font-semibold text-gray-900">Pending Requests</h2>
                  {requests.length === 0 ? (
                    <div className="rounded-xl border-2 border-dashed border-gray-200 py-8 text-center">
                      <p className="text-sm text-gray-400">No pending requests.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {requests.map((r) => (
                        <div
                          key={r.id}
                          className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
                        >
                          <p className="font-medium text-gray-900">{r.student.full_name}</p>
                          <p className="mt-0.5 text-sm capitalize text-gray-500">{r.type}</p>
                          <p className="mt-0.5 text-xs text-gray-400">
                            {new Date(r.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </section>

                {/* Tips & Resources */}
                <div className="rounded-xl border border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 p-5 shadow-sm">
                  <div className="mb-3 flex items-center gap-2">
                    <span className="text-xl">💡</span>
                    <h3 className="font-semibold text-gray-900">Tips & Resources</h3>
                  </div>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li className="flex gap-2">
                      <span>•</span>
                      <span>Raise requests early for timely counselling sessions</span>
                    </li>
                    <li className="flex gap-2">
                      <span>•</span>
                      <span>Track student progress through session notes</span>
                    </li>
                    <li className="flex gap-2">
                      <span>•</span>
                      <span>Encourage students to complete Mindler assessments</span>
                    </li>
                    <li className="flex gap-2">
                      <span>•</span>
                      <span>Regular follow-ups improve career clarity</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </AppLayout>
  );
}
