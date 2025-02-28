// src/components/Chat/ChatMessage.jsx
import React from 'react';
import ReactMarkdown from 'react-markdown';

const ChatMessage = ({ message }) => {
  const { content, sender, isError } = message;
  
  const isBot = sender === 'bot';
  
  return (
    <div className={`flex ${isBot ? 'justify-start' : 'justify-end'}`}>
      <div 
        className={`max-w-[80%] p-3 rounded-lg ${
          isBot 
            ? isError 
              ? 'bg-red-100 text-red-800' 
              : 'bg-gray-100 text-gray-800' 
            : 'bg-blue-600 text-white'
        }`}
      >
        {isBot ? (
          <ReactMarkdown className="prose max-w-none">
            {content}
          </ReactMarkdown>
        ) : (
          <p>{content}</p>
        )}
      </div>
    </div>
  );
};

export default ChatMessage;