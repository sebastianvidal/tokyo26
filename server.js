const express = require('express');
const { PrismaClient } = require('@prisma/client');
const path = require('path');

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static('public'));

// === COMMENTS ===

// Get all comments (optionally filter by day)
app.get('/api/comments', async (req, res) => {
  try {
    const { day } = req.query;
    const where = day !== undefined ? { dayNumber: parseInt(day) } : {};
    const comments = await prisma.comment.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    });
    res.json(comments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create a comment
app.post('/api/comments', async (req, res) => {
  try {
    const { dayNumber, author, content } = req.body;
    const comment = await prisma.comment.create({
      data: { dayNumber, author, content }
    });
    res.json(comment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete a comment
app.delete('/api/comments/:id', async (req, res) => {
  try {
    await prisma.comment.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// === REQUESTS ===

// Get all requests
app.get('/api/requests', async (req, res) => {
  try {
    const { status } = req.query;
    const where = status ? { status } : {};
    const requests = await prisma.request.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create a request
app.post('/api/requests', async (req, res) => {
  try {
    const { dayNumber, title, content, author } = req.body;
    const request = await prisma.request.create({
      data: { dayNumber, title, content, author }
    });
    res.json(request);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update request status
app.patch('/api/requests/:id', async (req, res) => {
  try {
    const { status } = req.body;
    const request = await prisma.request.update({
      where: { id: req.params.id },
      data: { status }
    });
    res.json(request);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete a request
app.delete('/api/requests/:id', async (req, res) => {
  try {
    await prisma.request.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Serve the main page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
