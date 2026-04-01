import { Navigate } from "react-router-dom";
import { supabase } from "../supabase";

export default function PrivateRoute({ children }) {
  const user = supabase.auth.user(); // get current user
  if (!user) {
    return <Navigate to="/" replace />; // redirect to login if not logged in
  }
  return children;
}