import { useEffect, useState } from "react";
import { collection, getDocs, updateDoc, doc } from "firebase/firestore";
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

  const fetchStats = async () => {
    try {
      const debatesSnapshot = await getDocs(collection(db, "debates"));
      const argumentsSnapshot = await getDocs(collection(db, "arguments"));
      const repliesSnapshot = await getDocs(collection(db, "replies"));
      const messagesSnapshot = await getDocs(collection(db, "chats"));

      setTotalDebates(debatesSnapshot.size);
      setTotalArguments(argumentsSnapshot.size);
      setTotalReplies(repliesSnapshot.size);
      setTotalMessages(messagesSnapshot.size);
    } catch (error) {
      console.log(error);
    }
  };

  const fetchUsers = async () => {
    const snapshot = await getDocs(collection(db, "users"));
    const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    setUsers(data);
  };

  const banUser = async (userId) => {
    try {
      await updateDoc(doc(db, "users", userId), { banned: true });
      fetchUsers();
    } catch (error) {
      console.log(error);
    }
  };

  const unbanUser = async (userId) => {
    try {
      await updateDoc(doc(db, "users", userId), { banned: false });
      fetchUsers();
    } catch (error) {
      console.log(error);
    }
  };

  const fetchDebates = async () => {
    try {
      const snapshot = await getDocs(collection(db, "debates"));
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setDebates(data);
    } catch (error) {
      console.log(error);
    }
  };

  const featureDebate = async (debateId) => {
    try {
      const snapshot = await getDocs(collection(db, "debates"));
      for (const item of snapshot.docs) {
        await updateDoc(item.ref, { featured: false });
      }
      await updateDoc(doc(db, "debates", debateId), { featured: true });
      alert("Debate Featured Successfully");
      fetchDebates();
    } catch (error) {
      console.log(error);
    }
  };

  const stats = [
    { label: "📚 Total Debates", value: totalDebates, accent: "from-purple-300 to-fuchsia-300" },
    { label: "💬 Total Arguments", value: totalArguments, accent: "from-emerald-300 to-teal-300" },
    { label: "📝 Total Replies", value: totalReplies, accent: "from-amber-300 to-yellow-300" },
    { label: "📨 Total Messages", value: totalMessages, accent: "from-rose-300 to-pink-300" },
  ];

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0a0410] text-white py-10 px-6">
      <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 h-[600px] w-[900px] rounded-full bg-purple-600/25 blur-[140px]" />
      <div className="pointer-events-none absolute top-1/3 right-0 h-[420px] w-[520px] rounded-full bg-fuchsia-500/20 blur-[130px]" />
      <div className="pointer-events-none absolute bottom-0 left-0 h-[420px] w-[520px] rounded-full bg-blue-600/20 blur-[130px]" />

      <div className="relative z-10">
        <PageNavigator />

        <h1 className="text-5xl font-bold text-center mb-10 bg-gradient-to-r from-purple-300 via-fuchsia-300 to-blue-300 bg-clip-text text-transparent">
          👨‍💼 Admin Dashboard
        </h1>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-[0_20px_60px_-20px_rgba(168,85,247,0.35)]">
          <h2 className="text-3xl font-bold text-center mb-8 bg-gradient-to-r from-fuchsia-300 to-purple-300 bg-clip-text text-transparent">
            👥 User Management
          </h2>

          {users.map((user) => (
            <div
              key={user.id}
              className="border border-white/10 bg-white/5 rounded-xl p-5 mb-5 flex justify-between items-center hover:bg-white/10 hover:border-white/20 transition"
            >
              <div>
                <p className="text-lg font-semibold text-white">
                  Email : <span className="text-white/80">{user.email}</span>
                </p>

                <p className="mt-2 text-white/70">
                  <strong className="text-white">Status :</strong>{" "}
                  <span
                    className={
                      user.banned
                        ? "text-rose-400 font-semibold"
                        : "text-emerald-400 font-semibold"
                    }
                  >
                    {user.banned ? "Banned" : "Active"}
                  </span>
                </p>
              </div>

              {user.banned ? (
                <button
                  onClick={() => unbanUser(user.id)}
                  className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:opacity-90 text-white px-5 py-2 rounded-lg font-semibold shadow-lg shadow-emerald-500/30"
                >
                  Unban User
                </button>
              ) : (
                <button
                  onClick={() => banUser(user.id)}
                  className="bg-gradient-to-r from-rose-500 to-pink-600 hover:opacity-90 text-white px-5 py-2 rounded-lg font-semibold shadow-lg shadow-rose-500/30"
                >
                  Ban User
                </button>
              )}
            </div>
          ))}
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-[0_20px_60px_-20px_rgba(168,85,247,0.35)] mt-12">
          <h2 className="text-3xl font-bold text-center mb-8 bg-gradient-to-r from-amber-300 to-yellow-200 bg-clip-text text-transparent">
            ⭐ Feature Debate
          </h2>

          {debates.map((debate) => (
            <div
              key={debate.id}
              className="border border-white/10 bg-white/5 rounded-xl p-5 mb-5 flex justify-between items-center hover:bg-white/10 hover:border-white/20 transition"
            >
              <div>
                <h3 className="text-xl font-bold text-white">{debate.title}</h3>

                <p className="mt-2 text-white/70">
                  <strong className="text-white">Category :</strong>{" "}
                  {debate.category}
                </p>

                {debate.featured && (
                  <span className="inline-block mt-3 bg-gradient-to-r from-amber-400 to-yellow-300 text-black px-3 py-1 rounded-full font-semibold shadow-lg shadow-amber-500/30">
                    ⭐ Featured
                  </span>
                )}
              </div>

              <button
                onClick={() => featureDebate(debate.id)}
                className="bg-gradient-to-r from-amber-500 to-orange-500 hover:opacity-90 text-white px-6 py-2 rounded-lg font-semibold shadow-lg shadow-amber-500/30"
              >
                ⭐ Feature
              </button>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mt-14">
          {stats.map((s) => (
            <div
              key={s.label}
              className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 text-center shadow-[0_20px_60px_-20px_rgba(168,85,247,0.35)] overflow-hidden"
            >
              <div className="pointer-events-none absolute -inset-px rounded-2xl bg-gradient-to-br from-white/10 to-transparent opacity-60" />
              <h3 className="relative text-xl font-semibold text-white/80">
                {s.label}
              </h3>
              <p className={`relative text-5xl font-bold mt-5 bg-gradient-to-r ${s.accent} bg-clip-text text-transparent`}>
                {s.value}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Admin;
