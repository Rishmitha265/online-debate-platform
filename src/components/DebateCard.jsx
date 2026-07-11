import { Link } from "react-router-dom";

function DebateCard({ debate }) {
  return (
    <div className="flex flex-col h-full bg-brand-bg border border-brand-border rounded-xl p-6 shadow-sm">

      <h2 className="text-3xl font-bold text-brand-navy mb-4">
        {debate.title}
      </h2>

      <p className="text-brand-text mb-4">
        {debate.description}
      </p>

      <p className="mb-2">
        <span className="font-bold text-brand-navy">
          Category:
        </span>{" "}
        <span className="text-brand-text">
          {debate.category}
        </span>
      </p>

      <p className="mb-2">
        <span className="font-bold text-brand-navy">
          Format:
        </span>{" "}
        <span className="text-brand-text">
          {debate.formate}
        </span>
      </p>

      <p className="mb-5">
        <span className="font-bold text-brand-navy">
          Room Type:
        </span>{" "}
        <span className="text-brand-text">
          {debate.roomType}
        </span>
      </p>

      <Link
        to={`/debate/${debate.id}`}
        className="mt-auto bg-brand-purple hover:bg-brand-purple-dark text-white py-3 rounded-xl font-semibold transition text-center"
      >
        Join Debate ➡️
      </Link>

    </div>
  );
}

export default DebateCard;