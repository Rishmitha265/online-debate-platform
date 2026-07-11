import { FaMicrophone, FaMicrophoneSlash, FaVideo, FaVideoSlash, FaPhoneSlash } from "react-icons/fa";
import { useState,useEffect,useRef } from "react";
import {addDoc,collection,doc,onSnapshot,updateDoc,setDoc,getDoc,serverTimestamp,query,where,deleteDoc} from "firebase/firestore";
import {db} from"../services/firebase";
import { useParams } from "react-router-dom";
import {getAuth} from "firebase/auth";

function VideoCall() {

  const [micOn, setMicOn] = useState(true);
  const [cameraOn, setCameraOn] = useState(true);
  const localVideoRef=useRef(null);
  const remoteVideo=useRef(null);
  const peerConnectionRef=useRef(null);
  const [localStream,setLocalStream]=useState(null);
  const [remoteConnected,setRemoteConnected]=useState(false);
  const {id: debateId} = useParams();
  const [isActiveSpeaker, setIsActiveSpeaker] = useState(false);
  const [isRecording,setIsRecording]=useState(false);
  const [recordedChunks,setRecordedChunks]=useState([]);
  const mediaRecorderRef=useRef(null);

  useEffect(()=>{
    startCamera();
  },[]);

  useEffect(()=>{
    const auth = getAuth();
    if(!auth.currentUser) return;

    const q=query(collection(db,"activespeaker"),
  where("debateId","==",debateId));

  const unsubscribe=onSnapshot(q,(snapshot)=>{
    if(snapshot.empty){
      setIsActiveSpeaker(false);
      return;
    }

    const speaker=snapshot.docs[0].data();
    setIsActiveSpeaker(speaker.uid===auth.currentUser.uid);
  });
  return()=>unsubscribe();
},[debateId]);


  const startCamera = async()=>{
    try{

        console.log("Starting camera...")
        const stream = await navigator.mediaDevices.getUserMedia({
            video:true,
            audio:true,
        });
        
        console.log("camera started",stream);

        setLocalStream(stream);

        if(localVideoRef.current){
            localVideoRef.current.srcObject=stream;
        }
    }catch(error){
        console.log(error);
        alert(error.message);
    }
  }

  const servers ={
    iceServers:[{
        urls:[ "stun:stun.l.google.com:19302", //stun-STUN helps users find each other over the internet.

        ],
    },
],
  };

  const createPeerConnection=()=>{
    const peer = new RTCPeerConnection(servers);//create empty webRTC connection
    
    peer.oniceconnectionstatechange = () => {
        console.log("ICE State:", peer.iceConnectionState);
      };

      peer.onconnectionstatechange = () => {
        console.log("Connection State:", peer.connectionState);
      };
    peerConnectionRef.current=peer;

    if(localStream){
        localStream.getTracks().forEach(track => {
      peer.addTrack(track, localStream);
    });
  }

    peer.ontrack = (event) => {
      console.log("Remote stream received!")

      if(remoteVideo.current){
        remoteVideo.current.srcObject = event.streams[0]; //opponet camera appear
      }
      setRemoteConnected(true);
    };

  return peer;
}

  // offerer side (the person starting the call)
  const createOffer = async () => {

  console.log("start call button clicked");
  const peer = createPeerConnection();

  const callDocRef = doc(db, "calls", debateId);

  const offerCandidates = collection(callDocRef, "offerCandidates");
  const answerCandidates = collection(callDocRef, "answerCandidates");

  peer.onicecandidate = async (event) => {          //Whenever WebRTC finds a network path, it automatically runs:peer.onicecandidate
    if (event.candidate) {
      await addDoc(offerCandidates, event.candidate.toJSON());
    }
  };

  const offer = await peer.createOffer();
  console.log("Offer created:",offer);

  await peer.setLocalDescription(offer);

  await setDoc(callDocRef, {
    offer: {
      type: offer.type,
      sdp: offer.sdp,
    },
  });

  console.log("offer saved to firebase")

  onSnapshot(callDocRef, (snapshot) => {

  const data = snapshot.data();

    if (
      data?.answer &&
      !peer.currentRemoteDescription
    ) {
      peer.setRemoteDescription(
        new RTCSessionDescription(data.answer)
      );
    }
  });

  console.log(callDocRef.id);

  onSnapshot(answerCandidates,(snapshot)=>{
    snapshot.docChanges().forEach((change)=>{
      if(change.type === "added"){
        const candidate=new RTCIceCandidate(change.doc.data());
        peer.addIceCandidate(candidate);
      }
    })
  })

};
 const createAnswer = async (callId) => {

  const peer = createPeerConnection();

  const callDocRef = doc(db, "calls", callId);

  const callData = (await getDoc(callDocRef)).data();

  const offerCandidates = collection(callDocRef, "offerCandidates");

  const answerCandidates = collection(callDocRef, "answerCandidates");

  const stream =
    await navigator.mediaDevices.getUserMedia({

      video: true,
      audio: true,

    });

  localVideoRef.current.srcObject = stream;
  setLocalStream(stream);

  stream.getTracks().forEach((track) => {

    peer.addTrack(track, stream);

  });

  peer.onicecandidate = async (event) => {
    if (event.candidate) {
      await addDoc(answerCandidates, event.candidate.toJSON());
    }
  };

  await peer.setRemoteDescription(
    new RTCSessionDescription(callData.offer)  //Read offer
  );

  const answer =
    await peer.createAnswer();

  await peer.setLocalDescription(answer);

  await updateDoc(callDocRef, {
    answer: {
      type: answer.type,
      sdp: answer.sdp,
    },
  });

  onSnapshot(offerCandidates,(snapshot)=>{

    snapshot.docChanges().forEach((change)=>{

        if(change.type==="added"){

            peer.addIceCandidate(

                new RTCIceCandidate(
                    change.doc.data()
                )

            );

        }

    });

});

};

  // answerer side (the person joining an existing call)
 const joinCall = async () => {
  console.log("Join Call button clicked");

  const callDocRef = doc(db, "calls", debateId);

  const answerCandidates = collection(callDocRef, "answerCandidates");
  const offerCandidates = collection(callDocRef, "offerCandidates");

  const callSnapshot = await getDoc(callDocRef);

  if (!callSnapshot.exists()) {
    alert("No active call found.");
    return;
  }

  const callData = callSnapshot.data();

  if (!callData.offer) {
    alert("Offer not found.");
    return;
  }

  const peer = createPeerConnection();

  // Send ICE candidates to Firebase
  peer.onicecandidate = async (event) => {
    if (event.candidate) {
      await addDoc(answerCandidates, event.candidate.toJSON());
    }
  };

  // Receive remote stream
  peer.ontrack = (event) => {
    console.log("Remote stream received!");

    if (remoteVideo.current) {
      remoteVideo.current.srcObject = event.streams[0];
    }

    setRemoteConnected(true);
  };

  // Read Offer
  await peer.setRemoteDescription(
    new RTCSessionDescription(callData.offer)
  );

  console.log("Offer received");

  // Create Answer
  const answer = await peer.createAnswer();

  console.log("Answer created");

  // Set Local Description
  await peer.setLocalDescription(answer);

  console.log("Local description set");

  // Save Answer
  await updateDoc(callDocRef, {
    answer: {
      type: answer.type,
      sdp: answer.sdp,
    },
  });

  console.log("Answer saved");

  // Listen for Offer ICE Candidates
  onSnapshot(offerCandidates, (snapshot) => {
    snapshot.docChanges().forEach((change) => {
      if (change.type === "added") {
        const candidate = new RTCIceCandidate(change.doc.data());
        peer.addIceCandidate(candidate);
      }
    });
  });

  console.log("Joined call successfully");
};

  const toggleCamera=()=>{
    if(localStream){
        localStream.getVideoTracks().forEach(track=>{
            track.enabled=!track.enabled;
        });
    }
    setCameraOn(!cameraOn);
  }

   const toggleMic=()=>{
    if(localStream){
        localStream.getAudioTracks().forEach(track=>{
            track.enabled=!track.enabled;
        });
    }
    setMicOn(!micOn);
  }

const endCall = () => {

    if(localStream){

        localStream.getTracks().forEach((track)=>{
            track.stop();
        });

    }

    if(peerConnectionRef.current){
        peerConnectionRef.current.close();
        peerConnectionRef.current = null;
    }

    if(localVideoRef.current){
        localVideoRef.current.srcObject = null;
    }

    if(remoteVideo.current){
        remoteVideo.current.srcObject = null;
    }

    setRemoteConnected(false);

    setCameraOn(true);
    setMicOn(true);

    alert("Call Ended");
};

const startRecording=async()=>{
  let displayStream;

try{

displayStream =
await navigator.mediaDevices.getDisplayMedia({

video:true,

audio:true,

});

}catch{

alert("Screen sharing cancelled");

return;

}

const mediaRecorder = new MediaRecorder(displayStream);
  mediaRecorderRef.current=mediaRecorder;

  const chunks=[];

  mediaRecorder.ondataavailable=(event)=>{
    if(event.data.size>0){
      chunks.push(event.data);
    }
  };

  mediaRecorder.onstop=()=>{
    setRecordedChunks(chunks);
  };
  mediaRecorder.start();

  displayStream.getVideoTracks()[0].onended = () => {

if(mediaRecorder.state !== "inactive"){

mediaRecorder.stop();

}

setIsRecording(false);

};
  setIsRecording(true);
  alert("Recording started");
}

const stopRecording = () => {

if(!mediaRecorderRef.current) return;

if(mediaRecorderRef.current.state !== "inactive"){

mediaRecorderRef.current.stop();

}

setIsRecording(false);

};

const downloadRecording=()=>{
  if(recordedChunks.length===0){
    alert("No Recording Found");
    return;
  }

  const blob=new Blob(recordedChunks,{
    type:"video/webm",
  });

  const url=URL.createObjectURL(blob);

  const a =document.createElement("a");

  a.href=url;
  a.download="DebateRecording.webm";
  a.click();
  URL.revokeObjectURL(url);
};


  return (
    <div className="w-full bg-white rounded-2xl shadow-lg p-6 mt-8">

      
      <div className="text-2xl font-bold tex-gray text-center text-slate-800 mb-6">
        🎥 Live Debate Room
      </div>

      <div className="text-center mb-5">
      {remoteConnected ? (
        <span className="text-green-600 font-bold text-lg">
          🟢 Opponent Connected
        </span>
      ) : (
        <span className="text-yellow-500 font-bold text-lg">
          🟡 Waiting for Opponent...
        </span>
      )}
    </div>

      {/* Video Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            
           <div className="relative bg-gray-900 rounded-xl h-72 overflow-hidden">

                    <video
                        ref={remoteVideo}
                        autoPlay
                        playsInline
                        className="w-full h-full object-cover"
                    />

                   {!remoteConnected && (
                      <div className="absolute inset-0 flex items-center justify-center text-white text-xl font-bold">
                          Waiting for Opponent...
                      </div>
                  )}

                </div>

            {/* Your Video */}
            <div className="relative bg-gray-900 rounded-xl h-72 overflow-hidden">

                    <video
                        ref={localVideoRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-full h-full object-cover"
                    />

                    {!localStream && (
                        <div className="absolute inset-0 flex items-center justify-center text-white text-xl font-bold">
                            Your Camera
                        </div>
                    )}

                </div>

</div>

     
      <div className="flex justify-center gap-5 mt-8">

        
        <button
          onClick={toggleMic}
          className={`p-4 rounded-full text-white ${
            micOn ? "bg-green-600" : "bg-red-600"
          }`}
        >
          {micOn ? <FaMicrophone size={22} /> : <FaMicrophoneSlash size={22} />}
        </button>

        <button
          onClick={toggleCamera}
          className={`p-4 rounded-full text-white ${
            cameraOn ? "bg-blue-600" : "bg-red-600"
          }`}
        >
          {cameraOn ? <FaVideo size={22} /> : <FaVideoSlash size={22} />}
        </button>

        {/* End Call */}
        <button
        onClick={endCall}
        className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-full flex items-center gap-2">
        
        <FaPhoneSlash size={22}/>
    <span className="font-semibold">End Call</span>
        </button>

      </div>

      <div className="flex justify-center gap-4 mt-6">
        <button
          onClick={createOffer}
          className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg"
        >
          Start Call
        </button>

        <button
          onClick={joinCall}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg"
        >
          Join Call
        </button>
      </div>

      <div className="flex justify-center gap-4 mt-6">

        <button
    onClick={isRecording ? stopRecording : startRecording}
    className={`px-8 py-3 rounded-xl text-white font-semibold ${
      isRecording
        ? "bg-red-600 hover:bg-red-700"
        : "bg-red-500 hover:bg-red-600"
    }`}
  >
    {isRecording ? "Stop Sharing" : "Start Sharing"}
  </button>

  <button
    onClick={downloadRecording}
    className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-xl font-semibold"
  >
    ⬇ Download Recording
  </button>

</div>

    </div>
  );
}

export default VideoCall;