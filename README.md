
# Chat App

A sophisticated real-time chat application with a Node.js and Express backend, and a React frontend. This project aims to provide a seamless communication platform with features like user authentication, profile management, friend requests, private chats, media sharing, and real-time messaging using Socket.IO.

## Features

- **User Authentication**: Secure registration and login using JWT.
- **User Profiles**: Manage user profiles with customizable profile pictures.
- **Friend Requests**: Send, receive, and manage friend requests.
- **Private Chats**: Engage in private conversations with friends.
- **Real-Time Messaging**: Enjoy instant messaging with Socket.IO.
- **Media Sharing**: Share images and videos within your chats.
- **Enhanced UI/UX**: Styled with Material-UI for a modern and responsive design.
- **API Documentation**: Comprehensive Swagger documentation for easy API exploration and testing.

## Project Structure

```
chat-app/
├── backend/
│   ├── index.js
│   ├── config.js
│   ├── models/
│   ├── routes/
│   ├── uploads/
│   └── ...
├── frontend/ (Coming Soon)
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── ...
├── .gitignore
└── README.md
```

## Setup Instructions

### Backend

1. **Navigate to the backend directory:**

   ```bash
   cd backend
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Create a `.env` file with the following content:**

   ```plaintext
   JWT_SECRET=my_super_secret_key_12345
   MONGODB_URI=mongodb://localhost/chat-app
   ```

4. **Start the backend server:**

   ```bash
   node index.js
   ```

### Frontend (Coming Soon)

1. **Navigate to the frontend directory:**

   ```bash
   cd frontend
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Start the React app:**

   ```bash
   npm start
   ```

## Accessing the Application

- **Backend API Documentation**: [http://localhost:5000/api-docs](http://localhost:5000/api-docs)
- **Frontend Application**: [http://localhost:3000](http://localhost:3000)

## Contributing

We welcome contributions to enhance the Chat App! Please fork the repository and submit pull requests for any improvements or bug fixes.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
