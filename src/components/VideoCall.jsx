import { FaMicrophone, FaMicrophoneSlash, FaVideo, FaVideoSlash, FaPhoneSlash } from "react-icons/fa";
import { useState, useEffect, useRef } from "react";
import { addDoc, collection, doc, onSnapshot, updateDoc, setDoc, getDoc, serverTimestamp, query, where, deleteDoc } from "firebase/firestore";
import { db } from "../services/firebase";
import { useParams } from "react-router-dom";
import { getAuth } from "firebase/auth";

function VideoCall() {
  const [micOn, setMicOn] = useState(true);
  const [cameraOn, setCameraOn] = useState(true);
  const localVideoRef = useRef(null);
  const localStreamRef = useRef(null);
  const remoteVideo = useRef(null);
  const peerConnectionRef = useRef(null);
  const [localStream, setLocalStream] = useState(null);
  const [remoteConnected, setRemoteConnected] = useState(false);
  const { id: debateId } = useParams();
  const [isActiveSpeaker, setIsActiveSpeaker] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedChunks, setRecordedChunks] = useState([]);
  const mediaRecorderRef = useRef(null);
  const [role, setRole] = useState(null);

  useEffect(() => {
    const auth = getAuth();
    if (!auth.currentUser) return;

    const q = query(
      collection(db, "activespeaker"),
      where("debateId", "==", debateId)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (snapshot.empty) {
        setIsActiveSpeaker(false);
        return;
      }
      const speaker = snapshot.docs[0].data();
      setIsActiveSpeaker(speaker.uid === auth.currentUser.uid);
    });
    return () => unsubscribe();
  }, [debateId]);

  useEffect(() => {
    return () => {
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const startCamera = async () => {
    if (localStreamRef.current) {
      return localStreamRef.current;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      localStreamRef.current = stream;
      setLocalStream(stream);
      setCameraOn(true);
      setMicOn(true);
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      return stream;
    } catch (error) {
      console.log(error);
      alert(error.message);
      return null;
    }
  };

  const servers = {
    iceServers: [{ urls: ["stun:stun.l.google.com:19302"] }],
  };

  const createPeerConnection = () => {
    const peer = new RTCPeerConnection(servers);

    peer.onconnectionstatechange = () => {
      console.log(peer.connectionState);
    };

    peerConnectionRef.current = peer;

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => {
        peer.addTrack(track, localStreamRef.current);
      });
    }

    peer.ontrack = (event) => {
      if (remoteVideo.current) {
        remoteVideo.current.srcObject = event.streams[0];
        remoteVideo.current.play();
      }
      setRemoteConnected(true);
    };

    return peer;
  };

  const createOffer = async () => {
    const peer = createPeerConnection();
    const callDocRef = doc(db, "calls", debateId);
    const offerCandidates = collection(callDocRef, "offerCandidates");
    const answerCandidates = collection(callDocRef, "answerCandidates");

    peer.onicecandidate = async (event) => {
      if (event.candidate) {
        await addDoc(offerCandidates, event.candidate.toJSON());
      }
    };

    const offer = await peer.createOffer();
    await peer.setLocalDescription(offer);

    await setDoc(callDocRef, {
      offer: { type: offer.type, sdp: offer.sdp },
    });

    const debateRef = doc(db, "debates", debateId);
    await updateDoc(debateRef, { live: true });

    alert("Live Debate shared successfully. Waiting for opponent to join...");

    onSnapshot(callDocRef, (snapshot) => {
      const data = snapshot.data();
      if (data?.answer && !peer.currentRemoteDescription) {
        peer.setRemoteDescription(new RTCSessionDescription(data.answer));
      }
    });

    onSnapshot(answerCandidates, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === "added") {
          const candidate = new RTCIceCandidate(change.doc.data());
          if (peer.remoteDescription) {
            peer.addIceCandidate(candidate);
          }
        }
      });
    });
  };

  const joinCall = async () => {
    const callDocRef = doc(db, "calls", debateId);
    const answerCandidates = collection(callDocRef, "answerCandidates");
    const offerCandidates = collection(callDocRef, "offerCandidates");

    const callSnapshot = await getDoc(callDocRef);
    if (!callSnapshot.exists()) {
      alert("No active call found. Ask the moderator to start the call first.");
      return;
    }

    const callData = callSnapshot.data();
    if (!callData.offer) {
      alert("Offer not found.");
      return;
    }

    const peer = createPeerConnection();

    peer.onicecandidate = async (event) => {
      if (event.candidate) {
        await addDoc(answerCandidates, event.candidate.toJSON());
      }
    };

    await peer.setRemoteDescription(new RTCSessionDescription(callData.offer));
    const answer = await peer.createAnswer();
    await peer.setLocalDescription(answer);

    await updateDoc(callDocRef, {
      answer: { type: answer.type, sdp: answer.sdp },
    });

    onSnapshot(offerCandidates, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === "added") {
          const candidate = new RTCIceCandidate(change.doc.data());
          if (peer.remoteDescription) {
            peer.addIceCandidate(candidate);
          }
        }
      });
    });
  };

  const handleStartCall = async () => {
    setRole("moderator");
    const stream = await startCamera();
    if (!stream) {
      alert("Could not access camera/microphone. Please allow permissions and try again.");
      setRole(null);
      return;
    }
    await createOffer();
  };

  const handleJoinCall = async () => {
    setRole("opponent");
    const stream = await startCamera();
    if (!stream) {
      alert("Could not access camera/microphone. Please allow permissions and try again.");
      setRole(null);
      return;
    }
    await joinCall();
    alert("You joined the live debate!");
  };

  const toggleCamera = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getVideoTracks().forEach((track) => {
        track.enabled = !track.enabled;
      });
    }
    setCameraOn(!cameraOn);
  };

  const toggleMic = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach((track) => {
        track.enabled = !track.enabled;
      });
    }
    setMicOn(!micOn);
  };

  const endCall = async () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
    }
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
    if (localVideoRef.current) localVideoRef.current.srcObject = null;
    if (remoteVideo.current) remoteVideo.current.srcObject = null;

    setLocalStream(null);
    setRemoteConnected(false);
    setCameraOn(true);
    setMicOn(true);
    setRole(null);

    const debateRef = doc(db, "debates", debateId);
    await updateDoc(debateRef, { live: false });

    alert("Call Ended");
  };

  const startRecording = async () => {
    let displayStream;
    try {
      displayStream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
    } catch {
      alert("Screen sharing cancelled");
      return;
    }

    const mediaRecorder = new MediaRecorder(displayStream);
    mediaRecorderRef.current = mediaRecorder;
    const chunks = [];

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) chunks.push(event.data);
    };
    mediaRecorder.onstop = () => setRecordedChunks(chunks);
    mediaRecorder.start();

    displayStream.getVideoTracks()[0].onended = () => {
      if (mediaRecorder.state !== "inactive") mediaRecorder.stop();
      setIsRecording(false);
    };
    setIsRecording(true);
    alert("Recording started");
  };

  const stopRecording = () => {
    if (!mediaRecorderRef.current) return;
    if (mediaRecorderRef.current.state !== "inactive") mediaRecorderRef.current.stop();
    setIsRecording(false);
  };

  const downloadRecording = () => {
    if (recordedChunks.length === 0) {
      alert("No Recording Found");
      return;
    }
    const blob = new Blob(recordedChunks, { type: "video/webm" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "DebateRecording.webm";
    a.click();
    URL.revokeObjectURL(url);
  };

  const localTile = (
    <div className="relative bg-black/60 border border-white/10 rounded-2xl h-72 overflow-hidden shadow-[0_10px_40px_-10px_rgba(59,130,246,0.4)]">
      <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
      {!localStream && (
        <div className="absolute inset-0 flex items-center justify-center text-white/80 text-xl font-bold text-center px-4">
          {role ? "Turning on your camera..." : "Your Camera"}
        </div>
      )}
      <span className="absolute top-3 left-3 px-2.5 py-1 rounded-md text-xs font-semibold bg-white/10 backdrop-blur border border-white/20 text-white/90">
        You{role === "moderator" ? " • Moderator" : role === "opponent" ? " • Opponent" : ""}
        {isActiveSpeaker ? " • Speaking" : ""}
      </span>
    </div>
  );

  const remoteTile = (
    <div className="relative bg-black/60 border border-white/10 rounded-2xl h-72 overflow-hidden shadow-[0_10px_40px_-10px_rgba(168,85,247,0.4)]">
      <video ref={remoteVideo} autoPlay playsInline className="w-full h-full object-cover" />
      {!remoteConnected && (
        <div className="absolute inset-0 flex items-center justify-center text-white/80 text-xl font-bold text-center px-4">
          Waiting for {role === "opponent" ? "Moderator" : "Opponent"}...
        </div>
      )}
      <span className="absolute top-3 left-3 px-2.5 py-1 rounded-md text-xs font-semibold bg-white/10 backdrop-blur border border-white/20 text-white/90">
        {role === "opponent" ? "Moderator" : "Opponent"}
      </span>
    </div>
  );

  return (
    <div className="relative w-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl shadow-[0_20px_60px_-20px_rgba(168,85,247,0.35)] p-6 mt-8 overflow-hidden">
      <div className="pointer-events-none absolute -inset-px rounded-3xl bg-gradient-to-br from-white/10 to-transparent opacity-60" />
      <div className="relative">
        <div className="text-2xl font-bold text-center mb-6 bg-gradient-to-r from-purple-300 via-fuchsia-300 to-blue-300 bg-clip-text text-transparent">
          🎥 Live Debate Room
        </div>

        <div className="text-center mb-5">
          {remoteConnected ? (
            <span className="inline-flex items-center gap-2 text-emerald-400 font-bold text-lg">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_12px_2px_rgba(52,211,153,0.7)]" />
              {role === "opponent" ? "Moderator Connected" : "Opponent Connected"}
            </span>
          ) : (
            <span className="inline-flex items-center gap-2 text-amber-300 font-bold text-lg">
              <span className="h-2.5 w-2.5 rounded-full bg-amber-300 animate-pulse shadow-[0_0_12px_2px_rgba(252,211,77,0.7)]" />
              Waiting for {role === "opponent" ? "Moderator" : "Opponent"}...
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {role === "opponent" ? (
            <>{remoteTile}{localTile}</>
          ) : (
            <>{localTile}{remoteTile}</>
          )}
        </div>

        <div className="flex justify-center gap-5 mt-8 flex-wrap">
          <button
            onClick={toggleMic}
            disabled={!localStream}
            className={`p-4 rounded-full text-white shadow-lg transition ${
              !localStream ? "bg-gray-500/50 cursor-not-allowed" :
              micOn ? "bg-gradient-to-r from-emerald-500 to-teal-500 shadow-emerald-500/40" :
              "bg-gradient-to-r from-rose-500 to-pink-600 shadow-rose-500/40"
            }`}
          >
            {micOn ? <FaMicrophone size={22} /> : <FaMicrophoneSlash size={22} />}
          </button>

          <button
            onClick={toggleCamera}
            disabled={!localStream}
            className={`p-4 rounded-full text-white shadow-lg transition ${
              !localStream ? "bg-gray-500/50 cursor-not-allowed" :
              cameraOn ? "bg-gradient-to-r from-sky-500 to-blue-600 shadow-sky-500/40" :
              "bg-gradient-to-r from-rose-500 to-pink-600 shadow-rose-500/40"
            }`}
          >
            {cameraOn ? <FaVideo size={22} /> : <FaVideoSlash size={22} />}
          </button>

          <button
            onClick={endCall}
            className="bg-gradient-to-r from-rose-500 via-pink-500 to-fuchsia-600 hover:opacity-90 text-white px-6 py-3 rounded-full flex items-center gap-2 shadow-lg shadow-rose-500/40 font-semibold"
          >
            <FaPhoneSlash size={22} />
            <span>End Call</span>
          </button>
        </div>

        <div className="flex justify-center gap-4 mt-6 flex-wrap">
          <button
            onClick={handleStartCall}
            disabled={role !== null}
            className="bg-gradient-to-r from-purple-500 via-fuchsia-500 to-blue-500 hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed text-white px-6 py-3 rounded-xl font-semibold shadow-lg shadow-fuchsia-500/40"
          >
            Start Call (Supporter)
          </button>

          <button
            onClick={handleJoinCall}
            disabled={role !== null}
            className="bg-gradient-to-r from-indigo-500 to-blue-600 hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed text-white px-6 py-3 rounded-xl font-semibold shadow-lg shadow-indigo-500/40"
          >
            Join Call (Opponent)
          </button>
        </div>

        <div className="flex justify-center gap-4 mt-6 flex-wrap">
          <button
            onClick={isRecording ? stopRecording : startRecording}
            className={`px-8 py-3 rounded-xl text-white font-semibold shadow-lg transition ${
              isRecording ? "bg-gradient-to-r from-rose-600 to-red-700 shadow-rose-500/40" :
              "bg-gradient-to-r from-rose-500 to-pink-600 shadow-rose-500/30"
            }`}
          >
            {isRecording ? "Stop Sharing" : "Start Sharing"}
          </button>

          <button
            onClick={downloadRecording}
            className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:opacity-90 text-white px-8 py-3 rounded-xl font-semibold shadow-lg shadow-emerald-500/30"
          >
            ⬇ Download Recording
          </button>
        </div>
      </div>
    </div>
  );
}

export default VideoCall;