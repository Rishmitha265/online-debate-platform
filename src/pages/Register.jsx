import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import {auth} from "../services/firebase";
import { doc, setDoc } from "firebase/firestore";

function Register(){

    const[email,setEmail]=useState("");
    const[password,setPassword]=useState("");
    const [username,setUsername]=useState("");
    const [country,setCountry]=useState("");
    const [bio,setBio]=useState("");

    const handleRegister = async ()=>{

        try{

        await createUserWithEmailAndPassword(
            auth,
            email,
            password
        );

        alert ("Register Successfully")}

        catch(error){
            alert(error.message);
        }

    }

    setDoc(doc(db,"users",username.uid),{
        username,
        email,
        country,
        bio,
        profilePic:"",
        createdAt: new Date(),
    });

    return(
        <div>
            <h1>Register</h1>

            <input
            type="email"
            placeholder="Enter the Email"
            value={email}
            onChange={(e)=>setEmail(e.target.value)}
            />


            <input
            type="password"
            placeholder="Enter the Password"
            value={password}
            onChange={(e)=>setPassword(e.target.value)}
            />

            <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e)=>setUsername(e.target.value)}/>

            <input
            type="text"
            placeholder="Country"
            value={country}
            onChange={(e)=>setCountry(e.target.value)}/>

            <textarea
            placeholder="Bio"
            value={bio}
            onChange={(e)=>setBio(e.target.value)}/>

            <button onClick={handleRegister}>Register</button>
        </div>
    );
}

export default Register;