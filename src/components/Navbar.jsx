import {Link} from "react-router-dom";
function Navbar(){
return(
    <div>
        <Link to="/">Home</Link> | {" "}
        <Link to="/login">Login</Link> | {" "}
        <Link to="/register">Register</Link> | {" "}
        <Link to="/create">Create Debate</Link> | {" "}
        <Link to="/leaderboard">Leaderboard</Link> | {" "}
        <Link to="/Notifications">Notifications</Link> | {" "}
        <Link to="/Analytics">Analytics</Link> | {" "}
        <Link to="/Trending">Trending</Link> | {" "}
        <Link to="/Activity">Activity</Link> |{" "}
        <Link to="/Admin">Admin</Link> | {" "}
        <Link to="/Report">Report</Link> | {" "}
        <Link to="/Announcements">Announcements</Link> | {" "}
        <Link to="/Settings">Settings</Link> | {" "}

        
    </div>
)

}

export default Navbar;