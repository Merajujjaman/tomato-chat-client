import { useState } from "react";
import Chat from "./components/Chat";
import Login from "./components/Login";
import Register from "./components/Register";
import UserList from "./components/UserList";

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