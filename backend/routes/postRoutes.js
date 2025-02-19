const express = require('express');
const { createPost, getPosts, getPostById, addComment, toggleLike, deletePost, updatePost } = require('../controllers/postControllers');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', getPosts);
router.get('/:id', getPostById);
router.post('/', protect, createPost);
router.put('/:id', protect, updatePost); // <-- New update route
router.delete('/:id', protect, deletePost);
router.post('/comment', protect, addComment);
router.post('/like', protect, toggleLike);

module.exports = router;
