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
     <div className="min-h-screen bg-brand-bg p-8">

      <PageNavigator/>

    <h1 className="text-5xl font-bold text-center text-brand-purple mb-10">
      🔔 Notifications
    </h1>

    {notifications.length === 0 ? (

      <div className="text-center text-brand-text text-xl">
        No notifications yet
      </div>

    ) : (

      <div className="max-w-4xl mx-auto space-y-6">

        {notifications.map((item) => (

          <div
            key={item.id}
            className="bg-brand-bg border border-brand-border rounded-2xl shadow-xl p-6 hover:shadow-2xl transition duration-300"
          >

            <div className="flex justify-between items-center">

              <div>

                <h2 className="text-xl font-bold text-brand-navy mb-2">
                  📢 New Notification
                </h2>

                
                <div>
                <p className="text-brand-text">
                  {item.message}
                </p>

                <p className="text-brand-text text-sm mt-1">
                  Debate:<span className="font-bold text-brand-purple ml-1">
                    {item.debateTitle}
                  </span>
                </p>
                </div>

              </div>

              <div className="text-sm text-brand-text text-right">

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