import React from "react";

export default function MessageBubble({ msg, myId }) {
  return (
    <div
      className={`chat-bubble ${msg.sender === myId ? "self" : "other"}`}
      title={new Date(msg.createdAt).toLocaleString()}
    >
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
  );
}