import { Navigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

export default function PrivateRoute({ children }) {
  const user = supabase.auth.user(); // get current user
  if (!user) {
    return <Navigate to="/" replace />; // redirect to login if not logged in
  }
  return children;
}