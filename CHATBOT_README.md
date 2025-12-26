# XAN - Xandeum AI Assistant

## Overview

The Xandeum pNode Analytics dashboard includes XAN, an AI-powered chatbot assistant that can answer questions about Xandeum, pNodes, and help users navigate the platform. XAN maintains conversation context per user, allowing for natural, multi-turn conversations.

## Features

- **💬 Interactive Chat Interface**: Clean, modern chat UI with XAN branding
- **🎨 Theme-Aware**: Automatically adapts to light/dark mode
- **⚡ Real-time Responses**: Instant communication with the AI backend
- **🧠 Contextual Conversations**: Backend maintains conversation history per user IP
- **🗑️ Clear History**: Reset conversation at any time (clears local display)
- **📱 Responsive Design**: Works seamlessly on desktop and mobile
- **⌨️ Keyboard Shortcuts**: Press Enter to send messages
- **🔒 Secure**: API keys kept on backend, automatic IP detection

## Quick Start

### 1. Enable the Chatbot

Set the following in your `.env` file:

```bash
VITE_ENABLE_CHATBOT=true
```

### 2. Configure Backend Endpoint

Point to your chatbot API backend:

```bash
VITE_CHATBOT_ENDPOINT=http://your-backend.com/api/chat
# or for local development:
VITE_CHATBOT_ENDPOINT=http://localhost:3000/api/chat
```

### 3. Restart Development Server

```bash
npm run dev
```

## Using XAN

1. **Open Chat**: Click the floating chat button in the bottom-right corner
2. **Ask Questions**: Type your question and press Enter or click Send
3. **View Responses**: XAN will respond in real-time with context from your conversation
4. **Clear History**: Click the trash icon to clear the local display (backend history persists)
5. **Close Chat**: Click the X button to minimize the chat window

**Note:** XAN remembers your conversation based on your IP address, so you can continue where you left off even after closing the chat window.

## Example Questions

The chatbot can help with questions like:

- "What is Xandeum?"
- "How do pNodes work?"
- "What does the storage capacity metric mean?"
- "How can I monitor node performance?"
- "What regions have the most nodes?"
- "Explain the network analytics charts"
- "How do I export data from the dashboard?"

## Backend Setup

You need to set up a backend API endpoint that:
1. Receives user IP and question
2. Maintains conversation history per IP address
3. Manages AI context and prompts
4. Returns XAN's responses

See [CHATBOT_API.md](./CHATBOT_API.md) for detailed documentation and complete examples.

### Quick Backend Example (Node.js + OpenAI + In-Memory Storage)

```javascript
import express from 'express';
import OpenAI from 'openai';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const sessions = new Map(); // Use Redis/MongoDB in production

const SYSTEM_PROMPT = 'You are XAN, a helpful AI assistant for Xandeum...';

app.post('/api/chat', async (req, res) => {
  try {
    const { user_ip, question } = req.body;

    // Get or create session
    if (!sessions.has(user_ip)) {
      sessions.set(user_ip, { history: [], lastActivity: Date.now() });
    }
    const session = sessions.get(user_ip);

    // Add user question
    session.history.push({ role: 'user', content: question });

    // Build messages with system prompt
    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...session.history
    ];

    // Call OpenAI
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages,
    });

    const answer = completion.choices[0].message.content;

    // Add response to history
    session.history.push({ role: 'assistant', content: answer });

    res.json({
      message: answer,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(3000, () => {
  console.log('XAN API running on port 3000');
});
```

**Important:** This example uses in-memory storage. For production, use Redis or MongoDB to persist conversations.

## Configuration Options

### Frontend Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `VITE_ENABLE_CHATBOT` | Enable/disable XAN | `false` | Yes |
| `VITE_CHATBOT_ENDPOINT` | Backend API URL | `/api/chat` | Yes |

**Note:** All sensitive configuration (API keys, AI model, system prompt) is handled on the backend for security.

### Backend Configuration

Configure these in your backend server:

