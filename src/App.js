import { useState } from "react";
import Chat from "./components/Chat";
import Login from "./components/Login";
import Register from "./components/Register";
import UserList from "./components/UserList";

// Replace with your actual VAPID public key (from .env, base64 string)
const VAPID_PUBLIC_KEY = "BAXfolXTd28T2dqg6qY0bw7KANZQGs4THhP6hYR96SAHCIQDzv_SLymWJmH45dtHi_hd4jZKKq781EGRtwU0lQI";

export async function subscribeUserToPush() {
  if ('serviceWorker' in navigator && 'PushManager' in window) {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
    });
    // Send this subscription object to your backend and associate it with the logged-in user
    await fetch('https://tomato-chat-server-y4uh.onrender.com/api/subscribe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem("token")}`
      },
      body: JSON.stringify({ subscription })
    });
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
  const [selectedUser, setSelectedUser] = useState(null);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    localStorage.removeItem("userId");
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
    <div style={{ minHeight: "100vh", background: "#f0f2f5" }}>
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "90vh" }}>
        {!selectedUser ? (
          <UserList
            onSelect={setSelectedUser}
            selectedUserId={selectedUser?._id}
            onLogout={handleLogout}
          />
        ) : (
          <Chat
            selectedUser={selectedUser}
            onBack={() => setSelectedUser(null)}
            isMobile={false} // always show back arrow
          />
        )}
      </div>
    </div>
  );
}

export default App;