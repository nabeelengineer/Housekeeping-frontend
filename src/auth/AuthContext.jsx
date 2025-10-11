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
  const [token, setToken] = useState(() => localStorage.getItem("token") || "");
  const [role, setRole] = useState(() => localStorage.getItem("role") || "");
  const [employeeId, setEmployeeId] = useState(
    () => localStorage.getItem("employee_id") || ""
  );

  useEffect(() => {
    if (token) {
      try {
        const decoded = jwtDecode(token);
        const r = decoded?.role || "";
        const eid = decoded?.employee_id || decoded?.id || "";
        setRole(r);
        setEmployeeId(eid);
        localStorage.setItem("token", token);
        localStorage.setItem("role", r);
        localStorage.setItem("employee_id", eid);
      } catch (e) {
        logout();
      }
    } else {
      logout();
    }
  }, [token]);

  const login = (t) => setToken(t);

  const logout = () => {
    setToken("");
    setRole("");
    setEmployeeId("");
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("employee_id");
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
