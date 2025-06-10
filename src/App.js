import { useState } from "react";
import Chat from "./components/Chat";
import Login from "./components/Login";
import Register from "./components/Register";

function App() {
  const [isLogin, setIsLogin] = useState(!!localStorage.getItem("token"));
  const [showRegister, setShowRegister] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    setIsLogin(false);
  };

  if (!isLogin) {
    return showRegister ? (
      <div>
        <Register onRegister={() => setShowRegister(false)} />
        <button onClick={() => setShowRegister(false)}>Already have an account? Login</button>
      </div>
    ) : (
      <div>
        <Login onLogin={() => setIsLogin(true)} />
        <button onClick={() => setShowRegister(true)}>No account? Register</button>
      </div>
    );
  }

  return (
    <div>
      <button onClick={handleLogout}>Logout</button>
      <Chat />
    </div>
  );
}

export default App;