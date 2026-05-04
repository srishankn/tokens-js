const express = require('express');
const authMiddleware = require('../middleware/auth');
const Todo = require('../models/Todo');

const router = express.Router();

// Get all todos for the user
router.get('/todos', authMiddleware, async (req, res) => {
  try {
    const todos = await Todo.find({ userId: req.user.user_id }).sort({ createdAt: -1 });
    res.json(todos);
  } catch (error) {
    console.error('Fetch todos error:', error);
    res.status(500).json({ error: 'Failed to fetch todos' });
  }
});

// Create a new todo
router.post('/todos', authMiddleware, async (req, res) => {
  try {
    const { title } = req.body;
    if (!title) return res.status(400).json({ error: 'Title is required' });

    const newTodo = await Todo.create({
      userId: req.user.user_id,
      title
    });
    res.status(201).json(newTodo);
  } catch (error) {
    console.error('Create todo error:', error);
    res.status(500).json({ error: 'Failed to create todo' });
  }
});

// Update a todo
router.put('/todos/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const todo = await Todo.findOneAndUpdate(
      { _id: id, userId: req.user.user_id },
      { $set: updates },
      { new: true }
    );

    if (!todo) return res.status(404).json({ error: 'Todo not found' });
    res.json(todo);
  } catch (error) {
    console.error('Update todo error:', error);
    res.status(500).json({ error: 'Failed to update todo' });
  }
});

// Delete a todo
router.delete('/todos/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const todo = await Todo.findOneAndDelete({ _id: id, userId: req.user.user_id });

    if (!todo) return res.status(404).json({ error: 'Todo not found' });
    res.json({ message: 'Todo deleted successfully' });
  } catch (error) {
    console.error('Delete todo error:', error);
    res.status(500).json({ error: 'Failed to delete todo' });
  }
});

module.exports = router;
