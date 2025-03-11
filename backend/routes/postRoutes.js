const express = require('express');
const router = express.Router();
const {
  createPost,
  createPostWithImage,
  getPosts,
  getPostById,
  addComment,
  toggleLike,
  deletePost,
  updatePost,
} = require('../controllers/postControllers');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, createPost);
router.post('/upload', protect, createPostWithImage); // For image uploads
router.get('/', getPosts);
router.get('/:id', getPostById);
router.post('/comment', protect, addComment);
router.post('/like', protect, toggleLike);
router.delete('/:id', protect, deletePost);
router.put('/:id', protect, updatePost);

module.exports = router;