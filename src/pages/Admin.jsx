import { useEffect,useState } from "react";
import {collection,getDocs,} from "firebase/firestore";
import { db } from "../services/firebase";

function Admin(){

    const [totalDebates, setTotalDebates] = useState(0);

  const [totalArguments, setTotalArguments] =useState(0);

  const [totalReplies, setTotalReplies] =useState(0);

  const [totalMessages, setTotalMessages] =useState(0);

  useEffect(()=>{
    fetchStats();
  },[]);

  const fetchStats = async()=>{
    try{
        const debatesSnapshot=
        await getDocs(collection(db,"debates"));

        const argumentsSnapshot=
        await getDocs(collection(db,"arguments"));

        const repliesSnapshot=
        await getDocs(collection(db,"replies"));

        const messagesSnapshot=
        await getDocs(collection(db,"chats"));

        setTotalDebates(debatesSnapshot.size);

        setTotalArguments(argumentsSnapshot.size);

        setTotalReplies(repliesSnapshot.size);

        setTotalMessages(messagesSnapshot.size);
    } catch(error){
        console.log(error);
    }
  };

  return(
     <div
      style={{
        padding: "20px",
      }}
    >
      <h1>
        👨‍💼 Admin Dashboard
      </h1>

      <div
        style={{
          border: "1px solid gray",
          padding: "15px",
          margin: "10px",
        }}
      >
        <h3>
          📚 Total Debates
        </h3>

        <p>{totalDebates}</p>
      </div>

      <div
        style={{
          border: "1px solid gray",
          padding: "15px",
          margin: "10px",
        }}
      >
        <h3>
          💬 Total Arguments
        </h3>

        <p>{totalArguments}</p>
      </div>

      <div
        style={{
          border: "1px solid gray",
          padding: "15px",
          margin: "10px",
        }}
      >
        <h3>
          📝 Total Replies
        </h3>

        <p>{totalReplies}</p>
      </div>

      <div
        style={{
          border: "1px solid gray",
          padding: "15px",
          margin: "10px",
        }}
      >
        <h3>
          📨 Total Messages
        </h3>

        <p>{totalMessages}</p>
      </div>
    </div>
  );
}

export default Admin;