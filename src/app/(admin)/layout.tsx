import AdminSidebar from '@/app/(protected)/components/AdminSidebar';
import AppTopbar from '@/app/(protected)/components/AppTopbar';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = {
    name: 'Ayomide Ben',
    email: 'learner1@example.com',
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-gray-50">
      <AdminSidebar user={user} />
      
      <div className="flex min-w-0 flex-1 flex-col overflow-y-auto">
        <AppTopbar
          userName={user.name}
          userEmail={user.email}
        />

        <main className="flex-1 p-6 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}