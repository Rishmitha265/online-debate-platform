import {
  collection,
  getDocs,
} from "firebase/firestore";

import {
  useEffect,
  useState,
} from "react";

import { db } from "../services/firebase";

function Announcements() {
  const [
    announcements,
    setAnnouncements,
  ] = useState([]);

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements =
    async () => {
      try {
        const snapshot =
          await getDocs(
            collection(
              db,
              "announcements"
            )
          );

        const data =
          snapshot.docs.map(
            (doc) => ({
              id: doc.id,
              ...doc.data(),
            })
          );

        setAnnouncements(data);
      } catch (error) {
        console.log(error);
      }
    };

  return (
    <div>
      <h1>Announcements</h1>

      {announcements.length ===
      0 ? (
        <p>
          No announcements
          available
        </p>
      ) : (
        announcements.map(
          (item) => (
            <div
              key={item.id}
              style={{
                border:
                  "1px solid gray",
                padding: "10px",
                margin: "10px",
              }}
            >
              <h3>
                {item.title}
              </h3>

              <p>
                {item.message}
              </p>
            </div>
          )
        )
      )}
    </div>
  );
}

export default Announcements;