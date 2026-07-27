import { useState, useEffect } from "react";
import { createUserWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
import { auth, db } from "../services/firebase";
import { doc, setDoc } from "firebase/firestore";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import PageNavigator from "../components/PageNavigator";

function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState("");
  const [country, setCountry] = useState("");
  const [bio, setBio] = useState("");

  useEffect(() => {
    setUsername("");
    setEmail("");
    setPassword("");
    setCountry("");
    setBio("");
  }, []);

  const handleRegister = async () => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await sendEmailVerification(userCredential.user,{
        url:"https://online-debate-platform-1su7-three.vercel.app/login",
        handleCodeInApp:false,
      });

      alert(
        "Registration successful!\n\n Verification has been send to your email.\n Please verify your email before logging in."
      );

      const user = userCredential.user;

      await setDoc(doc(db, "users", user.uid), {
        username,
        email,
        country,
        bio,
        profilePic: "",
        banned: false,
        createdAt: new Date(),
      });

      setUsername("");
      setEmail("");
      setPassword("");
      setCountry("");
      setBio("");
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div className="relative min-h-screen flex justify-center items-center px-4 py-10 overflow-hidden">
      {/* Ambient orbs */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="animate-float-orb absolute -left-32 top-10 h-96 w-96 rounded-full bg-brand-purple opacity-25 blur-3xl" />
        <div
          className="animate-float-orb absolute -right-20 bottom-10 h-[26rem] w-[26rem] rounded-full bg-brand-blue opacity-20 blur-3xl"
          style={{ animationDelay: "3s" }}
        />
      </div>

      <div className="glass-panel w-full max-w-lg p-8">
        <PageNavigator />

        <h1 className="text-4xl font-bold mb-2">
          <span className="text-gradient">Create Account</span>
        </h1>
        <p className="text-brand-text mb-6 text-sm">
          Join DebateHub and start debating in seconds.
        </p>

        <form className="space-y-4" autoComplete="off">
          <input
            type="text"
            autoComplete="off"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="input-disco w-full p-3"
          />

          <input
            type="email"
            autoComplete="new-email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input-disco w-full p-3"
          />

          <div className="relative w-full">
            <input
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder="Enter the password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-disco w-full p-3 pr-12"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-text hover:text-brand-navy"
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>

          <input
            type="text"
            placeholder="Country"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            className="input-disco w-full p-3"
          />

          <textarea
            placeholder="Tell us about yourself..."
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows="4"
            className="input-disco w-full p-3 resize-none"
          />

          <button
            type="button"
            onClick={handleRegister}
            className="btn-gradient w-full py-3.5 rounded-xl font-semibold text-lg"
          >
            Register
          </button>
        </form>
      </div>
    </div>
  );
}

export default Register;
