const express = require('express');
const { createPost, getPosts, addComment, toggleLike } = require('../controllers/postControllers');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', getPosts);
router.post('/', protect, createPost);

// New routes:
router.post('/comment', protect, addComment);
router.post('/like', protect, toggleLike);

module.exports = router;
