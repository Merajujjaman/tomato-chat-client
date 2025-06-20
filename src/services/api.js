import axios from 'axios';

const API_URL = 'https://tomato-chat-server-y4uh.onrender.com/api';

const api = axios.create({
  baseURL: API_URL,
});

// Global response interceptor for JWT errors
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response && error.response.status === 401) {
      // Token expired or invalid
      localStorage.clear();
      window.location.href = "/"; // Redirect to login page
    }
    return Promise.reject(error);
  }
);

export const fetchMessages = async (userId, otherUserId) => {
  const token = localStorage.getItem("token");
  const response = await api.get(
    `/messages?userId=${userId}&otherUserId=${otherUserId}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data;
};

export const sendMessage = async (messageData) => {
  const token = localStorage.getItem("token");
  const response = await api.post(
    '/messages',
    messageData,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data;
};

export const uploadImage = async (imageFile, receiverId, content = '') => {
  const token = localStorage.getItem("token");
  const formData = new FormData();
  formData.append('image', imageFile);
  formData.append('receiver', receiverId);
  if (content) {
    formData.append('content', content);
  }

  const response = await api.post(
    '/upload-image',
    formData,
    { 
      headers: { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data'
      } 
    }
  );
  return response.data;
};

export const markMessagesAsRead = async (fromUserId) => {
  const token = localStorage.getItem("token");
  const response = await api.post(
    '/messages/mark-read',
    { fromUserId },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data;
};

export const getUnreadCounts = async () => {
  const token = localStorage.getItem("token");
  const response = await api.get(
    '/messages/unread-counts',
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data;
};

export const getLastMessagesPerUser = async () => {
  const token = localStorage.getItem("token");
  const response = await api.get(
    '/messages/last-per-user',
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data;
};

// Add other API functions as needed