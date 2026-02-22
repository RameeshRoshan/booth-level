import { useEffect, useRef } from "react";
import { signOut } from "firebase/auth";
import { auth } from "./firebase";

const AUTO_LOGOUT_HOURS = 3;
const AUTO_LOGOUT_MS = AUTO_LOGOUT_HOURS * 60 * 60 * 1000;

function useAutoLogout() {
  const timer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const resetTimer = () => {
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => {
        signOut(auth);
        // Optionally, show a message or redirect
      }, AUTO_LOGOUT_MS);
    };

    // Listen for user activity
    window.addEventListener("mousemove", resetTimer);
    window.addEventListener("keydown", resetTimer);
    window.addEventListener("click", resetTimer);
    window.addEventListener("touchstart", resetTimer);

    resetTimer(); // start timer on mount

    return () => {
      if (timer.current) clearTimeout(timer.current);
      window.removeEventListener("mousemove", resetTimer);
      window.removeEventListener("keydown", resetTimer);
      window.removeEventListener("click", resetTimer);
      window.removeEventListener("touchstart", resetTimer);
    };
  }, []);
}

export default useAutoLogout;
