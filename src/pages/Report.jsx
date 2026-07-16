import { useState } from "react";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../services/firebase";
import PageNavigator from "../components/PageNavigator";

function Report() {
  const [reportText, setReportText] = useState("");

  const submitReport = async () => {
    if (!reportText) {
      alert("Enter report reason");
      return;
    }

    try {
      await addDoc(collection(db, "reports"), {
        reason: reportText,
        status: "Pending",
        createdAt: new Date(),
      });

      alert("Report Submitted");
      setReportText("");
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0a0410] text-white flex items-center justify-center px-6 py-10">
      <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 h-[560px] w-[900px] rounded-full bg-purple-600/25 blur-[140px]" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-[420px] w-[520px] rounded-full bg-rose-500/20 blur-[130px]" />
      <div className="pointer-events-none absolute bottom-0 left-0 h-[420px] w-[520px] rounded-full bg-fuchsia-600/20 blur-[130px]" />

      <div className="relative z-10 w-full max-w-2xl">
        <PageNavigator />

        <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl shadow-[0_20px_60px_-20px_rgba(244,63,94,0.4)] p-10 overflow-hidden">
          <div className="pointer-events-none absolute -inset-px rounded-3xl bg-gradient-to-br from-white/10 to-transparent opacity-60" />

          <div className="relative">
            <h1 className="text-5xl font-bold text-center mb-6 bg-gradient-to-r from-rose-300 via-fuchsia-300 to-purple-300 bg-clip-text text-transparent">
              🚩 Report Content
            </h1>

            <p className="text-center text-white/70 mb-8">
              Help us keep DebateHub safe by reporting inappropriate content.
            </p>

            <textarea
              rows="7"
              placeholder="Why are you reporting this content?"
              value={reportText}
              onChange={(e) => setReportText(e.target.value)}
              className="w-full p-5 rounded-xl border border-white/10 focus:border-fuchsia-400/60 focus:outline-none resize-none text-lg bg-white/5 text-white placeholder-white/40 transition"
            />

            <div className="flex justify-center mt-8">
              <button
                onClick={submitReport}
                className="bg-gradient-to-r from-rose-500 via-pink-500 to-fuchsia-600 hover:opacity-90 text-white px-10 py-3 rounded-xl text-lg font-semibold transition duration-300 shadow-lg shadow-rose-500/40"
              >
                🚩 Submit Report
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Report;
