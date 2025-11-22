import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  FaHeart,
  FaLeaf,
  FaSmileBeam,
  FaStar,
  FaCloud,
  FaSpa,
} from "react-icons/fa";
import { toast, Toaster } from "react-hot-toast";
import axios from "axios";
import { FaPlus } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";
import EmbeddedBreathingExercie from "./EmbeddedBreathingExercie";
import Loader from "./Loader.jsx";

const ActualAnalyser = () => {
  const [mood, setMood] = useState("");
  const [loader, setLoader] = useState(false);
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
  const [myActualMood, setmyActualMood] = useState("");
  const [positiveResult, setpositiveResult] = useState(false);
  const [negativeResult, setnegativeResult] = useState(false);
  const [moodDescription, setMoodDescription] = useState("");
  const [savedEntries, setSavedEntries] = useState([]);

  const Navigate = useNavigate();

  // Load saved entries from localStorage on component mount
  React.useEffect(() => {
    const saved = localStorage.getItem('moodJournalEntries');
    if (saved) {
      setSavedEntries(JSON.parse(saved));
    }
  }, []);

  const handleEmojiClick = (emojiText) => {
    setMood(emojiText);
    // Small delay to ensure state is updated before submission
    setTimeout(() => {
      submitPrompt(emojiText);
    }, 10);
  };

  const handleAddJournal = async () => {
    if (!moodDescription.trim()) {
      toast.error('Please write something about your mood');
      return;
    }

    const newEntry = {
      id: Date.now(),
      mood: myActualMood,
      description: moodDescription,
      date: new Date().toISOString(),
    };

    try {
      // Save to local storage first for immediate feedback
      const updatedEntries = [newEntry, ...savedEntries];
      setSavedEntries(updatedEntries);
      localStorage.setItem('moodJournalEntries', JSON.stringify(updatedEntries));
      
      // Also save to backend if needed
      const token = localStorage.getItem('token');
      if (token) {
        await axios.post(
          `${BACKEND_URL}/api/journal/addJournal`,
          {
            moodTitle: myActualMood,
            moodDescription: moodDescription,
          },
          {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            withCredentials: true
          }
        );
      }
      
      toast.success('Mood entry saved successfully!');
      setMoodDescription('');
      
      // Close the modal after saving
      setpositiveResult(false);
      setnegativeResult(false);
    } catch (error) {
      console.error('Error saving journal entry:', error);
      // If backend save fails but local save worked, still show success
      if (savedEntries.some(entry => entry.id === newEntry.id)) {
        toast.success('Entry saved locally!');
        setMoodDescription('');
        setpositiveResult(false);
        setnegativeResult(false);
      } else {
        toast.error('Failed to save entry. Please try again.');
      }
    }
  };

  const negativeEmotions = [
    "sad",
    "angry",
    "fearful",
    "disgusted",
    "stressed",
    "tired",
    "frustrated",
    "bored",
    "lonely",
  ];

  const PositiveEmotions = [
    "happy",
    "surprised",
    "calm",
    "excited",
    "confident",
    "grateful",
    "curious",
    "loved",
    "neutral",
  ];

  function openNewScreen(merMoodMilgya) {
  const mood = merMoodMilgya.toLowerCase().trim(); // normalize

  const positiveMoods = [
    "happy",
    "surprised",
    "calm",
    "excited",
    "confident",
    "grateful",
    "curious",
    "loved",
    "neutral",
  ];

  const negativeMoods = [
    "sad",
    "angry",
    "fearful",
    "disgusted",
    "stressed",
    "tired",
    "frustrated",
    "bored",
    "lonely",
  ];

  if (positiveMoods.includes(mood)) {
    console.log("positive m aya hu");
    setpositiveResult(true);
    setnegativeResult(false);
  } else if (negativeMoods.includes(mood)) {
    console.log("negative m aya hu");
    setnegativeResult(true);
    setpositiveResult(false);
  } else {
    console.log("Mood not recognized:", mood);
  }
}




  const submitPrompt = () => {
    setLoader(true);
    if (mood == "" || mood == null) {
      toast.error("Please Provide Your Thought");
      return;
    }
    // openNewScreen();
    axios
      .post(`${BACKEND_URL}/api/mood_analysis/getMyCurrentMood`, {
        myCurrMood: mood,
      })
      .then((res) => {
        if(res.data.status==1){
          setLoader(false);
          console.log(res.data.data);
          toast.success("Mood Analyzed Successfully");
          setmyActualMood(res.data.data);
          openNewScreen(res.data.data);
        }
      })
      .catch((e) => {
        toast.error("Data not received from server");
      })
      .finally(() => {
        setMood("");
      });
  };

  return (
    <>
      <Toaster />
      <div className="relative w-full min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 overflow-hidden px-6 py-12">
        {/* Glassy Overlay */}
        {positiveResult && (
          <div className="fixed inset-0 bg-transparent bg-opacity-30 backdrop-blur-sm flex justify-center items-center z-50 p-4">
            <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden">
              {/* Header with the new gradient style */}
              <div className="w-full flex justify-between items-center bg-gradient-to-r from-purple-600 to-blue-500 p-4 sm:p-5">
                <h2 className="text-white text-2xl sm:text-2xl block mx-auto font-bold ">
                   You are feeling "{myActualMood}"
                </h2>
                <button
                  onClick={() => setpositiveResult(false)}
                  className="text-white text-xl bg-white/20 backdrop-blur-md rounded-full w-8 h-8 flex items-center justify-center hover:bg-white/30 transition-colors duration-300"
                >
                  ✕
                </button>
              </div>

              {/* Content area with updated clean styles */}
              <div className="flex flex-col gap-6 p-6 sm:p-8">
                <p className="text-gray-800 text-center text-xl sm:text-2xl font-semibold">
                  Do you want to make it memorable by adding it to your journal?
                </p>

                <textarea
                  rows="4"
                  placeholder="Write about your feelings..."
                  value={moodDescription}
                  onChange={(e) => setMoodDescription(e.target.value)}
                  className="w-full bg-gray-100 rounded-xl border-2 border-gray-200 px-4 py-3 resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                ></textarea>

                <button
                  className="w-full sm:w-auto px-8 py-3 rounded-full text-white mx-auto bg-gradient-to-r from-purple-600 to-blue-500 hover:opacity-90 active:scale-95 transition-all duration-300 flex items-center justify-center gap-2 font-semibold text-lg"
                  onClick={() => handleAddJournal()}
                >
                  <FaPlus />
                  Add Mood Entry
                </button>

                <div className="flex justify-end mt-2">
                  <p
                    onClick={() => Navigate("/mood-journal")}
                    className="text-purple-600 hover:text-purple-500 hover:underline transition-all duration-300 cursor-pointer font-medium"
                  >
                    Show all Entries
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {negativeResult && (
          <div className="fixed inset-0 h-screen backdrop-blur-sm flex justify-center items-center z-50 px-4 py-6">
            {/* FIXED: Container size corrected to prevent breaking layout */}
            <div className="w-full max-w-5xl h-full bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-fadeIn">
              {/* Header */}
              <div className="flex justify-between items-center px-6 py-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold text-xl sm:text-2xl">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-white/40 animate-pulse"></div>
                  You are feeling "{myActualMood}"
                </div>
                <button
                  onClick={() => setnegativeResult(false)}
                  className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition"
                >
                  ✕
                </button>
              </div>

              {/* Main Content */}
              <div className="flex flex-1 flex-col lg:flex-row p-4 sm:p-6 gap-6 overflow-y-auto">
                {/* Left Side */}
                <div className="lg:w-1/3 flex flex-col gap-6 justify-center">
                  <div
                    className="p-4 sm:p-6 bg-white rounded-2xl shadow-lg flex flex-col items-center justify-center gap-2 sm:gap-3 hover:scale-105 duration-300 transition-all ease-in-out cursor-pointer"
                    onClick={() => window.open("/LobbyPage", "_blank")}
                  >
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center text-white text-2xl shadow-md">
                      ✨
                    </div>
                    <h3 className="font-bold text-md sm:text-lg text-gray-800 text-center">
                      Join a Session
                    </h3>
                    <p className="text-gray-500 text-xs sm:text-sm text-center">
                      Connect with others in guided meditation
                    </p>
                  </div>

                  <div
                    className="p-4 sm:p-6 bg-white shadow-lg rounded-2xl flex flex-col items-center justify-center gap-2 sm:gap-3 hover:scale-105 duration-300 transition-all ease-in-out cursor-pointer"
                    onClick={() => window.open("/LocationTracker", "_blank")}
                  >
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r block mx-auto from-green-400 to-teal-500 items-center justify-center text-white text-2xl">
                      <p className="text-center p-2">📍</p>
                    </div>
                    <h3 className="font-bold text-md sm:text-lg text-gray-800 text-center">
                      Find Nearby
                    </h3>
                    <p className="text-gray-500 text-xs sm:text-sm text-center">
                      Discover meditation centers around you
                    </p>
                  </div>
                </div>

                {/* Right Side */}
                <div className="lg:w-2/3 flex h-fit flex-col items-center justify-center">
                   <div className="w-full h-fit flex items-center justify-center">
                     <EmbeddedBreathingExercie />
                   </div>
                </div>
              </div>

              {/* ADDED: Suggestion Box */}
              <div className="px-6 py-4 bg-slate-50 border-t border-slate-200">
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0 text-xl bg-yellow-200 text-yellow-800 rounded-full h-8 w-8 flex items-center justify-center">
                    💡
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-800">Suggestion</h4>
                    <p className="text-sm text-slate-600">
                      A calm mind is your ultimate weapon. Try to make this a daily ritual.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Floating Decorative Icons */}
        <motion.div
          initial={{ y: -20 }}
          animate={{ y: 20 }}
          transition={{
            repeat: Infinity,
            repeatType: "reverse",
            duration: 4,
          }}
          className="absolute top-10 left-10 text-pink-400 text-4xl opacity-70"
        >
          <FaHeart />
        </motion.div>
        <motion.div
          initial={{ y: 20 }}
          animate={{ y: -20 }}
          transition={{
            repeat: Infinity,
            repeatType: "reverse",
            duration: 5,
          }}
          className="absolute bottom-20 left-16 text-green-400 text-4xl opacity-70"
        >
          <FaLeaf />
        </motion.div>
        <motion.div
          initial={{ x: -20 }}
          animate={{ x: 20 }}
          transition={{
            repeat: Infinity,
            repeatType: "reverse",
            duration: 6,
          }}
          className="absolute top-28 right-14 text-yellow-400 text-4xl opacity-70"
        >
          <FaStar />
        </motion.div>
        <motion.div
          initial={{ x: 20 }}
          animate={{ x: -20 }}
          transition={{
            repeat: Infinity,
            repeatType: "reverse",
            duration: 7,
          }}
          className="absolute bottom-12 right-24 text-blue-400 text-4xl opacity-70"
        >
          <FaCloud />
        </motion.div>

        {/* Main Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="bg-white shadow-2xl rounded-3xl p-10 w-full max-w-2xl relative z-10"
        >
          {/* Header Section */}
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="text-center mb-12"
          >
            <motion.div
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="inline-block mb-6"
            >
              <FaSpa className="text-6xl text-purple-500 mx-auto" />
            </motion.div>

            <h1 className="text-5xl md:text-6xl font-light text-gray-800 mb-4 tracking-wide">
              Mindful
              <span className="bg-gradient-to-r from-purple-600 via-blue-600 to-teal-600 bg-clip-text text-transparent font-medium">
                {" "}
                Reflection
              </span>
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Share your thoughts, feelings, or experiences. Let us guide you to
              inner peace and clarity.
            </p>
          </motion.div>

          {/* Input Box */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="flex flex-col sm:flex-row items-center gap-4"
          >
            <input
              type="text"
              value={mood}
              onChange={(e) => setMood(e.target.value)}
              placeholder="Type your mood here..."
              className="flex-1 border rounded-xl px-4 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-sm"
            />
            <motion.button
              whileHover={{ scale: 0.95 }}
              whileTap={{ scale: 1.95 }}
              className="px-6 py-3 rounded-xl text-white bg-blue-600 font-semibold shadow-md transition-all duration-300 hover:bg-blue-700"
              onClick={() => submitPrompt()}
            >
              {loader ? <Loader/> : "Analyse"}
            </motion.button>
          </motion.div>

          {/* Emoji Row */}
          <div className="flex justify-center gap-4 mt-8 text-2xl">
            <motion.button 
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
              className="hover:scale-110 transition-transform duration-200"
              onClick={() => handleEmojiClick('😊 Happy')}
            >
              😊
            </motion.button>
            <motion.button 
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
              className="hover:scale-110 transition-transform duration-200"
              onClick={() => handleEmojiClick('😔 Sad')}
            >
              😔
            </motion.button>
            <motion.button 
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
              className="hover:scale-110 transition-transform duration-200"
              onClick={() => handleEmojiClick('😡 Angry')}
            >
              😡
            </motion.button>
            <motion.button 
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
              className="hover:scale-110 transition-transform duration-200"
              onClick={() => handleEmojiClick('😴 Tired')}
            >
              😴
            </motion.button>
            <motion.button 
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
              className="hover:scale-110 transition-transform duration-200"
              onClick={() => handleEmojiClick('🤩 Excited')}
            >
              🤩
            </motion.button>
            <motion.button 
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
              className="hover:scale-110 transition-transform duration-200"
              onClick={() => handleEmojiClick('🥰 Loved')}
            >
              🥰
            </motion.button>
          </div>
           <div
                    onClick={() => Navigate("/mood-journal")}
                    className="text-purple-600 pt-4 hover:text-purple-500 hover:underline transition-all duration-300 w-fit  cursor-pointer font-medium block mx-auto"
                  >
                    Show all Entries
                  </div>
        </motion.div>
      </div>
    </>
  );
};

export default ActualAnalyser;