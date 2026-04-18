import { prisma } from "@/lib/prisma";
import { requireRole, getUser } from "@/lib/auth";
import AppLayout from "@/components/AppLayout";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function RequestSessionPage() {
  const profile = await requireRole(["student", "admin"]);
  const user = await getUser();

  const studentRecord = profile.role === "admin"
    ? await prisma.student.findFirst({ 
        include: { 
          sessions: { 
            orderBy: { session_date: "desc" },
            take: 1 
          } 
        } 
      })
    : await prisma.student.findFirst({
        where: { email: user?.email },
        include: {
          sessions: { 
            orderBy: { session_date: "desc" },
            take: 1 
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

  const isNewStudent = studentRecord.sessions.length === 0;
  const hasCompletedSession = studentRecord.sessions.some(s => s.status === "completed");

  return (
    <AppLayout userName={profile.full_name} role={profile.role}>
      <div className="border-b px-8 py-6" style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold" style={{ color: "var(--text)" }}>
              {isNewStudent ? "Register for Counselling" : "Request Follow-up Session"}
            </h1>
            <p className="mt-0.5 text-sm" style={{ color: "var(--text3)" }}>
              {isNewStudent 
                ? "Start your personalized career exploration journey"
                : "Schedule a follow-up session with your counsellor"
              }
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
        <div className="mx-auto max-w-2xl">
          {/* Information Card */}
          <div className="mb-6 rounded-xl border p-6" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
            <div className="flex items-start gap-3">
              <span className="text-3xl">{isNewStudent ? "🎯" : "📞"}</span>
              <div>
                <h2 className="mb-2 text-lg font-bold" style={{ color: "var(--text)" }}>
                  {isNewStudent ? "Welcome to AKEB Career Counselling!" : "Request Your Next Session"}
                </h2>
                <p className="mb-3 text-sm leading-relaxed" style={{ color: "var(--text2)" }}>
                  {isNewStudent 
                    ? "Our expert counsellors will help you explore career options, understand your strengths, and create a personalized action plan for your future."
                    : "Continue your career exploration journey with a follow-up session. Discuss your progress, ask questions, and refine your career goals."
                  }
                </p>
                {!isNewStudent && hasCompletedSession && (
                  <div className="mt-4 rounded-lg p-3" style={{ background: "var(--surface2)" }}>
                    <div className="text-xs font-semibold" style={{ color: "var(--text3)" }}>Last Session</div>
                    <div className="mt-1 text-sm font-semibold" style={{ color: "var(--text)" }}>
                      {studentRecord.sessions[0]?.session_date 
                        ? new Date(studentRecord.sessions[0].session_date).toLocaleDateString("en-US", { 
                            year: "numeric", 
                            month: "long", 
                            day: "numeric" 
                          })
                        : "Date not available"
                      }
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Request Form */}
          <div className="rounded-xl border p-6" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
            <h3 className="mb-4 text-base font-bold" style={{ color: "var(--text)" }}>Session Request Details</h3>
            
            <form action="/api/requests" method="POST" className="space-y-5">
              <input type="hidden" name="student_id" value={studentRecord.id} />
              <input type="hidden" name="type" value={isNewStudent ? "initial" : "followup"} />

              {/* Reason for Request */}
              <div>
                <label className="mb-2 block text-sm font-semibold" style={{ color: "var(--text)" }}>
                  {isNewStudent ? "What brings you here?" : "What would you like to discuss?"}
                  <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="reason"
                  required
                  rows={4}
                  placeholder={isNewStudent 
                    ? "Tell us about your interests, goals, or what you'd like help with..."
                    : "Share what you'd like to cover in your next session..."
                  }
                  className="w-full rounded-lg border px-3 py-2.5 text-sm placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  style={{ borderColor: "var(--border)" }}
                />
              </div>

              {/* Preferred Topics */}
              <div>
                <label className="mb-2 block text-sm font-semibold" style={{ color: "var(--text)" }}>
                  Topics of Interest
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    "Career Exploration",
                    "Course Selection",
                    "University Options",
                    "Skill Development",
                    "Study Abroad",
                    "Career Planning",
                  ].map((topic) => (
                    <label key={topic} className="flex items-center gap-2 rounded-lg border p-3 cursor-pointer hover:bg-gray-50 transition-colors"
                      style={{ borderColor: "var(--border)" }}>
                      <input type="checkbox" name="topics" value={topic} className="rounded text-blue-600" />
                      <span className="text-sm" style={{ color: "var(--text2)" }}>{topic}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Preferred Time */}
              <div>
                <label className="mb-2 block text-sm font-semibold" style={{ color: "var(--text)" }}>
                  Preferred Time
                </label>
                <select
                  name="preferred_time"
                  className="w-full rounded-lg border px-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  style={{ borderColor: "var(--border)", color: "var(--text)" }}
                >
                  <option value="">Select preferred time</option>
                  <option value="morning">Morning (9:00 AM - 12:00 PM)</option>
                  <option value="afternoon">Afternoon (12:00 PM - 3:00 PM)</option>
                  <option value="evening">Evening (3:00 PM - 6:00 PM)</option>
                </select>
              </div>

              {/* Urgency */}
              <div>
                <label className="mb-2 block text-sm font-semibold" style={{ color: "var(--text)" }}>
                  How soon do you need this session?
                </label>
                <div className="space-y-2">
                  {[
                    { value: "urgent", label: "Urgent (Within 1 week)", icon: "🔴" },
                    { value: "soon", label: "Soon (1-2 weeks)", icon: "🟡" },
                    { value: "flexible", label: "Flexible (2-4 weeks)", icon: "🟢" },
                  ].map((option) => (
                    <label key={option.value} className="flex items-center gap-3 rounded-lg border p-3 cursor-pointer hover:bg-gray-50 transition-colors"
                      style={{ borderColor: "var(--border)" }}>
                      <input type="radio" name="urgency" value={option.value} className="text-blue-600" defaultChecked={option.value === "soon"} />
                      <span className="text-lg">{option.icon}</span>
                      <span className="text-sm font-medium" style={{ color: "var(--text2)" }}>{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Additional Notes */}
              <div>
                <label className="mb-2 block text-sm font-semibold" style={{ color: "var(--text)" }}>
                  Additional Notes (Optional)
                </label>
                <textarea
                  name="notes"
                  rows={3}
                  placeholder="Any specific questions or concerns you'd like to address..."
                  className="w-full rounded-lg border px-3 py-2.5 text-sm placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  style={{ borderColor: "var(--border)" }}
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  className="flex-1 rounded-lg px-4 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                  style={{ background: "var(--accent)" }}
                >
                  {isNewStudent ? "✍️ Submit Registration" : "📞 Request Session"}
                </button>
                <Link
                  href="/student"
                  className="rounded-lg border px-4 py-3 text-sm font-semibold transition-colors hover:bg-gray-50"
                  style={{ borderColor: "var(--border)", color: "var(--text2)" }}
                >
                  Cancel
                </Link>
              </div>
            </form>
          </div>

          {/* Help Text */}
          <div className="mt-6 rounded-xl border p-5" style={{ background: "var(--surface2)", borderColor: "var(--border)" }}>
            <div className="flex items-start gap-3">
              <span className="text-xl">💡</span>
              <div>
                <h4 className="mb-2 text-sm font-semibold" style={{ color: "var(--text)" }}>What happens next?</h4>
                <ul className="space-y-1 text-xs" style={{ color: "var(--text2)" }}>
                  <li>• Your request will be reviewed by our counselling team</li>
                  <li>• You'll receive a confirmation with session details via email</li>
                  <li>• A counsellor will be assigned based on your needs</li>
                  <li>• You can track your request status on your dashboard</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
