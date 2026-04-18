interface Student {
  id: string;
  akeb_id: string;
  full_name: string;
  email: string | null;
  contact_number: string | null;
  school_grade: string | null;
  school_name: string | null;
  created_at: Date;
}

interface StudentCardProps {
  student: Student;
}

export default function StudentCard({ student }: StudentCardProps) {
  const initials = student.full_name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="group relative rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
      {/* Left accent bar */}
      <div className="absolute left-0 top-4 bottom-4 w-1 rounded-full bg-indigo-500 opacity-0 transition-opacity group-hover:opacity-100" />

      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-700">
          {initials}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="truncate font-semibold text-gray-900">{student.full_name}</h3>
            {student.school_grade && (
              <span className="shrink-0 rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-600">
                Gr {student.school_grade}
              </span>
            )}
          </div>

          <p className="mt-0.5 font-mono text-xs text-gray-400">{student.akeb_id}</p>

          {student.school_name && (
            <p className="mt-2 flex items-center gap-1 text-xs text-gray-500">
              <svg className="h-3 w-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21" />
              </svg>
              {student.school_name}
            </p>
          )}

          <div className="mt-2 space-y-0.5">
            {student.email && (
              <p className="flex items-center gap-1 truncate text-xs text-gray-500">
                <svg className="h-3 w-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25H4.5a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0l-9.75 7.5-9.75-7.5" />
                </svg>
                {student.email}
              </p>
            )}
            {student.contact_number && (
              <p className="flex items-center gap-1 text-xs text-gray-500">
                <svg className="h-3 w-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 6.75z" />
                </svg>
                {student.contact_number}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
