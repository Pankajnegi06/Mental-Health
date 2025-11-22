import React, { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSocket } from "../context/SocketProvider";
import { FaMoon, FaSun } from "react-icons/fa";
import { toast, Toaster } from "react-hot-toast";
import {v4 as uuidv4} from "uuid";

const LobbyScreen = () => {
  const [email, setEmail] = useState("");
  const [room, setRoom] = useState("");

  const socket = useSocket();
  const navigate = useNavigate();

  function createNewRoom() {
    const myRoomid = uuidv4();
    setRoom(myRoomid);
    toast.success("New Room Created!");
  }

  const handleSubmitForm = useCallback(
    (e) => {
      e.preventDefault();
      if (!email || !room) {
        toast.error("Please Provide Complete Data");
        return;
      }
      socket.emit("room:join", { email, room });
    },
    [email, room, socket]
  );

  const handleJoinRoom = useCallback(
    (data) => {
      const { room } = data;
      navigate(`/meeting-room/${room}`, {
        state: { email },
      });
    },
    [navigate, email]
  );

  useEffect(() => {
    if (!socket) return;
    
    socket.on("room:join", handleJoinRoom);
    return () => {
      socket.off("room:join", handleJoinRoom);
    };
  }, [socket, handleJoinRoom]);

  return (
  <div className="bg-gray-100 min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
    <Toaster />
    <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-6 sm:p-8">
      <form onSubmit={handleSubmitForm} className="w-full space-y-5">
        <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-center text-gray-900">
          Join a Meeting
        </h1>

        {/* Room Number */}
        <div>
          <label
            htmlFor="room"
            className="block text-sm font-medium mb-2 text-gray-700"
          >
            Room Number
          </label>
          <input
            type="text"
            id="room"
            value={room}
            onChange={(e) => setRoom(e.target.value)}
            placeholder="Enter room ID"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#101828]"
          />
        </div>

        {/* Username */}
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium mb-2 text-gray-700"
          >
            Username
          </label>
          <input
            type="text"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your name"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#101828]"
          />
        </div>

        {/* Join Room */}
        <button
          type="submit"
          className="w-full py-2 text-base sm:text-lg font-semibold rounded-lg bg-[#101828] hover:bg-[#101929] text-white transition-all"
        >
          Join Room
        </button>

        {/* Create New Room */}
        <p className="text-sm text-center pt-6 text-gray-600">
          Don&apos;t have a room ID?{" "}
          <span
            className="cursor-pointer text-[#101828] font-semibold hover:underline "
            onClick={createNewRoom}
          >
            Create New Room
          </span>
        </p>
      </form>
    </div>
  </div>
);


};

export default LobbyScreen;