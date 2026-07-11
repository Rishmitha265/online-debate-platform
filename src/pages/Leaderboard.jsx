import {collection,getDocs} from "firebase/firestore";

import {useEffect,useState} from "react";

import { db } from "../services/firebase";

import PageNavigator from "../components/PageNavigator";

function Leaderboard() {
  const [users, setUsers] =
    useState([]);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard =
    async () => {
      try {
        const snapshot =await getDocs(collection(db,"arguments")
          );

        const data =
          snapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            })
          );

        const userStats = {};

        data.forEach((arg) => {
          const email =
            arg.userEmail;

          const argumentDate = arg.createdAt?.toDate
              ? arg.createdAt.toDate()
              : new Date(
                  arg.createdAt
                );

          const oneWeekAgo =new Date();

          oneWeekAgo.setDate(
            oneWeekAgo.getDate() - 7
          );

          const oneMonthAgo =new Date();

          oneMonthAgo.setDate(
            oneMonthAgo.getDate() -30
          );

          if (
            !userStats[email]
          ) {
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

          userStats[
            email
          ].totalVotes +=
            arg.votes || 0;

          userStats[
            email
          ].totalArguments += 1;

          if (
            arg.debateId
          ) {
            userStats[
              email
            ].debates.add(
              arg.debateId
            );
          }

          if (
            argumentDate >=oneWeekAgo
          ) {
            userStats[
              email
            ].weeklyScore +=arg.votes || 0;
          }

          if (
            argumentDate >=oneMonthAgo
          ) {
            userStats[
              email
            ].monthlyScore +=arg.votes || 0;
          }

          if (
            (arg.votes || 0) >=10
          ) {
            userStats[
              email
            ].wins += 1;
          }
        });

        const leaderboardData =
          Object.values(
            userStats
          ).map(
            (user) => ({
              ...user,totalDebates: user.debates.size,
            })
          );

        leaderboardData.sort(
          (a, b) =>
            b.totalVotes -a.totalVotes
        );

        setUsers(
          leaderboardData
        );
      } catch (error) {
        console.log(error);
      }
    };

    const getBadge=(votes)=>{
        
        if(votes>=100){
          return "🥇 GOLD"
        }

        if(votes>=50){
          return"🥈 SILVER"
        }

        if(votes>=20){
          return "🥉 BRONZE"
        }
        return "🌱 BEGINEER"
      }

      return (
     <div className="min-h-screen bg-brand-bg text-brand-navy p-8">

      <PageNavigator/>

    <h1 className="text-5xl font-bold text-center mb-10 text-brand-purple">
      🏆 Leaderboard
    </h1>

    {users.length === 0 ? (

      <div className="text-center text-brand-text text-xl">
        No leaderboard data available
      </div>

    ) : (

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">

        {users.map((user, index) => (

          <div
            key={user.userEmail}
            className="bg-brand-bg border border-brand-border rounded-2xl shadow-xl p-6 text-brand-navy hover:shadow-2xl transition duration-300"
          >

            <div className="flex justify-between items-center mb-4">

              <h2 className="text-2xl font-bold text-brand-purple">
                🥇 Rank #{index + 1}
              </h2>

              <span className="text-2xl">
                {getBadge(user.totalVotes)}
              </span>

            </div>

            <p className="mb-2 text-brand-text">
              <span className="font-bold text-brand-navy">
                📧 Email:
              </span>{" "}
              {user.userEmail||"Not Available"}
            </p>

            <p className="mb-2 text-brand-text">
              <span className="font-bold text-brand-navy">
                👍 Votes:
              </span>{" "}
              {user.totalVotes}
            </p>

            <p className="mb-2 text-brand-text">
              <span className="font-bold text-brand-navy">
                💬 Arguments:
              </span>{" "}
              {user.totalArguments}
            </p>

            <p className="mb-2 text-brand-text">
              <span className="font-bold text-brand-navy">
                ⭐ Reputation:
              </span>{" "}
              {user.totalVotes * 10}
            </p>

            <p className="mb-2 text-brand-text">
              <span className="font-bold text-brand-navy">
                🎯 Total Debates:
              </span>{" "}
              {user.totalDebates}
            </p>

            <p className="mb-2 text-brand-text">
              <span className="font-bold text-brand-navy">
                ❤️ Audience Approval:
              </span>{" "}
              {(user.totalVotes / (user.totalArguments || 1)).toFixed(1)}
            </p>

            <p className="mb-2 text-brand-text">
              <span className="font-bold text-brand-navy">
                📅 Weekly Score:
              </span>{" "}
              {user.weeklyScore}
            </p>

            <p className="mb-2 text-brand-text">
              <span className="font-bold text-brand-navy">
                📆 Monthly Score:
              </span>{" "}
              {user.monthlyScore}
            </p>

            <p className="text-brand-text">
              <span className="font-bold text-brand-navy">
                🏅 Wins:
              </span>{" "}
              {user.wins}
            </p>

          </div>

        ))}

      </div>

    )}

  </div>
  );
}

export default Leaderboard;