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

// === ITINERARY - DAYS ===

// Get all days with nested items
app.get('/api/days', async (req, res) => {
  try {
    const days = await prisma.day.findMany({
      orderBy: { dayNumber: 'asc' },
      include: {
        scheduleItems: { orderBy: { sortOrder: 'asc' } },
        spots: { orderBy: { sortOrder: 'asc' } },
        links: { orderBy: { sortOrder: 'asc' } }
      }
    });
    res.json(days);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single day
app.get('/api/days/:dayNumber', async (req, res) => {
  try {
    const day = await prisma.day.findUnique({
      where: { dayNumber: parseInt(req.params.dayNumber) },
      include: {
        scheduleItems: { orderBy: { sortOrder: 'asc' } },
        spots: { orderBy: { sortOrder: 'asc' } },
        links: { orderBy: { sortOrder: 'asc' } }
      }
    });
    if (!day) return res.status(404).json({ error: 'Day not found' });
    res.json(day);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update day metadata
app.put('/api/days/:dayNumber', async (req, res) => {
  try {
    const { title, dayType } = req.body;
    const day = await prisma.day.update({
      where: { dayNumber: parseInt(req.params.dayNumber) },
      data: { title, dayType }
    });
    res.json(day);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// === ITINERARY - SCHEDULE ITEMS ===

// Add schedule item to a day
app.post('/api/days/:dayNumber/schedule', async (req, res) => {
  try {
    const { time, description, category } = req.body;
    const day = await prisma.day.findUnique({
      where: { dayNumber: parseInt(req.params.dayNumber) }
    });
    if (!day) return res.status(404).json({ error: 'Day not found' });

    // Get max sortOrder for this day
    const maxItem = await prisma.scheduleItem.findFirst({
      where: { dayId: day.id },
      orderBy: { sortOrder: 'desc' }
    });
    const sortOrder = (maxItem?.sortOrder ?? -1) + 1;

    const item = await prisma.scheduleItem.create({
      data: { dayId: day.id, time, description, category, sortOrder }
    });
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update schedule item
app.put('/api/schedule/:id', async (req, res) => {
  try {
    const { time, description, category } = req.body;
    const item = await prisma.scheduleItem.update({
      where: { id: req.params.id },
      data: { time, description, category }
    });
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete schedule item
app.delete('/api/schedule/:id', async (req, res) => {
  try {
    await prisma.scheduleItem.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// === ITINERARY - SPOTS ===

// Add spot to a day
app.post('/api/days/:dayNumber/spots', async (req, res) => {
  try {
    const { name, description, category, mapUrl } = req.body;
    const day = await prisma.day.findUnique({
      where: { dayNumber: parseInt(req.params.dayNumber) }
    });
    if (!day) return res.status(404).json({ error: 'Day not found' });

    const maxSpot = await prisma.spot.findFirst({
      where: { dayId: day.id },
      orderBy: { sortOrder: 'desc' }
    });
    const sortOrder = (maxSpot?.sortOrder ?? -1) + 1;

    const spot = await prisma.spot.create({
      data: { dayId: day.id, name, description, category, mapUrl, sortOrder }
    });
    res.json(spot);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update spot
app.put('/api/spots/:id', async (req, res) => {
  try {
    const { name, description, category, mapUrl } = req.body;
    const spot = await prisma.spot.update({
      where: { id: req.params.id },
      data: { name, description, category, mapUrl }
    });
    res.json(spot);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete spot
app.delete('/api/spots/:id', async (req, res) => {
  try {
    await prisma.spot.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// === ITINERARY - LINKS ===

// Add link to a day
app.post('/api/days/:dayNumber/links', async (req, res) => {
  try {
    const { label, url } = req.body;
    const day = await prisma.day.findUnique({
      where: { dayNumber: parseInt(req.params.dayNumber) }
    });
    if (!day) return res.status(404).json({ error: 'Day not found' });

    const maxLink = await prisma.dayLink.findFirst({
      where: { dayId: day.id },
      orderBy: { sortOrder: 'desc' }
    });
    const sortOrder = (maxLink?.sortOrder ?? -1) + 1;

    const link = await prisma.dayLink.create({
      data: { dayId: day.id, label, url, sortOrder }
    });
    res.json(link);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update link
app.put('/api/links/:id', async (req, res) => {
  try {
    const { label, url } = req.body;
    const link = await prisma.dayLink.update({
      where: { id: req.params.id },
      data: { label, url }
    });
    res.json(link);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete link
app.delete('/api/links/:id', async (req, res) => {
  try {
    await prisma.dayLink.delete({ where: { id: req.params.id } });
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
