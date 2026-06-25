import {collection,getDocs} from "firebase/firestore";
import {db} from "../services/firebase";
import {useState,useEffect} from "react";
import {Link} from "react-router-dom"
function Trending(){

    const [debates,setDebates]=useState([]);

    useEffect(()=>{
        fetchDabets();
    },[]);


    const fetchDabets = async()=>{
        try{
            const snapshot = await getDocs(collection(db,"debates"));

            const data=snapshot.docs.map((doc)=>({
                id:doc.id,
                ...doc.data(),
            }));

            setDebates(data);
        }catch(error){
            console.log(error);
        }
    };

    return(
        <div>
            <h1>🔥Trending Debates</h1>

            {debates.length === 0?(
                <p>No debates found</p>
            ):(
                debates.map((debate)=>(
                    <div
                    key={debate.id}
                    style={{
                        border: "1px solid gray",
                        padding: "10px",
                        margin: "10px 0"
                    }}>

                    <h2>{debate.title}</h2>

                    <p>{debate.description}</p>

                    <p>
                        <strong>Category:</strong>{" "}
                        {debate.category}
                    </p>

                    <Link to={`/debate/${debate.id}`}>
                    join debate
                    </Link>
                    </div>
                ))
            )}
        </div>
    )
}

export default Trending;