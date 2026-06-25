import {useState} from "react";
import {collection,getDocs} from "firebase/firestore";
import {db} from "../services/firebase";

function Analysics(){

    const[totalDebates,setTotalDebates]=useState(0);
    const[totalArguments,setTotalArguments]=useState(0);
    const[totalVotes,setTotalVotes]=useState(0);
    const[ActiveUser,setActiveUser]=useState(0);



    const fetchAnalytics = ()=>{
        try{
        
            const debateSnapshot=
                getDocs(collection(db,"debates"));

            setTotalDebates(debateSnapshot.size);

            const argumentSnapshot=getDocs(collection(db,"arguments"));

            setTotalArguments(argumentSnapshot.size);

            let votes=0;
            let users = {};

            argumentSnapshot.docs.forEach(
                (doc)=>{
                    const data=doc.data();
                    votes+=data.votes ||0;

                    users[data.userEmail]=(users[data.userEmail]||0)+1;
                }
            );

            setTotalVotes(votes);

            let activeUser="";
            let maxPosts=0;

            for(let user in users){
                if(users[user]>maxPosts){
                    maxPosts=users[user];
                    activeUser=user;
                }
            }

            setActiveUser(activeUser);
        
    }catch (error){
        console.log(error);
    }

    

};

return(
    <div>
        <h1>
            📊Debate Analytics
        </h1>

        <h2>
            Total Debates:{totalDebates}
        </h2>

        <h2>
            Total Arguments:{totalArguments}
        </h2>

        <h2>
            Total Votes:{totalVotes}
        </h2>

        <h2>
            Most Active Users:{ActiveUser}
        </h2>
    </div>
);
}

export default Analysics;