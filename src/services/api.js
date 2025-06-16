import axios from 'axios';

const API_URL = 'http://localhost:5000/api'; // Adjust if needed

export const fetchMessages = async (userId, otherUserId) => {
    try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
            `${API_URL}/messages?userId=${userId}&otherUserId=${otherUserId}`,
            { headers: { Authorization: `Bearer ${token}` } }
        );
        return response.data;
    } catch (error) {
        console.error('Error fetching messages:', error);
        throw error;
    }
};

export const sendMessage = async (messageData) => {
    try {
        const token = localStorage.getItem("token");
        const response = await axios.post(
            `${API_URL}/messages`,
            messageData,
            { headers: { Authorization: `Bearer ${token}` } }
        );
        return response.data;
    } catch (error) {
        console.error('Error sending message:', error);
        throw error;
    }
};