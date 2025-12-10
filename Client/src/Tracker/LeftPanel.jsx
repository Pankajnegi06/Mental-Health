import React, { useEffect, useState } from "react";
import "../App.css";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast, Toaster } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion"; // Animation library

const LeftPanel = ({ getLocation, setLocation, place, setPlace }) => {
  const [clinics, setClinics] = useState([]);
  const [originalClinics, setOriginalClinics] = useState([]);
  const [isOpen, setOpen] = useState(false);
  const [targetedClinic, setTargetedClinic] = useState(null);
  const navigate = useNavigate();
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
  const [found, setFound] = useState("hospital");
  const [isSorted, setIsSorted] = useState(false);
  const [activeClinicId, setActiveClinicId] = useState(null);
  const [myData, setMyData] = useState({
    appointmentId: "",
    date: "",
    time: "",
    hospitalName: "",
  });
  const [allAppoint, setAllAppoint] = useState([]);
  const [startBook, setStartBook] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = async () => {
    if (!searchQuery.trim()) return toast.error("Please enter a location");
    
    try {
        // Using OpenStreetMap (Nominatim) for free geocoding
        const response = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`
        );
        const data = await response.json();

        if (data && data.length > 0) {
            const { lat, lon, display_name } = data[0];
            const latitude = parseFloat(lat);
            const longitude = parseFloat(lon);
            
            setLocation({ lat: latitude, lng: longitude });
            getNearbyClinics(latitude, longitude);
            setPlace(display_name);
            toast.success(`Found location: ${display_name}`);
        } else {
            toast.error("Location not found");
        }
    } catch (error) {
        console.error("Search error:", error);
        toast.error("Failed to search location");
    }
  };

  // Function to get reverse-geocoded address
  const getPlace = async (lat, lng) => {
    if (!lat || !lng) return;
    try {
      const response = await axios.post(`${BACKEND_URL}/api/getAddress`, { lat, lng });
      setPlace(response.data.address || "Address not available");
    } catch (error) {
      console.error("Error fetching address:", error);
    }
  };

  // Improved sort function - Now it's a toggle
  const toggleSortClinics = () => {
    if (!isSorted) {
      const sorted = [...clinics].sort((a, b) => a.distance - b.distance);
      setClinics(sorted);
    } else {
      setClinics(originalClinics); // Revert to original order
    }
    setIsSorted(!isSorted);
  };

  // Fetch nearby clinics from Overpass API
  const getNearbyClinics = async (lat, lng) => {
    if (!lat || !lng) return;
    const query = `[out:json];node(around:8000,${lat},${lng})[amenity=${found}];out;`;
    const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`;
    try {
      const res = await fetch(url);
      const data = await res.json();
      const elements = data.elements;

      const temp = elements
        .filter((item) => item.tags?.name)
        .map((item) => ({
          id: item.id,
          name: item.tags.name,
          lat: item.lat,
          lon: item.lon,
          address: item.tags["addr:full"] || "Address not specified",
          distance: findDistance(lat, lng, item.lat, item.lon),
        }));
      setClinics(temp);
      setOriginalClinics(temp);
      setIsSorted(false);
    } catch (err) {
      console.error("Error fetching clinics:", err);
    }
  };

  const saveBooking = async () => {
    if (!myData.date || !myData.time) {
      return toast.error("Please select a date and time.");
    }

    // Construct payload explicitly to ensure all data is present
    const payload = {
        ...myData,
        hospitalName: targetedClinic,
        appointmentId: activeClinicId
    };

    try {
      const response = await axios.post(`${BACKEND_URL}/api/appointment/addAppointment`, payload, { 
        withCredentials: true,
        headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
        }
      });
      if (response.data.status) {
        setAllAppoint((prev) => [...prev, activeClinicId]);
        setOpen(false);
        toast.success("Added to your Wishlist!");
      }
    } catch (e) {
      console.error("Error saving booking:", e);
      toast.error("Failed to save to wishlist");
    }
  };

  const myLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }

    const handleSuccess = (pos) => {
        const { latitude, longitude } = pos.coords;
        setLocation({ lat: latitude, lng: longitude });
        getNearbyClinics(latitude, longitude);
        getPlace(latitude, longitude);
    };

    const handleError = (err) => {
        console.error("Geolocation error:", err);
        let msg = "Could not get your location.";
        switch(err.code) {
            case err.PERMISSION_DENIED:
                msg = "Location permission denied. Please enable it in your browser settings.";
                break;
            case err.POSITION_UNAVAILABLE:
                msg = "Location unavailable. Please check your System/OS location settings.";
                break;
            case err.TIMEOUT:
                msg = "Location request timed out.";
                break;
            default:
                msg = "An unknown error occurred getting location.";
        }
        toast.error(msg);
    };

    // Attempt 1: High Accuracy
    navigator.geolocation.getCurrentPosition(
      handleSuccess,
      (err) => {
        // If failed (timeout or unavailable), try low accuracy
        if (err.code === err.TIMEOUT || err.code === err.POSITION_UNAVAILABLE) {
            console.log("High accuracy failed, trying low accuracy...");
            toast("High accuracy failed, trying standard location...", { icon: '⚠️' });
            
            // Attempt 2: Low Accuracy
            navigator.geolocation.getCurrentPosition(
                handleSuccess,
                handleError, 
                { enableHighAccuracy: false, timeout: 10000, maximumAge: 0 }
            );
        } else {
            handleError(err);
        }
      },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    );
  };

  const findDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return (R * c).toFixed(2);
  };

  const bookKaro = () => {
    setMyData({ hospitalName: targetedClinic, appointmentId: activeClinicId, date: '', time: '' });
    setStartBook(true);
  };

  useEffect(() => {
    if (getLocation.lat && getLocation.lng) {
      getNearbyClinics(getLocation.lat, getLocation.lng);
    }
  }, [found]);

  const targetData = (clinic) => {
    setLocation({ lat: clinic.lat, lng: clinic.lon });
    setTargetedClinic(clinic.name);
    setActiveClinicId(clinic.id);
    setStartBook(false);
    setOpen(true);
  };

  const cancelKaro = async () => {
    try {
      const response = await axios.post(`${BACKEND_URL}/api/appointment/removeAppointment`, { appointmentId: activeClinicId }, { 
        withCredentials: true,
        headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
        }
      });
      if (response.data.status) {
        setAllAppoint((prev) => prev.filter((id) => id !== activeClinicId));
        setOpen(false);
        toast.success("Removed from Wishlist");
      }
    } catch (e) {
      console.log("Error cancelling", e);
    }
  };

  useEffect(() => {
    const getAllAppointed = async () => {
      try {
        const res = await axios.get(`${BACKEND_URL}/api/appointment/getAllApointments`, { 
            withCredentials: true,
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
            }
        });
        if (res.data.myData) {
          const appointmentIds = res.data.myData.map(item => item.appointmentId);
          setAllAppoint(appointmentIds);
        }
      } catch (e) {
        console.error("Could not fetch appointments", e);
      }
    };
    getAllAppointed();
  }, []);

  const isAlreadyBooked = (id) => Array.isArray(allAppoint) && allAppoint.includes(id);

  // Animation Variants
  const listContainerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.07 } },
  };
  const listItemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <>
      <Toaster position="top-center" />
      <div className="bg-slate-100 min-h-screen w-full font-sans">
        {/* Header */}
        <motion.header 
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-lg p-4 flex flex-col sm:flex-row justify-between items-center gap-4"
        >
          <h1 className="text-2xl font-bold cursor-pointer" onClick={() => navigate("/")}>StillMind</h1>
          <div className="flex flex-wrap justify-center items-center gap-3">
            <div className="flex items-center gap-2 bg-white/20 rounded-lg px-2 py-1">
                <input 
                    type="text" 
                    placeholder="Enter city..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-transparent text-white placeholder-gray-200 outline-none w-32 sm:w-40"
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
                <button onClick={handleSearch} className="text-white hover:text-yellow-300">🔍</button>
            </div>
            <button onClick={myLocation} className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-all duration-300 transform hover:scale-105">Get Location</button>
            <button onClick={toggleSortClinics} className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-all duration-300 transform hover:scale-105">{isSorted ? "Unsort" : "Sort by Distance"}</button>
            <select onChange={(e) => setFound(e.target.value)} value={found} className="bg-white/20 hover:bg-white/30 rounded-lg px-4 py-2 outline-none border-none">
              <option value="hospital" className="text-black">🏥 Hospital</option>
              <option value="clinic" className="text-black">🏨 Clinic</option>
            </select>
          </div>
        </motion.header>

        {/* Main Content */}
        <main className="p-4 sm:p-6">
          <motion.h2 initial={{opacity:0}} animate={{opacity:1}} transition={{delay: 0.3}} className="text-2xl font-bold text-center text-gray-800 mb-4">
            Nearby {found.charAt(0).toUpperCase() + found.slice(1)}s
          </motion.h2>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white rounded-2xl shadow-xl p-4 min-h-[70vh] overflow-y-auto"
          >
            <motion.div variants={listContainerVariants} initial="hidden" animate="visible" className="flex flex-col gap-4">
              {clinics.length > 0 ? (
                clinics.map((clinic) => (
                  <motion.div
                    key={clinic.id}
                    variants={listItemVariants}
                    whileHover={{ scale: 1.02, boxShadow: "0px 10px 20px rgba(0,0,0,0.1)" }}
                    transition={{ type: "spring", stiffness: 400, damping: 15 }}
                    onClick={() => targetData(clinic)}
                    className="bg-slate-50 border border-slate-200 rounded-xl p-4 cursor-pointer"
                  >
                    <h3 className="text-lg font-bold text-indigo-600">{clinic.name}</h3>
                    <p className="text-sm text-gray-600">{clinic.address}</p>
                    <p className="text-sm font-semibold text-gray-800 mt-1">{clinic.distance} km away</p>
                  </motion.div>
                ))
              ) : (
                <motion.div initial={{opacity: 0}} animate={{opacity: 1}} className="flex items-center justify-center h-full min-h-[50vh]">
                  <p className="text-lg text-center text-gray-500">Press "Get Location" to find nearby places.</p>
                </motion.div>
              )}
            </motion.div>
          </motion.div>
        </main>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center bg-black/60 z-50 p-4"
          >
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl flex flex-col items-center gap-4"
            >
              <h2 className="text-2xl font-bold text-center text-gray-800">{targetedClinic}</h2>
              <p onClick={() => window.open(`https://www.google.com/search?q=${encodeURIComponent(targetedClinic)}`, "_blank")} className="underline text-sm text-indigo-500 hover:text-indigo-700 cursor-pointer">Get More Info</p>
              
              {isAlreadyBooked(activeClinicId) ? (
                  <button onClick={cancelKaro} className="w-full mt-2 bg-yellow-400 hover:bg-yellow-500 text-black font-bold px-4 py-2 rounded-lg transition-all duration-300">Remove from Wishlist</button>
                ) : (
                  <div className="flex flex-col gap-3 w-full mt-2">
                    <p className="text-center text-gray-500 text-sm">Plan your visit:</p>
                    <div className="flex items-center gap-2">
                      <input type="date" onChange={(e) => setMyData(prev => ({ ...prev, date: e.target.value }))} className="w-full px-3 py-2 rounded-md bg-slate-100 border border-slate-300 text-gray-900"/>
                      <input type="time" onChange={(e) => setMyData(prev => ({ ...prev, time: e.target.value }))} className="w-full px-3 py-2 rounded-md bg-slate-100 border border-slate-300 text-gray-900"/>
                    </div>
                    <button onClick={saveBooking} className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-bold px-4 py-2 rounded-lg transition-all duration-300">Save to Wishlist</button>
                  </div>
                )}

              <button onClick={() => setOpen(false)} className="w-full mt-2 bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg transition-all duration-300">Close</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default LeftPanel;