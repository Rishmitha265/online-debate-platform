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

useEffect(()=>{   //store in firebase
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

   return(
     <div
     className={`min-h-screen p-8 ${
      "bg-brand-bg text-brand-navy"
    }`}>

      <PageNavigator/>
      <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-xl p-8">
      
      <h4 className="text-5xl font-bold text-center text-brand-purple mb-10" >
        ⚙️ User Settings</h4>

      <h2 className="text-3xl font-bold text-center mb-4">
        Banner</h2>

      <div className="w-full h-52 border-2 border-dashed border-brand-border rounded-xl flex items-center overflow-hidden mb-6">
        {bannerImage ? (
          <img
            src={bannerImage}
            alt="Banner"
            className="w-full h-full text-brand-text"/>
        ):(
          <label 
          className="cursor-pointer text-brand-text">
            upload Banner
            <input
            type="file"
            accept="image/*"
            className="hidden"
            onCanPlay={(e)=>uploadImage(e.target.files[0])}/>
          </label>
        )}
      </div>

      <h2 className="text-3xl font-bold text-center mb-4">
        Profile</h2>

      <div className="flex flex-col items-center">

      <div className="w-40 h-40 rounded-full border-4 border-brand-purple overflow-hidden flex items-center justify-center bg-white/10">

      {ProfileImage?(
        <img
        src={ProfileImage}
        alt="Profile"
        className="w-full h-full object-cover"/>
      ):(
        <span className="text-brand-text">
          No Image
        </span>
      )}

      </div>

      <label className="mt-3 cursor-pointer bg-brand-purple hover:bg-brand-purple-dark text-white px-4 py-2 rounded-lg">
         upload profile

        <input
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e)=>uploadProfileImage(e.target.value[0])}/>
      </label>
    </div>

    <p className="text-center mt-4  mb-8 font-bold text-lg">
      {privateAccount? "🔒 This account is Private":
      `Email:${auth.currentUser?.email}`}
    </p>
      


      <h2 className="text-2xl font-bold mt-8 mb-4"
      >Change Password</h2>

      <input
        type="password"
        placeholder="New Password"
        value={Password}
        onChange={(e) =>
          setPassword(e.target.value)
        }
      className="w-full bg-brand-bg border border-brand-input-border rounded-lg p-3 mb-4"
      />

      <button onClick={changePassword}
     className="bg-brand-purple hover:bg-brand-purple-dark text-white px-6 py-3 rounded-lg">
        Update Password
      </button>

      <button onClick={savePrivacySettings}
      className="ml-4 bg-brand-secondary hover:bg-brand-secondary-hover text-white px-6 py-3 rounded-lg">
        Save Privacy Settings
      </button>
     
      <div className="space-y-8 mt-10">
      <div className="flex items-center justify-between mt-8">
        <h2 className="text-2xl font-bold mt-10">
        Notification Preferences</h2>

      <label  className="flex items-center gap-3 mt-4">
        <input
          type="checkbox"
          checked={notifications}
          onChange={() =>
            setNotifications(!notifications)
          }
          className="w-5 h-5"
        />
        Enable Notifications
      </label>
      </div>
      
      <div className="flex items-center justify-between mt-6">
        <h2 className="text-2xl font-bold mt-10">
        Privacy Options</h2>

      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={privateAccount}
          onChange={() =>
            setPrivateAccount(!privateAccount)
          }
          className="w-5 h-5"
        />
        Private Account
      </label>
      </div>
      
      
      <div className="bg-gray-50 rounded-2xl p-5 flex justify-between items-center">
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
      

      <h2 className="text-2xl font-bold text-center mt-14">
        Blocked Users</h2>
      
      <div className="flex gap-4 mt-4 max-w-xl mx-auto">
      <input
      type="email"
      placeholder="Enter the email"
      value={blockedEmail}
      onChange={(e)=>setBlockedEmail(e.target.value)}
      className="flex-1 bg-brand-bg border border-brand-input-border rounded-lg p-3"/>

      <button onClick={block}
       className="bg-red-600 hover:bg-red-700 text-white px-6 rounded-lg">
        Block user
      </button>
      </div>
       
       <div>
      {blockedUsers.map((user,index)=>(
        <p key={index}
         className="bg-red-950/40 text-red-300 rounded-lg p-3 mb-2">
          🚫{user}
        </p>
      ))}
      </div>

      <h2 className="text-2xl font-bold mt-12 text-red-600">
        Account Deletion</h2>

       <button
        onClick={deleteAccount}
        className="mt-5 bg-red-700 hover:bg-red-800 text-white px-8 py-3 rounded-xl"
      >
        Delete My Account
      </button>
    </div>
    </div>
   )
  }


export default Settings;