import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../config';
import './ProfileSettings.css';

function ProfileSettings({ onClose, onProfileUpdate }) {
  const [displayName, setDisplayName] = useState('');
  const [profilePicture, setProfilePicture] = useState('');
  const [currentProfilePicture, setCurrentProfilePicture] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    // Fetch current user profile
    const fetchProfile = async () => {
      try {
        const response = await axios.get(`${API_URL}/auth/profile`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
        });
        const user = response.data;
        setDisplayName(user.displayName || user.username);
        setCurrentProfilePicture(user.profilePicture);
      } catch (error) {
        console.error('Error fetching profile:', error);
      }
    };
    fetchProfile();
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePicture(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      let updatedProfilePicture = currentProfilePicture;

      // Update profile picture if selected
      if (profilePicture) {
        const formData = new FormData();
        formData.append('image', profilePicture);
        
        const uploadResponse = await axios.post(`${API_URL}/upload/upload-profile-picture`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        });
        
        updatedProfilePicture = uploadResponse.data.profilePicture;
      }

      // Update display name
      const profileResponse = await axios.put(`${API_URL}/auth/profile`, {
        displayName: displayName
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });

      setMessage('Profile updated successfully!');
      
      // Update localStorage with new display name and profile picture
      localStorage.setItem("displayName", displayName);
      localStorage.setItem("profilePicture", updatedProfilePicture);
      
      // Notify parent component
      if (onProfileUpdate) {
        onProfileUpdate({ 
          displayName, 
          profilePicture: updatedProfilePicture 
        });
      }

      // Close modal after a short delay
      setTimeout(() => {
        onClose();
      }, 1500);

    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage('Error updating profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getProfileImageUrl = () => {
    if (profilePicture) {
      return URL.createObjectURL(profilePicture);
    }
    if (currentProfilePicture) {
      return currentProfilePicture;
    }
    return `https://ui-avatars.com/api/?name=${displayName}&background=25d366&color=fff&rounded=true&size=100`;
  };

  return (
    <div className="profile-settings-overlay">
      <div className="profile-settings-modal">
        <div className="profile-settings-header">
          <h2>Profile Settings</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="profile-settings-form">
          <div className="profile-picture-section">
            <div className="profile-picture-preview">
              <img 
                src={getProfileImageUrl()} 
                alt="Profile" 
                className="profile-picture"
              />
            </div>
            <div className="profile-picture-upload">
              <label htmlFor="profile-picture" className="upload-btn">
                {profilePicture ? 'Change Picture' : 'Upload Picture'}
              </label>
              <input
                type="file"
                id="profile-picture"
                accept="image/*"
                onChange={handleImageChange}
                style={{ display: 'none' }}
              />
              {profilePicture && (
                <button 
                  type="button" 
                  onClick={() => setProfilePicture('')}
                  className="remove-btn"
                >
                  Remove
                </button>
              )}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="display-name">Display Name</label>
            <input
              type="text"
              id="display-name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Enter display name"
              maxLength={30}
            />
          </div>

          {message && (
            <div className={`message ${message.includes('Error') ? 'error' : 'success'}`}>
              {message}
            </div>
          )}

          <div className="form-actions">
            <button type="button" onClick={onClose} className="cancel-btn">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="save-btn">
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ProfileSettings; 