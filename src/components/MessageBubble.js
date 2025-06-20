import React, { useState } from "react";
import "./MessageBubble.css";

export default function MessageBubble({ msg, myId, selectedUser }) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [showFullImage, setShowFullImage] = useState(false);

  const isSelf = msg.sender === myId;
  const avatarUrl = `https://ui-avatars.com/api/?name=${isSelf ? localStorage.getItem("username") : msg.username || msg.senderName || "U"}&background=25d366&color=fff&rounded=true&size=32`;

  const handleImageClick = () => {
    setShowFullImage(true);
  };

  const closeFullImage = () => {
    setShowFullImage(false);
  };

  return (
    <>
      <div
        className={`chat-bubble-row ${isSelf ? "self" : "other"}`}
        style={{ display: "flex", alignItems: "flex-end", marginBottom: 2, flexDirection: isSelf ? "row-reverse" : "row" }}
      >
        <img
          src={avatarUrl}
          alt={isSelf ? localStorage.getItem("username") : msg.username || "User"}
          className="chat-bubble-avatar"
          style={{ width: 32, height: 32, borderRadius: "50%", margin: isSelf ? "0 0 0 8px" : "0 8px 0 0" }}
        />
        <div
          className={`chat-bubble ${isSelf ? "self" : "other"}`}
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
              display: 'flex',
              alignItems: 'center',
              gap: 4
            }}
          >
            {msg.createdAt &&
              new Date(msg.createdAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            {/* Show read indicator for sent messages that have been read */}
            {msg.sender === myId && msg.readAt && (
              <span style={{ color: '#25d366', marginLeft: 4, fontWeight: 600 }} title={`Read at ${new Date(msg.readAt).toLocaleString()}`}>
                ✓ Seen
              </span>
            )}
          </div>
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