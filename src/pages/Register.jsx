import { useState,useEffect} from "react";
import { createUserWithEmailAndPassword , sendEmailVerification} from "firebase/auth";
import { auth, db } from "../services/firebase";
import { doc, setDoc } from "firebase/firestore";
import {FaEye, FaEyeSlash} from "react-icons/fa";
import PageNavigator from "../components/PageNavigator";

function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword]=useState(false);
  const [username, setUsername] = useState("");
  const [country, setCountry] = useState("");
  const [bio, setBio] = useState("");

  useEffect(()=>{
    setUsername("");
    setEmail("");
    setPassword("");
    setCountry("");
    setBio("");
  },[])

  const handleRegister = async () => {
    try {
      const userCredential =
        await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );

        await sendEmailVerification(userCredential.user);

        alert("Registration successful!\n\n Verification has been send to your email.\n Please verify your email before logging in.");

      const user = userCredential.user;

      await setDoc(doc(db, "users", user.uid), {
        username,
        email,
        country,
        bio,
        profilePic: "",
        banned:false,
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
    <div className="min-h-screen bg-brand-bg flex justify-center items-center px-4">

      <div className="bg-brand-bg border border-brand-border rounded-3xl shadow-2xl w-full max-w-lg p-8">

        <PageNavigator/>

        <h1 className="text-brand-navy text-5xl font-bold">
          Create Account
        </h1>

        <form className="space-y-5"
        autoComplete="off">

          <input
            type="text"
            autoComplete="off"
            placeholder="Username"
            value={username}
            onChange={(e) =>
              setUsername(e.target.value)
            }
            className="w-full p-3 bg-brand-bg border border-brand-input-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-purple"
          />

          <input
            type="email"
            autoComplete="new-email"
            placeholder="Email Address"
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
            className="w-full p-3 bg-brand-bg border border-brand-input-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-purple"
          />

          <div className="relative w-full mb-6">
            <input
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            placeholder="Enter the password"
            value={password}
            onChange={(e)=>setPassword(e.target.value)}
            className="w-full p-3 rounded-lg border border-brand-input-border bg-brand-bg text-brand-navy pr-12"/>

            <button
            type="button"
            onClick={()=>setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-text hover:text-brand-navy">
              {showPassword ? <FaEyeSlash/>:<FaEye/>}
            </button>
          </div>

          <input
            type="text"
            placeholder="Country"
            value={country}
            onChange={(e) =>
              setCountry(e.target.value)
            }
            className=" justify-center w-full p-3 bg-brand-bg border border-brand-input-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-purple"
          />

          <textarea
            placeholder="Tell us about yourself..."
            value={bio}
            onChange={(e) =>
              setBio(e.target.value)
            }
            rows="4"
            className="w-full p-3 bg-brand-bg border border-brand-input-border rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-brand-purple"
          ></textarea>

          <button
            onClick={handleRegister}
            className="w-full bg-brand-purple hover:bg-brand-purple-dark text-white py-3 rounded-xl font-semibold text-lg transition duration-300"
          >
            Register
          </button>

        </form>

      </div>

    </div>
  );
}

export default Register;