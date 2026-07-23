import { Link } from "react-router-dom";

function DebateCard({ debate }) {
  return (
    <div className="glass-card group flex flex-col h-full p-6 transition-all duration-300 hover:-translate-y-1 hover:border-brand-purple/50 relative">

      {debate.live && (
        <span className="absolute top-4 right-4 inline-flex items-center gap-1.5 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full animate-pulse z-10">
          <span className="h-2 w-2 rounded-full bg-white"></span>
          LIVE
        </span>
      )}

      <div className="mb-4 flex flex-wrap items-center gap-2">
        {debate.category && (
          <span className="rounded-full bg-brand-purple/15 px-3 py-1 text-xs font-medium text-brand-purple">
            {debate.category}
          </span>
        )}
        {debate.formate && (
          <span className="rounded-full bg-brand-blue/15 px-3 py-1 text-xs font-medium text-brand-blue">
            {debate.formate}
          </span>
        )}
        {debate.roomType && (
          <span className="rounded-full bg-brand-pink/15 px-3 py-1 text-xs font-medium text-brand-pink">
            {debate.roomType}
          </span>
        )}
      </div>

      <img 
        src={debate.image}
        alt={debate.title}
        className="w-full aspect-video object-cover rounded-xl shadow-lg mb-4"/>

      <h2 className="text-2xl font-bold text-brand-navy mb-3 leading-tight">
        {debate.title}
      </h2>

      <p className="text-brand-text text-sm mb-5 line-clamp-4">
        {debate.description}
      </p>

      <div className="mt-auto grid grid-cols-1 gap-2 text-xs text-brand-text mb-5">
        <p>
          <span className="font-semibold text-brand-navy/90">Category:</span>{" "}
          {debate.category}
        </p>
        <p>
          <span className="font-semibold text-brand-navy/90">Format:</span>{" "}
          {debate.formate}
        </p>
        <p>
          <span className="font-semibold text-brand-navy/90">Room:</span>{" "}
          {debate.roomType}
        </p>
      </div>

      <Link
        to={`/debate/${debate.id}`}
        className={`block rounded-xl py-3 text-center font-semibold transition ${
          debate.live
            ? "bg-red-600 hover:bg-red-700 text-white"
            : "btn-gradient"
        }`}
      >
        {debate.live ? "🔴 Join Live Debate" : "Join Debate →"}
      </Link>
    </div>
  );
}

export default DebateCard;