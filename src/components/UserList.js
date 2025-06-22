import React, { useEffect, useState } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import "./UserList.css";
import { getUnreadCounts, getLastMessagesPerUser } from "../services/api";
import { API_URL, SOCKET_URL } from "../config";
import ProfileSettings from "./ProfileSettings";

function UserList({
  onSelect,
  selectedUserId,
  onLogout,
  darkMode,
  setDarkMode,
  isMobileView,
}) {
  const [users, setUsers] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [unreadCounts, setUnreadCounts] = useState({});
  const [lastMessages, setLastMessages] = useState({});
  const [showProfileSettings, setShowProfileSettings] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const myId = localStorage.getItem("userId")?.toString();
  const myName = localStorage.getItem("username");
  const myDisplayName = localStorage.getItem("displayName") || myName;
  const myProfilePicture = localStorage.getItem("profilePicture");

  useEffect(() => {
    // Fetch all users
    axios
      .get(`${API_URL}/auth/users`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      })
      .then((res) => setUsers(res.data))
      .catch((err) => console.error("Failed to fetch users:", err));

    // Fetch current user profile
    axios
      .get(`${API_URL}/auth/profile`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      })
      .then((res) => {
        setCurrentUser(res.data);
        localStorage.setItem("displayName", res.data.displayName);
        localStorage.setItem("profilePicture", res.data.profilePicture);
      })
      .catch((err) => console.error("Failed to fetch profile:", err));

    // Fetch unread counts
    getUnreadCounts().then((counts) => {
      const map = {};
      counts.forEach((c) => {
        map[c._id] = c.count;
      });
      setUnreadCounts(map);
    });

    // Fetch last messages
    getLastMessagesPerUser().then((lasts) => {
      const map = {};
      lasts.forEach((item) => {
        map[item._id] = item.lastMessage;
      });
      setLastMessages(map);
    });
  }, []);

  useEffect(() => {
    // Connect to socket server
    const socket = io(SOCKET_URL, {
      query: { userId: myId },
    });

    socket.on("connect", () => {
      // console.log("Socket connected:", socket.id);
    });

    // Listen for online user list
    socket.on("online-users", (userIds) => {
      // console.log("Received online users:", userIds);
      setOnlineUsers(userIds.map((id) => id.toString())); // ensure string format
    });

    // Listen for new-message and messages-read events for real-time badge updates
    const refreshCountsAndLasts = () => {
      getUnreadCounts().then((counts) => {
        const map = {};
        counts.forEach((c) => {
          map[c._id] = c.count;
        });
        setUnreadCounts(map);
      });
      getLastMessagesPerUser().then((lasts) => {
        const map = {};
        lasts.forEach((item) => {
          map[item._id] = item.lastMessage;
        });
        setLastMessages(map);
      });
    };
    socket.on("new-message", refreshCountsAndLasts);
    socket.on("messages-read", refreshCountsAndLasts);

    // Clean up
    return () => socket.disconnect();
  }, [myId]);

  const handleProfileUpdate = (profileData) => {
    setCurrentUser((prev) => ({
      ...prev,
      displayName: profileData.displayName,
      profilePicture: profileData.profilePicture,
    }));
    localStorage.setItem("displayName", profileData.displayName);
    if (profileData.profilePicture) {
      localStorage.setItem("profilePicture", profileData.profilePicture);
    }

    // Refresh the users list to show updated profile data
    axios
      .get(`${API_URL}/auth/users`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      })
      .then((res) => setUsers(res.data))
      .catch((err) => console.error("Failed to fetch users:", err));
  };

  const getProfileImageUrl = (user) => {
    if (user.profilePicture) {
      return user.profilePicture;
    }
    const displayName = user.displayName || user.username;
    return `https://ui-avatars.com/api/?name=${displayName}&background=25d366&color=fff&rounded=true&size=32`;
  };

  // Sort users by last message time (desc)
  const sortedUsers = users
    .filter((u) => u._id !== myId)
    .sort((a, b) => {
      const aMsg = lastMessages[a._id];
      const bMsg = lastMessages[b._id];
      if (!aMsg && !bMsg) return 0;
      if (!aMsg) return 1;
      if (!bMsg) return -1;
      return new Date(bMsg.createdAt) - new Date(aMsg.createdAt);
    });

  return (
    <div className="user-list-container">
      <div className="user-list-header" style={{ position: "relative" }}>
        <span style={{ display: "flex", alignItems: "center" }}>
          <img
            className="user-list-avatar"
            src={getProfileImageUrl(
              currentUser || {
                username: myName,
                displayName: myDisplayName,
                profilePicture: myProfilePicture,
              }
            )}
            alt={currentUser?.displayName || myDisplayName}
          />
          <span className="user-list-username">
            {currentUser?.displayName || myDisplayName}
          </span>
        </span>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: isMobileView ? 4 : 12,
          }}
        >
          <button
            onClick={() => setShowProfileSettings(true)}
            style={{
              background: "transparent",
              color: "#fff",
              border: "none",
              borderRadius: 16,
              fontWeight: "bold",
              cursor: "pointer",
              fontSize: isMobileView ? "1.5em" : "2em",
              transition: "background 0.2s",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            {isMobileView ? "⚙️" : "⚙️"}
          </button>
          {isMobileView && (
            <button
              // className="dark-toggle-btn"
              onClick={() => setDarkMode((d) => !d)}
              style={{
                background: "transparent",
                color: darkMode ? "#d2ffd6" : "#25d366",
                cursor: "pointer",
                fontSize: isMobileView ? "1.5em" : "2em",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
              aria-label="Toggle dark mode"
            >
              {darkMode ? "☀️" : "🌙"}
            </button>
          )}

          <button
            onClick={onLogout}
            style={{
              // background: "#ff4d4f",
              background: "transparent",
              color: "#fff",
              border: "1px solid #fff",
              borderRadius: 16,
              // padding: isMobileView ? "6px 10px" : "6px 16px",
              fontWeight: "bold",
              cursor: "pointer",
              fontSize: isMobileView ? "0.95em" : "0.95em",
              boxShadow: "0 2px 8px rgba(255,77,79,0.08)",
              transition: "background 0.2s",
              marginLeft: isMobileView ? 0 : 12,
            }}
          >
            Logout
          </button>
        </div>
      </div>

      <ul className="user-list-users">
        {sortedUsers.map((user) => {
          const isOnline = onlineUsers.includes(user._id?.toString());
          const unread = unreadCounts[user._id] || 0;
          const displayName = user.displayName || user.username;
          return (
            <li
              key={user._id}
              className={`user-list-user${
                user._id === selectedUserId ? " selected" : ""
              }`}
              onClick={() => onSelect(user)}
            >
              <img
                className="user-list-avatar"
                src={getProfileImageUrl(user)}
                alt={displayName}
              />
              <span className="user-list-username">
                {displayName}
                {isOnline ? (
                  <span style={{ color: "green", marginLeft: "8px" }}>🟢</span>
                ) : (
                  <span style={{ color: "gray", marginLeft: "8px" }}>⚪</span>
                )}
                {unread > 0 && (
                  <span
                    style={{
                      background: "#ff4d4f",
                      color: "#fff",
                      borderRadius: "12px",
                      padding: "2px 8px",
                      fontSize: "0.8em",
                      marginLeft: 8,
                      fontWeight: 600,
                    }}
                  >
                    {unread}
                  </span>
                )}
              </span>
            </li>
          );
        })}
      </ul>

      {showProfileSettings && (
        <ProfileSettings
          onClose={() => setShowProfileSettings(false)}
          onProfileUpdate={handleProfileUpdate}
        />
      )}
    </div>
  );
}

export default UserList;

// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import "./UserList.css";

// function UserList({ onSelect, selectedUserId, onLogout }) {
//   const [users, setUsers] = useState([]);
//   const myId = localStorage.getItem("userId");
//   const myName = localStorage.getItem("username");

//   useEffect(() => {
//     axios
//       .get("https://tomato-chat-server-y4uh.onrender.com/api/auth/users", {
//         headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
//       })
//       .then((res) => setUsers(res.data));
//   }, []);

//   return (
//     <div className="user-list-container">
//       <div
//         className="user-list-header"
//         style={{
//           display: "flex",
//           alignItems: "center",
//           justifyContent: "space-between",
//         }}
//       >
//         <span style={{ display: "flex", alignItems: "center" }}>
//           <img
//             className="user-list-avatar"
//             src={`https://ui-avatars.com/api/?name=${myName}&background=25d366&color=fff&rounded=true&size=32`}
//             alt={myName}
//           />
//           <span className="user-list-username">{myName}</span>
//         </span>
//         <button
//           onClick={onLogout}
//           style={{
//             background: "#ff4d4f",
//             color: "#fff",
//             border: "none",
//             borderRadius: "16px",
//             padding: "6px 16px",
//             fontWeight: "bold",
//             cursor: "pointer",
//             fontSize: "0.95em",
//           }}
//         >
//           Logout
//         </button>
//       </div>
//       <ul className="user-list-users">
//         {users
//           .filter((u) => u._id !== myId)
//           .map((user) => (
//             <li
//               key={user._id}
//               className={`user-list-user${
//                 user._id === selectedUserId ? " selected" : ""
//               }`}
//               onClick={() => onSelect(user)}
//             >
//               <img
//                 className="user-list-avatar"
//                 src={`https://ui-avatars.com/api/?name=${user.username}&background=25d366&color=fff&rounded=true&size=32`}
//                 alt={user.username}
//               />
//               <span className="user-list-username">{user.username}</span>
//             </li>
//           ))}
//       </ul>
//     </div>
//   );
// }

// export default UserList;
