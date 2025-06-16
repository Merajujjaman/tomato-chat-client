import React, { useEffect, useState } from "react";
import axios from "axios";
import "./UserList.css";

function UserList({ onSelect, selectedUserId, onLogout }) {
  const [users, setUsers] = useState([]);
  const myId = localStorage.getItem("userId");
  const myName = localStorage.getItem("username");

  useEffect(() => {
    axios
      .get("https://tomato-chat-server-y4uh.onrender.com/api/auth/users", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      })
      .then((res) => setUsers(res.data));
  }, []);

  return (
    <div className="user-list-container">
      <div
        className="user-list-header"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <span style={{ display: "flex", alignItems: "center" }}>
          <img
            className="user-list-avatar"
            src={`https://ui-avatars.com/api/?name=${myName}&background=25d366&color=fff&rounded=true&size=32`}
            alt={myName}
          />
          <span className="user-list-username">{myName}</span>
        </span>
        <button
          onClick={onLogout}
          style={{
            background: "#ff4d4f",
            color: "#fff",
            border: "none",
            borderRadius: "16px",
            padding: "6px 16px",
            fontWeight: "bold",
            cursor: "pointer",
            fontSize: "0.95em",
          }}
        >
          Logout
        </button>
      </div>
      <ul className="user-list-users">
        {users
          .filter((u) => u._id !== myId)
          .map((user) => (
            <li
              key={user._id}
              className={`user-list-user${
                user._id === selectedUserId ? " selected" : ""
              }`}
              onClick={() => onSelect(user)}
            >
              <img
                className="user-list-avatar"
                src={`https://ui-avatars.com/api/?name=${user.username}&background=25d366&color=fff&rounded=true&size=32`}
                alt={user.username}
              />
              <span className="user-list-username">{user.username}</span>
            </li>
          ))}
      </ul>
    </div>
  );
}

export default UserList;