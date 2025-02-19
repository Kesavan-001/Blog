const Post = require('../models/Post');

// Create a new blog post
const createPost = async (req, res) => {
  const { title, content, image } = req.body;
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized, please log in' });
  }
  try {
    const post = await Post.create({
      title,
      content,
      image,
      author: req.user._id,
      createdAt: new Date(),
    });
    res.status(201).json(post);
  } catch (error) {
    console.error("Error creating post:", error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Retrieve all blog posts
const getPosts = async (req, res) => {
  try {
    const posts = await Post.find().populate('author', 'username email');
    res.json(posts);
  } catch (error) {
    console.error("Error retrieving posts:", error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create a new comment on a post
const addComment = async (req, res) => {
  const { postId, comment } = req.body;
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized, please log in' });
  }
  try {
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    post.comments.push({ comment, author: req.user._id });
    await post.save();
    res.status(201).json(post);
  } catch (error) {
    console.error("Error adding comment:", error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Toggle like for a post
const toggleLike = async (req, res) => {
  const { postId } = req.body;
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized, please log in' });
  }
  try {
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    const index = post.likes.indexOf(req.user._id);
    if (index === -1) {
      // Add like
      post.likes.push(req.user._id);
    } else {
      // Remove like
      post.likes.splice(index, 1);
    }
    await post.save();
    res.status(200).json({ likes: post.likes.length });
  } catch (error) {
    console.error("Error toggling like:", error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { createPost, getPosts, addComment, toggleLike };
