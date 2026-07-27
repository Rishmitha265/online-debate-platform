import { useState } from "react";
import { Link,useNavigate} from "react-router-dom";
import { FaBars, FaTimes } from "react-icons/fa";
import { auth } from "../services/firebase";
import {signOut} from "firebase/auth";

function Navbar() {
  const user = auth.currentUser;
  const [menuOpen, setMenuOpen] = useState(false);
  const [showLogoutModal,setShowLogoutModal] = useState(false);

  const navigate=useNavigate();

  const confirmLogout=async()=>{
    try{
      
      setShowLogoutModal(false);
      setMenuOpen(false);
      await signOut(auth);
      navigate("/login",{replace:true});
    }catch(error){
      console.log(error);
    }
  }


  return (
    <nav className="sticky top-4 z-50 mx-4 sm:mx-6 lg:mx-8">
      <div className="glass-panel flex items-center justify-between px-4 sm:px-6 py-3">
        <div className="text-xl sm:text-2xl font-bold tracking-tight">
          <span>🔥</span>
          <span className="text-gradient">DebateHub</span>
        </div>

        <div className="hidden md:flex items-center gap-6 text-sm text-brand-text">
          <Link className="transition-colors hover:text-white" to="/">Home</Link>
          {!user && (
            <>
              <Link className="transition-colors hover:text-white" to="/login">Login</Link>
              <Link className="transition-colors hover:text-white" to="/register">Register</Link>
            </>
          )}
          {user && (
            <>
              <Link className="transition-colors hover:text-white" to="/notifications">🔔 Notifications</Link>
              <Link className="transition-colors hover:text-white" to="/profile">👤 Profile</Link>
            </>
          )}
        </div>

        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="btn-ghost-glow grid h-10 w-10 place-items-center rounded-xl text-lg"
          aria-label="Toggle menu"
        >
          {menuOpen ? <FaTimes /> : <FaBars />}
        </button>
      </div>

      {menuOpen && (
        <div className="glass-panel absolute right-4 sm:right-6 lg:right-8 top-full mt-3 w-72 max-h-[75vh] overflow-y-auto">
          
          {[
            ["/create", "➕", "Create Debate"],
            ["/leaderboard", "🏆", "Leaderboard"],
            ["/notifications", "🔔", "Notifications"],
            ["/dashboard", "📈", "Dashboard"],
            ["/analytics", "📊", "Analytics"],
            ["/trending", "📈", "Trending"],
            ["/activity", "📝", "Activity"],
            ["/admin", "👨‍💼", "Admin"],
            ["/moderator", "🛡", "Moderator"],
            ["/report", "📋", "Report"],
            ["/announcements", "📢", "Announcements"],
            ["/settings", "⚙", "Settings"],
          ].map(([to, icon, label]) => (
            <Link
              key={to}
              to={to}
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-3 px-5 py-3 text-sm text-brand-text transition-colors hover:bg-white/5 hover:text-white"
            >
              <span className="text-base">{icon}</span> {label}
            </Link>
          ))}

          {user && (
          <>
            <div className="border-t border-white/10 my-1"></div>

            <button
              onClick={()=>setShowLogoutModal(true)}
              className="flex items-center gap-3 w-full px-5 py-3 text-sm text-red-400 transition-colors hover:bg-red-500/10 hover:text-red-300"
            >
              Logout
            </button>

            {showLogoutModal && (
  <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[999]">
    <div className="glass-panel w-96 p-6 rounded-2xl">

      <h2 className="text-2xl font-bold text-white">
        Logout
      </h2>

      <p className="text-brand-text mt-3">
        Are you sure you want to logout?
      </p>

      <div className="flex justify-end gap-4 mt-6">

        <button
          onClick={() => setShowLogoutModal(false)}
          className="px-5 py-2 rounded-lg border border-white/20 hover:bg-white/10"
        >
          Cancel
        </button>

        <button
          onClick={confirmLogout}
          className="px-5 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white"
        >
          Logout
        </button>

      </div>

    </div>
  </div>
)}
          </>
        )}
        </div>
      )}
    </nav>
  );
}

export default Navbar;
