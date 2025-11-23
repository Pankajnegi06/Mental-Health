import { React, useContext } from "react";
import { createContext, useState, useEffect } from "react";
import axios from "axios";

const AppContext = createContext();
export const useAppContext = () => useContext(AppContext);

export const AppProvider = (props) => {
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState(null);
  const [table, setTable] = useState([]);

  // ---------------------------------------
  // AXIOS Instance for Context Only
  // ---------------------------------------
  const api = axios.create({
    baseURL: BACKEND_URL,
    withCredentials: true,
    headers: {
      Accept: "application/json",
      "Cache-Control": "no-cache",
    },
  });

  // Add request interceptor to include token
  api.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem("token");
      // const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5MWRlOGEzNjNhMjdkYmU5ZjI4YmVmOSIsImlhdCI6MTc2MzU2Nzg5NywiZXhwIjoxNzY0MTcyNjk3fQ.3yx3629qD6KFrYZLS_kjgxgGyJxiyYF5e-6pN2biAVQ"; // Hardcoded for testing
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // ---------------------------------------
  // MAIN AUTH CHECK (COOKIE BASED)
  // ---------------------------------------
  const getAuthState = async () => {
    try {
      const res = await api.get("/api/auth/isAuthenticated");

      if (res.data?.success && (res.data.user || res.data.userData)) {
        const user = res.data.user || res.data.userData;

        setIsLoggedIn(true);
        setUserData(user);

        // store for components that rely on userId
        if (user._id) localStorage.setItem("userId", user._id);

        // preload table
        getTable();

        return user;
      }

      // not authenticated
      setIsLoggedIn(false);
      setUserData(null);
      localStorage.removeItem("userId");
      // Do not remove token here immediately, as it might be valid but session expired? 
      // Actually, if not authenticated, we should probably clear it.
      // But let's be safe and only clear if explicitly failed or logout.
      return null;
    } catch (err) {
      // session invalid
      setIsLoggedIn(false);
      setUserData(null);
      localStorage.removeItem("userId");
      // localStorage.removeItem("token"); // Optional: clear token on error
      return null;
    }
  };

  // ---------------------------------------
  // FETCH TABLE (APPOINTMENTS)
  // ---------------------------------------
  const getTable = async () => {
    try {
      const res = await api.get("/api/appointment/getTable");

      if (res.data.success === true) {
        setTable(res.data.myTable);
      } else {
        setTable([]);
      }
    } catch (err) {
      console.error("Table fetch failed:", err);
      setTable([]);
    }
  };

  // ---------------------------------------
  // FETCH USER DATA (OPTIONAL)
  // ---------------------------------------
  const getUserData = async () => {
    try {
      const res = await api.get("/api/userData/getUserData");

      if (res.data?.status === 1 && res.data.userData) {
        const user = res.data.userData;

        setUserData(user);
        if (user._id) localStorage.setItem("userId", user._id);

        return user;
      }

      return null;
    } catch (err) {
      console.error("User data load failed:", err);
      return null;
    }
  };

  // ---------------------------------------
  // INITIAL AUTH CHECK
  // ---------------------------------------
  useEffect(() => {
    getAuthState();
  }, []);

  return (
    <AppContext.Provider
      value={{
        BACKEND_URL,
        isLoggedIn,
        setIsLoggedIn,
        userData,
        setUserData,
        getAuthState,
        getTable,
        getUserData,
        table,
        setTable,
      }}
    >
      {props.children}
    </AppContext.Provider>
  );
};
