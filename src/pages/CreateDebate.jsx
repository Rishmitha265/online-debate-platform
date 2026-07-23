//CreateDebate.jsx

import { useState,useEffect} from "react";
import { useParams,useNavigate } from "react-router-dom";
import { collection, addDoc, doc, getDoc, updateDoc} from "firebase/firestore";
import { db, auth } from "../services/firebase";
import PageNavigator from "../components/PageNavigator";

function CreateDebate() {
  const [title, setTitle] = useState("");
  const [roomType, setRoomType] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [formate, setFormate] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [image,SetImage]=useState(null);
  const [imageUrl,setImageUrl]=useState("");
  const {id}=useParams();
  const navigate = useNavigate();

  useEffect(()=>{
    if (id){
      fetchDebate();
    }
  },[id]);

  const fetchDebate = async()=>{
    try{
      const debateRef = doc(db,"debates",id);
      const debateSnap = await getDoc(debateRef);

      if (debateSnap.exists()){
        const data=debateSnap.data();

        setTitle(data.title || "");
        setDescription(data.description||"");
        setCategory(data.category || "");
        setFormate(data.formate || "");
        setRoomType(data.roomType || "");

          // if you already store imageUrl
          setImageUrl(data.imageUrl || "");
      }
    }catch(error){
      console.log(error);
    }
  }

  const uploadImage = async ()=>{
    if (!image) return "";

    const formData=new FormData();
    formData.append("file",image);
    formData.append("upload_preset","debate-platform");

    const response=await fetch(
      "https://api.cloudinary.com/v1_1/dnqbkyxx3/image/upload",
      {
        method:"POST",
        body:formData,
      }
    );

    const data = await response.json();
    setImageUrl(data.secure_url);
    return data.secure_url;
  }

  const handleCreateDebate = async () => {
    if (!auth.currentUser) {
      alert("Please login first.");
      return;
    }
    
    try {
  const uploadedImage = image
    ? await uploadImage()
    : imageUrl;

  // EDIT MODE
  if (id) {
    await updateDoc(doc(db, "debates", id), {
      title,
      description,
      category,
      formate,
      roomType,
      image: uploadedImage,
    });

    alert("Debate Updated Successfully");
    navigate("/");
    return;
  }

  // CREATE MODE
  await addDoc(collection(db, "debates"), {
    title,
    description,
    category,
    formate,
    roomType,

    image: uploadedImage,

    supportVotes: 0,
    opposeVotes: 0,
    neutralVotes: 0,

    userEmail: auth.currentUser.email,
    createdAt: new Date(),
    endTime: null,
    ended: false,
    started: false,
  });

  // Send invite notification only when creating
  if (roomType === "Invite Only" && inviteEmail) {
    await addDoc(collection(db, "notifications"), {
      userEmail: inviteEmail,
      message: `You have been invited to join "${title}"`,
      createdAt: new Date(),
    });
  }

  alert("Debate Created Successfully");

  setTitle("");
  setDescription("");
  setCategory("");
  setFormate("");
  setRoomType("");
  setInviteEmail("");
  SetImage(null);
  setImageUrl("");

} catch (error) {
  console.log(error);
  alert(error.message);
}
    
  };

  const inputClass = "w-full bg-white/5 backdrop-blur border border-white/10 rounded-xl p-4 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-fuchsia-500/50 focus:border-fuchsia-500/40 transition";

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_rgba(139,92,246,0.15),_transparent_60%),radial-gradient(ellipse_at_bottom,_rgba(59,130,246,0.12),_transparent_60%)] bg-[#07070d] text-white p-8">
     
      <div className="max-w-3xl mx-auto">
        <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl shadow-[0_25px_80px_-20px_rgba(168,85,247,0.45)] p-8 overflow-hidden">
          <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-fuchsia-500/20 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-72 h-72 rounded-full bg-blue-500/20 blur-3xl pointer-events-none" />

           <PageNavigator/>

          <h1 className="relative text-4xl font-extrabold text-center mb-8 bg-gradient-to-r from-purple-400 via-fuchsia-400 to-blue-400 bg-clip-text text-transparent">
              {id?"Edit Debate":"🗣️ Create Debate"}
          </h1>

          <div className="relative space-y-5">
            <input
              type="text"
              placeholder="Debate Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={inputClass}
            />

            <textarea
              placeholder="Debate Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={5}
              className={inputClass}
            />

            <input
              type="file"
              accept="image/*"
              onChange={(e)=>SetImage(e.target.files[0])}
              className={inputClass}/>

            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className={inputClass}
            >
              <option className="bg-[#0e0e18]" value="">Select Category</option>
              <option className="bg-[#0e0e18]" value="Technology">Technology</option>
              <option className="bg-[#0e0e18]" value="Education">Education</option>
              <option className="bg-[#0e0e18]" value="Sports">Sports</option>
              <option className="bg-[#0e0e18]" value="Politics">Politics</option>
              <option className="bg-[#0e0e18]" value="Pollution">Pollution</option>
              <option className="bg-[#0e0e18]" value="Science">Science</option>
              <option className="bg-[#0e0e18]" value="Business">Business</option>
              <option className="bg-[#0e0e18]" value="Environment">Environment</option>
              <option className="bg-[#0e0e18]" value="AI">AI</option>
              <option className="bg-[#0e0e18]" value="Entertainment">Entertainment</option>
              <option className="bg-[#0e0e18]" value="Philosophy">Philosophy</option>
              <option className="bg-[#0e0e18]" value="Ethics">Ethics</option>
              <option className="bg-[#0e0e18]" value="Health">Health</option>
              <option className="bg-[#0e0e18]" value="Startups">Startups</option>
            </select>

            <select
              value={formate}
              onChange={(e) => setFormate(e.target.value)}
              className={inputClass}
            >
              <option className="bg-[#0e0e18]" value="">Debate Format</option>
              <option className="bg-[#0e0e18]" value="1 vs 1">1 vs 1</option>
              <option className="bg-[#0e0e18]" value="2 vs 2">2 vs 2</option>
              <option className="bg-[#0e0e18]" value="5 vs 5">5 vs 5</option>
              <option className="bg-[#0e0e18]" value="10 vs 10">10 vs 10</option>
            </select>

            <select
              value={roomType}
              onChange={(e) => setRoomType(e.target.value)}
              className={inputClass}
            >
              <option className="bg-[#0e0e18]" value="">Room Type</option>
              <option className="bg-[#0e0e18]" value="Public">Public</option>
              <option className="bg-[#0e0e18]" value="Invite Only">Invite Only</option>
            </select>

            {roomType === "Invite Only" && (
              <input
                type="email"
                placeholder="Invite User Email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                className={inputClass}
              />
            )}

            <button
              onClick={handleCreateDebate}
              className="w-full bg-gradient-to-r from-purple-600 via-fuchsia-500 to-blue-500 hover:from-purple-500 hover:via-fuchsia-400 hover:to-blue-400 text-white font-bold py-4 rounded-xl shadow-[0_15px_40px_-10px_rgba(217,70,239,0.6)] hover:shadow-[0_20px_50px_-10px_rgba(217,70,239,0.8)] transition-all duration-300 hover:-translate-y-0.5"
            >
              {id?"Update Debate":"Create Debate"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CreateDebate;
