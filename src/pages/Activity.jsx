import { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../services/firebase";
import PageNavigator from "../components/PageNavigator";

function Activity() {
  const [argumentsList, setArgumentsList] = useState([]);
  const [messages, setMessages] = useState([]);
  const [replies, setReplies] = useState([]);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        fetchActivity(user);
      }
    });
    return () => unsubscribe();
  }, []);

  const fetchActivity = async (user) => {
    try {
      const argumentsQuery = query(
        collection(db, "arguments"),
        where("userEmail", "==", user.email)
      );
      const argumentsSnapshot = await getDocs(argumentsQuery);
      setArgumentsList(
        argumentsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      );

      const messagesQuery = query(
        collection(db, "chats"),
        where("userEmail", "==", user.email)
      );
      const messagesSnapshot = await getDocs(messagesQuery);
      setMessages(
        messagesSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      );

      const repliesQuery = query(
        collection(db, "replies"),
        where("userEmail", "==", user.email)
      );
      const repliesSnapshot = await getDocs(repliesQuery);
      setReplies(
        repliesSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      );
    } catch (error) {
      console.log(error);
    }
  };

  const sections = [
    {
      icon: "🗣",
      title: "Arguments",
      accent: "from-fuchsia-400 to-purple-400",
      dot: "bg-fuchsia-400",
      count: argumentsList.length,
      empty: "No arguments posted.",
      items: argumentsList.map((a) => ({ id: a.id, text: a.argument })),
    },
    {
      icon: "💬",
      title: "Replies",
      accent: "from-emerald-300 to-teal-300",
      dot: "bg-emerald-400",
      count: replies.length,
      empty: "No replies posted.",
      items: replies.map((r) => ({ id: r.id, text: r.reply })),
    },
    {
      icon: "📩",
      title: "Messages",
      accent: "from-sky-300 to-indigo-300",
      dot: "bg-sky-400",
      count: messages.length,
      empty: "No messages sent.",
      items: messages.map((m) => ({ id: m.id, text: m.message })),
    },
  ];

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0a0410] text-white py-12 px-6">
      <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 h-[560px] w-[900px] rounded-full bg-purple-600/25 blur-[140px]" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-[420px] w-[560px] rounded-full bg-fuchsia-500/20 blur-[130px]" />
      <div className="pointer-events-none absolute bottom-0 left-0 h-[420px] w-[560px] rounded-full bg-blue-600/20 blur-[130px]" />

      <div className="relative z-10">
        <PageNavigator />

        <h1 className="text-5xl font-bold text-center mb-12 bg-gradient-to-r from-purple-300 via-fuchsia-300 to-blue-300 bg-clip-text text-transparent">
          📜 Activity History
        </h1>

        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
          {sections.map((s) => (
            <div
              key={s.title}
              className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-[0_20px_60px_-20px_rgba(168,85,247,0.35)] p-6"
            >
              <h2 className={`text-3xl font-bold text-center mb-4 bg-gradient-to-r ${s.accent} bg-clip-text text-transparent`}>
                {s.icon} {s.title}
              </h2>

              <p className="text-center font-semibold text-white/70 mb-6">
                Total {s.title} :{" "}
                <span className="text-white">{s.count}</span>
              </p>

              {s.count === 0 ? (
                <p className="text-center text-white/50">{s.empty}</p>
              ) : (
                <div className="space-y-4">
                  {s.items.map((it) => (
                    <div
                      key={it.id}
                      className="relative bg-white/5 rounded-xl p-4 border border-white/10 hover:border-white/20 hover:bg-white/10 transition"
                    >
                      <span className={`absolute left-0 top-3 bottom-3 w-1 rounded-r ${s.dot}`} />
                      <p className="text-white/90 pl-2">{it.text}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Activity;
