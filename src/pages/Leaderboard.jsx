import {
  collection,
  getDocs
} from "firebase/firestore";

import { useEffect, useState } from "react";

import { db } from "../services/firebase";

function Leaderboard() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    const querySnapshot = await getDocs(
      collection(db, "leaderboard")
    );

    const data = querySnapshot.docs.map(
      (doc) => ({
        id: doc.id,
        ...doc.data(),
      })
    );

    setUsers(data);
  };

  return (
    <div>
      <h1>Leaderboard</h1>

      {users.map((user) => (
        <div key={user.id}>
          <h3>{user.username}</h3>

          <p>
            Points: {user.points}
          </p>

          <p>
            Wins: {user.wins}
          </p>
        </div>
      ))}
    </div>
  );
}

export default Leaderboard;