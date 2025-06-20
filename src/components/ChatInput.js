import React, { useState } from "react";
import ImageUpload from "./ImageUpload";
import "./ChatInput.css";

export default function ChatInput({ message, setMessage, onSend, onInputChange, onImageSelect, sendOnEnter }) {
  const [showImageUpload, setShowImageUpload] = useState(false);

  const handleImageUpload = (imageFile) => {
    onImageSelect(imageFile);
  };

  const handleKeyDown = (e) => {
    if (sendOnEnter && e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSend(e);
    } else if (e.key === "Enter" && e.shiftKey) {
      // Insert newline
      setMessage((prev) => prev + "\n");
    }
  };

  return (
    <>
      <form onSubmit={onSend} className="chat-input-area" autoComplete="off">
        <button
          type="button"
          className="image-upload-btn"
          onClick={() => setShowImageUpload(true)}
          title="Send image"
          aria-label="Send image"
        >
          📷
        </button>
        <input
          className="chat-input"
          value={message}
          onChange={onInputChange}
          placeholder="Type a message..."
          onKeyDown={handleKeyDown}
        />
        <button className="chat-send-fab" type="submit" aria-label="Send message">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 20L21 12L3 4V10L17 12L3 14V20Z" fill="currentColor"/>
          </svg>
        </button>
      </form>

      {showImageUpload && (
        <ImageUpload
          onImageSelect={handleImageUpload}
          onClose={() => setShowImageUpload(false)}
        />
      )}
    </>
  );
}