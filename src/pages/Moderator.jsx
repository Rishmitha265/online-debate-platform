import { useState, useEffect } from "react";
import {collection,getDocs,updateDoc,doc,setDoc} from "firebase/firestore";
import { db } from "../services/firebase";
import PageNavigator from "../components/PageNavigator";

function Moderator() {

  const [report, setReport] = useState([]);
  const [muteEmail,setMuteEmail]=useState("");
  const [removeEmail,setRemoveEmail]=useState("");
  const [debateId,setDebateId]=useState("");

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {

    try {

      const snapshot =
        await getDocs(collection(db, "reports"));

      const data =
        snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

      setReport(data);

    } catch (error) {
      console.log(error);
    }
  };

  const markreviewed = async(id)=>{

    try{
        await updateDoc(doc(db,"reports",id),{
            status:"Reviewed",
        });

        fetchReports();

        alert("The report is reviewed successfully");
    }catch(error){
        console.log(error);
    }
  };

  const muteUser=async()=>{
   
        if(!muteEmail){
            alert("Enter the user Email")
        }

        try{

            await setDoc(doc(db,"mutedUser",muteEmail),{
                email:muteEmail,
                muted:true,
                createdAt:new Date()
            });

        alert("user muted successfully");
        setMuteEmail();
        }catch(error){
            console.log(error)
        }
  }

  const removeuser=async()=>{
    if(!removeuser){
      alert("Enter user email")
    }

    try{
      await setDoc(doc(db,"removedUsers",removeEmail),{
        email:removeEmail,
        removed:true,
        createdAt:new Date(),
      });

      alert("User removed Successfully");

      setRemoveEmail("");
    }catch(error){
      console.log(error)
    };
  }

  const endDebate=async()=>{
    if(!debateId){
      alert("Enter Debate Id");
      return;
    }

    try{
      await updateDoc(doc(db,"debates",debateId),{
        ended:true,
      });

      alert("Debate ended");
      setDebateId("");
    }catch(error){
      console.log(error);
    }
  };

  const lockDebate = async()=>{

    if(!debateId){
      alert("enter the Debate ID");
      return;
    }

    try{
      await updateDoc(doc(db,"debates",debateId),{
        locked:true,
      });

      alert("Debate Locked");
    }catch(error){
      console.log(error)
    }
  }

  return (
    <div className="min-h-screen bg-brand-bg p-8">

      <PageNavigator/>

      <h1 className="text-5xl font-bold text-center text-brand-navy mb-10">
        🛡 Moderator Panel
      </h1>

      <div className="grid md:grid-cols-2 gap-8">


        <div className="bg-brand-bg border border-brand-border rounded-xl shadow-lg p-6">

          <h2 className="text-2xl font-bold mb-4">
            📋 Review Reports
          </h2>

          {report.length === 0 ? (

            <p>No reports found.</p>

          ) : (

            report.map((report) => (

              <div
                key={report.id}
                className="border border-brand-border rounded-lg p-4 mb-4"
              >

                <p>
                  <strong>Reason:</strong>
                  {" "}
                  {report.reason}
                </p>

                <p className="mt-2">
                    <strong>Status:</strong>{report.status}
                </p>

                <button
                  onClick={()=>markreviewed(report.id)}
                  className="mt-4 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                >
                  Mark as Reviewed
                </button>

              </div>

            ))

          )}

        </div>

        <div className="bg-brand-bg border border-brand-border rounded-xl shadow-lg p-6">

          <h2 className="text-2xl font-bold mb-6">
            ⚙ Moderator Controls
          </h2>

          <div className="mb-6">

            <input

            type="email"

            placeholder="Enter user email"

            value={muteEmail}

            onChange={(e)=>setMuteEmail(e.target.value)}

            className="w-full bg-brand-bg border border-brand-input-border rounded-lg p-3 mb-3"

            />

            <button

            onClick={muteUser}

            className="w-full bg-yellow-500 hover:bg-yellow-600 text-white py-3 rounded-lg"

            >

            🔇 Mute User

            </button>

            </div>

          <input
            type="email"
            placeholder="Enter user email"
            value={removeEmail}
            onChange={(e)=>setRemoveEmail(e.target.value)}
            className="w-full bg-brand-bg border border-brand-input-border rounded-lg p-3 mb-4"
            />

          <button
            onClick={removeuser}
            className="w-full bg-red-500 hover:bg-red-600 text-white py-3 rounded-lg mb-4"
          >
            ❌ Remove User
          </button>

          <input
          type="text"
          placeholder="Enter Debate ID"
          value={debateId}
          onChange={(e)=>setDebateId(e.target.value)}
          className="w-full bg-brand-bg border border-brand-input-border rounded-lg p-3 mb-4"/>

          <button
            onClick={endDebate}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-lg mb-4"
          >
            🛑 End Debate
          </button>

          <button
            onClick={lockDebate}
            className="w-full bg-brand-purple hover:bg-brand-purple-dark text-white py-3 rounded-lg"
          >
            🔒 Lock Debate
          </button>

        </div>

      </div>

    </div>
  );
}

export default Moderator;