import React from "react";

export default function ChatInput({ message, setMessage, onSend, onInputChange }) {
  return (
    <form onSubmit={onSend} className="chat-input-area" autoComplete="off">
      <input
        className="chat-input"
        value={message}
        onChange={onInputChange}
        placeholder="Type a message..."
      />
      <button className="chat-send" type="submit">
        Send
      </button>
    </form>
  );
}