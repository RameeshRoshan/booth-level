import React from "react";
import { User } from "firebase/auth";

interface LayoutProps {
  user: User | null;
  children: React.ReactNode;
  title?: string;
  onProfileClick?: () => void;
  onProfileClose?: () => void;
  role?: string;
}

const isPWA = () => {
  return window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as any).standalone === true ||
    document.referrer.startsWith('android-app://');
};

const Layout: React.FC<LayoutProps> = ({ user, children, title, onProfileClick, onProfileClose, role }) => {
  const headerStyle: React.CSSProperties = {
    ...styles.header,
    paddingTop: isPWA() ? 36 : 12 // 24px extra only for PWA
  };
  return (
    <div style={styles.layoutContainer}>
      <header style={headerStyle}>
        <div style={styles.headerLeft}>
          <h1 style={styles.logo}>📋 Booth Level</h1>
          {/* {title && <p style={styles.subtitle}>{title}</p>} */}
          {/* Show role for testing */}
          {user && typeof role === "string" && role && (
            <span style={{ marginLeft: 16, fontWeight: 600, color: '#2e7d32' }}>Role: {role}</span>
          )}
        </div>
        <div style={styles.headerRight}>
          {user && onProfileClose && (
            <button
              onClick={onProfileClose}
              style={styles.closeButton}
              title="Close Profile"
            >
              ← പിൻവാങ്ങുക
            </button>
          )}
          {user && !onProfileClose && (
            <button
              onClick={onProfileClick}
              style={styles.profileButtonHeader}
            >
              <span style={styles.userIcon}>👤</span>
            </button>
          )}
        </div>
      </header>
      <main style={styles.mainContent}>{children}</main>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  layoutContainer: {
    display: "flex",
    flexDirection: "column",
    minHeight: "100vh",
    width: "100%",
    backgroundColor: "#f5f5f5",
  },
  header: {
    backgroundColor: "white",
    borderBottom: "2px solid #2e7d32",
    padding: "36px 16px 12px 16px", // 24px top padding added
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
    position: "sticky",
    top: 0,
    zIndex: 100,
    gap: "12px",
    flexWrap: "wrap",
  },
  headerLeft: {
    display: "flex",
    alignItems: "flex-start",
    gap: "8px",
    flex: 1,
    minWidth: "0",
  },
  logo: {
    margin: 0,
    fontSize: "18px",
    fontWeight: "700",
    color: "#2e7d32",
    whiteSpace: "nowrap",
  },
  subtitle: {
    margin: 0,
    fontSize: "11px",
    color: "#666",
    fontWeight: "500",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  headerRight: {
    display: "flex",
    alignItems: "center",
  },
  profileButtonHeader: {
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
  closeButton: {
    padding: "8px 16px",
    backgroundColor: "#2e7d32",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "14px",
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
  mainContent: {
    flex: 1,
    padding: "16px",
    width: "100%",
    overflowY: "auto",
    overflowX: "hidden",
  },
};

export default Layout;
