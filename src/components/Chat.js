import React, { useEffect, useRef, useState } from "react";
import { sendMessage as apiSendMessage, fetchMessages, uploadImage } from "../services/api";
import io from "socket.io-client";
import Spinner from "./Spinner";
import ChatWindow from "./ChatWindow";
import ChatInput from "./ChatInput";
import "./Chat.css";

function Chat({ selectedUser, onBack, isMobile }) {
  const myId = localStorage.getItem("userId");
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [typingUsers, setTypingUsers] = useState([]);
  const socketRef = useRef();
  const typingTimeoutRef = useRef();

  useEffect(() => {
    setLoading(true);

    fetchMessages(myId, selectedUser._id)
      .then((msgs) => {
        setMessages(msgs);
        setLoading(false);
      })
      .catch(() => setLoading(false));

    socketRef.current = io("https://tomato-chat-server-y4uh.onrender.com", {
      query: { userId: myId },
    });

    socketRef.current.on("private message", (msg) => {
      if (
        (msg.sender === myId && msg.receiver === selectedUser._id) ||
        (msg.sender === selectedUser._id && msg.receiver === myId)
      ) {
        setMessages((prev) => [...prev, msg]);
      }
    });

    // Typing indicator listeners
    socketRef.current.on("typing", ({ from }) => {
      setTypingUsers((prev) => [...new Set([...prev, from])]);
    });
    socketRef.current.on("stop typing", ({ from }) => {
      setTypingUsers((prev) => prev.filter((id) => id !== from));
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.off("private message");
        socketRef.current.off("typing");
        socketRef.current.off("stop typing");
        socketRef.current.disconnect();
      }
    };
  }, [selectedUser, myId]);

  const handleInputChange = (e) => {
    setMessage(e.target.value);
    if (socketRef.current) {
      socketRef.current.emit("typing", { to: selectedUser._id });
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        socketRef.current.emit("stop typing", { to: selectedUser._id });
      }, 2000); // 2 seconds
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (message.trim()) {
      const savedMessage = await apiSendMessage({
        content: message,
        sender: myId,
        receiver: selectedUser._id,
      });

      if (socketRef.current) {
        socketRef.current.emit("private message", savedMessage);
        socketRef.current.emit("stop typing", { to: selectedUser._id });
      }

      setMessage("");
    }
  };

  const handleImageSelect = async (imageFile) => {
    setUploading(true);
    try {
      const savedMessage = await uploadImage(imageFile, selectedUser._id, message);
      if (socketRef.current) {
        socketRef.current.emit("private message", savedMessage);
        socketRef.current.emit("stop typing", { to: selectedUser._id });
      }
      setMessage("");
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="chat-container">
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
      {loading ? (
        <Spinner />
      ) : (
        <>
          <ChatWindow messages={messages} myId={myId} loading={loading} />
          {typingUsers.includes(selectedUser._id) && (
            <div className="typing-indicator-premium">
              <span style={{ fontWeight: 500 }}>{selectedUser.username}</span>
              <span>is typing</span>
              <span className="typing-dots">
                <span className="typing-dot"></span>
                <span className="typing-dot"></span>
                <span className="typing-dot"></span>
              </span>
            </div>
          )}
        </>
      )}
      <ChatInput
        message={message}
        setMessage={setMessage}
        onSend={sendMessage}
        onInputChange={handleInputChange}
        onImageSelect={handleImageSelect}
      />
      {uploading && (
        <div className="upload-indicator">
          <div className="upload-spinner"></div>
          <span>Uploading image...</span>
        </div>
      )}
    </div>
  );
}

export default Chat;
