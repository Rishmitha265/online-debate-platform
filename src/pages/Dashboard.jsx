//Dashboard.jsx

import { useEffect, useState } from "react";
import {getAuth} from "firebase/auth";
import {collection,query,where,getDocs} from "firebase/firestore";
import {db} from"../services/firebase";
import PageNavigator from "../components/PageNavigator";

function Dashboard(){
    const[username,setUserName]=useState("");
    const[totalDebates,setTotalDebates]=useState(0);
    const[totalArguments,setTotalArguments]=useState(0);
    const[notifications,setNotifications]=useState([]);
    const[upcomingDebates,setUpcomingDebates]=useState([]);

    useEffect(()=>{
        fetchDashboard();
    },[]);


    const fetchDashboard=async()=>{
        try{
        const auth=getAuth();
        const user=auth.currentUser;

        if(!user) return;

        const userQuery = query(collection(db,"users"),
    where("email","==",user.email));

        const userSnapshot=await getDocs(userQuery);

        if(!userSnapshot.empty){
            setUserName(userSnapshot.docs[0].data().username);
        }

        const debateQuery=query(collection(db,"debates"),
    where("userEmail","==",user.email));

        const debateSnapshot=await getDocs(debateQuery);

        setTotalDebates(debateSnapshot.size);

        const argumentQuery=query(collection(db,"arguments"),
    where("userEmail","==",user.email));

       const argumentSnapshot=await getDocs(argumentQuery);

       setTotalArguments(argumentQuery.size);

       const notificationQuery=query(collection(db,"notifications"),
    where("userEmail","==",user.email));

       const notificationSnapshot=await getDocs(notificationQuery);

       setNotifications(notificationSnapshot.docs.map(doc => ({
        id:doc.id,
        ...doc.data(),
       })));

       const debateList=await getDocs(collection(db,"debates"));

       setUpcomingDebates(debateList.docs.map(doc=>({
        id:doc.id,
        ...doc.data(),
       })));

    }catch(error){
        console.log(error)
    }
};

return(
  <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_rgba(139,92,246,0.15),_transparent_60%),radial-gradient(ellipse_at_bottom,_rgba(59,130,246,0.12),_transparent_60%)] bg-[#07070d] text-white p-8">

    <PageNavigator/>

    <h1 className="text-5xl font-extrabold text-center mb-10 bg-gradient-to-r from-purple-400 via-fuchsia-400 to-blue-400 bg-clip-text text-transparent tracking-tight">
      Dashboard
    </h1>

    <div className="max-w-6xl mx-auto bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl shadow-[0_25px_80px_-20px_rgba(139,92,246,0.4)] p-8 mb-8">

      <h2 className="text-3xl font-bold bg-gradient-to-r from-fuchsia-400 to-purple-300 bg-clip-text text-transparent mb-8">
        Welcome, {username||"User"} 👋
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">

        <div className="relative overflow-hidden bg-gradient-to-br from-purple-600/20 via-fuchsia-500/10 to-blue-500/20 border border-white/10 rounded-2xl p-8 text-center backdrop-blur-xl shadow-[0_20px_60px_-15px_rgba(168,85,247,0.35)] hover:scale-[1.02] transition-transform duration-300">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(217,70,239,0.3),transparent_70%)] pointer-events-none" />
          <h3 className="relative text-xl font-semibold text-white/90">
            🎤 Debates Created
          </h3>
          <p className="relative text-6xl font-extrabold mt-4 bg-gradient-to-r from-fuchsia-400 to-purple-300 bg-clip-text text-transparent">
            {totalDebates}
          </p>
        </div>

        <div className="relative overflow-hidden bg-gradient-to-br from-blue-600/20 via-cyan-500/10 to-purple-500/20 border border-white/10 rounded-2xl p-8 text-center backdrop-blur-xl shadow-[0_20px_60px_-15px_rgba(59,130,246,0.35)] hover:scale-[1.02] transition-transform duration-300">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(59,130,246,0.3),transparent_70%)] pointer-events-none" />
          <h3 className="relative text-xl font-semibold text-white/90">
            💬 Arguments Posted
          </h3>
          <p className="relative text-6xl font-extrabold mt-4 bg-gradient-to-r from-cyan-300 to-blue-400 bg-clip-text text-transparent">
            {totalArguments}
          </p>
        </div>

      </div>

      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 mb-8 shadow-lg">
        <h2 className="text-2xl font-bold text-yellow-300 mb-5">
          🔔 Notifications
        </h2>

        {notifications.length === 0 ? (
          <p className="text-white/60">No Notifications</p>
        ) : (
          notifications.map((item) => (
            <div key={item.id} className="border-b border-white/10 py-3">
              <p className="text-white/90">{item.message}</p>
            </div>
          ))
        )}
      </div>

      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-lg">
        <h2 className="text-2xl font-bold text-emerald-300 mb-5">
          📅 Upcoming Debates
        </h2>

        {upcomingDebates.length === 0 ? (
          <p className="text-white/60">No Debates Available</p>
        ) : (
          upcomingDebates.map((debate) => (
            <div key={debate.id} className="border-b border-white/10 py-4">
              <h3 className="font-bold text-xl text-white">{debate.title}</h3>
              <p className="text-white/70 mt-1">{debate.description}</p>
              <p className="mt-2 text-white/70">
                <span className="font-semibold text-fuchsia-300">Category:</span>{" "}
                {debate.category}
              </p>
            </div>
          ))
        )}
      </div>

    </div>
  </div>
);
}

export default Dashboard;
