import { createContext, useContext, useEffect, useState } from "react";
import API from "../api/axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    return JSON.parse(localStorage.getItem("user"));
  });

  const login = (userData, access, refresh) => {
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("access", access);
    localStorage.setItem("refresh", refresh);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    setUser(null);
  };

  useEffect(() => {
    if (!user) return;

    const checkUser = async () => {
      try {
        const res = await API.get("/accounts/profile/");

        if (res.data.is_blocked) {
          alert("Your account has been blocked by admin");
          logout();
        }
      } catch (err) {
        logout();
      }
    };

    checkUser();
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);