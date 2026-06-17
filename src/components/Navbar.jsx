import {Link} from "react-router-dom";
function Navbar(){
return(
    <div>
        <Link to="/">Home</Link> | {" "}
        <Link to="/login">Login</Link> | {" "}
        <Link to="/register">Register</Link> | {" "}
        <Link to="/create">Create Debate</Link> | {" "}
        <Link to="/leaderboard">Leaderboard</Link> | {" "}
        
    </div>
)

}

export default Navbar;