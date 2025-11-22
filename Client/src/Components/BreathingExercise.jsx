import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, RotateCcw } from 'lucide-react';

const phaseConfig = {
  inhale: { duration: 4, label: 'Inhale', color: 'bg-emerald-400' },
  hold1: { duration: 4, label: 'Hold', color: 'bg-emerald-500' },
  exhale: { duration: 6, label: 'Exhale', color: 'bg-emerald-600' },
  hold2: { duration: 2, label: 'Hold', color: 'bg-emerald-500' }
};

const BreathingExercise = () => {
  const [isActive, setIsActive] = useState(false);
  const [currentPhase, setCurrentPhase] = useState('inhale');
  const [timeRemaining, setTimeRemaining] = useState(4);
  const [cycleCount, setCycleCount] = useState(0);

  const phases = ['inhale', 'hold1', 'exhale', 'hold2'];

  const getNextPhase = useCallback((phase) => {
    const currentIndex = phases.indexOf(phase);
    const nextIndex = (currentIndex + 1) % phases.length;
    return phases[nextIndex];
  }, [phases]);

  const resetExercise = () => {
    setIsActive(false);
    setCurrentPhase('inhale');
    setTimeRemaining(4);
    setCycleCount(0);
  };

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

  const circleScale = {
    inhale: 1.2,
    hold1: 1.2,
    exhale: 0.8,
    hold2: 0.8
  };

  const getInstructions = () => {
    switch (currentPhase) {
      case 'inhale':
        return 'Breathe in slowly through your nose';
      case 'hold1':
        return 'Hold your breath gently';
      case 'exhale':
        return 'Exhale slowly through your mouth';
      case 'hold2':
        return 'Rest before the next breath';
      default:
        return '';
    }
  };

 return (
  <div className="bg-gray-100 min-h-fit flex items-center justify-center px-4 sm:px-6 lg:px-8">
    <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6 w-full max-w-lg">
      {/* Header */}
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Breathing Exercise
        </h2>
        <p className="text-gray-600 text-sm">
          Follow the circle and find your rhythm
        </p>
      </div>

      {/* Circle with bubbling animation */}
      <div className="flex flex-col items-center mb-8">
        <div className="relative w-64 h-64 flex items-center justify-center mb-6">
          <motion.div
            className={`w-32 h-32 text-white rounded-full bg-[#101828]`}
            animate={
              isActive
                ? {
                    scale: circleScale[currentPhase],
                    boxShadow: [
                      "0 0 20px bg-[#101828]",
                      "0 0 40px bg-[#101828]",
                      "0 0 20px bg-[#101828]",
                    ],
                  }
                : { scale: 1 }
            }
            transition={{
              duration: phaseConfig[currentPhase].duration,
              ease:
                currentPhase === "inhale" || currentPhase === "exhale"
                  ? "easeInOut"
                  : "linear",
              repeat: isActive ? Infinity : 0,
              repeatType: "mirror",
            }}
          />

          {/* Bubble effect */}
          {isActive && (
            <motion.div
              className="absolute w-40 h-40 rounded-full border border-[#101828]"
              animate={{ scale: [1, 1.4, 1], opacity: [0.6, 0.2, 0.6] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            />
          )}

          {/* Text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-800 font-light">
            <div className="text-2xl font-medium mb-1 text-white">{timeRemaining}</div>
            <div className="text-sm opacity-80 text-white">
              {phaseConfig[currentPhase].label}
            </div>
          </div>
        </div>

        {/* Phase Label */}
        <div className="text-center mb-6">
          <div className="text-lg text-gray-900 font-medium mb-2">
            {phaseConfig[currentPhase].label} (
            {phaseConfig[currentPhase].duration}s)
          </div>
          <div className="text-sm text-gray-500 max-w-xs">
            {getInstructions()}
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center space-x-4 mb-6">
          <button
            onClick={resetExercise}
            className="p-3 rounded-full bg-gray-200 hover:bg-gray-300 border border-gray-300 transition-all duration-200 group"
          >
            <RotateCcw className="w-5 h-5 text-gray-700 group-hover:text-[#101828]" />
          </button>

          <button
            onClick={() => setIsActive(!isActive)}
            className="p-4 rounded-full bg-gray-900 hover:bg-gray-800 transition-all transform hover:scale-105 shadow-lg"
          >
            {isActive ? (
              <Pause className="w-6 h-6 text-white" />
            ) : (
              <Play className="w-6 h-6 text-white ml-1" />
            )}
          </button>

          <div className="text-sm text-gray-600 font-medium">
            Cycle {cycleCount}
          </div>
        </div>

        {/* Pattern Display */}
        <div className="bg-gray-50 rounded-xl p-4 w-full border border-gray-200">
          <h4 className="text-sm font-semibold text-gray-900 mb-3 text-center">
            4-4-6-2 Breathing Pattern
          </h4>
          <div className="grid grid-cols-4 gap-3 text-xs">
            {phases.map((phase) => (
              <div
                key={phase}
                className={`text-center p-2 rounded-lg transition-all border ${
                  currentPhase === phase
                    ? "bg-gray-900 text-white border-gray-800 transform scale-105 shadow"
                    : "bg-gray-100 text-gray-700 border-gray-200"
                }`}
              >
                <div
                  className={`font-medium ${
                    currentPhase === phase ? "text-white" : "text-gray-900"
                  }`}
                >
                  {phaseConfig[phase].label}
                </div>
                <div
                  className={`${
                    currentPhase === phase ? "text-gray-200" : "text-gray-500"
                  }`}
                >
                  {phaseConfig[phase].duration}s
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </div>
);

};

export default BreathingExercise;