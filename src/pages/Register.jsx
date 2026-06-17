import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import {auth} from "../services/firebase";

function Register(){

    const[email,setEmail]=useState("");
    const[password,setPassword]=useState("");

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

            <button onClick={handleRegister}>Register</button>
        </div>
    );
}

export default Register;