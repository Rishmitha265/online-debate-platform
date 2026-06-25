import { useEffect, useState } from "react";
import {getAuth,updatePassword,deleteUser} from "firebase/auth";
import {doc,setDoc,getDoc}from "firebase/firestore";
import {db} from "../services/firebase";
function Settings (){

   

    const auth=getAuth();

    const [Password,setPassword]=useState("");
    const [notifications,setNotifications]=useState(true);
    const [darkMode,setDarkMode]=useState(false);
    const [privateAccount,setPrivateAccount]=useState(false);
    const [ProfileImage,setProfileImage]=useState("");
    const [blockedEmail,setBlockedEmail]=useState("");
    const [blockedUsers, setBlockedUsers]=useState([]);
    const [bannerImage,setBannerImage]=useState("");

 
    const changePassword=()=>{
    
        try{

        
        if(!auth.currentUser) return;

        updatePassword(auth.currentUser,Password);

        alert("Password Updated")
        setPassword("");
    }catch(error){
        console.log(error);
    }
}
   const deleteAccount=()=>{
    try{
        if(!auth.currentUser) return;

        const confirmDelete=window.confirm(
            "Are you sure want to Delete?"
        )

        if(!confirmDelete) return;

        deleteUser(auth.currentUser);

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
     style={{
      backgroundColor:darkMode?"121212":"white",
      color:darkMode?"white":"black",
      minHeight:"100vh",
      padding:"20px",
     }}>
      <h1>⚙️ User Settings</h1>

      <h2>Profile</h2>

      <h2>Banner Image</h2>

      <input
      type="file"
      accept="image/*"
      onChange={(e)=>uploadImage(e.target.files[0])}/>

      {bannerImage && (
      <img
        src={bannerImage}
        alt="Banner"
        width="100%"
        height="150"
      />
    )}

      <input
      type="file"
      accept="image/*"
      onChange={(e)=>uploadProfileImage(e.target.files[0])}/>
      

      {privateAccount ? (
        <p>Private Account Enabled</p>
      ):(
        <p>
          Email:{auth.currentUser?.email}
        </p>
      )}

      {ProfileImage && (
        <div
        style={{
          width:"150px",
          height:"150px",
          borderRadius:"50%",
          border: "4px solid #e1306c",
          display: "flex",
          justifyContent:"center",
          alignItems:"center",
          overflow:"hidden",

        }}>
        <img
        src={ProfileImage}
        alt="Profile"
        style={{
          width:"100%",
          height:"100%",
          objectFit:"cover",
        }}/>
      </div>
      )}
      


      <h2>Change Password</h2>

      <input
        type="password"
        placeholder="New Password"
        value={Password}
        onChange={(e) =>
          setPassword(e.target.value)
        }
      />

      <button onClick={changePassword}>
        Update Password
      </button>

      <button onClick={savePrivacySettings}>
        Save Privacy Settings
      </button>


      <h2>Notification Preferences</h2>

      <label>
        <input
          type="checkbox"
          checked={notifications}
          onChange={() =>
            setNotifications(
              !notifications
            )
          }
        />
        Enable Notifications
      </label>

      <h2>Privacy Options</h2>

      <label>
        <input
          type="checkbox"
          checked={privateAccount}
          onChange={() =>
            setPrivateAccount(
              !privateAccount
            )
          }
        />
        Private Account
      </label>

      <h2>Theme</h2>

      <label>
        <input
          type="checkbox"
          checked={darkMode}
          onChange={() =>
            setDarkMode(!darkMode)
          }
        />
        Dark Mode
      </label>

      <h2>Blocked Users</h2>

      <input
      type="email"
      placeholder="Enter the email"
      value={blockedEmail}
      onChange={(e)=>setBlockedEmail(e.target.value)}/>

      <button onClick={block}>
        Block user
      </button>

      {blockedUsers.map((user,index)=>(
        <p key={index}>
          🚫{user}
        </p>
      ))}

      <h2>Account Deletion</h2>

      <button
        onClick={deleteAccount}
      >
        Delete My Account
      </button>
    </div>
   )
  }


export default Settings;