import { useState } from "react";
import { collection, addDoc } from "firebase/firestore";
import { db, auth } from "../services/firebase";
import PageNavigator from "../components/PageNavigator";

function CreateDebate() {
  const [title, setTitle] = useState("");
  const [roomType, setRoomType] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [formate, setFormate] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");

  const handleCreateDebate = async () => {
    if (!auth.currentUser) {
      alert("Please login first.");
      return;
    }

    const endTime=new Date(
      Date.now() + 5*60*1000
    );

    try {
      await addDoc(collection(db, "debates"), {
        title,
        description,
        category,
        formate,
        roomType,

        supportVotes: 0,
        opposeVotes: 0,
        neutralVotes: 0,      // Initialize vote counts for each team

        userEmail: auth.currentUser.email,
        createdAt: new Date(),
        endTime: endTime,
        
      });

      // Send notification only for Invite Only rooms
      if (roomType === "Invite Only" && inviteEmail) {
        await addDoc(collection(db, "notifications"), {
          userEmail: inviteEmail,
          message: `You have been invited to join "${title}"`,
          createdAt: new Date(),
        });
      }

      alert("Debate Created Successfully!");

      // Clear all fields
      setTitle("");
      setDescription("");
      setCategory("");
      setFormate("");
      setRoomType("");
      setInviteEmail("");
    } catch (error) {
      console.log(error);
      alert(error.message);
    }
  };

    return (
    <div className="max-w-3xl mx-auto">
      <PageNavigator/>
       <div className="bg-brand-bg border border-brand-border rounded-2xl shadow-xl p-8">

        <h1 className="text-4xl font-bold text-center text-brand-purple mb-8">
          🗣️ Create Debate
        </h1>

        <div className="space-y-5">

          <input
            type="text"
            placeholder="Debate Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-brand-bg border border-brand-input-border rounded-lg p-3"
          />

          <textarea
            placeholder="Debate Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={5}
            className="w-full bg-brand-bg border border-brand-input-border rounded-lg p-3"
          />

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full bg-brand-bg border border-brand-input-border rounded-lg p-3"
          >
            <option value="">Select Category</option>
            <option value="Technology">Technology</option>
            <option value="Education">Education</option>
            <option value="Sports">Sports</option>
            <option value="Politics">Politics</option>
            <option value="Pollution">Pollution</option>
            <option value="Science">Science</option>
            <option value="Business">Business</option>
            <option value="Environment">Environment</option>
            <option value="AI">AI</option>
            <option value="Entertainment">Entertainment</option>
            <option value="Philosophy">Philosophy</option>
            <option value="Ethics">Ethics</option>
            <option value="Health">Health</option>
            <option value="Startups">Startups</option>
          </select>

          <select
            value={formate}
            onChange={(e) => setFormate(e.target.value)}
            className="w-full bg-brand-bg border border-brand-input-border rounded-lg p-3"
          >
            <option value="">Debate Format</option>
            <option value="1 vs 1">1 vs 1</option>
            <option value="2 vs 2">2 vs 2</option>
            <option value="5 vs 5">5 vs 5</option>
            <option value="10 vs 10">10 vs 10</option>
          </select>

          <select
            value={roomType}
            onChange={(e) => setRoomType(e.target.value)}
            className="w-full bg-brand-bg border border-brand-input-border rounded-lg p-3"
          >
            <option value="">Room Type</option>
            <option value="Public">Public</option>
            <option value="Invite Only">Invite Only</option>
          </select>

          {roomType === "Invite Only" && (
            <input
              type="email"
              placeholder="Invite User Email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              className="w-full bg-brand-bg border border-brand-input-border rounded-lg p-3"
            />
          )}

          <button
            onClick={handleCreateDebate}
            className="w-full bg-brand-purple hover:bg-brand-purple-dark text-white font-bold py-3 rounded-lg transition"
          >
            Create Debate
          </button>

        </div>
      </div>
    </div>
  );
}

export default CreateDebate;