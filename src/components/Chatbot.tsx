import { useState, useRef, useEffect } from 'react';
import { X, Send, Trash2, Loader2, Bot } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { chatbotService, type ChatMessage } from '@/services/chatbot';
import { useChatbot } from '@/contexts/ChatbotContext';
import { cn } from '@/lib/utils';

export function Chatbot() {
  const { isOpen, toggleChatbot, closeChatbot } = useChatbot();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessageContent = inputMessage.trim();
    setInputMessage('');
    setIsLoading(true);

    try {
      await chatbotService.sendMessage(userMessageContent);
      setMessages(chatbotService.getHistory());
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleClearHistory = () => {
    chatbotService.clearHistory();
    setMessages([]);
  };

  const handleSuggestedQuestion = async (question: string) => {
    if (isLoading) return;

    setIsLoading(true);

    try {
      await chatbotService.sendMessage(question);
      setMessages(chatbotService.getHistory());
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTimestamp = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }).format(date);
  };

  // Suggested questions for quick access
  const suggestedQuestions = [
    "What is Xandeum?",
    "How do pNodes work?",
    "What are XAND tokens?",
    "Tell me about tokenomics",
    "What's the roadmap?",
    "How can developers integrate?",
    "What are the use cases?",
    "Tell me about achievements",
  ];

  return (
    <>
      {/* Floating Action Button */}
      <Button
        onClick={toggleChatbot}
        className={cn(
          "fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-50",
          "bg-primary hover:bg-primary/90 text-primary-foreground",
          "transition-all duration-300",
          isOpen && "scale-0 opacity-0"
        )}
        title="Open XAN Assistant"
      >
        <Bot className="h-6 w-6" />
      </Button>

      {/* Chat Window */}
      <div
        className={cn(
          "fixed bottom-6 right-6 z-50",
          "w-[380px] max-w-[calc(100vw-3rem)]",
          "transition-all duration-300 ease-in-out origin-bottom-right",
          isOpen ? "scale-100 opacity-100" : "scale-0 opacity-0 pointer-events-none"
        )}
      >
        <div className="h-[600px] max-h-[calc(100vh-8rem)] rounded-xl border border-border bg-background shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border bg-primary/5">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
              XAN
            </div>
            <div>
              <h3 className="font-semibold text-sm">XAN</h3>
              <p className="text-xs text-muted-foreground">Your Xandeum AI Assistant</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearHistory}
              className="h-8 w-8 p-0"
              title="Clear conversation"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={closeChatbot}
              className="h-8 w-8 p-0"
              title="Close chat"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Messages */}
        <ScrollArea ref={scrollAreaRef} className="flex-1 p-4">
          <div className="space-y-4">
            {messages.length === 0 && (
              <div className="text-center py-6 text-muted-foreground">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3 font-bold text-primary text-xl">
                  XAN
                </div>
                <p className="text-sm font-medium mb-1">Welcome to XAN!</p>
                <p className="text-xs mb-4">Ask me about Xandeum pNodes, storage, or anything else.</p>

                {/* Suggested Questions */}
                <div className="mt-6 space-y-2">
                  <p className="text-xs font-semibold text-foreground mb-3">Quick Questions:</p>
                  <div className="grid grid-cols-1 gap-2">
                    {suggestedQuestions.slice(0, 6).map((question, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        onClick={() => handleSuggestedQuestion(question)}
                        disabled={isLoading}
                        className="text-xs h-auto py-2 px-3 text-left justify-start hover:bg-primary/10 hover:text-primary hover:border-primary transition-colors"
                      >
                        {question}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex gap-2",
                  message.role === 'user' ? "justify-end" : "justify-start"
                )}
              >
                {message.role === 'assistant' && (
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 font-semibold text-primary text-xs">
                    XAN
                  </div>
                )}
                <div
                  className={cn(
                    "rounded-lg px-4 py-2 max-w-[75%]",
                    message.role === 'user'
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-foreground"
                  )}
                >
                  <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
                  <p
                    className={cn(
                      "text-xs mt-1",
                      message.role === 'user'
                        ? "text-primary-foreground/70"
                        : "text-muted-foreground"
                    )}
                  >
                    {formatTimestamp(message.timestamp)}
                  </p>
                </div>
                {message.role === 'user' && (
                  <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0 text-primary-foreground font-semibold text-sm">
                    U
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-2 justify-start">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 font-semibold text-primary text-xs">
                  XAN
                </div>
                <div className="rounded-lg px-4 py-2 bg-muted">
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                    <span className="text-sm text-muted-foreground">Thinking...</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Input */}
        <div className="p-4 border-t border-border bg-muted/20">
          {/* Quick suggestion chips - shown when there are messages */}
          {messages.length > 0 && (
            <div className="mb-3 flex gap-1.5 flex-wrap">
              {suggestedQuestions.slice(0, 4).map((question, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestedQuestion(question)}
                  disabled={isLoading}
                  className="text-xs px-2.5 py-1 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed border border-primary/20"
                >
                  {question}
                </button>
              ))}
            </div>
          )}

          <div className="flex gap-2">
            <Input
              ref={inputRef}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Ask about Xandeum..."
              className="flex-1"
              disabled={isLoading}
            />
            <Button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isLoading}
              size="sm"
              className="px-3"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            Powered by AI • Press Enter to send
          </p>
        </div>
      </div>
    </div>
    </>
  );
}
