import { collection,getDocs } from "firebase/firestore";
import {db} from "../services/firebase";
import { useState,useEffect } from "react";
import DebateCard from "../components/DebateCard";
import Navbar from "../components/Navbar";
import {deleteDoc,doc} from "firebase/firestore";

function Home(){
    const [ debates,setDebates]=useState([]); //store the debates in []
    const [search,setSearch]=useState("");
    const [SelectedCategory,setSelectedCategory]=useState("");

    useEffect(()=>{fetchDebates();},[])  //fetch the debates and store in [] from firestore

    const fetchDebates=async()=>{

     try{

        const querySnapshot=await getDocs(collection(db,"debates"));

        const debateList=querySnapshot.docs.map((doc) => ({
            id:doc.id,
            ...doc.data(),
        }));

         setDebates(debateList);}

         catch(error){
            console.log(error);
         }
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

        <h1>DebateHub</h1>

        <input
        type="text"
        placeholder="Search debates.."
        value={search}
        onChange={(e)=>setSearch(e.target.value)}/>

        <select
        value={SelectedCategory}
        onChange={(e)=>setSelectedCategory(e.target.value)}>

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


        {filterDebates.filter(Boolean).map((debate) => (
  <div key={debate.id}>
    <DebateCard debate={debate} />

    <button
      onClick={() => deleteDebate(debate.id)}
    >
      🗑️ Delete Debate
    </button>
  </div>
))}
        

        
        </>
    );

}

export default Home;