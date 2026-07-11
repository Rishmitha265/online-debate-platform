import {useState,useEffect} from "react";
import {collection,getDocs} from "firebase/firestore";
import {db} from "../services/firebase";
import PageNavigator from "../components/PageNavigator";

function Analytics(){

    const[totalDebates,setTotalDebates]=useState(0);
    const[totalArguments,setTotalArguments]=useState(0);
    const[totalVotes,setTotalVotes]=useState(0);
    const[ActiveUser,setActiveUser]=useState(0);


     useEffect(()=>{
            fetchAnalytics()
        },[])



    const fetchAnalytics = async()=>{

        try{
        
            const debateSnapshot=
                await getDocs(collection(db,"debates"));

            setTotalDebates(debateSnapshot.size);

            const argumentSnapshot= await getDocs(collection(db,"arguments"));

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
    <div className="min-h-screen bg-brand-bg text-brand-navy py-12 px-6">

        <PageNavigator/>
        <h1 className="text-5xl font-bold text-center mb-12">
            📊Debate Analytics
        </h1>
       
       <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">

        <div className="bg-brand-bg border border-brand-border rounded-2xl shadow-xl p-8 text-center">
        <h2 className="text-xl font-semibold text-brand-text mb-4">
            Total Debates:{totalDebates}
        </h2>
        </div>


        <div className="bg-brand-bg border border-brand-border rounded-2xl shadow-xl p-8 text-center">
        <h2 className="text-5xl font-bold text-brand-purple">
            Total Arguments:{totalArguments}
        </h2>
        </div>


        <div className="bg-brand-bg border border-brand-border rounded-2xl shadow-xl p-8 text-center">
        <h2 className="text-xl font-semibold text-brand-text mb-4">
            Total Votes:{totalVotes}
        </h2>
        </div>

        <div className="bg-brand-bg border border-brand-border rounded-2xl shadow-xl p-8 text-center">
        <h2 className="text-xl font-semibold text-brand-text mb-4">
            Most Active Users:{ActiveUser||"NO DATA"}
        </h2>
        </div>
    </div>
    </div>
);
}

export default Analytics;