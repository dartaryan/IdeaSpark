interface MessageBubbleProps {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: Date;
}

export function MessageBubble({ role, content, timestamp }: MessageBubbleProps) {
  const isUser = role === 'user';
  
  // Simple markdown-like formatting for AI messages
  const formatContent = (text: string) => {
    if (isUser) return text;
    
    // Convert **bold** to <strong> (non-greedy match)
    let formatted = text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    // Convert *italic* to <em> - only if not part of **
    formatted = formatted.replace(/(?<!\*)\*(?!\*)(.+?)\*(?!\*)/g, '<em>$1</em>');
    // Convert newlines to <br>
    formatted = formatted.replace(/\\n|\n/g, '<br />');
    
    return formatted;
  };

  return (
    <div className={`chat ${isUser ? 'chat-end' : 'chat-start'}`}>
      {timestamp && (
        <div className="chat-header text-xs opacity-50 mb-1">
          {timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      )}
      <div 
        className={`chat-bubble ${isUser ? 'chat-bubble-primary' : ''}`}
        dangerouslySetInnerHTML={{ __html: formatContent(content) }}
      />
    </div>
  );
}
