import React, { useState, useRef, useEffect } from "react";
import jsPDF from "jspdf";
import axios from "axios";

const ProfileSection = () => {
  const [editMode, setEditMode] = useState(false);
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
  const [ImageURL, setImageURL] = useState(null);
  const [file, SetFile] = useState(null);
  const CLOUD_NAME = import.meta.env.VITE_CLOUD_NAME;
  const UPLOAD_PRESET = import.meta.env.VITE_UPLOAD_PRESET;
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    dob: "",
    bloodGroup: "",
    address: "",
    smoking: false,
    drinking: false,
    profileImage: "",
  });

  useEffect(() => {
    async function fun() {
      await axios
        .get(`${BACKEND_URL}/api/dashboard/getProfileData`, {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        })
        .then((res) => {
          if (res.data.success === true) {
            const data = res.data.myData;
            setFormData({
              name: data.name || "",
              email: data.email || "",
              phone: data.phone || "",
              dob: data.dob || "",
              bloodGroup: data.bloodGroup || "",
              address: data.address || "",
              smoking: data.smoking || false,
              drinking: data.drinking || false,
              profileImage: data.profileImage || "",
            });
            setImageURL(data.profileImage || "https://icon-library.com/images/generic-user-icon/generic-user-icon-9.jpg");
          }
        })
        .catch((err) => {
          console.error("Error loading profile data:", err);
        });
    }
    fun();
  }, []);

  async function saveKaro() {
    if (editMode) {
      let newImageURL = formData.profileImage;

      if (file) {
        const data = new FormData();
        data.append("file", file);
        data.append("upload_preset", UPLOAD_PRESET);
        data.append("cloud_name", CLOUD_NAME);
        const res = await fetch(
          `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
          {
            method: "POST",
            body: data,
          }
        );

        const uploadedImageURL = await res.json();
        newImageURL = uploadedImageURL.url;
        setImageURL(uploadedImageURL.url);
      }

      const updatedData = {
        ...formData,
        profileImage: newImageURL,
      };

      await axios
        .post(
          `${BACKEND_URL}/api/dashboard/editProfileDashboard`,
          { formData: updatedData },
          { 
            withCredentials: true,
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        )
        .then((res) => {
          if (res.data.success === true) {
            setFormData(res.data.myData);
          }
        })
        .catch(() => {
          // console.log("error in sending data to backend");
        });

      SetFile(null);
    }

    setEditMode(!editMode);
  }

  function handleChecked(e) {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.checked }));
  }

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleImageChange = async (e) => {
    const myFile = e.target.files[0];
    if (myFile) {
      const imgURL = URL.createObjectURL(myFile);
      setImageURL(imgURL);
      SetFile(myFile);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <div className={`flex items-center ${editMode?"flex-col":"flex-row"} gap-6`}>
        <img
          src={ImageURL || "https://icon-library.com/images/generic-user-icon/generic-user-icon-9.jpg"}
          alt="profileImage"
          className="w-36 h-36 rounded-full object-cover border-2 border-gray-400 shadow-sm"
          onError={(e) => {
            e.target.src = "https://icon-library.com/images/generic-user-icon/generic-user-icon-9.jpg";
          }}
        />

        {editMode && (
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="block text-sm text-gray-700 file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700"
          />
        )}
      </div>

      <input
        name="name"
        type="text"
        value={formData.name || ""}
        onChange={handleChange}
        placeholder="Full Name"
        disabled={!editMode}
        className="border border-gray-300 bg-white text-black p-2 rounded w-full disabled:opacity-60"
      />

      <input
        name="email"
        type="email"
        value={formData.email || ""}
        onChange={handleChange}
        placeholder="Email"
        disabled={!editMode}
        className="border border-gray-300 bg-white text-black p-2 rounded w-full disabled:opacity-60"
      />

      <input
        name="phone"
        type="tel"
        value={formData.phone || ""}
        onChange={handleChange}
        placeholder="Phone Number"
        disabled={!editMode}
        className="border border-gray-300 bg-white text-black p-2 rounded w-full disabled:opacity-60"
      />

      <input
        name="dob"
        type="date"
        value={
          formData.dob
            ? new Date(formData.dob).toISOString().substring(0, 10)
            : ""
        }
        onChange={handleChange}
        disabled={!editMode}
        className="border border-gray-300 bg-white text-black p-2 rounded w-full disabled:opacity-60"
      />

      <input
        name="bloodGroup"
        type="text"
        value={formData.bloodGroup || ""}
        onChange={handleChange}
        placeholder="Blood Group"
        disabled={!editMode}
        className="border border-gray-300 bg-white text-black p-2 rounded w-full disabled:opacity-60"
      />

      <textarea
        name="address"
        value={formData.address || ""}
        onChange={handleChange}
        placeholder="Address"
        disabled={!editMode}
        className="border border-gray-300 bg-white text-black p-2 rounded w-full disabled:opacity-60"
      ></textarea>

      <div className="flex gap-8 text-sm">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            name="smoking"
            checked={formData.smoking || false}
            onChange={handleChecked}
            disabled={!editMode}
            className="accent-red-600"
          />
          Smoking
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            name="drinking"
            checked={formData.drinking || false}
            onChange={handleChecked}
            disabled={!editMode}
            className="accent-blue-600"
          />
          Drinking
        </label>
      </div>

      <div className="flex flex-wrap gap-4 mt-4">
        <button
          onClick={() => saveKaro()}
          className={`cursor-pointer text-white px-4 py-2 rounded font-semibold transition-all ${
            !editMode
              ? "bg-orange-500 hover:bg-orange-600"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {editMode ? "Save Changes" : "Edit Profile"}
        </button>
      </div>
    </div>
  );
};

export default ProfileSection;
