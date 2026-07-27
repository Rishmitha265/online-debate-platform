import { collection,getDocs,onSnapshot} from "firebase/firestore";
import {db,auth} from "../services/firebase";
import { useState,useEffect } from "react";
import DebateCard from "../components/DebateCard";
import Navbar from "../components/Navbar";
import {deleteDoc,doc} from "firebase/firestore";
import PageNavigator from "../components/PageNavigator";
import { useNavigate } from "react-router-dom";
import {FaEdit} from "react-icons/fa";

function Home(){
    const [ debates,setDebates]=useState([]); //store the debates in []
    const [search,setSearch]=useState("");
    const [SelectedCategory,setSelectedCategory]=useState("");
    const navigate = useNavigate();

    useEffect(()=>{
      if(!auth.currentUser) return;
      const unsubscribe=fetchDebates();
      return ()=> unsubscribe();
    },[])  //fetch the debates and store in [] from firestore

    const fetchDebates = () => {
        const unsubscribe = onSnapshot(collection(db, "debates"), (querySnapshot) => {
          const debateList = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setDebates(debateList);
        });

        return unsubscribe;
      };

    const filterDebates=debates.filter((debate)=>{
        if (!debate) return false;

        const matchSearch=debate.title?.toLowerCase().
        includes(search.toLowerCase());

        const matchCategory=
        SelectedCategory === "" || 
        debate.category === SelectedCategory;

        return matchSearch && matchCategory;
    });

  const trendingDebates =
  [...debates].sort(
    (a, b) =>
      (b.totalVotes || 0) -
      (a.totalVotes || 0)
  );

  const deleteDebate = async (debateId) => {
    try {

      const confirmDelete=window.confirm("Are you sure want to delete the debate?");

      if(!confirmDelete) return;
      await deleteDoc(doc(db, "debates", debateId));

      alert("Debate Deleted");

      fetchDebates();
    } catch (error) {
      console.log(error);
    }
  };

    return (
        <>
        <Navbar/>

        <div className="text-center mb-10">

          <PageNavigator/>

        <h1 className="text-brand-navy text-6xl font-bold"> 
          🔥DebateHub
        </h1>
        
        <p className=" text-center text-brand-text mt-3 text-lg">
          Express your opinions. Debate with the world
        </p>
        </div>

        <div className="flex flex-col md:flex-row justify-center gap-4 mb-10">

        <input
        type="text"
        placeholder="🔍Search debates.."
        value={search}
        onChange={(e)=>setSearch(e.target.value)}
        className="w-full md:w-96 px-4 py-3 bg-brand-bg border border-brand-input-border rounded-xl shadow focus:outline-none focus:ring-2 focus:ring-brand-purple"/>

        <select
        value={SelectedCategory}
        onChange={(e)=>setSelectedCategory(e.target.value)}
        className="px-4 py-3 bg-brand-bg border border-brand-input-border rounded-xl shadow focus:outline-none focus:ring-2 focus:ring-brand-purple">

                <option value="">All</option>
                <option value="Technology">Technology</option>
                <option value="Education">Education</option>
                <option value="Politics">Politics</option>
                <option value="Pollution">Pollution</option>

            <option value="Science">Scienece</option>

            <option value="Business">Business</option>

            <option value="Environment">Environment</option>

            <option value="AI">AI</option>

            <option value="Entertainment">Entertainment</option>
            
            <option value="Philosophy">Philosophy</option>

            <option value="Ethics">Ethics</option>

            <option value="Health">Health</option>

            <option value="Startups">Startups</option>
        </select>
      </div>
    
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">

        {filterDebates.filter(Boolean).map((debate) => (
     <div key={debate.id}
     className=" relative bg-brand-bg border border-brand-border rounded-2xl shadow-lg p-6 hover:shadow-2xl transition duration-300 h-fit" >
    <DebateCard debate={debate} />

    {auth.currentUser?.email===debate.userEmail && (
      <>
      <button
      onClick={()=>navigate(`/edit/${debate.id}`)}
      className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-200 transition"
      title = "Edit Debate">
        <FaEdit size={20} className="text-yellow-600"/>
        </button>
        
        <button 
        onClick={()=>deleteDebate(debate.id)}
        className="w-full mt-3 bg-red-500 hover:bg-red-600 text-white py-3 rounded-lg transition-all duration-300 hover:-translate-y-0.5 shadow-[0_10px_25px_-8px_rgba(239,68,68,0.5)] hover:shadow-[0_15px_35px_-8px_rgba(239,68,68,0.7)]">
          Delete Debate</button></>
    )} 
  </div>
))}
     </div>   

        
        </>
    );

}

export default Home;