import { collection,getDocs } from "firebase/firestore";
import {db} from "../services/firebase";
import { useState,useEffect } from "react";
import DebateCard from "../components/DebateCard";
import Navbar from "../components/Navbar";

function Home(){
    const [ debates,setDebates]=useState([]); //store the debates in []

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

    return(
        <>
        <Navbar/>

        <h1>DebateHub</h1>

        {debates.map((debate)=>(
            <DebateCard
            
            key={debate.id}
            debate={debate}/>
        ))}
        </>
    );

}

export default Home;