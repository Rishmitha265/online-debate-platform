import { collection, getDocs } from "firebase/firestore";
import { useEffect, useState } from "react";
import { db } from "../services/firebase";
import PageNavigator from "../components/PageNavigator";

function Announcements() {
  const [announcements, setAnnouncements] = useState([]);

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const snapshot = await getDocs(collection(db, "announcements"));
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setAnnouncements(data);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0a0410] text-white py-10 px-6">
      <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 h-[560px] w-[900px] rounded-full bg-purple-600/25 blur-[140px]" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-[420px] w-[520px] rounded-full bg-fuchsia-500/20 blur-[130px]" />
      <div className="pointer-events-none absolute bottom-0 left-0 h-[420px] w-[520px] rounded-full bg-blue-600/20 blur-[130px]" />

      <div className="relative z-10">
        <PageNavigator />

        <h1 className="text-5xl font-bold text-center mb-10 bg-gradient-to-r from-purple-300 via-fuchsia-300 to-blue-300 bg-clip-text text-transparent">
          📢 Announcements
        </h1>

        {announcements.length === 0 ? (
          <p className="text-center text-white/60 text-lg">
            No announcements available
          </p>
        ) : (
          <div className="max-w-4xl mx-auto space-y-6">
            {announcements.map((item) => (
              <div
                key={item.id}
                className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-[0_20px_60px_-20px_rgba(168,85,247,0.35)] p-6 hover:border-white/20 hover:bg-white/10 transition overflow-hidden"
              >
                <div className="pointer-events-none absolute -inset-px rounded-2xl bg-gradient-to-br from-white/10 to-transparent opacity-60" />
                <div className="relative">
                  <h3 className="text-2xl font-bold mb-3 bg-gradient-to-r from-fuchsia-300 to-purple-300 bg-clip-text text-transparent">
                    {item.title}
                  </h3>
                  <p className="text-white/80 text-lg leading-relaxed">
                    {item.message}
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

export default Announcements;
