const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const FriendRequest = require('../models/FriendRequest');
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
 *     UserProfile:
 *       type: object
 *       properties:
 *         username:
 *           type: string
 *           description: The user's username
 *         profilePicture:
 *           type: string
 *           description: URL to the user's profile picture
 *         friends:
 *           type: array
 *           items:
 *             type: string
 *             description: IDs of the user's friends
 *     FriendRequest:
 *       type: object
 *       properties:
 *         requester:
 *           type: string
 *           description: The ID of the user who sent the friend request
 *         recipient:
 *           type: string
 *           description: The ID of the user who received the friend request
 *         status:
 *           type: string
 *           enum: [pending, accepted, declined]
 *           description: The status of the friend request
 */

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: The users managing API
 */

/**
 * @swagger
 * /users/profile:
 *   get:
 *     summary: Get user profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: The user profile
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserProfile'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Some server error
 */
router.get('/profile', authenticateToken, async (req, res) => {
  const user = await User.findById(req.user.id).populate('friends', 'username profilePicture');
  res.json(user);
});

/**
 * @swagger
 * /users/profile-picture:
 *   post:
 *     summary: Upload profile picture
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               profilePicture:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: The user profile with updated picture
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserProfile'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Some server error
 */
router.post('/profile-picture', authenticateToken, upload.single('profilePicture'), async (req, res) => {
  const user = await User.findById(req.user.id);
  user.profilePicture = req.file.path;
  await user.save();
  res.json(user);
});

/**
 * @swagger
 * /users/friend-request:
 *   post:
 *     summary: Send a friend request
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               recipientId:
 *                 type: string
 *                 description: The ID of the user to send a friend request to
 *     responses:
 *       201:
 *         description: Friend request sent
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Some server error
 */
router.post('/friend-request', authenticateToken, async (req, res) => {
  const { recipientId } = req.body;
  const request = new FriendRequest({ requester: req.user.id, recipient: recipientId });
  await request.save();
  res.status(201).send('Friend request sent');
});

/**
 * @swagger
 * /users/friend-requests:
 *   get:
 *     summary: Get friend requests
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of friend requests
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/FriendRequest'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Some server error
 */
router.get('/friend-requests', authenticateToken, async (req, res) => {
  const requests = await FriendRequest.find({ recipient: req.user.id, status: 'pending' }).populate('requester', 'username profilePicture');
  res.json(requests);
});

/**
 * @swagger
 * /users/friend-request/{id}/accept:
 *   post:
 *     summary: Accept a friend request
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the friend request
 *     responses:
 *       200:
 *         description: Friend request accepted
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Some server error
 */
router.post('/friend-request/:id/accept', authenticateToken, async (req, res) => {
  const request = await FriendRequest.findById(req.params.id);
  request.status = 'accepted';
  await request.save();

  const requester = await User.findById(request.requester);
  const recipient = await User.findById(request.recipient);

  requester.friends.push(recipient._id);
  recipient.friends.push(requester._id);

  await requester.save();
  await recipient.save();

  res.send('Friend request accepted');
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
