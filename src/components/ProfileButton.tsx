import React, { useState } from "react";
import { User, signOut } from "firebase/auth";
import { auth } from "../firebase";

interface ProfileButtonProps {
  user: User | null;
}

const ProfileButton: React.FC<ProfileButtonProps> = ({ user }) => {
  const [showProfile, setShowProfile] = useState(false);

  const handleLogout = async () => {
    await signOut(auth);
    setShowProfile(false);
  };

  return (
    <div style={styles.container}>
      <button
        onClick={() => setShowProfile(!showProfile)}
        style={styles.profileButton}
      >
        <span style={styles.userIcon}>👤</span>
        <span style={styles.phoneText}>{user?.phoneNumber || "Profile"}</span>
      </button>

      {showProfile && (
        <div style={styles.profileCard}>
          <div style={styles.profileHeader}>
            <div style={styles.userIconLarge}>👤</div>
            <h3 style={styles.profileTitle}>Account Details</h3>
          </div>

          <div style={styles.profileContent}>
            <div style={styles.detailRow}>
              <span style={styles.label}>Phone Number:</span>
              <span style={styles.value}>{user?.phoneNumber}</span>
            </div>

            <div style={styles.detailRow}>
              <span style={styles.label}>User ID:</span>
              <span style={styles.valueSmall}>{user?.uid}</span>
            </div>

            <div style={styles.detailRow}>
              <span style={styles.label}>Status:</span>
              <span style={styles.statusBadge}>Active</span>
            </div>
          </div>

          <button onClick={handleLogout} style={styles.logoutButton}>
            🚪 Logout
          </button>

          <button
            onClick={() => setShowProfile(false)}
            style={styles.closeButton}
          >
            Close
          </button>
        </div>
      )}

      {showProfile && (
        <div
          style={styles.backdrop}
          onClick={() => setShowProfile(false)}
        />
      )}
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    position: "relative",
    display: "inline-block",
  },
  profileButton: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    padding: "8px 12px",
    backgroundColor: "#2e7d32",
    color: "white",
    border: "none",
    borderRadius: "20px",
    cursor: "pointer",
    fontSize: "12px",
    fontWeight: "600",
    transition: "background-color 0.3s ease",
    minHeight: "36px",
  },
  userIcon: {
    fontSize: "16px",
  },
  phoneText: {
    display: "inline-block",
    maxWidth: "100px",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  backdrop: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    zIndex: 98,
  },
  profileCard: {
    position: "absolute",
    top: "100%",
    right: 0,
    marginTop: "8px",
    backgroundColor: "white",
    borderRadius: "12px",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
    zIndex: 99,
    minWidth: "280px",
    maxWidth: "90vw",
    overflow: "hidden",
  },
  profileHeader: {
    backgroundColor: "#2e7d32",
    color: "white",
    padding: "12px",
    textAlign: "center",
  },
  userIconLarge: {
    fontSize: "32px",
    marginBottom: "6px",
  },
  profileTitle: {
    margin: 0,
    fontSize: "14px",
    fontWeight: "600",
  },
  profileContent: {
    padding: "12px",
    borderBottom: "1px solid #e0e0e0",
  },
  detailRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "10px",
    fontSize: "12px",
    flexWrap: "wrap",
  },
  label: {
    color: "#666",
    fontWeight: "500",
  },
  value: {
    color: "#333",
    fontWeight: "600",
    textAlign: "right",
    flex: 1,
    marginLeft: "8px",
  },
  valueSmall: {
    color: "#999",
    fontSize: "11px",
    textAlign: "right",
    flex: 1,
    marginLeft: "8px",
    maxWidth: "120px",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  statusBadge: {
    display: "inline-block",
    backgroundColor: "#4caf50",
    color: "white",
    padding: "3px 10px",
    borderRadius: "12px",
    fontSize: "11px",
    fontWeight: "600",
  },
  logoutButton: {
    width: "100%",
    padding: "10px",
    backgroundColor: "#d32f2f",
    color: "white",
    border: "none",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "600",
    transition: "background-color 0.3s ease",
    borderRadius: 0,
  },
  closeButton: {
    width: "100%",
    padding: "10px",
    backgroundColor: "#f5f5f5",
    color: "#333",
    border: "none",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "600",
    transition: "background-color 0.3s ease",
    borderRadius: 0,
  },
};

export default ProfileButton;
