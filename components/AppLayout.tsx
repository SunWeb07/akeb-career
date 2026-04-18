import Sidebar from "./Sidebar";

interface AppLayoutProps {
  children: React.ReactNode;
  userName: string;
  role: string;
}

export default function AppLayout({ children, userName, role }: AppLayoutProps) {
  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "var(--bg)" }}>
      <Sidebar userName={userName} role={role} />
      <div className="flex-1 overflow-y-auto">
        {children}
      </div>
    </div>
  );
}
