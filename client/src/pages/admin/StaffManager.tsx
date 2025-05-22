import { AdminLayout } from "@/components/admin/AdminLayout";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import StaffPage from "./StaffPage";

export default function StaffManager() {
  return (
    <ProtectedRoute>
      <AdminLayout title="Staff Management">
        <StaffPage />
      </AdminLayout>
    </ProtectedRoute>
  );
}