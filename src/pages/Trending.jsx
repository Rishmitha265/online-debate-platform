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
  <div className="min-h-screen bg-brand-bg text-brand-navy py-12 px-6">

    <PageNavigator/>

    <h1 className="text-5xl font-bold text-center mb-12 text-brand-navy">
      🔥 Trending Debates
    </h1>

    {debates.length === 0 ? (

      <p className="text-center text-xl text-brand-text">
        No debates found
      </p>

    ) : (

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">

        {debates.map((debate) => (

          <div
            key={debate.id}
            className="bg-brand-bg border border-brand-border rounded-2xl shadow-xl p-6 flex flex-col justify-between hover:shadow-2xl transition duration-300"
          >

            <div>

              <h2 className="text-2xl font-bold text-brand-navy">
                {debate.title}
              </h2>

              <p className="text-brand-text text-center mb-6">
                {debate.description}
              </p>

              <p className="text-center text-lg">
                <span className="font-bold text-brand-navy">
                  Category:
                </span>{" "}
                <span className="text-brand-text">
                  {debate.category}
                </span>
              </p>

            </div>

            <Link
              to={`/debate/${debate.id}`}
              className="mt-8 bg-brand-purple hover:bg-brand-purple-dark text-white py-3 rounded-xl font-semibold text-center transition"
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