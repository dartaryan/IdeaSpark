interface MessageBubbleProps {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: Date;
}

/**
 * Detects if content is corrupted JSON that should have been parsed
 * Returns true if content looks like a raw API response
 */
function isCorruptedContent(text: string): boolean {
  // Check if content starts with JSON object markers
  const trimmed = text.trim();
  if (!trimmed.startsWith('{') && !trimmed.startsWith('[')) {
    return false;
  }
  
  // Check for common edge function response patterns
  return (
    trimmed.includes('"aiMessage"') ||
    trimmed.includes('"sectionUpdates"') ||
    trimmed.includes('"error"') && trimmed.includes('"code"')
  );
}

/**
 * Attempts to extract the message from corrupted JSON content
 * Returns the original text if extraction fails
 */
function extractMessageFromCorruptedContent(text: string): string {
  try {
    const parsed = JSON.parse(text);
    
    // If this is an edge function response with aiMessage, extract it
    if (parsed.aiMessage && typeof parsed.aiMessage === 'string') {
      return parsed.aiMessage;
    }
    
    // If this is an error response, show user-friendly message
    if (parsed.error && typeof parsed.error === 'string') {
      return `⚠️ Error: ${parsed.error}`;
    }
    
    // Unknown JSON format - return original
    return text;
  } catch {
    // Not valid JSON - return original
    return text;
  }
}

export function MessageBubble({ role, content, timestamp }: MessageBubbleProps) {
  const isUser = role === 'user';
  
  // Defensive: Check for corrupted content and attempt to fix it
  let displayContent = content;
  if (!isUser && isCorruptedContent(content)) {
    console.warn('Detected corrupted message content, attempting to extract message:', content);
    displayContent = extractMessageFromCorruptedContent(content);
  }
  
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
        dangerouslySetInnerHTML={{ __html: formatContent(displayContent) }}
      />
    </div>
  );
}
