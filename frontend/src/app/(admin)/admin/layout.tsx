import AdminLayout from '@/components/layout/AdminLayout';

export default function AdminPagesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminLayout>{children}</AdminLayout>;
}
