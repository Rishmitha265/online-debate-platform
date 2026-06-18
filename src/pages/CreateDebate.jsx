import { useState } from "react";
import {collection,addDoc} from "firebase/firestore";
import {db} from "../services/firebase";

function CreateDebate(){

    const[title,setTitle]=useState("");
    const[description,setDescription]=useState("");
    const[category,setCategory]=useState("");
    const[endTime,setEndTime]=useState("");

    const handleCreateDebate = async()=>{

        try{

        await addDoc(collection(db,"debates"),{
            title,
            description,
            category,
            endTime,
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
                type="datetime-local"
                value={endTime}
                onChange={(e)=>setEndTime(e.target.value)}/>

            <input
            
            type="text"
            placeholder="Debate Title"
            value={title}
            onChange={(e)=>setTitle(e.target.value)}/>

            <textarea
            placeholder="Debate Description"
            value={description}
            onChange={(e)=>setDescription(e.target.value)}/>

            <select
                value={category}
                onChange={(e)=>setCategory(e.target.value)}>

            <option value="">select category</option>

            <option value="Tecchnology">Technology</option>

            <option value="Education">Education</option>

            <option value="Sports">Sports</option>

            <option value="Politics">Politics</option>

            <option value="Pollution">Pollution</option>
                </select>

            <button onClick={handleCreateDebate}>
                Create Debate
            </button>
        </div>
    );
}

export default CreateDebate;