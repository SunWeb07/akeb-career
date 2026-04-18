"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function StudentRegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<1 | 2>(1);
  
  // Student Information
  const [formData, setFormData] = useState({
    // Personal Info
    full_name: "",
    email: "",
    password: "",
    confirm_password: "",
    contact_number: "",
    date_of_birth: "",
    
    // Academic Info
    school_name: "",
    school_grade: "",
    
    // Session Request Info
    reason: "",
    topics: [] as string[],
    preferred_time: "",
    urgency: "soon",
    additional_notes: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCheckboxChange = (topic: string, checked: boolean) => {
    if (checked) {
      setFormData({ ...formData, topics: [...formData.topics, topic] });
    } else {
      setFormData({ ...formData, topics: formData.topics.filter(t => t !== topic) });
    }
  };

  const validateStep1 = () => {
    if (!formData.full_name || !formData.email || !formData.password || !formData.contact_number) {
      setError("Please fill in all required fields");
      return false;
    }
    if (formData.password !== formData.confirm_password) {
      setError("Passwords do not match");
      return false;
    }
    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters");
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("Please enter a valid email address");
      return false;
    }
    const phoneRegex = /^[\d\s\-\+\(\)]+$/;
    if (!phoneRegex.test(formData.contact_number)) {
      setError("Please enter a valid phone number");
      return false;
    }
    setError(null);
    return true;
  };

  const handleNextStep = () => {
    if (validateStep1()) {
      setStep(2);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.school_name || !formData.school_grade || !formData.reason) {
      setError("Please fill in all required fields");
      return;
    }

    setLoading(true);
    setError(null);

    console.log("📝 Submitting registration...", { email: formData.email, name: formData.full_name });

    try {
      const response = await fetch("/api/student-register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      console.log("📡 Response status:", response.status);

      const result = await response.json();
      console.log("📦 Response data:", result);

      if (!response.ok) {
        const errorMsg = result.error || "Registration failed";
        const details = result.details ? `\n\nDetails: ${result.details}` : "";
        throw new Error(errorMsg + details);
      }

      console.log("✅ Registration successful!");
      // Redirect to success page or login
      router.push("/student/register/success");
    } catch (err: any) {
      console.error("❌ Registration error:", err);
      setError(err.message || "Something went wrong. Please try again.");
      // Scroll to top to show error
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-900">
      {/* Header */}
      <div className="border-b border-slate-700 bg-slate-800 px-6 py-4">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="inline-block rounded-lg bg-blue-600 px-3 py-1.5 text-lg font-black tracking-widest text-white">
              AKEB
            </span>
            <div>
              <div className="text-sm font-bold text-white">Career Counselling</div>
              <div className="text-xs text-slate-400">Student Registration</div>
            </div>
          </div>
          <Link href="/login" className="text-sm text-slate-400 hover:text-white transition-colors">
            Already have an account? <span className="font-semibold text-blue-400">Sign in</span>
          </Link>
        </div>
      </div>

      <div className="px-6 py-10">
        <div className="mx-auto max-w-4xl">
          {/* Progress Steps */}
          <div className="mb-8 flex items-center justify-center gap-4">
            <div className="flex items-center gap-2">
              <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${
                step === 1 ? "bg-blue-600 text-white" : "bg-green-600 text-white"
              }`}>
                {step === 1 ? "1" : "✓"}
              </div>
              <span className={`text-sm font-medium ${step === 1 ? "text-white" : "text-green-400"}`}>
                Personal Details
              </span>
            </div>
            <div className={`h-0.5 w-20 ${step === 2 ? "bg-blue-600" : "bg-slate-700"}`} />
            <div className="flex items-center gap-2">
              <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${
                step === 2 ? "bg-blue-600 text-white" : "bg-slate-700 text-slate-400"
              }`}>
                2
              </div>
              <span className={`text-sm font-medium ${step === 2 ? "text-white" : "text-slate-400"}`}>
                Academic & Session Info
              </span>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 rounded-lg bg-red-900/50 border border-red-500 px-4 py-3">
              <div className="flex items-start gap-2">
                <svg className="mt-0.5 h-5 w-5 shrink-0 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
                </svg>
                <p className="text-sm text-red-200">{error}</p>
              </div>
            </div>
          )}

          {/* Form */}
          <div className="rounded-2xl bg-white p-8 shadow-xl">
            <form onSubmit={handleSubmit}>
              {step === 1 && (
                <div className="space-y-5">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Create Your Account</h2>
                    <p className="mt-1 text-sm text-gray-500">Start your career counselling journey with AKEB</p>
                  </div>

                  {/* Full Name */}
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="full_name"
                      value={formData.full_name}
                      onChange={handleInputChange}
                      required
                      placeholder="Enter your full name"
                      className="w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      placeholder="you@example.com"
                      className="w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>

                  {/* Password */}
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-gray-700">
                        Password <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        required
                        placeholder="Min. 8 characters"
                        className="w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-gray-700">
                        Confirm Password <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="password"
                        name="confirm_password"
                        value={formData.confirm_password}
                        onChange={handleInputChange}
                        required
                        placeholder="Re-enter password"
                        className="w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      />
                    </div>
                  </div>

                  {/* Contact Number */}
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                      Contact Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      name="contact_number"
                      value={formData.contact_number}
                      onChange={handleInputChange}
                      required
                      placeholder="071 234 5678"
                      className="w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>

                  {/* Date of Birth */}
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                      Date of Birth
                    </label>
                    <input
                      type="date"
                      name="date_of_birth"
                      value={formData.date_of_birth}
                      onChange={handleInputChange}
                      className="w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2.5 text-sm text-gray-900 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleNextStep}
                    className="w-full rounded-lg bg-blue-600 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                  >
                    Continue to Step 2 →
                  </button>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-5">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Academic & Session Details</h2>
                    <p className="mt-1 text-sm text-gray-500">Tell us about your school and request your first session</p>
                  </div>

                  {/* School Name */}
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                      School Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="school_name"
                      value={formData.school_name}
                      onChange={handleInputChange}
                      required
                      placeholder="Enter your school name"
                      className="w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>

                  {/* Grade */}
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                      Current Grade/Year <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="school_grade"
                      value={formData.school_grade}
                      onChange={handleInputChange}
                      required
                      className="w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2.5 text-sm text-gray-900 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    >
                      <option value="">Select grade</option>
                      <option value="8">Grade 8</option>
                      <option value="9">Grade 9</option>
                      <option value="10">Grade 10</option>
                      <option value="11">Grade 11</option>
                      <option value="12">Grade 12</option>
                      <option value="tertiary">Tertiary/University</option>
                    </select>
                  </div>

                  {/* Reason for Counselling */}
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                      What brings you here? <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      name="reason"
                      value={formData.reason}
                      onChange={handleInputChange}
                      required
                      rows={4}
                      placeholder="Tell us about your interests, goals, or what you'd like help with..."
                      className="w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>

                  {/* Topics of Interest */}
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-700">
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
                        <label key={topic} className="flex items-center gap-2 rounded-lg border border-gray-300 p-3 cursor-pointer hover:bg-gray-50 transition-colors">
                          <input 
                            type="checkbox" 
                            checked={formData.topics.includes(topic)}
                            onChange={(e) => handleCheckboxChange(topic, e.target.checked)}
                            className="rounded text-blue-600" 
                          />
                          <span className="text-sm text-gray-700">{topic}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Preferred Time */}
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                      Preferred Session Time
                    </label>
                    <select
                      name="preferred_time"
                      value={formData.preferred_time}
                      onChange={handleInputChange}
                      className="w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2.5 text-sm text-gray-900 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    >
                      <option value="">Select preferred time</option>
                      <option value="morning">Morning (9:00 AM - 12:00 PM)</option>
                      <option value="afternoon">Afternoon (12:00 PM - 3:00 PM)</option>
                      <option value="evening">Evening (3:00 PM - 6:00 PM)</option>
                    </select>
                  </div>

                  {/* Urgency */}
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                      How soon do you need this session?
                    </label>
                    <div className="space-y-2">
                      {[
                        { value: "urgent", label: "Urgent (Within 1 week)", icon: "🔴" },
                        { value: "soon", label: "Soon (1-2 weeks)", icon: "🟡" },
                        { value: "flexible", label: "Flexible (2-4 weeks)", icon: "🟢" },
                      ].map((option) => (
                        <label key={option.value} className="flex items-center gap-3 rounded-lg border border-gray-300 p-3 cursor-pointer hover:bg-gray-50 transition-colors">
                          <input 
                            type="radio" 
                            name="urgency" 
                            value={option.value} 
                            checked={formData.urgency === option.value}
                            onChange={handleInputChange}
                            className="text-blue-600" 
                          />
                          <span className="text-lg">{option.icon}</span>
                          <span className="text-sm font-medium text-gray-700">{option.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Additional Notes */}
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                      Additional Notes (Optional)
                    </label>
                    <textarea
                      name="additional_notes"
                      value={formData.additional_notes}
                      onChange={handleInputChange}
                      rows={3}
                      placeholder="Any specific questions or concerns..."
                      className="w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="rounded-lg border border-gray-300 px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      ← Back
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 rounded-lg bg-blue-600 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {loading ? (
                        <span className="flex items-center justify-center gap-2">
                          <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                          </svg>
                          Creating Account...
                        </span>
                      ) : (
                        "🎉 Complete Registration"
                      )}
                    </button>
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}
