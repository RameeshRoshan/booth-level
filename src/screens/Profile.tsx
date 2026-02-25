// src/screens/Profile.tsx

import React, { useEffect, useState, useCallback } from "react";
import { User, signOut } from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../firebase";
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import { isValidBoothNumber } from "../constants/boothNumbers";

// Constants
const ERROR_MESSAGES = {
  boothRequired: "Booth number is required",
  boothInvalid: "സാധുവായ ബൂത്ത് നമ്പർ നൽകുക (001-188)",
  phoneRequired: "Mobile number is required",
  failedToFetch: "Error fetching profile",
  failedToUpdate: "Failed to update booth",
  failedToLogout: "Failed to logout",
};

const SUCCESS_MESSAGES = {
  boothUpdated: "✓ Booth number updated successfully!",
};

const MESSAGE_CLEAR_TIMEOUT = 3000;

// Types
interface ProfileProps {
  user: User;
  onBoothChange?: (booth:string) => void;
  // stateUpdate?: React.Dispatch<React.SetStateAction<any>>;
}

interface ProfileState {
  booth: string;
  phone: string;
  loading: boolean;
  error: string;
  successMessage: string;
}

const Profile: React.FC<ProfileProps> = ({ user, onBoothChange }) => {
  const [state, setState] = useState<ProfileState>({
    booth: "",
    phone: user.phoneNumber || "",
    loading: true,
    error: "",
    successMessage: "",
  });
  const [editMode, setEditMode] = useState(false);

  // Fetch user profile from Firestore
  const fetchProfile = useCallback(async () => {
    try {
      const userRef = doc(db, "users", user.uid);
      const snap = await getDoc(userRef);

      if (snap.exists()) {
        const userData = snap.data();
        setState((prev) => ({
          ...prev,
          booth: userData.booth_number || "",
          phone: userData.mobile_number || user.phoneNumber || "",
          loading: false,
        }));
      } else {
        setState((prev) => ({ ...prev, loading: false }));
      }
    } catch (err) {
      console.error(ERROR_MESSAGES.failedToFetch, err);
      setState((prev) => ({ ...prev, loading: false }));
    }
  }, [user]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  // Update booth number
  const updateBooth = useCallback(async () => {
    setState((prev) => ({ ...prev, error: "", successMessage: "" }));

    if (!state.booth.trim()) {
      setState((prev) => ({ ...prev, error: ERROR_MESSAGES.boothRequired }));
      return;
    }

    if (!isValidBoothNumber(state.booth.trim())) {
      setState((prev) => ({ ...prev, error: ERROR_MESSAGES.boothInvalid }));
      return;
    }

    try {
      const userRef = doc(db, "users", user.uid);
      await setDoc(userRef, {
        mobile_number: state.phone,
        booth_number: state.booth.trim(),
        role: "booth_user",
        created_at: serverTimestamp(),
      });

      setState((prev) => ({
        ...prev,
        successMessage: SUCCESS_MESSAGES.boothUpdated,
      }));
      onBoothChange && onBoothChange(state.booth.trim());

      setTimeout(() => {
        setState((prev) => ({ ...prev, successMessage: "" }));
        // if (onBoothChange) onBoothChange(state.booth.trim());
      }, MESSAGE_CLEAR_TIMEOUT);
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : ERROR_MESSAGES.failedToUpdate;
      setState((prev) => ({
        ...prev,
        error: `Error: ${errorMsg}`,
      }));
      console.error("Update error:", err);
    }
  }, [state.booth, state.phone, user.uid, onBoothChange]);

  // Handle logout
  const handleLogout = useCallback(async () => {
    try {
      await signOut(auth);
    } catch (err) {
      setState((prev) => ({
        ...prev,
        error: ERROR_MESSAGES.failedToLogout,
      }));
      console.error("Logout error:", err);
    }
  }, []);

  if (state.loading) {
    return (
      <div style={{ padding: "20px", textAlign: "center" }}>
        Loading profile...
      </div>
    );
  }

  return (
    <div className="w-full max-w-[500px] mx-auto p-4">
      {/* <div className="bg-linear-to-br from-[#1F4386] to-[#0697C7] rounded-lg text-white text-center">
        <h5 style={styles.title}>ഉപയോക്തൃ പ്രൊഫൈൽ</h5>
      </div> */}

      {state.error && (
        <div style={styles.error}>
          {state.error}
        </div>
      )}

      {state.successMessage && (
        <div style={styles.success}>
          {state.successMessage}
        </div>
      )}

      <div 
      // className="bg-linear-to-br from-[#1F4386] to-[#0697C7] rounded-lg text-white text-center"
      style={styles.profileCard}
       >
        <div style={styles.infoSection}>
          <h3 style={styles.sectionTitle}>അക്കൗണ്ട് വിവരങ്ങൾ</h3>
          <div style={styles.infoRow}>
            <span style={styles.label}>ഫോൺ നമ്പർ:</span>
            <span style={styles.value}>{state.phone}</span>
          </div>
          <div style={styles.infoRow}>
            <span style={styles.label}>നിലവിലെ ബൂത്ത്:</span>
            <span style={{ ...styles.value, fontWeight: "bold", color: "#2e7d32" }}>
              {state.booth}
            </span>
            {!editMode && (
              <button
                style={{ background: 'none', border: 'none', cursor: 'pointer', marginLeft: 8 }}
                onClick={() => setEditMode(true)}
                aria-label="Edit booth number"
              >
                <EditIcon fontSize="small" />
              </button>
            )}
          </div>
        </div>

        {/* {!editMode && (
          <button onClick={handleLogout} style={styles.logoutButton}>
            🚪 ലോഗൗട്ട്
          </button>
        )} */}

        {editMode && (
          <div style={styles.changeBoothSection}>
            <h3 style={styles.sectionTitle}>ബൂത്ത് നമ്പർ മാറ്റുക</h3>
            <input
              type="text"
              placeholder="ബൂത്ത് നമ്പർ നൽകുക"
              value={state.booth}
              onChange={(e) =>
                setState((prev) => ({ ...prev, booth: e.target.value }))
              }
              style={styles.input}
              lang="ml"
              inputMode="text"
            />
            <button onClick={updateBooth} style={styles.updateButton} className="w-full p-3 text-white border-none rounded-md cursor-pointer text-sm font-semibold mb-[10px] bg-linear-to-br from-[#1b5e20] to-[#4caf50] shadow-[2px_8px_6px_rgba(129,199,132,0.5)]">
              അപ്ഡേറ്റ് ചെയ്യുക
            </button>
            <button
              onClick={() => setEditMode(false)}
              className="shadow-[2px_8px_10px_rgba(136,136,136,0.3)]"
              style={{ ...styles.logoutButton, backgroundColor: '#888', marginTop: 8 }}
            >
              റദ്ദാക്കുക
            </button>
          </div>
        )}
      </div>
      {!editMode && (
        <button onClick={handleLogout} className="w-full p-3 bg-[#d32f2f] text-white border-none rounded-md cursor-pointer text-sm font-semibold shadow-[0_8px_10px_rgba(211,47,47,0.35)]">
          ലോഗൗട്ട്
        </button>
      )}
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    width: "100%",
    maxWidth: "500px",
    margin: "0 auto",
    padding: "16px",
    position: "relative",
  },
  header: {
    backgroundColor: "#2e7d32",
    color: "white",
    padding: "16px",
    borderRadius: "8px",
    marginBottom: "16px",
    textAlign: "center",
  },
  title: {
    margin: 0,
    fontSize: "20px",
    fontWeight: "600",
  },
  error: {
    backgroundColor: "#ffcccc",
    color: "#cc0000",
    padding: "12px",
    borderRadius: "6px",
    marginBottom: "16px",
    fontSize: "14px",
    border: "1px solid #ff6666",
  },
  success: {
    backgroundColor: "#ccffcc",
    color: "#00cc00",
    padding: "12px",
    borderRadius: "6px",
    marginBottom: "16px",
    fontSize: "14px",
    border: "1px solid #66ff66",
  },
  profileCard: {
    backgroundColor: "white",
    borderRadius: "8px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    padding: "16px",
    marginBottom: "16px",
  },
  infoSection: {
    // marginBottom: "20px",
    // paddingBottom: "16px",
    // borderBottom: "1px solid #e0e0e0",
  },
  sectionTitle: {
    margin: "0 0 12px 0",
    fontSize: "14px",
    fontWeight: "600",
    color: "#333",
  },
  infoRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "10px",
    fontSize: "13px",
  },
  label: {
    color: "#666",
    fontWeight: "500",
  },
  value: {
    color: "#333",
    fontWeight: "600",
    textAlign: "right",
  },
  valueSmall: {
    color: "#999",
    fontSize: "11px",
    textAlign: "right",
    maxWidth: "200px",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  changeBoothSection: {
    marginBottom: "16px",
  },
  input: {
    width: "100%",
    padding: "11px",
    fontSize: "14px",
    border: "1px solid #ddd",
    borderRadius: "6px",
    boxSizing: "border-box",
    marginBottom: "10px",
    fontFamily: "inherit",
  },
  updateButton: {
    width: "100%",
    padding: "12px",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "600",
    marginBottom: "10px",
  },
  logoutButton: {
    width: "100%",
    padding: "12px",
    backgroundColor: "#d32f2f",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "600",
  },
};

export default Profile;
