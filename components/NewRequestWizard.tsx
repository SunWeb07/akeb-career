"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const COUNCILS = ["Karachi", "Lahore", "Islamabad", "Hyderabad", "Peshawar", "Quetta"];
const CURRICULA = ["Matric (SSC)", "O-Levels / IGCSE", "FSc", "A-Levels", "IB", "Other"];
const GRADES = ["Grade 8", "Grade 9", "Grade 10", "Grade 11", "Grade 12", "University"];
const CATEGORIES = ["Regular", "Scholarship", "Special Case"];

type Step = 1 | 2 | 3 | 4;

const STEPS = [
  { n: 1, label: "Request Type" },
  { n: 2, label: "Student Details" },
  { n: 3, label: "Assessment Check" },
  { n: 4, label: "Confirm Booking" },
];

interface SearchStudent {
  id: string;
  akeb_id: string;
  full_name: string;
  school_name: string | null;
  school_grade: string | null;
}

export default function NewRequestWizard({ fmpId }: { fmpId: string }) {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [reqType, setReqType] = useState<"new" | "followup">("new");
  const [assessment, setAssessment] = useState<"done" | "notdone" | "">("");
  const [mindlerId, setMindlerId] = useState("");
  const [mindlerResult, setMindlerResult] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchStudent[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<SearchStudent | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    full_name: "", akeb_id: "", contact_number: "", email: "",
    gender: "", school_grade: "", school_name: "", curriculum: "",
    category: "", council: "", centre: "", background: "",
  });

  function field(k: keyof typeof form) {
    return { value: form[k], onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setForm((f) => ({ ...f, [k]: e.target.value })) };
  }

  async function handleSearch(q: string) {
    setSearchQuery(q);
    if (q.length < 2) { setSearchResults([]); return; }
    const res = await fetch(`/api/students?q=${encodeURIComponent(q)}`);
    if (res.ok) {
      const data = await res.json();
      setSearchResults(data.slice(0, 5));
    }
  }

  async function handleSubmit() {
    setSubmitting(true);
    setError(null);
    try {
      let studentId = selectedStudent?.id;

      if (reqType === "new") {
        const res = await fetch("/api/students", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...form, fmp_swb_id: fmpId }),
        });
        if (!res.ok) {
          const d = await res.json();
          setError(typeof d.error === "string" ? d.error : "Failed to create student");
          setSubmitting(false);
          return;
        }
        const d = await res.json();
        studentId = d.id;
      }

      if (!studentId) { setError("No student selected."); setSubmitting(false); return; }

      const reqRes = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          student_id: studentId,
          type: reqType,
          fmp_swb_id: fmpId,
          assessment_status: assessment === "done" ? "done" : assessment === "notdone" ? "pending" : "pending",
          mindler_id: assessment === "done" ? mindlerId : undefined,
          mindler_result: assessment === "done" ? mindlerResult : undefined,
        }),
      });

      if (!reqRes.ok) { setError("Failed to submit request."); setSubmitting(false); return; }
      router.push("/institution/requests?submitted=1");
    } catch {
      setError("Unexpected error. Please try again.");
      setSubmitting(false);
    }
  }

  const inputCls = "w-full rounded-md border px-3 py-2 text-sm focus:outline-none transition-colors";
  const inputStyle = { borderColor: "var(--border2)", background: "var(--surface)", color: "var(--text)" };
  const labelCls = "block text-xs font-semibold mb-1.5";
  const labelStyle = { color: "var(--text2)" };

  return (
    <div className="mx-auto max-w-2xl">
      {/* Stepper */}
      <div className="mb-6 flex">
        {STEPS.map(({ n, label }) => (
          <div key={n} className="flex flex-1 items-center gap-2 border-b-2 pb-2 text-xs font-semibold transition-colors"
            style={{
              borderColor: n < step ? "var(--success)" : n === step ? "var(--accent)" : "var(--border)",
              color: n < step ? "var(--success)" : n === step ? "var(--accent)" : "var(--text3)",
            }}
          >
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold"
              style={{
                background: n < step ? "var(--success)" : n === step ? "var(--accent)" : "var(--border)",
                color: n <= step ? "white" : "var(--text3)",
              }}
            >{n < step ? "✓" : n}</span>
            {label}
          </div>
        ))}
      </div>

      {/* Step 1: Request Type */}
      {step === 1 && (
        <div className="rounded-[10px] border p-6" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
          <h2 className="mb-4 text-sm font-bold" style={{ color: "var(--text)" }}>What type of request are you raising?</h2>
          <div className="grid grid-cols-2 gap-3">
            {(["new", "followup"] as const).map((t) => (
              <button key={t} type="button" onClick={() => setReqType(t)}
                className="rounded-[10px] border-2 p-4 text-left transition-colors"
                style={{ borderColor: reqType === t ? "var(--accent)" : "var(--border2)", background: reqType === t ? "var(--accent-light)" : "var(--surface)" }}
              >
                <div className="text-sm font-bold" style={{ color: reqType === t ? "var(--accent)" : "var(--text)" }}>
                  {t === "new" ? "New Student Request" : "Follow-up Request"}
                </div>
                <div className="mt-1 text-xs" style={{ color: "var(--text3)" }}>
                  {t === "new" ? "Student has never had a career counselling session" : "Student had a previous session and needs follow-up"}
                </div>
              </button>
            ))}
          </div>
          <div className="mt-5 flex justify-end">
            <button onClick={() => setStep(2)} className="rounded-md px-5 py-2 text-sm font-semibold text-white" style={{ background: "var(--accent)" }}>
              Continue →
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Student Details */}
      {step === 2 && (
        <div className="rounded-[10px] border p-6" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
          <h2 className="mb-4 text-sm font-bold" style={{ color: "var(--text)" }}>Student Details</h2>

          {reqType === "followup" ? (
            <div className="mb-5">
              <div className="mb-3 rounded-md p-3 text-sm" style={{ background: "var(--accent-light)", color: "var(--accent)" }}>
                ℹ️ Search for the existing student below.
              </div>
              <label className={labelCls} style={labelStyle}>Search by Name or AKEB ID</label>
              <input className={inputCls} style={inputStyle} placeholder="e.g. Ayesha Noor or AKEB-2025-0412"
                value={searchQuery} onChange={(e) => handleSearch(e.target.value)} />
              {searchResults.length > 0 && (
                <div className="mt-2 rounded-md border" style={{ borderColor: "var(--border2)" }}>
                  {searchResults.map((s) => (
                    <button key={s.id} type="button" onClick={() => { setSelectedStudent(s); setSearchResults([]); setSearchQuery(s.full_name); }}
                      className="flex w-full items-center gap-3 border-b px-3 py-2.5 text-left last:border-b-0 hover:opacity-80"
                      style={{ borderColor: "var(--border)" }}
                    >
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11px] font-bold"
                        style={{ background: "var(--accent-light)", color: "var(--accent)" }}
                      >
                        {s.full_name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="text-sm font-semibold" style={{ color: "var(--text)" }}>{s.full_name}</div>
                        <div className="text-xs" style={{ color: "var(--text3)" }}>{s.akeb_id} · {s.school_grade} · {s.school_name}</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
              {selectedStudent && (
                <div className="mt-3 rounded-md p-3 text-sm" style={{ background: "var(--success-light)", color: "var(--success)" }}>
                  ✅ {selectedStudent.full_name} selected ({selectedStudent.akeb_id})
                </div>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3.5">
              {[
                { k: "full_name", label: "Student Name", req: true },
                { k: "akeb_id", label: "AKEB ID", req: true },
                { k: "contact_number", label: "Contact Number", req: true },
                { k: "email", label: "Email ID" },
              ].map(({ k, label, req }) => (
                <div key={k}>
                  <label className={labelCls} style={labelStyle}>{label}{req && <span style={{ color: "var(--danger)" }}> *</span>}</label>
                  <input className={inputCls} style={inputStyle} placeholder={label} {...field(k as keyof typeof form)} />
                </div>
              ))}

              <div>
                <label className={labelCls} style={labelStyle}>Gender <span style={{ color: "var(--danger)" }}>*</span></label>
                <select className={inputCls} style={inputStyle} {...field("gender")}>
                  <option value="">Select gender</option>
                  {["Male", "Female", "Other"].map((g) => <option key={g}>{g}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls} style={labelStyle}>School Grade <span style={{ color: "var(--danger)" }}>*</span></label>
                <select className={inputCls} style={inputStyle} {...field("school_grade")}>
                  <option value="">Select grade</option>
                  {GRADES.map((g) => <option key={g}>{g}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls} style={labelStyle}>School Name <span style={{ color: "var(--danger)" }}>*</span></label>
                <input className={inputCls} style={inputStyle} placeholder="School name" {...field("school_name")} />
              </div>
              <div>
                <label className={labelCls} style={labelStyle}>Curriculum</label>
                <select className={inputCls} style={inputStyle} {...field("curriculum")}>
                  <option value="">Select curriculum</option>
                  {CURRICULA.map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls} style={labelStyle}>Student Category</label>
                <select className={inputCls} style={inputStyle} {...field("category")}>
                  <option value="">Select category</option>
                  {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls} style={labelStyle}>Council</label>
                <select className={inputCls} style={inputStyle} {...field("council")}>
                  <option value="">Select council</option>
                  {COUNCILS.map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="col-span-2">
                <label className={labelCls} style={labelStyle}>Centre</label>
                <input className={inputCls} style={inputStyle} placeholder="Centre name" {...field("centre")} />
              </div>
              <div className="col-span-2">
                <label className={labelCls} style={labelStyle}>Brief Background of Student &amp; Family</label>
                <textarea className={inputCls} style={{ ...inputStyle, minHeight: "80px", resize: "vertical" }}
                  placeholder="Briefly describe the student's background, family situation, and any relevant context…"
                  {...field("background")} />
              </div>
            </div>
          )}

          {error && <p className="mt-3 rounded-md p-2.5 text-sm" style={{ background: "var(--danger-light)", color: "var(--danger)" }}>{error}</p>}
          <div className="mt-5 flex justify-between">
            <button onClick={() => setStep(1)} className="rounded-md border px-4 py-2 text-sm font-semibold" style={{ borderColor: "var(--border2)", color: "var(--text2)" }}>← Back</button>
            <button onClick={() => setStep(3)} className="rounded-md px-5 py-2 text-sm font-semibold text-white" style={{ background: "var(--accent)" }}>Continue →</button>
          </div>
        </div>
      )}

      {/* Step 3: Assessment Check */}
      {step === 3 && (
        <div className="rounded-[10px] border p-6" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
          <h2 className="mb-1 text-sm font-bold" style={{ color: "var(--text)" }}>🧠 Mindler Career Assessment</h2>
          <p className="mb-4 text-sm" style={{ color: "var(--text2)" }}>Has this student completed the Mindler Career Assessment?</p>
          <div className="grid grid-cols-2 gap-3">
            {[
              { v: "done", label: "✅ Yes — Assessment Done", sub: "Student has completed Mindler and results are available" },
              { v: "notdone", label: "❌ No — Assessment Needed", sub: "AKEB team will be notified to conduct the assessment first" },
            ].map(({ v, label, sub }) => (
              <button key={v} type="button" onClick={() => setAssessment(v as "done" | "notdone")}
                className="rounded-[10px] border-2 p-4 text-left transition-colors"
                style={{ borderColor: assessment === v ? "var(--accent)" : "var(--border2)", background: assessment === v ? "var(--accent-light)" : "var(--surface)" }}
              >
                <div className="text-sm font-bold" style={{ color: assessment === v ? "var(--accent)" : "var(--text)" }}>{label}</div>
                <div className="mt-1 text-xs" style={{ color: "var(--text3)" }}>{sub}</div>
              </button>
            ))}
          </div>

          {assessment === "notdone" && (
            <div className="mt-4 rounded-md p-3 text-sm" style={{ background: "var(--warn-light)", color: "var(--warn)" }}>
              ⚠️ <strong>Assessment Required</strong> — The AKEB team will be notified. Once assessment is done, the session will be booked automatically.
            </div>
          )}
          {assessment === "done" && (
            <div className="mt-4 grid grid-cols-2 gap-3.5">
              <div>
                <label className={labelCls} style={labelStyle}>Mindler ID</label>
                <input className={inputCls} style={inputStyle} placeholder="Mindler student ID" value={mindlerId} onChange={(e) => setMindlerId(e.target.value)} />
              </div>
              <div>
                <label className={labelCls} style={labelStyle}>Assessment Result Summary</label>
                <input className={inputCls} style={inputStyle} placeholder="e.g. Science cluster, strong analytical" value={mindlerResult} onChange={(e) => setMindlerResult(e.target.value)} />
              </div>
            </div>
          )}

          <div className="mt-5 flex justify-between">
            <button onClick={() => setStep(2)} className="rounded-md border px-4 py-2 text-sm font-semibold" style={{ borderColor: "var(--border2)", color: "var(--text2)" }}>← Back</button>
            <button onClick={() => setStep(4)} disabled={!assessment} className="rounded-md px-5 py-2 text-sm font-semibold text-white disabled:opacity-50" style={{ background: "var(--accent)" }}>Continue →</button>
          </div>
        </div>
      )}

      {/* Step 4: Confirm */}
      {step === 4 && (
        <div className="rounded-[10px] border p-6" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
          <h2 className="mb-3 text-sm font-bold" style={{ color: "var(--text)" }}>✅ Confirm Booking</h2>
          <div className="mb-4 rounded-md p-3 text-sm" style={{ background: "var(--success-light)", color: "var(--success)" }}>
            🎉 Your request is ready. A career counselling session will be booked and the student will be assigned to an available counsellor.
          </div>
          <div className="grid grid-cols-2 gap-3 rounded-md p-4 text-sm" style={{ background: "var(--surface2)" }}>
            <div><span style={{ color: "var(--text3)" }}>Student: </span><strong>{reqType === "followup" ? selectedStudent?.full_name : form.full_name || "—"}</strong></div>
            <div><span style={{ color: "var(--text3)" }}>AKEB ID: </span><strong>{reqType === "followup" ? selectedStudent?.akeb_id : form.akeb_id || "—"}</strong></div>
            <div><span style={{ color: "var(--text3)" }}>Request Type: </span><strong className="capitalize">{reqType}</strong></div>
            <div><span style={{ color: "var(--text3)" }}>Assessment: </span><strong>{assessment === "done" ? "Done ✓" : "Pending"}</strong></div>
          </div>
          {error && <p className="mt-3 rounded-md p-2.5 text-sm" style={{ background: "var(--danger-light)", color: "var(--danger)" }}>{error}</p>}
          <div className="mt-5 flex justify-between">
            <button onClick={() => setStep(3)} className="rounded-md border px-4 py-2 text-sm font-semibold" style={{ borderColor: "var(--border2)", color: "var(--text2)" }}>← Back</button>
            <button onClick={handleSubmit} disabled={submitting} className="rounded-md px-5 py-2 text-sm font-semibold text-white disabled:opacity-50" style={{ background: "var(--success)" }}>
              {submitting ? "Submitting…" : "Submit Request ✓"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
