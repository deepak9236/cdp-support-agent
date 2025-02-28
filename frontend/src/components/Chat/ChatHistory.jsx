// src/components/Chat/ChatHistory.jsx
import React from 'react';

const ChatHistory = ({ sessions, currentSessionId, onSelectSession }) => {
  if (!sessions || sessions.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500">
        No previous chats found
      </div>
    );
  }

  return (
    <div className="overflow-y-auto">
      <h3 className="px-4 py-2 text-sm font-medium text-gray-500">Chat History</h3>
      <ul>
        {sessions.map((session) => (
          <li key={session._id}>
            <button
              onClick={() => onSelectSession(session._id)}
              className={`w-full text-left px-4 py-3 hover:bg-gray-100 ${
                session._id === currentSessionId ? 'bg-blue-50 border-l-4 border-blue-600' : ''
              }`}
            >
              <p className="text-sm font-medium truncate">
                {session.title || 'Untitled Chat'}
              </p>
              <p className="text-xs text-gray-500">
                {new Date(session.createdAt).toLocaleDateString()}
              </p>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ChatHistory;