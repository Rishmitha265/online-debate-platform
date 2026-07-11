import { useState } from "react";
import {signInWithEmailAndPassword,signOut,sendPasswordResetEmail,signInWithPopup,} from "firebase/auth";
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

  // Email Login
  const handleLogin = async () => {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

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

  // Forgot Password
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

  // Logout
  const handleLogout = async () => {
    try {
      await signOut(auth);

      setEmail("");
      setPassword("");

      alert("Logged out Successfully");
    } catch (error) {
      alert(error.message);
    }
  };

  // Google Login
  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, googleprovider);

      const userDoc = await getDoc(
        doc(db, "users", auth.currentUser.uid)
      );

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
    <div className="min-h-screen grid lg:grid-cols-2 bg-brand-bg">

      <div className="hidden lg:flex flex-col justify-center px-20 bg-brand-bg">

        <h1 className="text-6xl font-bold text-brand-navy mb-8">
          🔥 DebateHub
        </h1>

        <p className="text-xl text-brand-text leading-9">
          DebateHub is an online platform where people can discuss,
          argue, vote, and improve their communication skills through
          structured debates.
        </p>

        <div className="mt-10 space-y-5 text-lg text-brand-text">

          <p>✔ Create Public & Private Debates</p>

          <p>✔ Join Live Debate Rooms</p>

          <p>✔ Vote for Best Arguments</p>

          <p>✔ Earn Badges & Achievements</p>

          <p>✔ View Global Leaderboard</p>

          <p>✔ Improve Critical Thinking</p>

        </div>

      </div>

      <div className="flex justify-center items-center bg-brand-bg lg:border-l border-brand-border">
        <div className="bg-brand-bg rounded-3xl shadow-2xl border border-brand-border w-full max-w-md p-8">

          <div className="flex justify-between items-center mb-8">

            <button
              onClick={() => window.history.back()}
              className="text-brand-navy text-2xl"
            >
              ←
            </button>

            <h2 className="text-2xl font-bold text-brand-navy">
              🔥 DebateHub
            </h2>

            <button
             onclick={()=>{
              if(auth.currentUser){
                navigate("/profile");
              }else{
                alert("Please login to access your profile.");
              }
             }}
              className="text-brand-navy text-2xl"
            >
              🏠
            </button>

          </div>

          <button
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-4 bg-brand-bg border border-brand-input-border py-4 rounded-xl shadow hover:bg-white/5"
          >
            <FcGoogle size={28} />

            <span className="font-semibold text-brand-navy">
              Sign in with Google
            </span>

          </button>

          {/* Divider */}

          <div className="flex items-center my-6">

            <hr className="flex-1 border-brand-border" />

            <p className="mx-4 text-brand-text">
              or sign in with email
            </p>

            <hr className="flex-1 border-brand-border" />

          </div>


          <h1 className="text-5xl font-bold text-center text-brand-navy">
            Sign In
          </h1>

          <p className="text-center text-brand-text mt-3 mb-6">
            Welcome Back!
          </p>


          <label className="block text-brand-navy font-semibold mb-2">
            Email
          </label>

          <input
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-4 rounded-xl bg-brand-bg border border-brand-input-border text-brand-navy mb-5"
          />

          <label className="block text-brand-navy font-semibold mb-2">
            Password
          </label>

          <div className="relative mb-6">

            <input
              type={showPassword ? "text" : "password"}
              placeholder="Enter your Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-4 rounded-xl bg-brand-bg border border-brand-input-border text-brand-navy pr-12"
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-brand-text hover:text-brand-navy"
            >
              {showPassword ? (
                <FaEyeSlash size={20} />
              ) : (
                <FaEye size={20} />
              )}
            </button>

          </div>


          <button
            onClick={handleLogin}
             className="w-full bg-brand-purple hover:bg-brand-purple-dark py-4 rounded-xl text-xl font-bold text-white transition">
            Login
          </button>


          <button
            onClick={ForgetPassword}
            className="w-full mt-5 text-brand-text hover:text-brand-navy"
          >
            Forgot Password?
          </button>



          <p className="text-center text-brand-text mt-6">

            Don't have an account?

            <Link
              to="/register"
             className="text-brand-purple hover:text-brand-purple-dark font-semibold ml-2"
            >
              Create one
            </Link>

          </p>


          <button
            onClick={handleLogout}
           className="w-full mt-8 bg-brand-secondary hover:bg-brand-secondary-hover py-4 rounded-xl text-xl font-bold text-white transition"
          >
            Logout
          </button>

        </div>

      </div>

    </div>
  );
}

export default Login;