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
     <div className="max-h screen bg-brand-bg p-8">

    <PageNavigator/>
    <h1 className="text-5xl font-bold text-center text-brand-navy mb-10">
        Dashboard</h1>

    <div className="bg-brand-bg border border-brand-border rounded-2xl shadow-lg p-6 mb-8">
        <h2 className="text-3xl font-bold text-brand-purple">
            welcome,{username||"User"} 👋
        </h2>
     <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">

          <div className="bg-brand-bg border border-brand-border rounded-xl shadow-lg p-6 text-center">

            <h3 className="text-xl font-bold text-brand-navy">
              🎤 Debates Created
            </h3>

            <p className="text-5xl text-brand-purple font-bold mt-4">
              {totalDebates}
            </p>

          </div>

          <div className="bg-brand-bg border border-brand-border rounded-xl shadow-lg p-6 text-center">

            <h3 className="text-xl font-bold text-brand-navy">
              💬 Arguments Posted
            </h3>

            <p className="text-5xl text-brand-blue font-bold mt-4">
              {totalArguments}
            </p>

          </div>

        </div>

        <div className="bg-brand-bg border border-brand-border rounded-xl shadow-lg p-6 mb-8">

          <h2 className="text-2xl font-bold text-yellow-400 mb-5">
            🔔 Notifications
          </h2>

          {notifications.length === 0 ? (
            <p className="text-brand-text">
              No Notifications
            </p>
          ) : (
            notifications.map((item) => (
              <div
                key={item.id}
                className="border-b border-brand-border py-3"
              >
                <p className="text-brand-navy">
                  {item.message}
                </p>
              </div>
            ))
          )}

        </div>

        <div className="bg-brand-bg border border-brand-border rounded-xl shadow-lg p-6">

          <h2 className="text-2xl font-bold text-green-400 mb-5">
            📅 Upcoming Debates
          </h2>

          {upcomingDebates.length === 0 ? (
            <p className="text-brand-text">
              No Debates Available
            </p>
          ) : (
            upcomingDebates.map((debate) => (
              <div
                key={debate.id}
                className="border-b border-brand-border py-4"
              >
                <h3 className="font-bold text-xl text-brand-navy">
                  {debate.title}
                </h3>

                <p className="text-brand-text">
                  {debate.description}
                </p>

                <p className="mt-2 text-brand-text">
                  <span className="font-bold text-brand-navy">
                    Category:
                  </span>{" "}
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