import { useState } from "react";

interface AiAssistantProps {
  onChatClick: () => void;
}

export default function AiAssistant({ onChatClick }: AiAssistantProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="relative flex justify-center lg:justify-end animate-slide-in-right">
      <div 
        className="relative cursor-pointer"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={onChatClick}
        data-testid="ai-assistant"
      >
        {/* AI Assistant */}
        <div className="ai-assistant animate-float w-80 h-96 bg-black rounded-2xl relative overflow-hidden border border-primary/30">
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-secondary/10 to-accent/20"></div>
          
          {/* Assistant Avatar */}
          <div className="relative z-10 flex flex-col items-center justify-center h-full p-6">
            <div className="w-32 h-32 bg-gradient-to-br from-primary to-secondary rounded-full mb-6 flex items-center justify-center border-4 border-white/20 shadow-2xl">
              <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm">
                <i className="fas fa-robot text-3xl text-white"></i>
              </div>
            </div>
            
            <div className="text-center space-y-3">
              <h3 className="text-xl font-bold text-white">Sua Assistente AI</h3>
              <p className="text-sm text-white/80 leading-relaxed px-4">
                Especialista em refinamento de banheiros
              </p>
              
              <div className="flex items-center justify-center space-x-2 mt-4">
                <div className="w-2 h-2 bg-secondary rounded-full animate-pulse"></div>
                <span className="text-xs text-secondary font-medium">Online agora</span>
              </div>
            </div>
          </div>
          
          {/* Floating elements */}
          <div className="absolute top-4 right-4 bg-secondary/20 backdrop-blur-sm px-3 py-1 rounded-full border border-secondary/30">
            <span className="text-xs text-secondary font-medium">AI ⚡</span>
          </div>
        </div>
        
        {/* Chat Bubble */}
        <div className={`chat-bubble absolute -left-8 top-16 max-w-xs transition-all duration-300 ${
          isHovered ? 'opacity-100 transform scale-105' : 'opacity-90'
        }`}>
          <p className="font-medium">Oi! Pronta para transformar seu banheiro? Converse comigo!</p>
        </div>
        
        {/* Floating Elements */}
        <div className="absolute -top-4 -right-4 bg-secondary text-secondary-foreground px-3 py-1 rounded-full text-sm font-medium animate-pulse">
          INSTANT QUOTE 🏠
        </div>

      </div>
    </div>
  );
}
