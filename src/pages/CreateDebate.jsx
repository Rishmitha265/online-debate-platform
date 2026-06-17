import { useState } from "react";
import {collection,addDoc} from "firebase/firestore";
import {db} from "../services/firebase";

function CreateDebate(){

    const[title,setTitle]=useState("");
    const[description,setDescription]=useState("");

    const handleCreateDebate = async()=>{

        try{

        await addDoc(collection(db,"debates"),{
            title,
            description,
            createdAt: new Date()
        });

        alert("Debate Created");

        setTitle("");
        setDescription("");}

        catch(error){
            console.log(error);
        }

    };

    return(
        <div>
            <h1>Create Debate</h1>

            <input
            
            type="text"
            placeholder="Debate Title"
            value={title}
            onChange={(e)=>setTitle(e.target.value)}/>

            <textarea
            placeholder="Debate Description"
            value={description}
            onChange={(e)=>setDescription(e.target.value)}/>

            <button onClick={handleCreateDebate}>
                Create Debate
            </button>
        </div>
    );
}

export default CreateDebate;