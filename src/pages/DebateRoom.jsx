import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

import {doc,getDoc,setDoc,collection,addDoc,orderBy,limit,getDocs,query,where,updateDoc,increment,onSnapshot,arrayUnion} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { db,auth} from "../services/firebase";
import { arrayFilter } from "firebase/firestore/pipelines";
import { deleteDoc } from "firebase/firestore";
import PageNavigator from "../components/PageNavigator";
import VideoCall from "../components/VideoCall";

function DebateRoom() {
  const { id } = useParams();

  const [debate, setDebate] = useState(null);
  const [side, setSide] = useState("");
  const [argument, setArgument] = useState("")
  const [argumentsList, setArgumentsList] = useState([]);
  const [joinCall,setJoinCall]=useState(false);
  const [message,setMessage]=useState("");
  const [messages,setMessages]=useState([]);
  const [SpeakerTimeLeft,setSpeakerTimeLeft]=useState(50);
  const [debateTimeLeft,setDebateTimeLeft]=useState("");
  const [replyTexts,setReplyTexts]=useState({});
  const [replies,setReplies]=useState([]);
  const [editingId,setEditingId]=useState(null);
  const [editedText,setEditiedText]=useState("");
  const [speakerQueue,setSpeakerQueue]=useState([]);
  const [activeSpeaker,setActiveSpeaker]=useState("");
  const [viewCount,setViewCount]=useState(0);
  const [debateEnded,setDebateEnded]=useState(false);           //votes will display once the debate is completed
  const [teamvote,setTeamVote]=useState({Support:0,Oppose:0,neutral:0});
  const [supportCount, setSupportCount] = useState(0);
  const [opposeCount, setOpposeCount] = useState(0);
  const [isActiveSpeaker, setIsActiveSpeaker] = useState(false);
 
  

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

async function joinaudience() {
  if (!auth.currentUser) return;

  const debateRef = doc(db, "debates", id);

  await updateDoc(debateRef, {
    viewers: arrayUnion(auth.currentUser.email),
  });
}

  useEffect(() => {
    fetchDebate();
    fetchArguments();
    fetchMessages();
    fetchReplies();
    joinaudience();
    fetchParticipants();
  }, []);

  useEffect(()=>{
  if(!activeSpeaker) return ;

  if(SpeakerTimeLeft===0){
    approveSpeaker();
    return;
  }

  const timer=setTimeout(()=>{
    setSpeakerTimeLeft((prev)=>prev-1);
  },1000)

  return()=>clearTimeout(timer);
},[SpeakerTimeLeft,activeSpeaker]);


 useEffect(() => {
  if (!debate || !debate.endTime) return;

  const end = debate.endTime.toDate().getTime();

  const interval = setInterval(() => {

    const now = Date.now();

    const distance = end - now;

    if (distance <= 0) {
      setDebateTimeLeft("Debate Closed");
      setDebateEnded(true);
      clearInterval(interval);
      return;
    }

    const hours = Math.floor(distance / (1000 * 60 * 60));

    const minutes = Math.floor(
      (distance % (1000 * 60 * 60)) /
      (1000 * 60)
    );

    const seconds = Math.floor(
      (distance % (1000 * 60)) /
      1000
    );

    setDebateTimeLeft(
      `${hours}h ${minutes}m ${seconds}s`
    );

  }, 1000);

  return () => clearInterval(interval);

}, [debate]);


useEffect(() => {

  const auth = getAuth();

  if (!auth.currentUser) return;

  const unsubscribe = onSnapshot(
    doc(db, "activeSpeaker", id),
    (snapshot) => {

      if (!snapshot.exists()) {
        setIsActiveSpeaker(false);
        return;
      }

      const data = snapshot.data();

      setIsActiveSpeaker(
        data.uid === auth.currentUser.uid
      );

    }
  );

  return () => unsubscribe();

}, [id]);


  // Fetch Debate
  const fetchDebate = async () => {
    try {
      const docRef = doc(db, "debates", id);
      
      onSnapshot(docRef,(snapshot)=>{
    if(snapshot.exists()){

        const data={
            id:snapshot.id,
            ...snapshot.data(),
        };

        setDebate(data);
        setTeamVote({
          support: data.supportVotes || 0,
          oppose: data.opposeVotes || 0,
          neutral: data.neutralVotes || 0,
        });

        setSpeakerQueue(data.speakerQueue || []);
        setActiveSpeaker(data.activeSpeaker || "");
        setViewCount(data.viewers?.length ||0);
    }
});
      
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
  const user = auth.currentUser;

  if(!activeSpeaker){
    alert("No active speaker");
    return;
  }

  if(speakerTimeLeft<=0){
    alert("Your speaking Time is over");
    return;
  }

  if (debate.locked) {
  alert("This debate has been locked.");
  return;
   }

  if (debate.ended) {
    alert("This debate has ended.");
    return;
   }

  if (!user) {
    alert("Please login first");
    return;
  }

  
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

    const muteDoc=await getDoc(doc(db,"mutedUsers",auth.currentUser.email));

    if (
      muteDoc.exists () && muteDoc.data().muted
    ){
      alert("You have been muted by the moderator");

      return;
    }

    const removedDoc = await getDoc(
  doc(db, "removedUsers", user.email)
    );

    if (
      removedDoc.exists() &&
      removedDoc.data().removed
    ) {
      alert("You have been removed by the moderator.");
      return;
    }

    await addDoc(
      collection(db,"notifications"),
      {
        userEmail:match[0],
        message:"you were mentioned in a debate",
        debateTitle:debate.title,
        createdAt:new Date(),
      }
    );
   }

    try {
      await addDoc(collection(db, "arguments"), {
        debateId: id,
        userId: user.uid,
        userEmail: user.email,
        side,
        argument,
        votes: 0,

        like:0,
        love:0,
        laugh:0,
        wow:0,
        clap:0,
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
const handleVote = async (arg, type) => {

  console.log("Vote button clicked");
  console.log(arg);

  try {

    const argumentRef = doc(db, "arguments", arg.id);

    console.log("Updating vote...");

    await updateDoc(argumentRef, {
      votes: increment(type === "up" ? 1 : -1),
    });

    console.log("Vote updated successfully");

    console.log("Adding notification...");

    await addDoc(collection(db, "notifications"), {
      userEmail: arg.userEmail,
      message:
        type === "up"
          ? "Your argument received an Upvote"
          : "Your argument received a Downvote",
      debateTitle: debate.title,
      type,
      createdAt: new Date(),
    });

    console.log("Notification added successfully");

  } catch (error) {
    console.log("ERROR:", error);
  }
};

const fetchParticipants = async () => {
  try {

    const supportQuery = query(
      collection(db, "participants"),
      where("debateId", "==", id),
      where("side", "==", "Support")
    );

    const opposeQuery = query(
      collection(db, "participants"),
      where("debateId", "==", id),
      where("side", "==", "Oppose")
    );

    const supportSnapshot = await getDocs(supportQuery);
    const opposeSnapshot = await getDocs(opposeQuery);

    setSupportCount(supportSnapshot.size);
    setOpposeCount(opposeSnapshot.size);

  } catch (error) {
    console.log(error);
  }
};


const argumentReaction=async(argId,reaction)=>{
  try{
    const argumentRef=doc(db,"arguments",argId);
    await updateDoc(argumentRef,{
      [reaction]:increment(1),
    });
    fetchArguments();
  }catch(error){
    console.log(error);
  }
}
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

    const user = auth.currentUser;

    if (debate.locked) {
  alert("This debate has been locked.");
  return;
}

    if (debate.ended) {
    alert("This debate has ended.");
    return;
    }

    if(!user){
      alert("Please login first")
      return;
    }

    if(!message){
      alert("Please enter a message");
      return;
    }

    const muteDoc=await getDoc(doc(db,"mutedUsers",auth.currentUser.email));

    if (
      muteDoc.exists () && muteDoc.data().muted
    ){
      alert("You have been muted by the moderator");

      return;
    }

    const removedDoc = await getDoc(
  doc(db, "removedUsers", user.email)
    );

    if (
      removedDoc.exists() &&
      removedDoc.data().removed
    ) {
      alert("You have been removed by the moderator.");
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
const user = auth.currentUser;

const myArguments = argumentsList.filter(
  (arg) => arg.userEmail === user?.email
);


const totalArguments = myArguments.length;

const totalVotesReceived = myArguments.reduce(
  (total, arg) => total + (arg.votes || 0),
  0
);

const deleteDebate = async () => {
  try {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this debate?"
    );

    if (!confirmDelete) return;

    await deleteDoc(doc(db, "debates", id));

    alert("Debate deleted successfully");

    window.location.href = "/";
  } catch (error) {
    console.log(error);
  }
};

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

const chooseSide = async (selectedSide) => {

  console.log("chooseSide called");


  if (!auth.currentUser){ 
    console.log("No user logged in");
    return};

  setSide(selectedSide);

  try {

    const q = query(
      collection(db, "participants"),
      where("debateId", "==", id),
      where("userEmail", "==", auth.currentUser.email)
    );

    const snapshot = await getDocs(q);

    if (!snapshot.empty) {

      await updateDoc(snapshot.docs[0].ref, {
        side: selectedSide,
      });

    } else {

      await addDoc(collection(db, "participants"), {
        debateId: id,
        userEmail: auth.currentUser.email,
        side: selectedSide,
        createdAt: new Date(),
      });

    }

    alert(`You joined Team ${selectedSide}`);

  } catch (error) {
    console.log(error);
  }

};


const submitReply = async(argumentId)=>{

  const replyText=replyTexts[argumentId];

  if (debate.locked) {
  alert("This debate has been locked.");
  return;
   }

  if(debate.ended){
    alert("This debate has ended.");
    return;
  }
  
  if(!replyText){
    alert("Enter the reply");
    return;
  }

   const muteDoc=await getDoc(doc(db,"mutedUsers",auth.currentUser.email));

    if (
      muteDoc.exists () && muteDoc.data().muted
    ){
      alert("You have been muted by the moderator");

      return;
    }

    const removedDoc = await getDoc(
  doc(db, "removedUsers", user.email)
    );

    if (
      removedDoc.exists() &&
      removedDoc.data().removed
    ) {
      alert("You have been removed by the moderator.");
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

const RaiseHand = async () => {

  console.log(auth.currentUser);

  if (!auth.currentUser) {
    console.log("No user logged in");
    return;
  }

  const email = auth.currentUser.email;

  const debateRef = doc(db, "debates", id);

  await updateDoc(debateRef, {
    speakerQueue: arrayUnion(email),
  });

  alert("Hand Raised Successfully");
};

  const moveToNextSpeaker = async () => {

  if (speakerQueue.length === 0) {
    setActiveSpeaker("");
    alert("Debate Finished");
    return;
  }

  const nextSpeaker = speakerQueue[0];

  const debateRef = doc(db, "debates", id);

  await updateDoc(debateRef, {
    activeSpeaker: nextSpeaker,
    speakerQueue: speakerQueue.slice(1),
  });

  setActiveSpeaker(nextSpeaker);
  setSpeakerQueue(speakerQueue.slice(1));
  setSpeakerTimeLeft(50);
};

const approveSpeaker = async () => {

  await moveToNextSpeaker();

  alert("Next speaker approved");
};

const voteWinner=async(team)=>{
  try{

    if(!auth.currentUser) 
      {
        alert("Debate is still running.")
        return;}

    const email = auth.currentUser.email;
   
    //check whether this user has already voted
    const q=query(collection(db,"winnerVotes"),
  where("debateId","==",id),
  where("userEmail","==",email));

  const snapshot = await getDocs(q);

  if(!snapshot.empty){
    alert("you have already voted");
    return;
  }

   
  //save the users vote
  await addDoc(collection(db,"winnerVotes"),{
    debateId:id,
    userEmail:email,
    team,
    createdAt: new Date(),
  });

  //update the debates vote count
    const debateRef=(doc(db,"debates",id));

    if(team==="support"){
      await updateDoc(debateRef,{
        supportVotes:increment(1),
      });
    }

    if(team==="oppose"){
      await updateDoc(debateRef,{
        opposeVotes:increment(1),
      });
    }

    if(team==="neutral"){
      await updateDoc(debateRef,{
        neutralVotes:increment(1),
      });
    }

    fetchDebate();
  }catch(error){
    console.log(error)
  }
};

const getWinner = ()=>{
  if(
    teamvote.support>teamvote.oppose && 
    teamvote.support>teamvote.neutral
  ){
    return "Team Support";
  }

  if(
    teamvote.oppose > teamvote.support &&
    teamvote.oppose > teamvote.neutral
  ){
    return "Team oppose";
  }
  if (
    teamvote.neutral>teamvote.support &&
    teamvote.neutral>teamvote.oppose
  ){
    return "Neutral";
  }

  return".🤝 It is Tie"
};

const chooseNextSpeaker=async()=>{
  const queueQuery=query(
    collection(db,"speakerQueue"),
    where("debateId","==",id),
    orderby("raisedAt"),
    limit(1)
  );

  const snapshot=await getDocs(queueQuery);

  if(snapshot.empty){
    alert("No users are waiting.")
    return;
  }

  const nextSpeaker=snapshot.docs[0];
  const data=nextSpeaker.data();

  await setDoc(doc(db,"activeSpeaker",id),{
    debateId:id,
    uid:data.uid,
    name:data.name,
  });
  await (`${data.name} is now the active speaker.`)
};

const autoApproveNextSpeaker=async()=>{
  await movetoNextSpeaker();
}



  return (
    <div className="min-h-screen bg-brand-bg text-brand-navy p-8">

      <PageNavigator/>
      <h1 className="text-5xl font-bold text-center text-brand-purple mb-8">
        Debate Room</h1>

      <div className="mt-4 mb-6">
        <h2 className="text-2xl font-bold text-brand-navy">
           👥 {viewCount} Watching
        </h2>
      </div>

      <h2 className="text-3xl font-bold text-brand-navy mb-3"
      >{debate.title}</h2>


      <p className="text-brand-text mb-6"
      >{debate.description}</p>

      {!joinCall ? (
    <div className="flex justify-center my-8">

        <button
            onClick={() => setJoinCall(true)}
            className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-xl font-semibold"
        >
            🎥 Join Live Debate
        </button>

        <button
          onClick={joinCall}
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl"
        >
          Join Existing Call
        </button>

    </div>
) : (
    <VideoCall />
)}

      <h3 className="mb-4">
        Choose Your Side</h3>
      <div className="flex justify-center gap-6 mt-4 mb-6">

      <button
        onClick={() => chooseSide("Support")}
        className="bg-brand-purple hover:bg-brand-purple-dark text-white px-6 py-3 rounded-lg font-semibold"
      >
        Support
      </button>

      <button
        onClick={() => chooseSide("Oppose")}
        className="bg-brand-purple hover:bg-brand-purple-dark text-white px-6 py-3 rounded-lg font-semibold"
      >
        Oppose
      </button>
      </div>

      <p>
        <strong>Your Side:</strong>{" "}
        {side}
      </p>

      <div className="bg-brand-bg border border-brand-border rounded-lg p-4 text-brand-navy mb-8">
         <h3 className="font-bold text-xl">
            👥 Participants
          </h3>

          <p className="mt-2 text-green-400 font-semibold">
            Support: {supportCount}
          </p>

          <p className="text-red-400 font-semibold">
            Oppose: {opposeCount}
          </p>
      </div>

      {activeSpeaker === auth.currentUser?.email ? (

  <>

    <div className="text-center mt-5">

        <h3 className="font-bold text-xl mt-5">
              ⏰ Time Remaining
            </h3>
            <p>timeLeft:{SpeakerTimeLeft}</p>
            <p className="text-3xl font-bold text-red-400">
              {String(Math.floor(SpeakerTimeLeft/60)).padStart(2,"0")}:
              {String(SpeakerTimeLeft%60).padStart(2,"0")}
            </p>

            {speakerQueue.length===0?(
              <p className="text-brand-text">No user in queue</p>
            ):(
              speakerQueue.map((email,index)=>(
                <p key={index}>
                  {index+1}.{email}
                </p>
              ))
            )}

        </div>
    <textarea
      disabled={!isActiveSpeaker}
      rows="5"
      className="w-full p-4 rounded-xl bg-brand-bg border border-brand-input-border text-brand-navy mb-4"
      placeholder="Enter your argument..."
      value={argument}
      onChange={(e) => setArgument(e.target.value)}
    />

    <div className="text-center mt-5">
      <button
        onClick={submitArgument}
        className="bg-brand-purple hover:bg-brand-purple-dark text-white px-6 py-3 rounded-lg font-semibold"
      >
        Post Argument
      </button>
    </div>
  </>

) : (

  <div className="bg-yellow-950/40 border border-yellow-600/50 rounded-lg p-4 mt-5">
    <p className="text-yellow-300 font-semibold">
      ⏳ Wait until you become the active speaker to post your argument.
    </p>
  </div>

)}

      <h2>Chat Room</h2>

       {messages.length === 0 ? (
        <p>NO MESSAGES YET</p>
       ) : (
        messages.map((msg) => (
          <div
            key={msg.id}
           
            className="bg-purple-950/30 border border-brand-border rounded-xl p-4 mb-3"
           
          >
            <strong>{msg.userEmail}</strong>
            <p>{msg.message}</p>
          </div>
        ))
       )}

      <textarea
      placeholder="Type a message"
      className="w-full p-4 rounded-xl bg-brand-bg border border-brand-input-border text-brand-navy mb-4"
      value={message}
      onChange={(e)=>setMessage(e.target.value)}/>

          <button
              onClick={sendMessage}
              className="bg-brand-purple hover:bg-brand-purple-dark text-white px-5 py-2 rounded-lg mb-8">
                Send
            </button>


          

      
      <h2>Information</h2>

      {argumentsList.length === 0 ? (
        <p>No arguments yet.</p>
      ) : (
        argumentsList.map((arg) => (
          <div
            key={arg.id}
            className="bg-brand-bg border border-brand-border rounded-2xl shadow-xl p-6 mb-6 text-brand-navy"
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
            <div className="flex justify-center mt-4">

            <button 
            onClick={()=>updateArgument(arg.id)}
            className="bg-brand-purple hover:bg-brand-purple-dark text-white px-5 py-2 rounded-lg">
              Save
            </button>
            </div>    
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

             <div className="flex justify-center gap-4 mt-4 mb-5">
              <button 
              onClick={()=>argumentReaction(arg.id,"like")}
              className="bg-brand-secondary hover:bg-brand-secondary-hover text-white px-4 py-2 rounded-lg">
                👍{arg.like||0}
              </button>
              <button 
              onClick={()=>argumentReaction(arg.id,"love")}
              className="bg-brand-secondary hover:bg-brand-secondary-hover text-white px-4 py-2 rounded-lg">
                ❤️{arg.love||0}
              </button>
              <button 
              onClick={()=>argumentReaction(arg.id,"laugh")}
              className="bg-brand-secondary hover:bg-brand-secondary-hover text-white px-4 py-2 rounded-lg">
                😂{arg.laugh||0}
              </button>
              <button 
              onClick={()=>argumentReaction(arg.id,"wow")}
              className="bg-brand-secondary hover:bg-brand-secondary-hover text-white px-4 py-2 rounded-lg">
                🤯{arg.wow||0}
              </button>
              <button 
              onClick={()=>argumentReaction(arg.id,"clap")}
              className="bg-brand-secondary hover:bg-brand-secondary-hover text-white px-4 py-2 rounded-lg">
                👏{arg.clap||0}
              </button>

            </div>

            <div className="flex justify-center gap-4 mt-4 mb-5">

            <button
              onClick={() =>
                handleVote(arg, "up")
              }
              className="bg-brand-purple-medium hover:bg-brand-purple-medium-hover text-white px-4 py-2 rounded-lg mr-2"
            >
              👍 Upvote
            </button>

            <button
              onClick={() =>
                handleVote(arg, "down")
              }
              className="bg-brand-purple-medium hover:bg-brand-purple-medium-hover text-white px-4 py-2 rounded-lg"
            >
              👎 Downvote
            </button>
            </div>

            <div className="flex flex-col items-center gap-3 mt-5">

            <button
            className="bg-brand-purple-medium hover:bg-brand-purple-medium-hover text-white px-4 py-2 rounded-lg mx-2"
            onClick={()=>{
              setEditingId(arg.id);
              setEditiedText(arg.argument);
            }}>EDIT</button>


            <button
             className="bg-brand-purple-medium hover:bg-brand-purple-medium-hover text-white px-4 py-2 rounded-lg mx-2" 
            onClick={()=>deleteArgument(arg)}>
              Delete Argument
            </button>

            {/* <button
            onClick={deleteDebate}
            className="bg-brand-purple-medium hover:bg-brand-purple-medium-hover text-white px-5 py-2 rounded-lg"
          >
            Delete Debate
          </button> */}
            </div>

            

            <textarea 
            className="w-full bg-brand-bg border border-brand-input-border rounded-lg p-3 mt-4"
            placeholder="Write a reply...."
            value={replyTexts[arg.id]||""}
            onChange={(e)=>setReplyTexts({
              ...replyTexts,
              [arg.id]:e.target.value,
            })}/>

            <button onClick={()=>submitReply(arg.id)}
            className="bg-brand-purple hover:bg-brand-purple-dark text-white px-4 py-2 rounded-lg mt-2">
              REPLY</button>
          
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

            <button 
            className="bg-brand-purple hover:bg-brand-purple-dark text-white px-5 py-2 rounded-lg mt-4"
            onClick={handleShare}>
              SHARE DEBATE
            </button>
          </div>
        ))
        
      )}

            <button
              onClick={RaiseHand}
              className="bg-brand-purple hover:bg-brand-purple-dark text-white px-6 py-3 rounded-lg font-semibold"
              >
              🤚 Raise Hand
              </button>

            <h3 className="mt-4"> 🎤 Active Speaker:
              {activeSpeaker||"None"}
            </h3>

            <button onClick={approveSpeaker}
             className="bg-brand-purple hover:bg-brand-purple-dark text-white px-4 py-2 rounded-lg mx-2">
              Approved the Next Speaker
            </button>

            {debateEnded && (
              <div className=" bg-brand-bg border border-brand-border rounded-xl p-6 mt-6">
               <div className="text-brand-navy text-3xl font-bold mb-5">
                🏆 Vote Winner
              </div>
               
               <div className="flex justify-center gap-4 mt-5">
                <button
                onClick={()=>voteWinner("support")}
                className="bg-brand-purple hover:bg-brand-purple-dark text-white px-6 py-3 rounded-lg">
                  Team support ({teamvote.support})
                </button>

                <button
                onClick={()=>voteWinner("oppose")}
                className="bg-brand-purple hover:bg-brand-purple-dark text-white px-6 py-3 rounded-lg">
                  Team Oppose ({teamvote.oppose})
                </button>

                <button
                onClick={()=>voteWinner("neutral")}
                className="bg-brand-purple hover:bg-brand-purple-dark text-white px-6 py-3 rounded-lg">
                  Neutral ({teamvote.neutral})
                </button>
              </div>
              </div>
            )}

            {debateEnded && (

            <div className="bg-yellow-950/40 border border-yellow-600/50 rounded-xl py-3 px-5 mt-6 mb-8">
              <div className="text-3xl font-bold text-brand-navy">
                🏆 Winner
              </div>

              <p className="text-2xl font-bold text-green-500 mt-3">
                {
                  teamvote.support+teamvote.oppose+teamvote.neutral === 0
                  ? "No votes yet": getWinner()}
              </p>
            </div>
            )}

      
      <div className="bg-purple-950/30 border border-brand-border rounded-xl p-6 mb-10">
      <h2>Debate statistics</h2>

      <p>Total Arguments:{argumentsList.length}</p>
      <p> Total Votes:{totalVotes}</p>
      <p>Total Replies:{totalReplies}</p>
      <p>Total Messages:{totalMessages}</p>

      </div>

      {topArgument && (
        <>
        <h2>🏆Top Arguments</h2>

        <p>{topArgument.argument}</p>

        <p>
          <strong> Votes:{topArgument.votes}</strong>{" "}

          </p>
        </>
      )}


      <h2 className="text-4xl text-green-400 font-bold text-center mt-8">
        Winner: {calculateWinner()}
      </h2>

      <h2> ⌛ Debate ends in -{debateTimeLeft}</h2>
    </div>
  );
}


export default DebateRoom;