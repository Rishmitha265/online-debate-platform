//DebateRoom.jsx

import { useState, useEffect,useRef} from "react";
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
  const [showVideoCall,setShowVideoCall]=useState(false);
  const [message,setMessage]=useState("");
  const [messages,setMessages]=useState([]);
  const [SpeakerTimeLeft,setSpeakerTimeLeft]=useState(0);
  const [debateTimeLeft,setDebateTimeLeft]=useState("");
  const [replyTexts,setReplyTexts]=useState({});
  const [replies,setReplies]=useState([]);
  const [editingId,setEditingId]=useState(null);
  const [editedText,setEditiedText]=useState("");
  const [speakerQueue,setSpeakerQueue]=useState([]);
  const [activeSpeaker,setActiveSpeaker]=useState("");
  const [viewCount,setViewCount]=useState(0);
  const [debateEnded,setDebateEnded]=useState(false);
  const [teamvote,setTeamVote]=useState({Support:0,Oppose:0,neutral:0});
  const [supportCount, setSupportCount] = useState(0);
  const [opposeCount, setOpposeCount] = useState(0);
  const [isActiveSpeaker, setIsActiveSpeaker] = useState(false);
  const alertRef=useRef(false);



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
  const debateSnap = await getDoc(debateRef);

  if (debateSnap.exists() && debateSnap.data().ended) {
    return; // debate already closed — don't alert here, just don't add as viewer
  }

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

  useEffect(() => {

    if (
        !activeSpeaker ||
        activeSpeaker === "" ||
        activeSpeaker !== auth.currentUser?.email
    ){
        alertRef.current = false;
        return;
    }

    if (SpeakerTimeLeft === 120) {
        alertRef.current = false;
    }

    if (SpeakerTimeLeft === 0 && !alertRef.current) {

        alertRef.current = true;

        alert("Your speaking time is completed");

        setArgument("");

        setTimeout(() => {
            approveSpeaker();
        },500);

        return;
    }
    if (SpeakerTimeLeft <= 0) return;

    const timer = setTimeout(() => {
        setSpeakerTimeLeft(prev => prev - 1);
    },1000);

    return () => clearTimeout(timer);

}, [SpeakerTimeLeft, activeSpeaker]);


 useEffect(() => {

   if (!debate?.started) {
    setDebateTimeLeft("Not Started Yet");
    return;
  }

  if (debate.ended) {
    setDebateTimeLeft("Debate Closed");
    setDebateEnded(true);
    return;
  }


  const end = debate.endTime.toDate().getTime();

  const timer = setInterval(async () => {

    const now = Date.now();

    const distance = end - now;

    if (distance <= 0) {

      clearInterval(timer);

      setDebateTimeLeft("Debate Closed");

      setDebateEnded(true);

       await updateDoc(doc(db, "debates", id), {
        ended: true,
      });

      return;
    }

    const minutes = Math.floor(distance / (1000 * 60));

    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    setDebateTimeLeft(
      `${String(minutes).padStart(2,"0")}:${String(seconds).padStart(2,"0")}`
    );

  },1000);

  return ()=>clearInterval(timer);

},[debate,id]);


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
        console.log("ended =", data.ended);
        console.log("endTime =", data.endTime?.toDate());
        console.log("started =", data.started);
        setDebateEnded(data.ended || false);
        setTeamVote({
          support: data.supportVotes || 0,
          oppose: data.opposeVotes || 0,
          neutral: data.neutralVotes || 0,
        });

        setSpeakerQueue(data.speakerQueue || []);
        setActiveSpeaker(data.activeSpeaker || "");
        setViewCount(data.viewers?.length ||0);

        if (data.activeSpeaker && data.speakerStartTime) {
          const startedAt = data.speakerStartTime.toDate().getTime();
          const elapsedSeconds = Math.floor((Date.now() - startedAt) / 1000);

           const remaining = 120 - elapsedSeconds;

         setSpeakerTimeLeft(remaining > 0 ? remaining : 0);
        } 
    }
});

    } catch (error) {
      console.log(error);
    }
  };

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

  const submitArgument = async () => {
  const user = auth.currentUser;

  if(activeSpeaker !== auth.currentUser.email){
    alert("wait untill the moderator approves your turn")
  }

  if(SpeakerTimeLeft<=0){
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
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#07070d] text-white">
        <h2 className="text-2xl font-semibold bg-gradient-to-r from-fuchsia-300 to-purple-300 bg-clip-text text-transparent">
          Loading...
        </h2>
      </div>
    );
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

const joinLiveDebate=async()=>{

  if(!side){
    alert("please choose your side");
    return;
  }

  const debateRef = doc(db, "debates", id);
  const debateSnap = await getDoc(debateRef);
  const debateData = debateSnap.data();

  if (!debateData.started || debateData.ended) {

    await updateDoc(debateRef, {
      started: true,
      ended: false,
      endTime: new Date(Date.now() + 20 * 60 * 1000),
    });

  }
  setShowVideoCall(true);
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

  if (!auth.currentUser) {
    alert("Please login first.");
    return;
  }

  // Check whether the user selected a side
  if (!side) {
    alert("Please choose your side before raising your hand.");
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

    const debateRef = doc(db,"debates",id);

    if (speakerQueue.length === 0) {

        await updateDoc(debateRef, {
            activeSpeaker: "",
            speakerStartTime: null,
        });

        setActiveSpeaker("");
        return;
    }

    const nextSpeaker = speakerQueue[0];

    const updates = {
        activeSpeaker: nextSpeaker,
        speakerQueue: speakerQueue.slice(1),
        speakerStartTime: new Date(),
    };

    if (!debate.started) {
        updates.started = true;
    }

    await updateDoc(debateRef, updates);

    setActiveSpeaker(nextSpeaker);
    setSpeakerQueue(speakerQueue.slice(1));
    setSpeakerTimeLeft(120);
};

const approveSpeaker = async () => {
  await moveToNextSpeaker();
};

const voteWinner=async(team)=>{

  if(!debate?.ended){
    alert("voting starts only after the debate is completed");
    return;
  }
  try{

    if(!auth.currentUser)
      {
        alert("Debate is still running.")
        return;}

    const email = auth.currentUser.email;

    const q=query(collection(db,"winnerVotes"),
  where("debateId","==",id),
  where("userEmail","==",email));

  const snapshot = await getDocs(q);

  if(!snapshot.empty){
    alert("you have already voted");
    return;
  }


  await addDoc(collection(db,"winnerVotes"),{
    debateId:id,
    userEmail:email,
    team,
    createdAt: new Date(),
  });

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
    orderBy("raisedAt"),
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
  await moveToNextSpeaker();
}


const inputClass = "w-full p-4 rounded-xl bg-white/5 backdrop-blur border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-fuchsia-500/50 focus:border-fuchsia-500/40 transition mb-4";
const primaryBtn = "bg-gradient-to-r from-purple-600 via-fuchsia-500 to-blue-500 hover:from-purple-500 hover:via-fuchsia-400 hover:to-blue-400 text-white px-6 py-3 rounded-xl font-semibold shadow-[0_10px_30px_-8px_rgba(217,70,239,0.6)] transition-all";
const secondaryBtn = "bg-white/10 hover:bg-white/15 border border-white/15 text-white px-4 py-2 rounded-xl backdrop-blur transition-all";



  return (
    <div className="min-h-screen bg-[radial-gradient(...)] bg-[#07070d] text-white px-4 py-6 sm:px-6 lg:px-8">
      <PageNavigator/>

      <div className="max-w-5xl mx-auto w-full">

        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-center mb-8 bg-gradient-to-r from-purple-400 via-fuchsia-400 to-blue-400 bg-clip-text text-transparent">
          Debate Room
        </h1>

        <div className="mt-4 mb-6">
          <h2 className="text-xl font-semibold text-white/80">
             👥 {viewCount} Watching
          </h2>
        </div>

         <h3 className="mb-4 text-xl font-semibold text-white/90">Choose Your Side</h3>
        <div className="flex flex-col sm:flex-row justify-center gap-4 mt-4 mb-6">
          <button
            onClick={() => chooseSide("Support")}
           className={`${primaryBtn} w-full sm:w-auto`}
          >
            Support
          </button>

          <button
            onClick={() => chooseSide("Oppose")}
            className={`${primaryBtn} w-full sm:w-auto`}
          >
            Oppose
          </button>
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 mb-6 shadow-[0_20px_60px_-20px_rgba(168,85,247,0.35)]">
          <h2 className="text-3xl font-bold mb-3 bg-gradient-to-r from-fuchsia-300 to-purple-300 bg-clip-text text-transparent">
            {debate.title}
          </h2>
          <p className="text-white/70">{debate.description}</p>
        </div>

        {!showVideoCall ? (
          <div className="flex flex-wrap justify-center gap-6 mt-8">
            <button
                onClick={joinLiveDebate}
                className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white w-full sm:w-auto px-8 py-3 rounded-xl font-semibold shadow-[0_10px_30px_-8px_rgba(16,185,129,0.6)] transition-all"
            >
                🎥 Join Live Debate
            </button>


          </div>
        ) : (
          <VideoCall />
        )}


        <p className="text-white/80">
          <strong className="text-fuchsia-300">Your Side:</strong> {side}
        </p>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 sm:p-6 mb-8 mt-6 shadow-lg">
          <h3 className="font-bold text-xl bg-gradient-to-r from-fuchsia-300 to-purple-300 bg-clip-text text-transparent">
            👥 Participants
          </h3>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mt-6 text-center">
            <h2 className="text-2xl font-bold">
              🕒 Debate Time Remaining
            </h2>

            <p className="text-4xl font-bold text-fuchsia-300 mt-3">
              {debateTimeLeft}
            </p>
          </div>

          <p className="mt-2 text-emerald-300 font-semibold">
            Support: {supportCount}
          </p>

          <p className="text-rose-300 font-semibold">
            Oppose: {opposeCount}
          </p>
        </div>

        {activeSpeaker === auth.currentUser?.email ? (

          <>
            <div className="text-center mt-5 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 sm:p-6 mb-6">

              <h3 className="font-bold text-xl mt-2 text-white/90">
                ⏰ Time Remaining
              </h3>
              <p className="text-white/60">timeLeft:{SpeakerTimeLeft}</p>
              <p className="text-4xl font-extrabold mt-2 bg-gradient-to-r from-rose-400 to-fuchsia-400 bg-clip-text text-transparent">
                {String(Math.floor(SpeakerTimeLeft/60)).padStart(2,"0")}:
                {String(SpeakerTimeLeft%60).padStart(2,"0")}
              </p>

              <div className="mt-4">
                {speakerQueue.length===0?(
                  <p className="text-white/60">No user in queue</p>
                ):(
                  speakerQueue.map((email,index)=>(
                    <p key={index} className="text-white/70">
                      {index+1}.{email}
                    </p>
                  ))
                )}
              </div>

            </div>

            <textarea              
              rows={4}
              className={inputClass}
              placeholder="Enter your argument..."
              value={argument}
              onChange={(e) => setArgument(e.target.value)}
            />

            <div className="text-center mt-5">
              <button
                onClick={submitArgument}
                className={`${primaryBtn} w-full sm:w-auto`}
              >
                Post Argument
              </button>
            </div>
          </>

        ) : (

          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-2xl p-4 mt-5 backdrop-blur">
            <p className="text-yellow-200 font-semibold">
              ⏳ Wait until you become the active speaker to post your argument.
            </p>
          </div>

        )}

        <h2 className="text-2xl font-bold mt-10 mb-4 bg-gradient-to-r from-fuchsia-300 to-blue-300 bg-clip-text text-transparent">Chat Room</h2>

        {messages.length === 0 ? (
          <p className="text-white/60">NO MESSAGES YET</p>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 mb-3 shadow-lg"
            >
              <strong className="text-fuchsia-300">{msg.userEmail}</strong>
              <p className="text-white/85 mt-1">{msg.message}</p>
            </div>
          ))
        )}

        <textarea
          placeholder="Type a message"
          className={inputClass}
          value={message}
          onChange={(e)=>setMessage(e.target.value)}/>

        <button
            onClick={sendMessage}
            className={`${primaryBtn} w-full sm:w-auto mb-8`}>
          Send
        </button>

         <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-6">
          <button
            onClick={RaiseHand}
            className={`${primaryBtn} w-full sm:w-auto`}
            >
            🤚 Raise Hand
          </button>

          <button onClick={approveSpeaker}
            className={`${secondaryBtn} w-full sm:w-auto`}>
            Approved the Next Speaker
          </button>

          <h3 className="text-white/85">
            🎤 Active Speaker:{" "}
            <span className="text-fuchsia-300 font-semibold">
              {activeSpeaker||"None"}
            </span>
          </h3>


        </div>


        <h2 className="text-2xl font-bold mt-4 mb-4 bg-gradient-to-r from-fuchsia-300 to-blue-300 bg-clip-text text-transparent">Information</h2>

        {argumentsList.length === 0 ? (
          <p className="text-white/60">No arguments yet.</p>
        ) : (
          argumentsList.map((arg) => (
            <div
              key={arg.id}
              className="relative overflow-hidden bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-[0_20px_60px_-20px_rgba(168,85,247,0.35)] p-4 sm:p-6 mb-6 text-white"
            >
              <div className="absolute -top-16 -right-16 w-40 h-40 rounded-full bg-fuchsia-500/10 blur-3xl pointer-events-none" />

              <p className="relative">
                <strong className="text-fuchsia-300">Posted By:</strong> {arg.userEmail}
              </p>
              <p className="relative">
                <strong className="text-fuchsia-300">Side:</strong>{" "}
                {arg.side}
              </p>

              {editingId === arg.id ? (
                <>
                  <textarea
                    value={editedText}
                    onChange={(e) =>
                      setEditedText(e.target.value)
                    }
                    className={`${inputClass} mt-3`}
                  />
                  <div className="flex justify-center mt-4">
                    <button
                      onClick={()=>updateArgument(arg.id)}
                      className={`${primaryBtn} w-full sm:w-auto`}>
                      Save
                    </button>
                  </div>
                </>
              ) : (
                <p className="relative text-white/85 mt-2">{arg.argument}</p>
              )}

              <p className="relative mt-3">
                <strong className="text-fuchsia-300">Votes:</strong>{" "}
                {arg.votes||0}
              </p>


              <h4 className="relative mt-4 font-semibold text-white/90">Replies</h4>

              {replies.filter(
                (reply)=>reply.argumentId === arg.id
              )
              .map((reply)=>(
                <div
                key={reply.id}
                className="relative ml-5 mt-2 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white/80"
                >
                  {reply.reply}
                </div>
              ))}

              <div className="relative grid grid-cols-2 sm:flex sm:flex-wrap justify-center gap-3 mt-6">
                <button
                onClick={()=>argumentReaction(arg.id,"like")}
                className={`${secondaryBtn} w-full sm:w-auto`}>
                  👍{arg.like||0}
                </button>
                <button
                onClick={()=>argumentReaction(arg.id,"love")}
                className={`${secondaryBtn} w-full sm:w-auto`}>
                  ❤️{arg.love||0}
                </button>
                <button
                onClick={()=>argumentReaction(arg.id,"laugh")}
                className={`${secondaryBtn} w-full sm:w-auto`}>
                  😂{arg.laugh||0}
                </button>
                <button
                onClick={()=>argumentReaction(arg.id,"wow")}
                className={`${secondaryBtn} w-full sm:w-auto`}>
                  🤯{arg.wow||0}
                </button>
                <button
                onClick={()=>argumentReaction(arg.id,"clap")}
               className={`${secondaryBtn} w-full sm:w-auto`}>
                  👏{arg.clap||0}
                </button>
              </div>

              <div className="relative flex flex-col sm:flex-row justify-center gap-4 mt-6">
                <button
                  onClick={() => handleVote(arg, "up")}
                  className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white px-4 py-2 rounded-xl shadow-[0_8px_25px_-8px_rgba(16,185,129,0.6)] transition-all"
                >
                  👍 Upvote
                </button>

                <button
                  onClick={() => handleVote(arg, "down")}
                  className="bg-gradient-to-r from-rose-500 to-red-500 hover:from-rose-400 hover:to-red-400 text-white px-4 py-2 rounded-xl shadow-[0_8px_25px_-8px_rgba(244,63,94,0.6)] transition-all"
                >
                  👎 Downvote
                </button>
              </div>

              <div className="relative flex flex-col items-center gap-3 mt-5">
                <button
                  className={`${secondaryBtn} w-full sm:w-auto`}
                  onClick={()=>{
                    setEditingId(arg.id);
                    setEditiedText(arg.argument);
                  }}>EDIT</button>

                <button
                  className="bg-gradient-to-r from-rose-500 to-red-500 hover:from-rose-400 hover:to-red-400 text-white px-4 py-2 rounded-xl shadow-[0_8px_25px_-8px_rgba(244,63,94,0.6)] transition-all"
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
                className={`${inputClass} mt-4`}
                placeholder="Write a reply...."
                value={replyTexts[arg.id]||""}
                onChange={(e)=>setReplyTexts({
                  ...replyTexts,
                  [arg.id]:e.target.value,
                })}/>

              <button onClick={()=>submitReply(arg.id)}
              className={`${primaryBtn} w-full sm:w-auto`}>
                REPLY
              </button>

              <h2 className="relative mt-6 text-xl font-bold bg-gradient-to-r from-fuchsia-300 to-blue-300 bg-clip-text text-transparent">Achievements</h2>

              <p className="relative text-white/85">
                <strong className="text-fuchsia-300">Badge:</strong> {getAchievement()}
              </p>

              <p className="relative text-white/85">
                <strong className="text-fuchsia-300">Arguments Posted:</strong> {totalArguments}
              </p>

              <p className="relative text-white/85">
                <strong className="text-fuchsia-300">Votes Received:</strong> {totalVotesReceived}
              </p>

              <button
                className={`${primaryBtn} mt-4`}
                onClick={handleShare}>
                SHARE DEBATE
              </button>
            </div>
          ))

        )}



        {debateEnded && (
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 mt-6">
            <div className="text-3xl font-bold mb-5 bg-gradient-to-r from-yellow-300 to-fuchsia-300 bg-clip-text text-transparent">
              🏆 Vote Winner
            </div>

            <div className="flex flex-wrap justify-center gap-4 mt-5">
              <button
              onClick={()=>voteWinner("support")}
              className={`${primaryBtn} min-w-[180px]`}>
                Team support ({teamvote.support})
              </button>

              <button
              onClick={()=>voteWinner("oppose")}
              className={`${primaryBtn} min-w-[180px]`}>
                Team Oppose ({teamvote.oppose})
              </button>

              <button
              onClick={()=>voteWinner("neutral")}
              className={`${primaryBtn} min-w-[180px]`}>
                Neutral ({teamvote.neutral})
              </button>
            </div>
          </div>
        )}

        {debateEnded && (teamvote.support + teamvote.oppose + teamvote.neutral > 0) && (
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-2xl py-4 px-6 mt-6 mb-8 backdrop-blur">
            <div className="text-3xl font-bold bg-gradient-to-r from-yellow-300 to-fuchsia-300 bg-clip-text text-transparent">
              🏆 Winner
            </div>

            <p className="text-2xl font-bold text-emerald-300 mt-3">
              {getWinner()}
            </p>
          </div>
        )}


        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 sm:p-6 mb-10 mt-6 shadow-lg">
          <h2 className="text-2xl font-bold mb-3 bg-gradient-to-r from-fuchsia-300 to-blue-300 bg-clip-text text-transparent">Debate statistics</h2>

          <p className="text-white/80">Total Arguments: {argumentsList.length}</p>
          <p className="text-white/80"> Total Votes: {totalVotes}</p>
          <p className="text-white/80">Total Replies: {totalReplies}</p>
          <p className="text-white/80">Total Messages: {totalMessages}</p>
        </div>

        {topArgument && (
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 mb-6">
            <h2 className="text-2xl font-bold mb-3 bg-gradient-to-r from-yellow-300 to-fuchsia-300 bg-clip-text text-transparent">🏆Top Arguments</h2>

            <p className=" text-center sm:text-left text-white/85">{topArgument.argument}</p>

            <p className="mt-2">
              <strong className="text-fuchsia-300"> Votes:{topArgument.votes}</strong>{" "}
            </p>
          </div>
        )}

         {debateEnded &&(
        <h2 className="text-4xl font-extrabold text-center mt-8 bg-gradient-to-r from-emerald-300 to-teal-300 bg-clip-text text-transparent">
          Winner: {calculateWinner()}
        </h2>
         )}

      </div>
    </div>
  );
}


export default DebateRoom;