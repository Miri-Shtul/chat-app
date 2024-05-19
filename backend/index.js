require('dotenv').config();
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require('mongoose');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const messageRoutes = require('./routes/messages');
const setupSwagger = require('./swagger'); // Import the Swagger setup
const app = express();
const server = http.createServer(app);
const io = socketIo(server);

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

app.use(express.json());
app.use('/uploads', express.static('uploads'));

setupSwagger(app); // Set up Swagger before the routes

app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/messages', messageRoutes);

io.on('connection', (socket) => {
  console.log('New client connected');
  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
  socket.on('sendMessage', ({ sender, receiver, content, media }) => {
    io.emit('receiveMessage', { sender, receiver, content, media });
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
