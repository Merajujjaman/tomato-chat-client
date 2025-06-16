import React, { useRef, useEffect } from "react";
import MessageBubble from "./MessageBubble";

export default function ChatWindow({ messages, myId, loading }) {
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!loading && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, loading]);

  return (
    <div className="chat-messages">
      {messages.map((msg, idx) => (
        <MessageBubble key={msg._id || idx} msg={msg} myId={myId} />
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
}