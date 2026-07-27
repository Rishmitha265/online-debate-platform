import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import {
  applyActionCode,
  checkActionCode,
  verifyPasswordResetCode,
  confirmPasswordReset,
} from "firebase/auth";
import { auth } from "../services/firebase";

function AuthAction() {
  const [searchParams] = useSearchParams();
  const mode = searchParams.get("mode");
  const oobCode = searchParams.get("oobCode");

  const [status, setStatus] = useState("processing"); // processing | success | error
  const [message, setMessage] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [resetReady, setResetReady] = useState(false);

  useEffect(() => {
    if (!mode || !oobCode) {
      setStatus("error");
      setMessage("This link is invalid or has expired.");
      return;
    }

    if (mode === "verifyEmail") {
      applyActionCode(auth, oobCode)
        .then(() => {
          setStatus("success");
          setMessage("Your email has been verified! You can now sign in.");
        })
        .catch(() => {
          setStatus("error");
          setMessage("This verification link is invalid or has expired.");
        });
    } else if (mode === "resetPassword") {
      verifyPasswordResetCode(auth, oobCode)
        .then(() => {
          setStatus("ready");
          setResetReady(true);
        })
        .catch(() => {
          setStatus("error");
          setMessage("This password reset link is invalid or has expired.");
        });
    } else {
      setStatus("error");
      setMessage("Unsupported action.");
    }
  }, [mode, oobCode]);

  const handlePasswordReset = async () => {
    if (!newPassword || newPassword.length < 6) {
      alert("Password must be at least 6 characters.");
      return;
    }

    try {
      await confirmPasswordReset(auth, oobCode, newPassword);
      setStatus("success");
      setMessage("Your password has been reset! You can now sign in with your new password.");
    } catch (error) {
      setStatus("error");
      setMessage(error.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-bg px-4">
      <div className="bg-brand-bg border border-brand-border rounded-3xl shadow-2xl w-full max-w-md p-8 text-center">

        <h1 className="text-3xl font-bold text-brand-navy mb-6">
          🔥 DebateHub
        </h1>

        {status === "processing" && (
          <p className="text-brand-text">Verifying...</p>
        )}

        {status === "success" && (
          <>
            <div className="text-5xl mb-4">✅</div>
            <p className="text-brand-navy font-semibold mb-6">{message}</p>
            <Link
              to="/login"
              className="inline-block bg-brand-purple hover:bg-brand-purple-dark text-white px-6 py-3 rounded-xl font-semibold transition"
            >
              Go to Login
            </Link>
          </>
        )}

        {status === "error" && (
          <>
            <div className="text-5xl mb-4">⚠️</div>
            <p className="text-brand-text mb-6">{message}</p>
            <Link
              to="/"
              className="inline-block bg-brand-secondary hover:bg-brand-secondary-hover text-white px-6 py-3 rounded-xl font-semibold transition"
            >
              Back to Home
            </Link>
          </>
        )}

        {status === "ready" && resetReady && (
          <>
            <p className="text-brand-navy font-semibold mb-4">
              Enter your new password
            </p>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="New password"
              className="w-full p-3 mb-4 bg-brand-bg border border-brand-input-border rounded-xl text-brand-navy focus:outline-none focus:ring-2 focus:ring-brand-purple"
            />
            <button
              onClick={handlePasswordReset}
              className="w-full bg-brand-purple hover:bg-brand-purple-dark text-white py-3 rounded-xl font-semibold transition"
            >
              Reset Password
            </button>
          </>
        )}

      </div>
    </div>
  );
}

export default AuthAction;