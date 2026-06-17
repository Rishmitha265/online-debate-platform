import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

import {doc,getDoc,collection,addDoc,getDocs,query,where,updateDoc,increment,} from "firebase/firestore";

import { db } from "../services/firebase";

function DebateRoom() {
  const { id } = useParams();

  const [debate, setDebate] = useState(null);
  const [side, setSide] = useState("");
  const [argument, setArgument] = useState("");
  const [argumentsList, setArgumentsList] = useState([]);

  useEffect(() => {
    fetchDebate();
    fetchArguments();
  }, []);

  // Fetch Debate
  const fetchDebate = async () => {
    try {
      const docRef = doc(db, "debates", id);

      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setDebate({
          id: docSnap.id,
          ...docSnap.data(),
        });
      }
    } catch (error) {
      console.log(error);
    }
  };

  // Fetch Arguments
  const fetchArguments = async () => {
    try {
      const q = query(
        collection(db, "arguments"),
        where("debateId", "==", id)
      );

      const querySnapshot = await getDocs(q);

      const data = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setArgumentsList(data);
    } catch (error) {
      console.log(error);
    }
  };

  // Submit Argument
  const submitArgument = async () => {
    if (!argument) {
      alert("Please enter an argument");
      return;
    }

    if (!side) {
      alert("Please choose Support or Oppose");
      return;
    }

    try {
      await addDoc(collection(db, "arguments"), {
        debateId: id,
        side,
        argument,
        votes: 0,
        createdAt: new Date(),
      });

      alert("Argument Posted");

      setArgument("");

      fetchArguments();
    } catch (error) {
      console.log(error);
    }
  };

  // Upvote / Downvote
  const handleVote = async (argumentId, type) => {
    try {
      const argumentRef = doc(
        db,
        "arguments",
        argumentId
      );

      await updateDoc(argumentRef, {
        votes: increment(
          type === "up" ? 1 : -1
        ),
      });

      fetchArguments();
    } catch (error) {
      console.log(error);
    }
  };

  // Calculate Winner
  const calculateWinner = () => {
    let supportVotes = 0;
    let opposeVotes = 0;

    argumentsList.forEach((arg) => {
      if (arg.side === "Support") {
        supportVotes += arg.votes || 0;
      }

      if (arg.side === "Oppose") {
        opposeVotes += arg.votes || 0;
      }
    });

    if (supportVotes > opposeVotes) {
      return "Support";
    }

    if (opposeVotes > supportVotes) {
      return "Oppose";
    }

    return "Tie";
  };

  if (!debate) {
    return <h2>Loading...</h2>;
  }

  return (
    <div>
      <h1>Debate Room</h1>

      <h2>{debate.title}</h2>

      <p>{debate.description}</p>

      <h3>Choose Your Side</h3>

      <button
        onClick={() => setSide("Support")}
      >
        Support
      </button>

      <button
        onClick={() => setSide("Oppose")}
      >
        Oppose
      </button>

      <p>
        <strong>Your Side:</strong>{" "}
        {side}
      </p>

      <h3>Post Argument</h3>

      <textarea
        rows="5"
        cols="50"
        placeholder="Enter your argument..."
        value={argument}
        onChange={(e) =>
          setArgument(e.target.value)
        }
      />


      <button onClick={submitArgument}>
        Post Argument
      </button>
      <h2>Arguments</h2>

      {argumentsList.length === 0 ? (
        <p>No arguments yet.</p>
      ) : (
        argumentsList.map((arg) => (
          <div
            key={arg.id}
            style={{
              border: "1px solid black",
              padding: "10px",
              margin: "10px 0",
            }}
          >
            <p>
              <strong>Side:</strong>{" "}
              {arg.side}
            </p>

            <p>{arg.argument}</p>

            <p>
              <strong>Votes:</strong>{" "}
              {arg.votes}
            </p>

            <button
              onClick={() =>
                handleVote(arg.id, "up")
              }
            >
              👍 Upvote
            </button>

            <button
              onClick={() =>
                handleVote(arg.id, "down")
              }
            >
              👎 Downvote
            </button>
          </div>
        ))
      )}


      <h2>
        Winner: {calculateWinner()}
      </h2>
    </div>
  );
}

export default DebateRoom;