- **System Prompt**: Define XAN's personality and knowledge about Xandeum
- **AI Model**: Choose which AI model to use (gpt-3.5-turbo, gpt-4, claude-3, etc.)
- **Session Storage**: Use Redis, MongoDB, or another database for persistence
- **Session Timeout**: How long to keep conversation history (recommended: 1 hour)

## Customization

### Styling

The chatbot is fully theme-aware and uses Tailwind CSS. To customize colors, edit your theme variables in `src/index.css`:

```css
:root {
  --primary: 172 66% 50%; /* Chatbot accent color */
}
```

### Behavior

Modify the chatbot service in `src/services/chatbot.ts` to customize:
- Message processing
- Error handling
- Conversation history management
- API request format

### UI Components

Edit `src/components/Chatbot.tsx` to customize:
- Chat window size and position
- Message bubble styling
- Animations and transitions
- Input controls

## Architecture

```
┌─────────────────┐
│   Frontend      │
│  (React App)    │
│                 │
│  ┌───────────┐  │
│  │ Chatbot   │  │
│  │ Component │  │
│  └─────┬─────┘  │
│        │        │
└────────┼────────┘
         │
         │ HTTP POST
         │ /api/chat
         │
┌────────▼────────┐
│   Backend       │
│  (Your Server)  │
│                 │
│  ┌───────────┐  │
│  │ API Route │  │
│  └─────┬─────┘  │
│        │        │
└────────┼────────┘
         │
         │ API Call
         │
┌────────▼────────┐
│   AI Service    │
│  (OpenAI/etc)   │
└─────────────────┘
```

## Security Best Practices

1. **Never expose API keys in frontend code** - All AI service API keys (OpenAI, Anthropic, etc.) must be kept on the backend
2. **Implement rate limiting** - Prevent abuse by limiting requests per IP address
3. **Validate inputs** - Sanitize user messages before processing
4. **Use HTTPS** - Encrypt data in transit
5. **Monitor usage** - Track API calls, costs, and suspicious activity
6. **Content filtering** - Implement safeguards against inappropriate content
7. **Session management** - Implement timeouts and cleanup for old conversations
8. **Input validation** - Validate user_ip format and question length on backend

## Troubleshooting

### Chatbot doesn't appear

1. Check that `VITE_ENABLE_CHATBOT=true` in your `.env` file
2. Restart your development server after changing environment variables
3. Clear browser cache and reload

### Messages not sending

1. Verify `VITE_CHATBOT_ENDPOINT` is correct
2. Check browser console for errors
3. Ensure your backend is running and accessible
4. Verify CORS is properly configured on your backend

### API errors

1. Check API key is valid if using authentication
2. Verify backend endpoint is returning correct response format
3. Check network tab in browser DevTools for error details
4. Review backend logs for detailed error messages

## Development

### Running locally with mock responses

For testing without a backend, you can modify the chatbot service to return mock responses:

```typescript
// In src/services/chatbot.ts
async sendMessage(message: string): Promise<ChatMessage> {
  // Mock response for development
  if (import.meta.env.DEV) {
    const mockResponse: ChatMessage = {
      id: `assistant-${Date.now()}`,
      role: 'assistant',
      content: `You asked: "${message}". This is a mock response for development.`,
      timestamp: new Date(),
    };
    this.conversationHistory.push(mockResponse);
    return mockResponse;
  }
  // ... rest of the code
}
```

## Support

For issues, questions, or feature requests related to the chatbot:

1. Check [CHATBOT_API.md](./CHATBOT_API.md) for backend implementation details
2. Review this README for configuration options
3. Check browser console and network tab for errors
4. Contact the Xandeum development team

## Future Enhancements

Planned features for future releases:

- [ ] Voice input support
- [ ] Multi-language support
- [ ] Suggested questions/prompts
- [ ] Export chat history
- [ ] Rich message formatting (markdown, code blocks)
- [ ] Contextual help based on current page
- [ ] Integration with Xandeum documentation
- [ ] Real-time node data queries via chatbot

## License

Part of the Xandeum pNode Analytics platform.
