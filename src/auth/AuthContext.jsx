import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { jwtDecode } from "jwt-decode";
import { useQueryClient } from "@tanstack/react-query";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const qc = useQueryClient();
  // Initialize from either localStorage or sessionStorage
  const getFromStores = (key) =>
    localStorage.getItem(key) || sessionStorage.getItem(key) || "";
  const [token, setToken] = useState(() => getFromStores("token"));
  const [role, setRole] = useState(() => getFromStores("role"));
  const [employeeId, setEmployeeId] = useState(() => getFromStores("employee_id"));

  useEffect(() => {
    if (token) {
      try {
        const decoded = jwtDecode(token);
        const r = decoded?.role || "";
        const eid = decoded?.employee_id || decoded?.id || "";
        setRole(r);
        setEmployeeId(eid);
        // Determine which storage to use (default to localStorage)
        const storagePref = sessionStorage.getItem("auth_storage") || "local";
        const primary = storagePref === "session" ? sessionStorage : localStorage;
        const secondary = storagePref === "session" ? localStorage : sessionStorage;
        primary.setItem("token", token);
        primary.setItem("role", r);
        primary.setItem("employee_id", eid);
        // Clear other store to avoid conflicts
        secondary.removeItem("token");
        secondary.removeItem("role");
        secondary.removeItem("employee_id");
      } catch (e) {
        logout();
      }
    } else {
      logout();
    }
  }, [token]);

  const login = (t, remember = true) => {
    // record preference for future writes
    sessionStorage.setItem("auth_storage", remember ? "local" : "session");
    setToken(t);
  };

  const logout = () => {
    setToken("");
    setRole("");
    setEmployeeId("");
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("employee_id");
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("role");
    sessionStorage.removeItem("employee_id");
    sessionStorage.removeItem("auth_storage");
    // Clear react-query cache to avoid stale data between sessions
    try { qc.clear(); } catch {}
  };

  const value = useMemo(
    () => ({ token, role, employeeId, login, logout }),
    [token, role, employeeId]
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
