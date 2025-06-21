import React, { useState } from "react";
import axios from "axios";
import "./AuthForm.css";
import { API_URL } from "../config";

function Register({ onRegister, onShowLogin }) {
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError("");
    setSuccess("");
    try {
      await axios.post(`${API_URL}/auth/register`, form);
      setSuccess("Registration successful! You can now log in.");
      setTimeout(() => {
        onRegister();
      }, 1200);
    } catch (err) {
      setError(err.response?.data?.error || "Registration failed");
    }
  };

  return (
    <div className="auth-form-container">
      <div className="auth-form-title">Register</div>
      <form className="auth-form" onSubmit={handleSubmit}>
        <input
          name="username"
          type="text"
          placeholder="Username"
          value={form.username}
          onChange={handleChange}
          required
        />
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
        {success && <div style={{ color: "#25d366", textAlign: "center" }}>{success}</div>}
        <button type="submit">Register</button>
      </form>
      <button className="auth-link" type="button" onClick={onShowLogin}>
        Already have an account? Login
      </button>
    </div>
  );
}

export default Register;