import { Navigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

export default function PrivateRoute({ children }) {
  throw new Error(
    "PrivateRoute is deprecated. Use RequireAuth/RequireSubscription in App routes instead."
  )
}