import{getAuth} from "firebase/auth";
import{useState,useEffect} from "react";
import{doc,getDoc} from "firebase/firestore";
import{db} from "../services/firebase";
import {collection,getDocs,query,where,}from "firebase/firestore";

function Profile(){

    const [userData,setUserData]=useState(null);

    const [debatesCreated, setDebatesCreated] =useState(0);

    const [argumentsPosted, setArgumentsPosted] =useState(0);

    const [totalVotes, setTotalVotes] = useState(0);

    useEffect(()=>{
        fetchProfile();
    },[]);

    const fetchProfile = ()=>{
        const auth =  getAuth();
        const currentUser = auth.currentUser;

        if(!currentUser) return;
        setUser(currentUser);

        const debatesQuery = query(collection(db,"debates"),
    where("userEmail","==",currentUser.email));

      const debatesSnap=getDocs(debatesQuery);

      setDebatesCreated(debatesSnap.docs.length);

      const argumentsQuery = query(collection(db,"arguments"),
    where("userEmail","==",currentUser.email));

    const argumentsSnap=getDocs(argumentsQuery);

    setArgumentsPosted(argumentsSnap.docs.length);

    let votes=0;

    argumentsSnap.docs.forEach((doc)=>{
        vote+=
        doc.data().votes || 0;
    });

    setTotalVotes(votes);
    };

    const getBadge=()=>{
        if (totalVotes>=50)
            return "🏆 Master Debater";

        if(totalVotes>=20)
            return "🥇 Top Debater";

        if(totalVotes>=10)
            return "🥈 Active Debater";
    }

   

    return(
        <div>
            <h1>Profile</h1>
            
            <p>
                <strong>Email:</strong>{" "}
                {user?.email}
            </p>

            <p>
                <strong>
                    Debates Created:
                </strong>{" "}
                {debatesCreated}
            </p>

            <p>
                <strong>
                        Arguments Posted:
                </strong>{ " "}
                {argumentsPosted}
            </p>

            <p>
                <strong>
                    Total Votes Received:
                </strong>{" "}
                {totalVotes}
            </p>

            <p>
                <strong>Badge:</strong>{" "}
                {getBadge()}
            </p>
        </div>
    );
}

export default Profile;