// src/screens/Signup.tsx

import React, { useEffect, useState, useCallback } from "react";
import { User, signOut } from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../firebase";

interface SignupProps {
  user: User;
  boothUpdate?: (booth: string) => void;
}

const Signup: React.FC<SignupProps> = ({ user, boothUpdate }) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [booth, setBooth] = useState<string>("");
  const [phone, setPhone] = useState<string>(user.phoneNumber || "");
  const [profileExists, setProfileExists] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const checkUserProfile = useCallback(async () => {
    const userRef = doc(db, "users", user.uid);
    const snap = await getDoc(userRef);

    if (snap.exists()) {
      const userData = snap.data();
      setBooth(userData.booth_number || "");
      setPhone(userData.mobile_number || user.phoneNumber || "");
      setProfileExists(true);
    }

    setLoading(false);
  }, [user.uid, user.phoneNumber]);

  useEffect(() => {
    checkUserProfile();
  }, [checkUserProfile]);

  const createProfile = async () => {
    setError("");
    
    if (!booth) {
      setError("ബൂത്ത് നമ്പർ ആവശ്യമാണ്");
      return;
    }

    if (!phone) {
      setError("മൊബൈൽ നമ്പർ ആവശ്യമാണ്");
      return;
    }

    const userRef = doc(db, "users", user.uid);
    const profileData = {
      mobile_number: phone,
      booth_number: booth,
      role: "booth_user",
      created_at: serverTimestamp()
    };

    try {
      await setDoc(userRef, profileData);
      setProfileExists(true);
      boothUpdate && boothUpdate(booth);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "പ്രൊഫൈൽ സൃഷ്ടിക്കാൻ കഴിഞ്ഞില്ല";
      setError(`Error: ${errorMsg}`);
      console.error("Profile creation error:", err);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      setError("ലോഗൗട്ട് ചെയ്യാൻ കഴിഞ്ഞില്ല");
      console.error("Logout error:", err);
    }
  };

  if (loading) return <div>ലോഡുചെയ്യുന്നു...</div>;

  if (profileExists) {
    return (
      <div style={{ padding: 20, textAlign: "center" }}>
        <div style={{ backgroundColor: "#ccffcc", color: "#00cc00", padding: 20, borderRadius: 5, marginBottom: 20 }}>
          <h2 style={{ margin: "0 0 10px 0" }}>✓ വിജയകരമായി ലോഗിൻ ചെയ്തു</h2>
          {/* <p style={{ margin: 0 }}>Welcome! You are ready for data entry.</p> */}
        </div>
        <div style={{ marginTop: 20 }}>
          <p><strong>പേര്:</strong> {user.displayName || "N/A"}</p>
          <p><strong>ഫോൺ:</strong> {phone}</p>
          <p><strong>ബൂത്ത് നമ്പർ:</strong> {booth}</p>
          {/* <p><strong>User ID:</strong> {user.uid}</p> */}
        </div>

        <div style={{ marginTop: 30, padding: 15, backgroundColor: "#f0f0f0", borderRadius: 5 }}>
          <h3 style={{ margin: "0 0 10px 0" }}>ബൂത്ത് നമ്പർ മാറ്റുക</h3>
          <input
            type="text"
            placeholder="പുതിയ ബൂത്ത് നമ്പർ"
            value={booth}
            onChange={(e) => setBooth(e.target.value)}
            style={{ 
              width: "100%", 
              padding: 12, 
              marginBottom: 10, 
              boxSizing: "border-box",
              borderRadius: 5,
              border: "1px solid #ddd"
            }}
            lang="ml"
            inputMode="text"
          />
          <button
            onClick={createProfile}
            style={{
              width: "100%",
              padding: 12,
              backgroundColor: "#2e7d32",
              color: "white",
              border: "none",
              cursor: "pointer",
              borderRadius: 5,
              fontSize: 14,
              fontWeight: "600"
            }}
          >
            ബൂത്ത് അപ്ഡേറ്റ് ചെയ്യുക
          </button>
        </div>

        <button
          onClick={handleLogout}
          style={{
            width: "100%",
            padding: 15,
            backgroundColor: "#cc0000",
            color: "white",
            border: "none",
            cursor: "pointer",
            borderRadius: 5,
            marginTop: 20,
            fontSize: 16
          }}
        >
          ലോഗൗട്ട്
        </button>
      </div>
    );
  }

  return (
    <div className="p-5 text-center pt-10">
      <h2>നിങ്ങളുടെ ബൂത്ത് നമ്പർ</h2>

      {error && (
        <div style={{ backgroundColor: "#ffcccc", color: "#cc0000", padding: 15, marginBottom: 20, borderRadius: 5 }}>
          {error}
        </div>
      )}

      {!phone && (
        <input
          type="tel"
          placeholder="മൊബൈൽ നമ്പർ"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          style={{ width: "100%", padding: 15, marginBottom: 20, boxSizing: "border-box" }}
          maxLength={10}
          lang="ml"
          inputMode="numeric"
        />
      )}

      <input
        type="text"
        placeholder="ബൂത്ത് നമ്പർ"
        value={booth}
        onChange={(e) => setBooth(e.target.value)}
        style={{ width: "100%", padding: 15, marginBottom: 20, boxSizing: "border-box" }}
        lang="ml"
        inputMode="text"
      />

      <button
        onClick={createProfile}
        className="w-full my-4 p-4 bg-gradient-to-br from-[#1b5e20] to-[#4caf50] text-white border-none cursor-pointer rounded-md shadow-[2px_8px_6px_rgba(129,199,132,0.5)]"
      >
        തുടരുക
      </button>

      <button
        onClick={handleLogout}
        className="w-full p-4 bg-[#cc0000] text-white border-none cursor-pointer rounded-md mt-3 shadow-[2px_4px_8px_rgba(204,0,0,0.4)]"
      >
        ലോഗൗട്ട്
      </button>
    </div>
  );
};

export default Signup;
