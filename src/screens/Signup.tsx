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
      setError("Booth number is required");
      return;
    }

    if (!phone) {
      setError("Mobile number is required");
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
      const errorMsg = err instanceof Error ? err.message : "Failed to create profile";
      setError(`Error: ${errorMsg}`);
      console.error("Profile creation error:", err);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      setError("Failed to logout");
      console.error("Logout error:", err);
    }
  };

  if (loading) return <div>Loading...</div>;

  if (profileExists) {
    return (
      <div style={{ padding: 20, textAlign: "center" }}>
        <div style={{ backgroundColor: "#ccffcc", color: "#00cc00", padding: 20, borderRadius: 5, marginBottom: 20 }}>
          <h2 style={{ margin: "0 0 10px 0" }}>✓ Successfully Logged In</h2>
          {/* <p style={{ margin: 0 }}>Welcome! You are ready for data entry.</p> */}
        </div>
        <div style={{ marginTop: 20 }}>
          <p><strong>Name:</strong> {user.displayName || "N/A"}</p>
          <p><strong>Phone:</strong> {phone}</p>
          <p><strong>Booth Number:</strong> {booth}</p>
          {/* <p><strong>User ID:</strong> {user.uid}</p> */}
        </div>

        <div style={{ marginTop: 30, padding: 15, backgroundColor: "#f0f0f0", borderRadius: 5 }}>
          <h3 style={{ margin: "0 0 10px 0" }}>Change Booth Number</h3>
          <input
            type="text"
            placeholder="New Booth Number"
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
            Update Booth
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
          Logout
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>Signup</h2>

      {error && (
        <div style={{ backgroundColor: "#ffcccc", color: "#cc0000", padding: 15, marginBottom: 20, borderRadius: 5 }}>
          {error}
        </div>
      )}

      {!phone && (
        <input
          type="tel"
          placeholder="Mobile Number"
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
        placeholder="Booth Number"
        value={booth}
        onChange={(e) => setBooth(e.target.value)}
        style={{ width: "100%", padding: 15, marginBottom: 20, boxSizing: "border-box" }}
        lang="ml"
        inputMode="text"
      />

      <button
        onClick={createProfile}
        style={{
          width: "100%",
          padding: 15,
          backgroundColor: "green",
          color: "white",
          border: "none",
          cursor: "pointer",
          borderRadius: 5
        }}
      >
        Continue
      </button>

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
          marginTop: 10
        }}
      >
        Logout
      </button>
    </div>
  );
};

export default Signup;
