import { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import {
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { db } from "../services/firebase";

function Activity() {
  const [argumentsList, setArgumentsList] =
    useState([]);

  const [messages, setMessages] =
    useState([]);

  const [replies, setReplies] =
    useState([]);

  useEffect(() => {
    const auth = getAuth();

    const unsubscribe =
      onAuthStateChanged(
        auth,
        (user) => {
          if (user) {
            fetchActivity(user);
          }
        }
      );

    return () => unsubscribe();
  }, []);

  const fetchActivity = async (
    user
  ) => {
    try {
      // Arguments
      const argumentsQuery = query(
        collection(db, "arguments"),
        where(
          "userEmail",
          "==",
          user.email
        )
      );

      const argumentsSnapshot =
        await getDocs(argumentsQuery);

      setArgumentsList(
        argumentsSnapshot.docs.map(
          (doc) => ({
            id: doc.id,
            ...doc.data(),
          })
        )
      );

      // Messages
      const messagesQuery = query(
        collection(db, "chats"),
        where(
          "userEmail",
          "==",
          user.email
        )
      );

      const messagesSnapshot =
        await getDocs(messagesQuery);

      setMessages(
        messagesSnapshot.docs.map(
          (doc) => ({
            id: doc.id,
            ...doc.data(),
          })
        )
      );

      // Replies
      const repliesQuery = query(
        collection(db, "replies"),
        where(
          "userEmail",
          "==",
          user.email
        )
      );

      const repliesSnapshot =
        await getDocs(repliesQuery);

      setReplies(
        repliesSnapshot.docs.map(
          (doc) => ({
            id: doc.id,
            ...doc.data(),
          })
        )
      );
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div>
      <h1>Activity History</h1>

      <hr />

      <h2>Arguments Posted</h2>

      <p>
        Total Arguments:{" "}
        {argumentsList.length}
      </p>

      {argumentsList.length === 0 ? (
        <p>No arguments posted.</p>
      ) : (
        argumentsList.map((arg) => (
          <div key={arg.id}>
            <p>{arg.argument}</p>
          </div>
        ))
      )}

      <hr />

      <h2>Replies Posted</h2>

      <p>
        Total Replies: {replies.length}
      </p>

      {replies.length === 0 ? (
        <p>No replies posted.</p>
      ) : (
        replies.map((reply) => (
          <div key={reply.id}>
            <p>{reply.reply}</p>
          </div>
        ))
      )}

      <hr />

      <h2>Messages Sent</h2>

      <p>
        Total Messages:{" "}
        {messages.length}
      </p>

      {messages.length === 0 ? (
        <p>No messages sent.</p>
      ) : (
        messages.map((msg) => (
          <div key={msg.id}>
            <p>{msg.message}</p>
          </div>
        ))
      )}
    </div>
  );
}

export default Activity;