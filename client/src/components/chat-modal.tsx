import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useWebSocket } from "@/hooks/use-websocket";

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export default function ChatModal({ isOpen, onClose }: ChatModalProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: "Hi! I can help you design your dream bathtub. Want to see what it would look like?",
      timestamp: new Date().toISOString()
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [sessionId] = useState(() => `session-${Date.now()}`);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { sendMessage, lastMessage } = useWebSocket(isOpen);

  useEffect(() => {
    if (lastMessage?.role && 
        lastMessage?.content && 
        lastMessage?.timestamp &&
        (lastMessage.role === 'user' || lastMessage.role === 'assistant')) {
      
      const newMessage: ChatMessage = {
        role: lastMessage.role,
        content: lastMessage.content,
        timestamp: lastMessage.timestamp
      };
      
      setMessages(prev => [...prev, newMessage]);
    }
  }, [lastMessage]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userMessage = {
      role: 'user' as const,
      content: inputValue,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    
    sendMessage({
      type: 'chat',
      sessionId,
      content: inputValue
    });

    setInputValue("");
  };

  const handleFileUpload = () => {
    // Simulate file upload response
    const uploadMessage = {
      role: 'assistant' as const,
      content: "Perfect! I can see your bathtub needs refinishing. Here are some color options: White, Almond, Gray, or Custom. Which would you prefer?",
      timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, uploadMessage]);
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-all duration-300"
      onClick={onClose}
      data-testid="chat-modal-overlay"
    >
      <Card 
        className="glass-effect rounded-xl w-full max-w-md h-96 flex flex-col"
        onClick={(e) => e.stopPropagation()}
        data-testid="chat-modal"
      >
        {/* Chat Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
              <i className="fas fa-robot text-primary-foreground"></i>
            </div>
            <div>
              <h3 className="font-semibold">BathBot AI Designer</h3>
              <p className="text-xs text-muted-foreground">Online now</p>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
            data-testid="button-close-chat"
          >
            <i className="fas fa-times"></i>
          </Button>
        </div>
        
        {/* Chat Messages */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4" data-testid="chat-messages">
          {messages.map((message, index) => (
            <div key={index} className="flex items-start space-x-3">
              {message.role === 'assistant' && (
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                  <i className="fas fa-robot text-xs text-primary-foreground"></i>
                </div>
              )}
              <div className={`rounded-lg p-3 flex-1 ${
                message.role === 'assistant' 
                  ? 'bg-muted' 
                  : 'bg-primary text-primary-foreground ml-auto max-w-[80%]'
              }`}>
                <p className="text-sm">{message.content}</p>
              </div>
              {message.role === 'user' && (
                <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center flex-shrink-0">
                  <i className="fas fa-user text-xs text-secondary-foreground"></i>
                </div>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        
        {/* Quick Actions */}
        <div className="px-4 pb-2">
          <div className="flex justify-center">
            <Button 
              onClick={handleFileUpload}
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
              data-testid="button-upload-photo"
            >
              📷 Upload Photo to Start
            </Button>
          </div>
        </div>
        
        {/* Chat Input */}
        <CardContent className="p-4 border-t border-border">
          <form onSubmit={handleSendMessage} className="flex space-x-2">
            <Input
              type="text"
              placeholder="Type your message..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="flex-1 bg-input border border-border text-sm"
              data-testid="input-chat-message"
            />
            <Button 
              type="submit" 
              size="sm"
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
              data-testid="button-send-message"
            >
              <i className="fas fa-paper-plane text-sm"></i>
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
