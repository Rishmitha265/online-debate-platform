import { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../services/firebase";
import PageNavigator from "../components/PageNavigator";

function Analytics() {
  const [totalDebates, setTotalDebates] = useState(0);
  const [totalArguments, setTotalArguments] = useState(0);
  const [totalVotes, setTotalVotes] = useState(0);
  const [ActiveUser, setActiveUser] = useState(0);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const debateSnapshot = await getDocs(collection(db, "debates"));
      setTotalDebates(debateSnapshot.size);

      const argumentSnapshot = await getDocs(collection(db, "arguments"));
      setTotalArguments(argumentSnapshot.size);

      let votes = 0;
      let users = {};

      argumentSnapshot.docs.forEach((doc) => {
        const data = doc.data();
        votes += data.votes || 0;
        users[data.userEmail] = (users[data.userEmail] || 0) + 1;
      });

      setTotalVotes(votes);

      let activeUser = "";
      let maxPosts = 0;

      for (let user in users) {
        if (users[user] > maxPosts) {
          maxPosts = users[user];
          activeUser = user;
        }
      }

      setActiveUser(activeUser);
    } catch (error) {
      console.log(error);
    }
  };

  const cards = [
    { label: "Total Debates", value: totalDebates, accent: "from-purple-300 to-fuchsia-300", icon: "📚" },
    { label: "Total Arguments", value: totalArguments, accent: "from-fuchsia-300 to-pink-300", icon: "💬" },
    { label: "Total Votes", value: totalVotes, accent: "from-emerald-300 to-teal-300", icon: "👍" },
    { label: "Most Active User", value: ActiveUser || "NO DATA", accent: "from-sky-300 to-indigo-300", icon: "🔥" },
  ];

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0a0410] text-white py-12 px-6">
      <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 h-[560px] w-[900px] rounded-full bg-purple-600/25 blur-[140px]" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-[420px] w-[520px] rounded-full bg-fuchsia-500/20 blur-[130px]" />
      <div className="pointer-events-none absolute bottom-0 left-0 h-[420px] w-[520px] rounded-full bg-blue-600/20 blur-[130px]" />

      <div className="relative z-10">
        <PageNavigator />

        <h1 className="text-5xl font-bold text-center mb-12 bg-gradient-to-r from-purple-300 via-fuchsia-300 to-blue-300 bg-clip-text text-transparent">
          📊 Debate Analytics
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {cards.map((c) => (
            <div
              key={c.label}
              className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-[0_20px_60px_-20px_rgba(168,85,247,0.35)] p-8 text-center overflow-hidden"
            >
              <div className="pointer-events-none absolute -inset-px rounded-2xl bg-gradient-to-br from-white/10 to-transparent opacity-60" />
              <div className="relative text-4xl mb-3">{c.icon}</div>
              <h2 className="relative text-xl font-semibold text-white/80 mb-3">
                {c.label}
              </h2>
              <p className={`relative text-5xl font-bold bg-gradient-to-r ${c.accent} bg-clip-text text-transparent break-all`}>
                {c.value}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Analytics;
