import { useState } from "react";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../services/firebase";
import PageNavigator from "../components/PageNavigator";

function Report() {
  const [reportText, setReportText] =
    useState("");

  const submitReport = async () => {
    if (!reportText) {
      alert("Enter report reason");
      return;
    }

    try {
      await addDoc(
        collection(db, "reports"),
        {
          reason: reportText,
          status:"Pending",
          createdAt: new Date(),
        }
      );

      alert("Report Submitted");
      setReportText("");
    } catch (error) {
      console.log(error);
    }
  };

  return (
     <div className="min-h-screen bg-brand-bg flex items-center justify-center px-6 py-10">

    <div className="bg-brand-bg border border-brand-border w-full max-w-2xl rounded-3xl shadow-2xl p-10">

      <PageNavigator/>

      <h1 className="text-5xl font-bold text-center text-brand-navy mb-8">
        🚩 Report Content
      </h1>

      <p className="text-center text-brand-text mb-8">
        Help us keep DebateHub safe by reporting inappropriate content.
      </p>

      <textarea
        rows="7"
        placeholder="Why are you reporting this content?"
        value={reportText}
        onChange={(e) => setReportText(e.target.value)}
        className="w-full p-5 rounded-xl border-2 border-brand-input-border focus:border-brand-purple focus:outline-none resize-none text-lg bg-brand-bg text-brand-navy"
      />

      <div className="flex justify-center mt-8">
        <button
          onClick={submitReport}
          className="bg-red-600 hover:bg-red-700 text-white px-10 py-3 rounded-xl text-lg font-semibold transition duration-300 shadow-lg"
        >
          🚩 Submit Report
        </button>
      </div>

    </div>

  </div>
  );
}

export default Report;