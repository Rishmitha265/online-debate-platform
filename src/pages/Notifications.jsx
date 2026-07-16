//Notifications.jsx

import { useState, useEffect } from "react";
import { collection,getDocs,query,orderBy} from "firebase/firestore";

import { db } from "../services/firebase";
import { getAuth } from "firebase/auth";
import PageNavigator from "../components/PageNavigator";

function Notifications() {

  const [notifications, setNotifications] =
    useState([]);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {

    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) return;

    try {

      const q = query(
        collection(db, "notifications"),
        orderBy("createdAt", "desc")
      );

      const snapshot = await getDocs(q);

      const data = snapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        .filter(
          (item) =>
            item.userEmail === user.email
        );

        console.log("Current User:", user.email);
        console.log("Notifications:", data);

      setNotifications(data);

      console.log("Notifications:",data)

    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_rgba(139,92,246,0.15),_transparent_60%),radial-gradient(ellipse_at_bottom,_rgba(59,130,246,0.12),_transparent_60%)] bg-[#07070d] text-white p-8">

      <PageNavigator/>

      <h1 className="text-5xl font-extrabold text-center mb-12 bg-gradient-to-r from-purple-400 via-fuchsia-400 to-blue-400 bg-clip-text text-transparent">
        🔔 Notifications
      </h1>

      {notifications.length === 0 ? (

        <div className="text-center text-white/60 text-xl">
          No notifications yet
        </div>

      ) : (

        <div className="max-w-4xl mx-auto space-y-6">

          {notifications.map((item) => (

            <div
              key={item.id}
              className="relative overflow-hidden bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-[0_20px_60px_-20px_rgba(168,85,247,0.35)] p-6 hover:border-fuchsia-500/30 hover:shadow-[0_25px_70px_-15px_rgba(217,70,239,0.5)] transition-all duration-300"
            >
              <div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-purple-500 via-fuchsia-500 to-blue-500" />

              <div className="flex justify-between items-center gap-4">

                <div className="min-w-0">

                  <h2 className="text-xl font-bold mb-2 bg-gradient-to-r from-fuchsia-300 to-purple-300 bg-clip-text text-transparent">
                    📢 New Notification
                  </h2>

                  <div>
                    <p className="text-white/85">{item.message}</p>

                    <p className="text-white/50 text-sm mt-1">
                      Debate:
                      <span className="font-semibold text-fuchsia-300 ml-1">
                        {item.debateTitle}
                      </span>
                    </p>
                  </div>

                </div>

                <div className="text-sm text-white/40 text-right shrink-0">
                  {item.createdAt?.toDate?.().toLocaleString()}
                </div>

              </div>
            </div>

          ))}

        </div>

      )}

    </div>
  );
}

export default Notifications;
