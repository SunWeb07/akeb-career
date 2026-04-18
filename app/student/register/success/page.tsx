import Link from "next/link";

export default function RegistrationSuccessPage() {
  return (
    <main className="min-h-screen bg-slate-900">
      {/* Header */}
      <div className="border-b border-slate-700 bg-slate-800 px-6 py-4">
        <div className="mx-auto max-w-4xl">
          <div className="flex items-center gap-3">
            <span className="inline-block rounded-lg bg-blue-600 px-3 py-1.5 text-lg font-black tracking-widest text-white">
              AKEB
            </span>
            <div>
              <div className="text-sm font-bold text-white">Career Counselling</div>
              <div className="text-xs text-slate-400">Registration Complete</div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex min-h-[calc(100vh-80px)] items-center justify-center px-6 py-10">
        <div className="w-full max-w-2xl">
          {/* Success Card */}
          <div className="rounded-2xl bg-white p-8 shadow-xl text-center">
            {/* Success Icon */}
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
              <svg className="h-10 w-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>

            {/* Success Message */}
            <h1 className="mb-3 text-3xl font-bold text-gray-900">
              🎉 Registration Successful!
            </h1>
            <p className="mb-6 text-base text-gray-600">
              Welcome to AKEB Career Counselling! Your account has been created and your first session request has been submitted.
            </p>

            {/* What Happens Next */}
            <div className="mb-8 rounded-xl border border-gray-200 bg-gray-50 p-6 text-left">
              <h2 className="mb-4 text-lg font-bold text-gray-900">What happens next?</h2>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-600">1</div>
                  <div>
                    <div className="text-sm font-semibold text-gray-900">Email Verification</div>
                    <div className="text-xs text-gray-600">Check your inbox for a verification link</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-600">2</div>
                  <div>
                    <div className="text-sm font-semibold text-gray-900">Session Review</div>
                    <div className="text-xs text-gray-600">Our team will review your session request</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-600">3</div>
                  <div>
                    <div className="text-sm font-semibold text-gray-900">Counsellor Assignment</div>
                    <div className="text-xs text-gray-600">A counsellor will be assigned based on your needs</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-600">4</div>
                  <div>
                    <div className="text-sm font-semibold text-gray-900">Session Confirmation</div>
                    <div className="text-xs text-gray-600">You'll receive session details via email</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <Link
                href="/login"
                className="block w-full rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
              >
                Sign In to Your Account
              </Link>
              <Link
                href="/"
                className="block w-full rounded-lg border border-gray-300 px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Return to Home
              </Link>
            </div>

            {/* Help Text */}
            <div className="mt-8 rounded-lg bg-blue-50 border border-blue-200 p-4">
              <div className="flex items-start gap-3">
                <span className="text-2xl">💡</span>
                <div className="text-left">
                  <p className="text-sm font-semibold text-blue-900">Need Help?</p>
                  <p className="mt-1 text-xs text-blue-700">
                    If you don't receive a verification email within 5 minutes, check your spam folder or contact support at{" "}
                    <a href="mailto:support@akeb.co.za" className="font-semibold underline">support@akeb.co.za</a>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
