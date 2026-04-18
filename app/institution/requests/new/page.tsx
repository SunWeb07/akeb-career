import { requireRole } from "@/lib/auth";
import AppLayout from "@/components/AppLayout";
import NewRequestWizard from "@/components/NewRequestWizard";

export default async function NewRequestPage() {
  const profile = await requireRole(["institution", "admin"]);

  return (
    <AppLayout userName={profile.full_name} role={profile.role}>
      <div className="border-b px-8 py-6" style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
        <h1 className="text-xl font-bold" style={{ color: "var(--text)" }}>New Counselling Request</h1>
        <p className="mt-0.5 text-sm" style={{ color: "var(--text3)" }}>Raise a request for a student's career counselling session</p>
      </div>
      <div className="p-8">
        <NewRequestWizard fmpId={profile.id} />
      </div>
    </AppLayout>
  );
}
