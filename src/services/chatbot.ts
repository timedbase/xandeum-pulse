export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export type AIProvider = 'openai' | 'gemini' | 'local';

// System prompt that defines XAN's personality and knowledge
const SYSTEM_PROMPT = `You are XAN, the Xandeum AI Assistant. You are a helpful, knowledgeable, and friendly AI assistant specialized in everything about Xandeum - the decentralized storage network built on Solana.

## About Xandeum

Xandeum is a groundbreaking decentralized storage network that provides exabyte-scale storage infrastructure for the Solana ecosystem. It solves the critical challenge of storing large amounts of data on blockchain by creating a distributed storage layer that's fast, affordable, and scalable.

## Core Components

**pNodes (Provider Nodes):**
- The backbone of Xandeum's storage infrastructure
- Distributed servers operated by network participants
- Provide storage capacity and earn XAND token rewards
- Monitored for uptime, storage capacity, utilization, and performance

**XAND Token:**
- Native cryptocurrency token of the Xandeum network
- Tradeable digital asset with market value
- Used for payments, governance, and network economics
- Foundation of the Xandeum tokenomics model

**XAND Credits:**
- Internal reward units earned by pNode operators
- Represent XAND tokens earned for providing storage services
- Accumulated based on uptime, storage contribution, and performance
- Displayed in the Pulse dashboard as "Credits"

**Xandeum Pulse Dashboard:**
- Real-time monitoring and analytics platform
- Tracks all pNodes and network statistics
- Provides charts, comparisons, and data exports
- Updates every 30 seconds with live information

## Network Architecture

- Built on Solana blockchain for speed and scalability
- Geographic distribution across global regions (US, EU, Asia-Pacific, etc.)
- Decentralized architecture ensures data redundancy and availability
- Currently running on Solana devnet for testing and development

## Key Metrics

**Node Metrics:**
- Uptime: Reliability percentage (99%+ is excellent)
- Storage Capacity: Total available space (measured in GB/TB)
- Storage Utilization: Percentage of capacity in use
- Credits: XAND credits earned by the pNode for providing storage
- Region: Geographic location for optimal data access
- Version: Software version running on the node

**Network Metrics:**
- Total Nodes: Number of pNodes in the network
- Online Nodes: Currently operational nodes
- Total Storage: Combined capacity across all nodes
- Network Uptime: Average uptime across all nodes

## Use Cases

- Storing large datasets for Solana dApps
- NFT metadata and media storage
- DeFi protocol data archives
- Gaming assets and user-generated content
- Scientific data and research archives
- Enterprise document storage

## For Developers

- API access to storage network
- SDK for integration with Solana dApps
- Flexible pricing models based on storage needs
- High-performance data retrieval
- Built-in redundancy and fault tolerance

## For Node Operators

- Earn XAND tokens by running pNodes
- Contribute to decentralized infrastructure
- Flexible hardware requirements
- Real-time monitoring and analytics
- Community support and documentation

## Important Distinction

**XAND vs Credits:**
- When users ask about "XAND", they refer to the XAND token (the cryptocurrency)
- "Credits" specifically refer to XAND credits earned by pNodes (internal rewards)
- Only use "credits" when explicitly mentioned or when discussing pNode rewards in the dashboard
- Default to "XAND token" or "XAND" when discussing the cryptocurrency

## Your Role

You should:
- Answer questions about ANY aspect of Xandeum, not just pNodes
- Explain the technology, economics, use cases, and ecosystem
- Help users understand how to use the network
- Guide developers on integration
- Assist node operators with setup and optimization
- Provide clear, accurate, and friendly responses
- Clearly distinguish between XAND tokens and XAND credits
- Admit when you need more information rather than guessing

Keep responses concise (2-4 sentences) unless more detail is requested. Be enthusiastic about Xandeum's mission to make decentralized storage accessible to everyone.`;

