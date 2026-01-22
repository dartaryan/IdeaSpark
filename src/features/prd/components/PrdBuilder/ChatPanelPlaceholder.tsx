export function ChatPanelPlaceholder() {
  return (
    <div className="flex flex-col h-full">
      {/* Chat Header */}
      <div className="px-4 py-3 border-b border-base-200">
        <h2 className="font-semibold">AI Assistant</h2>
        <p className="text-sm text-base-content/60">Build your PRD through conversation</p>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* Welcome Message Placeholder */}
        <div className="chat chat-start">
          <div className="chat-bubble chat-bubble-primary">
            <p className="font-medium mb-2">Welcome! 👋</p>
            <p className="text-sm">
              I'm here to help you build a professional Product Requirements Document.
              Let's start by exploring your idea in more detail.
            </p>
            <p className="text-sm mt-2 text-primary-content/70">
              (Chat functionality coming in the next update)
            </p>
          </div>
        </div>
      </div>

      {/* Input Area (Disabled) */}
      <div className="p-4 border-t border-base-200">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Chat will be enabled soon..."
            className="input input-bordered flex-1"
            disabled
          />
          <button className="btn btn-primary" disabled>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
