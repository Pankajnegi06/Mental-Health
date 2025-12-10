import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, RotateCcw } from 'lucide-react';

// Configuration for each phase of the breathing cycle
const phaseConfig = {
  inhale: { duration: 4, label: 'Inhale' },
  hold1: { duration: 4, label: 'Hold' },
  exhale: { duration: 6, label: 'Exhale' },
  hold2: { duration: 2, label: 'Hold' }
};

const EmbeddedBreathingExercie = () => {
  const [isActive, setIsActive] = useState(false);
  const [currentPhase, setCurrentPhase] = useState('inhale');
  const [timeRemaining, setTimeRemaining] = useState(phaseConfig.inhale.duration);
  const [cycleCount, setCycleCount] = useState(0);
  
  // --- MUSIC SETUP ---
  const meditationLink = "https://res.cloudinary.com/diwodg2yv/video/upload/v1756541350/inhale-exhale-ambient-peaceful-meditation-365001_tawmlu.mp3";
  const audioRef = useRef(null);

  const phases = ['inhale', 'hold1', 'exhale', 'hold2'];

  const getNextPhase = useCallback((phase) => {
    const currentIndex = phases.indexOf(phase);
    const nextIndex = (currentIndex + 1) % phases.length;
    return phases[nextIndex];
  }, [phases]);

  const resetExercise = () => {
    setIsActive(false);
    setCurrentPhase('inhale');
    setTimeRemaining(phaseConfig.inhale.duration);
    setCycleCount(0);
  };

  // Timer logic effect
  useEffect(() => {
    let interval;

    if (isActive && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(prev => prev - 1);
      }, 1000);
    } else if (isActive && timeRemaining === 0) {
      const nextPhase = getNextPhase(currentPhase);
      setCurrentPhase(nextPhase);
      setTimeRemaining(phaseConfig[nextPhase].duration);
      
      if (currentPhase === 'hold2') {
        setCycleCount(prev => prev + 1);
      }
    }

    return () => clearInterval(interval);
  }, [isActive, timeRemaining, currentPhase, getNextPhase]);

  // --- EFFECT TO CONTROL MUSIC ---
  useEffect(() => {
    if (isActive) {
      // Play music when exercise starts
      audioRef.current.play().catch(error => {
        console.error("Audio play failed:", error); // Handle autoplay block
      });
    } else {
      // Pause and reset music when exercise stops
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  }, [isActive]); // Runs whenever isActive state changes

  const circleScale = {
    inhale: 1.15,
    hold1: 1.15,
    exhale: 0.85,
    hold2: 0.85
  };

  const getInstructions = () => {
    switch (currentPhase) {
      case 'inhale':
        return 'Breathe in slowly through your nose.';
      case 'hold1':
        return 'Hold your breath gently at the peak.';
      case 'exhale':
        return 'Exhale slowly and completely.';
      case 'hold2':
        return 'Pause briefly before the next breath.';
      default:
        return '';
    }
  };

  return (
    <div className="flex flex-col w-full h-full bg-white rounded-2xl shadow-lg items-center p-4 justify-between">
      
      {/* Hidden Audio Player with Loop */}
      <audio ref={audioRef} src={meditationLink} loop />

      {/* Header */}
      <div className="text-center w-full">
        <h2 className="text-xl font-bold text-gray-800">
          Breathing Exercise
        </h2>
        <p className="text-sm text-gray-500">
          Follow the circle and find your calm.
        </p>
      </div>

      {/* Animated Circle */}
      <div className="relative flex items-center justify-center my-4">
        
        {/* Pulsing Bubble Effect */}
        {isActive && (
          <motion.div
            className="absolute w-32 h-32 rounded-full border-2 border-indigo-200"
            animate={{ scale: [1, 1.3, 1], opacity: [0.7, 0, 0.7] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          />
        )}

        {/* Main Gradient Circle */}
        <motion.div
          className="relative w-24 h-24 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center"
          animate={
            isActive
              ? {
                  scale: circleScale[currentPhase],
                  boxShadow: [
                    "0 0 20px rgba(99, 102, 241, 0.4)",
                    "0 0 40px rgba(139, 92, 246, 0.5)",
                    "0 0 20px rgba(99, 102, 241, 0.4)",
                  ],
                }
              : { scale: 1 }
          }
          transition={{
            duration: phaseConfig[currentPhase].duration,
            ease: "easeInOut",
          }}
        >
            {/* Text inside circle */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-white pointer-events-none">
              <div className="text-4xl font-bold -mt-1">{timeRemaining}</div>
              <div className="text-base font-medium opacity-80 tracking-wider">
                {phaseConfig[currentPhase].label}
              </div>
            </div>
        </motion.div>
      </div>

      {/* Instructions */}
      <div className="text-center h-10 px-2">
        <p className="text-gray-600 text-sm">{getInstructions()}</p>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center py-2 space-x-4 w-full">
        <button
          onClick={resetExercise}
          title="Reset"
          className="flex items-center justify-center h-11 w-11 rounded-full bg-slate-100 hover:bg-slate-200 transition-colors duration-200 group"
        >
          <RotateCcw className="w-5 h-5 text-slate-600 group-hover:text-indigo-500 transition-colors" />
        </button>

        <button
          onClick={() => setIsActive(!isActive)}
          title={isActive ? "Pause" : "Play"}
          className="p-4 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white transition-transform transform hover:scale-105 shadow-lg"
        >
          {isActive ? (
            <Pause className="w-6 h-6 fill-white" />
          ) : (
            <Play className="w-6 h-6 fill-white ml-1" />
          )}
        </button>
        
        <div title={`Cycle ${cycleCount}`} className="flex flex-col items-center justify-center h-11 w-11 rounded-full bg-slate-100 text-slate-600 font-medium">
          <span className="text-lg font-bold">{cycleCount}</span>
        </div>
      </div>

      {/* Pattern Display */}
      <div className="bg-slate-50 rounded-xl p-3 w-full border border-slate-200">
        <h4 className="text-sm font-semibold text-gray-800 mb-2 text-center">
          4-4-6-2 Breathing Pattern
        </h4>
        <div className="grid grid-cols-4 gap-2 text-xs">
          {phases.map((phase) => (
            <div
              key={phase}
              className={`text-center p-2 rounded-lg transition-all duration-300 ${
                currentPhase === phase
                  ? "bg-gradient-to-br from-indigo-500 to-purple-600 text-white transform scale-105 shadow-md"
                  : "bg-slate-200 text-slate-700"
              }`}
            >
              <div className="font-bold">
                {phaseConfig[phase].label}
              </div>
              <div className="opacity-80">
                {phaseConfig[phase].duration}s
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EmbeddedBreathingExercie;