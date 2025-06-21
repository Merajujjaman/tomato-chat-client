import { io } from "socket.io-client";
import { SOCKET_URL } from "../config";

const socket = io(SOCKET_URL); // Adjust the URL as needed
// const socket = io("https://tomato-chat-server-y4uh.onrender.com"); // Adjust the URL as needed

export const sendMessage = (message) => {
    socket.emit("sendMessage", message);
};

export const receiveMessages = (callback) => {
    socket.on("receiveMessage", (message) => {
        callback(message);
    });
};

export const disconnectSocket = () => {
    socket.disconnect();
};

export default socket;