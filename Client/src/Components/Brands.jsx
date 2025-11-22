// src/components/FeaturedIn.jsx
import React from "react";
import viewLogo from "../assets/the-view.png";
import gmaLogo from "../assets/good-morning-america.png";
import nytLogo from "../assets/new-york-times.png";
import rachaelLogo from "../assets/rachael.png";
import dailyShowLogo from "../assets/daily-show.png";

export default function Brands() {
    return (
      <div className="bg-[#F1F1DC] py-3  flex flex-col h-fit w-screen">
          <p className="text-1xl tracking-[0.15em] font-bold text-[#1E1E1C] pl-5 w-fit ">
            FEATURED IN:
          </p>
  
          {/* Logos */}
          <div className="flex justify-between w-full  items-center space-x-14 h-full">
            <img src={viewLogo} alt="The View" className="h-28 object-contain" />
            <img src={gmaLogo} alt="Good Morning America" className="h-28 object-contain" />
            <img src={nytLogo} alt="The New York Times" className="h-28 object-contain" />
            <img src={rachaelLogo} alt="Rachael" className="h-28 object-contain" />
            <img src={dailyShowLogo} alt="The Daily Show" className="h-28 object-contain" />
          </div>
      </div>
    );
  };  
