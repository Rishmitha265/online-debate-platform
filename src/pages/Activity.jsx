import { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import {collection,getDocs,query,where,} from "firebase/firestore";
import { db } from "../services/firebase";
import PageNavigator from "../components/PageNavigator";

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
  <div className="min-h-screen bg-brand-bg text-brand-navy py-12 px-6">

    <PageNavigator/>

    <h1 className="text-5xl font-bold text-center mb-12">
      📜 Activity History
    </h1>

    <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="bg-brand-bg border border-brand-border rounded-2xl shadow-xl p-6">

        <h2 className="text-3xl font-bold text-center text-brand-navy mb-4">
          🗣 Arguments
        </h2>

        <p className="text-center font-semibold text-brand-purple mb-6">
          Total Arguments : {argumentsList.length}
        </p>

        {argumentsList.length === 0 ? (

          <p className="text-center text-brand-text">
            No arguments posted.
          </p>

        ) : (

          <div className="space-y-4">

            {argumentsList.map((arg) => (

              <div
                key={arg.id}
                className="bg-purple-950/30 rounded-lg p-4 border border-brand-border"
              >
                <p className="text-brand-navy">
                  {arg.argument}
                </p>
              </div>

            ))}

          </div>

        )}

      </div>
      <div className="bg-brand-bg border border-brand-border rounded-2xl shadow-xl p-6">

        <h2 className="text-3xl font-bold text-center text-brand-navy mb-4">
          💬 Replies
        </h2>

        <p className="text-center font-semibold text-green-400 mb-6">
          Total Replies : {replies.length}
        </p>

        {replies.length === 0 ? (

          <p className="text-center text-brand-text">
            No replies posted.
          </p>

        ) : (

          <div className="space-y-4">

            {replies.map((reply) => (

              <div
                key={reply.id}
                className="bg-purple-950/30 rounded-lg p-4 border border-brand-border"
              >
                <p className="text-brand-navy">
                  {reply.reply}
                </p>
              </div>

            ))}

          </div>

        )}

      </div>
      <div className="bg-brand-bg border border-brand-border rounded-2xl shadow-xl p-6">

        <h2 className="text-3xl font-bold text-center text-brand-navy mb-4">
          📩 Messages
        </h2>

        <p className="text-center font-semibold text-brand-blue mb-6">
          Total Messages : {messages.length}
        </p>

        {messages.length === 0 ? (

          <p className="text-center text-brand-text">
            No messages sent.
          </p>

        ) : (

          <div className="space-y-4">

            {messages.map((msg) => (

              <div
                key={msg.id}
                className="bg-purple-950/30 rounded-lg p-4 border border-brand-border"
              >
                <p className="text-brand-navy">
                  {msg.message}
                </p>
              </div>

            ))}

          </div>

        )}

      </div>

    </div>

  </div>
);



}

export default Activity;