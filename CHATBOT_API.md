# Xandeum Chatbot API Documentation

## Overview

The Xandeum chatbot (XAN) requires a backend API endpoint to process user questions and generate responses. The backend is responsible for maintaining conversation history per user IP and managing the AI context.

## Endpoint

**POST** `/api/chat`

## Request Format

```json
{
  "user_ip": "192.168.1.100",
  "question": "What is Xandeum?"
}
```

### Request Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `user_ip` | String | Yes | User's IP address (automatically detected by frontend) |
| `question` | String | Yes | The user's question or message |

**Note:** The frontend automatically detects and sends the user's IP address. The backend should maintain conversation history per IP address.

## Response Format

```json
{
  "message": "Xandeum is a decentralized storage layer for Solana that provides scalable storage solutions for dApps through a network of persistent nodes (pNodes).",
  "timestamp": "2025-12-20T10:30:00Z"
}
```

### Response Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `message` | String | Yes | XAN's response (alias: `answer` or `response`) |
| `timestamp` | String | No | ISO 8601 timestamp of the response |

## Error Response

```json
{
  "error": "Invalid API key",
  "code": 401,
  "message": "Authentication failed"
}
```

## Authentication

All API authentication is handled on the backend. If you need to secure your chatbot endpoint:

- Use backend middleware to verify requests
- Implement rate limiting per IP address
- Consider session-based authentication if needed
- Use HTTPS to encrypt traffic

**Note:** API keys for AI services (OpenAI, Anthropic, etc.) should NEVER be exposed in the frontend. Always keep them on the backend.

## Backend Responsibilities

The backend must:

1. **Maintain conversation history per user IP**
   - Store messages in a database or cache (Redis, MongoDB, etc.)
   - Track conversation context for each unique IP
   - Implement session timeout/cleanup for old conversations

2. **Manage AI context**
   - Include system prompt defining XAN's personality and knowledge
   - Build conversation history from stored messages
   - Send complete context to AI service

3. **Handle AI service communication**
   - Call OpenAI, Anthropic, or custom AI service
   - Manage API keys securely on the backend
   - Handle rate limiting and errors

## Implementation Examples

### Example 1: OpenAI with Redis Session Storage (Node.js/Express)

```javascript
import express from 'express';
import OpenAI from 'openai';
import Redis from 'ioredis';

const app = express();
const redis = new Redis();
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const SYSTEM_PROMPT = `You are XAN, a helpful AI assistant for Xandeum, a decentralized storage layer for Solana.

About Xandeum:
- Xandeum provides scalable storage solutions for Solana dApps
- pNodes (Persistent Nodes) are the core infrastructure that store data
- The network operates on Solana devnet (currently v0.6)
- Nodes are distributed globally across multiple regions

Always be helpful, concise, and accurate.`;

app.post('/api/chat', async (req, res) => {
  try {
    const { user_ip, question } = req.body;

    // Get conversation history from Redis
    const historyKey = `chat:${user_ip}`;
    const historyJson = await redis.get(historyKey);
    const history = historyJson ? JSON.parse(historyJson) : [];

    // Add user question to history
    history.push({ role: 'user', content: question });

    // Build messages for OpenAI (include system prompt + history)
    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...history
    ];

    // Call OpenAI
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages,
    });

    const answer = completion.choices[0].message.content;

    // Add assistant response to history
    history.push({ role: 'assistant', content: answer });

    // Store updated history in Redis (expire after 1 hour)
    await redis.setex(historyKey, 3600, JSON.stringify(history));

    res.json({
      message: answer,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

app.listen(3000);
```

### Example 2: Anthropic Claude with MongoDB (Node.js/Express)

```javascript
import express from 'express';
import Anthropic from '@anthropic-ai/sdk';
import { MongoClient } from 'mongodb';

const app = express();
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

const mongoClient = new MongoClient(process.env.MONGODB_URI);
const db = mongoClient.db('xandeum_chat');
const sessions = db.collection('sessions');

const SYSTEM_PROMPT = 'You are XAN, a helpful AI assistant for Xandeum...';

app.post('/api/chat', async (req, res) => {
  try {
    const { user_ip, question } = req.body;

    // Get conversation from MongoDB
    let session = await sessions.findOne({ user_ip });
    if (!session) {
      session = { user_ip, history: [], created_at: new Date() };
    }

    // Add user question
    session.history.push({ role: 'user', content: question });

    // Call Claude
    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: session.history,
    });

    const answer = message.content[0].text;

    // Add assistant response
    session.history.push({ role: 'assistant', content: answer });

    // Update session in MongoDB
    await sessions.updateOne(
      { user_ip },
      {
        $set: {
          history: session.history,
          updated_at: new Date()
        }
      },
      { upsert: true }
    );

    res.json({
      message: answer,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

app.listen(3000);
```

