const express = require('express');
const jwt = require('jsonwebtoken');
const Message = require('../models/Message');
const multer = require('multer');
const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  },
});

const upload = multer({ storage });

/**
 * @swagger
 * components:
 *   schemas:
 *     Message:
 *       type: object
 *       properties:
 *         sender:
 *           type: string
 *           description: The ID of the sender
 *         receiver:
 *           type: string
 *           description: The ID of the receiver
 *         content:
 *           type: string
 *           description: The content of the message
 *         media:
 *           type: string
 *           description: URL to the media file
 *         timestamp:
 *           type: string
 *           format: date-time
 *           description: The timestamp of the message
 */

/**
 * @swagger
 * tags:
 *   name: Messages
 *   description: The messages managing API
 */

/**
 * @swagger
 * /messages:
 *   post:
 *     summary: Send a message
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               receiver:
 *                 type: string
 *                 description: The ID of the receiver
 *               content:
 *                 type: string
 *                 description: The content of the message
 *               media:
 *                 type: string
 *                 format: binary
 *                 description: The media file
 *     responses:
 *       201:
 *         description: The message was sent
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Message'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Some server error
 */
router.post('/', authenticateToken, upload.single('media'), async (req, res) => {
  const { receiver, content } = req.body;
  const message = new Message({
    sender: req.user.id,
    receiver,
    content,
    media: req.file ? req.file.path : null,
  });
  await message.save();
  res.status(201).send('Message sent');
});

/**
 * @swagger
 * /messages/{receiverId}:
 *   get:
 *     summary: Get messages
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: receiverId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the receiver
 *     responses:
 *       200:
 *         description: List of messages
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Message'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Some server error
 */
router.get('/:receiverId', authenticateToken, async (req, res) => {
  const messages = await Message.find({
    $or: [
      { sender: req.user.id, receiver: req.params.receiverId },
      { sender: req.params.receiverId, receiver: req.user.id },
    ],
  }).populate('sender receiver', 'username profilePicture');
  res.json(messages);
});

function authenticateToken(req, res, next) {
  const token = req.header('Authorization');
  if (!token) return res.status(401).send('Access denied');
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).send('Invalid token');
    req.user = user;
    next();
  });
}

module.exports = router;
