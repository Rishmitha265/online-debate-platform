import {collection,getDocs,} from "firebase/firestore";

import {useState} from "react";

import {useEffect, seState,} from "react";

import { db } from "../services/firebase";

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
    <div>
      <h1>
        🏆 Leaderboard
      </h1>

      {users.length ===
      0 ? (
        <p>
          No leaderboard
          data available
        </p>
      ) : (
        users.map(
          (
            user,
            index) => (
            <div
              key={
                user.userEmail
              }
              style={{
                border:"1px solid gray",
                margin:"10px",
                padding:"10px",
              }}
            >
              <h3>
                Rank # {index + 1}
              </h3>

              <p>
                Email:
                {
                  user.userEmail
                }
              </p>

              <p>
                Votes:
                {
                  user.totalVotes
                }
              </p>

              <p>
                Badges:
                {
                  getBadge(user.totalVotes)
                }
              </p>

              <p>
                Arguments:
                {
                  user.totalArguments
                }
              </p>

              <p>
                Reputation:
                {user.totalVotes * 10}
              </p>

              <p>
                Total
                Debates:
                {
                  user.totalDebates
                }
              </p>

              <p>
                Audience Approval:
                {
                  (
                    user.totalVotes/(user.totalArguments||1)
                  ).toFixed(1)
                }
              </p>

              <p>
                Weekly Score:
                {
                  user.weeklyScore
                }
              </p>

              <p>
                Monthly Score:
                {
                  user.monthlyScore
                }
              </p>

              <p>
                Wins:
                {user.wins}
              </p>
            </div>
          )
        )
      )}
    </div>
  );
}

export default Leaderboard;