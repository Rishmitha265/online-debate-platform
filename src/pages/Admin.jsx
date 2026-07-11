import { useEffect, useState } from "react";
import {collection,getDocs,updateDoc,doc,} from "firebase/firestore";
import { db } from "../services/firebase";
import PageNavigator from "../components/PageNavigator";

function Admin() {

  const [totalDebates, setTotalDebates] = useState(0);
  const [totalArguments, setTotalArguments] = useState(0);
  const [totalReplies, setTotalReplies] = useState(0);
  const [totalMessages, setTotalMessages] = useState(0);

  const [users, setUsers] = useState([]);
  const [debates, setDebates] = useState([]);

  useEffect(() => {
    fetchStats();
    fetchUsers();
    fetchDebates();
  }, []);

  //Statistics

  const fetchStats = async () => {
    try {

      const debatesSnapshot = await getDocs(
        collection(db, "debates")
      );

      const argumentsSnapshot = await getDocs(
        collection(db, "arguments")
      );

      const repliesSnapshot = await getDocs(
        collection(db, "replies")
      );

      const messagesSnapshot = await getDocs(
        collection(db, "chats")
      );

      setTotalDebates(debatesSnapshot.size);
      setTotalArguments(argumentsSnapshot.size);
      setTotalReplies(repliesSnapshot.size);
      setTotalMessages(messagesSnapshot.size);

    } catch (error) {
      console.log(error);
    }
  };

  //Users

  const fetchUsers = async () => {

    const snapshot = await getDocs(collection(db, "users"));

    const data = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    setUsers(data);
  };

  const banUser = async (userId) => {

    try {

      await updateDoc(doc(db, "users", userId), {
        banned: true,
      });

      fetchUsers();

    } catch (error) {
      console.log(error);
    }
  };

  const unbanUser = async (userId) => {

    try {

      await updateDoc(doc(db, "users", userId), {
        banned: false,
      });

      fetchUsers();

    } catch (error) {
      console.log(error);
    }
  };

  // ------------------ Debates ------------------

  const fetchDebates = async () => {

    try {

      const snapshot = await getDocs(
        collection(db, "debates")
      );

      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setDebates(data);

    } catch (error) {
      console.log(error);
    }
  };

  // Only one debate will remain featured

  const featureDebate = async (debateId) => {

    try {

      const snapshot = await getDocs(
        collection(db, "debates")
      );

      for (const item of snapshot.docs) {

        await updateDoc(item.ref, {
          featured: false,
        });

      }

      await updateDoc(
        doc(db, "debates", debateId),
        {
          featured: true,
        }
      );

      alert("Debate Featured Successfully");

      fetchDebates();

    } catch (error) {
      console.log(error);
    }
  };

 return (

   <div className="min-h-screen bg-brand-bg text-brand-navy py-10 px-6">

      <PageNavigator/>

      <h1 className="text-5xl font-bold text-center mb-10">
        👨‍💼 Admin Dashboard
      </h1>

      <div className="bg-brand-bg border border-brand-border rounded-2xl p-8 text-brand-navy shadow-xl">

        <h2 className="text-3xl font-bold text-center mb-8">
          👥 User Management
        </h2>

        {users.map((user) => (

          <div
            key={user.id}
            className="border border-brand-border rounded-xl p-5 mb-5 flex justify-between items-center shadow-sm"
          >

            <div>

              <p className="text-lg font-semibold">
                Email : {user.email}
              </p>

              <p className="mt-2">

                <strong>Status :</strong>{" "}

                <span
                  className={
                    user.banned
                      ? "text-red-400 font-semibold"
                      : "text-green-400 font-semibold"
                  }
                >
                  {user.banned ? "Banned" : "Active"}
                </span>

              </p>

            </div>

            {user.banned ? (

              <button
                onClick={() => unbanUser(user.id)}
                className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg"
              >
                Unban User
              </button>

            ) : (

              <button
                onClick={() => banUser(user.id)}
                className="bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-lg"
              >
                Ban User
              </button>

            )}

          </div>

        ))}

      </div>

      <div className="bg-brand-bg border border-brand-border rounded-2xl p-8 text-brand-navy shadow-xl mt-12">

        <h2 className="text-3xl font-bold text-center mb-8">
          ⭐ Feature Debate
        </h2>

        {debates.map((debate) => (

          <div
            key={debate.id}
            className="border border-brand-border rounded-xl p-5 mb-5 flex justify-between items-center"
          >

            <div>

              <h3 className="text-xl font-bold">
                {debate.title}
              </h3>

              <p className="mt-2 text-brand-text">
                <strong>Category :</strong>{" "}
                {debate.category}
              </p>

              {debate.featured && (

                <span className="inline-block mt-3 bg-yellow-400 text-black px-3 py-1 rounded-full font-semibold">
                  ⭐ Featured
                </span>

              )}

            </div>

            <button
              onClick={() => featureDebate(debate.id)}
              className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-2 rounded-lg"
            >
              ⭐ Feature
            </button>

          </div>

        ))}

      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mt-14">

        <div className="bg-brand-bg border border-brand-border rounded-2xl shadow-xl p-8 text-center">

          <h3 className="text-2xl font-bold text-brand-navy">
            📚 Total Debates
          </h3>

          <p className="text-5xl font-bold text-brand-purple mt-5">
            {totalDebates}
          </p>

        </div>

        <div className="bg-brand-bg border border-brand-border rounded-2xl shadow-xl p-8 text-center">

          <h3 className="text-2xl font-bold text-brand-navy">
            💬 Total Arguments
          </h3>

          <p className="text-5xl font-bold text-green-400 mt-5">
            {totalArguments}
          </p>

        </div>

        <div className="bg-brand-bg border border-brand-border rounded-2xl shadow-xl p-8 text-center">

          <h3 className="text-2xl font-bold text-brand-navy">
            📝 Total Replies
          </h3>

          <p className="text-5xl font-bold text-yellow-500 mt-5">
            {totalReplies}
          </p>

        </div>

        <div className="bg-brand-bg border border-brand-border rounded-2xl shadow-xl p-8 text-center">

          <h3 className="text-2xl font-bold text-brand-navy">
            📨 Total Messages
          </h3>

          <p className="text-5xl font-bold text-red-400 mt-5">
            {totalMessages}
          </p>

        </div>

      </div>

    </div>
  );
}

export default Admin;