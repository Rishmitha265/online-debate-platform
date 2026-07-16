import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaHome } from "react-icons/fa";

function PageNavigator() {
  const navigate = useNavigate();

  return (
    <div className="flex justify-between items-center w-full mb-6">
      <button
        onClick={() => navigate(-1)}
        className="btn-ghost-glow grid h-11 w-11 place-items-center rounded-xl"
        aria-label="Go back"
      >
        <FaArrowLeft />
      </button>

      <button
        onClick={() => navigate("/")}
        className="btn-gradient grid h-11 w-11 place-items-center rounded-xl"
        aria-label="Go home"
      >
        <FaHome />
      </button>
    </div>
  );
}

export default PageNavigator;
