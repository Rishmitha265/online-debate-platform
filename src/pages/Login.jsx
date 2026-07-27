import { useState } from "react";
import {
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  signInWithPopup,
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, googleprovider, db } from "../services/firebase";
import { FcGoogle } from "react-icons/fc";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      if (!user.emailVerified) {
        await signOut(auth);
        alert("Please verify your email before logging in.");
        return;
      }

      alert("Logged in Successfully");
      navigate("/");
    } catch (error) {
      alert(error.message);
    }
  };

  const ForgetPassword = async () => {
    if (!email) {
      alert("Please enter your email.");
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      alert("Password reset email has been sent.");
    } catch (error) {
      alert(error.message);
    }
  };

  // const handleLogout = async () => {
  //   try {
  //     await signOut(auth);
  //     setEmail("");
  //     setPassword("");
  //     alert("Logged out Successfully");
  //   } catch (error) {
  //     alert(error.message);
  //   }
  // };

  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, googleprovider);
      const userDoc = await getDoc(doc(db, "users", auth.currentUser.uid));

      if (userDoc.exists() && userDoc.data().banned) {
        await signOut(auth);
        alert("You have been banned by Admin.");
        return;
      }

      alert("Google Login Successful");
      navigate("/");
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden grid lg:grid-cols-2">
      {/* Ambient orbs */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="animate-float-orb absolute -left-40 top-10 h-[28rem] w-[28rem] rounded-full bg-brand-purple opacity-30 blur-3xl" />
        <div
          className="animate-float-orb absolute -right-20 bottom-0 h-[28rem] w-[28rem] rounded-full bg-brand-blue opacity-25 blur-3xl"
          style={{ animationDelay: "3s" }}
        />
      </div>

      {/* Left: branding panel */}
      <div className="hidden lg:flex flex-col justify-center px-16 xl:px-20">
        <h1 className="text-6xl font-bold mb-8 leading-tight">
          <span>🔥</span>
          <span className="text-gradient"> DebateHub</span>
        </h1>
        <p className="text-lg text-brand-text leading-8 max-w-md">
          DebateHub is an online platform where people discuss, argue, vote,
          and improve their communication skills through structured debates.
        </p>

        <ul className="mt-10 space-y-4 text-brand-text">
          {[
            "Create Public & Private Debates",
            "Join Live Debate Rooms",
            "Vote for Best Arguments",
            "Earn Badges & Achievements",
            "View Global Leaderboard",
            "Improve Critical Thinking",
          ].map((f) => (
            <li key={f} className="flex items-center gap-3">
              <span className="grid h-6 w-6 place-items-center rounded-full bg-brand-purple/20 text-xs text-brand-purple">
                ✓
              </span>
              {f}
            </li>
          ))}
        </ul>
      </div>

      {/* Right: form panel */}
      <div className="flex justify-center items-center px-4 py-10 lg:py-0">
        <div className="glass-panel w-full max-w-md p-8">
          <div className="flex justify-between items-center mb-8">
            <button
              onClick={() => window.history.back()}
              className="btn-ghost-glow grid h-10 w-10 place-items-center rounded-xl text-lg"
            >
              ←
            </button>

            <h2 className="text-xl font-bold text-gradient">🔥 DebateHub</h2>

            <button
              onClick={() => {
                if (auth.currentUser) navigate("/profile");
                else alert("Please login to access your profile.");
              }}
              className="btn-ghost-glow grid h-10 w-10 place-items-center rounded-xl text-lg"
            >
              🏠
            </button>
          </div>

          <button
            onClick={handleGoogleLogin}
            className="btn-ghost-glow w-full flex items-center justify-center gap-3 py-3.5 rounded-xl"
          >
            <FcGoogle size={24} />
            <span className="font-semibold text-brand-navy">Sign in with Google</span>
          </button>

          <div className="flex items-center my-6">
            <hr className="flex-1 border-brand-border" />
            <p className="mx-4 text-xs text-brand-text">or sign in with email</p>
            <hr className="flex-1 border-brand-border" />
          </div>

          <h1 className="text-4xl font-bold text-center text-brand-navy">Sign In</h1>
          <p className="text-center text-brand-text mt-2 mb-6">Welcome Back!</p>

          <label className="block text-brand-navy font-semibold mb-2 text-sm">Email</label>
          <input
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input-disco w-full p-4 mb-5"
          />

          <label className="block text-brand-navy font-semibold mb-2 text-sm">Password</label>
          <div className="relative mb-6">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Enter your Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-disco w-full p-4 pr-12"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-brand-text hover:text-brand-navy"
            >
              {showPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
            </button>
          </div>

          <button
            onClick={handleLogin}
            className="btn-gradient w-full py-4 rounded-xl text-lg font-bold"
          >
            Login
          </button>

          <button
            onClick={ForgetPassword}
            className="w-full mt-4 text-sm text-brand-text hover:text-brand-navy transition-colors"
          >
            Forgot Password?
          </button>

          <p className="text-center text-brand-text mt-6 text-sm">
            Don't have an account?
            <Link
              to="/register"
              className="text-brand-purple hover:text-brand-pink font-semibold ml-2 transition-colors"
            >
              Create one
            </Link>
          </p>

          {/* <button
            onClick={handleLogout}
            className="btn-ghost-glow w-full mt-8 py-4 rounded-xl text-lg font-bold"
          >
            Logout
          </button> */}
        </div>
      </div>
    </div>
  );
}

export default Login;
