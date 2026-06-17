import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import {auth} from "../services/firebase";

function Login(){

    const[email,setEmail]=useState("");
    const[password,setPassword]=useState("");

    const handleLogin = async ()=>{

        try{

        await signInWithEmailAndPassword(
            auth,
            email,
            password
        );

        alert ("Logined Successfully")}

        catch(error){
            alert(error.message);
        }

    }

    return(
        <div>
            <h1>Login</h1>

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

            <button onClick={handleLogin}>Login</button>
        </div>
    );
}

export default Login;