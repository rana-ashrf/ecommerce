import { Navigate } from "react-router-dom";
import { useAdminAuth } from "../../Context/AdminAuthContext";

function AdminProtectedRoute({ children }) {
  const { admin } = useAdminAuth();

  return admin && admin.is_staff === true ? (
    children
  ) : (
    <Navigate to="/admin/login" replace />
  );
}

export default AdminProtectedRoute;