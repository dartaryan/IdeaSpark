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
 * Escapes literal newlines inside JSON string values using a state machine.
 * This handles the case where Gemini returns JSON with unescaped newlines in strings.
 */
function escapeNewlinesInJsonStrings(text: string): string {
  let result = '';
  let inString = false;
  let i = 0;
  
  while (i < text.length) {
    const char = text[i];
    
    if (inString) {
      if (char === '\\' && i + 1 < text.length) {
        // Escape sequence - copy both characters as-is
        result += char + text[i + 1];
        i += 2;
        continue;
      } else if (char === '"') {
        // End of string
        result += char;
        inString = false;
      } else if (char === '\n') {
        // Literal newline inside string - escape it
        result += '\\n';
      } else if (char === '\r') {
        // Literal carriage return inside string - escape it
        result += '\\r';
      } else {
        result += char;
      }
    } else {
      if (char === '"') {
        inString = true;
      }
      result += char;
    }
    i++;
  }
  
  return result;
}

/**
 * Extracts aiMessage from corrupted JSON using manual string parsing.
 * Fallback when JSON.parse fails completely.
 */
function extractAiMessageManually(text: string): string | null {
  // Find the start of aiMessage value
  const keyPattern = '"aiMessage"';
  const keyIndex = text.indexOf(keyPattern);
  if (keyIndex === -1) return null;
  
  // Find the colon and opening quote
  let i = keyIndex + keyPattern.length;
  while (i < text.length && (text[i] === ' ' || text[i] === ':' || text[i] === '\n' || text[i] === '\r')) {
    i++;
  }
  
  if (text[i] !== '"') return null;
  i++; // Skip opening quote
  
  // Extract the string value, handling escape sequences
  let value = '';
  while (i < text.length) {
    const char = text[i];
    
    if (char === '\\' && i + 1 < text.length) {
      // Handle escape sequence
      const nextChar = text[i + 1];
      if (nextChar === 'n') {
        value += '\n';
      } else if (nextChar === 'r') {
        value += '\r';
      } else if (nextChar === 't') {
        value += '\t';
      } else if (nextChar === '"') {
        value += '"';
      } else if (nextChar === '\\') {
        value += '\\';
      } else {
        value += nextChar;
      }
      i += 2;
      continue;
    } else if (char === '"') {
      // End of string - we found the complete value
      return value;
    } else {
      // Regular character (including literal newlines)
      value += char;
    }
    i++;
  }
  
  // If we got here, string wasn't properly closed, but return what we have
  return value.length > 0 ? value : null;
}

/**
 * Attempts to extract the message from corrupted JSON content
 * Returns the original text if extraction fails
 */
function extractMessageFromCorruptedContent(text: string): string {
  // First, try to fix newlines and parse as JSON
  try {
    const fixedText = escapeNewlinesInJsonStrings(text);
    const parsed = JSON.parse(fixedText);
    
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
    // JSON parsing still failed - try manual extraction
    const extracted = extractAiMessageManually(text);
    if (extracted) {
      return extracted;
    }
    
    // Check for error message pattern
    const errorKeyIndex = text.indexOf('"error"');
    if (errorKeyIndex !== -1) {
      const errorExtracted = text.substring(errorKeyIndex);
      const errorMatch = errorExtracted.match(/"error"\s*:\s*"([^"]*)"/);
      if (errorMatch && errorMatch[1]) {
        return `⚠️ Error: ${errorMatch[1]}`;
      }
    }
    
    // All extraction attempts failed - return original
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
