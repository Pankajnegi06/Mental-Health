// FILE: src/components/MoodJournal.jsx
import React, { useEffect, useState } from "react";
import { BookOpen, Calendar } from "lucide-react";
import { Toaster, toast } from "react-hot-toast";
import { useAppContext } from "../Context/AppContext";
import axios from "axios";

// -------------------------------------------
// AXIOS INSTANCE (COOKIE AUTH, NO TOKENS)
// -------------------------------------------
const api = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
  withCredentials: true, // <-- important
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Add request interceptor to include token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle expired sessions (401)
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      window.dispatchEvent(new CustomEvent("auth:unauthorized"));
    }
    return Promise.reject(err);
  }
);

// -------------------------------------------
// JOURNAL API FUNCTIONS (COOKIE AUTH)
// -------------------------------------------
const getJournals = async (userId) => {
  const res = await api.get("/api/journal/getJournals", {
    params: { userId },
  });
  return res.data;
};

const addJournal = async (data) => {
  const res = await api.post("/api/journal/addJournal", data);
  return res.data;
};

// -------------------------------------------
// MOOD MAPPING & JOURNAL FORMATTER
// -------------------------------------------
const moodMapping = {
  happy: "happy",
  sad: "sad",
  angry: "angry",
  anxious: "anxious",
  excited: "very_happy",
  grateful: "happy",
  tired: "tired",
  neutral: "neutral",
};

const mapJournalDay = (j) => ({
  id: j.id,
  date: j.date,
  entries: (j.entries || []).map(e => ({
    id: e.id,
    mood: e.mood,
    moodTitle: e.mood,
    moodDescription: e.description || "",
    date: e.timestamp,
    intensity: e.intensity ?? 5,
  }))
});

