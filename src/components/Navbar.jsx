import {useState} from "react";
import {Link} from "react-router-dom";
import {FaBars,FaTimes} from "react-icons/fa";
import {auth} from "../services/firebase";
function Navbar(){

    const user =auth.currentUser;

    const [menuOpen,setMenuOpen]=useState(false);
return(

    <nav className="bg-brand-purple text-white shadow-lg">
    <div className="w-full flex justify-between items-center px-8">

        <div className="text-2xl font-bold">
            🔥DebateHub
        </div>

        <div className="flex gap-8">

            <Link className="hover:text-brand-pink" to="/">
                Home
            </Link>

            <Link className="hover:text-brand-pink" to="/login">
                Login
            </Link>

            <Link className="hover:text-brand-pink" to="/register">
                Register
            </Link>

             {user && (
        <>
            <Link
                className="hover:text-brand-pink"
                to="/notifications"
            >
                🔔 Notifications
            </Link>

            <Link
                className="hover:text-brand-pink"
                to="/profile"
            >
                👤 Profile
            </Link>
        </>
        )}

        </div>

        <button onClick={()=>setMenuOpen(!menuOpen)}
            className="text-2xl">
            {menuOpen ? <FaTimes /> : <FaBars />}
        </button>
    </div>

    {menuOpen && (
       <div className="absolute top-16 right-8 bg-brand-bg text-brand-navy rounded-xl shadow-lg w-64 border border-brand-border">

    <Link to="/create" className="block px-5 py-3 hover:bg-white/10">
        ➕ Create Debate
    </Link>

    <Link to="/leaderboard" className="block px-5 py-3 hover:bg-white/10">
        🏆 Leaderboard
    </Link>

    <Link to="/notifications" className="block px-5 py-3 hover:bg-white/10">
        🔔 Notifications
    </Link>

    <Link to="/dashboard" className="block px-5 py-3 hover:bg-white/10">
        📈 Dashboard
    </Link>

    <Link to="/analytics" className="block px-5 py-3 hover:bg-white/10">
        📊 Analytics
    </Link>

    <Link to="/trending" className="block px-5 py-3 hover:bg-white/10">
        📈 Trending
    </Link>

    <Link to="/activity" className="block px-5 py-3 hover:bg-white/10">
        📝 Activity
    </Link>

    <Link to="/admin" className="block px-5 py-3 hover:bg-white/10">
        👨‍💼 Admin
    </Link>

    <Link to="/moderator" className="block px-5 py-3 hover:bg-white/10">
        🛡 Moderator
    </Link>

    <Link to="/report" className="block px-5 py-3 hover:bg-white/10">
        📋 Report
    </Link>

    <Link to="/announcements" className="block px-5 py-3 hover:bg-white/10">
        📢 Announcements
    </Link>

    <Link to="/settings" className="block px-5 py-3 hover:bg-white/10">
        ⚙ Settings
    </Link>
        </div>
    )}
    </nav>
)

}

export default Navbar;