import { Navigate, useLocation } from "react-router-dom";
import { getCurrentUser } from "@/lib/auth";

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const location = useLocation();

  if (!getCurrentUser()) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return children;
}

