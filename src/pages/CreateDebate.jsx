import { useState } from "react";
import {collection,addDoc} from "firebase/firestore";
import {db} from "../services/firebase";

function CreateDebate(){

    const[title,setTitle]=useState("");
    const[roomType,setRoomType]=useState("");
    const[description,setDescription]=useState("");
    const[category,setCategory]=useState("");
    const[endTime,setEndTime]=useState("");
    const[formate,setFormate]=useState("");
    const [inviteEmail,setInviteEmail]=useState("");
    const handleCreateDebate = async()=>{

        try{

        await addDoc(collection(db,"debates"),{
            title,
            description,
            category,
            endTime,
            formate,
            roomType,
            createdAt: new Date()
        });

        await addDoc(collection(db,"notifications"),{

            userEmail:inviteEmail,
            message:"You have been invited to join ${title}",
            createdAt:new Date(),
        })

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

            <select
            value={formate}
            onChange={(e)=>setFormate(e.target.value)}
            
            >
                <option>Debate Formate</option>
                <option>1 vs 1</option>
                <option>2 vs 2</option>
                <option>5 vs 5</option>
                <option>10 vs 10</option>
            </select>

            <select
            value={roomType}
            onChange={(e)=>setRoomType(e.target.value)}>
                <option>Room Type</option>
                <option>Public</option>
                <option>Invite Only</option>
            </select>

            <input
            type="email"
            placeholder="Invite User"
            onChange={(e)=>setInviteEmail(e.target.value)}/>

            <button onClick={handleCreateDebate}>
                Create Debate
            </button>
        </div>
    );
}

export default CreateDebate;