import React, { useEffect, useState, useRef } from "react";
import { useAppContext } from "../Context/AppContext";
import axios from "axios";

const AppointmentTabel = () => {
  const { table, getTable, setTable } = useAppContext();
  const [isEditActive, setisEditActive] = useState(false);
  const appointmentIds = useRef({});
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
  const [localTable, setLocalTable] = useState([]);

  useEffect(() => {
    getTable();
  }, []);

  function formatTime(isoString) {
    const date = new Date(isoString);
    const options = {
      day: "2-digit",
      month: "short",
      year: "numeric",
    };
    return date.toLocaleString("en-US", options);
  }

  async function sendData() {
    if (!isEditActive) {
      setLocalTable([...table]);
    } else {
      try {
        const res = await axios.post(
          `${BACKEND_URL}/api/appointment/changeTable`,
          { appointmentIds: appointmentIds.current },
          { withCredentials: true }
        );
        if (res.data.success === true) {
          getTable();
          appointmentIds.current = {};
        }
      } catch (e) {
        // console.log("Error sending to backend", e);
      }
    }
    setisEditActive((prev) => !prev);
  }

  function changeKara(targetId, effect) {
    if (targetId in appointmentIds.current)
      appointmentIds.current[targetId] = !appointmentIds.current[targetId];
    else appointmentIds.current[targetId] = effect;
  }

  return (
    <div className="overflow-x-auto custom-scroll">
      <table className="border-separate min-w-full bg-white text-center shadow-md rounded-lg text-xs sm:text-sm">
        <thead>
          <tr className="bg-blue-900 text-white text-xs sm:text-sm">
            <th className="px-2 py-2 sm:px-6 sm:py-3 rounded-tl-lg">Appointment Date</th>
            <th className="px-2 py-2 sm:px-6 sm:py-3">Appointment Time</th>
            <th className="px-2 py-2 sm:px-6 sm:py-3">Clinic/Hospital</th>
            <th className="px-2 py-2 sm:px-6 sm:py-3 rounded-tr-lg">Status</th>
          </tr>
        </thead>
        <tbody>
          {(isEditActive ? localTable : table).map((item, index) => (
            <tr
              key={index}
              className={`${
                !item.status
                  ? "bg-red-100 hover:bg-red-200"
                  : "bg-green-100 hover:bg-green-200"
              } transition-colors duration-200 text-xs sm:text-sm`}
            >
              <td className="px-2 py-2 sm:px-6 sm:py-3">{formatTime(item.date)}</td>
              <td className="px-2 py-2 sm:px-6 sm:py-3">{item.time}</td>
              <td className="px-2 py-2 sm:px-6 sm:py-3">{item.hospitalName}</td>
              <td className="px-2 py-2 sm:px-6 sm:py-3">
                <input
                  type="checkbox"
                  checked={item.status}
                  disabled={!isEditActive}
                  onChange={() => {
                    const newTable = [...localTable];
                    newTable[index].status = !newTable[index].status;
                    setLocalTable(newTable);
                    changeKara(item.appointmentId, newTable[index].status);
                  }}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="flex gap-4 mt-4 justify-center sm:justify-start">
        <button
          onClick={sendData}
          className={`cursor-pointer text-white px-4 py-2 text-sm rounded ${
            !isEditActive
              ? "bg-orange-600 hover:bg-orange-700"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {isEditActive ? "Save" : "Edit"}
        </button>
      </div>
    </div>
  );
};

export default AppointmentTabel;