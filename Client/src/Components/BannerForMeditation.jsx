import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import PreaceFulYogaImage from "../assets/PeaceFulYogaImage.png"
import BookReadingImage from "../assets/BookReadingImage.png"

const BannerForMeditation = () => {
  const [turn, setTurn] = useState(true);
  const Navigate = useNavigate();

  const slideToBeShown = [
   {
  turn: true,
  heading: "Connect with Experts Nearby for Your Well-Being",
  description:
    "Get guidance from trusted professionals around you — whether it’s a doctor, therapist, or wellness expert. Find the right support at the right time, adapted to your personal needs and lifestyle.",
  image: PreaceFulYogaImage,
  url:"/location-tracker"
}
,
  {
  turn: false,
  heading: "Your AI Expert, Always Here for You",
  description:
    "Get instant support and personalized guidance from our AI Expert. Whether you seek quick answers, tailored recommendations, or ongoing check-ins, the AI adapts to your unique journey and needs every time you connect.",
  image: BookReadingImage,
  url:"/AIHealthAssistant"
}

  ];

  const activeSlide = slideToBeShown.find((item) => item.turn === turn);

  return (
    <div className="w-screen h-screen flex justify-center items-center bg-[#FAFAFA] font-sans">
      <div className="w-9/12 h-full flex flex-row overflow-hidden bg-transparent">
        {/* Left side - Image */}
        <div className="w-1/2 h-[100%]  flex items-center justify-center">
        <AnimatePresence mode="wait">
            <motion.img
              key={activeSlide.heading}
              src={activeSlide.image}
              initial={{ opacity: 0, y: 20 }}
              className="h-[70%] rounded-md object-cover  w-[100%]"
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
        </motion.img>
        </AnimatePresence>
        </div>

        {/* Right side - Content */}
        <div className="w-1/2 flex flex-col justify-center px-10 py-8 bg-transparent">
          {/* Toggle buttons */}
          <div className="flex justify-center mb-8">
            <div className="flex flex-row gap-2 bg-gray-100 rounded-full px-2 py-1">
              <button
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                  turn
                    ? "bg-black text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
                onClick={() => setTurn(true)}
              >
                Flexible
              </button>
              <button
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                  !turn
                    ? "bg-black text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
                onClick={() => setTurn(false)}
              >
                Personalized
              </button>
            </div>
          </div>

          {/* Animated Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSlide.heading} // unique key so AnimatePresence triggers
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              {/* Heading */}
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-5 leading-snug">
                {activeSlide.heading}
              </h1>

              {/* Description */}
              <p className="text-gray-600 text-base lg:text-lg mb-8 leading-relaxed">
                {activeSlide.description}
              </p>

              {/* CTA Button */}
              <button
                className="hover:bg-white block mx-0 border border-black hover:text-black px-5 p-3 text-sm rounded-full w-fit h-auto  text-white bg-black font-bold cursor-pointer hover:shadow shadow-gray-500 transition-all duration-300"
                onClick={() => window.open(activeSlide.url,"__blank")}
              >
                Try for Free
              </button>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default BannerForMeditation;
