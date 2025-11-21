import { useState, useEffect } from "react";

export const useAuth = () => {
  const [userRole, setUserRole] = useState(
    localStorage.getItem("user_role") || null
  );
  const [userName, setUserName] = useState(
    localStorage.getItem("user_name") || null
  );

  useEffect(() => {
    const handleStorageChange = () => {
      setUserRole(localStorage.getItem("user_role"));
      setUserName(localStorage.getItem("user_name"));
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const isAdmin = userRole === "admin";
  const isCitizen = userRole === "citizen";

  return {
    userRole,
    userName,
    isAdmin,
    isCitizen,
  };
};

export const getUserRole = () => {
  return localStorage.getItem("user_role");
};

export const isUserAdmin = () => {
  return localStorage.getItem("user_role") === "admin";
};

