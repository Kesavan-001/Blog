const Post = require('../models/Post');
const fetch = require('node-fetch');
const FormData = require('form-data');

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

const createPostWithImage = async (req, res) => {
  const { title, content } = req.body;
  const file = req.files ? req.files.image : null;
  if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

  let imageUrl = '';
  if (file) {
    const formData = new FormData();
    formData.append('key', process.env.IMGBB_API_KEY);
    formData.append('image', file.data, file.name);

    try {
      const imgbbResponse = await fetch('https://api.imgbb.com/1/upload', {
        method: 'POST',
        body: formData,
      });
      const imgbbData = await imgbbResponse.json();
      if (imgbbData.success) {
        imageUrl = imgbbData.data.url;
      } else {
        return res.status(500).json({ message: 'Image upload failed: ' + (imgbbData.error.message || 'Unknown error') });
      }
    } catch (error) {
      console.error('ImgBB Error:', error);
      return res.status(500).json({ message: 'Image upload failed' });
    }
  }

  try {
    const post = await Post.create({
      title,
      content,
      image: imageUrl,
      author: req.user._id,
      createdAt: new Date(),
    });
    res.status(201).json(post);
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .populate('author', 'username email')
      .populate('comments.author', 'username email');
    console.log('Raw Posts:', posts);
    res.json(posts);
  } catch (error) {
    console.error("Error retrieving posts:", error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('author', 'username email')
      .populate('comments.author', 'username email');
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    res.json(post);
  } catch (error) {
    console.error("Error retrieving post:", error);
    res.status(500).json({ message: 'Server error' });
  }
};

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
      post.likes.push(req.user._id);
    } else {
      post.likes.splice(index, 1);
    }
    await post.save();
    res.status(200).json({ likes: post.likes.length });
  } catch (error) {
    console.error("Error toggling like:", error);
    res.status(500).json({ message: 'Server error' });
  }
};

const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized to delete this post' });
    }
    await post.deleteOne();
    res.json({ message: 'Post deleted' });
  } catch (error) {
    console.error("Error deleting post:", error);
    res.status(500).json({ message: 'Server error' });
  }
};

const updatePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized to update this post' });
    }
    post.title = req.body.title || post.title;
    post.content = req.body.content || post.content;
    post.image = req.body.image || post.image;
    await post.save();
    res.json(post);
  } catch (error) {
    console.error("Error updating post:", error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  createPost,
  createPostWithImage, // Ensure this is exported
  getPosts,
  getPostById,
  addComment,
  toggleLike,
  deletePost,
  updatePost,
};