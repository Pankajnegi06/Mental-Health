import React, { useState } from "react";
import LeftPanel from "./LeftPanel";
import RightPanel from "./RightPanel";

const LocationTracker = () => {
  const [getLocation, setLocation] = useState({ lat: null, lng: null });
  const [place, setPlace] = useState("");

  return (
    <div className="flex flex-col md:flex-row w-screen h-auto overflow-hidden  bg-gradient-to-b from-blue-500 via-blue-900 to-gray-900">
      <LeftPanel
        getLocation={getLocation}
        setLocation={setLocation}
        place={place}
        setPlace={setPlace}
      />
      {/* <RightPanel
        getLocation={getLocation}
        setLocation={setLocation}
        place={place}
        setPlace={setPlace}
      /> */}
    </div>
  );
};

export default LocationTracker;
