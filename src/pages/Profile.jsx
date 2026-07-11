import { useEffect, useState } from "react";
import { getAuth } from "firebase/auth";
import {collection,getDocs,query,where,doc,getDoc} from "firebase/firestore";
import { db } from "../services/firebase";
import PageNavigator from "../components/PageNavigator";
import {useNavigate} from "react-router-dom";

function Profile() {
  const [userData, setUserData] = useState(null);
  const [profileImage,setProfileImage]=useState("");
  const [debatesCreated, setDebatesCreated] = useState(0);
  const [argumentsPosted, setArgumentsPosted] = useState(0);
  const [totalVotes, setTotalVotes] = useState(0);
  const [username,setUsername]=useState("");

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    const auth = getAuth();
    const currentUser = auth.currentUser;

    if (!currentUser) return;

    setUserData(currentUser);

   const userDoc = await getDoc(
  doc(db, "users", currentUser.uid)
      );

      if (userDoc.exists()) {
        setProfileImage(userDoc.data().profileImage || "");
        setUsername(userDoc.data().username || "");
      }

    // Total Debates Created
    const debatesQuery = query(
      collection(db, "debates"),
      where("userEmail", "==", currentUser.email)
    );

    const debatesSnap = await getDocs(debatesQuery);
    setDebatesCreated(debatesSnap.size);

    // Total Arguments Posted
    const argumentsQuery = query(
      collection(db, "arguments"),
      where("userEmail", "==", currentUser.email)
    );

    const argumentsSnap = await getDocs(argumentsQuery);
    setArgumentsPosted(argumentsSnap.size);

    let votes = 0;

    argumentsSnap.forEach((doc) => {
      votes += doc.data().votes || 0;
    });

    setTotalVotes(votes);
  };

  const getBadge = () => {
    if (totalVotes >= 50) return "🏆 Master Debater";
    if (totalVotes >= 20) return "🥇 Top Debater";
    if (totalVotes >= 10) return "🥈 Active Debater";
    return "🎯 Beginner";
  };

  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-brand-bg">

      <PageNavigator />

      <div className="max-w-4xl mx-auto p-8">

        <div className="bg-brand-bg border border-brand-border rounded-3xl shadow-xl overflow-hidden">


          <div className="h-40 bg-brand-purple"></div>


          <div className="flex flex-col items-center -mt-12">
          
          <div className="w-32 h-32 rounded-full border-4 border-white overflow-hidden bg-white shadow-xl">

           <img
            src={
              profileImage ||
              userData?.photoURL ||
              "https://ui-avatars.com/api/?name=Rishmitha&background=7C3AED&color=fff"
            }
            alt="Profile"
            className="w-32 h-32 rounded-full border-4 border-brand-bg shadow-lg"
          />
          </div>

            <h2 className="text-3xl font-bold text-brand-navy mt-4">
              {username || "Debate User"}
            </h2>

            <p className="text-brand-text mt-2">
              {userData?.email}
            </p>

          </div>


          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-8">

              <div className="bg-purple-950/30 border border-brand-border rounded-2xl p-6 text-center shadow">

              <h3 className="text-4xl font-bold text-brand-purple">
                {debatesCreated}
              </h3>

              <p className="text-brand-text mt-2">
                Debates Created
              </p>

            </div>

             <div className="bg-green-950/30 border border-brand-border rounded-2xl p-6 text-center shadow">
              <h3 className="text-4xl font-bold text-green-700">
                {argumentsPosted}
              </h3>

              <p className="text-brand-text mt-2">
                Arguments Posted
              </p>

            </div>

            <div className="bg-yellow-950/30 border border-brand-border rounded-2xl p-6 text-center shadow">

              <h3 className="text-4xl font-bold text-yellow-600">
                {totalVotes}
              </h3>

              <p className="text-brand-text mt-2">
                Total Votes
              </p>

            </div>

          </div>

         

          <div className="px-8 pb-8">

            <div className="bg-purple-950/30 border border-brand-border rounded-2xl p-6 text-center">

              <h2 className="text-2xl font-bold text-brand-purple">
                Achievement Badge
              </h2>

              <p className="text-3xl mt-4">
                {getBadge()}
              </p>

            </div>

          </div>


          <div className="flex justify-center pb-10">

            <button 
            onClick={() => navigate("/settings")}
           className="bg-brand-secondary hover:bg-brand-secondary-hover text-white px-8 py-3 rounded-xl font-semibold transition">

              Edit Profile

            </button>

          </div>

        </div>

      </div>

    </div>
  );
}

export default Profile;