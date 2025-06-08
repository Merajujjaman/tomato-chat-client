# MERN Chat Application

This is a real-time chat application built using the MERN stack (MongoDB, Express.js, React, Node.js) and Socket.IO for real-time communication.

## Features

- Real-time messaging using Socket.IO
- User authentication (to be implemented)
- Message history stored in MongoDB
- Responsive design for chat interface

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or cloud instance)

### Installation

1. Clone the repository:

   git clone <repository-url>

2. Navigate to the backend directory and install dependencies:

   cd mern-chat-app/backend
   npm install

3. Set up your MongoDB connection in `backend/src/config/db.js`.

4. Start the backend server:

   npm start

5. Navigate to the frontend directory and install dependencies:

   cd ../frontend
   npm install

6. Start the frontend application:

   npm start

### Usage

- Open your browser and go to `http://localhost:3000` to access the chat application.
- You can start sending messages in real-time.

### Contributing

Feel free to submit issues or pull requests for improvements or bug fixes.

### License

This project is licensed under the MIT License.