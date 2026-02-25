import { useEffect, useRef } from "react";
import { signOut } from "firebase/auth";
import { auth } from "./firebase";

const AUTO_LOGOUT_HOURS = 3;
const AUTO_LOGOUT_MS = AUTO_LOGOUT_HOURS * 60 * 60 * 1000;
const LAST_ACTIVITY_KEY = "lastActivityTime";

function useAutoLogout() {
  const timer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Check if user should be logged out based on last activity
    const checkInactivity = () => {
      const lastActivity = localStorage.getItem(LAST_ACTIVITY_KEY);
      if (lastActivity) {
        const timeSinceLastActivity = Date.now() - parseInt(lastActivity, 10);
        if (timeSinceLastActivity > AUTO_LOGOUT_MS) {
          console.log("Auto logout: Inactivity timeout reached");
          signOut(auth);
          localStorage.removeItem(LAST_ACTIVITY_KEY);
          return true;
        }
      }
      return false;
    };

    // Update last activity timestamp
    const updateActivity = () => {
      localStorage.setItem(LAST_ACTIVITY_KEY, Date.now().toString());
    };

    // Check on mount and page visibility change
    if (checkInactivity()) return;

    const resetTimer = () => {
      updateActivity();
      
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => {
        console.log("Auto logout: Timer expired");
        signOut(auth);
        localStorage.removeItem(LAST_ACTIVITY_KEY);
      }, AUTO_LOGOUT_MS);
    };

    // Check inactivity when page becomes visible
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        if (!checkInactivity()) {
          resetTimer();
        }
      }
    };

    // Listen for user activity
    window.addEventListener("mousemove", resetTimer);
    window.addEventListener("keydown", resetTimer);
    window.addEventListener("click", resetTimer);
    window.addEventListener("touchstart", resetTimer);
    window.addEventListener("scroll", resetTimer);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    resetTimer(); // start timer on mount

    return () => {
      if (timer.current) clearTimeout(timer.current);
      window.removeEventListener("mousemove", resetTimer);
      window.removeEventListener("keydown", resetTimer);
      window.removeEventListener("click", resetTimer);
      window.removeEventListener("touchstart", resetTimer);
      window.removeEventListener("scroll", resetTimer);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);
}

export default useAutoLogout;
