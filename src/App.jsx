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
     
    </Routes>
    
    </BrowserRouter>
   
  );

}

export default App;