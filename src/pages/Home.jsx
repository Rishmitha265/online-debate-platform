import { collection,getDocs } from "firebase/firestore";
import {db} from "../services/firebase";
import { useState,useEffect } from "react";
import DebateCard from "../components/DebateCard";
import Navbar from "../components/Navbar";

function Home({debate}){
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

        const matchSearch=debate.title?.toLowerCase().
        includes(search.toLowerCase());

        const matchCategory=
        SelectedCategory === "" || 
        debate.category === selectedCategory;

        return matchSearch && matchCategory
    })

  const trendingDebates =
  [...debates].sort(
    (a, b) =>
      (b.totalVotes || 0) -
      (a.totalVotes || 0)
  );

  

    return(
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

        <option value=" ">All</option>
        <option value="Technology">Technology</option>
        <option value="Education">Education</option>
        <option value="Politics">Politics</option>
        </select>

        {filterDebates.map((debate)=>(
            <DebateCard
            
            key={debate.id}
            debate={debate}/>
        ))}

        

        
        </>
    );

}

export default Home;