// -------------------------------------------
// COMPONENT START
// -------------------------------------------
export default function MoodJournal() {
  const { userData, isLoggedIn, getAuthState } = useAppContext();

  const [selectedMood, setSelectedMood] = useState("");
  const [journalEntry, setJournalEntry] = useState("");
  const [savedEntries, setSavedEntries] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  
  
  // Enhanced data collection states
  const [moodIntensity, setMoodIntensity] = useState(5);
  const [sleepQuality, setSleepQuality] = useState(3);
  const [sleepHours, setSleepHours] = useState(7);
  const [stressLevel, setStressLevel] = useState(5);
  const [energyLevel, setEnergyLevel] = useState(5);
  const [activities, setActivities] = useState([]); // Array of {type, duration, moodBefore, moodAfter, description}
  const [gratitudeList, setGratitudeList] = useState(["", "", ""]);
  const [showActivityForm, setShowActivityForm] = useState(false);
  const [currentActivity, setCurrentActivity] = useState({
    type: 'exercise',
    duration: 30,
    moodBefore: 5,
    moodAfter: 5,
    description: ''
  });

  // Listen for unauthorized cookie-based session
  useEffect(() => {
    const on403 = () => getAuthState && getAuthState();
    window.addEventListener("auth:unauthorized", on403);
    return () => window.removeEventListener("auth:unauthorized", on403);
  }, [getAuthState]);

  // Load journals after login state confirms
  useEffect(() => {
    if (!isLoggedIn) return;
    fetchSavedEntries();
  }, [isLoggedIn]);

  const formatDateTime = (dateString) => {
    try {
      return new Date(dateString).toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    } catch {
      return dateString;
    }
  };

  // -------------------------------------------
  // FETCH JOURNALS
  // -------------------------------------------
  const fetchSavedEntries = async () => {
    try {
      if (!isLoggedIn) {
        setSavedEntries([]);
        return;
      }

      const userId = userData?._id || localStorage.getItem("userId");
      if (!userId) return;

      const resp = await getJournals(userId);

      if (resp.status === 1 && Array.isArray(resp.journals)) {
        const mapped = resp.journals.map(mapJournalDay);
        // Filter out days with no entries
        const validDays = mapped.filter(day => day.entries && day.entries.length > 0);
        // Sort by date descending (newest days first)
        validDays.sort((a, b) => new Date(b.date) - new Date(a.date));
        setSavedEntries(validDays);
      } else {
        setSavedEntries([]);
      }
    } catch (err) {
      toast.error("Failed to load journals");
    }
  };

  // -------------------------------------------
  // ACTIVITY MANAGEMENT
  // -------------------------------------------
  const handleAddActivity = () => {
    if (!currentActivity.type) {
      toast.error("Please select an activity type");
      return;
    }
    
    setActivities([...activities, { ...currentActivity, id: Date.now() }]);
    setCurrentActivity({
      type: 'exercise',
      duration: 30,
      moodBefore: 5,
      moodAfter: 5,
      description: ''
    });
    setShowActivityForm(false);
    toast.success("Activity added!");
  };

  const handleRemoveActivity = (id) => {
    setActivities(activities.filter(a => a.id !== id));
  };

  // -------------------------------------------
  // SAVE ENTRY
  // -------------------------------------------
  const handleSaveEntry = async () => {
    if (!selectedMood || !journalEntry.trim()) {
      toast.error("Choose a mood and write something.");
      return;
    }

    if (!isLoggedIn) {
      toast.error("Please log in first.");
      return;
    }

    setIsLoading(true);

    try {
      const userId = userData?._id || localStorage.getItem("userId");

      const payload = {
        mood: moodMapping[selectedMood] || "neutral",
        description: journalEntry,
        intensity: moodIntensity,
        userId,
        // Enhanced data
        sleepQuality: sleepQuality,
        sleepHours: sleepHours,
        stressLevel: stressLevel,
        energyLevel: energyLevel,
        activities: activities.map(a => ({
          type: a.type,
          duration: a.duration,
          moodBefore: a.moodBefore,
          moodAfter: a.moodAfter,
          description: a.description
        })),
        gratitude: gratitudeList.filter(g => g.trim() !== "")
      };

      const resp = await addJournal(payload);

      if (resp.status === 1) {
        toast.success("Saved!");
        // Reset form
        setSelectedMood("");
        setJournalEntry("");
        setMoodIntensity(5);
        setSleepQuality(3);
        setSleepHours(7);
        setStressLevel(5);
        setEnergyLevel(5);
        setActivities([]);
        setGratitudeList(["", "", ""]);
        fetchSavedEntries();
      } else {
        toast.error(resp.message || "Failed to save.");
      }
    } catch (err) {
      toast.error("Error saving journal");
    } finally {
      setIsLoading(false);
    }
  };

  // -------------------------------------------
  // RENDER ENTRIES
  // -------------------------------------------
  const getDateHeader = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    }
  };

  const renderSavedEntries = () => {
    if (!savedEntries.length)
      return (
        <div className="text-center py-12">
          <BookOpen className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No entries yet</h3>
          <p className="text-gray-500 mt-1">Write something to get started.</p>
        </div>
      );

    return (
      <div className="h-[calc(100vh-300px)] overflow-y-auto pr-2 custom-scrollbar">
        <div className="space-y-8">
          {savedEntries.map((dayGroup) => (
            <div key={dayGroup.id}>
              <h3 className="text-md font-semibold text-gray-500 mb-4 sticky top-0 bg-white/95 backdrop-blur-sm py-2 z-10">
                {getDateHeader(dayGroup.date)}
              </h3>
              <div className="space-y-4">
                {dayGroup.entries.map((entry) => (
                  <div
                    key={entry.id}
                    className="bg-white p-6 rounded-xl shadow-md border border-gray-100"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        <span>{formatDateTime(entry.date)}</span>
                      </div>

                      <span className="px-3 py-1 rounded-full bg-indigo-100 text-indigo-800 text-xs font-medium capitalize">
                        {entry.moodTitle}
                      </span>
                    </div>

                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                      <p className="text-gray-700 whitespace-pre-line">
                        {entry.moodDescription}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // -------------------------------------------
  // UI RETURN
  // -------------------------------------------
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4 md:p-8">
      <Toaster position="top-center" />

      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="p-6 md:p-8">
            <h1 className="text-3xl font-bold text-gray-800">Mood Journal</h1>
            <p className="text-gray-600">Track your emotions and thoughts</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 p-6 md:p-8">
            {/* SIDEBAR */}
            <div className="lg:col-span-1 space-y-4">
              <div className="bg-gray-50 p-4 rounded-xl">
                <h2 className="font-semibold text-lg text-gray-800 mb-3">
                  How are you feeling?
                </h2>

                <div className="space-y-2">
                  {["happy", "sad", "angry", "anxious", "excited", "grateful"].map(
                    (mood) => (
                      <button
                        key={mood}
                        onClick={() => setSelectedMood(mood)}
                        className={`w-full text-left px-4 py-2 rounded-lg ${
                          selectedMood === mood
                            ? "bg-indigo-600 text-white"
                            : "bg-white hover:bg-gray-100 text-gray-700"
                        }`}
                      >
                        {mood.charAt(0).toUpperCase() + mood.slice(1)}
                      </button>
                    )
                  )}
                </div>
              </div>
            </div>

            {/* MAIN */}
            <div className="lg:col-span-3 space-y-6">
              {/* Mood Entry Card */}
              <div className="bg-white p-6 rounded-xl border shadow-sm">
                <h2 className="font-semibold text-lg text-gray-800 mb-4">
                  {selectedMood ? `Feeling ${selectedMood}` : "Select a mood"}
                </h2>

                {/* Mood Intensity Slider */}
                {selectedMood && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mood Intensity: {moodIntensity}/10
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={moodIntensity}
                      onChange={(e) => setMoodIntensity(Number(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                )}

                <textarea
                  value={journalEntry}
                  onChange={(e) => setJournalEntry(e.target.value)}
                  placeholder="Write about your day..."
                  className="w-full h-32 p-4 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Quick Data Collection Card */}
              <div className="bg-white p-6 rounded-xl border shadow-sm">
                <h3 className="font-semibold text-md text-gray-800 mb-4">Quick Check-in</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Sleep */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Sleep Quality: {sleepQuality}/5 ⭐
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="5"
                      value={sleepQuality}
                      onChange={(e) => setSleepQuality(Number(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Sleep Hours: {sleepHours}h
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="12"
                      step="0.5"
                      value={sleepHours}
                      onChange={(e) => setSleepHours(Number(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>

                  {/* Stress */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Stress Level: {stressLevel}/10
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={stressLevel}
                      onChange={(e) => setStressLevel(Number(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>

                  {/* Energy */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Energy Level: {energyLevel}/10
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={energyLevel}
                      onChange={(e) => setEnergyLevel(Number(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                </div>

                {/* Activities */}
                <div className="mt-4">
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Activities Today ({activities.length})
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowActivityForm(!showActivityForm)}
                      className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                    >
                      {showActivityForm ? 'Cancel' : '+ Add Activity'}
                    </button>
                  </div>

                  {/* Activity Form */}
                  {showActivityForm && (
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-3 space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Activity Type
                          </label>
                          <select
                            value={currentActivity.type}
                            onChange={(e) => setCurrentActivity({...currentActivity, type: e.target.value})}
                            className="w-full p-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                          >
                            <option value="exercise">Exercise</option>
                            <option value="meditation">Meditation</option>
                            <option value="social">Social</option>
                            <option value="work">Work</option>
                            <option value="hobby">Hobby</option>
                            <option value="other">Other</option>
                          </select>
                        </div>
                        
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Duration (minutes)
                          </label>
                          <input
                            type="number"
                            min="1"
                            max="480"
                            value={currentActivity.duration}
                            onChange={(e) => setCurrentActivity({...currentActivity, duration: Number(e.target.value)})}
                            className="w-full p-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Mood Before: {currentActivity.moodBefore}/10
                          </label>
                          <input
                            type="range"
                            min="1"
                            max="10"
                            value={currentActivity.moodBefore}
                            onChange={(e) => setCurrentActivity({...currentActivity, moodBefore: Number(e.target.value)})}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Mood After: {currentActivity.moodAfter}/10
                          </label>
                          <input
                            type="range"
                            min="1"
                            max="10"
                            value={currentActivity.moodAfter}
                            onChange={(e) => setCurrentActivity({...currentActivity, moodAfter: Number(e.target.value)})}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Notes (optional)
                        </label>
                        <input
                          type="text"
                          value={currentActivity.description}
                          onChange={(e) => setCurrentActivity({...currentActivity, description: e.target.value})}
                          placeholder="E.g., Morning run in the park"
                          className="w-full p-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={handleAddActivity}
                        className="w-full py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
                      >
                        Add Activity
                      </button>
                    </div>
                  )}

                  {/* Activities List */}
                  {activities.length > 0 && (
                    <div className="space-y-2">
                      {activities.map((activity) => (
                        <div key={activity.id} className="bg-white p-3 rounded-lg border border-gray-200 flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-sm capitalize">{activity.type}</span>
                              <span className="text-xs text-gray-500">• {activity.duration} min</span>
                            </div>
                            <div className="text-xs text-gray-600 mt-1">
                              Mood: {activity.moodBefore}/10 → {activity.moodAfter}/10
                              {activity.moodAfter > activity.moodBefore && (
                                <span className="text-green-600 ml-1">↑ +{activity.moodAfter - activity.moodBefore}</span>
                              )}
                              {activity.moodAfter < activity.moodBefore && (
                                <span className="text-red-600 ml-1">↓ {activity.moodAfter - activity.moodBefore}</span>
                              )}
                            </div>
                            {activity.description && (
                              <p className="text-xs text-gray-500 mt-1">{activity.description}</p>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveActivity(activity.id)}
                            className="text-red-500 hover:text-red-700 text-sm ml-2"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Gratitude */}
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    3 Things I'm Grateful For
                  </label>
                  <div className="space-y-2">
                    {gratitudeList.map((item, index) => (
                      <input
                        key={index}
                        type="text"
                        value={item}
                        onChange={(e) => {
                          const newList = [...gratitudeList];
                          newList[index] = e.target.value;
                          setGratitudeList(newList);
                        }}
                        placeholder={`Gratitude ${index + 1}`}
                        className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm"
                      />
                    ))}
                  </div>
                </div>

                <div className="mt-6 flex justify-end">
                  <button
                    onClick={handleSaveEntry}
                    disabled={!selectedMood || !journalEntry.trim() || isLoading}
                    className="px-6 py-3 bg-indigo-600 text-white rounded-lg disabled:bg-gray-300 font-medium hover:bg-indigo-700 transition-colors"
                  >
                    {isLoading ? "Saving..." : "Save Entry"}
                  </button>
                </div>
              </div>

              {/* ENTRIES */}
              <div className="bg-white p-6 rounded-xl border shadow-sm">
                <h2 className="font-semibold text-lg text-gray-800 mb-4">
                  Your Journal Entries
                </h2>
                {renderSavedEntries()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
