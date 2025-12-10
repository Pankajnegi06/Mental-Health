import React, { useState, useEffect, useRef } from "react";
import { Play, Pause, SkipForward, SkipBack } from "lucide-react";
import { motion } from "framer-motion";
import "../App.css"

const meditationPlaylist = [
  {
    id: 1,
    title: "Morning Mindfulness",
    type: "audio",
    duration: "2:58",
    src: "https://res.cloudinary.com/diwodg2yv/video/upload/v1756541350/inhale-exhale-ambient-peaceful-meditation-365001_tawmlu.mp3"
  },
  {
    id: 2,
    title: "Deep Relaxation",
    type: "audio",
    duration: "5:47",
    src: "https://res.cloudinary.com/diwodg2yv/video/upload/v1756541386/meditation-music-368634_dcleuk.mp3"
  },
  {
    id: 3,
    title: "Anxiety Relief",
    type: "audio",
    duration: "2:58",
    src: "https://res.cloudinary.com/diwodg2yv/video/upload/v1756541350/inhale-exhale-ambient-peaceful-meditation-365001_tawmlu.mp3",
  },
  {
    id: 4,
    title: "Morning Yoga",
    type: "video",
    duration: "0:23",
    src: "https://res.cloudinary.com/diwodg2yv/video/upload/v1756541213/meditation3_t9huin.mp4"
  },
];

export const MeditationPlayer = () => {
  const [currentTrack, setCurrentTrack] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);
  const videoRef = useRef(null);
  const [currentMedia, setCurrentMedia] = useState(meditationPlaylist[0]);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const newMedia = meditationPlaylist[currentTrack];
    setCurrentMedia(newMedia);
    setIsPlaying(false);

    const media =
      newMedia?.type === "audio" ? audioRef.current : videoRef.current;
    if (media) {
      media.currentTime = 0;
      media.pause();
    }
  }, [currentTrack]);

  useEffect(() => {
    const media =
      currentMedia.type === "audio" ? audioRef.current : videoRef.current;
    if (media) {
      if (isPlaying) {
        media.play();
      } else {
        media.pause();
      }
    }
  }, [isPlaying, currentTrack, currentMedia.type]);

  const togglePlay = () => {
    setIsPlaying((prev) => !prev);
  };

  const nextTrack = () => {
    setTime(0);
    setDuration(0);
    setCurrentTrack((prev) => (prev + 1) % meditationPlaylist.length);
  };

  const prevTrack = () => {
    setTime(0);
    setDuration(0);
    setCurrentTrack(
      (prev) =>
        (prev - 1 + meditationPlaylist.length) % meditationPlaylist.length
    );
  };

  const selectTrack = (index) => {
    setCurrentTrack(index);
  };

  const formatTime = (secs) => {
    if (!secs || isNaN(secs)) return "0:00";
    const minutes = Math.floor(secs / 60);
    const seconds = Math.floor(secs % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

 return (
  <div className="bg-gray-100 min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
    <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-200 w-full max-w-lg">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Meditation Sessions
        </h2>
        <p className="text-gray-600 text-sm">
          Find your center with our curated meditation library
        </p>
      </div>

      {/* Current Media */}
      <div className="mb-6">
        <div className="bg-gray-50 rounded-xl p-4 mb-6 border border-gray-200">
          <h3 className="text-lg font-semibold mb-2 text-gray-900">
            {currentMedia.title}
          </h3>
          {currentMedia.type == "audio" && (
            <div className="text-sm mb-3 text-gray-500">
              🎵 {currentMedia.type} • {currentMedia.duration}
            </div>
          )}

          {currentMedia &&
            (currentMedia.type === "audio" ? (
              <audio
                key={currentMedia.id}
                ref={audioRef}
                src={currentMedia.src}
                onEnded={() => setIsPlaying(false)}
                onLoadedMetadata={(e) => setDuration(e.target.duration)}
                onTimeUpdate={(e) => setTime(e.target.currentTime)}
                className="w-full mb-3"
              />
            ) : (
              <video
                key={currentMedia.id}
                ref={videoRef}
                src={currentMedia.src}
                onEnded={() => setIsPlaying(false)}
                onLoadedMetadata={(e) => setDuration(e.target.duration)}
                onTimeUpdate={(e) => setTime(e.target.currentTime)}
                className="w-full rounded-lg mb-3"
                style={{ maxHeight: "100%" }}
              />
            ))}
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center space-x-4 mb-6">
          <button
            className="p-3 rounded-full bg-gray-200 hover:bg-gray-300 transition-all duration-200"
            onClick={prevTrack}
          >
            <SkipBack className="w-4 h-4 text-gray-700" />
          </button>

          <button
            className="p-4 rounded-full bg-gray-900 hover:bg-gray-800 transition-all transform hover:scale-105 shadow-lg"
            onClick={togglePlay}
          >
            {isPlaying ? (
              <Pause className="w-6 h-6 text-white" />
            ) : (
              <Play className="w-6 h-6 text-white ml-1" />
            )}
          </button>

          <button
            className="p-3 rounded-full bg-gray-200 hover:bg-gray-300 transition-all duration-200"
            onClick={nextTrack}
          >
            <SkipForward className="w-4 h-4 text-gray-700" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="bg-gray-200 h-2 rounded-full">
            <div
              className="bg-gray-900 h-full rounded-full transition-all duration-300"
              style={{ width: `${(time / duration) * 100}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-2">
            <span>{formatTime(time)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>
      </div>

      {/* Playlist */}
      <div className="space-y-2">
        <h4 className="font-semibold mb-1 text-gray-900">Playlist</h4>
        <div className="h-[1px] bg-gray-300 mb-5"></div>
        <div className="flex flex-col gap-2 overflow-y-scroll scrollbar-hide max-h-48 md:max-h-64 mb-4 hide-scrollbar">
          {meditationPlaylist.map((item, index) => (
            <motion.div
              key={item.id}
              onClick={() => selectTrack(index)}
              whileHover={{ scale: 1.02 }}
              className={`p-3 rounded-lg cursor-pointer transition-colors ${
                index === currentTrack
                  ? "bg-gray-900 text-white"
                  : "bg-gray-100 hover:bg-gray-200"
              }`}
            >
              <div className="flex justify-between items-center">
                <div>
                  <div
                    className={`font-semibold ${
                      index === currentTrack ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {item.title}
                  </div>
                  <div
                    className={`text-sm ${
                      index === currentTrack ? "text-gray-200" : "text-gray-500"
                    }`}
                  >
                    {item.type === "audio" ? "🎵" : "🎥"} {item.duration}
                  </div>
                </div>
                {index === currentTrack && isPlaying && (
                  <div className="w-4 h-4 rounded-full bg-gray-200 animate-pulse"></div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

};