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

// Helper: Convert time string to minutes for sorting
function timeToMinutes(timeStr) {
  if (!timeStr || timeStr === 'all-day') return -1; // All-day items go first
  const match = timeStr.match(/(\d+):?(\d*)\s*(am|pm)?/i);
  if (!match) return 9999; // Unknown times go to end
  let hours = parseInt(match[1]);
  const mins = parseInt(match[2] || '0');
  const period = (match[3] || '').toLowerCase();
  if (period === 'pm' && hours !== 12) hours += 12;
  if (period === 'am' && hours === 12) hours = 0;
  return hours * 60 + mins;
}

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

// === TRIP INFO ===

// Get trip info (header, flights, highlights)
app.get('/api/trip', async (req, res) => {
  try {
    const trip = await prisma.trip.findFirst({
      include: {
        flights: { orderBy: { sortOrder: 'asc' } }
      }
    });
    if (!trip) {
      return res.status(404).json({ error: 'No trip found' });
    }
    res.json(trip);
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

    // Get all existing items for this day
    const existingItems = await prisma.scheduleItem.findMany({
      where: { dayId: day.id },
      orderBy: { sortOrder: 'asc' }
    });

    // Find correct position based on time
    const newTimeMinutes = timeToMinutes(time);
    let sortOrder = 0;
    for (const item of existingItems) {
      if (timeToMinutes(item.time) > newTimeMinutes) break;
      sortOrder = item.sortOrder + 1;
    }

    // Shift existing items to make room
    await prisma.scheduleItem.updateMany({
      where: { dayId: day.id, sortOrder: { gte: sortOrder } },
      data: { sortOrder: { increment: 1 } }
    });

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

const SYSTEM_PROMPT = `You are a helpful assistant for planning a Tokyo + Niseko honeymoon trip (Jan 19 - Feb 1, 2025).

WORKFLOW - Follow this for ANY itinerary changes:
1. FIRST: Call get_itinerary to see the current schedule
2. ANALYZE: Consider which day fits best based on:
   - Location/neighborhood (group nearby places together)
   - Available time slots
   - What's already planned before/after
3. PROPOSE: Suggest a specific day and time, explain your reasoning briefly
4. WAIT: Get user confirmation before making any changes
5. EXECUTE: Only then call add_schedule_item or other modification tools

TRIP STRUCTURE:
- Days 0-1: Travel EWR→HND, arrive Tokyo
- Day 2: Shimokitazawa neighborhood
- Day 3: Ginza / central Tokyo
- Day 4: Koenji neighborhood
- Day 5: Bus to Niseko
- Days 6-9: Niseko skiing (Aya Niseko hotel)
- Day 10: Return to Tokyo
- Day 11: Nakameguro neighborhood
- Day 12: Asakusa neighborhood
- Day 13: Fly home (6:25pm departure)

SCHEDULE ITEMS vs SPOTS:
- Schedule items: Activities the user commits to (add with specific time)
- Spots: Optional recommendations, "nearby if you have time"
When user says "I want to go to X" → propose as schedule item, not spot

MAPS URLS:
When adding places, construct a Google Maps search URL:
https://www.google.com/maps/search/[Place+Name]+[Area]+Japan
Example: https://www.google.com/maps/search/Shibuya+109+Tokyo+Japan

Be concise. Never modify the itinerary without user confirmation first.`;

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

      // Get all existing items for this day
      const existingItems = await prisma.scheduleItem.findMany({
        where: { dayId: day.id },
        orderBy: { sortOrder: 'asc' }
      });

      // Find correct position based on time
      const newTimeMinutes = timeToMinutes(time);
      let sortOrder = 0;
      for (const existingItem of existingItems) {
        if (timeToMinutes(existingItem.time) > newTimeMinutes) break;
        sortOrder = existingItem.sortOrder + 1;
      }

      // Shift existing items to make room
      await prisma.scheduleItem.updateMany({
        where: { dayId: day.id, sortOrder: { gte: sortOrder } },
        data: { sortOrder: { increment: 1 } }
      });

      const newItem = await prisma.scheduleItem.create({
        data: { dayId: day.id, time, description, category, sortOrder }
      });
      return newItem;
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

// Tool display names for UI
const TOOL_DISPLAY_NAMES = {
  get_itinerary: 'Fetching itinerary',
  update_day: 'Updating day',
  add_schedule_item: 'Adding to schedule',
  update_schedule_item: 'Updating schedule',
  delete_schedule_item: 'Removing from schedule',
  add_spot: 'Adding spot',
  update_spot: 'Updating spot',
  delete_spot: 'Removing spot'
};

// Helper to send SSE event
function sendSSE(res, event, data) {
  res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
}

// Chat endpoint with SSE streaming
app.post('/api/chat', async (req, res) => {
  // Set SSE headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  try {
    const { message, conversationHistory = [] } = req.body;

    if (!message) {
      sendSSE(res, 'error', { error: 'Message is required' });
      res.end();
      return;
    }

    // Clean incoming conversation history - ensure no tool_use/tool_result blocks
    const cleanedIncoming = [];
    for (const msg of conversationHistory) {
      if (msg.role === 'user' && typeof msg.content === 'string') {
        cleanedIncoming.push(msg);
      } else if (msg.role === 'assistant') {
        if (typeof msg.content === 'string') {
          cleanedIncoming.push(msg);
        } else if (Array.isArray(msg.content)) {
          const textBlock = msg.content.find(b => b.type === 'text');
          if (textBlock && textBlock.text) {
            cleanedIncoming.push({ role: 'assistant', content: textBlock.text });
          }
        }
      }
    }

    // Build messages array
    const messages = [
      ...cleanedIncoming,
      { role: 'user', content: message }
    ];

    let modified = false;
    let fullResponse = '';
    let continueLoop = true;
    const toolsUsed = [];

    while (continueLoop) {
      // Use streaming API
      const stream = anthropic.messages.stream({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4096,
        system: SYSTEM_PROMPT,
        tools: CLAUDE_TOOLS,
        messages
      });

      let currentToolName = null;

      // Process stream events (for UI updates only - API uses finalMessage)
      for await (const event of stream) {
        if (event.type === 'content_block_start') {
          if (event.content_block.type === 'tool_use') {
            currentToolName = event.content_block.name;
            sendSSE(res, 'tool_start', {
              tool: event.content_block.name,
              displayName: TOOL_DISPLAY_NAMES[event.content_block.name] || event.content_block.name
            });
          }
        } else if (event.type === 'content_block_delta') {
          if (event.delta.type === 'text_delta') {
            fullResponse += event.delta.text;
            sendSSE(res, 'text', { delta: event.delta.text });
          }
        } else if (event.type === 'content_block_stop') {
          currentToolName = null;
        }
      }

      // Get final message for stop reason
      const finalMessage = await stream.finalMessage();

      // Check if we need to handle tool use
      if (finalMessage.stop_reason === 'tool_use') {
        // Extract tool_use blocks from finalMessage.content (authoritative source)
        const toolUseBlocks = finalMessage.content.filter(b => b.type === 'tool_use');
        const toolResultsContent = [];

        for (const toolUse of toolUseBlocks) {
          const result = await executeToolCall(toolUse.name, toolUse.input);

          // Check if this tool modifies the itinerary
          if (['add_schedule_item', 'update_schedule_item', 'delete_schedule_item',
               'add_spot', 'update_spot', 'delete_spot', 'update_day'].includes(toolUse.name)) {
            modified = true;
          }

          // Track tool usage
          toolsUsed.push({
            tool: toolUse.name,
            displayName: TOOL_DISPLAY_NAMES[toolUse.name] || toolUse.name
          });

          // Send tool completion event
          sendSSE(res, 'tool_done', {
            tool: toolUse.name,
            displayName: TOOL_DISPLAY_NAMES[toolUse.name] || toolUse.name,
            success: !result.error
          });

          toolResultsContent.push({
            type: 'tool_result',
            tool_use_id: toolUse.id,
            content: JSON.stringify(result)
          });
        }

        // Use finalMessage.content directly (authoritative source, not our reconstructed version)
        messages.push({ role: 'assistant', content: finalMessage.content });
        messages.push({ role: 'user', content: toolResultsContent });
      } else {
        // No more tool use, we're done
        continueLoop = false;
        messages.push({ role: 'assistant', content: finalMessage.content });
      }
    }

    // Clean conversation history for client - only keep user text and assistant text
    // Remove tool_use/tool_result pairs to avoid API errors on next call
    const cleanHistory = [];
    for (const msg of messages) {
      if (msg.role === 'user') {
        // Only keep string content (skip tool_result arrays)
        if (typeof msg.content === 'string') {
          cleanHistory.push(msg);
        }
      } else if (msg.role === 'assistant') {
        // Extract text from assistant messages
        if (Array.isArray(msg.content)) {
          const textBlock = msg.content.find(b => b.type === 'text');
          if (textBlock && textBlock.text) {
            cleanHistory.push({ role: 'assistant', content: textBlock.text });
          }
        } else if (typeof msg.content === 'string') {
          cleanHistory.push(msg);
        }
      }
    }

    // Send completion event
    sendSSE(res, 'done', {
      modified,
      conversationHistory: cleanHistory,
      toolsUsed
    });

    res.end();
  } catch (error) {
    console.error('Chat error:', error);
    sendSSE(res, 'error', { error: error.message });
    res.end();
  }
});

// Serve the main page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Auto-seed Trip data if none exists
async function ensureTripData() {
  try {
    const existingTrip = await prisma.trip.findFirst();
    if (!existingTrip) {
      console.log('No trip found, seeding default data...');
      const trip = await prisma.trip.create({
        data: {
          id: 'tokyo-niseko-2025',
          title: 'Tokyo + Niseko 2025',
          subtitle: 'January 19 - February 1',
          tags: ['6 Days Tokyo', '4 Days Skiing'],
          highlights: [
            { label: 'Ski Days', value: '4 + night session' },
            { label: 'Michelin', value: '2 dinners' },
            { label: 'Neighborhoods', value: '8 explored' }
          ]
        }
      });

      // Create flights
      const flightsData = [
        { label: 'Outbound', route: 'EWR → HND', date: 'Jan 19', sortOrder: 0 },
        { label: 'To Niseko', route: 'HND → CTS', date: 'Jan 24', sortOrder: 1 },
        { label: 'Back', route: 'CTS → HND', date: 'Jan 29', sortOrder: 2 },
        { label: 'Home', route: 'HND → EWR', date: 'Feb 1', sortOrder: 3 }
      ];

      for (const flight of flightsData) {
        await prisma.flight.create({
          data: { tripId: trip.id, ...flight }
        });
      }
      console.log('Trip data seeded successfully!');
    }
  } catch (err) {
    console.error('Error seeding trip data:', err);
  }
}

app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  await ensureTripData();
});
