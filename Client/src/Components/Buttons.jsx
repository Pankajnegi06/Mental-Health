import React from "react";
import { MdDarkMode } from "react-icons/md";
import { MdLightMode } from "react-icons/md";
import { useNavigate } from "react-router-dom";

const Buttons = ({ isLightMode, setisLightMode }) => {
  const Navigate = useNavigate();

  return (
    <>
      <div className="flex items-center gap-4">
        <button
          className={`text-white
            hover:text-yellow-600 text-white"
          transition hover:cursor-pointer`}
          onClick={() => Navigate("/login")}
        >
          Login
        </button>
        <button
          className={`text-white px-4 py-2 rounded-full  transform transition-all duration-300 active:scale-100
              bg-yellow-400  hover:bg-transparent border-1 border-yellow-400 hover:text-yellow-400  hover:cursor-pointer`}
          onClick={() => Navigate("/register")}
        >
          Register
        </button>
      </div>
    </>
  );
};

export default Buttons;