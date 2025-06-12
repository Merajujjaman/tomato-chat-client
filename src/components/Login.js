import React, { useState } from "react";
import axios from "axios";
import "./AuthForm.css";

function Login({ onLogin, onShowRegister }) {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  
  console.log(form);
  const handleSubmit = async e => {
    e.preventDefault();
    setError("");
    try {
      const res = await axios.post("https://tomato-chat-server-y4uh.onrender.com/api/auth/login", form);
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("username", res.data.username);
      localStorage.setItem("userId", res.data.userId);
      console.log(res);
      onLogin();
    } catch (err) {
      console.log(err);
      setError(err.response?.data?.error || "Login failed");
    }
  };

  return (
    <div className="auth-form-container">
      <div className="auth-form-title">Login</div>
      <form className="auth-form" onSubmit={handleSubmit}>
        <input
          name="email"
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          required
        />
        <input
          name="password"
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          required
        />
        {error && <div className="auth-error">{error}</div>}
        <button type="submit">Login</button>
      </form>
      <button className="auth-link" type="button" onClick={onShowRegister}>
        No account? Register
      </button>
    </div>
  );
}

export default Login;