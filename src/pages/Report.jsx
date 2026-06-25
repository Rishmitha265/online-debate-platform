import { useState } from "react";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../services/firebase";

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
    <div>
      <h1>Report Content</h1>

      <textarea
        rows="5"
        cols="50"
        placeholder="Why are you reporting?"
        value={reportText}
        onChange={(e) =>
          setReportText(
            e.target.value
          )
        }
      />

      <br />

      <button
        onClick={submitReport}
      >
        Submit Report
      </button>
    </div>
  );
}

export default Report;