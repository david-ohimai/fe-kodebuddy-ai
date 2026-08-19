import AppSidebar from './components/AppSidebar';
import AppTopbar from './components/AppTopbar';

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = {
    name: 'Ayomide Ben',
    email: 'learner1@example.com',
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <AppSidebar user={user} />

      {/* Main section */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Topbar */}
        <AppTopbar
          userName={user.name}
          userEmail={user.email}
        />

        {/* Page content */}
        <main className="flex-1 p-6 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
