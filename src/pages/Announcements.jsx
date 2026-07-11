import {collection,getDocs,} from "firebase/firestore";

import { useEffect,useState,} from "react";

import { db } from "../services/firebase";

import PageNavigator from "../components/PageNavigator";
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
    <div className="min-h-screen bg-brand-bg py-10 px-6">

      <PageNavigator/>

    <h1 className="text-5xl font-bold text-brand-navy text-center mb-10">
      📢 Announcements
    </h1>

    {announcements.length === 0 ? (
      <p className="text-center text-brand-text text-lg">
        No announcements available
      </p>
    ) : (
      <div className="max-w-4xl mx-auto space-y-6">
        {announcements.map((item) => (
          <div
            key={item.id}
            className="bg-brand-bg border border-brand-border rounded-xl shadow-lg p-6"
          >
            <h3 className="text-2xl font-bold text-brand-purple mb-3">
              {item.title}
            </h3>

            <p className="text-brand-text text-lg">
              {item.message}
            </p>
          </div>
        ))}
      </div>
    )}

  </div>
  );
}

export default Announcements;