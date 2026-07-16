import { collection, getDocs } from "firebase/firestore";
import { useEffect, useState } from "react";
import { db } from "../services/firebase";
import PageNavigator from "../components/PageNavigator";

function Leaderboard() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const snapshot = await getDocs(collection(db, "arguments"));

      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      const userStats = {};

      data.forEach((arg) => {
        const email = arg.userEmail;

        const argumentDate = arg.createdAt?.toDate
          ? arg.createdAt.toDate()
          : new Date(arg.createdAt);

        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

        const oneMonthAgo = new Date();
        oneMonthAgo.setDate(oneMonthAgo.getDate() - 30);

        if (!userStats[email]) {
          userStats[email] = {
            userEmail: email,
            totalVotes: 0,
            totalArguments: 0,
            weeklyScore: 0,
            monthlyScore: 0,
            wins: 0,
            debates: new Set(),
          };
        }

        userStats[email].totalVotes += arg.votes || 0;
        userStats[email].totalArguments += 1;

        if (arg.debateId) {
          userStats[email].debates.add(arg.debateId);
        }

        if (argumentDate >= oneWeekAgo) {
          userStats[email].weeklyScore += arg.votes || 0;
        }

        if (argumentDate >= oneMonthAgo) {
          userStats[email].monthlyScore += arg.votes || 0;
        }

        if ((arg.votes || 0) >= 10) {
          userStats[email].wins += 1;
        }
      });

      const leaderboardData = Object.values(userStats).map((user) => ({
        ...user,
        totalDebates: user.debates.size,
      }));

      leaderboardData.sort((a, b) => b.totalVotes - a.totalVotes);

      setUsers(leaderboardData);
    } catch (error) {
      console.log(error);
    }
  };

  const getBadge = (votes) => {
    if (votes >= 100) return "🥇 GOLD";
    if (votes >= 50) return "🥈 SILVER";
    if (votes >= 20) return "🥉 BRONZE";
    return "🌱 BEGINEER";
  };

  const rankGlow = (index) => {
    if (index === 0) return "shadow-[0_20px_60px_-15px_rgba(250,204,21,0.55)] border-amber-300/40";
    if (index === 1) return "shadow-[0_20px_60px_-15px_rgba(226,232,240,0.45)] border-slate-200/30";
    if (index === 2) return "shadow-[0_20px_60px_-15px_rgba(251,146,60,0.45)] border-orange-300/30";
    return "shadow-[0_20px_60px_-20px_rgba(168,85,247,0.35)] border-white/10";
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0a0410] text-white p-8">
      <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 h-[600px] w-[900px] rounded-full bg-purple-600/25 blur-[140px]" />
      <div className="pointer-events-none absolute top-1/3 right-0 h-[420px] w-[520px] rounded-full bg-fuchsia-500/20 blur-[130px]" />
      <div className="pointer-events-none absolute bottom-0 left-0 h-[420px] w-[520px] rounded-full bg-blue-600/20 blur-[130px]" />

      <div className="relative z-10">
        <PageNavigator />

        <h1 className="text-5xl font-bold text-center mb-10 bg-gradient-to-r from-amber-300 via-fuchsia-300 to-purple-300 bg-clip-text text-transparent">
          🏆 Leaderboard
        </h1>

        {users.length === 0 ? (
          <div className="text-center text-white/60 text-xl">
            No leaderboard data available
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {users.map((user, index) => (
              <div
                key={user.userEmail}
                className={`relative bg-white/5 backdrop-blur-xl border rounded-2xl p-6 hover:bg-white/10 transition duration-300 overflow-hidden ${rankGlow(index)}`}
              >
                <div className="pointer-events-none absolute -inset-px rounded-2xl bg-gradient-to-br from-white/10 to-transparent opacity-60" />

                <div className="relative flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-fuchsia-300 to-purple-300 bg-clip-text text-transparent">
                    🥇 Rank #{index + 1}
                  </h2>
                  <span className="text-lg font-semibold text-amber-300">
                    {getBadge(user.totalVotes)}
                  </span>
                </div>

                <div className="relative space-y-2 text-white/80">
                  <p>
                    <span className="font-bold text-white">📧 Email:</span>{" "}
                    {user.userEmail || "Not Available"}
                  </p>
                  <p>
                    <span className="font-bold text-white">👍 Votes:</span>{" "}
                    {user.totalVotes}
                  </p>
                  <p>
                    <span className="font-bold text-white">💬 Arguments:</span>{" "}
                    {user.totalArguments}
                  </p>
                  <p>
                    <span className="font-bold text-white">⭐ Reputation:</span>{" "}
                    {user.totalVotes * 10}
                  </p>
                  <p>
                    <span className="font-bold text-white">🎯 Total Debates:</span>{" "}
                    {user.totalDebates}
                  </p>
                  <p>
                    <span className="font-bold text-white">❤️ Audience Approval:</span>{" "}
                    {(user.totalVotes / (user.totalArguments || 1)).toFixed(1)}
                  </p>
                  <p>
                    <span className="font-bold text-white">📅 Weekly Score:</span>{" "}
                    {user.weeklyScore}
                  </p>
                  <p>
                    <span className="font-bold text-white">📆 Monthly Score:</span>{" "}
                    {user.monthlyScore}
                  </p>
                  <p>
                    <span className="font-bold text-white">🏅 Wins:</span>{" "}
                    {user.wins}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Leaderboard;
