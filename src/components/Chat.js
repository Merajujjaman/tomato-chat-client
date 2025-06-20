import React, { useEffect, useRef, useState } from "react";
import { sendMessage as apiSendMessage, fetchMessages, uploadImage, markMessagesAsRead } from "../services/api";
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
  const [isMobileView, setIsMobileView] = useState(window.innerWidth <= 700);

  useEffect(() => {
    setLoading(true);

    fetchMessages(myId, selectedUser._id)
      .then((msgs) => {
        setMessages(msgs);
        setLoading(false);
      })
      .catch(() => setLoading(false));
      
    const SOCKET_URL = "https://tomato-chat-server-y4uh.onrender.com";
    socketRef.current = io(SOCKET_URL, {
      query: { userId: myId },
    });
    // console.log('Socket connected as', myId, 'for chat with', selectedUser._id);

    socketRef.current.on("private message", (msg) => {
      if (
        (msg.sender === myId && msg.receiver === selectedUser._id) ||
        (msg.sender === selectedUser._id && msg.receiver === myId)
      ) {
        setMessages((prev) => [...prev, msg]);
      }
    });

    // Listen for messages-read event for real-time seen indicator
    socketRef.current.on("messages-read", ({ by }) => {
      // console.log('Received messages-read event:', by, selectedUser._id);
      // If the selected user is the one who read the messages
      if (by === selectedUser._id) {
        setMessages((prevMsgs) =>
          prevMsgs.map((m) =>
            m.sender === myId && m.receiver === selectedUser._id && !m.readAt
              ? { ...m, readAt: new Date().toISOString() }
              : m
          )
        );
      }
    });

    // Typing indicator listeners
    socketRef.current.on("typing", ({ from }) => {
      setTypingUsers((prev) => [...new Set([...prev, from])]);
    });
    socketRef.current.on("stop typing", ({ from }) => {
      setTypingUsers((prev) => prev.filter((id) => id !== from));
    });

    // Mark messages as read when chat is opened
    markMessagesAsRead(selectedUser._id).then(() => {
      fetchMessages(myId, selectedUser._id)
        .then((msgs) => {
          // console.log('Fetched messages after marking as read:', msgs);
          setMessages(msgs);
        });
    });
    if (socketRef.current) {
      // console.log('Emitting mark-messages-read for', selectedUser._id);
      socketRef.current.emit("mark-messages-read", { fromUserId: selectedUser._id });
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.off("private message");
        socketRef.current.off("typing");
        socketRef.current.off("stop typing");
        socketRef.current.off("messages-read");
        socketRef.current.disconnect();
      }
    };
  }, [selectedUser, myId]);

  useEffect(() => {
    const handleResize = () => setIsMobileView(window.innerWidth <= 700);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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
      <div className="chat-header" style={{ position: 'relative' }}>
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
        <span style={{ flex: 1 }}>{selectedUser.username}</span>
        {isMobileView && (
          <button
            className="dark-toggle-btn"
            onClick={() => document.body.classList.toggle("dark-mode")}
            style={{
              background: "#23272f",
              color: "#d2ffd6",
              border: "1.5px solid #25d366",
              borderRadius: 12,
              padding: "2px 4px",
              fontWeight: 600,
              cursor: "pointer",
              fontSize: "0.95em",
              minWidth: 24,
              minHeight: 24,
              width: 24,
              height: 24,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginLeft: 6,
            }}
            aria-label="Toggle dark mode"
          >
            <span role="img" aria-label="dark mode">🌙</span>
          </button>
        )}
      </div>
      {loading ? (
        <Spinner />
      ) : (
        <>
          <ChatWindow messages={messages} myId={myId} loading={loading} selectedUser={selectedUser} />
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
        sendOnEnter={true}
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