// Knowledge base for answering common questions (fallback)
const KNOWLEDGE_BASE = {
  greeting: [
    "Hello! I'm XAN, your Xandeum AI assistant. I can help you with everything about Xandeum - from the network architecture and pNodes to use cases, token economics, and developer integration. What would you like to know?",
    "Hi there! I'm XAN, the Xandeum assistant. Ask me about the decentralized storage network, XAND tokens, pNode operations, developer tools, or how Xandeum is transforming data storage on Solana!",
    "Welcome! I'm XAN. I'm here to help you understand Xandeum's ecosystem - whether you're a developer looking to integrate, a node operator wanting to earn XAND, or just curious about decentralized storage. How can I assist?",
  ],

  xandeum: [
    "Xandeum is a groundbreaking decentralized storage network built on Solana that provides exabyte-scale infrastructure for dApps. It solves blockchain's data storage challenge by creating a distributed, fast, and affordable storage layer powered by pNodes worldwide.\n\n📚 Learn more: https://www.xandeum.network/docs",
    "Xandeum revolutionizes data storage for Solana by combining blockchain technology with distributed storage. Developers get affordable, scalable storage for their dApps, while node operators earn XAND tokens for providing storage capacity - creating a self-sustaining ecosystem.\n\n🌐 Official site: https://www.xandeum.network",
  ],

  pnode: [
    "pNodes (Provider Nodes) are the backbone of Xandeum's storage network. They're distributed servers that provide storage capacity, earn XAND credits (which represent XAND tokens earned), and maintain the network's decentralized infrastructure.\n\n🔧 Setup guide: https://pnodes.xandeum.network",
    "A pNode is a Provider Node that contributes storage capacity to the Xandeum network. Operators run pNodes to earn XAND tokens (tracked as credits in the dashboard) while helping to create a decentralized storage layer for Solana applications.\n\n📖 Documentation: https://www.xandeum.network/docs",
  ],

  metrics: [
    "Xandeum Pulse tracks several key metrics: Uptime (node reliability), Storage Capacity (total space), Storage Utilization (percentage used), Credits (XAND rewards), Region (location), and Version (software). These help monitor network health and performance.",
    "The dashboard shows important metrics like node uptime (99%+ is excellent), storage capacity and utilization, XAND credits earned, geographic distribution, and version information. You can use these to assess network health and individual node performance.",
  ],

  uptime: [
    "Uptime measures how reliably a pNode stays online. 99%+ uptime is excellent, 95-99% is good, 90-95% is fair, and below 90% indicates the node may have connectivity issues. Higher uptime generally leads to more XAND credits.",
    "Node uptime indicates reliability. The higher the uptime percentage, the more dependable the node is for storing data. Top-performing nodes maintain 99%+ uptime and earn maximum XAND rewards.",
  ],

  storage: [
    "Storage metrics include Capacity (total space available, measured in GB/TB) and Utilization (percentage currently used). Healthy utilization is under 70%, 70-90% is a warning zone, and over 90% is critical and may need attention.",
    "pNodes provide varying storage capacities, typically measured in terabytes. The network monitors both total capacity and how much is being used (utilization) to ensure there's always sufficient space available.",
  ],

  credits: [
    "XAND credits are internal reward units earned by pNodes for providing storage services. Credits represent XAND tokens earned and are displayed in the Pulse dashboard. Higher-performing nodes with better uptime and capacity earn more credits over time.",
    "Credits shown in the dashboard track how many XAND tokens a pNode has earned. They're accumulated based on uptime, storage contribution, and service quality. The more reliable your node, the more XAND credits (tokens) it earns.",
  ],

  regions: [
    "pNodes are distributed globally across regions like US-East, US-West, EU-Central, Asia-Pacific, and more. Geographic distribution ensures data redundancy, improves access speeds, and strengthens network resilience.",
    "The network spans multiple geographic regions to provide redundancy and faster access for users worldwide. You can filter nodes by region in the dashboard to see distribution and regional performance.",
  ],

  dashboard: [
    "The Xandeum Pulse dashboard provides real-time monitoring of all pNodes. You can view network statistics, search and filter nodes, compare performance, analyze trends with charts, and export data for further analysis.",
    "Use the dashboard to monitor network health, track individual pNodes, view analytics charts, compare node performance, and export data. The interface updates every 30 seconds with real-time information.",
  ],

  help: [
    "I can help you with everything about Xandeum! Topics include: the decentralized storage network architecture, pNode operations and metrics, XAND token economics, use cases (NFTs, gaming, DeFi), developer integration, the Pulse dashboard, and how to start earning as a node operator. What interests you?\n\n🔗 Resources:\n• Docs: https://www.xandeum.network/docs\n• pNode Setup: https://pnodes.xandeum.network\n• Discord: https://discord.gg/uqRSmmM5m",
    "Feel free to ask me about any aspect of Xandeum: How the storage network works, setting up pNodes, earning XAND rewards, integrating storage into your dApp, network statistics, use cases, Solana integration, or navigating the dashboard. I'm here to help!\n\n📚 Learn more:\n• Website: https://www.xandeum.network\n• Documentation: https://www.xandeum.network/docs\n• Community: https://discord.gg/uqRSmmM5m",
  ],

  token: [
    "XAND is Xandeum's native cryptocurrency token that powers the network's economy. Node operators earn XAND tokens (shown as credits in the dashboard) for providing storage capacity. The token is used for network transactions, governance, and rewarding reliable storage providers.\n\n💰 Learn more: https://www.xandeum.network/xand-tokenomics",
    "The XAND token is a tradeable digital asset with market value. Operators earn XAND by running high-performance pNodes, with rewards based on uptime and storage contribution. It creates economic incentives for a reliable, decentralized storage network.\n\n📊 Tokenomics: https://www.xandeum.network/xand-tokenomics",
  ],

  usecases: [
    "Xandeum enables powerful use cases across Solana: NFT projects store metadata and media, gaming dApps store assets and user data, DeFi protocols archive transaction history, and enterprises use it for document storage. Any Solana dApp needing scalable storage can leverage Xandeum.",
    "From NFT galleries to gaming worlds to DeFi platforms, Xandeum provides the storage backbone. It's perfect for: large datasets, user-generated content, media files, scientific data, and any application requiring affordable, decentralized storage on Solana.",
  ],

  developers: [
    "Developers can integrate Xandeum through our SDK and API, enabling seamless storage for Solana dApps. You get high-performance data retrieval, built-in redundancy, flexible pricing, and the benefits of decentralization. Perfect for storing NFT assets, game data, or any large datasets.\n\n👨‍💻 Developer docs: https://www.xandeum.network/docs",
    "Xandeum offers developer-friendly tools: SDKs for easy integration, API access to the storage network, flexible pricing models, and comprehensive documentation. You can start storing data on Solana's first exabyte-scale decentralized storage layer today!\n\n🔗 Get started: https://www.xandeum.network/docs",
  ],

  tokenomics: [
    "XAND tokenomics is designed to create sustainable incentives for network participants. Node operators earn XAND for providing storage, while users pay for storage services. The token economics ensure long-term network growth and reward early contributors.\n\n💰 Learn more: https://www.xandeum.network/xand-tokenomics",
    "The XAND token model balances supply and demand through storage rewards and network fees. Token distribution includes allocations for node operators, ecosystem development, and community rewards. This creates a self-sustaining economy for decentralized storage.\n\n📊 Details: https://www.xandeum.network/xand-tokenomics",
  ],

  roadmap: [
    "Xandeum's roadmap outlines the path from devnet to mainnet launch and beyond. Key milestones include network scaling, feature enhancements, ecosystem partnerships, and continuous improvements to storage performance and reliability.\n\n🗺️ View roadmap: https://www.xandeum.network/roadmap",
    "The development roadmap covers multiple phases: initial testnet, beta launch, mainnet deployment, and future innovations. Each phase brings new features, improved scalability, and expanded capabilities for the storage network.\n\n📅 Full timeline: https://www.xandeum.network/roadmap",
  ],

  vision: [
    "Xandeum's vision is to become the foundational storage layer for Solana and beyond - making decentralized storage as accessible and reliable as centralized alternatives. We're building infrastructure that empowers developers and democratizes data storage.\n\n🎯 Our vision: https://www.xandeum.network/vision",
    "We envision a future where decentralized storage is the default choice for blockchain applications. Xandeum aims to provide exabyte-scale capacity, lightning-fast performance, and unmatched reliability - all while maintaining true decentralization and data sovereignty.\n\n🌟 Learn more: https://www.xandeum.network/vision",
  ],

  achievements: [
    "Xandeum has achieved significant milestones including successful devnet launch, growing pNode network, community partnerships, and continuous technological innovations. Each achievement brings us closer to revolutionizing decentralized storage.\n\n🏆 View achievements: https://www.xandeum.network/achievements",
    "Our key accomplishments include launching the pNode network, deploying the Pulse analytics dashboard, establishing partnerships in the Solana ecosystem, and building a vibrant community of node operators and developers.\n\n✨ See milestones: https://www.xandeum.network/achievements",
  ],

  innovation: [
    "Xandeum represents innovation in blockchain storage through its novel approach to distributed data management, economic incentive structures, and seamless Solana integration. We're pioneering the next generation of decentralized infrastructure.\n\n🚀 Innovation eras: https://www.xandeum.network/innovation-eras",
    "Our innovation focuses on solving real challenges: exabyte-scale capacity, sub-second retrieval times, cost-effective storage, and true decentralization. These breakthrough technologies set new standards for blockchain storage.\n\n💡 Learn about our innovations: https://www.xandeum.network/innovation-eras",
  ],

  storagelayer: [
    "The Xandeum storage layer is a sophisticated architecture built on distributed pNodes, intelligent data routing, redundancy mechanisms, and Solana blockchain integration. It provides fast, reliable, and scalable storage for any application.\n\n🏗️ Architecture details: https://www.xandeum.network/storage-layer",
    "Our storage layer combines blockchain technology with distributed systems to create a robust infrastructure. Features include automatic data replication, geographic distribution, fault tolerance, and cryptographic security.\n\n🔧 Technical overview: https://www.xandeum.network/storage-layer",
  ],
};

