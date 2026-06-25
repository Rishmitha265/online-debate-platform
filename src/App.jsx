import { BrowserRouter,Routes,Route } from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import CreateDebate from "./pages/CreateDebate";
import DebateRoom from "./pages/DebateRoom";
import Profile from "./pages/Profile";
import Leaderboard from "./pages/Leaderboard";
import DebateCard from "./components/DebateCard";
import Navbar from "./components/Navbar";
import Notifications from "./pages/Notifications";
import Analysics from "./pages/Analytics";
import Trending from "./pages/Trending";
import Activity from "./pages/Activity";
import Admin from "./pages/Admin";
import Report from "./pages/Report";
import Announcements from "./pages/Announcements";
import Settings from "./pages/Settings";

function App (){

  return(
    <BrowserRouter>

    <Routes>

      <Route path="/" element={<Home />}/>
      <Route path="/login" element={ <Login/>}/>
      <Route path="/Register" element={<Register />}/>
      <Route path="/create" element={<CreateDebate/>}/>
      <Route path="/debate/:id" element={<DebateRoom/>}/>
      <Route path="/Profile" element={<Profile />}/>
      <Route path="/leaderboard" element={<Leaderboard />}/>
      <Route path="/DebateCard" element={<DebateCard/>}/>
      <Route path="/Notifications" element={<Notifications/>}/>
      <Route path="/Analytics" element={<Analysics/>}/>
      <Route path="/Trending" element={<Trending/>}/>
      <Route path="/Activity" element={<Activity/>}/>
      <Route path="/Admin" element={<Admin/>}/>
      <Route path="/Report" element={<Report/>}/>
      <Route path="/Announcements" element={<Announcements/>}/>
      <Route path="/Settings" element={<Settings/>}/>

     
    </Routes>
    
    </BrowserRouter>
   
  );

}

export default App;