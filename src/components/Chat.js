import React, { useState, useEffect, useRef } from "react";
import io from "socket.io-client";
import "./Chat.css";

const socket = io("https://tomato-chat-server.onrender.com");

// Helper to get/set userId (or username) in localStorage
function getUserId() {
  let userId = localStorage.getItem("userId");
  if (!userId) {
    userId = prompt("Enter your username or user ID:");
    if (!userId) userId = Math.random().toString(36).substr(2, 9);
    localStorage.setItem("userId", userId);
  }
  return userId;
}
const myId = getUserId();

function Chat() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    socket.on("chat history", (msgs) => {
      setMessages(msgs);
    });

    socket.on("chat message", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => {
      socket.off("chat message");
      socket.off("chat history");
    };
  }, []);

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (message.trim()) {
      socket.emit("chat message", { text: message, sender: myId });
      setMessage("");
    }
  };

  return (
    <div className="chat-container">
      {/* Header */}
      <div className="chat-header">Tomato Chat</div>
      {/* Messages */}
      <div className="chat-messages">
        {messages.map((msg, idx) => {
          const text = typeof msg === "string" ? msg : msg.text;
          const sender = typeof msg === "string" ? "" : msg.sender;
          return (
            <div
              key={msg._id || idx}
              className={`chat-bubble ${sender === myId ? "self" : "other"}`}
            >
              {text}
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>
      {/* Input */}
      <form
        onSubmit={sendMessage}
        className="chat-input-area"
        autoComplete="off"
      >
        <input
          className="chat-input"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message..."
        />
        <button className="chat-send" type="submit">
          Send
        </button>
      </form>
    </div>
  );
}

export default Chat;