### Example 3: Custom AI with In-Memory Cache (5-Minute Session Timeout)

```javascript
import express from 'express';
import OpenAI from 'openai';

const app = express();
app.use(express.json());

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Simple in-memory storage (use Redis/MongoDB in production)
const sessions = new Map();

const SYSTEM_PROMPT = 'You are XAN, a helpful AI assistant for Xandeum...';
const SESSION_TIMEOUT = 5 * 60 * 1000; // 5 minutes in milliseconds

// Clean up inactive sessions every minute
setInterval(() => {
  const now = Date.now();
  let cleanedCount = 0;

  for (const [ip, session] of sessions.entries()) {
    if (now - session.lastActivity > SESSION_TIMEOUT) {
      sessions.delete(ip);
      cleanedCount++;
      console.log(`Session expired for IP: ${ip}`);
    }
  }

  if (cleanedCount > 0) {
    console.log(`Cleaned up ${cleanedCount} expired sessions. Active sessions: ${sessions.size}`);
  }
}, 60000); // Run every minute

app.post('/api/chat', async (req, res) => {
  try {
    const { user_ip, question } = req.body;

    // Validate inputs
    if (!user_ip || !question) {
      return res.status(400).json({
        error: 'Bad request',
        message: 'user_ip and question are required'
      });
    }

    if (question.length > 1000) {
      return res.status(400).json({
        error: 'Bad request',
        message: 'Question too long (max 1000 characters)'
      });
    }

    const now = Date.now();

    // Check if session exists and is still valid
    let session = sessions.get(user_ip);

    if (session && (now - session.lastActivity > SESSION_TIMEOUT)) {
      // Session expired, start fresh
      console.log(`Session expired for IP: ${user_ip}, starting new session`);
      sessions.delete(user_ip);
      session = null;
    }

    // Create new session if needed
    if (!session) {
      session = {
        history: [],
        createdAt: now,
        lastActivity: now,
        messageCount: 0
      };
      sessions.set(user_ip, session);
      console.log(`New session created for IP: ${user_ip}`);
    }

    // Add user question
    session.history.push({ role: 'user', content: question });
    session.messageCount++;

    // Build messages with system prompt
    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...session.history
    ];

    // Call OpenAI
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages,
      max_tokens: 500,
      temperature: 0.7,
    });

    const answer = completion.choices[0].message.content;

    // Add response to history
    session.history.push({ role: 'assistant', content: answer });
    session.lastActivity = now;

    console.log(`Message processed for IP: ${user_ip} (${session.messageCount} messages in session)`);

    res.json({
      message: answer,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

// Health check endpoint
app.get('/api/chat/health', (req, res) => {
  res.json({
    status: 'ok',
    activeSessions: sessions.size,
    uptime: process.uptime()
  });
});

app.listen(3000, () => {
  console.log('XAN API running on port 3000');
  console.log(`Session timeout: ${SESSION_TIMEOUT / 1000 / 60} minutes`);
});
```

## Frontend Environment Variables

Configure the chatbot in your `.env` file:

```bash
# Enable/disable chatbot
VITE_ENABLE_CHATBOT=true

# Backend endpoint URL
VITE_CHATBOT_ENDPOINT=http://your-backend.com/api/chat
```

**Note:** All sensitive configuration (API keys, system prompts, AI models) is managed on the backend for security. The frontend only needs to know the endpoint URL.

## CORS Configuration

Ensure your backend allows requests from your frontend domain:

```javascript
import cors from 'cors';

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  methods: ['POST'],
}));
```

## Rate Limiting

Consider implementing rate limiting to prevent abuse:

```javascript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50 // limit each IP to 50 requests per windowMs
});

app.use('/api/chat', limiter);
```

## Testing

You can test your API endpoint using curl:

```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -d '{
    "messages": [
      {"role": "system", "content": "You are a helpful assistant."},
      {"role": "user", "content": "What is Xandeum?"}
    ],
    "model": "gpt-3.5-turbo"
  }'
```

## Security Considerations

1. **API Key Protection**: Never expose your OpenAI/Anthropic API keys in the frontend
2. **Input Validation**: Validate and sanitize all user inputs
3. **Rate Limiting**: Implement rate limiting to prevent abuse
4. **Authentication**: Consider adding user authentication if needed
5. **Content Filtering**: Implement content filtering for inappropriate requests
6. **Logging**: Log all interactions for monitoring and debugging

## Support

For questions or issues with the chatbot integration, please refer to the main Xandeum documentation or contact the development team.
