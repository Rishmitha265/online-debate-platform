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
  const [replyTexts,setReplyTexts]=useState({});
  const [replies,setReplies]=useState([]);
  const [editingId,setEditingId]=useState(null);
  const [editedText,setEditiedText]=useState("");
  const [speakerQueue,setSpeakerQueue]=useState([]);
  const [activeSpeaker,setActiveSpeaker]=useState("");
  

  async function fetchReplies() {
  try {
    const snapshot = await getDocs(
      collection(db, "replies")
    );

    const data = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    setReplies(data);
  } catch (error) {
    console.log(error);
  }
};

  useEffect(() => {
    fetchDebate();
    fetchArguments();
    fetchMessages();
    fetchReplies();
  }, []);

  useEffect(() => {
  if (!debate?.endTime) return;

  console.log(debate.endTime);

  const interval = setInterval(async() => {
    const now = new Date().getTime();

    const end = new Date(
      debate.endTime
    ).getTime();

    const distance = end - now;

    if(distance<=3600000&&distance>3590000){
      await addDoc(collection(db,"notifications"),
    {
      userEmail:auth.currentUser.email,
      message:"⏰ Debate ending in 1 hour",
      createdAt: new Date(),
    });
    }

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
      `${hours}h:${minutes}m:${seconds}s`
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

   const match=argument.match(
    /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/
   );

   if(match){
    console.log(match)
    await addDoc(
      collection(db,"notifications"),
      {
        userEmail:match[0],
        message:"you were mentioned in a debate",
        createdAt:new Date(),
      }
    );
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

    if ((arg.votes ||0)+1>=5){
      await addDoc(collection(db,"notifications"),
    {
      userEmail: arg.userEmail,
      message: "🎊Achievement Unlocked: Active Participant",
      createdAt:new Date(),
    });
    }

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

    const auth=getAuth();
    const user = auth.currentUser;

    if(!user){
      alert("Please login first")
      return;
    }

    if(!message){
      alert("Please enter a message");
      return;
    }

    

    try{
      await addDoc(collection(db,"chats"),{

        debateId: id,
        userEmail:auth.currentUser.email,
        message,
        createdAt:new Date(),
      });
      alert("Message sent successfully")
      setMessage("");

      
    }catch(error){
      console.log(error);
    }
  };

 
 const deleteArgument = async(arg)=>{

  try{

    await addDoc(
      collection(db,"notifications"),
      {
        userEmail:arg.userEmail,
        message:"⚠️ Your argument was removed by a moderator",
        createdAt:new Date(),
      }
    );

    await deleteDoc(
      doc(db,"arguments",arg.id)
    );

    alert("Argument Deleted");

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


const submitReply = async(argumentId)=>{

  const auth=getAuth();
  const replyText=replyTexts[argumentId];
  
  if(!replyText){
    alert("Enter the reply");
    return;
  }

  try{
    await addDoc(collection(db,"replies"),{
      argumentId,
      reply:replyText,
      userEmail:auth.currentUser.email,
      createdAt: new Date(),
    });

    alert("Reply Added");

    fetchReplies();

    setReplyTexts({
      ...replyTexts,[argumentId]:"",
    });
  }catch(error){
    console.log(error);
  }

  
};

const totalReplies=replies.length;
const totalMessages=messages.length;
const totalVotes = argumentsList.reduce(
  (sum,arg)=>sum+(arg.votes || 0),0
);

const topArgument = [...argumentsList].sort(
  (a,b)=>
  (b.votes || 0) - (a.votes || 0)
)[0];

const updateArgument=async(argumentId)=>{
  try{
    await updateDoc(doc(db,"arguments",argumentId),{
      argument:editedText,
    });

    alert("Argument Updated");

    setEditingId(null);
    setEditiedText("");
  }catch(error){
    console.log(error);
  }
}

const handleShare = async()=>{
  try{
    if(navigator.share){
     await navigator.share({
        title: debate.title,
        text: debate.description,
        url: window.location.href,
      });

    }else{
     await  navigator.clipboard.writeText(
      window.location.href
    );

    alert("Link copid to clipboard")
  }
  
  }catch(error){
    console.log(error);
  }
};

const announceResult=async()=>{
 const winner=calculateWinner();
 
  const auth=getAuth();
  const user=auth.currentUser;
  
  if(!user)return;
  
  await addDoc(
    collection(db, "notifications"),
    {
      userEmail: user.email,
      message: `Debate Result: ${winner} Side Won`,
      createdAt: new Date(),
    }
  );

  alert("Result Notification Sent");
};

const RaiseHand=()=>{
  const auth=getAuth();

  if(!auth.currentUser) return;

  const email=auth.currentUser.email

  if(speakerQueue.includes(email)){
    alert ("Already in a Queue");
    return;
  }

  setSpeakerQueue([...speakerQueue,email])
}

const approveSpeaker=()=>{
   if(speakerQueue.length===0) return;

   const nextspeaker=speakerQueue[0];

   setActiveSpeaker(nextspeaker);

   setSpeakerQueue(speakerQueue.slice(1));
};
  

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

            {editingId === arg.id ? (
          <>
            <textarea
              value={editedText}
              onChange={(e) =>
                setEditedText(e.target.value)
              }
            />

            <button
              onClick={() =>
                updateArgument(arg.id)
              }
            >
              Save
            </button>
          </>
        ) : (
          <p>{arg.argument}</p>
        )}

            <p>
              <strong>Votes:</strong>{" "}
              {arg.votes||0}
            </p>


            <h4>Replies</h4>

            {replies.filter(
              (reply)=>reply.argumentId === arg.id
            )
            .map((reply)=>(
              <div
              key={reply.id}
              style={{
                marginLeft:"20px",
                padding:"5px",
              }}>
                {reply.reply}
              </div>
            ))}

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

            <button 
            onClick={()=>{
              setEditingId(arg.id);
              setEditiedText(arg.argument);
            }}>EDIT</button>

            <button onClick={()=>deleteArgument(arg)}>
              Delete
            </button>

            <button onClick={deleteArgument}>
              Delete Debate
            </button>

            <button onClick={RaiseHand}>
              🤚Raise Hand
            </button>
                                                
            <h3>Speaker Queue</h3>
            {speakerQueue.map((user,index)=>(  //showing next person to speak 
              <div key={index}>
                {index+1}.{user}
              </div>
            ))}

            <h3> 🎤 Active Speaker:
              {activeSpeaker||"None"}
            </h3>

            <button onClick={approveSpeaker}>
              Approved the Next Speaker
            </button>

            <textarea 
            placeholder="Write a reply...."
            value={replyTexts[arg.id]||""}
            onChange={(e)=>setReplyTexts({
              ...replyTexts,
              [arg.id]:e.target.value,
            })}/>

            <button onClick={()=>submitReply(arg.id)}>REPLY</button>
          
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

            <button onClick={handleShare}>
              SHARE DEBATE
            </button>
          </div>
        ))
      )}

      

      <h2>Debate Sttatistics</h2>

      <p>Total Arguments:{argumentsList.length}</p>
      <p> Total Votes:{totalVotes}</p>
      <p>Total Replies:{totalReplies}</p>
      <p>Total Messages:{totalMessages}</p>

      {topArgument && (
        <>
        <h2>🏆Top Arguments</h2>

        <p>{topArgument.argument}</p>

        <p>Votes:{topArgument.votes}</p>
        </>
      )}


      <h2>
        Winner: {calculateWinner()}
      </h2>

      <h2> ⌛-{timeLeft}</h2>
    </div>
  );
}

export default DebateRoom;