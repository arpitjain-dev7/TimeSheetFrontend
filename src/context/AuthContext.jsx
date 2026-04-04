import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

// Create Auth Context
const AuthContext = createContext(null);

/**
 * AuthProvider wraps the app and provides authentication state
 * and helper functions throughout the component tree.
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // { username, email, roles }
  const [accessToken, setAccessToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // On mount, restore session from localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem("accessToken");
    const storedUser = localStorage.getItem("user");
    if (storedToken && storedUser) {
      setAccessToken(storedToken);
      setUser(JSON.parse(storedUser));
      axios.defaults.headers.common["Authorization"] = `Bearer ${storedToken}`;
    }
    setLoading(false);
  }, []);

  /**
   * Persist tokens and user info returned by the login API.
   * @param {{ accessToken, refreshToken, username, email, roles }} data
   */
  const login = ({ accessToken, refreshToken, username, email, roles }) => {
    const userData = { username, email, roles };
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("refreshToken", refreshToken);
    localStorage.setItem("user", JSON.stringify(userData));
    axios.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;
    setAccessToken(accessToken);
    setUser(userData);
  };

  /**
   * Clear all auth state and storage on logout.
   */
  const logout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    delete axios.defaults.headers.common["Authorization"];
    setAccessToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, accessToken, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Custom hook for consuming AuthContext.
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export default AuthContext;
