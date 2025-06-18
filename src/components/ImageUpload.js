import React, { useState, useRef } from 'react';
import './ImageUpload.css';

const ImageUpload = ({ onImageSelect, onClose }) => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const fileInputRef = useRef(null);

  const handleImageSelect = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedImage(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSend = () => {
    if (selectedImage) {
      onImageSelect(selectedImage);
      onClose();
    }
  };

  const handleCancel = () => {
    setSelectedImage(null);
    setPreview(null);
    onClose();
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  return (
    <div className="image-upload-overlay">
      <div className="image-upload-modal">
        <div className="image-upload-header">
          <h3>Send Image</h3>
          <button onClick={onClose} className="close-btn">&times;</button>
        </div>
        
        <div className="image-upload-content">
          {!preview ? (
            <div className="image-upload-placeholder" onClick={triggerFileInput}>
              <div className="upload-icon">📷</div>
              <p>Click to select an image</p>
              <p className="upload-hint">Supports: JPG, PNG, GIF, WebP (max 5MB)</p>
            </div>
          ) : (
            <div className="image-preview-container">
              <img src={preview} alt="Preview" className="image-preview" />
              <div className="image-info">
                <p>{selectedImage.name}</p>
                <p>{(selectedImage.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
            </div>
          )}
          
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageSelect}
            style={{ display: 'none' }}
          />
        </div>
        
        <div className="image-upload-actions">
          <button onClick={handleCancel} className="cancel-btn">
            Cancel
          </button>
          <button 
            onClick={handleSend} 
            className="send-btn"
            disabled={!selectedImage}
          >
            Send Image
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImageUpload; 