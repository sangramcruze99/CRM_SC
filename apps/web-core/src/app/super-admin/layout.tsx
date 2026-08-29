export default function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col h-full">
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
