//Profile.jsx

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

    const debatesQuery = query(
      collection(db, "debates"),
      where("userEmail", "==", currentUser.email)
    );

    const debatesSnap = await getDocs(debatesQuery);
    setDebatesCreated(debatesSnap.size);

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
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_rgba(139,92,246,0.15),_transparent_60%),radial-gradient(ellipse_at_bottom,_rgba(59,130,246,0.12),_transparent_60%)] bg-[#07070d] text-white">

      <PageNavigator />

      <div className="max-w-4xl mx-auto p-8">

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl shadow-[0_25px_80px_-20px_rgba(168,85,247,0.45)] overflow-hidden">

          <div className="relative h-56 bg-gradient-to-br from-purple-600 via-fuchsia-500 to-blue-500 overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,204,112,0.35),transparent_60%)]" />
          </div>

          <div className="relative z-20 flex flex-col items-center -mt-16">

            <div className="relative z-30 w-36 h-36 rounded-full p-1 bg-gradient-to-r from-fuchsia-500 via-purple-500 to-blue-500 shadow-[0_20px_60px_rgba(168,85,247,0.6)]">
              <div className="w-full h-full rounded-full overflow-hidden border-4 border-[#111827] bg-[#111827]">
              <img
                src={
                  profileImage ||
                  userData?.photoURL ||
                  "https://ui-avatars.com/api/?name=Rishmitha&background=7C3AED&color=fff"
                }
                alt="Profile"
                className="w-full h-full object-cover"
              />
            </div>
            </div>

            <h2 className="text-3xl font-extrabold mt-4 bg-gradient-to-r from-fuchsia-300 to-purple-300 bg-clip-text text-transparent">
              {username || "Debate User"}
            </h2>

            <p className="text-white/60 mt-2">{userData?.email}</p>

          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-8">

            <div className="bg-gradient-to-br from-purple-600/20 to-fuchsia-500/10 border border-white/10 rounded-2xl p-6 text-center shadow-lg backdrop-blur-xl hover:scale-[1.03] transition-transform duration-300">
              <h3 className="text-4xl font-extrabold bg-gradient-to-r from-fuchsia-300 to-purple-300 bg-clip-text text-transparent">
                {debatesCreated}
              </h3>
              <p className="text-white/70 mt-2">Debates Created</p>
            </div>

            <div className="bg-gradient-to-br from-emerald-500/20 to-teal-500/10 border border-white/10 rounded-2xl p-6 text-center shadow-lg backdrop-blur-xl hover:scale-[1.03] transition-transform duration-300">
              <h3 className="text-4xl font-extrabold bg-gradient-to-r from-emerald-300 to-teal-300 bg-clip-text text-transparent">
                {argumentsPosted}
              </h3>
              <p className="text-white/70 mt-2">Arguments Posted</p>
            </div>

            <div className="bg-gradient-to-br from-amber-400/20 to-orange-500/10 border border-white/10 rounded-2xl p-6 text-center shadow-lg backdrop-blur-xl hover:scale-[1.03] transition-transform duration-300">
              <h3 className="text-4xl font-extrabold bg-gradient-to-r from-amber-300 to-orange-300 bg-clip-text text-transparent">
                {totalVotes}
              </h3>
              <p className="text-white/70 mt-2">Total Votes</p>
            </div>

          </div>

          <div className="px-8 pb-8">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center backdrop-blur-xl">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-fuchsia-300 to-blue-300 bg-clip-text text-transparent">
                Achievement Badge
              </h2>
              <p className="text-3xl mt-4 text-white/90">{getBadge()}</p>
            </div>
          </div>

          <div className="flex justify-center pb-10">
            <button
              onClick={() => navigate("/settings")}
              className="bg-gradient-to-r from-purple-600 via-fuchsia-500 to-blue-500 hover:from-purple-500 hover:via-fuchsia-400 hover:to-blue-400 text-white px-10 py-3 rounded-xl font-semibold shadow-[0_15px_40px_-10px_rgba(217,70,239,0.6)] hover:-translate-y-0.5 transition-all duration-300"
            >
              Edit Profile
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}

export default Profile;
