// src/components/MyMap.jsx
import React, { useEffect, useState } from "react";
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";

const containerStyle = {
  width: "100%",
  height: "400px",
};

function MyMap({ getLocation }) {
  const [placeName, setPlaceName] = useState("");

  const center = {
    lat: getLocation?.lat,
    lng: getLocation?.lng,
  };

  // Reverse geocoding to get city/country name
  const fetchPlaceName = async (lat, lng) => {
    const apiKey = "AIzaSyDB7pA6szdKlc9GX4dA5WRmracINJHktEk"; // Keep secure in env in real apps
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`
    );
    const data = await response.json();

    if (data.status === "OK") {
      const result = data.results[0];
      setPlaceName(result.formatted_address);
    } else {
      setPlaceName("Location not found");
    }
  };

  useEffect(() => {
    if (getLocation?.lat && getLocation?.lng) {
      fetchPlaceName(getLocation?.lat, getLocation?.lng);
    }
  }, [getLocation]);

  return (
    <>
      <div className="p-4">
        <LoadScript googleMapsApiKey="AIzaSyDB7pA6szdKlc9GX4dA5WRmracINJHktEk">
        <GoogleMap mapContainerStyle={containerStyle} center={center} zoom={12}>
          <Marker position={center} />
        </GoogleMap>
      </LoadScript>
      </div>
    </>
  );
}

export default MyMap;
