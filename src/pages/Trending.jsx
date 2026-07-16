//Trending.jsx

import {collection,getDocs} from "firebase/firestore";
import {db} from "../services/firebase";
import {useState,useEffect} from "react";
import {Link} from "react-router-dom";
import PageNavigator from "../components/PageNavigator";
function Trending(){

    const [debates,setDebates]=useState([]);

    useEffect(()=>{
        fetchDabets();
    },[]);


    const fetchDabets = async()=>{
        try{
            const snapshot = await getDocs(collection(db,"debates"));

            const data=snapshot.docs.map((doc)=>({
                id:doc.id,
                ...doc.data(),
            }));

            setDebates(data);
        }catch(error){
            console.log(error);
        }
    };

return (
  <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_rgba(139,92,246,0.15),_transparent_60%),radial-gradient(ellipse_at_bottom,_rgba(59,130,246,0.12),_transparent_60%)] bg-[#07070d] text-white py-12 px-6">

    <PageNavigator/>

    <h1 className="text-5xl font-extrabold text-center mb-12 bg-gradient-to-r from-purple-400 via-fuchsia-400 to-blue-400 bg-clip-text text-transparent">
      🔥 Trending Debates
    </h1>

    {debates.length === 0 ? (

      <p className="text-center text-xl text-white/60">
        No debates found
      </p>

    ) : (

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">

        {debates.map((debate) => (

          <div
            key={debate.id}
            className="relative overflow-hidden bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-[0_20px_60px_-20px_rgba(168,85,247,0.4)] p-6 flex flex-col justify-between hover:border-fuchsia-500/40 hover:shadow-[0_25px_70px_-15px_rgba(217,70,239,0.55)] hover:-translate-y-1 transition-all duration-300"
          >
            <div className="absolute -top-16 -right-16 w-40 h-40 rounded-full bg-fuchsia-500/20 blur-3xl pointer-events-none" />

            <div className="relative">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-fuchsia-300 to-purple-300 bg-clip-text text-transparent">
                {debate.title}
              </h2>

              <p className="text-white/70 text-center mb-6 mt-3">
                {debate.description}
              </p>

              <p className="text-center text-lg">
                <span className="font-semibold text-fuchsia-300">
                  Category:
                </span>{" "}
                <span className="text-white/80">
                  {debate.category}
                </span>
              </p>
            </div>

            <Link
              to={`/debate/${debate.id}`}
              className="relative mt-8 bg-gradient-to-r from-purple-600 via-fuchsia-500 to-blue-500 hover:from-purple-500 hover:via-fuchsia-400 hover:to-blue-400 text-white py-3 rounded-xl font-semibold text-center shadow-[0_10px_30px_-8px_rgba(217,70,239,0.6)] hover:shadow-[0_15px_40px_-10px_rgba(217,70,239,0.8)] transition-all duration-300"
            >
              Join Debate ➜
            </Link>
          </div>

        ))}

      </div>

    )}

  </div>
);

}

export default Trending;
