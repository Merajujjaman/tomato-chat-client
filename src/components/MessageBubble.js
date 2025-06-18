import React, { useState } from "react";
import "./MessageBubble.css";

export default function MessageBubble({ msg, myId }) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [showFullImage, setShowFullImage] = useState(false);

  const handleImageClick = () => {
    setShowFullImage(true);
  };

  const closeFullImage = () => {
    setShowFullImage(false);
  };

  return (
    <>
      <div
        className={`chat-bubble ${msg.sender === myId ? "self" : "other"}`}
        title={new Date(msg.createdAt).toLocaleString()}
      >
        {msg.type === 'image' ? (
          <div className="image-message">
            <img
              src={msg.imageUrl}
              alt="Shared image"
              className="message-image"
              onClick={handleImageClick}
              onLoad={() => setImageLoaded(true)}
              style={{ display: imageLoaded ? 'block' : 'none' }}
            />
            {!imageLoaded && (
              <div className="image-loading">
                <div className="loading-spinner"></div>
                <span>Loading image...</span>
              </div>
            )}
            {msg.content && (
              <div className="image-caption">{msg.content}</div>
            )}
          </div>
        ) : (
          <div className="text-message">{msg.content || msg.text}</div>
        )}
        
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

      {/* Full Image Modal */}
      {showFullImage && (
        <div className="full-image-overlay" onClick={closeFullImage}>
          <div className="full-image-container">
            <img
              src={msg.imageUrl}
              alt="Full size image"
              className="full-image"
              onClick={(e) => e.stopPropagation()}
            />
            <button className="close-full-image" onClick={closeFullImage}>
              ×
            </button>
          </div>
        </div>
      )}
    </>
  );
}