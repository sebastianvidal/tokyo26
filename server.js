const express = require('express');
const { PrismaClient } = require('@prisma/client');
const Anthropic = require('@anthropic-ai/sdk');
const path = require('path');

const app = express();
const prisma = new PrismaClient();
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
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

// === CLAUDE AI CHAT ===

const CLAUDE_TOOLS = [
  {
    name: 'get_itinerary',
    description: 'Get the full itinerary or a specific day. Returns days with their schedule items, spots, and links.',
    input_schema: {
      type: 'object',
      properties: {
        dayNumber: {
          type: 'integer',
          description: 'Optional day number (0-13) to get a specific day. If omitted, returns all days.'
        }
      },
      required: []
    }
  },
  {
    name: 'update_day',
    description: 'Update a day\'s title or type',
    input_schema: {
      type: 'object',
      properties: {
        dayNumber: {
          type: 'integer',
          description: 'Day number (0-13)'
        },
        title: {
          type: 'string',
          description: 'New title for the day'
        },
        dayType: {
          type: 'string',
          enum: ['tokyo', 'niseko', 'travel'],
          description: 'Type of day'
        }
      },
      required: ['dayNumber']
    }
  },
  {
    name: 'add_schedule_item',
    description: 'Add a schedule item to a specific day',
    input_schema: {
      type: 'object',
      properties: {
        dayNumber: {
          type: 'integer',
          description: 'Day number (0-13)'
        },
        time: {
          type: 'string',
          description: 'Time of the activity (e.g., "9:30am")'
        },
        description: {
          type: 'string',
          description: 'Description of the activity'
        },
        category: {
          type: 'string',
          enum: ['cultural', 'shopping', 'food'],
          description: 'Category of the activity'
        }
      },
      required: ['dayNumber', 'time', 'description']
    }
  },
  {
    name: 'update_schedule_item',
    description: 'Update an existing schedule item',
    input_schema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'ID of the schedule item to update'
        },
        time: {
          type: 'string',
          description: 'New time'
        },
        description: {
          type: 'string',
          description: 'New description'
        },
        category: {
          type: 'string',
          enum: ['cultural', 'shopping', 'food'],
          description: 'New category'
        }
      },
      required: ['id']
    }
  },
  {
    name: 'delete_schedule_item',
    description: 'Delete a schedule item',
    input_schema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'ID of the schedule item to delete'
        }
      },
      required: ['id']
    }
  },
  {
    name: 'add_spot',
    description: 'Add a spot/place recommendation to a specific day',
    input_schema: {
      type: 'object',
      properties: {
        dayNumber: {
          type: 'integer',
          description: 'Day number (0-13)'
        },
        name: {
          type: 'string',
          description: 'Name of the spot'
        },
        description: {
          type: 'string',
          description: 'Description of the spot'
        },
        category: {
          type: 'string',
          enum: ['cultural', 'shopping', 'food', 'chill', 'party'],
          description: 'Category of the spot'
        },
        mapUrl: {
          type: 'string',
          description: 'Google Maps URL for the spot'
        }
      },
      required: ['dayNumber', 'name', 'description', 'category', 'mapUrl']
    }
  },
  {
    name: 'update_spot',
    description: 'Update an existing spot',
    input_schema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'ID of the spot to update'
        },
        name: {
          type: 'string',
          description: 'New name'
        },
        description: {
          type: 'string',
          description: 'New description'
        },
        category: {
          type: 'string',
          enum: ['cultural', 'shopping', 'food', 'chill', 'party'],
          description: 'New category'
        },
        mapUrl: {
          type: 'string',
          description: 'New Google Maps URL'
        }
      },
      required: ['id']
    }
  },
  {
    name: 'delete_spot',
    description: 'Delete a spot',
    input_schema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'ID of the spot to delete'
        }
      },
      required: ['id']
    }
  }
];

const SYSTEM_PROMPT = `You are a helpful assistant for planning a Tokyo + Niseko honeymoon trip from January 19 to February 1, 2025.

Trip Overview:
- Days 0-1: Travel from EWR to HND, arrive in Tokyo
- Days 2-4: Tokyo exploration (Shimokitazawa, Ginza, Koenji neighborhoods)
- Day 5: White Liner bus to Niseko (early departure for night skiing)
- Days 6-9: Skiing at Niseko United (staying at Aya Niseko)
- Day 10: Return to Tokyo
- Days 11-12: More Tokyo (Nakameguro, Asakusa)
- Day 13: Fly home HND to EWR (6:25pm departure)

Hotels:
1. ANA Intercontinental Tokyo (first Tokyo stint)
2. Aya Niseko (skiing days)
3. TBD luxury hotel (second Tokyo stint)

You can help by:
- Viewing and explaining the current itinerary
- Adding, updating, or removing schedule items
- Adding, updating, or removing recommended spots
- Suggesting activities, restaurants, and experiences
- Answering questions about Tokyo and Niseko

When making changes, always confirm what you've done. Be concise but helpful.`;

