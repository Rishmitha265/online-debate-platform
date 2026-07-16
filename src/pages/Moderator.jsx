import { useState, useEffect } from "react";
import { collection, getDocs, updateDoc, doc, setDoc } from "firebase/firestore";
import { db } from "../services/firebase";
import PageNavigator from "../components/PageNavigator";

function Moderator() {
  const [report, setReport] = useState([]);
  const [muteEmail, setMuteEmail] = useState("");
  const [removeEmail, setRemoveEmail] = useState("");
  const [debateId, setDebateId] = useState("");

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const snapshot = await getDocs(collection(db, "reports"));
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setReport(data);
    } catch (error) {
      console.log(error);
    }
  };

  const markreviewed = async (id) => {
    try {
      await updateDoc(doc(db, "reports", id), { status: "Reviewed" });
      fetchReports();
      alert("The report is reviewed successfully");
    } catch (error) {
      console.log(error);
    }
  };

  const muteUser = async () => {
    if (!muteEmail) {
      alert("Enter the user Email");
    }

    try {
      await setDoc(doc(db, "mutedUser", muteEmail), {
        email: muteEmail,
        muted: true,
        createdAt: new Date(),
      });

      alert("user muted successfully");
      setMuteEmail();
    } catch (error) {
      console.log(error);
    }
  };

  const removeuser = async () => {
    if (!removeuser) {
      alert("Enter user email");
    }

    try {
      await setDoc(doc(db, "removedUsers", removeEmail), {
        email: removeEmail,
        removed: true,
        createdAt: new Date(),
      });

      alert("User removed Successfully");
      setRemoveEmail("");
    } catch (error) {
      console.log(error);
    }
  };

  const endDebate = async () => {
    if (!debateId) {
      alert("Enter Debate Id");
      return;
    }

    try {
      await updateDoc(doc(db, "debates", debateId), { ended: true });
      alert("Debate ended");
      setDebateId("");
    } catch (error) {
      console.log(error);
    }
  };

  const lockDebate = async () => {
    if (!debateId) {
      alert("enter the Debate ID");
      return;
    }

    try {
      await updateDoc(doc(db, "debates", debateId), { locked: true });
      alert("Debate Locked");
    } catch (error) {
      console.log(error);
    }
  };

  const inputCls =
    "w-full bg-white/5 border border-white/10 focus:border-fuchsia-400/60 focus:outline-none rounded-lg p-3 text-white placeholder-white/40 transition";

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0a0410] text-white p-8">
      <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 h-[600px] w-[900px] rounded-full bg-purple-600/25 blur-[140px]" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-[420px] w-[520px] rounded-full bg-fuchsia-500/20 blur-[130px]" />
      <div className="pointer-events-none absolute bottom-0 left-0 h-[420px] w-[520px] rounded-full bg-blue-600/20 blur-[130px]" />

      <div className="relative z-10">
        <PageNavigator />

        <h1 className="text-5xl font-bold text-center mb-10 bg-gradient-to-r from-purple-300 via-fuchsia-300 to-blue-300 bg-clip-text text-transparent">
          🛡 Moderator Panel
        </h1>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-[0_20px_60px_-20px_rgba(168,85,247,0.35)] p-6">
            <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-fuchsia-300 to-purple-300 bg-clip-text text-transparent">
              📋 Review Reports
            </h2>

            {report.length === 0 ? (
              <p className="text-white/60">No reports found.</p>
            ) : (
              report.map((report) => (
                <div
                  key={report.id}
                  className="border border-white/10 bg-white/5 rounded-lg p-4 mb-4 hover:border-white/20 hover:bg-white/10 transition"
                >
                  <p className="text-white/90">
                    <strong className="text-white">Reason:</strong> {report.reason}
                  </p>

                  <p className="mt-2 text-white/90">
                    <strong className="text-white">Status:</strong>
                    <span
                      className={
                        report.status === "Reviewed"
                          ? "ml-2 text-emerald-400 font-semibold"
                          : "ml-2 text-amber-300 font-semibold"
                      }
                    >
                      {report.status}
                    </span>
                  </p>

                  <button
                    onClick={() => markreviewed(report.id)}
                    className="mt-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:opacity-90 text-white px-4 py-2 rounded-lg font-semibold shadow-lg shadow-emerald-500/30"
                  >
                    Mark as Reviewed
                  </button>
                </div>
              ))
            )}
          </div>

          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-[0_20px_60px_-20px_rgba(168,85,247,0.35)] p-6">
            <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-fuchsia-300 to-purple-300 bg-clip-text text-transparent">
              ⚙ Moderator Controls
            </h2>

            <div className="mb-6">
              <input
                type="email"
                placeholder="Enter user email"
                value={muteEmail}
                onChange={(e) => setMuteEmail(e.target.value)}
                className={`${inputCls} mb-3`}
              />

              <button
                onClick={muteUser}
                className="w-full bg-gradient-to-r from-amber-500 to-yellow-500 hover:opacity-90 text-white py-3 rounded-lg font-semibold shadow-lg shadow-amber-500/30"
              >
                🔇 Mute User
              </button>
            </div>

            <input
              type="email"
              placeholder="Enter user email"
              value={removeEmail}
              onChange={(e) => setRemoveEmail(e.target.value)}
              className={`${inputCls} mb-4`}
            />

            <button
              onClick={removeuser}
              className="w-full bg-gradient-to-r from-rose-500 to-pink-600 hover:opacity-90 text-white py-3 rounded-lg mb-4 font-semibold shadow-lg shadow-rose-500/30"
            >
              ❌ Remove User
            </button>

            <input
              type="text"
              placeholder="Enter Debate ID"
              value={debateId}
              onChange={(e) => setDebateId(e.target.value)}
              className={`${inputCls} mb-4`}
            />

            <button
              onClick={endDebate}
              className="w-full bg-gradient-to-r from-sky-500 to-blue-600 hover:opacity-90 text-white py-3 rounded-lg mb-4 font-semibold shadow-lg shadow-sky-500/30"
            >
              🛑 End Debate
            </button>

            <button
              onClick={lockDebate}
              className="w-full bg-gradient-to-r from-purple-500 via-fuchsia-500 to-blue-500 hover:opacity-90 text-white py-3 rounded-lg font-semibold shadow-lg shadow-fuchsia-500/40"
            >
              🔒 Lock Debate
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Moderator;
