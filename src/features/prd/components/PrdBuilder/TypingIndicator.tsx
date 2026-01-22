export function TypingIndicator() {
  return (
    <div className="chat chat-start">
      <div className="chat-bubble flex items-center gap-1">
        <span className="loading loading-dots loading-sm" />
      </div>
    </div>
  );
}
