"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Student {
  id: string;
  full_name: string;
  akeb_id: string;
  school_grade?: string | null;
  school_name?: string | null;
}

interface SessionFormProps {
  /** Legacy single-student mode */
  studentId?: string;
  counsellorId?: string;
  onSuccess?: () => void;
  /** Multi-student select mode */
  students?: Student[];
  preselectedStudentId?: string;
  requestId?: string;
}

const inp = "w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 transition-colors";
const inpStyle = { borderColor: "var(--border2)", background: "var(--surface)", color: "var(--text)" };

export default function SessionForm({
  studentId: legacyStudentId,
  counsellorId,
  onSuccess,
  students = [],
  preselectedStudentId = "",
  requestId = "",
}: SessionFormProps) {
  const router = useRouter();
  const hasMultiMode = students.length > 0;

  const [studentId,          setStudentId]          = useState(preselectedStudentId || legacyStudentId || "");
  const [sessionDate,        setSessionDate]         = useState("");
  const [careerJourneyStage, setCareerJourneyStage]  = useState("");
  const [careerChoice,       setCareerChoice]        = useState("");
  const [emergingInterest,   setEmergingInterest]    = useState("");
  const [mindlerNeeded,      setMindlerNeeded]       = useState("no");
  const [observations,       setObservations]        = useState("");
  const [sessionDetails,     setSessionDetails]      = useState("");
  const [studentTasks,       setStudentTasks]        = useState("");
  const [institutionTasks,   setInstitutionTasks]    = useState("");
  const [followupDecision,   setFollowupDecision]    = useState<"followup" | "conclude">("followup");
  const [followupDate,       setFollowupDate]        = useState("");
  const [loading,            setLoading]             = useState(false);
  const [error,              setError]               = useState<string | null>(null);
  const [success,            setSuccess]             = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!studentId) { setError("Please select a student."); return; }
    setLoading(true); setError(null); setSuccess(false);

    const res = await fetch("/api/sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        student_id:           studentId,
        counsellor_id:        counsellorId,
        session_date:         sessionDate        || undefined,
        career_journey_stage: careerJourneyStage || undefined,
        career_choice:        careerChoice       || undefined,
        emerging_interest:    emergingInterest   || undefined,
        mindler_needed:       mindlerNeeded === "yes",
        observations:         observations       || undefined,
        session_details:      sessionDetails     || undefined,
        student_tasks:        studentTasks       || undefined,
        institution_tasks:    institutionTasks   || undefined,
        followup_required:    followupDecision === "followup",
        concluded:            followupDecision === "conclude",
        status:               "completed",
      }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(typeof data.error === "string" ? data.error : "Failed to save session.");
    } else {
      setSuccess(true);
      onSuccess?.();
      if (hasMultiMode) setTimeout(() => router.push("/counsellor"), 1500);
    }
    setLoading(false);
  }

  const lbl = (text: string) => (
    <label className="mb-1 block text-[11px] font-bold uppercase tracking-[0.5px]" style={{ color: "var(--text3)" }}>{text}</label>
  );
  const sec = (title: string) => (
    <div className="mb-4 border-b pb-2" style={{ borderColor: "var(--border)" }}>
      <h3 className="text-sm font-bold" style={{ color: "var(--text)" }}>{title}</h3>
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && <div className="rounded-md p-3 text-sm" style={{ background: "var(--danger-light)", color: "var(--danger)" }}>{error}</div>}
      {success && <div className="rounded-md p-3 text-sm font-semibold" style={{ background: "var(--success-light)", color: "var(--success)" }}>✓ Session recorded successfully{hasMultiMode ? ". Redirecting…" : "."}</div>}

      {/* Session basics */}
      <div className="rounded-[10px] border p-5" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
        {sec("Session Details")}
        <div className="grid grid-cols-2 gap-4">
          {hasMultiMode ? (
            <div className="col-span-2">
              {lbl("Student *")}
              <select value={studentId} onChange={(e) => setStudentId(e.target.value)} className={inp} style={inpStyle} required>
                <option value="">— Select student —</option>
                {students.map((s) => (
                  <option key={s.id} value={s.id}>{s.full_name} · {s.akeb_id}{s.school_grade ? ` · ${s.school_grade}` : ""}</option>
                ))}
              </select>
            </div>
          ) : null}
          <div>
            {lbl("Session Date")}
            <input type="datetime-local" value={sessionDate} onChange={(e) => setSessionDate(e.target.value)} className={inp} style={inpStyle} />
          </div>
        </div>
      </div>

      {/* Career Exploration */}
      <div className="rounded-[10px] border p-5" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
        {sec("Career Exploration")}
        <div className="grid grid-cols-2 gap-4">
          <div>
            {lbl("Career Journey Stage")}
            <select value={careerJourneyStage} onChange={(e) => setCareerJourneyStage(e.target.value)} className={inp} style={inpStyle}>
              <option value="">— Select stage —</option>
              {["Exploration", "Clarification", "Decision", "Planning", "Action"].map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div>
            {lbl("Career Choice Identified")}
            <input type="text" placeholder="e.g. Software Engineering" value={careerChoice} onChange={(e) => setCareerChoice(e.target.value)} className={inp} style={inpStyle} />
          </div>
          <div>
            {lbl("Emerging Career Interest")}
            <input type="text" placeholder="e.g. Data Science, Medicine" value={emergingInterest} onChange={(e) => setEmergingInterest(e.target.value)} className={inp} style={inpStyle} />
          </div>
          <div>
            {lbl("Mindler Assessment Needed?")}
            <select value={mindlerNeeded} onChange={(e) => setMindlerNeeded(e.target.value)} className={inp} style={inpStyle}>
              <option value="no">No / Already Done</option>
              <option value="yes">Yes — Needs Assessment</option>
              <option value="na">Not Applicable</option>
            </select>
          </div>
        </div>
      </div>

      {/* Session Notes */}
      <div className="rounded-[10px] border p-5" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
        {sec("Session Notes")}
        <div className="space-y-4">
          <div>
            {lbl("Counsellor Observations")}
            <textarea value={observations} onChange={(e) => setObservations(e.target.value)} rows={3} placeholder="Key observations…" className={inp} style={inpStyle} />
          </div>
          <div>
            {lbl("Session Details")}
            <textarea value={sessionDetails} onChange={(e) => setSessionDetails(e.target.value)} rows={3} placeholder="What was discussed and explored…" className={inp} style={inpStyle} />
          </div>
        </div>
      </div>

      {/* Action Items */}
      <div className="rounded-[10px] border p-5" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
        {sec("Action Items")}
        <div className="grid grid-cols-2 gap-4">
          <div>
            {lbl("Tasks for Student")}
            <textarea value={studentTasks} onChange={(e) => setStudentTasks(e.target.value)} rows={4}
              placeholder={"• Research 3 universities\n• Complete Mindler assessment"} className={inp} style={inpStyle} />
          </div>
          <div>
            {lbl("Tasks for Institution")}
            <textarea value={institutionTasks} onChange={(e) => setInstitutionTasks(e.target.value)} rows={4}
              placeholder={"• Arrange parent meeting\n• Provide subject change form"} className={inp} style={inpStyle} />
          </div>
        </div>
      </div>

      {/* Follow-up Decision */}
      <div className="rounded-[10px] border p-5" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
        {sec("Follow-up Decision")}
        <div className="space-y-3">
          <label className="flex cursor-pointer items-center gap-3">
            <input type="radio" name="followup" checked={followupDecision === "followup"} onChange={() => setFollowupDecision("followup")} />
            <span className="text-sm font-medium" style={{ color: "var(--text)" }}>Schedule a follow-up session</span>
          </label>
          {followupDecision === "followup" && (
            <div className="ml-6">
              {lbl("Suggested Follow-up Date")}
              <input type="date" value={followupDate} onChange={(e) => setFollowupDate(e.target.value)} className={`${inp} max-w-xs`} style={inpStyle} />
            </div>
          )}
          <label className="flex cursor-pointer items-center gap-3">
            <input type="radio" name="followup" checked={followupDecision === "conclude"} onChange={() => setFollowupDecision("conclude")} />
            <span className="text-sm font-medium" style={{ color: "var(--text)" }}>Conclude this student (no further sessions needed)</span>
          </label>
          {followupDecision === "conclude" && (
            <div className="ml-6 rounded-md p-3 text-[13px]" style={{ background: "var(--warn-light)", color: "var(--warn)" }}>
              ⚠️ This will mark the student as <strong>Concluded</strong>. Their profile will be archived.
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-end gap-3">
        {hasMultiMode && (
          <button type="button" onClick={() => router.back()} className="rounded-md border px-5 py-2 text-sm font-semibold" style={{ borderColor: "var(--border2)", color: "var(--text2)" }}>
            Cancel
          </button>
        )}
        <button type="submit" disabled={loading} className="rounded-md px-5 py-2 text-sm font-semibold text-white disabled:opacity-60" style={{ background: "var(--accent)" }}>
          {loading ? "Saving…" : "Save Session"}
        </button>
      </div>
    </form>
  );
}
