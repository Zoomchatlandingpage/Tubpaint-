interface FloatingChatButtonProps {
  onClick: () => void;
}

export default function FloatingChatButton({ onClick }: FloatingChatButtonProps) {
  return (
    <button 
      onClick={onClick}
      className="floating-button bg-primary hover:bg-primary/90 text-primary-foreground w-16 h-16 rounded-full shadow-2xl flex items-center justify-center transition-all duration-200 hover:scale-110 fixed bottom-8 right-8 z-40"
      data-testid="floating-chat-button"
    >
      <i className="fas fa-comments text-xl"></i>
    </button>
  );
}
