import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

import {doc,getDoc,collection,addDoc,getDocs,query,where,updateDoc,increment,onSnapshot} from "firebase/firestore";

import { db } from "../services/firebase";

import { getAuth } from "firebase/auth";
import { arrayFilter } from "firebase/firestore/pipelines";
import { deleteDoc } from "firebase/firestore";

function DebateRoom() {
  const { id } = useParams();

  const [debate, setDebate] = useState(null);
  const [side, setSide] = useState("");
  const [argument, setArgument] = useState("")
  const [argumentsList, setArgumentsList] = useState([]);
  const [message,setMessage]=useState("");
  const [messages,setMessages]=useState([]);
  const [timeLeft,setTimeLeft]=useState("");
  const [reply,setReply]=useState("");

  useEffect(() => {
    fetchDebate();
    fetchArguments();
    fetchMessages();
  }, []);

  useEffect(() => {
  if (!debate?.endTime) return;

  const interval = setInterval(() => {
    const now = new Date().getTime();

    const end = new Date(
      debate.endTime
    ).getTime();

    const distance = end - now;

    if (distance <= 0) {
      setTimeLeft("Debate Closed");
      clearInterval(interval);
      return;
    }

    const hours = Math.floor(
      distance / (1000 * 60 * 60)
    );

    const minutes = Math.floor(
      (distance %
        (1000 * 60 * 60)) /
        (1000 * 60)
    );

    const seconds = Math.floor(
      (distance % (1000 * 60)) /
        1000
    );

    setTimeLeft(
      `${hours}:${minutes}:${seconds}`
    );
  }, 1000);

  return () => clearInterval(interval);
}, [debate]);


  // Fetch Debate
  const fetchDebate = async () => {
    try {
      const docRef = doc(db, "debates", id);

      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setDebate({
          id: docSnap.id,
          ...docSnap.data(),
        });
      }
    } catch (error) {
      console.log(error);
    }
  };

  // Fetch Arguments
  const fetchArguments =  () => {
        const q = query(
        collection(db, "arguments"),
        where("debateId", "==", id)
      );

      onSnapshot(q, (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setArgumentsList(data);
      });
    };

  const fetchMessages=()=>{
    const q =query(
      collection(db,"chats"),
      where ("debateId","==",id)
    );

    onSnapshot(q,(snapshot)=>{
      const data=snapshot.docs.map((doc)=>({
        id:doc.id,
        ...doc.data(),
      }));

      setMessages(data);
    })
  };

  // Submit Argument
  const submitArgument = async () => {
    if (!argument) {
      alert("Please enter an argument");
      return;
    }

    if (!side) {
      alert("Please choose Support or Oppose");
      return;
    }

    const auth=getAuth();
    const user=auth.currentUser;

    try {
      await addDoc(collection(db, "arguments"), {
        debateId: id,
        userId: user.uid,
        userEmail: user.email,
        side,
        argument,
        votes: 0,
        createdAt: new Date(),
      });

      alert("Argument Posted");

      setArgument("");

      fetchArguments();
    } catch (error) {
      console.log(error);
      alert(error.message);
    }
  };

  // Upvote / Downvote
 const handleVote = async(arg,type)=>{
  try{
    const argumentRef = doc(
      db,
      "arguments",
      arg.id
    );
    await updateDoc(argumentRef,{
      votes: increment(
        type === "up"?1:-1
      ),
    });

    await addDoc(
      collection(db,"notifications"),
      {
        userEmail: arg.userEmail,
        message:
        type==="up" ? "Your argument received an Upvote":
                      "Your argument received an Downvote",
        createdAt:new Date(),
      }
    );

  }catch(error){
    console.log(error);
  }
 };

  // Calculate Winner
  const calculateWinner = () => {
    let supportVotes = 0;
    let opposeVotes = 0;

    argumentsList.forEach((arg) => {
      if (arg.side === "Support") {
        supportVotes += arg.votes || 0;
      }

      if (arg.side === "Oppose") {
        opposeVotes += arg.votes || 0;
      }
    });

    if (supportVotes > opposeVotes) {
      return "Support";
    }

    if (opposeVotes > supportVotes) {
      return "Oppose";
    }

    return "Tie";
  };

  if (!debate) {
    return <h2>Loading...</h2>;
  }

  const sendMessage=async()=>{

    if(!user){
      alert("Please login first")
      return;
    }

    if(!message){
      alert("Please enter a message");
      return;
    }

    const auth=getAuth();
    const user = auth.user;

    try{
      await addDoc(collection(db,"chats"),{

        debateId: id,
        userEmail:user.email,
        message,
        createdAt:new Date(),
      });
      alert("Message sent successfully")
      setMessage("");

      
    }catch(error){
      console.log(error);
    }
  };

  const deleteArgument = (argumentId)=>{
    try{
      deleteDoc(doc(db,"arguments",argumentId))
    }catch(error){
      console.log(error)
    }
  }

  const deleteDebate = ()=>{
    try{
      deleteDoc(doc(db,"debates",id));
      alert("Debate Deleted")
    }catch(error){
      console.log(error);
    }
  }

