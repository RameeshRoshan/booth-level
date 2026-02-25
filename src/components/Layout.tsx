import React from "react";
import { User } from "firebase/auth";
import appIcon from "../assets/app_icon.png";
import AccountCircleIcon from '@mui/icons-material/AccountCircle';

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
    paddingTop: isPWA() ? 36 : 12 // 24px extra only for PWA
  };
  return (
    <div style={styles.layoutContainer}>
      <header style={headerStyle}
        className="bg-white px-4 flex justify-between items-center shadow-[2px_0px_12px_rgba(28,122,191,0.45)] sticky top-0 z-[100] gap-3 flex-wrap">
        <div style={styles.headerLeft}>
          <img src={appIcon} className="w-16" alt="App Icon" />
        </div>
        <div style={styles.headerRight} >    
          {user && onProfileClose && (
            <button
              onClick={onProfileClose}
              className="text-white bg-[#1C7ABF] rounded-lg shadow-[2px_2px_12px_rgba(28,122,191,0.45)]"
              title="Close Profile"
            >
              ← തിരിച്ചു പോവുക
            </button>
          )}
          {user && !onProfileClose && (
            <button
              onClick={onProfileClick}
            >
              <AccountCircleIcon className="text-[#1f4386]" fontSize="large"/>
            </button>
          )}
        </div>
      </header>
      <main className="flex-1 p-4 w-full overflow-y-auto overflow-x-hidden">{children}</main>
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
