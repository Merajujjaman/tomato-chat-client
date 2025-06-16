import React, { useEffect, useRef, useState } from "react";
import { sendMessage as apiSendMessage, fetchMessages } from "../services/api";
import io from "socket.io-client";
import Spinner from "./Spinner";
import ChatWindow from "./ChatWindow";
import ChatInput from "./ChatInput";
import "./Chat.css";

function Chat({ selectedUser, onBack, isMobile }) {
  const myId = localStorage.getItem("userId");
  const myName = localStorage.getItem("username");
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const socketRef = useRef();

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

    return () => {
      if (socketRef.current) {
        socketRef.current.off("private message");
        socketRef.current.disconnect();
      }
    };
  }, [selectedUser, myId]);

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
      }

      setMessage("");
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
        <ChatWindow messages={messages} myId={myId} loading={loading} />
      )}
      <ChatInput message={message} setMessage={setMessage} onSend={sendMessage} />
    </div>
  );
}

export default Chat;
