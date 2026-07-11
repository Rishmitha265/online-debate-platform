import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaHome } from "react-icons/fa";

function PageNavigator() {
  const navigate = useNavigate();

  return (
    <div className="flex justify-between items-center w-full mb-6">
      <button
        onClick={() => navigate(-1)}
        className="bg-brand-secondary hover:bg-brand-secondary-hover text-white p-3 rounded-lg shadow-md"
      >
        <FaArrowLeft />
      </button>

      <button
        onClick={() => navigate("/")}
        className="bg-brand-purple hover:bg-brand-purple-dark text-white p-3 rounded-lg shadow-md"
      >
        <FaHome />
      </button>
    </div>
  );
}

export default PageNavigator;