// Execute tool calls against the database
async function executeToolCall(toolName, toolInput) {
  switch (toolName) {
    case 'get_itinerary': {
      if (toolInput.dayNumber !== undefined) {
        const day = await prisma.day.findUnique({
          where: { dayNumber: toolInput.dayNumber },
          include: {
            scheduleItems: { orderBy: { sortOrder: 'asc' } },
            spots: { orderBy: { sortOrder: 'asc' } },
            links: { orderBy: { sortOrder: 'asc' } }
          }
        });
        return day || { error: 'Day not found' };
      } else {
        const days = await prisma.day.findMany({
          orderBy: { dayNumber: 'asc' },
          include: {
            scheduleItems: { orderBy: { sortOrder: 'asc' } },
            spots: { orderBy: { sortOrder: 'asc' } },
            links: { orderBy: { sortOrder: 'asc' } }
          }
        });
        return days;
      }
    }

    case 'update_day': {
      const { dayNumber, title, dayType } = toolInput;
      const data = {};
      if (title) data.title = title;
      if (dayType) data.dayType = dayType;
      const day = await prisma.day.update({
        where: { dayNumber },
        data
      });
      return day;
    }

    case 'add_schedule_item': {
      const { dayNumber, time, description, category } = toolInput;
      const day = await prisma.day.findUnique({
        where: { dayNumber }
      });
      if (!day) return { error: 'Day not found' };

      const maxItem = await prisma.scheduleItem.findFirst({
        where: { dayId: day.id },
        orderBy: { sortOrder: 'desc' }
      });
      const sortOrder = (maxItem?.sortOrder ?? -1) + 1;

      const item = await prisma.scheduleItem.create({
        data: { dayId: day.id, time, description, category, sortOrder }
      });
      return item;
    }

    case 'update_schedule_item': {
      const { id, time, description, category } = toolInput;
      const data = {};
      if (time) data.time = time;
      if (description) data.description = description;
      if (category) data.category = category;
      const item = await prisma.scheduleItem.update({
        where: { id },
        data
      });
      return item;
    }

    case 'delete_schedule_item': {
      await prisma.scheduleItem.delete({ where: { id: toolInput.id } });
      return { success: true };
    }

    case 'add_spot': {
      const { dayNumber, name, description, category, mapUrl } = toolInput;
      const day = await prisma.day.findUnique({
        where: { dayNumber }
      });
      if (!day) return { error: 'Day not found' };

      const maxSpot = await prisma.spot.findFirst({
        where: { dayId: day.id },
        orderBy: { sortOrder: 'desc' }
      });
      const sortOrder = (maxSpot?.sortOrder ?? -1) + 1;

      const spot = await prisma.spot.create({
        data: { dayId: day.id, name, description, category, mapUrl, sortOrder }
      });
      return spot;
    }

    case 'update_spot': {
      const { id, name, description, category, mapUrl } = toolInput;
      const data = {};
      if (name) data.name = name;
      if (description) data.description = description;
      if (category) data.category = category;
      if (mapUrl) data.mapUrl = mapUrl;
      const spot = await prisma.spot.update({
        where: { id },
        data
      });
      return spot;
    }

    case 'delete_spot': {
      await prisma.spot.delete({ where: { id: toolInput.id } });
      return { success: true };
    }

    default:
      return { error: `Unknown tool: ${toolName}` };
  }
}

// Chat endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { message, conversationHistory = [] } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Build messages array
    const messages = [
      ...conversationHistory,
      { role: 'user', content: message }
    ];

    let response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      tools: CLAUDE_TOOLS,
      messages
    });

    const toolResults = [];

    // Handle tool use loop
    while (response.stop_reason === 'tool_use') {
      const toolUseBlocks = response.content.filter(block => block.type === 'tool_use');
      const toolResultsContent = [];

      for (const toolUse of toolUseBlocks) {
        const result = await executeToolCall(toolUse.name, toolUse.input);
        toolResults.push({
          tool: toolUse.name,
          input: toolUse.input,
          result
        });
        toolResultsContent.push({
          type: 'tool_result',
          tool_use_id: toolUse.id,
          content: JSON.stringify(result)
        });
      }

      // Continue conversation with tool results
      messages.push({ role: 'assistant', content: response.content });
      messages.push({ role: 'user', content: toolResultsContent });

      response = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4096,
        system: SYSTEM_PROMPT,
        tools: CLAUDE_TOOLS,
        messages
      });
    }

    // Extract text response
    const textContent = response.content.find(block => block.type === 'text');
    const textResponse = textContent ? textContent.text : '';

    // Check if any modifications were made
    const modified = toolResults.some(r =>
      ['add_schedule_item', 'update_schedule_item', 'delete_schedule_item',
       'add_spot', 'update_spot', 'delete_spot', 'update_day'].includes(r.tool)
    );

    res.json({
      response: textResponse,
      toolResults,
      modified,
      conversationHistory: messages.concat([{ role: 'assistant', content: response.content }])
    });
  } catch (error) {
    console.error('Chat error:', error);
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