const auth = getAuth();
const user = auth.currentUser;

const myArguments = argumentsList.filter(
  (arg) => arg.userEmail === user?.email
);


const totalArguments = myArguments.length;

const totalVotesReceived = myArguments.reduce(
  (total, arg) => total + (arg.votes || 0),
  0
);

const getAchievement = () => {
  if (totalVotesReceived >= 100) {
    return "🏆 Debate Champion";
  }

  if (totalVotesReceived >= 50) {
    return "🥇 Top Debater";
  }

  if (totalVotesReceived >= 20) {
    return "🔥 Rising Debater";
  }

  if (totalVotesReceived >= 5) {
    return "⭐ Active Participant";
  }

  return "🌱 Beginner";
};

const submitReply = ( parentId)=>{
   addDoc(collection(db,"arguments"),{
    debateId: id,
    parentId,
    argument:reply,
    side,
    vote:0,
   })
}

  

  return (
    <div>
      <h1>Debate Room</h1>

      <h2>{debate.title}</h2>

      <p>{debate.description}</p>

      <h3>Choose Your Side</h3>

      <button
        onClick={() => setSide("Support")}
      >
        Support
      </button>

      <button
        onClick={() => setSide("Oppose")}
      >
        Oppose
      </button>

      <p>
        <strong>Your Side:</strong>{" "}
        {side}
      </p>

      <h3>Post Argument</h3>

      <textarea
        rows="5"
        cols="50"
        placeholder="Enter your argument..."
        value={argument}
        onChange={(e) =>
          setArgument(e.target.value)
        }
      />

      <textarea
      placeholder="Type a message"
      value={message}
      onChange={(e)=>setMessage(e.target.value)}/>

          <button
              onClick={sendMessage}>SEND
            </button>


          <h2>Chat Room</h2>

       {messages.length === 0 ? (
        <p>NO MESSAGES YET</p>
       ) : (
        messages.map((msg) => (
          <div
            key={msg.id}
            style={{
              border: "1px solid gray",
              padding: "5px",
              margin: "5px",
            }}
          >
            <strong>{msg.userEmail}</strong>
            <p>{msg.message}</p>
          </div>
        ))
       )}

      <button onClick={submitArgument}>
        Post Argument
      </button>
      <h2>Arguments</h2>

      {argumentsList.length === 0 ? (
        <p>No arguments yet.</p>
      ) : (
        argumentsList.map((arg) => (
          <div
            key={arg.id}
            style={{
              border: "1px solid black",
              padding: "10px",
              margin: "10px 0",
            }}
          >
            <p>
              <strong>Posted By:</strong>{arg.userEmail}
            </p>
            <p>
              <strong>Side:</strong>{" "}
              {arg.side}
            </p>

            <p>{arg.argument}</p>

            <p>
              <strong>Votes:</strong>{" "}
              {arg.votes||0}
            </p>

            <button
              onClick={() =>
                handleVote(arg, "up")
              }
            >
              👍 Upvote
            </button>

            <button
              onClick={() =>
                handleVote(arg, "down")
              }
            >
              👎 Downvote
            </button>

            <button onClick={()=>deleteArgument(arg.id)}>
              Delete
            </button>

            <button onClick={deleteDebate}>
              Delete Debate
            </button>

            <button>REPLY</button>
          
          <h2>Achievements</h2>

            <p>
              <strong>Badge:</strong> {getAchievement()}
            </p>

            <p>
              <strong>Arguments Posted:</strong> {totalArguments}
            </p>

            <p>
              <strong>Votes Received:</strong> {totalVotesReceived}
            </p>
          </div>
        ))
      )}


      <h2>
        Winner: {calculateWinner()}
      </h2>

      <h2> ⌛-{timeLeft}</h2>
    </div>
  );
}

export default DebateRoom;