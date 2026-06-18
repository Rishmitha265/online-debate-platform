import { useState, useEffect } from "react";
import { collection,getDocs,query,orderBy} from "firebase/firestore";

import { db } from "../services/firebase";
import { getAuth } from "firebase/auth";

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

      setNotifications(data);

    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div>

      <h1>Notifications 🔔</h1>

      {notifications.length === 0 ? (
        <p>No notifications yet</p>
      ) : (
        notifications.map((item) => (
          <div
            key={item.id}
            style={{
              border: "1px solid gray",
              padding: "10px",
              margin: "10px",
            }}
          >
            <p>{item.message}</p>

            <small>
              {item.createdAt?.toDate?.()
                ?.toLocaleString?.() || ""}
            </small>
          </div>
        ))
      )}

    </div>
  );
}

export default Notifications;