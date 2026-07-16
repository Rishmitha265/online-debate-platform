//Settings.jsx

import { useEffect, useState } from "react";
import {getAuth,updatePassword,deleteUser} from "firebase/auth";
import {doc,setDoc,getDoc}from "firebase/firestore";
import {db} from "../services/firebase";
import PageNavigator from "../components/PageNavigator";
function Settings (){

    const auth=getAuth();

    const [Password,setPassword]=useState("");
    const [notifications,setNotifications]=useState(true);
    // const [darkMode,setDarkMode]=useState(false);
    const [privateAccount,setPrivateAccount]=useState(false);
    const [ProfileImage,setProfileImage]=useState("");
    const [blockedEmail,setBlockedEmail]=useState("");
    const [blockedUsers, setBlockedUsers]=useState([]);
    const [bannerImage,setBannerImage]=useState("");


    const changePassword= async()=>{

        try{
        if(!auth.currentUser) return;

         await updatePassword(auth.currentUser,Password);

        alert("Password Updated")
        setPassword("");
    }catch(error){
        console.log(error);
    }
}
   const deleteAccount=async()=>{
    try{
        if(!auth.currentUser) return;

        const confirmDelete=window.confirm(
            "Are you sure want to Delete?"
        )

        if(!confirmDelete) return;

        await deleteUser(auth.currentUser);

        alert("Account Deleted Successfully");
    }catch(error){
        console.log(error);
    }
   }

  const savePrivacySettings = async () => {
   if (!auth.currentUser) return;

  await setDoc(doc(db,"users",auth.currentUser.uid),
{
  privateAccount: privateAccount,
},
{merge:true});
alert("Privacy Settings Saved");}


   const uploadProfileImage = async (file) => {
  const formData = new FormData();

  formData.append("file", file);
  formData.append("upload_preset", "debate-platform");

  try {
    const response = await fetch(
      "https://api.cloudinary.com/v1_1/dnqbkyxx3/image/upload",
      {
        method: "POST",
        body: formData,
      }
    );

    const data = await response.json();

    setProfileImage(data.secure_url);

    if (auth.currentUser) {
      await setDoc(
        doc(db, "users", auth.currentUser.uid),
        {
          profileImage: data.secure_url,
        },
        { merge: true }
      );
    }

    alert("Profile uploaded successfully");
  } catch (error) {
    console.log(error);
  }
};


const block = async () => {

  if (!blockedEmail) {
    alert("Enter the Email");
    return;
  }

  if (
    blockedUsers.includes(blockedEmail)
  ) {
    alert("This email is already blocked");
    return;
  }

  setBlockedUsers([
    ...blockedUsers,
    blockedEmail
  ]);

  await setDoc(
    doc(
      db,"users",auth.currentUser.uid
    ),
    {
      blockedUsers: [
        ...blockedUsers,
        blockedEmail
      ]
    },
    { merge: true }
  );

  setBlockedEmail("");

  alert("User blocked");
};

useEffect(()=>{
  loadBlockerUsers()
},[]);


const loadBlockerUsers=async()=>{
  if(!auth.currentUser) return;

  const userDoc= await getDoc(doc(db,"users",auth.currentUser.uid));

  if(userDoc.exists()){
    setBlockedUsers(userDoc.data().blockedUsers||[]);
  }
};

const uploadImage=async(file)=>{

  const formData= new FormData();

  formData.append("file",file);

  formData.append("upload_preset",
    "debate-platform"
  );

  const response = await fetch(
    "https://api.cloudinary.com/v1_1/dnqbkyxx3/image/upload",
    {
      method:"POST",
      body:formData,
    }
  );

  const data=await response.json();

  console.log(data);

  setBannerImage(data.secure_url);

  await setDoc(doc(db,"users",auth.currentUser.uid),{
    bannerImage:data.secure_url,
  },{merge:true});
};

const inputClass = "w-full bg-white/5 backdrop-blur border border-white/10 rounded-xl p-3 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-fuchsia-500/50 focus:border-fuchsia-500/40 transition";

   return(
     <div className="min-h-screen p-8 bg-[radial-gradient(ellipse_at_top,_rgba(139,92,246,0.15),_transparent_60%),radial-gradient(ellipse_at_bottom,_rgba(59,130,246,0.12),_transparent_60%)] bg-[#07070d] text-white">

      <PageNavigator/>
      <div className="max-w-4xl mx-auto bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl shadow-[0_25px_80px_-20px_rgba(168,85,247,0.45)] p-8">

      <h4 className="text-5xl font-extrabold text-center mb-10 bg-gradient-to-r from-purple-400 via-fuchsia-400 to-blue-400 bg-clip-text text-transparent">
        ⚙️ User Settings
      </h4>

      <h2 className="text-2xl font-bold text-center mb-4 text-white/90">
        Banner
      </h2>

      <div className="w-full h-52 border-2 border-dashed border-white/15 rounded-2xl flex items-center justify-center overflow-hidden mb-8 bg-white/5">
        {bannerImage ? (
          <img
            src={bannerImage}
            alt="Banner"
            className="w-full h-full object-cover"/>
        ):(
          <label className="cursor-pointer text-white/60 hover:text-fuchsia-300 transition">
            Upload Banner
            <input
            type="file"
            accept="image/*"
            className="hidden"
            onCanPlay={(e)=>uploadImage(e.target.files[0])}/>
          </label>
        )}
      </div>

      <h2 className="text-2xl font-bold text-center mb-4 text-white/90">
        Profile
      </h2>

      <div className="flex flex-col items-center">

        <div className="w-40 h-40 rounded-full border-4 border-fuchsia-500/50 overflow-hidden flex items-center justify-center bg-white/5 shadow-[0_15px_40px_-10px_rgba(217,70,239,0.6)]">
          {ProfileImage?(
            <img
            src={ProfileImage}
            alt="Profile"
            className="w-full h-full object-cover"/>
          ):(
            <span className="text-white/50">No Image</span>
          )}
        </div>

        <label className="mt-4 cursor-pointer bg-gradient-to-r from-purple-600 via-fuchsia-500 to-blue-500 hover:from-purple-500 hover:via-fuchsia-400 hover:to-blue-400 text-white px-5 py-2 rounded-xl shadow-[0_10px_30px_-8px_rgba(217,70,239,0.6)] transition-all">
          Upload Profile
          <input
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e)=>uploadProfileImage(e.target.value[0])}/>
        </label>
      </div>

      <p className="text-center mt-4 mb-8 font-semibold text-lg text-white/80">
        {privateAccount? "🔒 This account is Private":
        `Email: ${auth.currentUser?.email}`}
      </p>


      <h2 className="text-2xl font-bold mt-8 mb-4 text-white/90">
        Change Password
      </h2>

      <input
        type="password"
        placeholder="New Password"
        value={Password}
        onChange={(e) =>
          setPassword(e.target.value)
        }
        className={`${inputClass} mb-4`}
      />

      <div className="flex flex-wrap gap-4">
        <button onClick={changePassword}
         className="bg-gradient-to-r from-purple-600 via-fuchsia-500 to-blue-500 hover:from-purple-500 hover:via-fuchsia-400 hover:to-blue-400 text-white px-6 py-3 rounded-xl shadow-[0_10px_30px_-8px_rgba(217,70,239,0.6)] transition-all">
          Update Password
        </button>

        <button onClick={savePrivacySettings}
          className="bg-white/10 hover:bg-white/15 border border-white/15 text-white px-6 py-3 rounded-xl backdrop-blur transition-all">
          Save Privacy Settings
        </button>
      </div>

      <div className="space-y-6 mt-10">

        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 flex items-center justify-between backdrop-blur">
          <h2 className="text-xl font-bold text-white/90">
            Notification Preferences
          </h2>

          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={notifications}
              onChange={() =>
                setNotifications(!notifications)
              }
              className="w-5 h-5 accent-fuchsia-500"
            />
            <span className="text-white/70">Enable Notifications</span>
          </label>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 flex items-center justify-between backdrop-blur">
          <h2 className="text-xl font-bold text-white/90">
            Privacy Options
          </h2>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={privateAccount}
              onChange={() =>
                setPrivateAccount(!privateAccount)
              }
              className="w-5 h-5 accent-fuchsia-500"
            />
            <span className="text-white/70">Private Account</span>
          </label>
        </div>


        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 flex justify-between items-center backdrop-blur">
          {/* <h2 className="text-2xl font-bold mt-10">
          Theme</h2>

        <label className="flex items-center gap-3 mt-4">
          <input
            type="checkbox"
            checked={darkMode}
            onChange={() =>
              setDarkMode(!darkMode)
            }
            className="w-5 h-5"
          />
          Dark Mode
        </label> */}
        </div>
      </div>


      <h2 className="text-2xl font-bold text-center mt-14 text-white/90">
        Blocked Users
      </h2>

      <div className="flex gap-4 mt-4 max-w-xl mx-auto">
        <input
          type="email"
          placeholder="Enter the email"
          value={blockedEmail}
          onChange={(e)=>setBlockedEmail(e.target.value)}
          className={`flex-1 ${inputClass}`}/>

        <button onClick={block}
          className="bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white px-6 rounded-xl shadow-[0_10px_30px_-8px_rgba(244,63,94,0.6)] transition-all">
          Block user
        </button>
      </div>

      <div className="mt-4 max-w-xl mx-auto">
        {blockedUsers.map((user,index)=>(
          <p key={index}
            className="bg-rose-500/10 border border-rose-500/30 text-rose-200 rounded-xl p-3 mb-2 backdrop-blur">
            🚫 {user}
          </p>
        ))}
      </div>

      <h2 className="text-2xl font-bold mt-12 text-rose-400">
        Account Deletion
      </h2>

      <button
        onClick={deleteAccount}
        className="mt-5 bg-gradient-to-r from-rose-600 to-red-700 hover:from-rose-500 hover:to-red-600 text-white px-8 py-3 rounded-xl shadow-[0_15px_40px_-10px_rgba(244,63,94,0.6)] transition-all"
      >
        Delete My Account
      </button>
    </div>
    </div>
   )
  }


export default Settings;
