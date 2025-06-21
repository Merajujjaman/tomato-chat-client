import { useEffect, useState } from "react";
import Chat from "./components/Chat";
import Login from "./components/Login";
import Register from "./components/Register";
import UserList from "./components/UserList";
import { API_URL } from "./config";

// Replace with your actual VAPID public key (from .env, base64 string)
const VAPID_PUBLIC_KEY = "BAXfolXTd28T2dqg6qY0bw7KANZQGs4THhP6hYR96SAHCIQDzv_SLymWJmH45dtHi_hd4jZKKq781EGRtwU0lQI";

export async function subscribeUserToPush() {
  if ('serviceWorker' in navigator && 'PushManager' in window) {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
      });
      await fetch(`${API_URL}/subscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({ subscription })
      });
    } catch (err) {
      console.warn("Push subscription failed:", err);
    }
  }
}

// Helper to convert VAPID key
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

function App() {
  const [isLogin, setIsLogin] = useState(!!localStorage.getItem("token"));
  const [showRegister, setShowRegister] = useState(false);
  const [selectedUser, setSelectedUser] = useState(() => {
    const saved = localStorage.getItem("selectedUser");
    return saved ? JSON.parse(saved) : null;
  });
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem("darkMode") === "true");
  const [isMobileView, setIsMobileView] = useState(window.innerWidth <= 700);

  // Persist selectedUser in localStorage
  useEffect(() => {
    if (selectedUser) {
      localStorage.setItem("selectedUser", JSON.stringify(selectedUser));
      // Push state to history for back button handling
      window.history.pushState({ chat: true }, "", "#chat");
    } else {
      localStorage.removeItem("selectedUser");
      // Only push state if not already at root
      if (window.location.hash === "#chat") {
        window.history.pushState({}, "", "#");
      }
    }
  }, [selectedUser]);

  // Handle browser back button
  useEffect(() => {
    const onPopState = (e) => {
      if (selectedUser) {
        setSelectedUser(null);
      }
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, [selectedUser]);

  // Call subscribeUserToPush after login
  useEffect(() => {
    if (isLogin) {
      subscribeUserToPush();
    }
  }, [isLogin]);

  useEffect(() => {
    document.body.classList.toggle("dark-mode", darkMode);
    localStorage.setItem("darkMode", darkMode);
  }, [darkMode]);

  useEffect(() => {
    const handleResize = () => setIsMobileView(window.innerWidth <= 700);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    localStorage.removeItem("userId");
    localStorage.removeItem("selectedUser");
    setIsLogin(false);
    setSelectedUser(null);
  };

  if (!isLogin) {
    return showRegister ? (
      <Register
        onRegister={() => setShowRegister(false)}
        onShowLogin={() => setShowRegister(false)}
      />
    ) : (
      <Login
        onLogin={() => setIsLogin(true)}
        onShowRegister={() => setShowRegister(true)}
      />
    );
  }

  // Always show only one panel: user list or chat
  return (
    <div style={{ minHeight: "100vh", background: "var(--chat-bg)", width: "100vw" }}>
      {/* Only show global toggle on desktop */}
      {!isMobileView && (
        <div
          className="dark-toggle-container"
          style={{
            position: "fixed",
            top: 10,
            right: 20,
            left: 'auto',
            zIndex: 9999,
            display: "flex",
            flexDirection: "row",
            gap: 8,
          }}
        >
          <button
            className="dark-toggle-btn"
            onClick={() => setDarkMode((d) => !d)}
            style={{
              background: darkMode ? "#222c2a" : "#fff",
              color: darkMode ? "#d2ffd6" : "#25d366",
              border: "1.5px solid #25d366",
              borderRadius: 20,
              padding: "6px 18px",
              fontWeight: 600,
              cursor: "pointer",
              fontSize: "1em",
              boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
              transition: "background 0.3s, color 0.3s"
            }}
            aria-label="Toggle dark mode"
          >
            {darkMode ? "☀️" : "🌙"}
            <span className="dark-toggle-label">{darkMode ? " Light" : " Dark"}</span>
          </button>
        </div>
      )}
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "90vh", width: "100vw" }}>
        {!selectedUser ? (
          <UserList
            onSelect={setSelectedUser}
            selectedUserId={selectedUser?._id}
            onLogout={handleLogout}
            darkMode={darkMode}
            setDarkMode={setDarkMode}
            isMobileView={isMobileView}
          />
        ) : (
          <Chat
            selectedUser={selectedUser}
            onBack={() => setSelectedUser(null)}
            isMobile={isMobileView}
          />
        )}
      </div>
    </div>
  );
}

export default App;