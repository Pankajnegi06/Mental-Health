import React from "react";
import MyMap from "./MyMap";

const RightPanel = ({ getLocation, place }) => {
  return (
    <div className="w-full md:w-1/2 h-fit md:h-screen flex flex-col justify-around overflow-hidden">
      {/* Map Layer */}
      <div className="inset-0 z-0">
        <MyMap getLocation={getLocation} />
      </div>

      {/* Info Overlay */}
      <div className="bottom-4 left-4 right-4 z-10 h-fit flex flex-col px-3 ">
        <div className="text-xs sm:text-sm text-white bg-white/10 backdrop-blur-lg p-3 rounded-xl text-center font-semibold shadow-md">
          📍 Your Location: <span className="font-normal">{place || "Not Set"}</span>
        </div>

        <div className="flex flex-col sm:flex-row justify-between gap-2 py-3">
          <div className="text-xs sm:text-sm text-white bg-white/10 backdrop-blur-lg p-3 rounded-xl text-center font-semibold shadow-md w-full sm:w-1/2">
            Longitude: <span className="font-normal">{getLocation?.lng ?? "N/A"}</span>
          </div>
          <div className="text-xs sm:text-sm text-white bg-white/10 backdrop-blur-lg p-3 rounded-xl text-center font-semibold shadow-md w-full sm:w-1/2">
            Latitude: <span className="font-normal">{getLocation?.lat ?? "N/A"}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RightPanel;