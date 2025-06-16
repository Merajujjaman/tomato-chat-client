import React, { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import Spinner from "./Spinner";
import "./Chat.css";
import { fetchMessages, sendMessage as apiSendMessage } from "../services/api";

function Chat({ selectedUser, onBack, isMobile }) {
  const myId = localStorage.getItem("userId");
  const myName = localStorage.getItem("username");
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);
  const socketRef = useRef();

  useEffect(() => {
    setLoading(true);

    // Fetch messages from REST API
    fetchMessages(myId, selectedUser._id)
      .then((msgs) => {
        setMessages(msgs);
        setLoading(false);
      })
      .catch(() => setLoading(false));

    socketRef.current = io("https://tomato-chat-server-y4uh.onrender.com", {
      query: { userId: myId },
    });

    socketRef.current.emit("get history", {
      userId: myId,
      otherUserId: selectedUser._id,
    });

    socketRef.current.on("chat history", (msgs) => {
      setMessages(msgs);
      setLoading(false);
    });

    socketRef.current.on("private message", (msg) => {
      if (
        (msg.sender === myId && msg.receiver === selectedUser._id) ||
        (msg.sender === selectedUser._id && msg.receiver === myId)
      ) {
        setMessages((prev) => [...prev, msg]);
      }
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.off("chat history");
        socketRef.current.off("private message");
        socketRef.current.disconnect();
      }
    };
  }, [selectedUser, myId]);

  useEffect(() => {
    if (!loading && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, loading]);

  const sendMessage = async (e) => {
    e.preventDefault();
    console.log("Send handler called");
    if (message.trim()) {
      try {
        await apiSendMessage({
          content: message,
          sender: myId,
          receiver: selectedUser._id,
        });

        socketRef.current.emit("private message", {
          content: message,
          sender: myId,
          receiver: selectedUser._id,
        });

        setMessage("");
      } catch (err) {
        console.error("Failed to send message:", err);
      }
    }
  };

  // console.log("Messages to render:", messages);

  return (
    <div className="chat-container">
      {/* Header with back arrow on mobile */}
      <div className="chat-header">
        <button
          onClick={onBack}
          style={{
            background: "none",
            border: "none",
            color: "#fff",
            fontSize: 22,
            marginRight: 10,
            cursor: "pointer",
          }}
          aria-label="Back"
        >
          &#8592;
        </button>
        <img
          src={`https://ui-avatars.com/api/?name=${selectedUser.username}&background=25d366&color=fff&rounded=true&size=32`}
          alt={selectedUser.username}
          style={{
            borderRadius: "50%",
            verticalAlign: "middle",
            marginRight: 8,
          }}
        />
        {selectedUser.username}
      </div>
      {/* Messages */}
      {loading ? (
        <Spinner />
      ) : (
        <div className="chat-messages">
          {messages.map((msg, idx) => (
            <div
              key={msg._id || idx}
              className={`chat-bubble ${
                msg.sender === myId ? "self" : "other"
              }`}
              title={new Date(msg.createdAt).toLocaleString()}
            >
              {/* Show content if available, otherwise fallback to text */}
              {msg.content || msg.text}
              <div
                style={{
                  fontSize: "0.7em",
                  color: "#888",
                  marginTop: 2,
                  textAlign: "right",
                }}
              >
                {msg.createdAt &&
                  new Date(msg.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      )}
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