class ChatbotService {
  private conversationHistory: ChatMessage[] = [];
  private provider: AIProvider;
  private openaiApiKey: string | null;
  private geminiApiKey: string | null;

  constructor() {
    // Get API keys from environment
    this.openaiApiKey = import.meta.env.VITE_OPENAI_API_KEY || null;
    this.geminiApiKey = import.meta.env.VITE_GEMINI_API_KEY || null;

    // Determine provider based on available API keys
    if (this.openaiApiKey) {
      this.provider = 'openai';
      console.log('ChatBot: Using OpenAI (ChatGPT) provider');
    } else if (this.geminiApiKey) {
      this.provider = 'gemini';
      console.log('ChatBot: Using Google Gemini provider');
    } else {
      this.provider = 'local';
      console.log('ChatBot: Using local fallback (no API keys configured)');
    }
  }

  // Call OpenAI ChatGPT API
  private async callOpenAI(userMessage: string): Promise<string> {
    if (!this.openaiApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.openaiApiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: SYSTEM_PROMPT,
          },
          ...this.conversationHistory.map(msg => ({
            role: msg.role,
            content: msg.content,
          })),
          {
            role: 'user',
            content: userMessage,
          },
        ],
        temperature: 0.7,
        max_tokens: 300,
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(`OpenAI API error: ${response.status} - ${error.error?.message || response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || 'Sorry, I could not generate a response.';
  }

  // Call Google Gemini API
  private async callGemini(userMessage: string): Promise<string> {
    if (!this.geminiApiKey) {
      throw new Error('Gemini API key not configured');
    }

    // Build conversation context
    const conversationContext = this.conversationHistory
      .map(msg => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
      .join('\n');

    const fullPrompt = `${SYSTEM_PROMPT}\n\nConversation History:\n${conversationContext}\n\nUser: ${userMessage}\n\nAssistant:`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${this.geminiApiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: fullPrompt,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 300,
          },
        }),
      }
    );

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(`Gemini API error: ${response.status} - ${error.error?.message || response.statusText}`);
    }

    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || 'Sorry, I could not generate a response.';
  }

  // Local fallback response generation
  private async generateLocalResponse(userMessage: string): Promise<string> {
    const lowerMessage = userMessage.toLowerCase();

    // Greeting detection
    if (this.isGreeting(lowerMessage)) {
      return this.getRandomResponse(KNOWLEDGE_BASE.greeting);
    }

    // Topic detection
    if (this.containsKeywords(lowerMessage, ['xandeum', 'what is xandeum', 'about xandeum'])) {
      return this.getRandomResponse(KNOWLEDGE_BASE.xandeum);
    }

    if (this.containsKeywords(lowerMessage, ['pnode', 'provider node', 'what is pnode', 'what are pnodes'])) {
      return this.getRandomResponse(KNOWLEDGE_BASE.pnode);
    }

    if (this.containsKeywords(lowerMessage, ['metric', 'metrics', 'measure', 'track', 'monitor'])) {
      return this.getRandomResponse(KNOWLEDGE_BASE.metrics);
    }

    if (this.containsKeywords(lowerMessage, ['uptime', 'online', 'reliability', 'available'])) {
      return this.getRandomResponse(KNOWLEDGE_BASE.uptime);
    }

    if (this.containsKeywords(lowerMessage, ['storage', 'capacity', 'utilization', 'space'])) {
      return this.getRandomResponse(KNOWLEDGE_BASE.storage);
    }

    if (this.containsKeywords(lowerMessage, ['credit', 'credits', 'reward', 'rewards', 'earn', 'xand token'])) {
      return this.getRandomResponse(KNOWLEDGE_BASE.credits);
    }

    if (this.containsKeywords(lowerMessage, ['region', 'regions', 'location', 'geographic', 'where'])) {
      return this.getRandomResponse(KNOWLEDGE_BASE.regions);
    }

    if (this.containsKeywords(lowerMessage, ['dashboard', 'interface', 'how to use', 'navigate', 'pulse'])) {
      return this.getRandomResponse(KNOWLEDGE_BASE.dashboard);
    }

    if (this.containsKeywords(lowerMessage, ['token', 'xand', 'economics', 'tokenomics', 'price'])) {
      return this.getRandomResponse(KNOWLEDGE_BASE.token);
    }

    if (this.containsKeywords(lowerMessage, ['use case', 'usecase', 'application', 'nft', 'gaming', 'defi', 'what can'])) {
      return this.getRandomResponse(KNOWLEDGE_BASE.usecases);
    }

    if (this.containsKeywords(lowerMessage, ['developer', 'develop', 'integrate', 'api', 'sdk', 'build'])) {
      return this.getRandomResponse(KNOWLEDGE_BASE.developers);
    }

    if (this.containsKeywords(lowerMessage, ['tokenomics', 'token economics', 'token distribution', 'token model', 'economy'])) {
      return this.getRandomResponse(KNOWLEDGE_BASE.tokenomics);
    }

    if (this.containsKeywords(lowerMessage, ['roadmap', 'timeline', 'milestone', 'phases', 'future', 'when', 'launch'])) {
      return this.getRandomResponse(KNOWLEDGE_BASE.roadmap);
    }

    if (this.containsKeywords(lowerMessage, ['vision', 'mission', 'goal', 'purpose', 'why xandeum'])) {
      return this.getRandomResponse(KNOWLEDGE_BASE.vision);
    }

    if (this.containsKeywords(lowerMessage, ['achievement', 'accomplishment', 'milestone', 'success', 'partnership'])) {
      return this.getRandomResponse(KNOWLEDGE_BASE.achievements);
    }

    if (this.containsKeywords(lowerMessage, ['innovation', 'breakthrough', 'technology', 'advancement', 'era'])) {
      return this.getRandomResponse(KNOWLEDGE_BASE.innovation);
    }

    if (this.containsKeywords(lowerMessage, ['storage layer', 'architecture', 'infrastructure', 'how it works', 'technical'])) {
      return this.getRandomResponse(KNOWLEDGE_BASE.storagelayer);
    }

    if (this.containsKeywords(lowerMessage, ['help', 'what can you do', 'capabilities', 'topics'])) {
      return this.getRandomResponse(KNOWLEDGE_BASE.help);
    }

    // Default response for unrecognized queries
    return "I'm your Xandeum expert! I can help with the storage network, pNodes, XAND tokens, tokenomics, roadmap, vision, use cases, developer integration, and much more. Try asking: 'What is Xandeum?', 'Tell me about tokenomics', 'What's the roadmap?', 'What are the achievements?', or 'How does the storage layer work?'";
  }

  private isGreeting(message: string): boolean {
    const greetings = ['hi', 'hello', 'hey', 'greetings', 'good morning', 'good afternoon', 'good evening'];
    return greetings.some(greeting => message.includes(greeting));
  }

  private containsKeywords(message: string, keywords: string[]): boolean {
    return keywords.some(keyword => message.includes(keyword));
  }

  private getRandomResponse(responses: string[]): string {
    return responses[Math.floor(Math.random() * responses.length)];
  }

  async sendMessage(message: string): Promise<ChatMessage> {
    // Add user message to history
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: message,
      timestamp: new Date(),
    };
    this.conversationHistory.push(userMessage);

    try {
      let responseContent: string;

      // Try to use configured AI provider
      if (this.provider === 'openai') {
        try {
          responseContent = await this.callOpenAI(message);
        } catch (error) {
          console.error('OpenAI API error, falling back to local:', error);
          responseContent = await this.generateLocalResponse(message);
        }
      } else if (this.provider === 'gemini') {
        try {
          responseContent = await this.callGemini(message);
        } catch (error) {
          console.error('Gemini API error, falling back to local:', error);
          responseContent = await this.generateLocalResponse(message);
        }
      } else {
        // Use local responses
        await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));
        responseContent = await this.generateLocalResponse(message);
      }

      // Add assistant response to history
      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: responseContent,
        timestamp: new Date(),
      };
      this.conversationHistory.push(assistantMessage);

      return assistantMessage;
    } catch (error) {
      console.error('Chatbot error:', error);

      // Return error message
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: 'Sorry, I encountered an error processing your message. Please try again!',
        timestamp: new Date(),
      };
      this.conversationHistory.push(errorMessage);

      return errorMessage;
    }
  }

  getHistory(): ChatMessage[] {
    return this.conversationHistory;
  }

  clearHistory(): void {
    this.conversationHistory = [];
  }

  getProvider(): AIProvider {
    return this.provider;
  }

  // Allow switching providers at runtime
  setProvider(provider: AIProvider, apiKey?: string): void {
    if (provider === 'openai' && apiKey) {
      this.openaiApiKey = apiKey;
    } else if (provider === 'gemini' && apiKey) {
      this.geminiApiKey = apiKey;
    }
    this.provider = provider;
    console.log(`ChatBot: Switched to ${provider} provider`);
  }
}

export const chatbotService = new ChatbotService();
