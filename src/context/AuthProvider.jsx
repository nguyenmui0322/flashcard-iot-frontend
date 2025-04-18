import { useState, useEffect } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  getIdToken,
} from "firebase/auth";
import { auth } from "../firebase/config";
import { AuthContext } from "./AuthContext";

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);

  function signup(email, password) {
    return createUserWithEmailAndPassword(auth, email, password);
  }

  function login(email, password) {
    return signInWithEmailAndPassword(auth, email, password);
  }

  function logout() {
    return signOut(auth);
  }

  function resetPassword(email) {
    return sendPasswordResetEmail(auth, email);
  }

  // Function to get a fresh token
  async function getAccessToken() {
    if (!currentUser) return null;
    try {
      // This forces a refresh of the token if it's expired
      const freshToken = await getIdToken(currentUser, true);
      return freshToken;
    } catch (error) {
      console.error("Error refreshing token:", error);
      return null;
    }
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Get initial token
        try {
          const initialToken = await getIdToken(user);
          setToken(initialToken);

          // Set up token refresh every 50 minutes (tokens expire after 1 hour)
          const refreshInterval = setInterval(async () => {
            try {
              const freshToken = await getIdToken(user, true);
              setToken(freshToken);
              console.log("Token refreshed");
            } catch (error) {
              console.error("Token refresh failed:", error);
            }
          }, 50 * 60 * 1000); // 50 minutes

          // Add the token and interval to user object
          user.accessToken = initialToken;
          user._tokenRefreshInterval = refreshInterval;
        } catch (error) {
          console.error("Error getting initial token:", error);
        }
      }

      setCurrentUser(user);
      setLoading(false);
    });

    return () => {
      unsubscribe();
      // Clear any existing interval when component unmounts
      if (currentUser && currentUser._tokenRefreshInterval) {
        clearInterval(currentUser._tokenRefreshInterval);
      }
    };
  }, []);

  const value = {
    currentUser,
    token,
    getAccessToken,
    signup,
    login,
    logout,
    resetPassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
