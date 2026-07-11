import { Navigate } from "react-router-dom";
import { auth } from "../services/firebase";

function ProtectedRoute({ children }) {
  return auth.currentUser ? children : <Navigate to="/login" replace />;
}

export default ProtectedRoute;