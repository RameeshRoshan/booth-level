import React, { useEffect, useState, useCallback } from "react";
import { User, onAuthStateChanged } from "firebase/auth";
import { auth, db } from "./firebase";
import Signup from "./screens/Signup";
import Login from "./screens/Login";
import Profile from "./screens/Profile";
import HouseholdForm from "./screens/HouseholdForm";
import Layout from "./components/Layout";
import { doc, getDoc } from "firebase/firestore";
import useAutoLogout from "./useAutoLogout";

// Loading Screens
const LOADING_SCREEN = (
  <div style={{ padding: "20px", textAlign: "center" }}>
    Loading...
  </div>
);

interface AppState {
  user: User | null;
  loading: boolean;
  boothNumber: string;
  showProfile: boolean;
}

const App: React.FC = () => {
  useAutoLogout();

  const [state, setState] = useState<AppState>({
    user: null,
    loading: true,
    boothNumber: "",
    showProfile: false,
  });
  const [refreshKey, setRefreshKey] = useState(0);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userRole, setUserRole] = useState<string>("");

  // Fetch booth number and role from Firestore
  const fetchUserBoothAndRole = useCallback(async (userId: string): Promise<{ booth: string; admin: boolean; role: string }> => {
    try {
      const userRef = doc(db, "users", userId);
      const snapshot = await getDoc(userRef);
      if (snapshot.exists()) {
        const data = snapshot.data();
        return {
          booth: data.booth_number || "",
          admin: data.role === "admin",
          role: data.role || ""
        };
      }
      return { booth: "", admin: false, role: "" };
    } catch (err) {
      console.error("Error fetching booth/role:", err);
      return { booth: "", admin: false, role: "" };
    }
  }, []);

  // Restore auth + booth on reload
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        const { booth, admin, role } = await fetchUserBoothAndRole(currentUser.uid);
        setState({
          user: currentUser,
          boothNumber: booth,
          loading: false,
          showProfile: false,
        });
        setIsAdmin(admin);
        setUserRole(role);
      } else {
        setState({
          user: null,
          boothNumber: "",
          loading: false,
          showProfile: false,
        });
        setIsAdmin(false);
        setUserRole("");
      }
    });
    return () => unsubscribe();
  }, [fetchUserBoothAndRole]);

  // Safe booth updater (do NOT pass setState directly)
  const handleBoothSaved = useCallback((booth: string) => {
    setState((prev) => ({
      ...prev,
      boothNumber: booth,
      showProfile: false,
    }));
    setRefreshKey((prev) => prev + 1);
  }, []);

  const handleProfileOpen = useCallback(() => {
    setState((prev) => ({ ...prev, showProfile: true }));
  }, []);

  const handleProfileClose = useCallback(() => {
    setState((prev) => ({ ...prev, showProfile: false }));
  }, []);

  // -------------------------
  // Render Logic
  // -------------------------

  if (state.loading) return LOADING_SCREEN;

  if (!state.user) return <Login />;

  if (state.showProfile) {
    return (
      <Layout
        user={state.user}
        title="Profile Settings"
        onProfileClose={handleProfileClose}
        role={userRole}
      >
        <Profile
          user={state.user}
          onBoothChange={handleBoothSaved}
        />
      </Layout>
    );
  }

  if (isAdmin) {
    // Render admin dashboard
    const AdminDashboard = require("./screens/AdminDashboard").default;
    return (
      <Layout
        user={state.user}
        title="Admin Dashboard"
        role={userRole}
        onProfileClick={handleProfileOpen}
      >
        <AdminDashboard />
      </Layout>
    );
  }

  if (state.boothNumber) {
    return (
      <Layout
        user={state.user}
        title="Household Data Collection"
        onProfileClick={handleProfileOpen}
        role={userRole}
      >
        <HouseholdForm
          key={`${state.boothNumber}-${refreshKey}`}
          user={state.user}
          boothNumber={state.boothNumber}
        />
      </Layout>
    );
  }

  // If logged in but no booth yet → show Signup
  return (
    <Layout user={state.user} title="Create Your Profile" role={userRole}>
      <Signup
        user={state.user}
        boothUpdate={handleBoothSaved}
      />
    </Layout>
  );
};

export default App;
